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

async function getNextDocId(branchId, shortCode, startTime, endTime) {
  let lastObject = await prisma.proformaInvoice.findFirst({
    where: {
      branchId: parseInt(branchId),
      AND: [{ createdAt: { gte: startTime } }, { createdAt: { lte: endTime } }],
    },
    orderBy: { id: "desc" },
  });

  const branchObj = await getTableRecordWithId(branchId, "branch");
  let newDocId = `${branchObj.branchCode}/${shortCode}/PI/FAB/1`;
  if (lastObject) {
    const parts = lastObject.docId.split("/");
    const lastNum = parseInt(parts.at(-1));
    if (!isNaN(lastNum)) {
      newDocId = `${branchObj.branchCode}/${shortCode}/PI/FAB/${lastNum + 1}`;
    }
  }
  return newDocId;
}

async function get(req) {
  const {
    branchId,
    pagination,
    pageNumber,
    dataPerPage,
    serachDocNo,
    searchDocDate,
    finYearId,
    searchCustomer,
    searchOrderNo,
  } = req.query;

  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime)
    : "";

  let data = await prisma.proformaInvoice.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      AND: finYearDate
        ? [
            { createdAt: { gte: finYearDate.startTime } },
            { createdAt: { lte: finYearDate.endTime } },
          ]
        : undefined,
      docId: serachDocNo ? { contains: serachDocNo } : undefined,
      customer: searchCustomer
        ? { name: { contains: searchCustomer } }
        : undefined,
    },
    include: {
      customer: { select: { id: true, name: true } },
      fabricItems: true,

      _count: {
        select: {
          orderEntries: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });

  if (searchDocDate) {
    data = data?.filter((item) =>
      String(getDateFromDateTime(item.docDate)).includes(searchDocDate),
    );
  }

  const totalCount = data.length;

  if (pagination) {
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * parseInt(dataPerPage),
    );
  }

  return {
    statusCode: 0,
    data: data?.map((item) => {
      const hasBulk = item.orderEntries?.some(
        (entry) => entry.productionType === "BULK",
      );
      return {
        ...item,
        childRecord: item?._count?.orderEntries || 0,
        hasBulk: hasBulk,
      };
    }),
    totalCount,
  };
}

async function getPIList(req) {
  const { branchId } = req.query;

  const data = await prisma.proformaInvoice.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
    },
    select: {
      id: true,
      customerId: true,
      docId: true,
      customer: {
        select: {
          id: true,
          name: true,
        },
      },

      orderEntries: {
        select: {
          id: true,
          productionType: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });

  return {
    statusCode: 0,
    data: data.map((item) => {
      const hasBulk = item.orderEntries?.some(
        (entry) => entry.productionType === "BULK",
      );

      return {
        ...item,
        hasBulk,
      };
    }),
  };
}

async function getOne(id) {
  const data = await prisma.proformaInvoice.findUnique({
    where: { id: parseInt(id) },
    include: {
      fabricItems: true,
      attachments: true,
      Branch: {
        include: {
          company: true,
        },
      },
      Bank: {
        include: {
          Branch: true,
        },
      },
      customer: true,
      _count: {
        select: {
          orderEntries: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("Proforma Invoice");
  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord: data?._count?.orderEntries || 0,
    },
  };
}

async function create(body) {
  const {
    userId,
    branchId,
    companyId,
    finYearId,
    docDate,
    userDate,
    customerId,
    customerPoNo,
    taxTemplateId,
    payTermId,
    currencyId,
    validityTo,
    loadingId,
    deliveryId,
    deliveryDate,
    carriageCharge,
    carriageTax,
    bankId,
    filteredItems,
    termsAndCondition,
    termsId,
    remarks,
    discountType,
    discountValue,
    attachments,
  } = body;

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
  );

  const data = await prisma.proformaInvoice.create({
    data: {
      docId: newDocId,
      docDate: docDate ? new Date(docDate) : null,
      userDate: userDate ? new Date(userDate) : null,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      createdById: parseInt(userId),
      branchId: parseInt(branchId),
      companyId: parseInt(companyId),
      customerId: customerId ? parseInt(customerId) : null,
      finYearId: parseInt(finYearId),
      taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,
      remarks,
      termsAndCondition,
      termsId: termsId ? parseInt(termsId) : null,
      discountType,
      discountValue: parseFloat(discountValue || 0),
      validityTo: validityTo ? new Date(validityTo) : null,
      currencyId: currencyId ? parseInt(currencyId) : null,
      loadingId: loadingId ? parseInt(loadingId) : null,
      deliveryId: deliveryId ? parseInt(deliveryId) : null,
      carriageCharge: carriageCharge ? parseFloat(carriageCharge) : null,
      bankId: bankId ? parseInt(bankId) : null,
      carriageTax: carriageTax ? parseFloat(carriageTax) : null,
      customerPoNo: customerPoNo,
      payTermId: payTermId ? parseInt(payTermId) : null,

      fabricItems: {
        create: filteredItems?.map((item) => ({
          fabricId: item.fabricId ? parseInt(item.fabricId) : null,
          hsnId: item.hsnId ? parseInt(item.hsnId) : null,
          colorId: item.colorId ? parseInt(item.colorId) : null,
          designId: item.designId ? parseInt(item.designId) : null,
          gaugeId: item.gaugeId ? parseInt(item.gaugeId) : null,
          loopLengthId: item.loopLengthId ? parseInt(item.loopLengthId) : null,
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
          pricePerKg: item.pricePerKg ? parseFloat(item.pricePerKg) : null,
          qty: parseFloat(item.qty || 0),
          price: parseFloat(item.price || 0),
          taxPercent: parseFloat(item.taxPercent || 0),
          discountType: item.discountType,
          discountValue: parseFloat(item.discountValue || 0),
        })),
      },
      attachments:
        attachments && JSON.parse(attachments)?.length > 0
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

  return { statusCode: 0, data };
}

async function update(id, body, files) {
  const {
    userId,
    branchId,
    docDate,
    userDate,
    customerId,
    deliveryDate,
    remarks,
    filteredItems,
    attachments,
    termsId,
    termsAndCondition,
    taxTemplateId,
    isApproved,
    discountType,
    discountValue,
    payTermId,
    validityTo,
    currencyId,
    loadingId,
    deliveryId,
    carriageCharge,
    bankId,
    carriageTax,
    customerPoNo,
  } = body;

  const parseAttachments = JSON.parse(attachments || "[]");
  const incomingAttachmentIds = parseAttachments
    ?.filter((i) => i.id)
    .map((i) => parseInt(i.id));

  const dataFound = await prisma.proformaInvoice.findUnique({
    where: { id: parseInt(id) },
    include: {
      attachments: true,
      fabricItems: true,
    },
  });

  if (!dataFound) return NoRecordFound("Proforma Invoice");

  // ── Fast path: approval-only toggle ─────────────────────────────────────
  // When only approvalStatus (or isApproved) is sent from the report page,
  // skip the full update to avoid overwriting all other fields with null.
  const approvalStatus = body.approvalStatus;

  const isApprovalOnlyUpdate =
    (approvalStatus !== undefined || isApproved !== undefined) &&
    !docDate &&
    !customerId &&
    !userId &&
    !filteredItems;

  if (isApprovalOnlyUpdate) {
    // Derive both fields from approvalStatus if provided, else from isApproved
    let newStatus = approvalStatus;
    let newIsApproved;
    if (approvalStatus) {
      newIsApproved = approvalStatus === "APPROVED";
    } else {
      newIsApproved = isApproved === "true" || isApproved === true;
      newStatus = newIsApproved ? "APPROVED" : "REVOKED";
    }
    const data = await prisma.proformaInvoice.update({
      where: { id: parseInt(id) },
      data: { isApproved: newIsApproved, approvalStatus: newStatus },
    });
    return { statusCode: 0, data };
  }
  // ────────────────────────────────────────────────────────────────────────

  // Handle file unlinking for removed attachments
  const removedAttachments = dataFound.attachments.filter(
    (existing) => !incomingAttachmentIds.includes(existing.id),
  );
  removedAttachments.forEach((att) => {
    if (att.filePath) {
      const fullPath = path.join("./uploads", att.filePath);
      fs.unlink(fullPath, (err) => {
        if (err)
          console.warn(`Could not delete file: ${fullPath}`, err.message);
      });
    }
  });

  const currentQuoteVersion = dataFound.quoteVersion || 1;
  const latestItems = dataFound.fabricItems.filter(
    (i) => i.quoteVersion === currentQuoteVersion,
  );

  let isTableChanged = false;
  if (filteredItems.length !== latestItems.length) {
    isTableChanged = true;
  } else {
    isTableChanged = filteredItems.some((newItem, index) => {
      // Assuming ordered arrays from the client match the order of latestItems, or we just compare element by element.
      // Since ProformaInvoiceForm sets/gets the entire array in order, index matching works fine.
      const oldItem = latestItems[index];
      if (!oldItem) return true;

      return (
        parseInt(newItem.fabricId || 0) !== parseInt(oldItem.fabricId || 0) ||
        parseInt(newItem.hsnId || 0) !== parseInt(oldItem.hsnId || 0) ||
        parseInt(newItem.colorId || 0) !== parseInt(oldItem.colorId || 0) ||
        parseInt(newItem.designId || 0) !== parseInt(oldItem.designId || 0) ||
        parseInt(newItem.gaugeId || 0) !== parseInt(oldItem.gaugeId || 0) ||
        parseInt(newItem.loopLengthId || 0) !==
          parseInt(oldItem.loopLengthId || 0) ||
        parseInt(newItem.gsmId || 0) !== parseInt(oldItem.gsmId || 0) ||
        parseInt(newItem.kDiaId || 0) !== parseInt(oldItem.kDiaId || 0) ||
        parseInt(newItem.fDiaId || 0) !== parseInt(oldItem.fDiaId || 0) ||
        parseInt(newItem.uomId || 0) !== parseInt(oldItem.uomId || 0) ||
        String(newItem.width || "") !== String(oldItem.width || "") ||
        parseFloat(newItem.numberOfRolls || 0) !==
          parseFloat(oldItem.numberOfRolls || 0) ||
        parseFloat(newItem.weightPerRoll || 0) !==
          parseFloat(oldItem.weightPerRoll || 0) ||
        parseFloat(newItem.pricePerKg || 0) !==
          parseFloat(oldItem.pricePerKg || 0) ||
        parseFloat(newItem.qty || 0) !== parseFloat(oldItem.qty || 0) ||
        parseFloat(newItem.price || 0) !== parseFloat(oldItem.price || 0) ||
        parseFloat(newItem.taxPercent || 0) !==
          parseFloat(oldItem.taxPercent || 0) ||
        (newItem.discountType || null) !== (oldItem.discountType || null) ||
        parseFloat(newItem.discountValue || 0) !==
          parseFloat(oldItem.discountValue || 0)
      );
    });
  }

  const nextQuoteVersion = isTableChanged
    ? currentQuoteVersion + 1
    : currentQuoteVersion;

  const data = await prisma.proformaInvoice.update({
    where: { id: parseInt(id) },
    data: {
      branchId: parseInt(branchId),
      docDate: docDate ? new Date(docDate) : null,
      userDate: userDate ? new Date(userDate) : null,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      updatedById: parseInt(userId),
      customerId: customerId ? parseInt(customerId) : null,
      remarks,
      termsAndCondition,
      termsId: termsId ? parseInt(termsId) : null,
      customerPoNo,
      discountType,
      discountValue: parseFloat(discountValue || 0),
      taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,
      validityTo: validityTo ? new Date(validityTo) : null,
      currencyId: currencyId ? parseInt(currencyId) : null,
      payTermId: payTermId ? parseInt(payTermId) : null,
      loadingId: loadingId ? parseInt(loadingId) : null,
      deliveryId: deliveryId ? parseInt(deliveryId) : null,
      carriageCharge: carriageCharge ? parseFloat(carriageCharge) : null,
      bankId: bankId ? parseInt(bankId) : null,
      quoteVersion: nextQuoteVersion,
      ...(isApproved !== undefined && {
        isApproved: isApproved === "true" || isApproved === true,
      }),
      carriageTax: carriageTax ? parseFloat(carriageTax) : null,
      payTermId: payTermId ? parseInt(payTermId) : null,

      fabricItems: isTableChanged
        ? {
            create: filteredItems.map((item) => ({
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
              pricePerKg: item.pricePerKg ? parseFloat(item.pricePerKg) : null,
              qty: parseFloat(item.qty || 0),
              price: parseFloat(item.price || 0),
              taxPercent: parseFloat(item.taxPercent || 0),
              discountType: item.discountType,
              discountValue: parseFloat(item.discountValue || 0),
              quoteVersion: nextQuoteVersion,
            })),
          }
        : undefined,

      attachments: {
        deleteMany: {
          ...(incomingAttachmentIds.length > 0 && {
            id: { notIn: incomingAttachmentIds },
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
                return matchedFile ? matchedFile.filename : sub.filePath;
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

  return { statusCode: 0, data };
}

async function remove(id) {
  const dataFound = await prisma.proformaInvoice.findUnique({
    where: { id: parseInt(id) },
    include: { attachments: true },
  });

  if (!dataFound) return NoRecordFound("Proforma Invoice");

  dataFound.attachments.forEach((att) => {
    if (att.filePath) {
      const fullPath = path.join("./uploads", att.filePath);
      fs.unlink(fullPath, (err) => {
        if (err) console.warn(`Could not delete: ${fullPath}`, err.message);
      });
    }
  });

  const data = await prisma.proformaInvoice.delete({
    where: { id: parseInt(id) },
  });

  return { statusCode: 0, data };
}

export { get, getOne, create, update, remove, getPIList };
