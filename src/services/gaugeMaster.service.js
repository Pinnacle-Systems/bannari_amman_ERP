import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.gauge.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    // include: {
    //   _count: {
    //     select: {
    //       YarnMaster: true,
    //     },
    //   },
    // },
    orderBy: { id: "asc" },
  });
  return {
    statusCode: 0,
    data: data.map((content) => ({
      ...content,
      //   childRecord: content._count.YarnMaster > 0,
    })),
  };
}

async function getOne(id) {
  const data = await prisma.gauge.findUnique({
    where: {
      id: parseInt(id),
    },
    // include: {
    //   _count: {
    //     select: {
    //       YarnMaster: true,
    //     },
    //   },
    // },
  });
  if (!data) return NoRecordFound("Gauge Master");
  return {
    statusCode: 0,
    data: {
      ...data,
      //   childRecord: data._count.YarnMaster > 0,
    },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.gauge.findMany({
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
  const data = await prisma.gauge.create({
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
  const dataFound = await prisma.gauge.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("Gauge Master");
  const data = await prisma.gauge.update({
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
  const data = await prisma.gauge.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
