import { NoRecordFound } from "../configs/Responses.js";

import { prisma } from "../lib/prisma.js";

const gsmChildRecordSelect = {
  styleItems: true,
  poItems: true,
  inwardItems: true,
  purchaseReturnItems: true,
  purchaseCancelItems: true,
  purchaseBillEntryItems: true,
  stocks: true,
  orderItems: true,
  proformaInvoiceItems: true,
  SalesOrderItems: true,
  PackingItems: true,
  SalesDeliveryItems: true,
  SalesReturnItems: true,
  SalesBillEntryItems: true,
  fabricItems: true,
  orderFabricItems: true,
  poFabricItems: true,
};

const getGsmChildRecordCount = (counts) => {
  if (!counts) return 0;
  return (
    (counts.styleItems || 0) +
    (counts.poItems || 0) +
    (counts.inwardItems || 0) +
    (counts.purchaseReturnItems || 0) +
    (counts.purchaseCancelItems || 0) +
    (counts.purchaseBillEntryItems || 0) +
    (counts.stocks || 0) +
    (counts.orderItems || 0) +
    (counts.proformaInvoiceItems || 0) +
    (counts.SalesOrderItems || 0) +
    (counts.PackingItems || 0) +
    (counts.SalesDeliveryItems || 0) +
    (counts.SalesReturnItems || 0) +
    (counts.SalesBillEntryItems || 0) +
    (counts.fabricItems || 0) +
    (counts.orderFabricItems || 0) +
    (counts.poFabricItems || 0)
  );
};

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.gsm.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include: {
      _count: {
        select: gsmChildRecordSelect,
      },
    },
  });
  return {
    statusCode: 0,
    data: data.map((item) => ({
      ...item,
      childRecord: getGsmChildRecordCount(item?._count),
    })),
  };
}

async function getOne(id) {
  const data = await prisma.gsm.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      _count: {
        select: gsmChildRecordSelect,
      },
    },
  });
  if (!data) return NoRecordFound("gsm");
  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord: getGsmChildRecordCount(data?._count),
    },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.gsm.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
      OR: [
        {
          name: {
            contains: searchKey,
          },
        },
      ],
    },
  });
  return { statusCode: 0, data: data };
}

async function create(body) {
  const { name, companyId, active } = await body;
  const data = await prisma.gsm.create({
    data: {
      name,
      companyId: parseInt(companyId),
      active,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, active } = await body;
  const dataFound = await prisma.gsm.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("gsm");
  const data = await prisma.gsm.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      active,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.gsm.delete({
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
    companyId: companyId ? parseInt(companyId) : undefined,
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

  const totalCount = await prisma.gsm.count({ where });

  const data = await prisma.gsm.findMany({
    where,
    ...(hasPagination ? { skip, take: limitVal } : {}),
    include: {
      _count: {
        select: gsmChildRecordSelect,
      },
    },
    orderBy: { id: "asc" },
  });

  return {
    statusCode: 0,
    data: data.map((item) => ({
      ...item,
      childRecord: getGsmChildRecordCount(item?._count),
    })),
    totalCount,
    totalPages: hasPagination ? Math.ceil(totalCount / limitVal) : 1,
    currentPage: pageVal,
    limit: limitVal,
  };
}

export { get, getOne, getSearch, search, create, update, remove };
