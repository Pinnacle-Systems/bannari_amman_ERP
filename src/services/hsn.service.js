import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  let data;
  data = await prisma.hsn.findMany({
    where: {
      active: active ? Boolean(active) : undefined,
    },
    include: {
      _count: {
        select: {
          styleItems: true,
          YarnMaster: true,
          fabricMasters: true,
        },
      },
    },
  });
  return {
    statusCode: 0,
    data: (data = data.map((color) => ({
      ...color,
      childRecord:
        color?._count.styleItems +
        color?._count.YarnMaster +
        color?._count.fabricMasters,
    }))),
  };
}

async function getOne(id) {
  const childRecord = await prisma.styleItem.count({
    where: { hsnId: parseInt(id) },
  });
  const childRecordYarn = await prisma.YarnMaster.count({
    where: { hsnId: parseInt(id) },
  });
  const childRecordFabric = await prisma.fabricMaster.count({
    where: { hsnId: parseInt(id) },
  });
  const data = await prisma.hsn.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("hsn");
  return {
    statusCode: 0,
    data: {
      ...data,
      ...{ childRecord: childRecord + childRecordYarn + childRecordFabric },
    },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.hsn.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
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
    ...(companyId ? { companyId: parseInt(companyId) } : {}),
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
        select: {
          styleItems: true,
          YarnMaster: true,
          fabricMasters: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  return {
    statusCode: 0,
    data: data.map((color) => ({
      ...color,
      childRecord:
        color?._count.styleItems +
        color?._count.YarnMaster +
        color?._count.fabricMasters,
    })),
    totalCount,
    totalPages: hasPagination ? Math.ceil(totalCount / limitVal) : 1,
    currentPage: pageVal,
    limit: limitVal,
  };
}

export { get, getOne, getSearch, search, create, update, remove };
