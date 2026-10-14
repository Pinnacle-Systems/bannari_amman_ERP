import { getYearShortCode } from "./helper";

export const dropDownListObject = (data = [], showKey, valueKey) => {
  const outputData = [];
  for (let i of data) {
    const hasChild = Boolean(
      i?.childRecord ||
        (i?._count && Object.values(i._count).some((v) => Number(v) > 0)),
    );
    outputData.push({
      show: i[showKey],
      value: i[valueKey],
      childRecord: hasChild,
      _count: i?._count,
    });
  }
  return outputData;
};

export const dropDownListObjectMultiple = (
  data = [],
  showKeys = [],
  valueKey,
) => {
  return data.map((item) => {
    const show = showKeys
      .map((key) => {
        // support nested keys like "country.name"
        return key.split(".").reduce((obj, k) => obj?.[k], item);
      })
      .filter(Boolean)
      .join(" / ");

    return {
      show,
      value: item[valueKey],
    };
  });
};

export const dropDownFinYear = (data) => {
  const outputData = [];
  for (let i of data) {
    outputData.push({
      show: getYearShortCode(i["from"], i["to"]),
      value: i["id"],
    });
  }
  return outputData;
};

export const dropDownListMergedObject = (data) => {
  if (!Array.isArray(data)) return [];
  const outputData = [];
  for (let i of data) {
    outputData.push({
      show: `${i?.name || ""} / ${i?.state?.name || ""}`, // ✅ safe access
      value: i?.id,
    });
  }
  return outputData;
};

export const multiSelectOption = (data, label, value) => {
  const outputData = [];
  for (let i of data) {
    outputData.push({ label: i[label], value: i[value] });
  }
  return outputData;
};

export const multiSelectOptionSelectedApiData = (data) => {
  const outputData = [];
  for (let i of data) {
    outputData.push({ id: i["value"] });
  }
  return outputData;
};
