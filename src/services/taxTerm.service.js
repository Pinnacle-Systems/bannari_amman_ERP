import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from "../configs/Responses.js";

const taxTermChildRecordSelect = {
  TaxTemplateDetails: true,
};

const getTaxTermChildRecordCount = (counts) => {
  if (!counts) return 0;
  return counts.TaxTemplateDetails || 0;
};

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.taxTerm.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include: {
      _count: {
        select: taxTermChildRecordSelect,
      },
    },
  });
  return {
    statusCode: 0,
    data: data.map((item) => ({
      ...item,
      childRecord: getTaxTermChildRecordCount(item?._count),
    })),
  };
}

async function getOne(id) {
  const data = await prisma.taxTerm.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      _count: {
        select: taxTermChildRecordSelect,
      },
    },
  });
  if (!data) return NoRecordFound("taxTerm");
  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord: getTaxTermChildRecordCount(data?._count),
    },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.taxTerm.findMany({
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
  const { name, companyId, active, isPoWise } = await body;
  const data = await prisma.taxTerm.create({
    data: {
      name,
      companyId: parseInt(companyId),
      active,
      isPoWise,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, active, isPoWise } = await body;
  const dataFound = await prisma.taxTerm.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("taxTerm");
  const data = await prisma.taxTerm.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      active,
      isPoWise,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.taxTerm.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
