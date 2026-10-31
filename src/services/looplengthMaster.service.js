import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

const loopLengthChildRecordSelect = {
  fabricItems: true,
  orderFabricItems: true,
  poFabricItems: true,
};

const getLoopLengthChildRecordCount = (counts) => {
  if (!counts) return 0;
  return (
    (counts.fabricItems || 0) +
    (counts.orderFabricItems || 0) +
    (counts.poFabricItems || 0)
  );
};

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.loopLength.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include: {
      _count: {
        select: loopLengthChildRecordSelect,
      },
    },
    orderBy: { id: "asc" },
  });
  return {
    statusCode: 0,
    data: data.map((loopLength) => ({
      ...loopLength,
      childRecord: getLoopLengthChildRecordCount(loopLength?._count),
    })),
  };
}

async function getOne(id) {
  const data = await prisma.loopLength.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      _count: {
        select: loopLengthChildRecordSelect,
      },
    },
  });
  if (!data) return NoRecordFound("LoopLength Master");
  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord: getLoopLengthChildRecordCount(data?._count),
    },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.loopLength.findMany({
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
  const data = await prisma.loopLength.create({
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
  const dataFound = await prisma.loopLength.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("LoopLength Master");
  const data = await prisma.loopLength.update({
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
  const data = await prisma.loopLength.delete({
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

  const totalCount = await prisma.loopLength.count({ where });

  const data = await prisma.loopLength.findMany({
    where,
    ...(hasPagination ? { skip, take: limitVal } : {}),
    include: {
      _count: {
        select: loopLengthChildRecordSelect,
      },
    },
    orderBy: { id: "asc" },
  });

  return {
    statusCode: 0,
    data: data.map((loopLength) => ({
      ...loopLength,
      childRecord: getLoopLengthChildRecordCount(loopLength?._count),
    })),
    totalCount,
    totalPages: hasPagination ? Math.ceil(totalCount / limitVal) : 1,
    currentPage: pageVal,
    limit: limitVal,
  };
}

export { get, getOne, getSearch, search, create, update, remove };

