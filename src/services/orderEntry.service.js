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

const REFERENCE_PAGE = "ORDER ENTRY";

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
  } else if (isUpdate === "drift") {
    lastObject = await prisma.orderEntry.findFirst({
      where: {
        branchId: parseInt(branchId),
        draftSave: false,
        AND: [
          { createdAt: { gte: startTime } },
          { createdAt: { lte: endTime } },
        ],
      },
      orderBy: { id: "desc" },
    });
    const branchObj = await getTableRecordWithId(branchId, "branch");
    let newDocId = `${branchObj.branchCode}${getYearShortCode(
      new Date(),
    )}/ORD/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/ORD/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }

    return newDocId;
  } else {
    let lastObject = await prisma.orderEntry.findFirst({
      where: {
        branchId: parseInt(branchId),
        AND: [
          {
            createdAt: {
              gte: startTime,
            },
          },
          {
            createdAt: {
              lte: endTime,
            },
          },
        ],
      },
      orderBy: {
        id: "desc",
      },
    });

    const branchObj = await getTableRecordWithId(branchId, "branch");
    let newDocId = `${branchObj.branchCode}/${shortCode}/ORD/1`;
    if (lastObject) {
      if (lastObject.docId === "Draft Save") {
        const records = await prisma.orderEntry.findMany({
          select: {
            docId: true,
          },
          where: {
            branchId: parseInt(branchId),
            AND: [
              {
                createdAt: {
                  gte: startTime,
                },
              },
              {
                createdAt: {
                  lte: endTime,
                },
              },
            ],
          },
        });
        const maxDocId = records.reduce((max, current) => {
          const currentNo = Number(current.docId.split("/").pop());
          const maxNo = max ? Number(max.split("/").pop()) : 0;

          return currentNo > maxNo ? current.docId : max;
        }, null);
        newDocId = `${branchObj.branchCode}/${shortCode}/ORD/${
          parseInt(maxDocId.split("/").at(-1)) + 1
        }`;
      } else {
        newDocId = `${branchObj.branchCode}/${shortCode}/ORD/${
          parseInt(lastObject.docId.split("/").at(-1)) + 1
        }`;
      }
    }
    return newDocId;
  }
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
    isTakeOnlyFinshedJobCards,
    pendingSaleOrder,
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

  data = await prisma.orderEntry.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      isSaleOrderTaken: pendingSaleOrder && !id ? false : undefined,
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

  if (isTakeOnlyFinshedJobCards) {
    resolvedData = resolvedData.filter((order) => {
      if (!order.JobCard) return false;
      // Check if ANY job card has its LAST process route status as 'COMPLETED'
      return order.JobCard.some((jobCard) => {
        const route = jobCard.processRoute;
        if (!route || route.length === 0) return false;
        const lastProcess = route[route.length - 1];
        return lastProcess.status === "COMPLETED";
      });
    });
    totalCount = resolvedData.length;
  }

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
  const data = await prisma.orderEntry.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      attachments: true,

      Branch: {
        select: {
          branchName: true,
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
      ProformaFabric: {
        select: {
          id: true,
          docId: true,
        },
      },
      ProformaYarn: {
        select: {
          id: true,
          docId: true,
        },
      },
      orderYarnItems: true,
      orderFabricItems: {
        include: {
          fabricYarnDetails: {
            include: {
              yarnProcessDetails: {
                include: {
                  yarnProcessColors: true,
                },
              },
            },
          },
          fabricProcess: true,
        },
      },
      // _count: {
      //   select: {
      //     JobCard: true,
      //   },
      // },
    },
  });

  if (!data) return NoRecordFound("Order Entry");
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

const safeJsonParse = (val, fallback = []) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const mapFabricYarnDetails = (rawYarns) => {
  const yarns = safeJsonParse(rawYarns);
  return yarns
    .filter((yd) => yd && (yd.yarnId || yd.yarnId === 0))
    .map((yd) => {
      const processes = safeJsonParse(yd.yarnProcessDetails);
      const safeYarnProcessDetails = processes
        .filter((yp) => yp && (yp.processId || yp.processId === 0))
        .map((yp) => {
          const colors = safeJsonParse(yp.yarnProcessColors);
          const safeYarnProcessColors = colors
            .filter((yc) => yc && (yc.colorId || yc.colorId === 0))
            .map((yc) => ({
              rowId: yc.rowId ? String(yc.rowId) : null,
              colorId: yc.colorId ? parseInt(yc.colorId) : null,
              yarnProPercentage:
                yc.yarnProPercentage != null && yc.yarnProPercentage !== ""
                  ? parseFloat(yc.yarnProPercentage)
                  : null,
            }));

          return {
            rowId: yp.rowId ? String(yp.rowId) : null,
            processId: yp.processId ? parseInt(yp.processId) : null,
            colorId: yp.colorId ? parseInt(yp.colorId) : null,
            lossPercentage:
              yp.lossPercentage != null && yp.lossPercentage !== ""
                ? parseFloat(yp.lossPercentage)
                : null,
            dyeing: yp.dyeing || "No",
            yarnProcessColors:
              safeYarnProcessColors.length > 0
                ? {
                    create: safeYarnProcessColors,
                  }
                : undefined,
          };
        });

      return {
        rowId: yd.rowId ? String(yd.rowId) : null,
        yarnId: yd.yarnId ? parseInt(yd.yarnId) : null,
        colorId: yd.colorId ? parseInt(yd.colorId) : null,
        percentage:
          yd.percentage != null && yd.percentage !== ""
            ? parseFloat(yd.percentage)
            : null,
        yarnQty:
          yd.yarnQty != null && yd.yarnQty !== ""
            ? parseFloat(yd.yarnQty)
            : null,
        process: yd.process || "No",
        yarnProcessDetails:
          safeYarnProcessDetails.length > 0
            ? {
                create: safeYarnProcessDetails,
              }
            : undefined,
      };
    });
};

const mapFabricProcess = (rawProcesses) => {
  const processes = safeJsonParse(rawProcesses);
  return processes
    .filter((fp) => fp && (fp.processId || fp.processId === 0))
    .map((fp) => ({
      rowId: fp.rowId ? String(fp.rowId) : null,
      processId: fp.processId ? parseInt(fp.processId) : null,
      description: fp.description || null,
    }));
};

async function create(body) {
  const {
    userId,
    branchId,
    finYearId,
    companyId,
    docDate,
    customerId,
    orderType,
    orderGridType,
    proFormaFabricId,
    proFormaYarnId,
    taxTemplateId,
    payTermId,
    currencyId,
    loadingId,
    deliveryId,
    deliveryDate,
    carriageCharge,
    carriageTax,
    bankId,
    orderFabricItems,
    orderYarnItems,
    termsAndCondition,
    termsId,
    remarks,
    requirements,
    discountType,
    discountValue,
    attachments,
    draftSave,
    customerPoNo,
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

  const parsedFabricItems =
    typeof orderFabricItems === "string"
      ? JSON.parse(orderFabricItems)
      : orderFabricItems;
  const parsedyarnItems =
    typeof orderYarnItems === "string"
      ? JSON.parse(orderYarnItems)
      : orderYarnItems;

  const safeFabricItems =
    parsedFabricItems?.length > 0
      ? parsedFabricItems
          .filter((item) => item?.fabricId)
          .map((item) => {
            const safeFabricYarnDetails = mapFabricYarnDetails(
              item.fabricYarnDetails,
            );
            const safeFabricProcess = mapFabricProcess(item.fabricProcess);

            return {
              fabricId: item.fabricId ? parseInt(item.fabricId) : null,
              hsnId: item.hsnId ? parseInt(item.hsnId) : null,
              colorId: item.colorId ? parseInt(item.colorId) : null,
              designId: item.designId ? parseInt(item.designId) : null,
              gaugeId: item.gaugeId ? parseInt(item.gaugeId) : null,
              loopLengthId: item.loopLengthId
                ? parseInt(item.loopLengthId)
                : null,
              gsmId: item.gsmId ? parseInt(item.gsmId) : null,
              kDiaId: item.kDiaId ? parseInt(item.kDiaId) : null,
              fDiaId: item.fDiaId ? parseInt(item.fDiaId) : null,
              uomId: item.uomId ? parseInt(item.uomId) : null,
              width: item.width || null,
              numberOfRolls: item.numberOfRolls
                ? parseFloat(item.numberOfRolls)
                : null,
              weightPerRoll: item.weightPerRoll
                ? parseFloat(item.weightPerRoll)
                : null,
              totalKgs: item.totalKgs ? parseFloat(item.totalKgs) : null,
              pricePerKg: item.pricePerKg ? parseFloat(item.pricePerKg) : null,
              totalPrice: item.totalPrice ? parseFloat(item.totalPrice) : null,
              qty: parseFloat(item.qty || 0),
              wastePercentage:
                item.wastePercentage != null && item.wastePercentage !== ""
                  ? parseFloat(item.wastePercentage)
                  : null,
              requiredQty:
                item.requiredQty != null && item.requiredQty !== ""
                  ? parseFloat(item.requiredQty)
                  : null,
              price: parseFloat(item.price || 0),
              amount: item.amount ? parseFloat(item.amount) : null,
              taxPercent: parseFloat(item.taxPercent || 0),
              discountType: item.discountType || null,
              discountValue: parseFloat(item.discountValue || 0),
              fabricYarnDetails:
                safeFabricYarnDetails.length > 0
                  ? {
                      create: safeFabricYarnDetails,
                    }
                  : undefined,
              fabricProcess:
                safeFabricProcess.length > 0
                  ? {
                      create: safeFabricProcess,
                    }
                  : undefined,
            };
          })
      : [];

  const safeYarnItems =
    parsedyarnItems?.length > 0
      ? parsedyarnItems.map((item) => ({
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
        }))
      : [];

  await prisma.$transaction(async (tx) => {
    data = await tx.orderEntry.create({
      data: {
        docId: newDocId,
        docDate: docDate ? new Date(docDate) : null,
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        companyId: companyId ? parseInt(companyId) : null,
        finYearId: finYearId ? parseInt(finYearId) : null,
        customerId: customerId ? parseInt(customerId) : null,
        orderType,
        orderGridType,
        proFormaFabricId: proFormaFabricId ? parseInt(proFormaFabricId) : null,
        proFormaYarnId: proFormaYarnId ? parseInt(proFormaYarnId) : null,
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
        requirements,
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

        orderYarnItems:
          safeYarnItems.length > 0
            ? {
                create: safeYarnItems,
              }
            : undefined,
        orderFabricItems:
          safeFabricItems.length > 0
            ? {
                create: safeFabricItems,
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

      const fullRecord = await tx.orderEntry.findUnique({
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
    orderType,
    orderGridType,
    proFormaFabricId,
    proFormaYarnId,
    taxTemplateId,
    payTermId,
    currencyId,
    loadingId,
    deliveryId,
    deliveryDate,
    carriageCharge,
    carriageTax,
    bankId,
    orderFabricItems,
    orderYarnItems,
    termsAndCondition,
    termsId,
    remarks,
    requirements,
    discountType,
    discountValue,
    attachments,
    customerPoNo,
    submitApproval,
  } = await body;

  const parseAttachments =
    typeof attachments === "string"
      ? JSON.parse(attachments || "[]")
      : attachments || [];
  const incomingIds = parseAttachments
    ?.filter((i) => i.id)
    .map((i) => parseInt(i.id));

  const validFabricItems = (
    typeof orderFabricItems === "string"
      ? safeJsonParse(orderFabricItems)
      : orderFabricItems || []
  ).filter((i) => i && i.fabricId);
  const incomingFabricItemIds = validFabricItems
    ?.filter((i) => i.id)
    .map((i) => parseInt(i.id));

  const parsedYarnItems =
    typeof orderYarnItems === "string"
      ? JSON.parse(orderYarnItems || "[]")
      : orderYarnItems || [];
  const incomingYarnItemIds = parsedYarnItems
    ?.filter((i) => i.id)
    .map((i) => parseInt(i.id));

  const { module, hasApproval } = await getModuleApprovalSetup(
    REFERENCE_PAGE,
    branchId,
  );
  let data;
  const dataFound = await prisma.orderEntry.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      attachments: { select: { id: true, filePath: true } },
      orderFabricItems: true,
      orderYarnItems: true,
    },
  });
  if (!dataFound) return NoRecordFound("Order Entry");

  const removedFabricItemIds = (dataFound.orderFabricItems || [])
    .filter((item) => !incomingFabricItemIds.includes(item.id))
    .map((item) => item.id);
  const removedYarnItemIds = (dataFound.orderYarnItems || [])
    .filter((item) => !incomingYarnItemIds.includes(item.id))
    .map((item) => item.id);
  const allRemovedItemIds = [...removedFabricItemIds, ...removedYarnItemIds];

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

    data = await tx.orderEntry.update({
      where: {
        id: parseInt(id),
      },
      data: {
        updatedById: parseInt(userId),

        customerId: customerId ? parseInt(customerId) : null,
        orderType,
        orderGridType,
        proFormaFabricId: proFormaFabricId ? parseInt(proFormaFabricId) : null,
        proFormaYarnId: proFormaYarnId ? parseInt(proFormaYarnId) : null,
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
        requirements,

        orderFabricItems: {
          deleteMany: incomingFabricItemIds.length
            ? { id: { notIn: incomingFabricItemIds } }
            : {},
          update: validFabricItems
            .filter((item) => item.id)
            .map((item) => {
              const safeFabricYarnDetails = mapFabricYarnDetails(
                item.fabricYarnDetails,
              );
              const safeFabricProcess = mapFabricProcess(item.fabricProcess);

              return {
                where: { id: parseInt(item.id) },
                data: {
                  fabricId: item.fabricId ? parseInt(item.fabricId) : null,
                  hsnId: item.hsnId ? parseInt(item.hsnId) : null,
                  colorId: item.colorId ? parseInt(item.colorId) : null,
                  designId: item.designId ? parseInt(item.designId) : null,
                  gaugeId: item.gaugeId ? parseInt(item.gaugeId) : null,
                  loopLengthId: item.loopLengthId
                    ? parseInt(item.loopLengthId)
                    : null,
                  gsmId: item.gsmId ? parseInt(item.gsmId) : null,
                  kDiaId: item.kDiaId ? parseInt(item.kDiaId) : null,
                  fDiaId: item.fDiaId ? parseInt(item.fDiaId) : null,
                  uomId: item.uomId ? parseInt(item.uomId) : null,
                  width: item.width || null,
                  numberOfRolls: item.numberOfRolls
                    ? parseFloat(item.numberOfRolls)
                    : null,
                  weightPerRoll: item.weightPerRoll
                    ? parseFloat(item.weightPerRoll)
                    : null,
                  totalKgs: item.totalKgs ? parseFloat(item.totalKgs) : null,
                  pricePerKg: item.pricePerKg
                    ? parseFloat(item.pricePerKg)
                    : null,
                  totalPrice: item.totalPrice
                    ? parseFloat(item.totalPrice)
                    : null,
                  qty: parseFloat(item.qty || 0),
                  wastePercentage:
                    item.wastePercentage != null && item.wastePercentage !== ""
                      ? parseFloat(item.wastePercentage)
                      : null,
                  requiredQty:
                    item.requiredQty != null && item.requiredQty !== ""
                      ? parseFloat(item.requiredQty)
                      : null,
                  price: parseFloat(item.price || 0),
                  amount: item.amount ? parseFloat(item.amount) : null,
                  taxPercent: parseFloat(item.taxPercent || 0),
                  discountType: item.discountType || null,
                  discountValue: parseFloat(item.discountValue || 0),
                  fabricYarnDetails: {
                    deleteMany: {},
                    ...(safeFabricYarnDetails.length > 0 && {
                      create: safeFabricYarnDetails,
                    }),
                  },
                  fabricProcess: {
                    deleteMany: {},
                    ...(safeFabricProcess.length > 0 && {
                      create: safeFabricProcess,
                    }),
                  },
                },
              };
            }),
          create: validFabricItems
            .filter((item) => !item.id)
            .map((item) => {
              const safeFabricYarnDetails = mapFabricYarnDetails(
                item.fabricYarnDetails,
              );
              const safeFabricProcess = mapFabricProcess(item.fabricProcess);

              return {
                fabricId: item.fabricId ? parseInt(item.fabricId) : null,
                hsnId: item.hsnId ? parseInt(item.hsnId) : null,
                colorId: item.colorId ? parseInt(item.colorId) : null,
                designId: item.designId ? parseInt(item.designId) : null,
                gaugeId: item.gaugeId ? parseInt(item.gaugeId) : null,
                loopLengthId: item.loopLengthId
                  ? parseInt(item.loopLengthId)
                  : null,
                gsmId: item.gsmId ? parseInt(item.gsmId) : null,
                kDiaId: item.kDiaId ? parseInt(item.kDiaId) : null,
                fDiaId: item.fDiaId ? parseInt(item.fDiaId) : null,
                uomId: item.uomId ? parseInt(item.uomId) : null,
                width: item.width || null,
                numberOfRolls: item.numberOfRolls
                  ? parseFloat(item.numberOfRolls)
                  : null,
                weightPerRoll: item.weightPerRoll
                  ? parseFloat(item.weightPerRoll)
                  : null,
                totalKgs: item.totalKgs ? parseFloat(item.totalKgs) : null,
                pricePerKg: item.pricePerKg
                  ? parseFloat(item.pricePerKg)
                  : null,
                totalPrice: item.totalPrice
                  ? parseFloat(item.totalPrice)
                  : null,
                qty: parseFloat(item.qty || 0),
                wastePercentage:
                  item.wastePercentage != null && item.wastePercentage !== ""
                    ? parseFloat(item.wastePercentage)
                    : null,
                requiredQty:
                  item.requiredQty != null && item.requiredQty !== ""
                    ? parseFloat(item.requiredQty)
                    : null,
                price: parseFloat(item.price || 0),
                amount: item.amount ? parseFloat(item.amount) : null,
                taxPercent: parseFloat(item.taxPercent || 0),
                discountType: item.discountType || null,
                discountValue: parseFloat(item.discountValue || 0),
                fabricYarnDetails:
                  safeFabricYarnDetails.length > 0
                    ? {
                        create: safeFabricYarnDetails,
                      }
                    : undefined,
                fabricProcess:
                  safeFabricProcess.length > 0
                    ? {
                        create: safeFabricProcess,
                      }
                    : undefined,
              };
            }),
        },

        orderYarnItems: {
          deleteMany: incomingYarnItemIds.length
            ? { id: { notIn: incomingYarnItemIds } }
            : {},
          update: parsedYarnItems
            .filter((item) => item.id)
            .map((item) => ({
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
            })),
          create: parsedYarnItems
            .filter((item) => !item.id)
            .map((item) => ({
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
            })),
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

      const fullRecord = await tx.orderEntry.findUnique({
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
  const orderEntryId = parseInt(id);
  await prisma.approvalLog.deleteMany({
    where: { referencePage: REFERENCE_PAGE, referenceId: orderEntryId },
  });

  const dataFound = await prisma.orderEntry.findUnique({
    where: { id: orderEntryId },
    include: {
      attachments: { select: { filePath: true } },
      orderItems: { select: { id: true } },
      orderFabricItems: { select: { id: true } },
      orderYarnItems: { select: { id: true } },
    },
  });
  const allItemIds = [
    ...(dataFound?.orderItems || []),
    ...(dataFound?.orderFabricItems || []),
    ...(dataFound?.orderYarnItems || []),
  ];
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
  const data = await prisma.orderEntry.delete({
    where: {
      id: orderEntryId,
    },
  });

  return { statusCode: 0, data };
}

async function getOrderEntryReport(req) {
  let { branchId, page = 1, limit = 100 } = req.query;
  const whereClause = branchId ? { branchId: parseInt(branchId) } : {};

  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 100;
  const skip = (pageNumber - 1) * pageSize;

  const totalCount = await prisma.orderEntry.count({ where: whereClause });
  const totalPages = Math.ceil(totalCount / pageSize);

  const orderEntries = await prisma.orderEntry.findMany({
    where: whereClause,
    skip,
    take: pageSize,
    include: {
      customer: { select: { name: true } },
      Branch: { select: { branchName: true } },

      SalesOrder: {
        select: {
          docId: true,
          docDate: true,
          SalesOrderItems: {
            select: {
              styleItemId: true,
              StyleItem: { select: { name: true } },
            },
          },
          SalesDelivery: {
            select: {
              docId: true,
              docDate: true,
              salesDeliveryItems: {
                select: {
                  qty: true,
                  styleItemId: true,
                  StyleItem: { select: { name: true } },
                },
              },
            },
          },
        },
      },
      salesDeliveries: {
        select: {
          docId: true,
          docDate: true,
          salesDeliveryItems: {
            select: {
              qty: true,
              styleItemId: true,
              StyleItem: { select: { name: true } },
            },
          },
        },
      },
      Packing: {
        select: {
          docId: true,
          docDate: true,
          JobCard: { select: { docId: true } },
          PackingItems: {
            select: {
              styleItemId: true,
              StyleItem: { select: { name: true } },
            },
          },
        },
      },
      orderItems: {
        include: {
          StyleItem: { select: { name: true } },
          OrderStyleBreakup: {
            include: {
              Style: { select: { name: true } },
              OrderSizeBreakup: {
                include: {
                  Size: { select: { name: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    statusCode: 0,
    data: orderEntries,
    totalCount,
    totalPages,
    currentPage: pageNumber,
  };
}

export { get, getOne, create, update, remove, getOrderEntryReport };
