import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from "../configs/Responses.js";


const termsAndConditionsChildRecordSelect = {
  pos: true,
  purchaseInwardReturns: true,
  purchaseCancels: true,
  orderEntries: true,
  proformaInvoices: true,
  salesDeliveries: true,
  SalesOrder: true,
  SalesReturn: true,
  proformaInvoiceYarns: true,
};

const getTermsAndConditionsChildRecordCount = (counts) => {
  if (!counts) return 0;
  return (
    (counts.pos || 0) +
    (counts.purchaseInwardReturns || 0) +
    (counts.purchaseCancels || 0) +
    (counts.orderEntries || 0) +
    (counts.proformaInvoices || 0) +
    (counts.salesDeliveries || 0) +
    (counts.SalesOrder || 0) +
    (counts.SalesReturn || 0) +
    (counts.proformaInvoiceYarns || 0)
  );
};

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.termsAndConditions.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include: {
      _count: {
        select: termsAndConditionsChildRecordSelect,
      },
    },
  });
  return {
    statusCode: 0,
    data: data.map((item) => ({
      ...item,
      childRecord: getTermsAndConditionsChildRecordCount(item?._count),
    })),
  };
}

async function getOne(id) {
  const data = await prisma.termsAndConditions.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      _count: {
        select: termsAndConditionsChildRecordSelect,
      },
    },
  });
  if (!data) return NoRecordFound("termsAndConditions");
  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord: getTermsAndConditionsChildRecordCount(data?._count),
    },
  };
}

async function getSearch(req) {
  const { companyId, active } = req.query;
  const { searchKey } = req.params;
  const data = await prisma.termsAndConditions.findMany({
    where: {
      country: {
        companyId: companyId ? parseInt(companyId) : undefined,
      },
      active: active ? Boolean(active) : undefined,
      OR: [
        {
          aliasName: {
            contains: searchKey,
          },
        },
      ],
    },
  });
  return { statusCode: 0, data: data };
}

async function create(body) {
  const { description, companyId, active, name } = await body;
  const data = await prisma.termsAndConditions.create({
    data: {
      description,
      active,
      companyId: parseInt(companyId),
      name,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { description, companyId, active, name } = await body;
  const dataFound = await prisma.termsAndConditions.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("termsAndConditions");
  const data = await prisma.termsAndConditions.update({
    where: {
      id: parseInt(id),
    },
    data: {
      description,
      companyId: parseInt(companyId),
      active,
      name,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.termsAndConditions.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
