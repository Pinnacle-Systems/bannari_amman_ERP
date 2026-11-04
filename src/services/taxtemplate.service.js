import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from "../configs/Responses.js";
import { exclude } from "../utils/helper.js";

const taxTemplateChildRecordSelect = {
  pos: true,
  purchaseBillEntries: true,
  purchaseInwards: true,
  productionInwards: true,
  proformaInvoices: true,
  processBills: true,
  salesDeliveries: true,
  orderEntries: true,
  SalesOrder: true,
  SalesReturn: true,
  SalesBillEntry: true,
  proformaInvoiceYarns: true,
};

const getTaxTemplateChildRecordCount = (counts) => {
  if (!counts) return 0;
  return (
    (counts.pos || 0) +
    (counts.purchaseBillEntries || 0) +
    (counts.purchaseInwards || 0) +
    (counts.productionInwards || 0) +
    (counts.proformaInvoices || 0) +
    (counts.processBills || 0) +
    (counts.salesDeliveries || 0) +
    (counts.orderEntries || 0) +
    (counts.SalesOrder || 0) +
    (counts.SalesReturn || 0) +
    (counts.SalesBillEntry || 0) +
    (counts.proformaInvoiceYarns || 0)
  );
};

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.taxTemplate.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include: {
      _count: {
        select: taxTemplateChildRecordSelect,
      },
    },
  });
  return {
    statusCode: 0,
    data: data.map((item) => ({
      ...item,
      childRecord: getTaxTemplateChildRecordCount(item?._count),
    })),
  };
}

async function getOne(id) {
  const data = await prisma.taxTemplate.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      TaxTemplateDetails: true,
      _count: {
        select: taxTemplateChildRecordSelect,
      },
    },
  });
  if (!data) return NoRecordFound("taxTemplate");
  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord: getTaxTemplateChildRecordCount(data?._count),
    },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.taxTemplate.findMany({
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
  const { name, companyId, active, taxTemplateDetails } = await body;
  const data = await prisma.taxTemplate.create({
    data: {
      name,
      companyId: parseInt(companyId),
      active,
      TaxTemplateDetails: {
        createMany: {
          data: taxTemplateDetails.map((temp) => {
            temp["taxTermId"] = parseInt(temp["taxTermId"]);
            return temp;
          }),
        },
      },
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, companyId, active, taxTemplateDetails } = await body;
  const dataFound = await prisma.taxTemplate.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("taxTemplate");
  const data = await prisma.taxTemplate.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      companyId: parseInt(companyId),
      active,
      TaxTemplateDetails: {
        deleteMany: {},
        createMany: {
          data: taxTemplateDetails.map((temp) => {
            temp["taxTermId"] = parseInt(temp["taxTermId"]);
            return exclude(temp, ["id", "taxTemplateId"]);
          }),
        },
      },
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.taxTemplate.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
