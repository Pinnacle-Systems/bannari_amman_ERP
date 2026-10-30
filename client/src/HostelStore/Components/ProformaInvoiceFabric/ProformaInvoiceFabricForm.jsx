import React, { useEffect, useState, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import {
  TextInput,
  DropdownInput,
  DateInputNew,
  ReusableInput,
} from "../../../Inputs/index.js";
import {
  useAddProformaInvoiceMutation,
  useUpdateProformaInvoiceMutation,
  useGetProformaInvoiceByIdQuery,
  useGetProformaInvoiceQuery,
} from "../../../redux/uniformService/ProformaInvoiceService.js";
import {
  findFromList,
  getCommonParams,
  ModeChip,
  formatCurrencyAmount,
  amountInWords,
  formatAmountIN,
} from "../../../Utils/helper.js";
import {
  dropDownListObject,
  dropDownListObjectMultiple,
} from "../../../Utils/contructObject.js";
import ProformaInvoiceFabricItems from "./ProformaInvoiceFabricItems.jsx";
import moment from "moment";
import { PDFViewer } from "@react-pdf/renderer";
import Modal from "../../../UiComponents/Modal/index.js";
import ProformaInvoiceFabricPrintFormat from "./ProformaInvoiceFabricPrintFormat.jsx";
import tw from "../../../Utils/tailwind-react-pdf.js";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import {
  FiEdit2,
  FiSave,
  FiPrinter,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiLayers,
  FiUser,
  FiTruck,
} from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import {
  CommonFormFooter,
  TransactionLayout,
} from "../../../Basic/components/Reuseable/index.js";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices.js";
import { calculateTaxWithHSNBreakupAndInsertIntoPoItems } from "../../../Utils/taxSummary.js";
import PoSummary from "../PurchaseOrder/PoSummary.js";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService.js";
import { DropdownWithModal } from "../../../Inputs/Reuseable.js";
import { PartyMaster } from "../index.js";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import { useDispatch } from "react-redux";
import { invalidateFabricModule } from "../../../redux/Dispatch/fabircInvalidateTags.js";
import { useGetFabricMasterQuery } from "../../../redux/services/FabricMasterService.js";
import { useGetGsmMasterQuery } from "../../../redux/services/GsmMasterService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import { useGetColorMasterQuery } from "../../../redux/services/ColorMasterService";
import { useGetDesignMasterQuery } from "../../../redux/services/DesignMasterService";
import { useGetLoopLengthMasterQuery } from "../../../redux/services/LooplengthMasterService";
import { useGetDiaMasterQuery } from "../../../redux/services/DiaMasterService";
import { useGetGaugeMasterQuery } from "../../../redux/services/GaugeMasterService";
import { BankMaster } from "../../../Basic/components/index.js";

const EMPTY_ROW = {
  fabricId: "",
  hsnId: "",
  colorId: "",
  designId: "",
  gaugeId: "",
  loopLengthId: "",
  gsmId: "",
  kDiaId: "",
  fDiaId: "",
  uomId: "",
  width: "",
  numberOfRolls: "",
  weightPerRoll: "",
  totalKgs: "",
  pricePerKg: "",
  totalPrice: "",
  qty: "",
  price: "",
  amount: "",
  taxPercent: "",
  discountvalue: "",
  discounttype: "",
};

const padItems = (itemsArray = [], minLength = 10) => {
  const currentLength = itemsArray.length;

  const formattedItems = (itemsArray || []).map((item) =>
    item.rowId
      ? item
      : { ...item, rowId: Math.random().toString(36).substring(2, 9) },
  );

  if (currentLength < minLength) {
    const padding = Array.from({ length: minLength - currentLength }, () => ({
      ...EMPTY_ROW,
      rowId: Math.random().toString(36).substring(2, 9),
    }));
    return [...formattedItems, ...padding];
  }
  return formattedItems;
};

const ProformaInvoiceFabricForm = ({
  readOnly,
  setReadOnly,
  id,
  setId,
  onClose,
  termsData,
  customerList,
  payTermList,
  currencyList,
  cityList,
  bankList,
  hasPermission,
}) => {
  const { branchId, companyId, finYearId, userId } = getCommonParams();

  const [docId, setDocId] = useState("New");
  const [docDate, setDocDate] = useState(moment().format("YYYY-MM-DD"));
  const [userDate, setUserDate] = useState(moment().format("YYYY-MM-DD"));
  const [customerId, setCustomerId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [termsAndCondition, setTermsAndCondition] = useState("");
  const [termsId, setTermsId] = useState("");
  const [fabricItems, setFabricItems] = useState(padItems([]));
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [summary, setSummary] = useState(false);
  const [discountType, setDiscountType] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [payTermId, setPayTermId] = useState("");
  const [validityTo, setValidityTo] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [loadingId, setLoadingId] = useState("");
  const [deliveryId, setDeliveryId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  const [carriageCharge, setCarriageCharge] = useState("");
  const [selectedQuoteVersion, setSelectedQuoteVersion] = useState("Latest");
  const [availableVersions, setAvailableVersions] = useState([]);
  const [bankId, setBankId] = useState("");
  const [carriageTax, setCarriageTax] = useState("");
  const [carriageFinalAmt, setCarriageFinalAmt] = useState("");
  const [customerPoNo, setCustomerPoNo] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 150);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 320);
  };
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const childRecord = useRef(0);

  const customerRef = useRef(null);
  const termsRef = useRef(null);

  const isOldVersion = selectedQuoteVersion !== "Latest";
  const effectiveReadOnly = readOnly || isOldVersion || childRecord.current > 0;

  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    contactPerson: "",
    phone: "",
  });
  const dispatch = useDispatch();
  const { data: fabricList } = useGetFabricMasterQuery({
    params: { companyId },
  });
  const { data: gsmList } = useGetGsmMasterQuery({ params: { companyId } });
  const { data: uomList } = useGetUomQuery({ params: { companyId } });
  const { data: hsnList } = useGetHsnMasterQuery({ params: { companyId } });
  const { data: colorList } = useGetColorMasterQuery({ params: { companyId } });
  const { data: designList } = useGetDesignMasterQuery({
    params: { companyId },
  });
  const { data: loopLengthList } = useGetLoopLengthMasterQuery({
    params: { companyId },
  });
  const { data: diaList } = useGetDiaMasterQuery({
    params: { companyId },
  });
  const { data: gaugeList } = useGetGaugeMasterQuery({ params: { companyId } });
  const kDiaList = diaList?.data?.filter((val) => val?.kDia);
  const fDiaList = diaList?.data?.filter((val) => val?.fDia);
  const { data: allData } = useGetProformaInvoiceQuery({
    params: { branchId },
  });
  const { data: singleData } = useGetProformaInvoiceByIdQuery(id, {
    skip: !id,
  });
  const { data: taxTypeList } = useGetTaxTemplateQuery({
    params: { companyId },
  });

  const { data: supplierData } = useGetPartyByIdQuery(customerId, {
    skip: !customerId,
  });

  const [dispatchInvalidate] = useInvalidateTags();

  const [addData, { isLoading: isSaving }] = useAddProformaInvoiceMutation();
  const [updateData, { isLoading: isUpdating }] =
    useUpdateProformaInvoiceMutation();

  const isCustomerExport = supplierData?.data?.isCustomerExport;
  const isCurrencySymbol = currencyList?.data?.find(
    (item) => item?.id === currencyId,
  )?.symbol;
  const currencyCode = currencyList?.data?.find(
    (item) => item?.id === currencyId,
  )?.code;
  useEffect(() => {
    if (!id && allData?.nextDocId) {
      setDocId(allData.nextDocId);
    }
  }, [id, allData]);

  useEffect(() => {
    if (id && singleData?.data) {
      const data = singleData.data;
      setDocId(data.docId);
      setDocDate(moment(data.docDate).format("YYYY-MM-DD"));
      setUserDate(
        data.userDate
          ? moment(data.userDate).format("YYYY-MM-DD")
          : moment().format("YYYY-MM-DD"),
      );
      setCustomerId(data.customerId);
      setRemarks(data.remarks || "");
      setTermsAndCondition(data.termsAndCondition || "");
      setTermsId(data.termsId || "");
      setTaxTemplateId(data.taxTemplateId || "");
      setPayTermId(data.payTermId || "");
      setDiscountType(data.discountType || "");
      setDiscountValue(data.discountValue || 0);
      setValidityTo(
        data.validityTo ? moment(data.validityTo).format("YYYY-MM-DD") : "",
      );
      setCurrencyId(data.currencyId || "");
      setLoadingId(data.loadingId || "");
      setDeliveryId(data.deliveryId || "");
      setDeliveryDate(
        data.deliveryDate ? moment(data.deliveryDate).format("YYYY-MM-DD") : "",
      );
      setCarriageCharge(
        !isNaN(parseFloat(data.carriageCharge))
          ? parseFloat(data.carriageCharge).toFixed(2)
          : "",
      );

      setBankId(data.bankId || "");
      setCarriageTax(data.carriageTax || "");
      childRecord.current = data?.childRecord ? data?.childRecord : 0;

      let loadedVersions = [];
      if (data.fabricItems?.length > 0) {
        loadedVersions = [
          ...new Set(
            data.fabricItems.map((i) => i.quoteVersion).filter(Boolean),
          ),
        ].sort((a, b) => b - a);
      }
      setAvailableVersions(loadedVersions);
      setSelectedQuoteVersion("Latest");

      const targetVersion =
        loadedVersions.length > 0 ? Math.max(...loadedVersions, 1) : 1;
      const filteredItems = (data?.fabricItems || []).filter(
        (i) => (i.quoteVersion || 1) === targetVersion,
      );
      const mappedItems = filteredItems?.map((item) => ({
        ...item,
        weightPerRoll: item?.weightPerRoll?.toFixed(3),
        totalKgs: item?.totalKgs?.toFixed(3),
        pricePerKg: item?.pricePerKg?.toFixed(2),
        totalPrice: item?.totalPrice?.toFixed(2),
        qty: item?.qty?.toFixed(3),
        price: item?.price?.toFixed(2),
        amount: item?.amount?.toFixed(2),
      }));

      setFabricItems(padItems(mappedItems));

      const cust = data?.customer;
      if (cust) {
        setCustomerDetails({
          name: cust.name || "",
          contactPerson: cust.contactPersonName || "",
          phone: cust.contactNumber || "",
        });
      }

      setCustomerPoNo(data?.customerPoNo);
    }
  }, [id, singleData]);

  useEffect(() => {
    if (singleData?.data?.fabricItems && id) {
      const itemsArr = singleData.data.fabricItems;
      const maxVersion =
        availableVersions.length > 0 ? Math.max(...availableVersions, 1) : 1;
      let targetVersion = maxVersion;

      if (selectedQuoteVersion !== "Latest") {
        targetVersion = parseInt(selectedQuoteVersion.replace("V", ""));
      }

      const filteredItems = itemsArr.filter(
        (i) => (i.quoteVersion || 1) === targetVersion,
      );
      const mappedItems = filteredItems?.map((item) => ({
        ...item,
        weightPerRoll: item?.weightPerRoll?.toFixed(3),
        totalKgs: item?.totalKgs?.toFixed(3),
        pricePerKg: item?.pricePerKg?.toFixed(2),
        totalPrice: item?.totalPrice?.toFixed(2),
        qty: item?.qty?.toFixed(3),
        price: item?.price?.toFixed(2),
        amount: item?.amount?.toFixed(2),
      }));

      setFabricItems(padItems(mappedItems));
    }
  }, [selectedQuoteVersion, singleData, id, availableVersions]);

  useEffect(() => {
    customerRef.current?.focus();
  }, []);

  useEffect(() => {
    setShowVersionDropdown(false);
  }, [id]);

  useEffect(() => {
    const charge = parseFloat(carriageCharge) || 0;
    const tax = parseFloat(carriageTax) || 0;
    const finalAmt = charge + (charge * tax) / 100;
    setCarriageFinalAmt(finalAmt ? finalAmt.toFixed(2) : "");
  }, [carriageCharge, carriageTax]);

  const validateRows = (items) => {
    const errors = [];
    const seen = new Set();
    items.forEach((item, index) => {
      if (!item.fabricId) {
        errors.push(`Row ${index + 1}: Fabric is required`);
      }
      if (!item.hsnId) {
        errors.push(`Row ${index + 1}: HSN is required`);
      }
      if (!item.loopLengthId) {
        errors.push(`Row ${index + 1}: Loop Length is required`);
      }
      if (!item.kDiaId) {
        errors.push(`Row ${index + 1}: KDia is required`);
      }
      if (!item.fDiaId) {
        errors.push(`Row ${index + 1}: FDia is required`);
      }
      if (!item.uomId) {
        errors.push(`Row ${index + 1}: UOM is required`);
      }
      if (!item.qty || Number(item.qty) <= 0) {
        errors.push(`Row ${index + 1}: Qty is required`);
      }
      if (!item.price || Number(item.price) <= 0) {
        errors.push(`Row ${index + 1}: Price is required`);
      }
      const key = `${item.fabricId}_${item.hsnId}_${item.colorId}_${item.designId}_${item.loopLengthId}_${item.gsmId}_${item.kDiaId}_${item.fDiaId}_${item.uomId}`;
      if (seen.has(key)) {
        errors.push(`Row ${index + 1}: Duplicate item found`);
      } else {
        seen.add(key);
      }
    });

    return errors;
  };

  const handleSave = async (pendingAction = null) => {
    if (userDate < docDate) {
      Swal.fire({
        title: "Warning",
        text: "User Date cannot be smaller than PI Date",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    if (!customerId) {
      Swal.fire({
        title: "Warning",
        text: "Please select a Customer.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!isCustomerExport && !taxTemplateId) {
      Swal.fire({
        title: "Warning",
        text: "Please select a Tax Template.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    if (!payTermId) {
      Swal.fire({
        title: "Warning",
        text: "Please select a Pay Term.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!validityTo) {
      Swal.fire({
        title: "Warning",
        text: "Validity To is required",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (isCustomerExport && !currencyId) {
      Swal.fire({
        title: "Warning",
        text: "Currency is required",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (isCustomerExport && !loadingId) {
      Swal.fire({
        title: "Warning",
        text: "Loading Port is required",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (isCustomerExport && !deliveryId) {
      Swal.fire({
        title: "Warning",
        text: "Delivery Port is required",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (validityTo && validityTo < docDate) {
      Swal.fire({
        title: "Warning",
        text: "Valid To Date cannot be smaller than PI Date",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    if (deliveryDate && deliveryDate < docDate) {
      Swal.fire({
        title: "Warning",
        text: "Delivery Date cannot be smaller than PI Date",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (isCustomerExport && !bankId) {
      Swal.fire({
        title: "Warning",
        text: "Bank is required",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const filteredItems = fabricItems.filter((item) => item.fabricId);

    if (filteredItems.length === 0) {
      Swal.fire({
        title: "Warning",
        text: "Please add at least one item.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    const rowErrors = validateRows(filteredItems);
    if (rowErrors.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Row Validation Error",
        html: `<div style="text-align:left">${rowErrors.join("<br/>")}</div>`,
      });
      return false;
    }
    const hasMissingPrice = filteredItems.some(
      (item) => !item.price || parseFloat(item.price) <= 0,
    );
    if (hasMissingPrice) {
      Swal.fire({
        title: "Warning",
        text: "Please enter a valid price for all selected items.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const payload = {
      userId,
      branchId,
      companyId,
      finYearId,
      docDate,
      userDate,
      customerId,
      customerPoNo,
      taxTemplateId,
      payTermId,
      currencyId,
      validityTo,
      loadingId,
      deliveryId,
      deliveryDate,
      carriageCharge,
      carriageTax,
      bankId,
      filteredItems,
      termsAndCondition,
      termsId,
      remarks,
      discountType,
      discountValue,
    };

    try {
      let savedId = id;
      if (id) {
        await updateData({ id, body: payload }).unwrap();
        Swal.fire({
          title: "Success",
          text: "Proforma Invoice updated successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          didClose: () => {
            customerRef.current.focus();
          },
        });
      } else {
        const res = await addData(payload).unwrap();
        savedId = res.data.id;
        setId(savedId);
        Swal.fire({
          title: "Success",
          text: "Proforma Invoice created successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          didClose: () => {
            customerRef.current.focus();
          },
        });
      }
      invalidateFabricModule();
      setReadOnly(true);
      dispatchInvalidate();

      if (pendingAction === "new") {
        onNew();
      } else if (pendingAction === "close") {
        onClose();
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.data?.message || "Failed to save Proforma Invoice",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      handleSave();
    }
  };

  const onNew = () => {
    setId("");
    setReadOnly(false);
    setDocId("New");
    setDocDate(moment().format("YYYY-MM-DD"));
    setUserDate(moment().format("YYYY-MM-DD"));
    setCustomerId("");
    setRemarks("");
    setTermsAndCondition("");
    setTermsId("");
    setTaxTemplateId("");
    setPayTermId("");
    setFabricItems(padItems([]));
    setCustomerDetails({ name: "", contactPerson: "", phone: "" });
    setSelectedQuoteVersion("Latest");
    setAvailableVersions([]);
    setDiscountType("Percentage");
    setDiscountValue(0);
    setLoadingId("");
    setDeliveryId("");
    setDeliveryDate("");

    setCarriageCharge("");
    setValidityTo("");
    setCurrencyId("");
    setBankId("");
    setCarriageTax("");
    setCustomerPoNo("");
  };

  useEffect(() => {
    if (termsId && termsData?.data && !id) {
      const term = termsData.data.find((t) => t.id === termsId);
      if (term) setTermsAndCondition(term.description);
    }
  }, [termsId, termsData]);

  useEffect(() => {
    if (!id) {
      setTaxTemplateId(
        taxTypeList?.data?.filter((item) => item.name === "DEFAULT")[0]?.id,
      );
    }
  }, [taxTypeList, id]);

  const compactFieldClass = "px-2 py-1 text-[11px] text-black !text-black";
  const compactModalFieldClass =
    "w-full px-2 py-1 text-[11px] text-black !text-black";
  const narrowFieldWrap = "min-w-0";
  const partyDropdownMinWidth = 340;
  const supplierCompactGridClass =
    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 items-end";
  const shippingPortsGridClass =
    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 items-end";
  const shippingChargesGridClass =
    "grid grid-cols-2 sm:grid-cols-[minmax(0,120px)_minmax(0,120px)_minmax(0,95px)_minmax(0,130px)] gap-2 items-end";

  const isSupplierOutside = useMemo(() => {
    return supplierData?.data?.City?.state?.name !== "TAMILNADU";
  }, [supplierData]);

  const enrichedData = useMemo(() => {
    const filteredItems = fabricItems.filter((i) => i.fabricId);
    if (!filteredItems.length)
      return {
        items: [],
        gross: 0,
        taxable: 0,
        net: 0,
        slabBreakup: [],
        roundOff: 0,
      };

    return calculateTaxWithHSNBreakupAndInsertIntoPoItems(
      filteredItems,
      isSupplierOutside,
      discountType,
      discountValue,
    );
  }, [fabricItems, isSupplierOutside, discountType, discountValue]);

  const calculatedGrandTotal = useMemo(() => {
    const base = !isCustomerExport
      ? enrichedData.net
      : (enrichedData.items?.reduce(
          (sum, item) => sum + (parseFloat(item.amount) || 0),
          0,
        ) || 0) -
        (enrichedData.itemDiscount + enrichedData.overallDiscount > 0
          ? enrichedData.itemDiscount + enrichedData.overallDiscount
          : 0);
    return (base || 0) + (parseFloat(carriageFinalAmt) || 0);
  }, [enrichedData, isCustomerExport, carriageFinalAmt]);

  const versionDropdown = (
    <div className="inline-flex items-center bg-[#102438] border border-[#28496D] px-1.5 py-0 rounded-md shadow-lg h-6">
      <div className="relative flex items-center">
        <select
          value={selectedQuoteVersion}
          onChange={(e) => setSelectedQuoteVersion(e.target.value)}
          className="appearance-none bg-transparent border-0 text-white text-xs pl-1 pr-4 py-0 focus:outline-none cursor-pointer font-semibold leading-none"
        >
          {availableVersions.length > 0 ? (
            availableVersions.map((v) => (
              <option
                key={v}
                value={
                  Math.max(...availableVersions) === v ? "Latest" : `V${v}`
                }
                className="bg-[#102438] text-white"
              >
                {Math.max(...availableVersions) === v ? "Latest" : `V${v}`}
              </option>
            ))
          ) : (
            <option value="Latest" className="bg-[#102438] text-white">
              Latest
            </option>
          )}
        </select>

        {/* Custom arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-[#7098BC]">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  const basicDetailsSidebar = (
    <aside
      style={{
        backgroundColor: "#0d1e30",
        backgroundImage:
          "radial-gradient(120% 70% at 50% 0%, rgba(96, 165, 250, 0.25) 0%, rgba(30, 75, 125, 0.12) 45%, transparent 75%), linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%), linear-gradient(180deg, #16304C 0%, #0d1e30 40%, #050b12 75%, #000000 100%)",
      }}
      className={`bg-[#0d1e30] transition-[width] duration-300 ease-in-out flex flex-col min-h-0 flex-none self-stretch text-white rounded-md border border-[#20456C] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_1px_3px_rgba(0,0,0,0.3)] overflow-hidden relative ${
        isSidebarOpen ? "w-[260px] xl:w-[280px]" : "w-[44px]"
      }`}
    >
      {isSidebarOpen ? (
        <div className="w-[260px] xl:w-[280px] min-w-[260px] xl:min-w-[280px] flex flex-col h-full min-h-0 relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-28 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none" />
          {/* Header of Sidebar */}
          <div className="px-3.5 pt-2.5 pb-2.5 border-b border-[#20456C] flex-none">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-[#7098BC] tracking-[0.14em] uppercase block leading-tight">
                    Fabric Proforma Invoice
                  </span>
                  {/* {id && <ModeChip id={id} readOnly={effectiveReadOnly} />} */}
                </div>
                <div className="mt-1 h-6 flex items-center">
                  <h2
                    onClick={() => {
                      if (id) setShowVersionDropdown((prev) => !prev);
                    }}
                    className={`text-md font-extrabold tracking-tight truncate leading-none select-none transition-colors ${
                      id
                        ? "cursor-pointer text-white hover:text-sky-300 active:scale-98"
                        : "text-white"
                    }`}
                    title={id ? "Click to toggle version dropdown" : ""}
                  >
                    {docId && docId !== "New" ? docId : "New PI"}
                  </h2>
                </div>
                <div
                  className={`mt-1 h-6 flex items-center transition-opacity duration-150 ${
                    id && showVersionDropdown
                      ? "opacity-100 visible pointer-events-auto"
                      : "opacity-0 invisible pointer-events-none"
                  }`}
                >
                  {versionDropdown}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleSidebar}
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-sky-600 active:bg-sky-700 text-white border border-white/25 hover:border-sky-400 shadow-md flex items-center justify-center transition active:scale-95 flex-shrink-0 cursor-pointer mt-1"
                title="Collapse Basic Details"
              >
                <FiChevronLeft
                  className="w-5 h-5 text-white"
                  strokeWidth={2.75}
                />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div
            className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5 space-y-2.5 [scrollbar-color:#28496D_#102438] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#102438] [&::-webkit-scrollbar-thumb]:bg-[#28496D] [&::-webkit-scrollbar-thumb]:rounded
            [&_label]:!text-[#7098BC] [&_label]:!text-[10px] [&_label]:!font-bold [&_label]:!tracking-[0.1em] [&_label]:!uppercase [&_label]:!mb-1
            [&_label_p]:!text-[#7098BC] [&_label_span:not(.text-red-500)]:!text-[#7098BC] [&_.text-red-500]:!text-rose-400
            [&_input]:!bg-[#102438] [&_input]:!border-[#28496D] [&_input]:!text-white [&_input]:[-webkit-text-fill-color:white] [&_input]:!opacity-100 [&_input]:!rounded-md [&_input]:[color-scheme:dark] [&_input:focus]:!border-sky-400
            [&_select]:!bg-[#102438] [&_select]:!border-[#28496D] [&_select]:!text-white [&_select]:!rounded-md [&_select:focus]:!border-sky-400
            [&_select_option]:!bg-[#102438] [&_select_option]:!text-white
            [&_.bg-slate-100]:!bg-[#102438] [&_.bg-slate-100]:!border-[#28496D] [&_.bg-slate-100]:!text-white [&_.bg-slate-100]:[-webkit-text-fill-color:white] [&_.bg-slate-100]:!rounded-md
            [&_.mb-1_button]:!bg-[#102438] [&_.mb-1_button]:!border-[#28496D] [&_.mb-1_button]:!text-white [&_.mb-1_button]:!rounded-md [&_.mb-1_button_span]:!text-white [&_.mb-1_button_svg]:!text-[#7098BC]"
          >
            {/* PI No and PI Date */}
            <div className="grid grid-cols-2 gap-1.5">
              <div
                className={`${narrowFieldWrap} ${id ? "cursor-pointer" : ""}`}
                onClick={() => {
                  if (id) setShowVersionDropdown((prev) => !prev);
                }}
                title={id ? "Click to toggle version dropdown" : ""}
              >
                <ReusableInput
                  label="PI No"
                  readOnly
                  value={docId}
                  className={`${compactFieldClass} w-full ${id ? "cursor-pointer" : ""}`}
                  labelClass="!text-[#7098BC]"
                />
              </div>
              <div className={narrowFieldWrap}>
                <ReusableInput
                  label="PI Date"
                  value={docDate}
                  type={"date"}
                  required={true}
                  readOnly={true}
                  disabled
                  className={`${compactFieldClass} w-full`}
                  labelClass="!text-[#7098BC]"
                />
              </div>
            </div>

            {/* Row 2: User Date & Valid To */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className={narrowFieldWrap}>
                <DateInputNew
                  name="User Date"
                  value={userDate}
                  setValue={setUserDate}
                  disabled={effectiveReadOnly}
                  required={false}
                  type="date"
                  min={docDate}
                  className={`${compactFieldClass} w-full`}
                />
              </div>
              <div className={narrowFieldWrap}>
                <DateInputNew
                  name="Valid To"
                  value={validityTo}
                  setValue={setValidityTo}
                  disabled={effectiveReadOnly}
                  required={true}
                  type="date"
                  min={docDate}
                  className={`${compactFieldClass} w-full`}
                />
              </div>
            </div>

            {/* Row 3: Tax Type & Pay Term */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className={narrowFieldWrap}>
                <DropdownInput
                  name="Tax Type"
                  options={dropDownListObject(
                    taxTypeList ? taxTypeList?.data : [],
                    "name",
                    "id",
                  )}
                  value={taxTemplateId}
                  setValue={setTaxTemplateId}
                  required={!isCustomerExport}
                  readOnly={effectiveReadOnly}
                  className={`${compactFieldClass} w-full max-w-none`}
                />
              </div>

              <div className={narrowFieldWrap}>
                <DropdownInput
                  name="Pay Term"
                  options={dropDownListObject(
                    id
                      ? payTermList?.data
                      : payTermList?.data?.filter((item) => item?.active),
                    "name",
                    "id",
                  )}
                  value={payTermId}
                  setValue={setPayTermId}
                  required={true}
                  readOnly={effectiveReadOnly}
                  className={`${compactFieldClass} w-full max-w-none`}
                />
              </div>
            </div>

            {/* Row 4: Currency & Customer Po No */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className={narrowFieldWrap}>
                <DropdownInput
                  name="Currency"
                  options={dropDownListObject(
                    id
                      ? currencyList?.data
                      : currencyList?.data?.filter((item) => item?.active),
                    "name",
                    "id",
                  )}
                  value={currencyId}
                  setValue={setCurrencyId}
                  required={isCustomerExport}
                  readOnly={effectiveReadOnly || !isCustomerExport}
                  disabled={effectiveReadOnly || !isCustomerExport}
                  className={`${compactFieldClass} w-full max-w-none`}
                />
              </div>

              <div className={narrowFieldWrap}>
                <TextInput
                  name="Customer Po No"
                  value={customerPoNo}
                  setValue={setCustomerPoNo}
                  disabled={effectiveReadOnly}
                  type="text"
                  className={`${compactFieldClass} w-full`}
                  onFocus={(e) => {
                    e.target.select();
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bottom of Sidebar - Net Amount & View Summary */}
          <div className="p-3 border-t border-[#20456C] bg-transparent flex-none space-y-2.5">
            {/* Net Amount Display Card */}
            <div className="bg-[#102438] rounded-lg border border-[#28496D] p-3 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7098BC] mb-1">
                Net Amount
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-xs font-bold text-[#7098BC] tracking-wider">
                  {isCurrencySymbol || currencyCode || "INR"}
                </span>
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  {formatAmountIN(calculatedGrandTotal || 0)}
                </span>
              </div>
              <div className="text-[11px] font-medium text-[#7098BC] leading-snug break-words mt-1.5">
                {amountInWords(Number(calculatedGrandTotal || 0))}
              </div>
            </div>

            {/* View Summary Button */}
            <button
              type="button"
              onClick={() => {
                if (!taxTemplateId && !isCustomerExport) {
                  Swal.fire({
                    title: "Information",
                    text: "Please Select Tax Template !",
                    icon: "info",
                    confirmButtonColor: "#3085d6",
                  });
                  return;
                }
                setSummary(true);
              }}
              className="w-full bg-[#102438] hover:bg-[#152e47] active:bg-[#0c1c2c] text-white py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold shadow-sm transition border border-[#28496D] cursor-pointer"
              title="View PI Summary"
            >
              <FiEye className="w-4 h-4 text-white" />
              <span>View summary</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-[44px] min-w-[44px] flex flex-col h-full min-h-0 items-center justify-between py-2">
          {/* Expand Button */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="w-8 h-8 rounded-lg bg-white/15 hover:bg-sky-600 active:bg-sky-700 text-white border border-white/25 hover:border-sky-400 shadow-md flex items-center justify-center transition active:scale-95 flex-shrink-0 mt-1 cursor-pointer"
            title={
              docId && docId !== "New"
                ? `Expand Basic Details (${docId})`
                : "Expand Basic Details"
            }
          >
            <FiChevronRight className="w-5 h-5 text-white" strokeWidth={2.75} />
          </button>

          {/* Vertical rotated text label */}
          <div
            onClick={toggleSidebar}
            className="flex-1 flex flex-col items-center justify-center cursor-pointer select-none py-4 w-full hover:bg-white/5 transition"
            title={
              docId && docId !== "New"
                ? `Click to expand (${docId})`
                : "Click to expand Basic Details"
            }
          >
            <div className="flex flex-col items-center gap-2.5">
              <FiLayers
                className={`w-4 h-4 ${
                  docId && docId !== "New" ? "text-sky-300" : "text-[#7098BC]"
                }`}
              />
              <span
                className={`text-[13px] font-bold uppercase whitespace-nowrap ${
                  docId && docId !== "New"
                    ? "text-sky-200 tracking-wider font-extrabold"
                    : "text-[#7098BC] tracking-widest"
                }`}
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              >
                {docId && docId !== "New" ? docId : "Basic Details"}
              </span>
            </div>
          </div>

          {/* Bottom of collapsed sidebar */}
          <div className="flex flex-col items-center gap-1.5 pb-1">
            <span
              className="px-1.5 py-0.5 rounded bg-[#102438] text-white border border-[#28496D] font-bold text-[9px] max-w-[38px] truncate cursor-pointer shadow-xs"
              title={`Net Amount: ${isCurrencySymbol || currencyCode || "INR"} ${formatAmountIN(calculatedGrandTotal || 0)}\n${amountInWords(Number(calculatedGrandTotal || 0))}`}
              onClick={toggleSidebar}
            >
              {isCurrencySymbol || "₹"}
              {parseFloat(calculatedGrandTotal || 0) >= 1000
                ? `${(parseFloat(calculatedGrandTotal || 0) / 1000).toFixed(1)}k`
                : parseFloat(calculatedGrandTotal || 0).toFixed(0)}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!taxTemplateId && !isCustomerExport) {
                  Swal.fire({
                    title: "Information",
                    text: "Please Select Tax Template !",
                    icon: "info",
                    confirmButtonColor: "#3085d6",
                  });
                  return;
                }
                setSummary(true);
              }}
              title="View summary"
              className="p-1.5 rounded-md text-white hover:bg-[#102438] transition border border-transparent hover:border-[#28496D] cursor-pointer"
            >
              <FiEye className="w-4 h-4" />
            </button>

            <div
              onClick={toggleSidebar}
              className="flex flex-col items-center gap-1.5 cursor-pointer"
              title="Click to expand Basic Details"
            >
              {docId && docId !== "New" && (
                <span
                  className="px-1 py-0.5 rounded bg-white/20 text-white font-bold text-[10px] max-w-[38px] truncate"
                  title={`PI: ${docId}`}
                >
                  #{docId.slice(-4)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );

  const customerDetailsCompactSection = (
    <div className="border border-slate-200 bg-white rounded-md shadow-sm overflow-hidden flex flex-col border-l-4 border-l-blue-600">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200/80 bg-slate-50 rounded-t-md flex-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <FiUser className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="font-semibold text-[11px] text-slate-800 tracking-wider uppercase truncate">
            Customer Details
          </span>
        </div>
      </div>
      <div className="px-2.5 py-2 flex-1 min-h-0">
        <div className={supplierCompactGridClass}>
          <div className="min-w-0 md:col-span-2 xl:col-span-2">
            <DropdownWithModal
              name="Customer"
              options={dropDownListObject(
                id
                  ? customerList?.data?.filter((item) => item?.isCustomer)
                  : customerList?.data?.filter(
                      (item) => item?.active && item?.isCustomer,
                    ),
                "name",
                "id",
              )}
              value={customerId}
              setValue={setCustomerId}
              required={true}
              readOnly={readOnly}
              className={compactModalFieldClass}
              dropdownMinWidth={partyDropdownMinWidth}
              addNewLabel="+ Add New Customer"
              childComponent={PartyMaster}
              addNewModalWidth="w-[90%] h-[95%]"
              disabled={effectiveReadOnly}
              openOnFocus={true}
              ref={customerRef}
            />
          </div>
          <div className="min-w-0 col-span-1">
            <TextInput
              name="Contact Person"
              placeholder="Contact name"
              value={findFromList(
                customerId,
                customerList?.data,
                "contactPersonName",
              )}
              disabled={true}
              className={compactFieldClass}
            />
          </div>
          <div className="min-w-0 col-span-1">
            <TextInput
              name="Phone"
              placeholder="Contact phone"
              value={findFromList(
                customerId,
                customerList?.data,
                "contactNumber",
              )}
              disabled={true}
              className={compactFieldClass}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const shippingDetailsCompactSection = (
    <div className="border border-slate-200 bg-white rounded-md shadow-sm overflow-hidden flex flex-col border-l-4 border-l-amber-500">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200/80 bg-slate-50 rounded-t-md flex-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <FiTruck className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="font-semibold text-[11px] text-slate-800 tracking-wider uppercase truncate">
            Shipping & Carriage Details
          </span>
        </div>
      </div>
      <div className="px-2.5 py-1.5 flex-1 min-h-0 space-y-1">
        {/* Row 1: Ports & Advising Bank */}
        <div className={shippingPortsGridClass}>
          <div className="min-w-0">
            <DropdownInput
              name="Loading Port"
              options={dropDownListObject(
                cityList?.data?.filter((item) => item.active),
                "name",
                "id",
              )}
              value={loadingId}
              setValue={setLoadingId}
              readOnly={effectiveReadOnly || !isCustomerExport}
              required={isCustomerExport}
              className={compactFieldClass}
            />
          </div>
          <div className="min-w-0">
            <DropdownInput
              name="Delivery Port"
              options={dropDownListObject(
                cityList?.data?.filter((item) => item.active),
                "name",
                "id",
              )}
              value={deliveryId}
              setValue={setDeliveryId}
              readOnly={effectiveReadOnly || !isCustomerExport}
              required={isCustomerExport}
              className={compactFieldClass}
            />
          </div>
          <div className="min-w-0">
            <DropdownWithModal
              name="Advising Bank"
              options={dropDownListObjectMultiple(
                id
                  ? bankList?.data
                  : bankList?.data?.filter((item) => item?.active),
                ["name", "Branch.name"],
                "id",
              )}
              value={bankId}
              setValue={setBankId}
              required={isCustomerExport}
              readOnly={effectiveReadOnly}
              disabled={readOnly}
              className={compactFieldClass}
              addNewLabel="+ Add New Bank"
              childComponent={BankMaster}
              addNewModalWidth="w-[45%] h-[64%]"
            />
          </div>
        </div>

        {/* Row 2: Delivery Date & Carriage Charges */}
        <div className={shippingChargesGridClass}>
          <div className="min-w-0">
            <DateInputNew
              name="Delivery Date"
              value={deliveryDate}
              setValue={setDeliveryDate}
              disabled={effectiveReadOnly}
              type="date"
              min={docDate}
              className={compactFieldClass}
            />
          </div>

          <div className="min-w-0">
            <TextInput
              name={`Carriage Amount ${currencyId ? `(${isCurrencySymbol})` : ""}`}
              value={carriageCharge}
              setValue={setCarriageCharge}
              disabled={effectiveReadOnly}
              type="number"
              min="0"
              placeholder=""
              className={`${compactFieldClass} text-right`}
              onBlur={(e) =>
                setCarriageCharge(
                  e.target.value ? Number(e.target.value).toFixed(2) : "",
                )
              }
              onFocus={(e) => {
                e.target.select();
              }}
            />
          </div>
          <div className="min-w-0">
            <TextInput
              name="Carriage Tax%"
              value={carriageTax}
              setValue={setCarriageTax}
              disabled={effectiveReadOnly}
              type="number"
              min="0"
              placeholder=""
              className={`${compactFieldClass} text-right`}
              onBlur={(e) =>
                setCarriageTax(
                  e.target.value ? Number(e.target.value).toFixed(2) : "",
                )
              }
              onFocus={(e) => {
                e.target.select();
              }}
            />
          </div>
          <div className="min-w-0">
            <TextInput
              name="Carriage Final Amount"
              value={carriageFinalAmt}
              disabled={true}
              type="number"
              min="0"
              placeholder=""
              className={`${compactFieldClass} text-right`}
              onFocus={(e) => {
                e.target.select();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const headerContent = (
    <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1.65fr] gap-1.5 w-full">
      {customerDetailsCompactSection}
      {shippingDetailsCompactSection}
    </div>
  );

  const headerActionsContent = (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        type="button"
        onClick={() => handleSave("close")}
        disabled={effectiveReadOnly || isSaving || isUpdating}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSave("close");
            e.stopPropagation();
          }
        }}
        className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-2.5 py-1 rounded-md flex items-center text-xs font-medium shadow-sm hover:shadow-md hover:shadow-blue-500/25 active:scale-95 transition-all duration-150 border border-blue-400/25 ${
          effectiveReadOnly || isSaving || isUpdating
            ? "opacity-50 cursor-not-allowed hover:shadow-none hover:from-blue-600 hover:to-indigo-600 active:scale-100"
            : "hover:-translate-y-0.5 cursor-pointer"
        }`}
        title={id ? "Update & Close" : "Save & Close"}
      >
        <HiOutlineRefresh className="w-3.5 h-3.5 mr-1" />
        {id ? "Update & Close" : "Save & Close"}
      </button>

      <button
        type="button"
        onClick={() => handleSave("new")}
        disabled={effectiveReadOnly || isSaving || isUpdating}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            handleSave("new");
          }
        }}
        className={`bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-2.5 py-1 rounded-md flex items-center text-xs font-medium shadow-sm hover:shadow-md hover:shadow-emerald-500/25 active:scale-95 transition-all duration-150 border border-emerald-400/25 ${
          effectiveReadOnly || isSaving || isUpdating
            ? "opacity-50 cursor-not-allowed hover:shadow-none hover:from-emerald-600 hover:to-teal-600 active:scale-100"
            : "hover:-translate-y-0.5 cursor-pointer"
        }`}
        title={id ? "Update & New" : "Save & New"}
      >
        <FiSave className="w-3.5 h-3.5 mr-1" />
        {id ? "Update & New" : "Save & New"}
      </button>

      {readOnly && id && !isOldVersion && (
        <button
          type="button"
          onClick={() => hasPermission(() => setReadOnly(false), "edit")}
          className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white px-2.5 py-1 rounded-md flex items-center text-xs font-medium shadow-sm hover:shadow-md hover:shadow-amber-500/25 active:scale-95 hover:-translate-y-0.5 transition-all duration-150 border border-amber-400/25 cursor-pointer"
          title="Edit"
        >
          <FiEdit2 className="w-3.5 h-3.5 mr-1" />
          Edit
        </button>
      )}

      {id && (
        <button
          type="button"
          onClick={() => setPrintModalOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white px-2.5 py-1 rounded-md flex items-center text-xs font-medium shadow-sm hover:shadow-md hover:shadow-orange-500/25 active:scale-95 hover:-translate-y-0.5 transition-all duration-150 border border-orange-400/25 cursor-pointer"
          title="Print"
        >
          <FiPrinter className="w-3.5 h-3.5 mr-1" />
          Print
        </button>
      )}
    </div>
  );

  const totalQty = enrichedData?.items?.reduce(
    (sum, item) => sum + (parseFloat(item.qty) || 0),
    0,
  );

  const footerContent = (
    <CommonFormFooter
      remarks={remarks}
      setRemarks={setRemarks}
      terms={termsAndCondition}
      setTerms={setTermsAndCondition}
      readOnly={effectiveReadOnly}
      showTermSelect={true}
      rightSummaryTitle="Summary"
      twoColumnRightSummary={true}
      termsRef={termsRef}
      sectionColClass="md:col-span-3"
      summaryColClass="md:col-span-6"
      termValue={termsId}
      onTermChange={(value) => setTermsId(value)}
      termOptions={
        termsData?.data?.map((item) => ({
          value: item.id,
          label: item.name,
          templateText: item.description || "",
        })) || []
      }
      totalsRows={[
        {
          key: "totalDiscount",
          label: "Total Discount",
          value: `${isCurrencySymbol ? isCurrencySymbol + " " : ""}${formatCurrencyAmount(
            enrichedData.itemDiscount + enrichedData.overallDiscount > 0
              ? enrichedData.itemDiscount + enrichedData.overallDiscount
              : 0,
            currencyCode || isCurrencySymbol,
          )}`,
          summaryColumn: "right",
        },
        {
          key: "taxableAmount",
          label: "Taxable Amount",
          value: `${isCurrencySymbol ? isCurrencySymbol + " " : ""}${formatCurrencyAmount(
            enrichedData.taxable || 0,
            currencyCode || isCurrencySymbol,
          )}`,
          summaryColumn: "right",
        },
        ...(!isCustomerExport
          ? Object.entries(
              (enrichedData.slabBreakup || []).reduce((acc, curr) => {
                const type = curr?.tax?.split(" ")[0];
                acc[type] = (acc[type] || 0) + curr.amount;
                return acc;
              }, {}),
            ).map(([type, amount]) => ({
              key: `tax-${type}`,
              label: type,
              value: `${isCurrencySymbol ? isCurrencySymbol + " " : ""}${formatCurrencyAmount(
                amount,
                currencyCode || isCurrencySymbol,
              )}`,
              summaryColumn: "right",
            }))
          : []),
        {
          key: "roundOff",
          label: "Round Off",
          value: `${isCurrencySymbol ? isCurrencySymbol + " " : ""}${formatCurrencyAmount(
            enrichedData.roundOff || 0,
            currencyCode || isCurrencySymbol,
          )}`,
          summaryColumn: "right",
        },
        {
          key: "carriageCharges",
          label: "Carriage Charges",
          value: `${isCurrencySymbol ? isCurrencySymbol + " " : ""}${
            !isNaN(parseFloat(carriageFinalAmt)) && carriageFinalAmt !== ""
              ? formatCurrencyAmount(
                  carriageFinalAmt,
                  currencyCode || isCurrencySymbol,
                )
              : "0.00"
          }`,
          summaryColumn: "right",
        },
        {
          key: "grandTotal",
          label: "Net Amount",
          value: `${isCurrencySymbol ? isCurrencySymbol + " " : ""}${formatCurrencyAmount(
            calculatedGrandTotal,
            currencyCode || isCurrencySymbol,
          )}`,
          summaryColumn: "right",
          emphasized: true,
          valueClassName: "text-indigo-700",
        },
      ]}
    />
  );

  return (
    <div className="po-form-geist w-full h-full min-h-0 flex flex-col">
      <Modal
        isOpen={summary}
        onClose={() => setSummary(false)}
        widthClass="!p-0 !rounded-xl overflow-hidden shadow-2xl max-w-lg w-full"
      >
        <div className="po-form-geist">
          <PoSummary
            poItems={fabricItems}
            totals={enrichedData}
            readOnly={effectiveReadOnly}
            discountType={discountType}
            setDiscountType={setDiscountType}
            discountValue={discountValue}
            setDiscountValue={setDiscountValue}
            setSummary={setSummary}
            isCustomerExport={isCustomerExport}
          />
        </div>
      </Modal>

      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <ProformaInvoiceFabricPrintFormat
            data={{
              ...singleData?.data,
              currentVersionItems: fabricItems.filter((i) => i.fabricId),
              quoteVersion:
                selectedQuoteVersion !== "Latest"
                  ? parseInt(selectedQuoteVersion.replace("V", ""))
                  : singleData?.data?.quoteVersion || 1,
            }}
            taxDetails={enrichedData}
            isCustomerExport={isCustomerExport}
            cityList={cityList}
            currencyList={currencyList}
            payTermList={payTermList}
            carriageFinalAmt={carriageFinalAmt}
            uomList={uomList}
            hsnList={hsnList}
            colorList={colorList}
            gsmList={gsmList}
            designList={designList}
            kDiaList={kDiaList}
            fDiaList={fDiaList}
            loopLengthList={loopLengthList}
            gaugeList={gaugeList}
            fabricList={fabricList}
          />
        </PDFViewer>
      </Modal>

      <TransactionLayout
        className="po-form-geist"
        showTabs={true}
        title="Fabric Proforma Invoice"
        closeIcon={<IoArrowBackCircleSharp className="w-6 h-6" />}
        onClose={onClose}
        onKeyDown={handleKeyDown}
        leftSidebar={basicDetailsSidebar}
        sidebarWidthClass="w-[260px] xl:w-[280px]"
        headerActions={headerActionsContent}
        header={headerContent}
        detailsContent={headerContent}
        detailsTitle="Transaction Details"
        gridItems={
          <ProformaInvoiceFabricItems
            fabricItems={fabricItems}
            enrichedItems={enrichedData}
            setFabricItems={setFabricItems}
            readOnly={effectiveReadOnly}
            taxTemplateId={taxTemplateId}
            id={id}
            isCurrencySymbol={isCurrencySymbol}
            currencyCode={currencyCode}
            termsRef={termsRef}
            isCustomerExport={isCustomerExport}
            isSupplierOutside={isSupplierOutside}
            uomList={uomList}
            hsnList={hsnList}
            colorList={colorList}
            gsmList={gsmList}
            designList={designList}
            kDiaList={kDiaList}
            fDiaList={fDiaList}
            loopLengthList={loopLengthList}
            gaugeList={gaugeList}
            fabricList={fabricList}
          />
        }
        footer={footerContent}
      />
    </div>
  );
};

export default ProformaInvoiceFabricForm;
