import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from "../configs/Responses.js";

const sizeChildRecordSelect = {
  sizeTemplateLists: true,
  poItems: true,
  purchaseCancelItems: true,
  purchaseBillEntryItems: true,
  purchaseReturnItems: true,
  inwardItems: true,
  stocks: true,
  orderItems: true,
  proformaInvoiceItems: true,
  SalesOrderItems: true,
  SalesBillEntryItems: true,
};

const getSizeChildRecordCount = (counts) => {
  if (!counts) return 0;
  return (
    (counts.sizeTemplateLists || 0) +
    (counts.poItems || 0) +
    (counts.purchaseCancelItems || 0) +
    (counts.purchaseBillEntryItems || 0) +
    (counts.purchaseReturnItems || 0) +
    (counts.inwardItems || 0) +
    (counts.stocks || 0) +
    (counts.orderItems || 0) +
    (counts.proformaInvoiceItems || 0) +
    (counts.SalesOrderItems || 0) +
    (counts.SalesBillEntryItems || 0)
  );
};

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.size.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include: {
      _count: {
        select: sizeChildRecordSelect,
      },
    },
  });
  return {
    statusCode: 0,
    data: data.map((item) => ({
      ...item,
      childRecord: getSizeChildRecordCount(item?._count),
    })),
  };
}

async function getOne(id) {
  const data = await prisma.size.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      _count: {
        select: sizeChildRecordSelect,
      },
    },
  });
  if (!data) return NoRecordFound("size");
  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord: getSizeChildRecordCount(data?._count),
    },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.size.findMany({
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
  const data = await prisma.size.create({
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
  const dataFound = await prisma.size.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("size");
  const data = await prisma.size.update({
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
  const data = await prisma.size.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
