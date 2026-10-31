import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

const colorChildRecordSelect = {
  DeliveryChallanItems: true,
  DeliveryInvoiceItems: true,
  poItems: true,
  purchaseCancelItems: true,
  purchaseBillEntryItems: true,
  purchaseReturnItems: true,
  inwardItems: true,
  stocks: true,
  fabricItems: true,
  yarnItems: true,
  orderYarnItems: true,
  orderFabricItems: true,
  poFabricItems: true,
  poYarnItems: true,
  fabricYarnDetails: true,
  yarnProcessColors: true,
  yarnProcessDetails: true,
};

const getColorChildRecordCount = (counts) => {
  if (!counts) return 0;
  return (
    (counts.DeliveryChallanItems || 0) +
    (counts.DeliveryInvoiceItems || 0) +
    (counts.poItems || 0) +
    (counts.purchaseCancelItems || 0) +
    (counts.purchaseBillEntryItems || 0) +
    (counts.purchaseReturnItems || 0) +
    (counts.inwardItems || 0) +
    (counts.stocks || 0) +
    (counts.fabricItems || 0) +
    (counts.yarnItems || 0) +
    (counts.orderYarnItems || 0) +
    (counts.orderFabricItems || 0) +
    (counts.poFabricItems || 0) +
    (counts.poYarnItems || 0) +
    (counts.fabricYarnDetails || 0) +
    (counts.yarnProcessColors || 0) +
    (counts.yarnProcessDetails || 0)
  );
};

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
        select: colorChildRecordSelect,
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
      childRecord: getColorChildRecordCount(color?._count),
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
        select: colorChildRecordSelect,
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
      childRecord: getColorChildRecordCount(color?._count),
    })),
    totalCount,
    totalPages: hasPagination ? Math.ceil(totalCount / limitVal) : 1,
    currentPage: pageVal,
    limit: limitVal,
  };
}

async function getOne(id) {
  const data = await prisma.color.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      _count: {
        select: colorChildRecordSelect,
      },
    },
  });
  if (!data) return NoRecordFound("color");
  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord: getColorChildRecordCount(data?._count),
    },
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
