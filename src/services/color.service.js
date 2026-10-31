import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active, page, pageNumber, limit, pageSize, dataPerPage } = req.query;

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
    ...(activeFilter !== undefined ? { active: activeFilter } : {}),
  };

  const hasPagination = Boolean(
    page || pageNumber || limit || pageSize || dataPerPage,
  );
  const pageVal = parseInt(page || pageNumber) || 1;
  const limitVal = parseInt(limit || pageSize || dataPerPage) || 15;
  const skip = (pageVal - 1) * limitVal;

  const totalCount = await prisma.color.count({ where });

  const data = await prisma.color.findMany({
    where,
    ...(hasPagination ? { skip, take: limitVal } : {}),
    include: {
      _count: {
        select: {
          poItems: true,
          inwardItems: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  return {
    statusCode: 0,
    data: data.map((color) => ({
      ...color,
      childRecord: color?._count.poItems + color?._count.inwardItems,
    })),
    totalCount,
    totalPages: hasPagination ? Math.ceil(totalCount / limitVal) : 1,
    currentPage: pageVal,
    limit: limitVal,
  };
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

  const totalCount = await prisma.color.count({ where });

  const data = await prisma.color.findMany({
    where,
    ...(hasPagination ? { skip, take: limitVal } : {}),
    include: {
      _count: {
        select: {
          poItems: true,
          inwardItems: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  return {
    statusCode: 0,
    data: data.map((color) => ({
      ...color,
      childRecord: color?._count.poItems + color?._count.inwardItems,
    })),
    totalCount,
    totalPages: hasPagination ? Math.ceil(totalCount / limitVal) : 1,
    currentPage: pageVal,
    limit: limitVal,
  };
}

async function getOne(id) {
  const childRecordPo = await prisma.poItems.count({
    where: { colorId: parseInt(id) },
  });
  const childRecordInward = await prisma.inwardItems.count({
    where: { colorId: parseInt(id) },
  });
  const data = await prisma.color.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("color");
  return {
    statusCode: 0,
    data: { ...data, ...{ childRecord: childRecordPo + childRecordInward } },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.color.findMany({
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
  const { name, active, pantone, isGrey, companyId } = await body;
  const data = await prisma.color.create({
    data: {
      name,
      active,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, active } = await body;
  const dataFound = await prisma.color.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("color");
  const data = await prisma.color.update({
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
  const data = await prisma.color.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, search, create, update, remove };
