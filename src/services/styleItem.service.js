import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

const styleItemChildRecordSelect = {
  DeliveryChallanItems: true,
  DeliveryInvoiceItems: true,
  poItems: true,
  inwardItems: true,
  stocks: true,
  purchaseReturnItems: true,
  purchaseCancelItems: true,
  purchaseBillEntryItems: true,
  orderItems: true,
  proformaInvoiceItems: true,
  productionAllocations: true,
  salesDeliveryItems: true,
  SalesOrderItems: true,
  PackingItems: true,
  SalesReturnItems: true,
  SalesBillEntryItems: true,
};

const getStyleItemChildRecordCount = (counts) => {
  if (!counts) return 0;
  return (
    (counts.DeliveryChallanItems || 0) +
    (counts.DeliveryInvoiceItems || 0) +
    (counts.poItems || 0) +
    (counts.inwardItems || 0) +
    (counts.stocks || 0) +
    (counts.purchaseReturnItems || 0) +
    (counts.purchaseCancelItems || 0) +
    (counts.purchaseBillEntryItems || 0) +
    (counts.orderItems || 0) +
    (counts.proformaInvoiceItems || 0) +
    (counts.productionAllocations || 0) +
    (counts.salesDeliveryItems || 0) +
    (counts.SalesOrderItems || 0) +
    (counts.PackingItems || 0) +
    (counts.SalesReturnItems || 0) +
    (counts.SalesBillEntryItems || 0)
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

  const totalCount = await prisma.styleItem.count({ where });

  const data = await prisma.styleItem.findMany({
    where,
    ...(hasPagination ? { skip, take: limitVal } : {}),
    include: {
      _count: {
        select: styleItemChildRecordSelect,
      },
      SizeTemplate: {
        select: {
          SizeTemplateList: {
            select: {
              sizeId: true,
            },
          },
        },
      },
      ItemGroup: {
        select: {
          name: true,
        },
      },
      ItemSubGroup: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return {
    statusCode: 0,
    data: data.map((item) => ({
      ...item,
      childRecord: getStyleItemChildRecordCount(item?._count),
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

  const totalCount = await prisma.styleItem.count({ where });

  const data = await prisma.styleItem.findMany({
    where,
    ...(hasPagination ? { skip, take: limitVal } : {}),
    include: {
      _count: {
        select: styleItemChildRecordSelect,
      },
      SizeTemplate: {
        select: {
          SizeTemplateList: {
            select: {
              sizeId: true,
            },
          },
        },
      },
      ItemGroup: {
        select: {
          name: true,
        },
      },
      ItemSubGroup: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return {
    statusCode: 0,
    data: data.map((item) => ({
      ...item,
      childRecord: getStyleItemChildRecordCount(item?._count),
    })),
    totalCount,
    totalPages: hasPagination ? Math.ceil(totalCount / limitVal) : 1,
    currentPage: pageVal,
    limit: limitVal,
  };
}

async function getOne(id) {
  const data = await prisma.styleItem.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      Hsn: true,
      _count: {
        select: styleItemChildRecordSelect,
      },
    },
  });
  if (!data) return NoRecordFound("styleItem");
  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord: getStyleItemChildRecordCount(data?._count),
    },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.styleItem.findMany({
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
  const {
    name,
    aliasName,
    active,
    code,
    hsnId,
    uomId,
    sizeTemplateId,
    itemGroupId,
    itemSubGroupId,
    gsmId,
  } = await body;
  const data = await prisma.styleItem.create({
    data: {
      name,
      aliasName,
      active,
      code,
      hsnId: parseInt(hsnId) || null,
      uomId: parseInt(uomId) || null,
      itemGroupId: parseInt(itemGroupId) || null,
      itemSubGroupId: parseInt(itemSubGroupId) || null,
      sizeTemplateId: parseInt(sizeTemplateId) || null,
      gsmId: parseInt(gsmId) || null,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const {
    name,
    active,
    aliasName,
    code,
    hsnId,
    uomId,
    sizeTemplateId,
    itemGroupId,
    itemSubGroupId,
    gsmId,
  } = await body;

  const dataFound = await prisma.styleItem.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("styleItem");
  const data = await prisma.styleItem.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      aliasName,
      active,
      code,
      hsnId: parseInt(hsnId) || null,
      uomId: parseInt(uomId) || null,
      itemGroupId: parseInt(itemGroupId) || null,
      itemSubGroupId: parseInt(itemSubGroupId) || null,
      sizeTemplateId: parseInt(sizeTemplateId) || null,
      gsmId: parseInt(gsmId) || null,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.styleItem.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, search, create, update, remove };
