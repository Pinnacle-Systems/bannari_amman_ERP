import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

const cityChildRecordSelect = {
  doctorLocalCity: true,
  doctorPermCity: true,
  Party: true,
  PartyBranch: true,
  bank: true,
  proformaInvoiceDelivery: true,
  proformaInvoiceLoading: true,
  orderEntryDelivery: true,
  orderEntryLoading: true,
  SalesOrderDelivery: true,
  SalesOrderLoading: true,
  SalesDeliveryDelivery: true,
  SalesDeliveryLoading: true,
  SalesBillEntryLoading: true,
  SalesBillEntryDelivery: true,
  ProformaInvoiceYarnDelivery: true,
  ProformaInvoiceYarnLoading: true,
};

const getCityChildRecordCount = (counts) => {
  if (!counts) return 0;
  return (
    (counts.doctorLocalCity || 0) +
    (counts.doctorPermCity || 0) +
    (counts.Party || 0) +
    (counts.PartyBranch || 0) +
    (counts.bank || 0) +
    (counts.proformaInvoiceDelivery || 0) +
    (counts.proformaInvoiceLoading || 0) +
    (counts.orderEntryDelivery || 0) +
    (counts.orderEntryLoading || 0) +
    (counts.SalesOrderDelivery || 0) +
    (counts.SalesOrderLoading || 0) +
    (counts.SalesDeliveryDelivery || 0) +
    (counts.SalesDeliveryLoading || 0) +
    (counts.SalesBillEntryLoading || 0) +
    (counts.SalesBillEntryDelivery || 0) +
    (counts.ProformaInvoiceYarnDelivery || 0) +
    (counts.ProformaInvoiceYarnLoading || 0)
  );
};

async function get(req) {
  const { companyId, active } = req.query;
  let data;
  data = await prisma.city.findMany({
    where: {
      state: {
        country: {
          companyId: companyId ? parseInt(companyId) : undefined,
        },
      },
      active: active ? Boolean(active) : undefined,
    },
    include: {
      state: {
        select: {
          name: true,
          country: {
            select: {
              name: true,
            },
          },
        },
      },
      _count: {
        select: cityChildRecordSelect,
      },
    },
  });
  return {
    statusCode: 0,
    data: data.map((order) => ({
      ...order,
      childRecord: getCityChildRecordCount(order?._count),
    })),
  };
}

async function getOne(id) {
  const data = await prisma.city.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      _count: {
        select: cityChildRecordSelect,
      },
    },
  });
  if (!data) return NoRecordFound("City");
  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord: getCityChildRecordCount(data?._count),
    },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.city.findMany({
    where: {
      state: {
        country: {
          companyId: companyId ? parseInt(companyId) : undefined,
        },
      },
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
        {
          state: {
            name: {
              contains: searchKey,
            },
          },
        },
      ],
    },
    select: {
      name: true,
      code: true,
      active: true,
      id: true,
      state: {
        select: {
          name: true,
          country: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
  return { statusCode: 0, data: data };
}

async function create(body) {
  const { name, code, state } = await body;
  const data = await prisma.city.create({
    data: {
      name,
      code,
      state: {
        connect: { id: parseInt(state) },
      },
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, code, active, state } = await body;
  const dataFound = await prisma.city.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("City");
  const data = await prisma.city.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      code,
      active,
      state: {
        connect: { id: parseInt(state) },
      },
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.city.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
