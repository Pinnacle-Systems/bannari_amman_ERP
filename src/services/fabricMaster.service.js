import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.fabricMaster.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    orderBy: { id: "asc" },
  });
  return { statusCode: 0, data };
}

async function getOne(id) {
  const childRecord = 0;
  const data = await prisma.fabricMaster.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("Fabric Master");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.fabricMaster.findMany({
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
  const { name, code, companyId, active } = await body;
  const data = await prisma.fabricMaster.create({
    data: {
      name,
      code,
      companyId: parseInt(companyId),
      active,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, code, active } = await body;
  const dataFound = await prisma.fabricMaster.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("Fabric Master");
  const data = await prisma.fabricMaster.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      code,
      active,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.fabricMaster.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
