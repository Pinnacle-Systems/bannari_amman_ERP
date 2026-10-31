import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.yarnBlendMaster.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include: {
      _count: {
        select: {
          YarnMasterDetail: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });
  return {
    statusCode: 0,
    data: data.map((yarnBlend) => ({
      ...yarnBlend,
      childRecord: yarnBlend._count.YarnMasterDetail > 0,
    })),
  };
}

async function getOne(id) {
  const data = await prisma.yarnBlendMaster.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      _count: {
        select: {
          YarnMasterDetail: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("Yarn Blend Master");
  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord: data._count.YarnMasterDetail > 0,
    },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.yarnBlendMaster.findMany({
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
  const data = await prisma.yarnBlendMaster.create({
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
  const dataFound = await prisma.yarnBlendMaster.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("Yarn Blend Master");
  const data = await prisma.yarnBlendMaster.update({
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
  const data = await prisma.yarnBlendMaster.delete({
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

  const totalCount = await prisma.yarnBlendMaster.count({ where });

  const data = await prisma.yarnBlendMaster.findMany({
    where,
    ...(hasPagination ? { skip, take: limitVal } : {}),
    include: {
      _count: {
        select: {
          YarnMasterDetail: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  return {
    statusCode: 0,
    data: data.map((yarnBlend) => ({
      ...yarnBlend,
      childRecord: yarnBlend._count.YarnMasterDetail > 0,
    })),
    totalCount,
    totalPages: hasPagination ? Math.ceil(totalCount / limitVal) : 1,
    currentPage: pageVal,
    limit: limitVal,
  };
}

export { get, getOne, getSearch, search, create, update, remove };

