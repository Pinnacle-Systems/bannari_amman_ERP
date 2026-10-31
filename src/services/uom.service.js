import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from '../configs/Responses.js';



const uomChildRecordSelect = {
    Product: true,
    ProductUomPriceDetails: true,
    PoReturnItems: true,
    SalesBillItems: true,
    SalesReturnItems: true,
    DeliveryChallanItems: true,
    DeliveryInvoiceItems: true,
    poItems: true,
    inwardItems: true,
    stocks: true,
    purchaseReturnItems: true,
    purchaseCancelItems: true,
    purchaseBillEntryItems: true,
    styleItems: true,
    orderItems: true,
    proformaInvoiceItems: true,
    salesDeliveryItems: true,
    SalesOrderItems: true,
    PackingItems: true,
    SalesBillEntryItems: true,
    fabricItems: true,
    yarnItems: true,
    orderYarnItems: true,
    orderFabricItems: true,
    poFabricItems: true,
    poYarnItems: true,
};

const getUomChildRecordCount = (counts) => {
    if (!counts) return 0;
    return (
        (counts.Product || 0) +
        (counts.ProductUomPriceDetails || 0) +
        (counts.PoReturnItems || 0) +
        (counts.SalesBillItems || 0) +
        (counts.SalesReturnItems || 0) +
        (counts.DeliveryChallanItems || 0) +
        (counts.DeliveryInvoiceItems || 0) +
        (counts.poItems || 0) +
        (counts.inwardItems || 0) +
        (counts.stocks || 0) +
        (counts.purchaseReturnItems || 0) +
        (counts.purchaseCancelItems || 0) +
        (counts.purchaseBillEntryItems || 0) +
        (counts.styleItems || 0) +
        (counts.orderItems || 0) +
        (counts.proformaInvoiceItems || 0) +
        (counts.salesDeliveryItems || 0) +
        (counts.SalesOrderItems || 0) +
        (counts.PackingItems || 0) +
        (counts.SalesBillEntryItems || 0) +
        (counts.fabricItems || 0) +
        (counts.yarnItems || 0) +
        (counts.orderYarnItems || 0) +
        (counts.orderFabricItems || 0) +
        (counts.poFabricItems || 0) +
        (counts.poYarnItems || 0)
    );
};

async function get(req) {
    const { companyId, active } = req.query;
    let data;
    data = await prisma.uom.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
        },
        include: {
            _count: {
                select: uomChildRecordSelect,
            },
        },
    });
    return {
        statusCode: 0,
        data: data.map((item) => ({
            ...item,
            childRecord: getUomChildRecordCount(item?._count),
        })),
    };
}

async function getOne(id) {
    const data = await prisma.uom.findUnique({
        where: {
            id: parseInt(id),
        },
        include: {
            _count: {
                select: uomChildRecordSelect,
            },
        },
    });
    if (!data) return NoRecordFound("uom");
    return {
        statusCode: 0,
        data: {
            ...data,
            childRecord: getUomChildRecordCount(data?._count),
        },
    };
}



async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.uom.findMany({
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
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { name, companyId, active } = await body
    const data = await prisma.uom.create(
        {
            data: {
                name, companyId: parseInt(companyId), active
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, active } = await body
    const dataFound = await prisma.uom.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("uom");
    const data = await prisma.uom.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, active
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.uom.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove
}
