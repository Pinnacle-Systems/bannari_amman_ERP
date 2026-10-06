import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.yarnMaster.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include: {
      //   _count: {
      //     select: {

      //       poItems: true,
      //     },
      //   },
      CountsMaster: true,
      ContentMaster: true,
      Hsn: true,
      YarnMasterDetail: {
        include: {
          YarnBlendMaster: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });
  return {
    statusCode: 0,
    data: data.map((yarnMaster) => ({
      ...yarnMaster,
      //   childRecord:
      //     yarnMaster?._count.ItemVariantMasterDetails +
      //     yarnMaster?._count.InwardItems +
      //     yarnMaster?._count.Stock +
      //     yarnMaster?._count.poItems,
    })),
  };
}

async function getOne(id) {
  const data = await prisma.yarnMaster.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      //   _count: {
      //     select: {

      //       poItems: true,
      //     },
      //   },
      CountsMaster: true,
      ContentMaster: true,
      Hsn: true,
      YarnMasterDetail: {
        include: {
          YarnBlendMaster: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("Yarn Master");
  return {
    statusCode: 0,
    data: {
      ...data,
      //   childRecord:
      //     data?._count.ItemVariantMasterDetails +
      //     data?._count.InwardItems + data?._count.Stock + data?._count.poItems,
    },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.yarnMaster.findMany({
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
    countsId,
    contentId,
    name,
    aliasName,
    active,
    hsnId,
    yarnMasterDetail,

    companyId,
  } = await body;

  let data;

  await prisma.$transaction(async (tx) => {
    data = await tx.yarnMaster.create({
      data: {
        countsId: parseInt(countsId),
        contentId: parseInt(contentId),
        name,
        aliasName: aliasName ?? "",
        active,
        hsnId: parseInt(hsnId),
        companyId: parseInt(companyId),

        YarnMasterDetail: {
          createMany: {
            data: yarnMasterDetail?.map((item) => ({
              yarnBlendId: item.yarnBlendId
                ? parseInt(item.yarnBlendId)
                : undefined,

              percentage: item.percentage ? parseFloat(item.percentage) : null,
            })),
          },
        },
      },
    });
  });

  return { statusCode: 0, data };
}

async function update(id, body) {
  const {
    countsId,
    contentId,
    name,
    aliasName,
    active,
    hsnId,
    yarnMasterDetail,

    companyId,
  } = await body;
  let data;
  const dataFound = await prisma.yarnMaster.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      YarnMasterDetail: true,
    },
  });
  if (!dataFound) return NoRecordFound("Model Name");

  const incomingItemIds = (yarnMasterDetail || [])
    .filter((i) => i.id)
    .map((i) => parseInt(i.id));
  const removedItemIds = dataFound.YarnMasterDetail
    .filter((item) => !incomingItemIds.includes(item.id))
    .map((item) => item.id);

  await prisma.$transaction(async (tx) => {
    data = await tx.yarnMaster.update({
      where: {
        id: parseInt(id),
      },
      data: {
        countsId: parseInt(countsId),
        contentId: parseInt(contentId),
        name,
        aliasName: aliasName ?? "",
        active,
        hsnId: parseInt(hsnId),
        companyId: parseInt(companyId),
        YarnMasterDetail: {
          deleteMany: incomingItemIds.length
            ? { id: { notIn: incomingItemIds } }
            : {},
          updateMany: (yarnMasterDetail || []).filter((item) => item.id).length
            ? (yarnMasterDetail || [])
                .filter((item) => item.id)
                .map((item) => ({
                  where: {
                    id: parseInt(item.id),
                  },
                  data: {
                    yarnBlendId: item.yarnBlendId
                      ? parseInt(item.yarnBlendId)
                      : undefined,

                    percentage: item.percentage
                      ? parseFloat(item.percentage)
                      : null,
                  },
                }))
            : [],
          createMany: {
            data: (yarnMasterDetail || [])
              .filter((item) => !item.id)
              .map((item) => ({
                yarnBlendId: item.yarnBlendId
                  ? parseInt(item.yarnBlendId)
                  : undefined,

                percentage: item.percentage
                  ? parseFloat(item.percentage)
                  : null,
              })),
          },
        },
      },
    });
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.yarnMaster.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
