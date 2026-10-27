export function calculateTaxWithHSNBreakupAndInsertIntoPoItems(
  poItems = [],
  isSupplierOutside = false,
  discountType,
  discountValue,
  isDozen = false,
  qtyField = "qty",
  deliveryTaxValue,
  deliveryTaxType
) {
  let roundTo = 2;

  const result = {
    gross: 0,
    itemDiscount: 0,
    overallDiscount: 0,
    taxable: 0,
    roundOff: 0,
    net: 0,
    slabBreakup: [],
    hsnBreakup: {},
  };

  const slabMap = {};
  const hsnMap = {};

  const items = poItems.map((item) => ({ ...item }));

  // ---- Step 1: Base item calc ----
  items?.forEach((item) => {
    const qty = Number(item?.[qtyField]) || 0;
    const dozen = Number(item?.dozen) || 0;
    const price = Number(item?.price) || 0;
    const taxPct = Number(item?.taxPercent) || 0;
    const discountVal = Number(item?.discountValue ?? item?.discountvalue) || 0;
    const dType = item?.discountType || item?.discounttype || "Flat";
    const hsn = item?.hsn || "NA";

    const gross = isDozen ? dozen * price : qty * price;

    const itemDiscount = dType === "Flat" ? discountVal : (gross * discountVal) / 100;

    const taxableBeforeOverall = gross - itemDiscount;

    // 👉 Attach base values directly into poItems
    item._gross = gross;
    item._itemDiscount = itemDiscount;
    item._taxableBeforeOverall = taxableBeforeOverall;
    item._hsn = hsn;
    item._taxPct = taxPct;
  });

  const totalTaxableBeforeOverall = items.reduce(
    (s, i) => s + (Number(i._taxableBeforeOverall) || 0),
    0,
  );

  // ---- Step 2: Overall discount ----
  let overallDiscount = 0;
  const numDiscountValue = Number(discountValue) || 0;
  if (discountType === "Flat") {
    overallDiscount = numDiscountValue;
  } else if (discountType === "Percentage" || discountType === "%") {
    overallDiscount = (totalTaxableBeforeOverall * numDiscountValue) / 100;
  } else if (numDiscountValue > 0) {
    overallDiscount = (totalTaxableBeforeOverall * numDiscountValue) / 100;
  } else {
    overallDiscount = 0;
  }

  overallDiscount = Math.max(0, Math.min(overallDiscount || 0, totalTaxableBeforeOverall || 0));

  // ---- Step 3: Apply overall + GST per item ----
  items.forEach((item) => {
    const ratio =
      totalTaxableBeforeOverall === 0
        ? 0
        : item._taxableBeforeOverall / totalTaxableBeforeOverall;

    const overallShare = (overallDiscount * ratio) || 0;
    const finalTaxable = Math.max(0, (item._taxableBeforeOverall - overallShare) || 0);

    let cgst = 0,
      sgst = 0,
      igst = 0;
    const taxType = item.taxType || (isSupplierOutside ? "IGST" : "CGST_SGST");
    if (taxType === "IGST") {
      igst = ((finalTaxable * item._taxPct) / 100) || 0;
    } else {
      const half = item._taxPct / 2;
      cgst = ((finalTaxable * half) / 100) || 0;
      sgst = ((finalTaxable * half) / 100) || 0;
    }

    let net = finalTaxable + cgst + sgst + igst;

    // 👉 INSERT totals INTO poItems
    item.totals = {
      gross: +(Number(item._gross) || 0).toFixed(roundTo),
      itemDiscount: +(Number(item._itemDiscount) || 0).toFixed(roundTo),
      overallDiscountShare: +(Number(overallShare) || 0).toFixed(roundTo),
      taxable: +(Number(finalTaxable) || 0).toFixed(roundTo),
      cgst: +(Number(cgst) || 0).toFixed(roundTo),
      sgst: +(Number(sgst) || 0).toFixed(roundTo),
      igst: +(Number(igst) || 0).toFixed(roundTo),
      net: +(Number(net) || 0).toFixed(roundTo),
    };

    // ---- Global + slab + hsn ----
    result.gross += item._gross || 0;
    result.itemDiscount += item._itemDiscount || 0;
    result.overallDiscount += overallShare || 0;
    result.taxable += finalTaxable || 0;

    if (taxType === "IGST") {
      const key = `IGST_${item._taxPct}`;
      slabMap[key] = (slabMap[key] || 0) + (igst || 0);

      hsnMap[item._hsn] = hsnMap[item._hsn] || {};
      hsnMap[item._hsn][key] = (hsnMap[item._hsn][key] || 0) + (igst || 0);
    } else {
      const half = item._taxPct / 2;
      const cgstKey = `CGST_${half}`;
      const sgstKey = `SGST_${half}`;

      slabMap[cgstKey] = (slabMap[cgstKey] || 0) + (cgst || 0);
      slabMap[sgstKey] = (slabMap[sgstKey] || 0) + (sgst || 0);

      hsnMap[item._hsn] = hsnMap[item._hsn] || {};
      hsnMap[item._hsn][cgstKey] = (hsnMap[item._hsn][cgstKey] || 0) + (cgst || 0);
      hsnMap[item._hsn][sgstKey] = (hsnMap[item._hsn][sgstKey] || 0) + (sgst || 0);
    }
  });

  // ---- Step 4: Build breakups ----
  result.slabBreakup = Object.entries(slabMap).map(([key, amt]) => {
    const [type, pct] = key.split("_");
    return { tax: `${type} ${pct}%`, amount: +(Number(amt) || 0).toFixed(roundTo) };
  });

  Object.keys(hsnMap).forEach((hsn) => {
    result.hsnBreakup[hsn] = Object.entries(hsnMap[hsn]).map(([key, amt]) => {
      const [type, pct] = key.split("_");
      return { tax: `${type} ${pct}%`, amount: +(Number(amt) || 0).toFixed(roundTo) };
    });
  });

  const totalTax = result.slabBreakup.reduce((s, b) => s + (Number(b.amount) || 0), 0);
  let totalBeforeRound = (Number(result.taxable) || 0) + totalTax;

  if (deliveryTaxType) {
    const numDelTaxVal = Number(deliveryTaxValue) || 0;
    if (deliveryTaxType === "Flat") {
      totalBeforeRound += numDelTaxVal;
    } else {
      totalBeforeRound += (totalBeforeRound * numDelTaxVal) / 100;
    }
  }

  const roundedNet = Math.round(totalBeforeRound) || 0;
  result.roundOff = +((roundedNet - totalBeforeRound) || 0).toFixed(roundTo);
  result.net = roundedNet;

  ["gross", "itemDiscount", "overallDiscount", "taxable"].forEach((k) => {
    result[k] = +(Number(result[k]) || 0).toFixed(roundTo);
  });

  return { ...result, items };
}
