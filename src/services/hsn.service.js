import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from "../configs/Responses.js";

const hsnChildRecordSelect = {
  DeliveryChallanItems: true,
  DeliveryInvoiceItems: true,
  poItems: true,
  inwardItems: true,
  stocks: true,
  styleItems: true,
  purchaseReturnItems: true,
  purchaseCancelItems: true,
  purchaseBillEntryItems: true,
  proformaInvoiceItems: true,
  orderItems: true,
  salesDeliveryItems: true,
  SalesOrderItems: true,
  PackingItems: true,
  SalesReturnItems: true,
  SalesBillEntryItems: true,
  YarnMaster: true,
  fabricMasters: true,
  fabricItems: true,
  yarnItems: true,
  orderYarnItems: true,
  orderFabricItems: true,
  poFabricItems: true,
  poYarnItems: true,
};

const getHsnChildRecordCount = (counts) => {
  if (!counts) return 0;
  return (
    (counts.DeliveryChallanItems || 0) +
    (counts.DeliveryInvoiceItems || 0) +
    (counts.poItems || 0) +
    (counts.inwardItems || 0) +
    (counts.stocks || 0) +
    (counts.styleItems || 0) +
    (counts.purchaseReturnItems || 0) +
    (counts.purchaseCancelItems || 0) +
    (counts.purchaseBillEntryItems || 0) +
    (counts.proformaInvoiceItems || 0) +
    (counts.orderItems || 0) +
    (counts.salesDeliveryItems || 0) +
    (counts.SalesOrderItems || 0) +
    (counts.PackingItems || 0) +
    (counts.SalesReturnItems || 0) +
    (counts.SalesBillEntryItems || 0) +
    (counts.YarnMaster || 0) +
    (counts.fabricMasters || 0) +
    (counts.fabricItems || 0) +
    (counts.yarnItems || 0) +
    (counts.orderYarnItems || 0) +
    (counts.orderFabricItems || 0) +
    (counts.poFabricItems || 0) +
    (counts.poYarnItems || 0)
  );
};

async function get(req) {
  const { companyId, active } = req.query;
  let data;
  data = await prisma.hsn.findMany({
    where: {
      active: active ? Boolean(active) : undefined,
    },
    include: {
      _count: {
        select: hsnChildRecordSelect,
      },
    },
  });
  return {
    statusCode: 0,
    data: data.map((item) => ({
      ...item,
      childRecord: getHsnChildRecordCount(item?._count),
    })),
  };
}

async function getOne(id) {
  const data = await prisma.hsn.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      _count: {
        select: hsnChildRecordSelect,
      },
    },
  });
  if (!data) return NoRecordFound("hsn");
  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord: getHsnChildRecordCount(data?._count),
    },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.hsn.findMany({
    where: {
      // companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
      OR: [
        {
          name: {
            contains: searchKey,
          },
        },
        {
          code: {
            contains: searchKey,
          },
        },
      ],
    },
  });
  return { statusCode: 0, data: data };
}

async function create(body) {
  const { name, code, companyId, active, tax } = await body;
  const data = await prisma.hsn.create({
    data: {
      name,
      code,
      active,
      tax,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, code, active, tax } = await body;
  const dataFound = await prisma.hsn.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("hsn");
  const data = await prisma.hsn.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      code,
      active,
      tax,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.hsn.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

async function search(req) {
  const {
    name,
    active,
    page,
    pageNumber,
    limit,
    pageSize,
    dataPerPage,
    companyId,
  } = req.query;

  let activeFilter = undefined;
  if (
    active !== undefined &&
    active !== "" &&
    active !== "all" &&
    active !== "ALL"
  ) {
    if (
      active === true ||
      active === "true" ||
      active === "active" ||
      active === "ACTIVE"
    ) {
      activeFilter = true;
    } else if (
      active === false ||
      active === "false" ||
      active === "inactive" ||
      active === "INACTIVE"
    ) {
      activeFilter = false;
    }
  }

  const where = {
    // ...(companyId ? { companyId: parseInt(companyId) } : {}),
    ...(activeFilter !== undefined ? { active: activeFilter } : {}),
    ...(name && name.trim() !== ""
      ? { name: { contains: name.trim(), mode: "insensitive" } }
      : {}),
  };

  const hasPagination = Boolean(
    page || pageNumber || limit || pageSize || dataPerPage,
  );
  const pageVal = parseInt(page || pageNumber) || 1;
  const limitVal = parseInt(limit || pageSize || dataPerPage) || 15;
  const skip = (pageVal - 1) * limitVal;

  const totalCount = await prisma.hsn.count({ where });

  const data = await prisma.hsn.findMany({
    where,
    ...(hasPagination ? { skip, take: limitVal } : {}),
    include: {
      _count: {
        select: hsnChildRecordSelect,
      },
    },
    orderBy: { id: "asc" },
  });

  return {
    statusCode: 0,
    data: data.map((item) => ({
      ...item,
      childRecord: getHsnChildRecordCount(item?._count),
    })),
    totalCount,
    totalPages: hasPagination ? Math.ceil(totalCount / limitVal) : 1,
    currentPage: pageVal,
    limit: limitVal,
  };
}

export { get, getOne, getSearch, search, create, update, remove };
