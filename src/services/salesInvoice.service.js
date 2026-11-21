import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from "../configs/Responses.js";
import {
  getYearShortCodeForFinYear,
  getYearShortCode,
  getDateFromDateTime,
  buildDateRange,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import fs from "fs";
import path from "path";
import {
  getModuleApprovalSetup,
  getApprovalStatus,
  evaluateConfigs,
  buildIncludeForModule,
  createApprovalLog,
} from "../utils/approvalHelper.js";

const REFERENCE_PAGE = "YARN SALES INVOICE";

async function getNextDocId(
  branchId,
  shortCode,
  startTime,
  endTime,
  saveType,
  docId,
  isUpdate,
) {
  // Case 1: Draft save
  if (saveType) {
    return "Draft Save";
  }

  // Guard: if branchId is not yet available, avoid Prisma query with NaN
  if (!branchId) {
    return "";
  }

  // Fetch branch to check isSalesInvoiceDiffer
  const branchObj = await getTableRecordWithId(branchId, "branch");
  const isSalesInvoiceDiffer = branchObj?.isSalesInvoiceDiffer ?? false;

  const dateFilter =
    startTime && endTime
      ? { AND: [{ createdAt: { gte: startTime } }, { createdAt: { lte: endTime } }] }
      : {};

  if (isSalesInvoiceDiffer) {
    // ── SEPARATE mode: Yarn uses Y-{N} (starts from Y-36) ──────────────────
    const records = await prisma.salesInvoice.findMany({
      select: { docId: true },
      where: { branchId: parseInt(branchId), ...dateFilter },
    });

    const YARN_START = 35; // floor 35 → first docId will be Y-36
    const maxNum = records.reduce((max, r) => {
      if (r.docId && r.docId.startsWith("Y-")) {
        const n = parseInt(r.docId.slice(2), 10);
        return !isNaN(n) && n > max ? n : max;
      }
      return max;
    }, YARN_START);

    return `Y-${maxNum + 1}`;
  }

  // ── SHARED mode: Yarn and Fabric share one counter, starts at 060 ─────────
  const [yarnRecords, fabricRecords] = await Promise.all([
    prisma.salesInvoice.findMany({
      select: { docId: true },
      where: { branchId: parseInt(branchId), ...dateFilter },
    }),
    prisma.fabricSalesInvoice.findMany({
      select: { docId: true },
      where: { branchId: parseInt(branchId), ...dateFilter },
    }),
  ]);

  const sharedMax = [...yarnRecords, ...fabricRecords].reduce((max, r) => {
    if (!r.docId || r.docId === "Draft Save") return max;
    // Shared docIds are purely numeric strings, e.g. "060", "061"
    if (/^\d+$/.test(r.docId)) {
      const n = parseInt(r.docId, 10);
      return !isNaN(n) && n > max ? n : max;
    }
    return max;
  }, 59); // floor 59 so first value is 60 → "060"

  return (sharedMax + 1).toString().padStart(3, "0");
}

async function get(req) {
  const {
    branchId,
    pagination,
    pageNumber,
    dataPerPage,
    serachDocNo,
    searchDocDate,
    searchOrderType,
    searchOrderGridType,
    orderGridType,
    finYearId,
    searchCustomer,

    id,
  } = req.query;

  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime)
    : "";
  let newDocId = await getNextDocId(
    branchId,
    shortCode,
    finYearDate?.startDateStartTime,
    finYearDate?.endDateEndTime,
  );
  let data;
  let totalCount;
  const gridTypeFilter = searchOrderGridType || orderGridType;

  data = await prisma.salesInvoice.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      AND: finYearDate
        ? [
            {
              createdAt: {
                gte: finYearDate.startTime,
              },
            },
            {
              createdAt: {
                lte: finYearDate.endTime,
              },
            },
          ]
        : undefined,
      docId: Boolean(serachDocNo)
        ? {
            contains: serachDocNo.trim(),
            mode: "insensitive",
          }
        : undefined,
      orderType: Boolean(searchOrderType)
        ? {
            contains: searchOrderType.trim(),
            mode: "insensitive",
          }
        : undefined,
      orderGridType: Boolean(gridTypeFilter)
        ? {
            contains: gridTypeFilter.trim(),
            mode: "insensitive",
          }
        : undefined,
      customer: Boolean(searchCustomer)
        ? {
            name: {
              contains: searchCustomer.trim(),
              mode: "insensitive",
            },
          }
        : undefined,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
        },
      },
      // _count: {
      //   select: {
      //     JobCard: true,
      //   },
      // },
    },
    orderBy: {
      id: "desc",
    },
  });
  if (searchDocDate) {
    const trimmedDate = searchDocDate.trim().toLowerCase();
    data = data?.filter((item) => {
      const docDateStr = item.docDate
        ? String(getDateFromDateTime(item.docDate)).toLowerCase()
        : "";
      const createdDateStr = item.createdAt
        ? String(getDateFromDateTime(item.createdAt)).toLowerCase()
        : "";
      return (
        docDateStr.includes(trimmedDate) || createdDateStr.includes(trimmedDate)
      );
    });
  }
  totalCount = data.length;

  // if (pagination) {
  //   data = data.slice(
  //     (pageNumber - 1) * parseInt(dataPerPage),
  //     pageNumber * dataPerPage,
  //   );
  // }

  // ── approval setup check ──────────────────────────────────────────────────
  const { module, hasApproval } = await getModuleApprovalSetup(
    REFERENCE_PAGE,
    branchId,
  );

  // ── fetch all relevant approval logs in one query ─────────────────────────
  const orderIds = data.map((o) => o.id);

  const approvalLogs = await prisma.approvalLog.findMany({
    where: { referencePage: REFERENCE_PAGE, referenceId: { in: orderIds } },
    select: {
      id: true,
      referenceId: true,
      status: true,
      remarks: true,
      currentLevel: true,
      LevelLogs: {
        select: {
          action: true,
          levelNo: true,
          userId: true,
          createdAt: true,
          User: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const approvalLogMap = approvalLogs.reduce((acc, log) => {
    acc[log.referenceId] = log;
    return acc;
  }, {});

  // ── fetch active configs only if approval is set up ───────────────────────
  const activeConfigs =
    hasApproval && module
      ? await prisma.approvalConfig.findMany({
          where: {
            moduleId: module.id,
            branchId: parseInt(branchId),
            active: true,
          },
          include: {
            ConfigConditions: {
              include: { Field: true, Operator: true, CompareField: true },
            },
            approvalLevels: {
              include: { LevelUsers: true },
              orderBy: { levelNo: "asc" },
            },
          },
        })
      : [];

  // ── resolve approval status per record ───────────────────────────────────
  let resolvedData = data.map((order) => {
    const log = approvalLogMap[order.id] ?? null;

    let shouldTrigger = false;
    if (!log && hasApproval && activeConfigs.length > 0) {
      shouldTrigger = evaluateConfigs(activeConfigs, order);
    }

    return {
      ...order,
      // childRecord: order._count.JobCard,
      approvalStatus: getApprovalStatus(log, !!log || shouldTrigger),
    };
  });

  if (pagination === "true" || pagination === true) {
    const page = parseInt(pageNumber, 10) || 1;
    const perPage = parseInt(dataPerPage, 10) || 15;
    resolvedData = resolvedData.slice((page - 1) * perPage, page * perPage);
  }

  return {
    statusCode: 0,
    data: resolvedData,
    nextDocId: newDocId,
    totalCount,
  };
}

async function getOne(id) {
  const data = await prisma.salesInvoice.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      attachments: true,
      Branch: {
        select: {
          branchName: true,
          address: true,
          gstNo: true,
          panNo: true,
          udyam: true,
          contactEmail: true,
          contactMobile: true,
          telephone: true,
        },
      },

      customer: {
        select: {
          name: true,
        },
      },
      Bank: {
        include: {
          Branch: true,
        },
      },

      salesYarnItems: true,
      // _count: {
      //   select: {
      //     JobCard: true,
      //   },
      // },
    },
  });

  if (!data) return NoRecordFound("Sales Invoice");
  const { module, hasApproval } = await getModuleApprovalSetup(
    REFERENCE_PAGE,
    data.branchId,
  );
  let log = null;
  let shouldTrigger = false;

  if (hasApproval && module) {
    // 🔹 get approval log for this record
    log = await prisma.approvalLog.findFirst({
      where: {
        referencePage: REFERENCE_PAGE,
        referenceId: data.id,
      },
      include: {
        LevelLogs: {
          include: {
            User: { select: { id: true, username: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // 🔹 if no log → check config condition
    if (!log) {
      const activeConfigs = await prisma.approvalConfig.findMany({
        where: {
          moduleId: module.id,
          branchId: parseInt(data.branchId),
          active: true,
        },
        include: {
          ConfigConditions: {
            include: {
              Field: true,
              Operator: true,
              CompareField: true,
            },
          },
        },
      });

      if (activeConfigs.length > 0) {
        shouldTrigger = evaluateConfigs(activeConfigs, data);
      }
    }
  }

  return {
    statusCode: 0,
    data: {
      ...data,

      approvalStatus: getApprovalStatus(log, !!log || shouldTrigger),
      // childRecord: data._count.JobCard,
      approvalLog: log,
    },
  };
}

async function create(body) {
  const {
    userId,
    branchId,
    finYearId,
    companyId,
    docDate,
    customerId,
    customerDeliveryId,
    vehicleNo,
    orderType,
    orderGridType,
    taxTemplateId,
    payTermId,
    currencyId,
    loadingId,
    deliveryId,
    deliveryDate,
    carriageCharge,
    carriageTax,
    bankId,
    salesFabricItems,
    salesYarnItems,
    termsAndCondition,
    termsId,
    remarks,
    discountType,
    discountValue,
    attachments,
    draftSave,
    customerPoNo,
    netTotalAmount,
  } = await body;
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(
        finYearDate?.startDateStartTime,
        finYearDate?.endDateEndTime,
      )
    : "";
  let newDocId = await getNextDocId(
    branchId,
    shortCode,
    finYearDate?.startDateStartTime,
    finYearDate?.endDateEndTime,
    draftSave,
  );
  // ✅ Single universal check OUTSIDE transaction — covers all 3 scenarios
  const { module, hasApproval } = await getModuleApprovalSetup(
    REFERENCE_PAGE,
    branchId,
  );
  let data;

  const parsedyarnItems =
    typeof salesYarnItems === "string"
      ? JSON.parse(salesYarnItems)
      : salesYarnItems;

  const safeYarnItems =
    parsedyarnItems?.length > 0
      ? parsedyarnItems.map((item) => {
          return {
            yarnId: item.yarnId ? parseInt(item.yarnId) : null,
            hsnId: item.hsnId ? parseInt(item.hsnId) : null,
            colorId: item.colorId ? parseInt(item.colorId) : null,
            uomId: item.uomId ? parseInt(item.uomId) : null,
            noOfbags: item.noOfbags ? parseInt(item.noOfbags) : null,
            weightPerBag: parseFloat(item.weightPerBag || 0),
            qty: parseFloat(item.qty || 0),
            price: parseFloat(item.price || 0),
            amount: item.amount ? parseFloat(item.amount) : null,
            taxPercent: parseFloat(item.taxPercent || 0),
            discountType: item.discountType,
            discountValue: parseFloat(item.discountValue || 0),
          };
        })
      : [];

  await prisma.$transaction(async (tx) => {
    data = await tx.salesInvoice.create({
      data: {
        docId: newDocId,
        docDate: docDate ? new Date(docDate) : null,
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        companyId: companyId ? parseInt(companyId) : null,
        finYearId: finYearId ? parseInt(finYearId) : null,
        customerId: customerId ? parseInt(customerId) : null,
        customerDeliveryId: customerDeliveryId ? parseInt(customerDeliveryId) : null,
        vehicleNo: vehicleNo || null,
        orderType,
        orderGridType,
        taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,
        discountType: discountType || null,
        discountValue: discountValue ? parseFloat(discountValue) : null,
        payTermId: payTermId ? parseInt(payTermId) : null,
        bankId: bankId ? parseInt(bankId) : null,
        currencyId: currencyId ? parseInt(currencyId) : null,
        loadingId: loadingId ? parseInt(loadingId) : null,
        deliveryId: deliveryId ? parseInt(deliveryId) : null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        carriageCharge: carriageCharge ? parseFloat(carriageCharge) : null,
        carriageTax: carriageTax ? parseFloat(carriageTax) : null,
        customerPoNo: customerPoNo || "",
        termsAndCondition,
        termsId: termsId ? parseInt(termsId) : null,
        remarks,
        termsId: termsId ? parseInt(termsId) : null,
        termsAndCondition,
        taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,
        discountType: discountType || null,
        discountValue: discountValue ? parseFloat(discountValue) : null,
        payTermId: payTermId ? parseInt(payTermId) : null,
        bankId: bankId ? parseInt(bankId) : null,
        currencyId: currencyId ? parseInt(currencyId) : null,
        carriageCharge: carriageCharge ? parseFloat(carriageCharge) : null,
        loadingId: loadingId ? parseInt(loadingId) : null,
        deliveryId: deliveryId ? parseInt(deliveryId) : null,
        carriageTax: carriageTax ? parseFloat(carriageTax) : null,
        netTotalAmount: netTotalAmount ? parseFloat(netTotalAmount) : null,
        salesYarnItems:
          safeYarnItems.length > 0
            ? {
                create: safeYarnItems,
              }
            : undefined,

        attachments:
          JSON.parse(attachments)?.length > 0
            ? {
                createMany: {
                  data: JSON.parse(attachments).map((sub) => ({
                    date: sub?.date ? new Date(sub?.date) : undefined,
                    filePath: sub?.filePath ? sub?.filePath : undefined,
                    name: sub?.name ? sub?.name : undefined,
                  })),
                },
              }
            : undefined,
      },
    });
    // ✅ Only runs if: module exists AND active config exists for this branch
    // If PO has no rules configured → hasApproval=false → skipped, form saves normally
    if (hasApproval && module) {
      // ✅ Dynamic include — pulls every relation any Field master references
      const includeClause = await buildIncludeForModule(module.id);

      const fullRecord = await tx.salesInvoice.findUnique({
        where: { id: data.id },
        include: includeClause,
      });

      await createApprovalLog(
        tx,
        branchId,
        module.id,
        data.id,
        REFERENCE_PAGE,
        fullRecord,
        data.docId,
        userId,
      );
    }
  });
  return { statusCode: 0, data };
}

async function update(id, body, files) {
  const {
    userId,
    branchId,
    customerId,
    customerDeliveryId,
    vehicleNo,
    orderType,
    orderGridType,
    taxTemplateId,
    payTermId,
    currencyId,
    loadingId,
    deliveryId,
    deliveryDate,
    carriageCharge,
    carriageTax,
    bankId,
    salesFabricItems,
    salesYarnItems,
    termsAndCondition,
    termsId,
    remarks,
    discountType,
    discountValue,
    attachments,
    customerPoNo,
    submitApproval,
    netTotalAmount,
  } = await body;

  const parseAttachments =
    typeof attachments === "string"
      ? JSON.parse(attachments || "[]")
      : attachments || [];
  const incomingIds = parseAttachments
    ?.filter((i) => i.id)
    .map((i) => parseInt(i.id));

  const parsedYarnItems =
    typeof salesYarnItems === "string"
      ? JSON.parse(salesYarnItems || "[]")
      : salesYarnItems || [];
  const incomingYarnItemIds = parsedYarnItems
    ?.filter((i) => i.id)
    .map((i) => parseInt(i.id));

  const { module, hasApproval } = await getModuleApprovalSetup(
    REFERENCE_PAGE,
    branchId,
  );
  let data;
  const dataFound = await prisma.salesInvoice.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      attachments: { select: { id: true, filePath: true } },
      salesYarnItems: true,
    },
  });
  if (!dataFound) return NoRecordFound("Sales Invoice");

  const removedYarnItemIds = (dataFound.salesYarnItems || [])
    .filter((item) => !incomingYarnItemIds.includes(item.id))
    .map((item) => item.id);
  const allRemovedItemIds = [...removedYarnItemIds];

  const removedAttachments = dataFound.attachments.filter(
    (existing) => !incomingIds.includes(existing.id),
  );
  const updatedAttachmentsWithNewFile = dataFound.attachments.filter(
    (existing) => {
      const incoming = parseAttachments.find(
        (i) => parseInt(i.id) === existing.id,
      );
      // If incoming filePath is empty/changed and old had a file
      return (
        incoming &&
        existing.filePath &&
        (!incoming.filePath || incoming.filePath !== existing.filePath)
      );
    },
  );

  // ✅ Unlink removed attachment files
  const unlinkFile = (filePath) => {
    if (!filePath) return;
    const fullPath = path.join("./uploads", filePath);
    fs.unlink(fullPath, (err) => {
      if (err) console.warn(`Could not delete file: ${fullPath}`, err.message);
      else console.log(`Deleted file: ${fullPath}`);
    });
  };

  // Delete files for removed attachments
  removedAttachments.forEach((att) => unlinkFile(att.filePath));

  // Delete old files for attachments where file was replaced
  updatedAttachmentsWithNewFile.forEach((att) => unlinkFile(att.filePath));

  await prisma.$transaction(async (tx) => {
    if (allRemovedItemIds.length > 0) {
      await tx.notification.deleteMany({
        where: {
          referencePage: REFERENCE_PAGE,
          referenceId: {
            in: allRemovedItemIds,
          },
        },
      });
    }

    data = await tx.salesInvoice.update({
      where: {
        id: parseInt(id),
      },
      data: {
        updatedById: parseInt(userId),
        customerId: customerId ? parseInt(customerId) : null,
        customerDeliveryId: customerDeliveryId ? parseInt(customerDeliveryId) : null,
        vehicleNo: vehicleNo || null,
        orderType,
        orderGridType,
        taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,
        discountType: discountType || null,
        discountValue: discountValue ? parseFloat(discountValue) : null,
        payTermId: payTermId ? parseInt(payTermId) : null,
        bankId: bankId ? parseInt(bankId) : null,
        currencyId: currencyId ? parseInt(currencyId) : null,
        loadingId: loadingId ? parseInt(loadingId) : null,
        deliveryId: deliveryId ? parseInt(deliveryId) : null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        carriageCharge: carriageCharge ? parseFloat(carriageCharge) : null,
        carriageTax: carriageTax ? parseFloat(carriageTax) : null,
        customerPoNo: customerPoNo || "",
        termsAndCondition,
        termsId: termsId ? parseInt(termsId) : null,
        remarks,
        netTotalAmount: netTotalAmount ? parseFloat(netTotalAmount) : null,

        salesYarnItems: {
          deleteMany: incomingYarnItemIds.length
            ? { id: { notIn: incomingYarnItemIds } }
            : {},
          update: parsedYarnItems
            .filter((item) => item.id)
            .map((item) => {
              return {
                where: { id: parseInt(item.id) },
                data: {
                  yarnId: item.yarnId ? parseInt(item.yarnId) : null,
                  hsnId: item.hsnId ? parseInt(item.hsnId) : null,
                  colorId: item.colorId ? parseInt(item.colorId) : null,
                  uomId: item.uomId ? parseInt(item.uomId) : null,
                  noOfbags: item.noOfbags ? parseInt(item.noOfbags) : null,
                  weightPerBag: parseFloat(item.weightPerBag || 0),
                  qty: parseFloat(item.qty || 0),
                  price: parseFloat(item.price || 0),
                  amount: item.amount ? parseFloat(item.amount) : null,
                  taxPercent: parseFloat(item.taxPercent || 0),
                  discountType: item.discountType || null,
                  discountValue: parseFloat(item.discountValue || 0),
                },
              };
            }),
          create: parsedYarnItems
            .filter((item) => !item.id)
            .map((item) => {
              return {
                yarnId: item.yarnId ? parseInt(item.yarnId) : null,
                hsnId: item.hsnId ? parseInt(item.hsnId) : null,
                colorId: item.colorId ? parseInt(item.colorId) : null,
                uomId: item.uomId ? parseInt(item.uomId) : null,
                noOfbags: item.noOfbags ? parseInt(item.noOfbags) : null,
                weightPerBag: parseFloat(item.weightPerBag || 0),
                qty: parseFloat(item.qty || 0),
                price: parseFloat(item.price || 0),
                amount: item.amount ? parseFloat(item.amount) : null,
                taxPercent: parseFloat(item.taxPercent || 0),
                discountType: item.discountType || null,
                discountValue: parseFloat(item.discountValue || 0),
              };
            }),
        },

        attachments: {
          deleteMany: {
            ...(incomingIds.length > 0 && {
              id: { notIn: incomingIds },
            }),
          },

          update: parseAttachments
            .filter((item) => item.id)
            .map((sub) => ({
              where: { id: parseInt(sub.id) },
              data: {
                date: sub?.date ? new Date(sub?.date) : undefined,
                filePath: (() => {
                  const matchedFile = files?.find(
                    (f) => f.originalname === sub.filePath,
                  );
                  return matchedFile
                    ? matchedFile.filename
                    : sub.filePath || undefined;
                })(),
                name: sub?.name ? sub?.name : undefined,
              },
            })),

          create: parseAttachments
            .filter((item) => !item.id)
            .map((sub) => ({
              date: sub?.date ? new Date(sub?.date) : undefined,
              filePath: (() => {
                const matchedFile = files?.find(
                  (f) => f.originalname === sub.filePath,
                );
                return matchedFile ? matchedFile.filename : sub.filePath;
              })(),
              name: sub?.name ? sub?.name : undefined,
            })),
        },
      },
    });
    if (submitApproval && hasApproval && module) {
      await tx.approvalLog.deleteMany({
        where: {
          referenceId: parseInt(id),
          referencePage: REFERENCE_PAGE,
          status: { in: ["REJECTED", "NOTAPPROVED"] },
        },
      });

      const fullRecord = await tx.salesInvoice.findUnique({
        where: { id: parseInt(id) },
        include: await buildIncludeForModule(module.id),
      });

      await createApprovalLog(
        tx,
        branchId,
        module.id,
        data.id,
        REFERENCE_PAGE,
        fullRecord,
        data.docId,
        userId,
      );
    }
  });

  return { statusCode: 0, data };
}

async function remove(id) {
  const salesInvoiceId = parseInt(id);
  await prisma.approvalLog.deleteMany({
    where: { referencePage: REFERENCE_PAGE, referenceId: salesInvoiceId },
  });

  const dataFound = await prisma.salesInvoice.findUnique({
    where: { id: salesInvoiceId },
    include: {
      attachments: { select: { filePath: true } },
      salesYarnItems: { select: { id: true } },
    },
  });
  const allItemIds = [...(dataFound?.salesYarnItems || [])];
  await Promise.all(
    allItemIds.map((item) =>
      prisma.notification.deleteMany({
        where: {
          referenceId: item.id,
          referencePage: REFERENCE_PAGE,
        },
      }),
    ),
  );

  dataFound?.attachments?.forEach((att) => {
    if (!att.filePath) return;
    const fullPath = path.join("./uploads", att.filePath);
    fs.unlink(fullPath, (err) => {
      if (err) console.warn(`Could not delete: ${fullPath}`, err.message);
    });
  });
  const data = await prisma.salesInvoice.delete({
    where: {
      id: salesInvoiceId,
    },
  });

  return { statusCode: 0, data };
}

export { get, getOne, create, update, remove };
