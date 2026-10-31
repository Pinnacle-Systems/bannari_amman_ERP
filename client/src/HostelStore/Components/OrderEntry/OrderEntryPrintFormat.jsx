import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import Logo from "../../../assets/bannarispintexlogo.jpeg";
import moment from "moment";
import { findFromList, formatCurrencyAmount } from "../../../Utils/helper";
import { numberToWords } from "number-to-words";

// ─── COLOR PALETTE ────────────────────────────────────────────────────────────
const DARK = "#1a1a2e";
const DARK2 = "#2d2d44";
const LIGHT_BG = "#fafafa";
const BORDER = "#000";
const BORDER_LIGHT = "#000";
const BORDER_ROW = "#000";

const styles = StyleSheet.create({
  borderBox: { border: `1 solid #000`, margin: 0, padding: 0 },
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 0,
    paddingBottom: 42,
    backgroundColor: "#fff",
  },

  // ── TOP ACCENT BAR ──
  topBar: { height: 4, backgroundColor: DARK },

  // ── HEADER ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 5,
    borderBottom: `1.5 solid ${DARK}`,
  },
  logo: { height: 44, width: 44 },
  companyCenter: { alignItems: "center", flex: 1 },
  companyName: {
    fontSize: 19,
    fontFamily: "Helvetica-Bold",
    color: "#000",
    letterSpacing: 0.5,
  },
  companyAddress: {
    fontSize: 9.5,
    color: "#000",
    textAlign: "center",
    marginTop: 2,
  },

  titleBand: {
    backgroundColor: DARK,
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 3,
    paddingVertical: 4,
    marginBottom: 5,
  },

  // ── META PILLS ──
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 5,
    gap: 4,
    rowGap: 4,
  },
  metaPill: {
    flexDirection: "row",
    backgroundColor: "#f4f4f6",
    border: `1 solid ${BORDER_LIGHT}`,
    borderLeft: `2 solid ${DARK}`,
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    borderRadius: 2,
  },
  metaLabel: { fontSize: 9.5, color: "#000", marginRight: 2 },
  metaValue: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: "#000" },

  // ── FROM / TO SECTION ──
  twoCol: {
    flexDirection: "row",
    marginHorizontal: 8,
    marginBottom: 5,
    border: `1 solid ${BORDER_LIGHT}`,
    borderRadius: 3,
  },
  colHalf: { flex: 1 },
  sectionHeader: {
    backgroundColor: DARK2,
    color: "#e8e8f0",
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    paddingHorizontal: 10,
    paddingVertical: 3.5,
  },
  sectionBody: { padding: 5 },
  partyName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#000",
    marginBottom: 3,
  },
  partyAddr: {
    fontSize: 9.5,
    color: "#000",
    textTransform: "uppercase",
    marginBottom: 4,
    lineHeight: 1.5,
  },
  partyRow: { flexDirection: "row", marginBottom: 2 },
  partyLabel: { fontSize: 9.5, color: "#000", width: 84 },
  partyValue: { fontSize: 9.5, color: "#000", fontFamily: "Helvetica-Bold" },

  // ── EXPORT DETAILS GRID ──
  exportGrid: {
    marginHorizontal: 8,
    marginBottom: 8,
    border: `1 solid ${BORDER_LIGHT}`,
    borderRadius: 3,
    flexDirection: "row",
    backgroundColor: LIGHT_BG,
  },
  exportCol: { flex: 1, padding: 8, borderRight: `1 solid ${BORDER_LIGHT}` },
  exportItem: { flexDirection: "row", marginBottom: 4 },
  exportLabel: { fontSize: 9.5, color: "#000", width: 98 },
  exportValue: {
    fontSize: 9.5,
    color: "#000",
    fontFamily: "Helvetica-Bold",
    flex: 1,
  },

  // ── TABLE ──
  tableWrap: { marginHorizontal: 8, border: `1 solid ${BORDER}` },
  tableHeader: { flexDirection: "row", backgroundColor: DARK },
  th: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#fff",
    textAlign: "center",
    borderRight: `1 solid #4a4a60`,
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  trOdd: {
    flexDirection: "row",
    borderBottom: `1 solid ${BORDER_ROW}`,
    backgroundColor: "#fff",
  },
  trEven: {
    flexDirection: "row",
    borderBottom: `1 solid ${BORDER_ROW}`,
    backgroundColor: LIGHT_BG,
  },
  td: {
    fontSize: 10.5,
    color: "#000",
    textAlign: "center",
    borderRight: `1 solid ${BORDER_ROW}`,
    paddingVertical: 3,
    paddingHorizontal: 3,
  },

  // ── TOTALS ROW ──
  totalRow: {
    flexDirection: "row",
    marginHorizontal: 8,
    backgroundColor: "#e8e8ec",
    borderLeft: `1 solid ${BORDER}`,
    borderRight: `1 solid ${BORDER}`,
    borderBottom: `1 solid ${BORDER}`,
  },

  // ── BANK + SUMMARY ──
  bankSummaryRow: {
    flexDirection: "row",
    marginHorizontal: 8,
    marginTop: 5,
    gap: 6,
  },
  bankBox: {
    flex: 1,
    border: `1 solid ${BORDER_LIGHT}`,
    borderRadius: 3,
  },
  summaryBox: {
    width: 200,
    border: `1 solid ${BORDER_LIGHT}`,
    borderRadius: 3,
  },
  summaryRow: {
    flexDirection: "row",
    borderBottom: `1 solid ${BORDER_LIGHT}`,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
  },
  summaryLabel: {
    fontSize: 9.5,
    color: "#000",
    textAlign: "right",
    flex: 1,
    fontFamily: "Helvetica-Bold",
  },
  summaryColon: {
    fontSize: 9.5,
    color: "#000",
    width: 10,
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#000",
    textAlign: "right",
    width: 75,
  },

  // ── BOTTOM SECTION ──
  bottomSection: {
    marginHorizontal: 8,
    marginTop: 5,
    flexDirection: "row",
    gap: 6,
  },
  remarksBox: {
    flex: 1,
    border: `1 solid ${BORDER_LIGHT}`,
    borderRadius: 3,
  },
  termsBox: {
    flex: 2,
    border: `1 solid ${BORDER_LIGHT}`,
    borderRadius: 3,
  },

  // ── SIGNATURES ──
  signaturesContainer: {
    position: "absolute",
    bottom: 20,
    left: 8,
    right: 8,
  },
  signaturesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `1 solid ${BORDER_LIGHT}`,
    paddingTop: 3,
  },
  signatureRole: {
    flex: 1,
    textAlign: "center",
    fontSize: 8.5,
    color: "#000",
    fontFamily: "Helvetica-Bold",
  },

  // ── FOOTER ──
  footerBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 8,
    position: "absolute",
    bottom: 5,
    left: 0,
    right: 0,
  },
  footerRight: { fontSize: 8.5, color: "#000", fontFamily: "Helvetica-Bold" },

  // ── AMOUNT IN WORDS ──
  wordsBar: {
    marginHorizontal: 8,
    marginTop: 5,
    backgroundColor: "#fff",
    padding: 4.5,
    border: `1 solid ${BORDER_LIGHT}`,
    borderRadius: 3,
  },
  wordsText: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#000",
  },
  wordsValue: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#000",
  },
});

// ── TABLE COLUMNS ─────────────────────────────────────────────────────────────
const getFabricColumns = () => [
  { label: "S.No", flex: 0.5, align: "center" },
  { label: "Description of Goods", flex: 3.5, align: "center" },
  { label: "HSN", flex: 1.1, align: "center" },
  { label: "K Dia", flex: 1.0, align: "center" },
  { label: "F Dia", flex: 1.0, align: "center" },
  { label: "Uom", flex: 1.0, align: "center" },
  { label: "Qty", flex: 1.2, align: "center" },
  { label: "Price", flex: 1.4, align: "center" },
  { label: "Gross Amount", flex: 1.7, align: "center" },
];

const getYarnColumns = () => [
  { label: "S.No", flex: 0.4, align: "center" },
  { label: "Description of Goods", flex: 3.2, align: "center" },
  { label: "HSN", flex: 1.0, align: "center" },
  { label: "No of Bags", flex: 0.8, align: "center" },
  { label: "Weight per Bag", flex: 1.0, align: "center" },
  { label: "Total Weight", flex: 1.0, align: "center" },
  { label: "Rate per KG", flex: 1.1, align: "center" },
  { label: "Gross Amount", flex: 1.3, align: "center" },
];

const TableHeader = ({ isFabric, currencySymbol }) => {
  const cols = isFabric ? getFabricColumns() : getYarnColumns();
  return (
    <View style={styles.tableHeader}>
      {cols.map(({ label, flex, align }, i) => (
        <Text
          key={label}
          style={[
            styles.th,
            { flex },
            align && { textAlign: align },
            i === cols.length - 1 && { borderRight: "none" },
          ]}
        >
          {label === "Rate per KG" && currencySymbol
            ? `Rate per KG\n(${currencySymbol})`
            : label === "Gross Amount" && currencySymbol
              ? `Gross Amount\n(${currencySymbol})`
              : label}
        </Text>
      ))}
    </View>
  );
};

const ContinuationBar = ({ docId, branchName }) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: DARK,
      paddingHorizontal: 8,
      paddingVertical: 6,
      marginBottom: 2,
    }}
  >
    <Text
      style={{
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        color: "#fff",
        letterSpacing: 2,
      }}
    >
      ORDER ENTRY — Continued
    </Text>
    <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
      Order No: {docId} | {branchName}
    </Text>
  </View>
);

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const OrderEntryPrintFormat = ({
  data,
  taxDetails,
  totals,
  customerDetails,
  branchData,
  isCustomerExport: isExportProp,
  cityList,
  currencyList,
  payTermList,
  bankList,
  carriageFinalAmt,
  uomList,
  sizeList,
  hsnList,
  colorList,
  gsmList,
  designList,
  kDiaList,
  fDiaList,
  loopLengthList,
  gaugeList,
  fabricList,
  yarnList,
}) => {
  if (!data) return null;

  const resolvedTaxDetails = taxDetails || totals;
  const isFabric = (data?.orderGridType || "FABRIC SALES") === "FABRIC SALES";

  const customer = customerDetails || data?.customer || {};
  const branch = branchData || data?.Branch || {};
  const bank = data?.Bank || findFromList(data?.bankId, bankList?.data) || {};

  const isExport =
    isExportProp ??
    customer?.isCustomerExport ??
    data?.customer?.isCustomerExport ??
    false;

  let currencySymbol =
    findFromList(data?.currencyId, currencyList?.data, "symbol") || "Rs.";
  if (currencySymbol.includes("₹"))
    currencySymbol = currencySymbol.replace("₹", "Rs.");
  const currencyCode =
    findFromList(data?.currencyId, currencyList?.data, "code") || "INR";

  // Item rows filtering
  const rawFabricItems = data?.orderFabricItems || [];
  const rawYarnItems = data?.orderYarnItems || [];

  const fabricItems = rawFabricItems.filter(
    (i) => i.fabricId || parseFloat(i.qty) > 0 || parseFloat(i.price) > 0,
  );

  const yarnItems = rawYarnItems.filter(
    (i) =>
      i.yarnId ||
      parseFloat(i.qty) > 0 ||
      parseFloat(i.noOfbags) > 0 ||
      parseFloat(i.price) > 0,
  );

  const allItems = isFabric ? fabricItems : yarnItems;

  // Totals
  const totalRolls = fabricItems.reduce(
    (s, i) => s + (parseFloat(i?.numberOfRolls) || 0),
    0,
  );
  const totalBags = yarnItems.reduce(
    (s, i) => s + (parseFloat(i?.noOfbags) || 0),
    0,
  );
  const totalQty = allItems.reduce((s, i) => s + (parseFloat(i?.qty) || 0), 0);
  const totalPrice = allItems.reduce(
    (s, i) => s + (parseFloat(i?.price) || 0),
    0,
  );
  const totalGross = allItems.reduce(
    (s, i) => s + (parseFloat(i?.amount) || 0),
    0,
  );

  const taxableTotal = parseFloat(resolvedTaxDetails?.taxable || 0);
  const carriageCharge = parseFloat(carriageFinalAmt) || 0;
  const grandTotal = isExport ? taxableTotal + carriageCharge : totalGross;

  const netAmount = parseFloat(resolvedTaxDetails?.net || 0);
  const taxSlabBreakup = (resolvedTaxDetails?.slabBreakup || []).filter(
    (s) => (s?.amount || 0) > 0,
  );

  const consolidatedTaxSlabs = (() => {
    const taxMap = {};
    const others = [];
    taxSlabBreakup.forEach((slab) => {
      const cgstMatch = slab.tax?.match(/^CGST\s+([\d.]+)%$/i);
      const sgstMatch = slab.tax?.match(/^SGST\s+([\d.]+)%$/i);
      const igstMatch = slab.tax?.match(/^IGST\s+([\d.]+)%$/i);

      if (cgstMatch) {
        const rate = parseFloat(cgstMatch[1]);
        const key = `CGST @${rate}%`;
        if (!taxMap[key]) {
          taxMap[key] = { tax: key, amount: 0, type: "CGST", rate };
        }
        taxMap[key].amount += slab.amount;
      } else if (sgstMatch) {
        const rate = parseFloat(sgstMatch[1]);
        const key = `SGST @${rate}%`;
        if (!taxMap[key]) {
          taxMap[key] = { tax: key, amount: 0, type: "SGST", rate };
        }
        taxMap[key].amount += slab.amount;
      } else if (igstMatch) {
        const rate = parseFloat(igstMatch[1]);
        const key = `IGST @${rate}%`;
        if (!taxMap[key]) {
          taxMap[key] = { tax: key, amount: 0, type: "IGST", rate };
        }
        taxMap[key].amount += slab.amount;
      } else {
        others.push(slab);
      }
    });

    const combined = Object.values(taxMap).sort((a, b) => {
      if (a.rate !== b.rate) return a.rate - b.rate;
      return a.type.localeCompare(b.type);
    });
    return [...combined, ...others];
  })();

  const finalAmountForWords = isExport
    ? grandTotal
    : netAmount + carriageCharge;
  const netInt = Math.floor(finalAmountForWords);
  const netDecimal = Math.round((finalAmountForWords - netInt) * 100);

  const getAmountInWords = (intVal, decVal, currCode) => {
    const intWords = numberToWords
      .toWords(intVal || 0)
      .replace(/,/g, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const decWords =
      decVal > 0
        ? numberToWords.toWords(decVal).replace(/\b\w/g, (c) => c.toUpperCase())
        : "Zero";

    const code = (currCode || "").toUpperCase().trim();

    if (code === "USD" || code === "US") {
      return `${intWords} Dollars And ${decWords} Cents Only`;
    } else if (code === "EUR" || code === "EU" || code === "EURO") {
      return `${intWords} Euros And ${decWords} Cents Only`;
    } else {
      return `${intWords} Rupees${decVal > 0 ? ` And ${decWords} Paise` : ""} Only`;
    }
  };

  const amountWords = getAmountInWords(netInt, netDecimal, currencyCode);

  const loadingPort =
    findFromList(data?.loadingId, cityList?.data, "name") || "";
  const deliveryPort =
    findFromList(data?.deliveryId, cityList?.data, "name") || "";

  // Smart pagination
  const pageChunks = (() => {
    if (allItems.length === 0) return [[]];
    const total = allItems.length;
    const p1SingleMax = isFabric ? 3 : 4;
    const p1Max = isFabric ? 5 : 6;
    const pContMax = isFabric ? 10 : 12;
    const lastPageMax = isFabric ? 4 : 5;

    if (total <= p1SingleMax) return [allItems];

    if (total <= p1Max + lastPageMax) {
      let p1Count = Math.min(p1Max, total - 1);
      if (total - p1Count > lastPageMax) {
        p1Count = total - lastPageMax;
      }
      return [allItems.slice(0, p1Count), allItems.slice(p1Count)];
    }

    const pages = [];
    let rem = [...allItems];
    pages.push(rem.splice(0, p1Max));
    while (rem.length > lastPageMax) {
      const take = Math.min(pContMax, rem.length - 1);
      pages.push(rem.splice(0, take));
    }
    if (rem.length > 0) {
      pages.push(rem);
    }
    return pages;
  })();

  const renderChunks = pageChunks.filter(
    (chunk, i) => i === 0 || chunk.length > 0,
  );
  const pageOffsets = renderChunks.reduce((acc, chunk, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + renderChunks[i - 1].length);
    return acc;
  }, []);

  const metaPills = [
    { label: "Order No", value: data?.docId },
    {
      label: "Order Date",
      value: data?.docDate ? moment(data.docDate).format("DD-MM-YYYY") : "",
    },
    { label: "Order Type", value: data?.orderType || "—" },
    {
      label: "Sales Type",
      value: data?.orderGridType || (isFabric ? "FABRIC SALES" : "YARN SALES"),
    },
    ...(data?.orderType === "AGAINSTPI"
      ? [
          {
            label: isFabric ? "Fabric PI No" : "Yarn PI No",
            value: isFabric
              ? data?.ProformaFabric?.docId || data?.fabricPIDocId || "—"
              : data?.ProformaYarn?.docId || data?.yarnPIDocId || "—",
          },
        ]
      : []),
    ...(data?.customerPoNo
      ? [{ label: "Customer PO No", value: data.customerPoNo }]
      : []),
    ...(data?.payTermId
      ? [
          {
            label: "Pay Term",
            value:
              findFromList(data.payTermId, payTermList?.data, "name") || "",
          },
        ]
      : []),
    ...(data?.deliveryDate
      ? [
          {
            label: "Delivery Date",
            value: moment(data.deliveryDate).format("DD-MM-YYYY"),
          },
        ]
      : []),
  ];

  return (
    <Document>
      {renderChunks.map((chunkRows, pageIndex) => {
        const isFirstPage = pageIndex === 0;
        const isLastPage = pageIndex === renderChunks.length - 1;
        const globalOffset = pageOffsets[pageIndex] || 0;

        return (
          <Page key={pageIndex} size="A4" style={styles.borderBox}>
            <View style={styles.page}>
              {isFirstPage ? (
                <>
                  {/* ── HEADER ── */}
                  <View style={styles.header}>
                    <View style={{ width: 60 }}>
                      <Image src={Logo} style={styles.logo} />
                    </View>
                    <View style={styles.companyCenter}>
                      <Text style={styles.companyName}>
                        {branch?.branchName || "BANNARI AMMAN"}
                      </Text>
                      <Text style={styles.companyAddress}>
                        {branch?.address || ""}
                      </Text>
                      <View style={{ flexDirection: "row", gap: 10 }}>
                        <Text style={styles.companyAddress}>
                          GSTIN : {branch?.gstNo || ""}
                        </Text>
                        <Text style={styles.companyAddress}>
                          PAN : {branch?.panNo || ""}
                        </Text>
                        <Text style={styles.companyAddress}>
                          {branch?.udyam || ""}
                        </Text>
                      </View>
                      {branch?.contactEmail ? (
                        <Text
                          style={{ fontSize: 9.5, color: "#000", marginTop: 1 }}
                        >
                          {branch.contactEmail}
                          {branch?.contactMobile
                            ? `  |  ${branch.contactMobile}`
                            : ""}
                          {branch?.telephone ? `  |  ${branch.telephone}` : ""}
                        </Text>
                      ) : null}
                    </View>

                    <View style={{ width: 60 }} />
                  </View>

                  {/* TITLE BAND */}
                  <Text style={styles.titleBand}>ORDER ENTRY</Text>

                  {/* INTRO TEXT */}
                  <View
                    style={{
                      marginHorizontal: 8,
                      marginBottom: 5,
                      backgroundColor: "#fff",
                      border: `1 solid ${BORDER_LIGHT}`,
                      borderRadius: 3,
                      paddingVertical: 5,
                      paddingHorizontal: 7,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10.5,
                        color: "#000",
                        marginBottom: 2,
                      }}
                    >
                      Herewith we are confirming the order for the following
                      items. If you have any questions about this order, please
                      contact us.
                    </Text>
                  </View>

                  {/* META PILLS */}
                  <View style={styles.metaRow}>
                    {metaPills.map(({ label, value, valueColor }) => (
                      <View key={label} style={styles.metaPill}>
                        <Text
                          style={[
                            styles.metaLabel,
                            valueColor ? { color: valueColor } : {},
                          ]}
                        >
                          {label}:
                        </Text>
                        <Text
                          style={[
                            styles.metaValue,
                            valueColor ? { color: valueColor } : {},
                          ]}
                        >
                          {value}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* FROM / TO */}
                  <View style={styles.twoCol}>
                    <View
                      style={[
                        styles.colHalf,
                        { borderRight: `1 solid ${BORDER_LIGHT}` },
                      ]}
                    >
                      <Text style={styles.sectionHeader}>Bill TO</Text>
                      <View style={styles.sectionBody}>
                        <Text style={styles.partyName}>
                          {customer?.name || "N/A"}
                        </Text>
                        <Text style={styles.partyAddr}>
                          {customer?.address || ""}
                        </Text>
                        {[
                          {
                            label: "Contact Person",
                            value: customer?.contactPersonName,
                          },
                          {
                            label: "Mobile No",
                            value: customer?.contactNumber,
                          },
                          { label: "GST No", value: customer?.gstNo },
                          {
                            label: "Email",
                            value: customer?.contactPersonEmail,
                          },
                        ].map(({ label, value }) =>
                          value ? (
                            <View key={label} style={styles.partyRow}>
                              <Text style={styles.partyLabel}>{label}</Text>
                              <Text style={styles.partyValue}>: {value}</Text>
                            </View>
                          ) : null,
                        )}
                      </View>
                    </View>
                    <View style={styles.colHalf}>
                      <Text style={styles.sectionHeader}>Ship To</Text>
                      <View style={styles.sectionBody}>
                        <Text style={styles.partyName}>
                          {customer?.name || "N/A"}
                        </Text>
                        <Text style={styles.partyAddr}>
                          {customer?.address || ""}
                        </Text>
                        {[
                          {
                            label: "Contact Person",
                            value: customer?.contactPersonName,
                          },
                          {
                            label: "Mobile No",
                            value: customer?.contactNumber,
                          },
                          { label: "GST No", value: customer?.gstNo },
                          {
                            label: "Email",
                            value: customer?.contactPersonEmail,
                          },
                        ].map(({ label, value }) =>
                          value ? (
                            <View key={label} style={styles.partyRow}>
                              <Text style={styles.partyLabel}>{label}</Text>
                              <Text style={styles.partyValue}>: {value}</Text>
                            </View>
                          ) : null,
                        )}
                      </View>
                    </View>
                  </View>

                  {/* EXPORT DETAILS GRID */}
                  {isExport && (
                    <View style={styles.exportGrid}>
                      <View style={styles.exportCol}>
                        <View style={styles.exportItem}>
                          <Text style={styles.exportLabel}>
                            Country of Origin
                          </Text>
                          <Text style={styles.exportValue}>: INDIA</Text>
                        </View>
                        <View style={styles.exportItem}>
                          <Text style={styles.exportLabel}>
                            Port of Loading
                          </Text>
                          <Text style={styles.exportValue}>
                            : {loadingPort || "—"}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.exportCol, { borderRight: "none" }]}>
                        <View style={styles.exportItem}>
                          <Text style={styles.exportLabel}>
                            Port of Delivery
                          </Text>
                          <Text style={styles.exportValue}>
                            : {deliveryPort || "—"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </>
              ) : (
                <ContinuationBar
                  docId={data?.docId}
                  branchName={branch?.branchName || ""}
                />
              )}

              {/* ── TABLE (CONDITIONALLY RENDER FABRIC OR YARN) ── */}
              <View style={styles.tableWrap}>
                <TableHeader
                  isFabric={isFabric}
                  currencySymbol={currencySymbol}
                />

                {/* Item rows */}
                {chunkRows.map((row, index) => {
                  const rowStyle =
                    index % 2 === 0 ? styles.trOdd : styles.trEven;
                  const gross = parseFloat(row.amount) || 0;
                  const colorName = findFromList(
                    row?.colorId,
                    colorList?.data,
                    "name",
                  );

                  if (isFabric) {
                    const designName = findFromList(
                      row?.designId,
                      designList?.data,
                      "name",
                    );
                    const gaugeName = findFromList(
                      row?.gaugeId,
                      gaugeList?.data,
                      "name",
                    );
                    const loopLengthName = findFromList(
                      row?.loopLengthId,
                      loopLengthList?.data,
                      "name",
                    );
                    const gsm = findFromList(row?.gsmId, gsmList?.data, "name");

                    return (
                      <View key={globalOffset + index} style={rowStyle}>
                        <View
                          style={[
                            styles.td,
                            { flex: 0.5, justifyContent: "center" },
                          ]}
                        >
                          <Text
                            style={{
                              fontSize: 10.5,
                              color: "#000",
                              textAlign: "center",
                              width: "100%",
                            }}
                          >
                            {globalOffset + index + 1}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.td,
                            {
                              flex: 3.5,
                              flexDirection: "column",
                              alignItems: "flex-start",
                              justifyContent: "center",
                            },
                          ]}
                        >
                          <Text
                            style={{
                              textAlign: "left",
                              fontFamily: "Helvetica-Bold",
                              fontSize: 10.5,
                              color: "#000",
                            }}
                          >
                            {findFromList(
                              row?.fabricId,
                              fabricList?.data,
                              "name",
                            )}
                          </Text>
                          {colorName || designName ? (
                            <Text
                              style={{
                                textAlign: "left",
                                marginTop: 2,
                                fontFamily: "Helvetica-Bold",
                                fontSize: 10.5,
                                color: "#000",
                              }}
                            >
                              Color: {colorName || "—"} | Design :{" "}
                              {designName || "—"}
                            </Text>
                          ) : null}
                          {gaugeName || loopLengthName || gsm ? (
                            <Text
                              style={{
                                textAlign: "left",
                                marginTop: 2,
                                fontFamily: "Helvetica-Bold",
                                fontSize: 10.5,
                                color: "#000",
                              }}
                            >
                              Gauge: {gaugeName || "—"} | Loop Length :{" "}
                              {loopLengthName || "—"} | Gsm : {gsm || "—"}
                            </Text>
                          ) : null}
                        </View>

                        <View
                          style={[
                            styles.td,
                            { flex: 1.1, justifyContent: "center" },
                          ]}
                        >
                          <Text
                            style={{
                              fontFamily: "Helvetica-Bold",
                              fontSize: 10.5,
                              color: "#000",
                              textAlign: "center",
                              width: "100%",
                            }}
                          >
                            {findFromList(row?.hsnId, hsnList?.data, "name")}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.td,
                            { flex: 1.0, justifyContent: "center" },
                          ]}
                        >
                          <Text
                            style={{
                              fontFamily: "Helvetica-Bold",
                              fontSize: 10.5,
                              color: "#000",
                              textAlign: "left",
                              width: "100%",
                            }}
                          >
                            {findFromList(row?.kDiaId, kDiaList, "name")}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.td,
                            { flex: 1.0, justifyContent: "center" },
                          ]}
                        >
                          <Text
                            style={{
                              fontFamily: "Helvetica-Bold",
                              fontSize: 10.5,
                              color: "#000",
                              textAlign: "left",
                              width: "100%",
                            }}
                          >
                            {findFromList(row?.fDiaId, fDiaList, "name")}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.td,
                            { flex: 1.0, justifyContent: "center" },
                          ]}
                        >
                          <Text
                            style={{
                              fontFamily: "Helvetica-Bold",
                              fontSize: 10.5,
                              color: "#000",
                              textAlign: "left",
                              width: "100%",
                            }}
                          >
                            {findFromList(row?.uomId, uomList, "name")}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.td,
                            { flex: 1.2, justifyContent: "center" },
                          ]}
                        >
                          <Text
                            style={{
                              fontFamily: "Helvetica-Bold",
                              fontSize: 10.5,
                              color: "#000",
                              textAlign: "right",
                              width: "100%",
                            }}
                          >
                            {row.qty ? parseFloat(row.qty).toFixed(3) : ""}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.td,
                            { flex: 1.4, justifyContent: "center" },
                          ]}
                        >
                          <Text
                            style={{
                              fontFamily: "Helvetica-Bold",
                              fontSize: 10.5,
                              color: "#000",
                              textAlign: "right",
                              width: "100%",
                            }}
                          >
                            {row.price
                              ? `${currencySymbol} ${formatCurrencyAmount(row.price, currencyCode || currencySymbol)}`
                              : ""}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.td,
                            {
                              flex: 1.7,
                              justifyContent: "center",
                              borderRight: "none",
                            },
                          ]}
                        >
                          <Text
                            style={{
                              fontFamily: "Helvetica-Bold",
                              fontSize: 10.5,
                              color: "#000",
                              textAlign: "right",
                              width: "100%",
                            }}
                          >
                            {gross
                              ? `${currencySymbol} ${formatCurrencyAmount(gross, currencyCode || currencySymbol)}`
                              : ""}
                          </Text>
                        </View>
                      </View>
                    );
                  }

                  // Yarn row
                  return (
                    <View key={globalOffset + index} style={rowStyle}>
                      <View
                        style={[
                          styles.td,
                          { flex: 0.4, justifyContent: "center" },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 10.5,
                            color: "#000",
                            textAlign: "center",
                            width: "100%",
                          }}
                        >
                          {globalOffset + index + 1}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.td,
                          {
                            flex: 3.2,
                            flexDirection: "column",
                            alignItems: "flex-start",
                            justifyContent: "center",
                          },
                        ]}
                      >
                        <Text
                          style={{
                            textAlign: "left",
                            fontFamily: "Helvetica-Bold",
                            fontSize: 10.5,
                            color: "#000",
                          }}
                        >
                          {findFromList(row?.yarnId, yarnList?.data, "name")}
                        </Text>
                        {colorName ? (
                          <Text
                            style={{
                              textAlign: "left",
                              marginTop: 2,
                              fontFamily: "Helvetica-Bold",
                              fontSize: 10.5,
                              color: "#000",
                            }}
                          >
                            Color: {colorName}
                          </Text>
                        ) : null}
                      </View>
                      <View
                        style={[
                          styles.td,
                          { flex: 1.0, justifyContent: "center" },
                        ]}
                      >
                        <Text
                          style={{
                            fontFamily: "Helvetica-Bold",
                            fontSize: 10.5,
                            color: "#000",
                            textAlign: "center",
                            width: "100%",
                          }}
                        >
                          {findFromList(row?.hsnId, hsnList?.data, "name")}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.td,
                          { flex: 0.8, justifyContent: "center" },
                        ]}
                      >
                        <Text
                          style={{
                            fontFamily: "Helvetica-Bold",
                            fontSize: 10.5,
                            color: "#000",
                            textAlign: "right",
                            width: "100%",
                          }}
                        >
                          {row?.noOfbags || ""}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.td,
                          { flex: 1.0, justifyContent: "center" },
                        ]}
                      >
                        <Text
                          style={{
                            fontFamily: "Helvetica-Bold",
                            fontSize: 10.5,
                            color: "#000",
                            textAlign: "right",
                            width: "100%",
                          }}
                        >
                          {row.weightPerBag
                            ? parseFloat(row.weightPerBag).toFixed(3)
                            : ""}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.td,
                          { flex: 1.0, justifyContent: "center" },
                        ]}
                      >
                        <Text
                          style={{
                            fontFamily: "Helvetica-Bold",
                            fontSize: 10.5,
                            color: "#000",
                            textAlign: "right",
                            width: "100%",
                          }}
                        >
                          {row.qty ? parseFloat(row.qty).toFixed(3) : ""}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.td,
                          { flex: 1.1, justifyContent: "center" },
                        ]}
                      >
                        <Text
                          style={{
                            fontFamily: "Helvetica-Bold",
                            fontSize: 10.5,
                            color: "#000",
                            textAlign: "right",
                            width: "100%",
                          }}
                        >
                          {row.price
                            ? `${currencySymbol} ${formatCurrencyAmount(row.price, currencyCode || currencySymbol)}`
                            : ""}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.td,
                          {
                            flex: 1.3,
                            justifyContent: "center",
                            borderRight: "none",
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontFamily: "Helvetica-Bold",
                            fontSize: 10.5,
                            color: "#000",
                            textAlign: "right",
                            width: "100%",
                          }}
                        >
                          {gross
                            ? `${currencySymbol} ${formatCurrencyAmount(gross, currencyCode || currencySymbol)}`
                            : ""}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* ── TOTALS ROW (LAST PAGE ONLY) ── */}
              {isLastPage && (
                <>
                  {isFabric ? (
                    <View style={styles.totalRow}>
                      <Text
                        style={[styles.td, { flex: 0.5, color: "transparent" }]}
                      >
                        {" "}
                      </Text>
                      <Text
                        style={[
                          styles.td,
                          {
                            flex: 3.5,
                            fontFamily: "Helvetica-Bold",
                            color: "#000",
                            textAlign: "right",
                          },
                        ]}
                      >
                        TOTAL
                      </Text>
                      <Text
                        style={[styles.td, { flex: 1.1, color: "transparent" }]}
                      >
                        {" "}
                      </Text>
                      <Text
                        style={[styles.td, { flex: 1.0, color: "transparent" }]}
                      >
                        {" "}
                      </Text>
                      <Text
                        style={[styles.td, { flex: 1.0, color: "transparent" }]}
                      >
                        {" "}
                      </Text>
                      <Text
                        style={[
                          styles.td,
                          {
                            flex: 1.0,
                            fontFamily: "Helvetica-Bold",
                            color: "#000",
                            textAlign: "right",
                          },
                        ]}
                      >
                        {totalRolls > 0 ? totalRolls : ""}
                      </Text>
                      <Text
                        style={[
                          styles.td,
                          {
                            flex: 1.2,
                            fontFamily: "Helvetica-Bold",
                            color: "#000",
                            textAlign: "right",
                          },
                        ]}
                      >
                        {totalQty > 0 ? totalQty.toFixed(3) : ""}
                      </Text>
                      <Text
                        style={[
                          styles.td,
                          {
                            flex: 1.4,
                            fontFamily: "Helvetica-Bold",
                            color: "#000",
                            textAlign: "right",
                          },
                        ]}
                      >
                        {totalPrice > 0
                          ? `${currencySymbol} ${formatCurrencyAmount(
                              totalPrice,
                              currencyCode || currencySymbol,
                            )}`
                          : ""}
                      </Text>
                      <Text
                        style={[
                          styles.td,
                          {
                            flex: 1.7,
                            fontFamily: "Helvetica-Bold",
                            color: "#000",
                            textAlign: "right",
                            borderRight: "none",
                          },
                        ]}
                      >
                        {currencySymbol}{" "}
                        {formatCurrencyAmount(
                          totalGross,
                          currencyCode || currencySymbol,
                        )}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.totalRow}>
                      <Text
                        style={[styles.td, { flex: 0.4, color: "transparent" }]}
                      >
                        {" "}
                      </Text>
                      <Text
                        style={[
                          styles.td,
                          {
                            flex: 3.2,
                            fontFamily: "Helvetica-Bold",
                            color: "#000",
                            textAlign: "right",
                          },
                        ]}
                      >
                        TOTAL
                      </Text>
                      <Text
                        style={[styles.td, { flex: 1.0, color: "transparent" }]}
                      >
                        {" "}
                      </Text>
                      <Text
                        style={[
                          styles.td,
                          {
                            flex: 0.8,
                            fontFamily: "Helvetica-Bold",
                            color: "#000",
                            textAlign: "right",
                          },
                        ]}
                      >
                        {totalBags > 0 ? totalBags : ""}
                      </Text>
                      <Text
                        style={[styles.td, { flex: 1.0, color: "transparent" }]}
                      >
                        {" "}
                      </Text>
                      <Text
                        style={[
                          styles.td,
                          {
                            flex: 1.0,
                            fontFamily: "Helvetica-Bold",
                            color: "#000",
                            textAlign: "right",
                          },
                        ]}
                      >
                        {totalQty > 0 ? totalQty.toFixed(3) : ""}
                      </Text>
                      <Text
                        style={[
                          styles.td,
                          {
                            flex: 1.1,
                            fontFamily: "Helvetica-Bold",
                            color: "#000",
                            textAlign: "right",
                          },
                        ]}
                      >
                        {totalPrice > 0
                          ? `${currencySymbol} ${formatCurrencyAmount(
                              totalPrice,
                              currencyCode || currencySymbol,
                            )}`
                          : ""}
                      </Text>
                      <Text
                        style={[
                          styles.td,
                          {
                            flex: 1.3,
                            fontFamily: "Helvetica-Bold",
                            color: "#000",
                            textAlign: "right",
                            borderRight: "none",
                          },
                        ]}
                      >
                        {currencySymbol}{" "}
                        {formatCurrencyAmount(
                          totalGross,
                          currencyCode || currencySymbol,
                        )}
                      </Text>
                    </View>
                  )}

                  {/* ── BOTTOM SECTION: REQUIREMENTS, TERMS, REMARKS, SUMMARY ── */}
                  <View style={styles.bankSummaryRow} wrap={false}>
                    {/* LEFT SIDE: REQUIREMENTS, TERMS & REMARKS */}
                    <View style={{ flex: 1, flexDirection: "column", gap: 8 }}>
                      {/* CUSTOMER REQUIREMENTS */}
                      {data?.requirements ? (
                        <View
                          style={{
                            border: `1 solid ${BORDER_LIGHT}`,
                            borderRadius: 3,
                          }}
                        >
                          <Text style={styles.sectionHeader}>
                            CUSTOMER REQUIREMENTS
                          </Text>
                          <View style={styles.sectionBody}>
                            <Text
                              style={{
                                fontSize: 9.5,
                                color: "#000",
                                lineHeight: 1.5,
                              }}
                            >
                              {data.requirements}
                            </Text>
                          </View>
                        </View>
                      ) : null}

                      {/* TERMS & CONDITIONS */}
                      {data?.termsAndCondition ? (
                        <View
                          style={{
                            border: `1 solid ${BORDER_LIGHT}`,
                            borderRadius: 3,
                          }}
                        >
                          <Text style={styles.sectionHeader}>
                            TERMS &amp; CONDITIONS
                          </Text>
                          <View style={styles.sectionBody}>
                            <Text
                              style={{
                                fontSize: 9.5,
                                color: "#000",
                                lineHeight: 1.5,
                              }}
                            >
                              {data.termsAndCondition}
                            </Text>
                          </View>
                        </View>
                      ) : null}

                      {/* REMARKS */}
                      {data?.remarks ? (
                        <View
                          style={{
                            border: `1 solid ${BORDER_LIGHT}`,
                            borderRadius: 3,
                          }}
                        >
                          <Text style={styles.sectionHeader}>REMARKS</Text>
                          <View style={styles.sectionBody}>
                            <Text style={{ fontSize: 9.5, color: "#000" }}>
                              {data.remarks}
                            </Text>
                          </View>
                        </View>
                      ) : null}
                    </View>

                    {/* RIGHT SIDE: SUMMARY */}
                    <View
                      style={{
                        width: "45%",
                        border: `1 solid ${BORDER_LIGHT}`,
                        borderRadius: 3,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Text
                        style={[
                          styles.sectionHeader,
                          { textAlign: "center", fontSize: 9.5 },
                        ]}
                      >
                        SUMMARY
                      </Text>

                      {(resolvedTaxDetails?.itemDiscount > 0 ||
                        resolvedTaxDetails?.overallDiscount > 0) && (
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>
                            Total Discount
                          </Text>
                          <Text style={styles.summaryColon}>:</Text>
                          <Text style={styles.summaryValue}>
                            {currencySymbol}{" "}
                            {formatCurrencyAmount(
                              (resolvedTaxDetails?.itemDiscount || 0) +
                                (resolvedTaxDetails?.overallDiscount || 0),
                              currencyCode || currencySymbol,
                            )}
                          </Text>
                        </View>
                      )}

                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Taxable Amount</Text>
                        <Text style={styles.summaryColon}>:</Text>
                        <Text style={styles.summaryValue}>
                          {currencySymbol}{" "}
                          {formatCurrencyAmount(
                            taxableTotal,
                            currencyCode || currencySymbol,
                          )}
                        </Text>
                      </View>

                      {!isExport &&
                        consolidatedTaxSlabs.map((slab) => (
                          <View key={slab.tax} style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{slab.tax}</Text>
                            <Text style={styles.summaryColon}>:</Text>
                            <Text style={styles.summaryValue}>
                              {currencySymbol}{" "}
                              {formatCurrencyAmount(
                                slab.amount || 0,
                                currencyCode || currencySymbol,
                              )}
                            </Text>
                          </View>
                        ))}
                      {!isExport &&
                        parseFloat(resolvedTaxDetails?.roundOff || 0) !== 0 && (
                          <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Round Off</Text>
                            <Text style={styles.summaryColon}>:</Text>
                            <Text style={styles.summaryValue}>
                              {currencySymbol}{" "}
                              {formatCurrencyAmount(
                                resolvedTaxDetails?.roundOff || 0,
                                currencyCode || currencySymbol,
                              )}
                            </Text>
                          </View>
                        )}

                      {!isExport && (
                        <View style={styles.summaryRow}>
                          <Text
                            style={[
                              styles.summaryLabel,
                              { fontFamily: "Helvetica-Bold" },
                            ]}
                          >
                            Total Amount
                          </Text>
                          <Text style={styles.summaryColon}>:</Text>
                          <Text
                            style={[
                              styles.summaryValue,
                              { fontFamily: "Helvetica-Bold" },
                            ]}
                          >
                            {currencySymbol}{" "}
                            {formatCurrencyAmount(
                              netAmount,
                              currencyCode || currencySymbol,
                            )}
                          </Text>
                        </View>
                      )}

                      {carriageCharge > 0 && (
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>
                            Carriage Charges
                          </Text>
                          <Text style={styles.summaryColon}>:</Text>
                          <Text style={styles.summaryValue}>
                            {currencySymbol}{" "}
                            {formatCurrencyAmount(
                              carriageCharge,
                              currencyCode || currencySymbol,
                            )}
                          </Text>
                        </View>
                      )}

                      <View
                        style={[
                          styles.summaryRow,
                          {
                            backgroundColor: DARK,
                            borderBottom: "none",
                            borderRadius: 2,
                            marginTop: "auto",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.summaryLabel,
                            { color: "#fff", fontFamily: "Helvetica-Bold" },
                          ]}
                        >
                          Net Amount
                        </Text>
                        <Text
                          style={[
                            styles.summaryColon,
                            { color: "#fff", fontFamily: "Helvetica-Bold" },
                          ]}
                        >
                          :
                        </Text>
                        <Text style={[styles.summaryValue, { color: "#fff" }]}>
                          {currencySymbol}{" "}
                          {formatCurrencyAmount(
                            isExport ? grandTotal : netAmount + carriageCharge,
                            currencyCode || currencySymbol,
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* ── AMOUNT IN WORDS ── */}
                  <View style={styles.wordsBar}>
                    <Text style={styles.wordsText}>
                      Amount in Words ({(currencyCode || currencySymbol).trim()}
                      ): <Text style={styles.wordsValue}>{amountWords}</Text>
                    </Text>
                  </View>

                  {/* ── BANK DETAILS ── */}
                  <View
                    style={{
                      marginHorizontal: 8,
                      marginTop: 5,
                      border: `1 solid ${BORDER_LIGHT}`,
                      borderRadius: 3,
                      padding: 5,
                      backgroundColor: "#fff",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10.5,
                        fontFamily: "Helvetica-Bold",
                        color: "#000",
                        marginBottom: 4,
                      }}
                    >
                      Bank Details
                    </Text>
                    <View style={{ flexDirection: "row", marginBottom: 2 }}>
                      <Text
                        style={{
                          width: 95,
                          fontSize: 10.5,
                          color: "#000",
                          fontFamily: "Helvetica-Bold",
                        }}
                      >
                        Account Name
                      </Text>
                      <Text
                        style={{
                          fontSize: 10.5,
                          color: "#000",
                          fontFamily: "Helvetica-Bold",
                        }}
                      >
                        : {bank?.bankHolderName || data?.bankHolderName || "-"}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", marginBottom: 2 }}>
                      <Text
                        style={{
                          width: 95,
                          fontSize: 10.5,
                          color: "#000",
                          fontFamily: "Helvetica-Bold",
                        }}
                      >
                        Bank Name
                      </Text>
                      <Text
                        style={{
                          fontSize: 10.5,
                          color: "#000",
                          fontFamily: "Helvetica-Bold",
                        }}
                      >
                        : {bank?.name || data?.name || "-"}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", marginBottom: 2 }}>
                      <Text
                        style={{
                          width: 95,
                          fontSize: 10.5,
                          color: "#000",
                          fontFamily: "Helvetica-Bold",
                        }}
                      >
                        Account No.
                      </Text>
                      <Text
                        style={{
                          fontSize: 10.5,
                          color: "#000",
                          fontFamily: "Helvetica-Bold",
                        }}
                      >
                        : {bank?.accNo || data?.accNo || "-"}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", marginBottom: 2 }}>
                      <Text
                        style={{
                          width: 95,
                          fontSize: 10.5,
                          color: "#000",
                          fontFamily: "Helvetica-Bold",
                        }}
                      >
                        Branch Name
                      </Text>
                      <Text
                        style={{
                          fontSize: 10.5,
                          color: "#000",
                          fontFamily: "Helvetica-Bold",
                        }}
                      >
                        : {bank?.Branch?.name || data?.Branch?.name || "-"}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                      <Text
                        style={{
                          width: 95,
                          fontSize: 10.5,
                          color: "#000",
                          fontFamily: "Helvetica-Bold",
                        }}
                      >
                        IFSC Code
                      </Text>
                      <Text
                        style={{
                          fontSize: 10.5,
                          color: "#000",
                          fontFamily: "Helvetica-Bold",
                        }}
                      >
                        : {bank?.ifsc || data?.ifsc || "-"}
                      </Text>
                    </View>
                  </View>

                  <View style={{ height: 18 }} />
                </>
              )}

              {/* ── SUB-TOTAL (non-last pages) ── */}
              {!isLastPage && (
                <View
                  style={{
                    flexDirection: "row",
                    marginHorizontal: 8,
                    backgroundColor: "#f4f4f6",
                    borderLeft: `1 solid ${BORDER}`,
                    borderRight: `1 solid ${BORDER}`,
                    borderBottom: `1 solid ${BORDER}`,
                  }}
                >
                  <Text
                    style={[
                      styles.td,
                      {
                        flex: isFabric ? 10.7 : 9.5,
                        color: "#000",
                        fontStyle: "italic",
                        textAlign: "right",
                      },
                    ]}
                  >
                    Sub Total (Continued on next page...)
                  </Text>
                  <Text
                    style={[
                      styles.td,
                      {
                        flex: isFabric ? 1.7 : 1.3,
                        fontFamily: "Helvetica-Bold",
                        color: "#000",
                        textAlign: "right",
                        borderRight: "none",
                      },
                    ]}
                  >
                    {currencySymbol}{" "}
                    {formatCurrencyAmount(
                      chunkRows.reduce(
                        (s, r) => s + (parseFloat(r.amount) || 0),
                        0,
                      ),
                      currencyCode || currencySymbol,
                    )}
                  </Text>
                </View>
              )}
            </View>

            {/* SIGNATURES — pinned cleanly above footer bar on the LAST page */}
            <View style={styles.signaturesContainer} fixed>
              <View
                render={({ pageNumber, totalPages }) => {
                  if (pageNumber === totalPages) {
                    return (
                      <View style={styles.signaturesRow}>
                        {[
                          "Prepared By",
                          "Checked By",
                          "Approved By",
                          "Customer Sign",
                        ].map((role) => (
                          <Text key={role} style={styles.signatureRole}>
                            {role}
                          </Text>
                        ))}
                      </View>
                    );
                  }
                  return null;
                }}
              />
            </View>

            {/* FOOTER BAR */}
            <View style={styles.footerBar} fixed>
              <Text
                style={styles.footerRight}
                render={({ pageNumber, totalPages }) =>
                  `Page ${pageNumber} of ${totalPages}`
                }
              />
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

export default OrderEntryPrintFormat;
