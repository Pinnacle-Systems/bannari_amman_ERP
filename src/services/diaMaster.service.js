import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.diaMaster.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include: {
      _count: {
        select: {
          FabricItemsfDia: true,
          FabricItemskDia: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });
  return {
    statusCode: 0,
    data: data.map((diaMaster) => ({
      ...diaMaster,
      childRecord:
        diaMaster._count.FabricItemsfDia + diaMaster._count.FabricItemskDia,
    })),
  };
}

async function getOne(id) {
  const data = await prisma.diaMaster.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      _count: {
        select: {
          FabricItemsfDia: true,
          FabricItemskDia: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("Dia Master");
  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord: data._count.FabricItemsfDia + data._count.FabricItemskDia,
    },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.diaMaster.findMany({
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
  const { name, code, companyId, active, kDia, fDia, measurement } = await body;
  const data = await prisma.diaMaster.create({
    data: {
      name,
      code,
      companyId: parseInt(companyId),
      active,
      kDia,
      fDia,
      measurement,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, code, active, kDia, fDia, measurement } = await body;
  const dataFound = await prisma.diaMaster.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("Dia Master");
  const data = await prisma.diaMaster.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      code,
      active,
      kDia,
      fDia,
      measurement,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.diaMaster.delete({
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

  const totalCount = await prisma.diaMaster.count({ where });

  const data = await prisma.diaMaster.findMany({
    where,
    ...(hasPagination ? { skip, take: limitVal } : {}),
    include: {
      _count: {
        select: {
          FabricItemsfDia: true,
          FabricItemskDia: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  return {
    statusCode: 0,
    data: data.map((diaMaster) => ({
      ...diaMaster,
      childRecord:
        diaMaster._count.FabricItemsfDia + diaMaster._count.FabricItemskDia,
    })),
    totalCount,
    totalPages: hasPagination ? Math.ceil(totalCount / limitVal) : 1,
    currentPage: pageVal,
    limit: limitVal,
  };
}

export { get, getOne, getSearch, search, create, update, remove };
