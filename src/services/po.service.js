import { prisma } from "../lib/prisma.js";
import moment from "moment";
import { NoRecordFound } from "../configs/Responses.js";
import {
  getDateFromDateTime,
  getDateTimeRange,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import {
  approveRecord,
  createApprovalLog,
  rejectRecord,
  evaluateConfigTrigger,
  getTriggeredConfig,
  getModuleApprovalSetup,
  applyOperator,
  buildIncludeForModule,
} from "../utils/approvalHelper.js";

const REFERENCE_PAGE = "PURCHASE ORDER";

// ── Doc ID ────────────────────────────────────────────────────────────────────
async function getNextDocId(branchId, shortCode, startTime, endTime) {
  let lastObject = await prisma.po.findFirst({
    where: {
      branchId: parseInt(branchId),
      AND: [{ createdAt: { gte: startTime } }, { createdAt: { lte: endTime } }],
    },
    orderBy: { id: "desc" },
  });
  const branchObj = await getTableRecordWithId(branchId, "branch");
  let newDocId = `${branchObj.branchCode}/${shortCode}/PO/1`;
  if (lastObject) {
    newDocId = `${branchObj.branchCode}/${shortCode}/PO/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`;
  }
  return newDocId;
}

// ── Filters ───────────────────────────────────────────────────────────────────
function manualFilterSearchData(
  searchPoDate,
  searchDueDate,
  searchPoType,
  searchGridType,
  data,
) {
  return data.filter(
    (item) =>
      (searchPoDate
        ? String(getDateFromDateTime(item.createdAt)).includes(searchPoDate)
        : true) &&
      (searchDueDate
        ? String(getDateFromDateTime(item.dueDate)).includes(searchDueDate)
        : true) &&
      (searchPoType
        ? item.poType.toLowerCase().includes(searchPoType.toLowerCase())
        : true) &&
      (searchGridType
        ? item.orderGridType
            .toLowerCase()
            .includes(searchGridType.toLowerCase())
        : true),
  );
}

function manualFilterSearchDataPoItems(
  searchDocDate,
  searchDueDate,
  poType,
  data,
) {
  const inwardTypeKey = poType ? poType.split(" ")[0].toUpperCase() : "";
  return data.filter(
    (item) =>
      (searchDocDate
        ? String(getDateFromDateTime(item.Po.docDate)).includes(searchDocDate)
        : true) &&
      (searchDueDate
        ? String(getDateFromDateTime(item.Po.dueDate)).includes(searchDueDate)
        : true) &&
      (inwardTypeKey ? item.Po.poType.toUpperCase() === inwardTypeKey : true),
  );
}

// ── PO Status ─────────────────────────────────────────────────────────────────
function getPOStatus(po) {
  const allItems = [
    ...(po.poItems || []),
    ...(po.poFabricItems || []),
    ...(po.poYarnItems || []),
  ];

  // Find the latest quote version to only sum active items
  let latestQuoteVersion = 1;
  if (allItems.length > 0) {
    const validVersions = allItems
      .filter((i) => i.quoteVersion && i.quoteVersion !== "New")
      .map((i) => Number(i.quoteVersion))
      .filter((n) => !isNaN(n) && n > 0);
    if (validVersions.length > 0) {
      latestQuoteVersion = Math.max(...validVersions);
    }
  }

  const activePoItems = allItems.filter(
    (i) => (Number(i.quoteVersion) || 1) === latestQuoteVersion,
  );

  const totalPoQty = activePoItems.reduce(
    (sum, item) => sum + (item.qty || 0),
    0,
  );
  const totalInwardQty =
    po.inwardItems?.reduce((sum, item) => sum + (item.inwardQty || 0), 0) || 0;
  const totalCancelQty =
    po.purchaseCancelItems?.reduce(
      (sum, item) => sum + (item.cancelQty || 0),
      0,
    ) || 0;
  const totalProcessedQty = totalInwardQty + totalCancelQty;

  if (totalInwardQty === 0 && totalCancelQty === 0) return "Pending";
  if (totalCancelQty >= totalPoQty) return "Cancelled";
  if (totalInwardQty >= totalPoQty) return "Fully Received";
  if (totalProcessedQty >= totalPoQty) return "Closed (Inward + Cancelled)";
  if (totalInwardQty > 0 && totalCancelQty > 0)
    return "Partially Received & Cancelled";
  if (totalInwardQty > 0) return "Partially Received";
  if (totalCancelQty > 0) return "Partially Cancelled";
  return "Pending";
}

// ── Approval Status ───────────────────────────────────────────────────────────

function getPOApprovalStatus(log, isApprovalConfigured = false) {
  if (!log) {
    return isApprovalConfigured
      ? {
          status: "NOTAPPROVED",
          label: "Not Approved",
          color: "orange",
          currentLevel: 1,
          levelLogs: [],
        }
      : {
          status: "NOT_CONFIGURED",
          label: "No Approval",
          color: "gray",
          currentLevel: null,
          levelLogs: [],
        };
  }
  const base = {
    currentLevel: log.currentLevel,
    levelLogs: log.LevelLogs ?? [],
    remarks: log.remarks,
  };
  const map = {
    APPROVED: {
      ...base,
      status: "APPROVED",
      label: "Approved",
      color: "green",
    },
    REJECTED: { ...base, status: "REJECTED", label: "Rejected", color: "red" },
    PENDING: { ...base, status: "PENDING", label: "Pending", color: "orange" },
    NOTAPPROVED: {
      ...base,
      status: "NOTAPPROVED",
      label: "Not Approved",
      color: "orange",
    },
    SUPERSEDED: {
      ...base,
      status: "SUPERSEDED",
      label: "Re-approval Needed",
      color: "yellow",
    }, // ✅ NEW
  };
  return (
    map[log.status] ?? {
      ...base,
      status: "UNKNOWN",
      label: "Unknown",
      color: "gray",
    }
  );
}

// ── In-memory config evaluator (avoids N DB calls in list) ────────────────────
function evaluateConfigs(activeConfigs, record) {
  if (!activeConfigs?.length) return false;

  // ✅ Only valid configs with levels + users, sorted by priority
  const valid = activeConfigs
    .filter(
      (c) =>
        c.approvalLevels?.length > 0 &&
        c.approvalLevels.some((l) => l.LevelUsers?.length > 0),
    )
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  // ✅ Use shared evaluator — same logic as getTriggeredConfig for consistency
  return valid.some((config) => evaluateConfigTrigger(config, record));
}

// ── GET LIST ──────────────────────────────────────────────────────────────────
async function get(req) {
  const {
    branchId,
    active,
    finYearId,
    searchPoType,
    searchGridType,
    searchDueDate,
    supplierId,
    startDate,
    endDate,
    filterParties,
    supplier,
    searchSupplierAliasName,
    serachDocNo,
    searchDate,
  } = req.query;

  const { startTime: startDateStartTime } = getDateTimeRange(startDate);
  const { endTime: endDateEndTime } = getDateTimeRange(endDate);
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(
        finYearDate?.startDateStartTime,
        finYearDate?.endDateEndTime,
      )
    : "";

  let data = await prisma.po.findMany({
    where: {
      AND: [
        {
          AND: finYearDate
            ? [
                {
                  createdAt: {
                    gte: finYearDate.startDateStartTime,
                  },
                },
                {
                  createdAt: {
                    lte: finYearDate.endDateEndTime,
                  },
                },
              ]
            : undefined,
        },
        {
          AND:
            startDate && endDate
              ? [
                  { createdAt: { gte: startDateStartTime } },
                  { createdAt: { lte: endDateEndTime } },
                ]
              : undefined,
        },
      ],
      branchId: branchId ? parseInt(branchId) : undefined,
      active: active ? Boolean(active) : undefined,
      docId: Boolean(serachDocNo) ? { contains: serachDocNo } : undefined,
      OR:
        supplierId || Boolean(filterParties)
          ? [
              { supplierId: supplierId ? parseInt(supplierId) : undefined },
              {
                supplierId: Boolean(filterParties)
                  ? { in: filterParties.split(",").map((i) => parseInt(i)) }
                  : undefined,
              },
            ]
          : undefined,
      Supplier: {
        aliasName: Boolean(searchSupplierAliasName)
          ? { contains: searchSupplierAliasName }
          : undefined,
        name: Boolean(supplier) ? { contains: supplier } : undefined,
      },
    },
    include: {
      Supplier: { select: { aliasName: true, name: true } },
      poItems: true,
      poFabricItems: true,
      poYarnItems: true,
      _count: { select: { inwardItems: true, purchaseCancelItems: true } },
      inwardItems: { select: { inwardQty: true } },
      purchaseCancelItems: { select: { cancelQty: true } },
    },
    orderBy: { id: "desc" },
  });

  data = manualFilterSearchData(
    searchDate,
    searchDueDate,
    searchPoType,
    searchGridType,
    data,
  );
  const poIds = data.map((po) => po.id);

  // ✅ Universal setup check — works whether PO has rules or not
  const { module, hasApproval } = await getModuleApprovalSetup(
    REFERENCE_PAGE,
    branchId,
  );

  const approvalLogs = await prisma.approvalLog.findMany({
    where: { referencePage: REFERENCE_PAGE, referenceId: { in: poIds } },
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

  // ✅ Only fetch configs if approval is set up for this form
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
          // orderBy: { priority: "asc" },
        })
      : [];

  const nextDocId = finYearDate
    ? await getNextDocId(
        branchId,
        shortCode,
        finYearDate?.startDateStartTime,
        finYearDate?.endDateEndTime,
      )
    : "";

  // purchaseOrder.service.js — FIX in get()
  const resolvedData = data.map((po) => {
    const log = approvalLogMap[po.id] ?? null;

    // ✅ PRIORITY: If log exists → use log.status (single source of truth)
    // Only evaluate configs if NO log exists yet (to decide if rule would trigger)
    let shouldTrigger = false;
    if (!log && hasApproval && activeConfigs.length > 0) {
      shouldTrigger = evaluateConfigs(activeConfigs, po);
    }

    return {
      ...po,
      status: getPOStatus(po),
      // If log exists → derive from log; otherwise from shouldTrigger
      approvalStatus: getPOApprovalStatus(log, !!log || shouldTrigger),
      childRecord: po._count.inwardItems + po._count.purchaseCancelItems,
    };
  });

  return {
    statusCode: 0,
    data: resolvedData,
    nextDocId,
    totalCount: data.length,
  };
}

// ── GET ONE ───────────────────────────────────────────────────────────────────
async function getOne(id) {
  let po = await prisma.po.findUnique({
    where: { id: parseInt(id) },
    include: {
      poItems: true,
      poFabricItems: true,
      poYarnItems: true,
      Supplier: {
        select: {
          aliasName: true,
          contactPersonName: true,
          gstNo: true,
          address: true,
          pincode: true,
          City: { select: { name: true } },
        },
      },
      DeliveryParty: {
        select: { name: true, address: true, contactPersonName: true },
      },
      DeliveryBranch: {
        select: { branchName: true, contactName: true, address: true },
      },
      OrderEntry: {
        select: {
          docId: true,
          id: true,
          orderGridType: true,
        },
      },
    },
  });
  if (!po) return NoRecordFound("po");

  po.poItems =
    po.poItems?.map((item) => {
      const qty = parseFloat(item.qty) || 0;
      const req = parseFloat(item?.RequirementPlanningItems?.requiredQty) || 0;
      return { ...item, balanceQty: Math.max(0, req - qty), requiredQty: req };
    }) || [];
  po.poFabricItems = po.poFabricItems || [];
  po.poYarnItems = po.poYarnItems || [];

  // ✅ Universal setup check
  const { hasApproval, module } = await getModuleApprovalSetup(
    REFERENCE_PAGE,
    po.branchId,
  );

  const [childRecordInward, childRecordCancel, approvalLog] = await Promise.all(
    [
      prisma.inwardItems.count({ where: { poId: po.id } }),
      prisma.purchaseCancelItems.count({ where: { poId: po.id } }),
      prisma.approvalLog.findFirst({
        where: {
          referenceId: parseInt(id),
          referencePage: "PURCHASE ORDER",
        },
        orderBy: {
          createdAt: "desc", // ✅ always latest
        },
        select: {
          id: true,
          status: true,
          currentLevel: true,
          remarks: true,
          ApprovalConfig: {
            select: {
              approvalLevels: {
                orderBy: { levelNo: "asc" },
                select: {
                  id: true,
                  levelNo: true,
                  approveType: true,
                  LevelUsers: {
                    select: {
                      userId: true,
                      User: { select: { id: true, username: true } },
                    },
                  },
                },
              },
            },
          },
          LevelLogs: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              levelNo: true,
              action: true,
              remarks: true,
              createdAt: true,
              User: { select: { id: true, username: true } },
            },
          },
        },
      }),
    ],
  );
  let isApprovalTriggered = false;
  if (!approvalLog && hasApproval && module) {
    const activeConfigs = await prisma.approvalConfig.findMany({
      where: { moduleId: module.id, branchId: po.branchId, active: true },
      include: {
        ConfigConditions: {
          include: { Field: true, Operator: true, CompareField: true },
        },
        approvalLevels: {
          include: { LevelUsers: true },
          orderBy: { levelNo: "asc" },
        },
      },
      orderBy: { priority: "asc" },
    });

    // ✅ Use the same evaluateConfigs logic as the list view
    isApprovalTriggered = activeConfigs
      .filter(
        (c) =>
          c.approvalLevels?.length > 0 &&
          c.approvalLevels.some((l) => l.LevelUsers?.length > 0),
      )
      .some((config) => evaluateConfigTrigger(config, po));
  }
  return {
    statusCode: 0,
    data: {
      ...po,
      childRecordInward,
      childRecordCancel,
      // ✅ isApprovalConfigured = hasApproval from universal check
      approvalStatus: getPOApprovalStatus(
        approvalLog,
        !!approvalLog || isApprovalTriggered,
      ),
      approvalLog: approvalLog ?? null,
    },
  };
}

async function getSearch(req) {
  const { active } = req.query;
  const { searchKey } = req.params;
  const data = await prisma.po.findMany({
    where: {
      active: active ? Boolean(active) : undefined,
      OR: [{ docId: { contains: searchKey } }],
    },
  });
  return { statusCode: 0, data };
}

export function getPoItemObject(poMaterial, item) {
  let newItem = {};
  if (poMaterial === "GreyYarn" || poMaterial === "DyedYarn") {
    newItem.yarnId = parseInt(item.yarnId);
    newItem.noOfBags = item.noOfBags ? parseInt(item.noOfBags) : null;
    newItem.weightPerBag = item.weightPerBag
      ? parseFloat(item.weightPerBag)
      : null;
    newItem.percentage = item.percentage ? parseFloat(item.percentage) : null;
    newItem.requiredQty = item.requiredQty
      ? parseFloat(item.requiredQty)
      : null;
    newItem.count = item.count ? parseInt(item.count) : null;
    newItem.hsnId = item.hsnId ? parseInt(item.hsnId) : null;
  } else if (poMaterial === "GreyFabric" || poMaterial === "DyedFabric") {
    newItem.fabricId = parseInt(item.fabricId);
    newItem.designId = parseInt(item.designId);
    newItem.gaugeId = parseInt(item.gaugeId);
    newItem.loopLengthId = parseInt(item.loopLengthId);
    newItem.gsmId = parseInt(item.gsmId);
    newItem.kDiaId = parseInt(item.kDiaId);
    newItem.fDiaId = parseInt(item.fDiaId);
  } else if (poMaterial === "Accessory") {
    newItem.accessoryId = parseInt(item.accessoryId);
    newItem.sizeId = item.sizeId ? parseInt(item.sizeId) : undefined;
    newItem.accessoryGroupId = parseInt(item.accessoryGroupId);
    newItem.accessoryItemId = parseInt(item.accessoryItemId);
  }
  newItem.requirementPlanningItemsId = item?.RequirementPlanningItemsId
    ? parseInt(item.RequirementPlanningItemsId)
    : undefined;
  newItem.orderId = item?.orderId ? parseInt(item.orderId) : undefined;
  newItem.orderDetailsId = item?.orderDetailsId
    ? parseInt(item.orderDetailsId)
    : undefined;
  newItem.uomId = item.uomId ? parseInt(item.uomId) : null;
  newItem.colorId = item.colorId ? parseInt(item.colorId) : undefined;
  newItem.qty = parseFloat(item.qty);
  newItem.price = parseFloat(item.price);
  newItem.discountType = item.discountType ?? null;
  newItem.discountValue = parseFloat(item.discountValue ?? 0);
  newItem.tax = parseFloat(item.tax ?? 0);
  newItem.taxPercent = parseFloat(item.taxPercent ?? 0);
  return newItem;
}

// ── CREATE ────────────────────────────────────────────────────────────────────
async function create(body) {
  try {
    const {
      userId,
      branchId,
      finYearId,
      docDate,
      dueDate,
      poType,
      taxTemplateId,
      deliveryType,
      deliveryToId,
      termsAndCondtion,
      remarks,
      supplierId,
      poItems = [],
      poFabricItems = [],
      poYarnItems = [],
      discountType,
      discountValue,
      taxPercent,
      termsId,
      payTermId,
      orderEntryId,
      orderGridType,
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
    );

    // ✅ Single universal check OUTSIDE transaction — covers all 3 scenarios
    const { module, hasApproval } = await getModuleApprovalSetup(
      REFERENCE_PAGE,
      branchId,
    );

    let data;
    await prisma.$transaction(async (tx) => {
      data = await tx.po.create({
        data: {
          docId: newDocId,
          docDate: docDate ? new Date(docDate) : null,
          dueDate: dueDate ? new Date(dueDate) : null,
          poType,
          branchId: parseInt(branchId),
          finYearId: finYearId ? parseInt(finYearId) : null,
          createdById: parseInt(userId),
          taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,
          orderEntryId: orderEntryId ? parseInt(orderEntryId) : null,

          deliveryType,
          deliveryBranchId:
            deliveryType === "ToSelf"
              ? deliveryToId
                ? parseInt(deliveryToId)
                : null
              : null,
          deliveryToId:
            deliveryType === "ToParty"
              ? deliveryToId
                ? parseInt(deliveryToId)
                : null
              : null,
          termsAndCondtion,
          remarks,
          supplierId: parseInt(supplierId),
          discountType,
          orderGridType: orderGridType || "GENERAL",
          discountValue:
            discountValue === "" || discountValue == null
              ? null
              : parseFloat(discountValue),
          taxPercent:
            taxPercent === "" || taxPercent == null
              ? null
              : parseFloat(taxPercent),
          quoteVersions: { create: { quoteVersion: 1 } },
          termsId: termsId ? parseInt(termsId) : null,
          payTermId: payTermId ? parseInt(payTermId) : null,
        },
      });

      if (poItems && Array.isArray(poItems) && poItems.length > 0) {
        await createPoItems(tx, poItems, data);
      }
      if (
        poFabricItems &&
        Array.isArray(poFabricItems) &&
        poFabricItems.length > 0
      ) {
        await createPoFabricItems(tx, poFabricItems, data);
      }
      if (poYarnItems && Array.isArray(poYarnItems) && poYarnItems.length > 0) {
        await createPoYarnItems(tx, poYarnItems, data);
      }

      // ✅ Only runs if: module exists AND active config exists for this branch
      // If PO has no rules configured → hasApproval=false → skipped, form saves normally
      if (hasApproval && module) {
        // ✅ Dynamic include — pulls every relation any Field master references
        const includeClause = await buildIncludeForModule(module.id);

        const fullRecord = await tx.po.findUnique({
          where: { id: data.id },
          include: {
            ...includeClause,
            poItems: true,
            poFabricItems: true,
            poYarnItems: true,
          },
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
  } catch (err) {
    return { statusCode: 400, message: err.message };
  }
}

async function createPoItems(tx, poItems, po) {
  if (!poItems || !Array.isArray(poItems) || poItems.length === 0) return [];
  const validItems = poItems.filter((i) => i && i.styleItemId);
  return Promise.all(
    validItems.map(async (itemDetails) => {
      const qty = itemDetails?.qty
        ? Math.round(parseFloat(itemDetails.qty))
        : null;
      return await tx.poItems.create({
        data: {
          poId: parseInt(po.id),
          styleItemId: itemDetails?.styleItemId
            ? parseInt(itemDetails.styleItemId)
            : null,
          uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
          hsnId: itemDetails?.hsnId ? parseInt(itemDetails.hsnId) : null,
          qty,
          price: itemDetails?.price ? parseFloat(itemDetails.price) : null,
          discountType: itemDetails?.discountType ?? undefined,
          discountValue: itemDetails?.discountValue
            ? parseFloat(itemDetails.discountValue)
            : null,
          taxPercent: itemDetails?.taxPercent
            ? parseFloat(itemDetails.taxPercent)
            : null,
          quoteVersion: itemDetails?.quoteVersion
            ? parseInt(itemDetails.quoteVersion)
            : 1,
          itemGroupId: itemDetails?.itemGroupId
            ? parseInt(itemDetails.itemGroupId)
            : null,
          sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
          colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
          gsmId: itemDetails?.gsmId ? parseInt(itemDetails.gsmId) : null,
          sheetsPerPacket: itemDetails?.sheetsPerPacket
            ? parseInt(itemDetails.sheetsPerPacket)
            : null,
          weightPerPacket: itemDetails?.weightPerPacket
            ? parseFloat(itemDetails.weightPerPacket)
            : null,
          totalPackets: itemDetails?.totalPackets
            ? parseInt(itemDetails.totalPackets)
            : null,
          pricePerKg: itemDetails?.pricePerKg
            ? parseInt(itemDetails.pricePerKg)
            : null,
        },
      });
    }),
  );
}

async function createPoFabricItems(tx, poFabricItems, po) {
  if (
    !poFabricItems ||
    !Array.isArray(poFabricItems) ||
    poFabricItems.length === 0
  )
    return [];
  const validItems = poFabricItems.filter((i) => i && i.fabricId);
  return Promise.all(
    validItems.map(async (itemDetails) => {
      return await tx.poFabricItems.create({
        data: {
          poId: parseInt(po.id),
          fabricId: itemDetails?.fabricId
            ? parseInt(itemDetails.fabricId)
            : null,
          hsnId: itemDetails?.hsnId ? parseInt(itemDetails.hsnId) : null,
          colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
          designId: itemDetails?.designId
            ? parseInt(itemDetails.designId)
            : null,
          gaugeId: itemDetails?.gaugeId ? parseInt(itemDetails.gaugeId) : null,
          loopLengthId: itemDetails?.loopLengthId
            ? parseInt(itemDetails.loopLengthId)
            : null,
          gsmId: itemDetails?.gsmId ? parseInt(itemDetails.gsmId) : null,
          kDiaId: itemDetails?.kDiaId ? parseInt(itemDetails.kDiaId) : null,
          fDiaId: itemDetails?.fDiaId ? parseInt(itemDetails.fDiaId) : null,
          uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
          width: itemDetails?.width ? String(itemDetails.width) : null,
          numberOfRolls:
            itemDetails?.numberOfRolls !== "" &&
            itemDetails?.numberOfRolls != null
              ? parseFloat(itemDetails.numberOfRolls)
              : null,
          weightPerRoll:
            itemDetails?.weightPerRoll !== "" &&
            itemDetails?.weightPerRoll != null
              ? parseFloat(itemDetails.weightPerRoll)
              : null,
          totalKgs:
            itemDetails?.totalKgs !== "" && itemDetails?.totalKgs != null
              ? parseFloat(itemDetails.totalKgs)
              : null,
          pricePerKg:
            itemDetails?.pricePerKg !== "" && itemDetails?.pricePerKg != null
              ? parseFloat(itemDetails.pricePerKg)
              : null,
          totalPrice:
            itemDetails?.totalPrice !== "" && itemDetails?.totalPrice != null
              ? parseFloat(itemDetails.totalPrice)
              : null,
          qty:
            itemDetails?.qty !== "" && itemDetails?.qty != null
              ? parseFloat(itemDetails.qty)
              : null,
          price:
            itemDetails?.price !== "" && itemDetails?.price != null
              ? parseFloat(itemDetails.price)
              : null,
          amount:
            itemDetails?.amount !== "" && itemDetails?.amount != null
              ? parseFloat(itemDetails.amount)
              : null,
          taxPercent:
            itemDetails?.taxPercent !== "" && itemDetails?.taxPercent != null
              ? parseFloat(itemDetails.taxPercent)
              : null,
          discountType:
            itemDetails?.discountType ?? itemDetails?.discounttype ?? null,
          discountValue:
            (itemDetails?.discountValue ?? itemDetails?.discountvalue) !== "" &&
            (itemDetails?.discountValue ?? itemDetails?.discountvalue) != null
              ? parseFloat(
                  itemDetails?.discountValue ?? itemDetails?.discountvalue,
                )
              : null,
          quoteVersion: itemDetails?.quoteVersion
            ? parseInt(itemDetails.quoteVersion)
            : 1,
        },
      });
    }),
  );
}

async function createPoYarnItems(tx, poYarnItems, po) {
  if (!poYarnItems || !Array.isArray(poYarnItems) || poYarnItems.length === 0)
    return [];
  const validItems = poYarnItems.filter((i) => i && i.yarnId);
  return Promise.all(
    validItems.map(async (itemDetails) => {
      const rawNoOfBags = itemDetails?.noOfbags ?? itemDetails?.noOfBags;
      return await tx.poYarnItems.create({
        data: {
          poId: parseInt(po.id),
          yarnId: itemDetails?.yarnId ? parseInt(itemDetails.yarnId) : null,
          hsnId: itemDetails?.hsnId ? parseInt(itemDetails.hsnId) : null,
          contentId: itemDetails?.contentId
            ? parseInt(itemDetails.contentId)
            : null,
          countsId: itemDetails?.countsId
            ? parseInt(itemDetails.countsId)
            : null,
          colorId: itemDetails?.colorId ? parseInt(itemDetails.colorId) : null,
          uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
          noOfbags:
            rawNoOfBags !== "" && rawNoOfBags != null
              ? parseInt(rawNoOfBags)
              : null,
          weightPerBag:
            itemDetails?.weightPerBag !== "" &&
            itemDetails?.weightPerBag != null
              ? parseFloat(itemDetails.weightPerBag)
              : null,
          qty:
            itemDetails?.qty !== "" && itemDetails?.qty != null
              ? parseFloat(itemDetails.qty)
              : null,
          price:
            itemDetails?.price !== "" && itemDetails?.price != null
              ? parseFloat(itemDetails.price)
              : null,
          amount:
            itemDetails?.amount !== "" && itemDetails?.amount != null
              ? parseFloat(itemDetails.amount)
              : null,
          taxPercent:
            itemDetails?.taxPercent !== "" && itemDetails?.taxPercent != null
              ? parseFloat(itemDetails.taxPercent)
              : null,
          discountType:
            itemDetails?.discountType ?? itemDetails?.discounttype ?? null,
          discountValue:
            (itemDetails?.discountValue ?? itemDetails?.discountvalue) !== "" &&
            (itemDetails?.discountValue ?? itemDetails?.discountvalue) != null
              ? parseFloat(
                  itemDetails?.discountValue ?? itemDetails?.discountvalue,
                )
              : null,
          quoteVersion: itemDetails?.quoteVersion
            ? parseInt(itemDetails.quoteVersion)
            : 1,
        },
      });
    }),
  );
}

function findRemovedItems(dataFound, poItems) {
  return dataFound.poItems.filter(
    (oldItem) =>
      !poItems.find((newItem) => parseInt(newItem.id) === parseInt(oldItem.id)),
  );
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
async function update(id, body) {
  let {
    userId,
    branchId,
    finYearId,
    docDate,
    dueDate,
    poType,
    taxTemplateId,
    deliveryType,
    deliveryToId,
    termsAndCondtion,
    remarks,
    supplierId,
    poItems = [],
    poFabricItems = [],
    poYarnItems = [],
    discountType,
    discountValue,
    taxPercent,
    termsId,
    payTermId,
    isNewVersion,
    quoteVersion,
    submitApproval,
    orderEntryId,
    orderGridType,
  } = await body;

  // ── Always get module setup first to know what fields to include ─────────────
  const { module, hasApproval } = await getModuleApprovalSetup(
    REFERENCE_PAGE,
    branchId,
  );

  const dynamicInclude =
    hasApproval && module ? await buildIncludeForModule(module.id) : {};

  const dataFound = await prisma.po.findUnique({
    where: { id: parseInt(id) },
    include: {
      ...dynamicInclude,
      poItems: true,
      poFabricItems: true,
      poYarnItems: true,
      quoteVersions: true,
      Supplier: true,
      Branch: true,
    },
  });
  if (!dataFound) return NoRecordFound("PO");

  const allCurrentItems = [
    ...(dataFound?.poItems || []),
    ...(dataFound?.poFabricItems || []),
    ...(dataFound?.poYarnItems || []),
  ];

  const currentQuoteVersion = Math.max(
    ...new Set(
      allCurrentItems
        .filter((i) => i.quoteVersion && i.quoteVersion !== "New")
        .map((i) => Number(i.quoteVersion)),
    ),
    1,
  );

  poItems = (poItems || []).filter((item) => {
    return (
      item.styleItemId &&
      (!item.quoteVersion ||
        item.quoteVersion === "New" ||
        parseInt(item.quoteVersion) === currentQuoteVersion)
    );
  });

  poFabricItems = (poFabricItems || []).filter((item) => {
    return (
      item.fabricId &&
      (!item.quoteVersion ||
        item.quoteVersion === "New" ||
        parseInt(item.quoteVersion) === currentQuoteVersion)
    );
  });

  poYarnItems = (poYarnItems || []).filter((item) => {
    return (
      item.yarnId &&
      (!item.quoteVersion ||
        item.quoteVersion === "New" ||
        parseInt(item.quoteVersion) === currentQuoteVersion)
    );
  });

  // ── Get latest approval log ───────────────────────────────────────────────
  const latestLog = await prisma.approvalLog.findFirst({
    where: { referenceId: parseInt(id), referencePage: REFERENCE_PAGE },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true },
  });

  // ✅ Block edits while PENDING
  if (latestLog?.status === "PENDING") {
    return {
      statusCode: 1,
      message: "This PO is pending approval and cannot be edited.",
    };
  }

  // ✅ NEW: Delivery Date Restriction (2-day threshold)
  if (dataFound.dueDate) {
    const daysToDelivery = moment(dataFound.dueDate).diff(
      moment(),
      "days",
      true,
    );
    if (daysToDelivery <= 2) {
      return {
        statusCode: 1,
        message:
          "This PO is fully locked. Edits are not allowed within 2 days of the delivery date.",
      };
    }
  }

  // ✅ NEW: Approved PO Locking (Core Fields vs Remarks)
  const isApproved = latestLog?.status === "APPROVED";
  let isRemarksOnlyUpdate = false;

  if (isApproved) {
    return {
      statusCode: 1,
      message: "This PO is Approved. Edits are not allowed.",
    };
  }

  const latestPoItems = (dataFound.poItems || [])
    .filter(
      (i) => i.quoteVersion && parseInt(i.quoteVersion) === currentQuoteVersion,
    )
    .sort((a, b) => (a.id || 0) - (b.id || 0));

  let isPoItemsChanged = false;
  if (poItems.length !== latestPoItems.length) {
    isPoItemsChanged = true;
  } else {
    isPoItemsChanged = poItems.some((newItem, index) => {
      const oldItem = latestPoItems[index];
      if (!oldItem) return true;

      const styleChanged =
        parseInt(newItem.styleItemId || 0) !==
        parseInt(oldItem.styleItemId || 0);
      const qtyChanged =
        parseFloat(newItem.qty || 0) !== parseFloat(oldItem.qty || 0);
      const priceChanged =
        parseFloat(newItem.price || 0) !== parseFloat(oldItem.price || 0);
      const taxChanged =
        parseFloat(newItem.taxPercent || 0) !==
        parseFloat(oldItem.taxPercent || 0);
      const discTypeChanged =
        (newItem.discountType || null) !== (oldItem.discountType || null);
      const discValChanged =
        parseFloat(newItem.discountValue || 0) !==
        parseFloat(oldItem.discountValue || 0);
      const uomChanged =
        parseInt(newItem.uomId || 0) !== parseInt(oldItem.uomId || 0);
      const hsnChanged =
        parseInt(newItem.hsnId || 0) !== parseInt(oldItem.hsnId || 0);
      const igChanged =
        parseInt(newItem.itemGroupId || 0) !==
        parseInt(oldItem.itemGroupId || 0);
      const sizeChanged =
        parseInt(newItem.sizeId || 0) !== parseInt(oldItem.sizeId || 0);
      const colorChanged =
        parseInt(newItem.colorId || 0) !== parseInt(oldItem.colorId || 0);
      const gsmChanged =
        parseInt(newItem.gsmId || 0) !== parseInt(oldItem.gsmId || 0);

      const sheetsPerPacket =
        parseInt(newItem.sheetsPerPacket || 0) !==
        parseInt(oldItem.sheetsPerPacket || 0);
      const weightPerPacket =
        parseFloat(newItem.weightPerPacket || 0) !==
        parseFloat(oldItem.weightPerPacket || 0);
      const totalPackets =
        parseInt(newItem.totalPackets || 0) !==
        parseInt(oldItem.totalPackets || 0);
      const pricePerKg =
        parseInt(newItem.pricePerKg || 0) !== parseInt(oldItem.pricePerKg || 0);

      return (
        styleChanged ||
        qtyChanged ||
        priceChanged ||
        taxChanged ||
        discTypeChanged ||
        discValChanged ||
        uomChanged ||
        hsnChanged ||
        igChanged ||
        sizeChanged ||
        colorChanged ||
        gsmChanged ||
        sheetsPerPacket ||
        weightPerPacket ||
        totalPackets ||
        pricePerKg
      );
    });
  }

  const latestFabricItems = (dataFound.poFabricItems || [])
    .filter(
      (i) => i.quoteVersion && parseInt(i.quoteVersion) === currentQuoteVersion,
    )
    .sort((a, b) => (a.id || 0) - (b.id || 0));

  let isFabricItemsChanged = false;
  if (poFabricItems.length !== latestFabricItems.length) {
    isFabricItemsChanged = true;
  } else {
    isFabricItemsChanged = poFabricItems.some((newItem, index) => {
      const oldItem = latestFabricItems[index];
      if (!oldItem) return true;

      const fabricChanged =
        parseInt(newItem.fabricId || 0) !== parseInt(oldItem.fabricId || 0);
      const hsnChanged =
        parseInt(newItem.hsnId || 0) !== parseInt(oldItem.hsnId || 0);
      const colorChanged =
        parseInt(newItem.colorId || 0) !== parseInt(oldItem.colorId || 0);
      const designChanged =
        parseInt(newItem.designId || 0) !== parseInt(oldItem.designId || 0);
      const gaugeChanged =
        parseInt(newItem.gaugeId || 0) !== parseInt(oldItem.gaugeId || 0);
      const loopLengthChanged =
        parseInt(newItem.loopLengthId || 0) !==
        parseInt(oldItem.loopLengthId || 0);
      const gsmChanged =
        parseInt(newItem.gsmId || 0) !== parseInt(oldItem.gsmId || 0);
      const kDiaChanged =
        parseInt(newItem.kDiaId || 0) !== parseInt(oldItem.kDiaId || 0);
      const fDiaChanged =
        parseInt(newItem.fDiaId || 0) !== parseInt(oldItem.fDiaId || 0);
      const uomChanged =
        parseInt(newItem.uomId || 0) !== parseInt(oldItem.uomId || 0);
      const widthChanged =
        String(newItem.width || "") !== String(oldItem.width || "");
      const numberOfRollsChanged =
        parseFloat(newItem.numberOfRolls || 0) !==
        parseFloat(oldItem.numberOfRolls || 0);
      const weightPerRollChanged =
        parseFloat(newItem.weightPerRoll || 0) !==
        parseFloat(oldItem.weightPerRoll || 0);
      const totalKgsChanged =
        parseFloat(newItem.totalKgs || 0) !== parseFloat(oldItem.totalKgs || 0);
      const pricePerKgChanged =
        parseFloat(newItem.pricePerKg || 0) !==
        parseFloat(oldItem.pricePerKg || 0);
      const totalPriceChanged =
        parseFloat(newItem.totalPrice || 0) !==
        parseFloat(oldItem.totalPrice || 0);
      const qtyChanged =
        parseFloat(newItem.qty || 0) !== parseFloat(oldItem.qty || 0);
      const priceChanged =
        parseFloat(newItem.price || 0) !== parseFloat(oldItem.price || 0);
      const amountChanged =
        parseFloat(newItem.amount || 0) !== parseFloat(oldItem.amount || 0);
      const taxChanged =
        parseFloat(newItem.taxPercent || 0) !==
        parseFloat(oldItem.taxPercent || 0);
      const discTypeChanged =
        (newItem.discountType ?? newItem.discounttype ?? null) !==
        (oldItem.discountType || null);
      const discValChanged =
        parseFloat(newItem.discountValue ?? newItem.discountvalue ?? 0) !==
        parseFloat(oldItem.discountValue || 0);

      return (
        fabricChanged ||
        hsnChanged ||
        colorChanged ||
        designChanged ||
        gaugeChanged ||
        loopLengthChanged ||
        gsmChanged ||
        kDiaChanged ||
        fDiaChanged ||
        uomChanged ||
        widthChanged ||
        numberOfRollsChanged ||
        weightPerRollChanged ||
        totalKgsChanged ||
        pricePerKgChanged ||
        totalPriceChanged ||
        qtyChanged ||
        priceChanged ||
        amountChanged ||
        taxChanged ||
        discTypeChanged ||
        discValChanged
      );
    });
  }

  const latestYarnItems = (dataFound.poYarnItems || [])
    .filter(
      (i) => i.quoteVersion && parseInt(i.quoteVersion) === currentQuoteVersion,
    )
    .sort((a, b) => (a.id || 0) - (b.id || 0));

  let isYarnItemsChanged = false;
  if (poYarnItems.length !== latestYarnItems.length) {
    isYarnItemsChanged = true;
  } else {
    isYarnItemsChanged = poYarnItems.some((newItem, index) => {
      const oldItem = latestYarnItems[index];
      if (!oldItem) return true;

      const yarnChanged =
        parseInt(newItem.yarnId || 0) !== parseInt(oldItem.yarnId || 0);
      const hsnChanged =
        parseInt(newItem.hsnId || 0) !== parseInt(oldItem.hsnId || 0);
      const contentChanged =
        parseInt(newItem.contentId || 0) !== parseInt(oldItem.contentId || 0);
      const countsChanged =
        parseInt(newItem.countsId || 0) !== parseInt(oldItem.countsId || 0);
      const colorChanged =
        parseInt(newItem.colorId || 0) !== parseInt(oldItem.colorId || 0);
      const uomChanged =
        parseInt(newItem.uomId || 0) !== parseInt(oldItem.uomId || 0);
      const noOfbagsChanged =
        parseInt(newItem.noOfbags ?? newItem.noOfBags ?? 0) !==
        parseInt(oldItem.noOfbags || 0);
      const weightPerBagChanged =
        parseFloat(newItem.weightPerBag || 0) !==
        parseFloat(oldItem.weightPerBag || 0);
      const qtyChanged =
        parseFloat(newItem.qty || 0) !== parseFloat(oldItem.qty || 0);
      const priceChanged =
        parseFloat(newItem.price || 0) !== parseFloat(oldItem.price || 0);
      const amountChanged =
        parseFloat(newItem.amount || 0) !== parseFloat(oldItem.amount || 0);
      const taxChanged =
        parseFloat(newItem.taxPercent || 0) !==
        parseFloat(oldItem.taxPercent || 0);
      const discTypeChanged =
        (newItem.discountType ?? newItem.discounttype ?? null) !==
        (oldItem.discountType || null);
      const discValChanged =
        parseFloat(newItem.discountValue ?? newItem.discountvalue ?? 0) !==
        parseFloat(oldItem.discountValue || 0);

      return (
        yarnChanged ||
        hsnChanged ||
        contentChanged ||
        countsChanged ||
        colorChanged ||
        uomChanged ||
        noOfbagsChanged ||
        weightPerBagChanged ||
        qtyChanged ||
        priceChanged ||
        amountChanged ||
        taxChanged ||
        discTypeChanged ||
        discValChanged
      );
    });
  }

  // Auto-detect version change
  let isTableChanged =
    isPoItemsChanged || isFabricItemsChanged || isYarnItemsChanged;
  isNewVersion = isTableChanged;
  console.log(isNewVersion, "isNewVersion", {
    isTableChanged,
    isPoItemsChanged,
    isFabricItemsChanged,
    isYarnItemsChanged,
  });

  const nextQuoteVersion = isNewVersion
    ? currentQuoteVersion + 1
    : parseInt(quoteVersion || currentQuoteVersion);

  // ── Determine what approval action to take ────────────────────────────────
  let needsFirstApproval = false;

  let data;
  await prisma.$transaction(async (tx) => {
    data = await tx.po.update({
      where: { id: parseInt(id) },
      data: {
        docDate: docDate ? new Date(docDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : null,
        branchId: branchId ? parseInt(branchId) : undefined,
        finYearId: finYearId ? parseInt(finYearId) : undefined,
        poType,
        taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,
        deliveryType,
        deliveryBranchId:
          deliveryType === "ToSelf"
            ? deliveryToId
              ? parseInt(deliveryToId)
              : null
            : null,
        deliveryToId:
          deliveryType === "ToParty"
            ? deliveryToId
              ? parseInt(deliveryToId)
              : null
            : null,
        termsAndCondtion,
        orderEntryId: orderEntryId ? parseInt(orderEntryId) : null,
        orderGridType: orderGridType || undefined,
        remarks,
        supplierId: supplierId ? parseInt(supplierId) : undefined,
        updatedById: userId ? parseInt(userId) : undefined,
        discountType,
        discountValue:
          discountValue === "" || discountValue == null
            ? null
            : parseFloat(discountValue),
        taxPercent:
          taxPercent === "" || taxPercent == null
            ? null
            : parseFloat(taxPercent),
        quoteVersion:
          isNewVersion && !isRemarksOnlyUpdate
            ? currentQuoteVersion + 1
            : parseInt(quoteVersion || currentQuoteVersion),
        quoteVersions:
          isNewVersion && !isRemarksOnlyUpdate
            ? { create: { quoteVersion: currentQuoteVersion + 1 } }
            : undefined,
        termsId: termsId ? parseInt(termsId) : null,
        payTermId: payTermId ? parseInt(payTermId) : null,
      },
    });

    if (isNewVersion && !isRemarksOnlyUpdate) {
      if (poItems && poItems.length > 0) {
        await createNewVersionItems(tx, poItems, data.id, nextQuoteVersion);
      }
      if (poFabricItems && poFabricItems.length > 0) {
        await createNewVersionFabricItems(
          tx,
          poFabricItems,
          data.id,
          nextQuoteVersion,
        );
      }
      if (poYarnItems && poYarnItems.length > 0) {
        await createNewVersionYarnItems(
          tx,
          poYarnItems,
          data.id,
          nextQuoteVersion,
        );
      }
    }

    // ✅ CASE 2: No log before OR was superseded → check if updated record matches config
    if (
      (!latestLog || latestLog?.status === "SUPERSEDED") &&
      hasApproval &&
      module
    ) {
      const includeClause = (await buildIncludeForModule(module.id)) || {};
      const fullRecord = await tx.po.findUnique({
        where: { id: parseInt(id) },
        include: {
          ...includeClause,
          poItems: true,
          poFabricItems: true,
          poYarnItems: true,
        },
      });

      // ✅ Re-check if this record now meets any approval criteria
      const triggeredConfig = await getTriggeredConfig(
        branchId,
        module.id,
        fullRecord,
        tx,
      );

      if (triggeredConfig) {
        console.log(
          `🔔 PO ${id} matches approval config "${triggeredConfig.name}" after update`,
        );
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
        needsFirstApproval = true; // Set flag for message
      }
    }

    // ✅ CASE 3: User explicitly resubmitting after REJECTED/NOTAPPROVED
    else if (submitApproval && hasApproval && module) {
      await tx.approvalLog.deleteMany({
        where: {
          referenceId: parseInt(id),
          referencePage: REFERENCE_PAGE,
          status: { in: ["REJECTED", "NOTAPPROVED"] },
        },
      });

      const includeClause = (await buildIncludeForModule(module.id)) || {};
      const fullRecord = await tx.po.findUnique({
        where: { id: parseInt(id) },
        include: {
          ...includeClause,
          poItems: true,
          poFabricItems: true,
          poYarnItems: true,
        },
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

    // ✅ CASE 4: APPROVED + no relevant changes → silent edit, approval stays intact
  });

  const message = needsFirstApproval
    ? "PO updated and submitted for approval — this PO now meets approval criteria."
    : submitApproval
      ? "PO updated and submitted for approval."
      : "PO updated successfully.";

  return { statusCode: 0, data, message };
}

async function updatePoItems(
  tx,
  poItems,
  po,
  quoteVersion,
  currentQuoteVersion,
  isNewVersion,
) {
  return Promise.all(
    poItems.map(async (itemDetails) => {
      const qty = itemDetails?.qty
        ? Math.round(parseFloat(itemDetails.qty))
        : null;
      if (itemDetails.id) {
        return await tx.poItems.update({
          where: { id: parseInt(itemDetails.id) },
          data: {
            poId: parseInt(po.id),
            styleItemId: itemDetails?.styleItemId
              ? parseInt(itemDetails.styleItemId)
              : null,
            uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
            hsnId: itemDetails?.hsnId ? parseInt(itemDetails.hsnId) : null,
            qty,
            price: itemDetails?.price ? parseFloat(itemDetails.price) : null,
            discountType: itemDetails?.discountType ?? undefined,
            discountValue: itemDetails?.discountValue
              ? parseFloat(itemDetails.discountValue)
              : null,
            taxPercent: itemDetails?.taxPercent
              ? parseFloat(itemDetails.taxPercent)
              : null,
            itemGroupId: itemDetails?.itemGroupId
              ? parseInt(itemDetails.itemGroupId)
              : null,
            sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
            colorId: itemDetails?.colorId
              ? parseInt(itemDetails.colorId)
              : null,
            gsmId: itemDetails?.gsmId ? parseInt(itemDetails.gsmId) : null,
            sheetsPerPacket: itemDetails?.sheetsPerPacket
              ? parseInt(itemDetails.sheetsPerPacket)
              : null,
            weightPerPacket: itemDetails?.weightPerPacket
              ? parseFloat(itemDetails.weightPerPacket)
              : null,
            totalPackets: itemDetails?.totalPackets
              ? parseInt(itemDetails.totalPackets)
              : null,
            pricePerKg: itemDetails?.pricePerKg
              ? parseInt(itemDetails.pricePerKg)
              : null,
            quoteVersion: isNewVersion
              ? currentQuoteVersion + 1
              : parseInt(quoteVersion),
          },
        });
      } else {
        return await tx.poItems.create({
          data: {
            poId: parseInt(po.id),
            styleItemId: itemDetails?.styleItemId
              ? parseInt(itemDetails.styleItemId)
              : null,
            uomId: itemDetails?.uomId ? parseInt(itemDetails.uomId) : null,
            hsnId: itemDetails?.hsnId ? parseInt(itemDetails.hsnId) : null,
            qty,
            price: itemDetails?.price ? parseFloat(itemDetails.price) : null,
            discountType: itemDetails?.discountType ?? undefined,
            discountValue: itemDetails?.discountValue
              ? parseFloat(itemDetails.discountValue)
              : null,
            taxPercent: itemDetails?.taxPercent
              ? parseFloat(itemDetails.taxPercent)
              : null,
            quoteVersion: isNewVersion
              ? currentQuoteVersion + 1
              : parseInt(quoteVersion),
            itemGroupId: itemDetails?.itemGroupId
              ? parseInt(itemDetails.itemGroupId)
              : null,
            sizeId: itemDetails?.sizeId ? parseInt(itemDetails.sizeId) : null,
            colorId: itemDetails?.colorId
              ? parseInt(itemDetails.colorId)
              : null,
            gsmId: itemDetails?.gsmId ? parseInt(itemDetails.gsmId) : null,
            sheetsPerPacket: itemDetails?.sheetsPerPacket
              ? parseInt(itemDetails.sheetsPerPacket)
              : null,
            weightPerPacket: itemDetails?.weightPerPacket
              ? parseFloat(itemDetails.weightPerPacket)
              : null,
            totalPackets: itemDetails?.totalPackets
              ? parseInt(itemDetails.totalPackets)
              : null,
            pricePerKg: itemDetails?.pricePerKg
              ? parseInt(itemDetails.pricePerKg)
              : null,
          },
        });
      }
    }),
  );
}

async function createNewVersionItems(tx, poItems, poId, version) {
  const validItems = (poItems || []).filter((i) => i && i.styleItemId);
  if (!validItems.length) return;
  return await tx.poItems.createMany({
    data: validItems.map((temp) => ({
      poId,
      styleItemId: temp.styleItemId ? parseInt(temp.styleItemId) : null,
      uomId: temp.uomId ? parseInt(temp.uomId) : null,
      hsnId: temp.hsnId ? parseInt(temp.hsnId) : null,
      qty: temp.qty != null && temp.qty !== "" ? parseFloat(temp.qty) : null,
      price:
        temp.price != null && temp.price !== "" ? parseFloat(temp.price) : null,
      discountType: temp.discountType ?? undefined,
      discountValue:
        temp.discountValue != null && temp.discountValue !== ""
          ? parseFloat(temp.discountValue)
          : null,
      taxPercent:
        temp.taxPercent != null && temp.taxPercent !== ""
          ? parseFloat(temp.taxPercent)
          : null,
      quoteVersion: version,
      itemGroupId: temp.itemGroupId ? parseInt(temp.itemGroupId) : null,
      sizeId: temp.sizeId ? parseInt(temp.sizeId) : null,
      colorId: temp.colorId ? parseInt(temp.colorId) : null,
      gsmId: temp.gsmId ? parseInt(temp.gsmId) : null,
      sheetsPerPacket: temp.sheetsPerPacket
        ? parseInt(temp.sheetsPerPacket)
        : null,
      weightPerPacket: temp.weightPerPacket
        ? parseFloat(temp.weightPerPacket)
        : null,
      totalPackets: temp.totalPackets ? parseInt(temp.totalPackets) : null,
      pricePerKg: temp.pricePerKg ? parseInt(temp.pricePerKg) : null,
    })),
  });
}

async function createNewVersionFabricItems(tx, poFabricItems, poId, version) {
  const validItems = (poFabricItems || []).filter((i) => i && i.fabricId);
  if (!validItems.length) return;
  return await tx.poFabricItems.createMany({
    data: validItems.map((temp) => ({
      poId,
      fabricId: temp.fabricId ? parseInt(temp.fabricId) : null,
      hsnId: temp.hsnId ? parseInt(temp.hsnId) : null,
      colorId: temp.colorId ? parseInt(temp.colorId) : null,
      designId: temp.designId ? parseInt(temp.designId) : null,
      gaugeId: temp.gaugeId ? parseInt(temp.gaugeId) : null,
      loopLengthId: temp.loopLengthId ? parseInt(temp.loopLengthId) : null,
      gsmId: temp.gsmId ? parseInt(temp.gsmId) : null,
      kDiaId: temp.kDiaId ? parseInt(temp.kDiaId) : null,
      fDiaId: temp.fDiaId ? parseInt(temp.fDiaId) : null,
      uomId: temp.uomId ? parseInt(temp.uomId) : null,
      width: temp.width ? String(temp.width) : null,
      numberOfRolls:
        temp.numberOfRolls !== "" && temp.numberOfRolls != null
          ? parseFloat(temp.numberOfRolls)
          : null,
      weightPerRoll:
        temp.weightPerRoll !== "" && temp.weightPerRoll != null
          ? parseFloat(temp.weightPerRoll)
          : null,
      totalKgs:
        temp.totalKgs !== "" && temp.totalKgs != null
          ? parseFloat(temp.totalKgs)
          : null,
      pricePerKg:
        temp.pricePerKg !== "" && temp.pricePerKg != null
          ? parseFloat(temp.pricePerKg)
          : null,
      totalPrice:
        temp.totalPrice !== "" && temp.totalPrice != null
          ? parseFloat(temp.totalPrice)
          : null,
      qty: temp.qty !== "" && temp.qty != null ? parseFloat(temp.qty) : null,
      price:
        temp.price !== "" && temp.price != null ? parseFloat(temp.price) : null,
      amount:
        temp.amount !== "" && temp.amount != null
          ? parseFloat(temp.amount)
          : null,
      taxPercent:
        temp.taxPercent !== "" && temp.taxPercent != null
          ? parseFloat(temp.taxPercent)
          : null,
      discountType: temp.discountType ?? temp.discounttype ?? null,
      discountValue:
        (temp.discountValue ?? temp.discountvalue) !== "" &&
        (temp.discountValue ?? temp.discountvalue) != null
          ? parseFloat(temp.discountValue ?? temp.discountvalue)
          : null,
      quoteVersion: version,
    })),
  });
}

async function createNewVersionYarnItems(tx, poYarnItems, poId, version) {
  const validItems = (poYarnItems || []).filter((i) => i && i.yarnId);
  if (!validItems.length) return;
  return await tx.poYarnItems.createMany({
    data: validItems.map((temp) => {
      const rawNoOfBags = temp.noOfbags ?? temp.noOfBags;
      return {
        poId,
        yarnId: temp.yarnId ? parseInt(temp.yarnId) : null,
        hsnId: temp.hsnId ? parseInt(temp.hsnId) : null,
        contentId: temp.contentId ? parseInt(temp.contentId) : null,
        countsId: temp.countsId ? parseInt(temp.countsId) : null,
        colorId: temp.colorId ? parseInt(temp.colorId) : null,
        uomId: temp.uomId ? parseInt(temp.uomId) : null,
        noOfbags:
          rawNoOfBags !== "" && rawNoOfBags != null
            ? parseInt(rawNoOfBags)
            : null,
        weightPerBag:
          temp.weightPerBag !== "" && temp.weightPerBag != null
            ? parseFloat(temp.weightPerBag)
            : null,
        qty: temp.qty !== "" && temp.qty != null ? parseFloat(temp.qty) : null,
        price:
          temp.price !== "" && temp.price != null
            ? parseFloat(temp.price)
            : null,
        amount:
          temp.amount !== "" && temp.amount != null
            ? parseFloat(temp.amount)
            : null,
        taxPercent:
          temp.taxPercent !== "" && temp.taxPercent != null
            ? parseFloat(temp.taxPercent)
            : null,
        discountType: temp.discountType ?? temp.discounttype ?? null,
        discountValue:
          (temp.discountValue ?? temp.discountvalue) !== "" &&
          (temp.discountValue ?? temp.discountvalue) != null
            ? parseFloat(temp.discountValue ?? temp.discountvalue)
            : null,
        quoteVersion: version,
      };
    }),
  });
}

// ── REMOVE ────────────────────────────────────────────────────────────────────
async function remove(id) {
  const poId = parseInt(id);
  return await prisma.$transaction(async (tx) => {
    // Safe even if no approval logs exist
    await tx.approvalLog.deleteMany({
      where: { referencePage: REFERENCE_PAGE, referenceId: poId },
    });
    const data = await tx.po.delete({ where: { id: poId } });
    return { statusCode: 0, data };
  });
}

// ── GET PO ITEMS (for inward selection) ───────────────────────────────────────
async function getAllDataPoItems(data) {
  const results = await Promise.all(
    data?.map(async (item) => {
      const res = await getPoItemById(item.id);
      return res.data;
    }),
  );
  const maxVersionByPo = {};
  for (const item of results) {
    const poId = item.poId;
    if (!maxVersionByPo[poId] || item.quoteVersion > maxVersionByPo[poId]) {
      maxVersionByPo[poId] = item.quoteVersion;
    }
  }
  return results.filter(
    (item) =>
      item.quoteVersion === maxVersionByPo[item.poId] && item.balQty > 0,
  );
}

async function getPoItemById(id) {
  const data = await prisma.poItems.findUnique({
    where: { id: parseInt(id) },
    include: {
      Po: {
        select: {
          docId: true,
          dueDate: true,
          docDate: true,
          id: true,
          OrderEntry: { select: { id: true, docId: true } },
        },
      },
      Uom: { select: { name: true } },
      StyleItem: { select: { name: true } },
      Hsn: { select: { name: true } },
      Size: { select: { name: true } },
      Color: { select: { name: true } },
      Gsm: { select: { name: true } },
    },
  });
  if (!data) return NoRecordFound("Purchase Order");

  const [inwardItems, cancelItems] = await Promise.all([
    prisma.inwardItems.findMany({
      where: {
        styleItemId: data.styleItemId,
        poId: data.poId,
        uomId: data.uomId,
        hsnId: data.hsnId,
        itemGroupId: data.itemGroupId,
        sizeId: data.sizeId,
        colorId: data.colorId,
        gsmId: data.gsmId,
      },
      select: { purchaseInwardId: true, inwardQty: true },
    }),
    prisma.purchaseCancelItems.findMany({
      where: {
        styleItemId: data.styleItemId,
        poId: data.poId,
        uomId: data.uomId,
        hsnId: data.hsnId,
        itemGroupId: data.itemGroupId,
        sizeId: data.sizeId,
        colorId: data.colorId,
        gsmId: data.gsmId,
      },
      select: { cancelQty: true },
    }),
  ]);

  const inwardQty = inwardItems.reduce(
    (sum, item) => sum + (item.inwardQty ?? 0),
    0,
  );
  const cancelQty = cancelItems.reduce(
    (sum, item) => sum + (item.cancelQty ?? 0),
    0,
  );
  const inwardIds = inwardItems.map((i) => i.purchaseInwardId).filter(Boolean);

  let returnQty = 0;
  if (inwardIds.length > 0) {
    const returnAgg = await prisma.purchaseReturnItems.aggregate({
      where: {
        styleItemId: data.styleItemId,
        uomId: data.uomId,
        hsnId: data.hsnId,
        purchaseInwardId: { in: inwardIds },
        itemGroupId: data.itemGroupId,
        sizeId: data.sizeId,
        colorId: data.colorId,
        gsmId: data.gsmId,
      },
      _sum: { returnQty: true },
    });
    returnQty = returnAgg._sum.returnQty ?? 0;
  }

  return {
    statusCode: 0,
    data: {
      ...data,
      poQty: data.qty,
      alreadyCancelQty: cancelQty,
      alreadyInwardQty: inwardQty,
      alreadyReturnQty: returnQty,
      balQty: data.qty + returnQty - (inwardQty + cancelQty),
      balQtyCancel: data.qty - (inwardQty - returnQty),
    },
  };
}

async function getPoItems(req) {
  const {
    branchId,
    active,
    supplierId,
    pagination,
    searchDocId,
    searchDocDate,
    searchDueDate,
    poType,
  } = req.query;

  let data;
  let totalCount;

  if (pagination) {
    data = await prisma.poItems.findMany({
      where: {
        Po: {
          docId: Boolean(searchDocId) ? { contains: searchDocId } : undefined,
          supplierId: supplierId ? parseInt(supplierId) : undefined,
        },
      },
      include: {
        Po: {
          select: {
            id: true,
            supplierId: true,
            docDate: true,
            dueDate: true,
            poType: true,
          },
        },
        Uom: { select: { name: true } },
      },
    });

    data = manualFilterSearchDataPoItems(
      searchDocDate,
      searchDueDate,
      poType,
      data,
    );
    data = data?.filter((i) => i.Po.supplierId == supplierId);
    data = await getAllDataPoItems(data);

    const poIds = [...new Set(data.map((item) => item.Po.id))];

    const { module, hasApproval } = await getModuleApprovalSetup(
      REFERENCE_PAGE,
      branchId,
    );

    // ✅ Fetch approval logs for these POs
    const approvalLogs = hasApproval
      ? await prisma.approvalLog.findMany({
          where: { referencePage: REFERENCE_PAGE, referenceId: { in: poIds } },
          select: { referenceId: true, status: true, currentLevel: true },
        })
      : [];

    const approvalLogMap = approvalLogs.reduce((acc, log) => {
      acc[log.referenceId] = log;
      return acc;
    }, {});

    // ✅ Fetch configs once for condition evaluation (same as get() list view)
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
            orderBy: { priority: "asc" },
          })
        : [];

    // ✅ Need full PO records to evaluate conditions (poItems has only Po.id)
    // Fetch POs with the relations that approval fields reference
    const includeClause =
      hasApproval && module ? await buildIncludeForModule(module.id) : {};

    const fullPoRecords =
      poIds.length > 0
        ? await prisma.po.findMany({
            where: { id: { in: poIds } },
            include: { ...includeClause, poItems: true },
          })
        : [];

    const fullPoMap = fullPoRecords.reduce((acc, po) => {
      acc[po.id] = po;
      return acc;
    }, {});

    data = data.map((item) => {
      const log = approvalLogMap[item.Po.id] ?? null;
      const fullPo = fullPoMap[item.Po.id];

      // ✅ Per-PO condition evaluation — same logic as get() list view
      let shouldTrigger = false;
      if (!log && hasApproval && activeConfigs.length > 0 && fullPo) {
        shouldTrigger = evaluateConfigs(activeConfigs, fullPo);
      }

      return {
        ...item,
        approvalStatus: getPOApprovalStatus(log, !!log || shouldTrigger),
      };
    });

    console.log(data, "datacheck");

    // ✅ Filter logic:
    // No approval configured → ALL items pass (NOT_CONFIGURED)
    // Approval configured:
    //   - APPROVED → pass ✅
    //   - NOTAPPROVED (matches condition, no log) → blocked ❌
    //   - NOT_CONFIGURED (doesn't match any condition) → pass ✅ (no rule applies to this PO)
    //   - PENDING → blocked ❌
    //   - REJECTED → blocked ❌
    data = data.filter((item) => {
      if (!hasApproval) return true; // no approval setup → allow all
      const s = item.approvalStatus.status;
      return s === "APPROVED" || s === "NOT_CONFIGURED"; // ✅ NOT_CONFIGURED means no rule applies
    });

    console.log(data, "afterfilterdatacheck");
  } else {
    data = await prisma.poItems.findMany({
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        active: active ? Boolean(active) : undefined,
      },
    });
  }

  totalCount = data.length;
  return { statusCode: 0, data, totalCount };
}

// ── APPROVE / REJECT ──────────────────────────────────────────────────────────
async function createApproveStatus(body) {
  try {
    const {
      userId,
      remarks,
      recordData,
      referencePage,
      referenceId,
      actionType,
    } = body;

    if (!userId) return { statusCode: 1, message: "userId is required" };
    if (actionType === "REJECT" && !remarks?.trim()) {
      return { statusCode: 1, message: "Remarks required for rejection" };
    }

    if (actionType === "APPROVE") {
      return await approveRecord(
        referenceId,
        referencePage,
        userId,
        remarks,
        recordData ?? {},
      );
    } else if (actionType === "REJECT") {
      return await rejectRecord(referenceId, referencePage, userId, remarks);
    }

    return { statusCode: 1, message: "Invalid action type" };
  } catch (err) {
    return { statusCode: 400, message: err.message };
  }
}

async function packingCompleted(body) {
  try {
    const { id } = body;

    if (!id) return { statusCode: 1, message: "Job Card ID is required" };

    const data = await prisma.JobCard.update({
      where: {
        id: parseInt(id),
      },
      data: {
        isPackingComplted: "Completed",
      },
    });

    return { statusCode: 0, message: "Packing Completed" };
  } catch (err) {
    return { statusCode: 400, message: err.message };
  }
}

export {
  get,
  getOne,
  getSearch,
  create,
  update,
  remove,
  getPoItems,
  createApproveStatus,
  packingCompleted,
};
