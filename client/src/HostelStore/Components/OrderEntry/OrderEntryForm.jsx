import { IoArrowBackCircleSharp } from "react-icons/io5";

import {
  CheckBox,
  CheckBoxNew,
  DateInputNew,
  DropdownInput,
  DropdownNew,
  ReusableInput,
  TextInput,
} from "../../../Inputs";
import { orderTypes, gridTypes } from "../../../Utils/DropdownData";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import {
  findFromList,
  formatCurrencyAmount,
  getCommonParams,
  ModeChip,
  renameFile,
} from "../../../Utils/helper";
import { toast } from "react-toastify";
import { FiCheck, FiEdit2, FiSave, FiSend } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import Swal from "sweetalert2";
import { TransactionLayout } from "../../../Basic/components/Reuseable";
import {
  dropDownListObject,
  dropDownListObjectMultiple,
} from "../../../Utils/contructObject";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import { PartyMaster } from "../index.js";
import { DropdownWithModal } from "../../../Inputs/Reuseable.js";
import Modal from "../../../UiComponents/Modal/index.js";
import { getImageUrlPath } from "../../../Constants/index.js";
import { Plus } from "lucide-react";
import {
  useAddOrderEntryMutation,
  useGetOrderEntryByIdQuery,
  useUpdateOrderEntryMutation,
} from "../../../redux/uniformService/OrderEntryService.js";
import { QRCodeCanvas } from "qrcode.react";
import CommonFormFooter from "../../../Basic/components/Reuseable/CommonFormFooter.jsx";
import { PDFViewer } from "@react-pdf/renderer";
import OrderEntryPrintFormat from "./OrderEntryPrintFormat.jsx";
import { FiFileText, FiPrinter, FiEye } from "react-icons/fi";

import { useGetSizeMasterQuery } from "../../../redux/services/SizemasterService.js";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { useAddApprovalStausMutation } from "../../../redux/uniformService/PoServices.js";
import { useGetUomQuery } from "../../../redux/services/UomMasterService.js";
import { useGetGsmMasterQuery } from "../../../redux/services/GsmMasterService.js";
import ProformaInvoiceApi, {
  useGetPIListQuery,
  useLazyGetProformaInvoiceByIdQuery,
} from "../../../redux/uniformService/ProformaInvoiceService.js";

import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices.js";
import { useDispatch } from "react-redux";
import JobCardApi from "../../../redux/uniformService/JobCardService.js";

import PoSummary from "../PurchaseOrder/PoSummary";
import { calculateTaxWithHSNBreakupAndInsertIntoPoItems } from "../../../Utils/taxSummary";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices.js";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { useGetPaytermMasterQuery } from "../../../redux/services/payTermMasterService.js";
import { useGetbankQuery } from "../../../redux/services/BankMasterService.js";
import { useGetCurrenciesQuery } from "../../../redux/services/CurrencyMasterService.js";
import {
  PayTermMaster,
  BankMaster,
  CurrencyMaster,
} from "../../../Basic/components";
import {
  useGetPIListYarnQuery,
  useLazyGetYarnProformaInvoiceByIdQuery,
} from "../../../redux/uniformService/YarnProformaInvoiceService.js";
import YarnItems from "./yarnItems.jsx";
import FabricItems from "./fabricItems.jsx";
import { useGetColorMasterQuery } from "../../../redux/services/ColorMasterService.js";
import { useGetYarnMasterQuery } from "../../../redux/services/YarnMasterService.js";
import { useGetFabricMasterQuery } from "../../../redux/services/FabricMasterService.js";
import { useGetDesignMasterQuery } from "../../../redux/services/DesignMasterService";
import { useGetLoopLengthMasterQuery } from "../../../redux/services/LooplengthMasterService";
import { useGetDiaMasterQuery } from "../../../redux/services/DiaMasterService";
import { useGetGaugeMasterQuery } from "../../../redux/services/GaugeMasterService";

const EMPTY_FABRIC_ROW = {
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

const EMPTY_YARN_ROW = {
  yarnId: "",
  hsnId: "",
  colorId: "",
  uomId: "",
  noOfbags: "",
  weightPerBag: "",
  qty: "",
  price: "",
  amount: "",
  taxPercent: "",
  discountvalue: "",
  discounttype: "",
};

const padFabricItems = (itemsArray = [], minLength = 14) => {
  const currentLength = itemsArray.length;
  const formattedItems = itemsArray.map((item) =>
    item.rowId
      ? item
      : { ...item, rowId: Math.random().toString(36).substring(2, 9) },
  );

  if (currentLength < minLength) {
    const padding = Array.from({ length: minLength - currentLength }, () => ({
      ...EMPTY_FABRIC_ROW,
      rowId: Math.random().toString(36).substring(2, 9),
    }));
    return [...formattedItems, ...padding];
  }
  return formattedItems;
};

const padYarnItems = (itemsArray = [], minLength = 14) => {
  const currentLength = itemsArray.length;
  const formattedItems = itemsArray.map((item) =>
    item.rowId
      ? item
      : { ...item, rowId: Math.random().toString(36).substring(2, 9) },
  );

  if (currentLength < minLength) {
    const padding = Array.from({ length: minLength - currentLength }, () => ({
      ...EMPTY_YARN_ROW,
      rowId: Math.random().toString(36).substring(2, 9),
    }));
    return [...formattedItems, ...padding];
  }
  return formattedItems;
};
const OrderEntryForm = ({
  onClose,
  id,
  setId,
  readOnly,
  setReadOnly,
  customerList,
  termsData,
  branchList,
  canApprove,
  userData,
  branchData,
  hasPermission,
  cityList,
}) => {
  const today = new Date();
  const [docDate, setDocDate] = useState(
    moment.utc(today).format("YYYY-MM-DD"),
  );
  const [customerId, setCustomerId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [requirements, setRequirements] = useState("");
  const [orderType, setOrderType] = useState("AGAINSTPI");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [docId, setDocId] = useState("");
  const [summary, setSummary] = useState(false);
  const [attachmentModal, setAttachmentModal] = useState(false);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [termsAndCondition, setTermsAndCondition] = useState("");
  const [termsId, setTermsId] = useState("");
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [orderFabricItems, setFabricItems] = useState(padFabricItems([]));
  const [orderYarnItems, setYarnItems] = useState(padYarnItems([]));
  const [approvalModal, setApprovalModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [proFormaFabricId, setProFormaIFabricId] = useState("");
  const [proFormaYarnId, setProFormaIYarnId] = useState("");
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [payTermId, setPayTermId] = useState("");
  const [bankId, setBankId] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [carriageCharge, setCarriageCharge] = useState("");
  const [loadingId, setLoadingId] = useState("");
  const [deliveryId, setDeliveryId] = useState("");
  const [carriageTax, setCarriageTax] = useState("");
  const [carriageFinalAmt, setCarriageFinalAmt] = useState("");
  const [customerPoNo, setCustomerPoNo] = useState("");
  const [orderGridType, setOrderGridType] = useState("FABRIC");
  const [fabricPIDocId, setFabricPIDocId] = useState("");
  const [yarnPIDocId, setYarnPIDocId] = useState("");
  const dispatch = useDispatch();
  const qrRef = useRef(null);
  const customerRef = useRef(null);
  const childRecord = useRef(0);
  const termsRef = useRef(null);

  const [dispatchInvalidate] = useInvalidateTags();
  const { userId, finYearId, branchId, companyId } = getCommonParams();
  const params = {
    branchId,
    companyId,
    finYearId,
  };

  const { data: payTermList } = useGetPaytermMasterQuery({ params });
  const { data: bankList } = useGetbankQuery({ params });
  const { data: currencyList } = useGetCurrenciesQuery({ params });

  const {
    data: singleData,

    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetOrderEntryByIdQuery(id, {
    params,
    skip: !id,
  });

  const { data: uomList } = useGetUomQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: gsmList } = useGetGsmMasterQuery({ params });
  const { data: fabricPIList } = useGetPIListQuery({
    params: { companyId, branchId },
  });

  const { data: YarnPIList } = useGetPIListYarnQuery({
    params: { companyId, branchId },
  });

  const { data: hsnList } = useGetHsnMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });

  const { data: yarnList } = useGetYarnMasterQuery({ params });

  const { data: taxTypeList } = useGetTaxTemplateQuery({
    params: { companyId },
  });
  const { data: supplierData } = useGetPartyByIdQuery(customerId, {
    skip: !customerId,
  });

  const isCustomerExport = supplierData?.data?.isCustomerExport;
  const isCurrencySymbol = currencyList?.data?.find(
    (item) => item?.id === currencyId,
  )?.symbol;
  const currencyCode = currencyList?.data?.find(
    (item) => item?.id === currencyId,
  )?.code;

  const [addData] = useAddOrderEntryMutation();
  const [updateData] = useUpdateOrderEntryMutation();
  const [addApprovalStatus] = useAddApprovalStausMutation();
  const [getPIById] = useLazyGetProformaInvoiceByIdQuery();
  const [getYarnPIById] = useLazyGetYarnProformaInvoiceByIdQuery();

  const { data: fabricList } = useGetFabricMasterQuery({
    params: { companyId },
  });
  const { data: designList } = useGetDesignMasterQuery({
    params: { companyId },
  });
  const { data: loopLengthList } = useGetLoopLengthMasterQuery({
    params: { companyId },
  });
  const { data: diaList } = useGetDiaMasterQuery({
    params: { companyId },
  });
  const { data: gaugeList } = useGetGaugeMasterQuery({
    params: { companyId },
  });
  const kDiaList = diaList?.data?.filter((val) => val?.kDia);
  const fDiaList = diaList?.data?.filter((val) => val?.fDia);

  const status = singleData?.data?.approvalStatus?.status;
  const isDisabled =
    (status === "APPROVED" || status === "PENDING") && !canApprove;

  const syncFormWithDb = useCallback(
    (data) => {
      setDocId(data?.docId ? data?.docId : "New");
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(new Date()).format("YYYY-MM-DD"),
      );
      setOrderType(data?.orderType || "AGAINSTPI");
      setCustomerId(data?.customerId || "");
      setRemarks(data?.remarks || "");
      setAttachments(data?.attachments ? data?.attachments : []);
      setRequirements(data?.requirements || "");
      setDeliveryDate(
        data?.deliveryDate
          ? moment.utc(data.deliveryDate).format("YYYY-MM-DD")
          : "",
      );
      setFabricPIDocId(data?.ProformaFabric?.docId);
      setYarnPIDocId(data?.ProformaYarn?.docId);
      setTermsAndCondition(data?.termsAndCondition || "");
      setTermsId(data?.termsId || "");
      childRecord.current = data?.childRecord ? data?.childRecord : 0;

      const mappedItems = data?.orderFabricItems?.map((item) => ({
        ...item,
        weightPerRoll: item?.weightPerRoll?.toFixed(3),
        totalKgs: item?.totalKgs?.toFixed(3),
        pricePerKg: item?.pricePerKg?.toFixed(2),
        totalPrice: item?.totalPrice?.toFixed(2),
        qty: item?.qty?.toFixed(3),
        price: item?.price?.toFixed(2),
        amount: item?.amount?.toFixed(2),
      }));

      setFabricItems(padFabricItems(mappedItems || []));

      const mappedYarnItems = data?.orderYarnItems?.map((item) => ({
        ...item,
        weightPerBag: item?.weightPerBag?.toFixed(3),
        qty: item?.qty?.toFixed(3),
        price: item?.price?.toFixed(2),
        amount: item?.amount?.toFixed(2),
      }));

      setYarnItems(padYarnItems(mappedYarnItems || []));
      setProFormaIFabricId(data?.proFormaFabricId || "");
      setProFormaIYarnId(data?.proFormaYarnId || "");
      setTaxTemplateId(data?.taxTemplateId || "");
      setDiscountType(data?.discountType || "");
      setDiscountValue(data?.discountValue);
      setPayTermId(data?.payTermId || "");
      setBankId(data?.bankId || "");
      setCurrencyId(data?.currencyId || "");
      setCarriageCharge(data?.carriageCharge?.toFixed(2) || "");
      setCarriageTax(data?.carriageTax?.toFixed(2) || "");
      setLoadingId(data?.loadingId || "");
      setDeliveryId(data?.deliveryId || "");
      setCustomerPoNo(data?.customerPoNo);
      setOrderGridType(data?.orderGridType || "FABRIC");
    },
    [id],
  );

  useEffect(() => {
    if (id && singleData?.data) {
      syncFormWithDb(singleData.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  let data = {
    id,
    docDate,
    branchId: parseInt(branchId),
    userId: parseInt(userId),
    finYearId: parseInt(finYearId),
    companyId: parseInt(companyId),
    customerId: parseInt(customerId),
    orderType,
    orderGridType,
    proFormaFabricId: parseInt(proFormaFabricId),
    proFormaYarnId: parseInt(proFormaYarnId),
    customerPoNo,
    taxTemplateId,
    payTermId,
    currencyId,
    loadingId,
    deliveryId,
    deliveryDate,
    carriageCharge,
    carriageTax,
    bankId,
    orderFabricItems: orderFabricItems?.filter((i) => i.fabricId),
    orderYarnItems: orderYarnItems?.filter((i) => i.yarnId),
    termsAndCondition,
    termsId,
    remarks,
    requirements,
    discountType,
    discountValue,
    attachments: attachments?.filter((i) => i.filePath),
    docId,
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      const formData = new FormData();
      for (let key in data) {
        if (key == "attachments") {
          formData.append(
            key,
            JSON.stringify(
              data[key].map((i) => ({
                ...i,
                filePath:
                  i.filePath instanceof File ? i.filePath.name : i.filePath,
              })),
            ),
          );
          data[key].forEach((option) => {
            if (option?.filePath instanceof File) {
              formData.append("images", option.filePath);
            }
          });
        } else if (
          Array.isArray(data[key]) ||
          (typeof data[key] === "object" && data[key] !== null)
        ) {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: formData }).unwrap();
      } else {
        returnData = await callback(formData).unwrap();
      }
      if (returnData.statusCode === 1) {
        toast.error(returnData.message);
      } else {
        Swal.fire({
          icon: "success",
          title: `${text || "Saved"} Successfully`,
          showConfirmButton: false,
          timer: 2000,
          didClose: () => {
            if (returnData.statusCode === 0) {
              if (nextProcess == "new") {
                setId(0);
                setDocId("New");
                syncFormWithDb(undefined);
                setTimeout(() => {
                  customerRef.current?.focus();
                }, 100);
              }
              if (nextProcess == "close") {
                onClose();
              }
            } else {
              toast.error(returnData?.message);
            }
          },
        });
        dispatchInvalidate();
        dispatch(ProformaInvoiceApi.util.invalidateTags(["proformaInvoice"]));
        dispatch(JobCardApi.util.invalidateTags(["jobCard"]));
      }
    } catch (error) {
      console.log("handle", error);
    }
  };

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
      if (orderGridType === "FABRIC") {
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
      } else {
        if (!item.yarnId) {
          errors.push(`Row ${index + 1}: Yarn is required`);
        }
        if (!item.hsnId) {
          errors.push(`Row ${index + 1}: HSN is required`);
        }
        if (!item.uomId) {
          errors.push(`Row ${index + 1}: UOM is required`);
        }
        if (!item.noOfbags || Number(item.noOfbags) <= 0) {
          errors.push(`Row ${index + 1}: Number of Bags is required`);
        }
        if (!item.weightPerBag || Number(item.weightPerBag) <= 0) {
          errors.push(`Row ${index + 1}: Weight per Bag is required`);
        }
        if (!item.qty || Number(item.qty) <= 0) {
          errors.push(`Row ${index + 1}: Qty is required`);
        }
        if (!item.price || Number(item.price) <= 0) {
          errors.push(`Row ${index + 1}: Price must be greater than 0`);
        }
        const key = `${item.yarnId}_${item.hsnId}_${item.colorId}_${item.noOfbags}_${item.weightPerBag}`;
        if (seen.has(key)) {
          errors.push(`Row ${index + 1}: Duplicate item found`);
        } else {
          seen.add(key);
        }
      }

      if (isCustomerExport && !loadingId) {
        errors.push(`Loading Port is required`);
      }

      if (isCustomerExport && !deliveryId) {
        errors.push(`Delivery Port is required`);
      }
    });

    return errors;
  };

  const validateData = (data) => {
    const items =
      data.orderGridType === "FABRIC"
        ? data?.orderFabricItems || []
        : data?.orderYarnItems || [];
    const checks = [
      { condition: !data.customerId, title: "Customer is required!" },
      { condition: !data.orderType, title: "Order Type is required!" },
      {
        condition:
          data.orderType === "AGAINSTPI" &&
          data.orderGridType === "FABRIC" &&
          !data.proFormaFabricId,
        title: "Fabric PI No is required!",
      },
      {
        condition:
          data.orderType === "AGAINSTPI" &&
          data.orderGridType === "YARN" &&
          !data.proFormaYarnId,
        title: "Yarn PI No is required!",
      },

      { condition: !data.deliveryDate, title: "Delivery Date is required!" },
      {
        condition: data.deliveryDate < data.docDate,
        title: "Delivery Date cannot be smaller than Doc Date!",
      },

      { condition: items.length === 0, title: "Order Items are required!" },
      {},
    ];

    const failed = checks.find((c) => c.condition);
    if (failed) {
      Swal.fire({
        icon: "warning",
        title: failed.title,
        html: failed.html,
        timer: failed.html ? undefined : 1500,
        showConfirmButton: !!failed.html,
        confirmButtonText: "OK",
      });
      return false;
    }
    const rowErrors = validateRows(items);
    if (rowErrors.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Row Validation Error",
        html: `<div style="text-align:left">${rowErrors.join("<br/>")}</div>`,
      });
      return false;
    }

    return true;
  };

  const saveData = (nextProcess, options = {}) => {
    const submitApprovalFlag = !!options.submitApproval;
    if (!validateData(data)) {
      return;
    }
    if (id) {
      if (!window.confirm("Are you sure update the details ...?")) {
        return;
      }
    }
    if (nextProcess == "draft" && !id) {
      handleSubmitCustom(
        addData,
        (data = { ...data, draftSave: true }),
        "Added",
        nextProcess,
      );
    } else if (id && nextProcess == "draft") {
      handleSubmitCustom(
        updateData,
        { ...data, draftSave: true },
        "Updated",
        nextProcess,
      );
    } else if (id) {
      handleSubmitCustom(
        updateData,
        { ...data, ...(submitApprovalFlag ? { submitApproval: true } : {}) },
        "Updated",
        nextProcess,
      );
    } else {
      handleSubmitCustom(
        addData,
        { ...data, ...(submitApprovalFlag ? { submitApproval: true } : {}) },
        "Added",
        nextProcess,
      );
    }
  };

  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveData("close");
    }
  };

  useEffect(() => {
    customerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (attachments?.length >= 5) return;
    setAttachments((prev) => {
      let newArray = Array.from({ length: 5 - prev?.length }, () => {
        return { date: today, filePath: "", log: "", name: "" };
      });
      return [...prev, ...newArray];
    });
  }, [setAttachments, attachments]);

  function handleInputChange(value, index, field) {
    const newBlend = structuredClone(attachments);
    newBlend[index][field] = value;
    setAttachments(newBlend);
  }

  function openPreview(filePath) {
    window.open(
      filePath instanceof File
        ? URL.createObjectURL(filePath)
        : getImageUrlPath(filePath),
    );
  }

  function addNewComments() {
    setAttachments((prev) => [...prev, { log: "", date: today, filePath: "" }]);
  }

  function deleteRow(index) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  const handleApprovalAction = (type) => {
    setActionType(type);
    setApprovalRemarks("");
    setApprovalModal(true);
  };

  const handleConfirmAction = async () => {
    if (actionType === "REJECT" && !approvalRemarks.trim()) {
      toast.warning("Remarks required for sending back!");
      return;
    }
    setActionLoading(true);
    try {
      const result = await addApprovalStatus({
        userId: userData?.id,
        remarks: approvalRemarks || null,
        actionType,
        referenceId: id,
        referencePage: "ORDER ENTRY",
        recordData: {},
      }).unwrap();

      if (result.statusCode === 0) {
        toast.success(
          result.message ||
            (actionType === "APPROVE"
              ? "Order Entry Approved!"
              : "Sent Back for Review!"),
        );
        setApprovalModal(false);
        // dispatchInvalidate();
        onClose();
      } else {
        toast.error(result.message || "Action failed");
        setApprovalModal(false);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong!");
      setApprovalModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const isSupplierOutside = useMemo(() => {
    return supplierData?.data?.City?.state?.name !== "TAMILNADU";
  }, [supplierData]);

  const enrichedData = useMemo(() => {
    const isFabric = orderGridType === "FABRIC";
    const filteredItems = (
      isFabric
        ? (orderFabricItems || []).filter((i) => i.fabricId)
        : (orderYarnItems || []).filter((i) => i.yarnId)
    ).map((i) => ({
      ...i,
      qty: i.qty,
    }));
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
  }, [
    orderGridType,
    orderFabricItems,
    orderYarnItems,
    isSupplierOutside,
    discountType,
    discountValue,
  ]);

  return (
    <>
      <Modal isOpen={summary} onClose={() => setSummary(false)} widthClass="">
        <PoSummary
          poItems={
            orderGridType === "FABRIC" ? orderFabricItems : orderYarnItems
          }
          totals={enrichedData}
          readOnly={readOnly || isDisabled || childRecord.current > 0}
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          setSummary={setSummary}
          isCustomerExport={isCustomerExport}
        />
      </Modal>

      <Modal
        isOpen={approvalModal}
        onClose={() => setApprovalModal(false)}
        widthClass="w-[420px]"
      >
        <div className="space-y-4">
          <h2
            className={`text-base font-semibold ${
              actionType === "APPROVE" ? "text-green-700" : "text-blue-700"
            }`}
          >
            {actionType === "APPROVE"
              ? "✅ Approve Order Entry"
              : "↩️ Send Back for Review"}
          </h2>

          <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Order Entry No</span>
              <span className="font-medium text-gray-800">{docId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Customer</span>
              <span className="font-medium text-gray-800">
                {findFromList(customerId, customerList?.data, "name")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Current Approval</span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  status === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : status === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : status === "SUPERSEDED"
                        ? "bg-orange-100 text-orange-700" // ✅ NEW
                        : "bg-orange-100 text-orange-700"
                }`}
              >
                {status === "PENDING"
                  ? "Waiting For Approval"
                  : status === "SUPERSEDED"
                    ? "Re-approval Required" // ✅ NEW
                    : status}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Remarks{" "}
              {actionType === "REJECT" && (
                <span className="text-red-500">* required</span>
              )}
            </label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300 resize-none"
              placeholder={
                actionType === "APPROVE"
                  ? "Optional remarks..."
                  : "Reason for sending back (required)..."
              }
              value={approvalRemarks}
              onChange={(e) => setApprovalRemarks(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setApprovalModal(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setApprovalModal(false);
                }
              }}
              className="px-4 py-1.5 text-xs rounded text-white hover:bg-red-600 bg-red-500"
            >
              Cancel
            </button>
            <button
              disabled={actionLoading}
              onClick={handleConfirmAction}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleConfirmAction();
                }
              }}
              className={`px-4 py-1.5 text-xs rounded text-white font-semibold transition ${
                actionType === "APPROVE"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
            >
              {actionLoading ? (
                <>
                  <svg
                    className="animate-spin h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Processing...
                </>
              ) : actionType === "APPROVE" ? (
                "Confirm Approve"
              ) : (
                "Send Back"
              )}
            </button>
          </div>
        </div>
      </Modal>
      {attachmentModal && (
        <Modal
          isOpen={attachmentModal}
          onClose={() => {
            setAttachmentModal(false);
            setSelectedAttachmentIndex(null);
          }}
          widthClass="p-4 w-[600px] h-[420px]"
        >
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-700">
              Attachments
            </h2>

            {/* Drag & Drop Zone */}
            <div
              className="border-2 border-dashed border-indigo-300 rounded-lg p-4 text-center cursor-pointer hover:bg-indigo-50 transition"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && selectedAttachmentIndex !== null) {
                  handleInputChange(
                    renameFile(file),
                    selectedAttachmentIndex,
                    "filePath",
                  );
                }
              }}
              onClick={() =>
                document.getElementById("modal-file-upload")?.click()
              }
            >
              <p className="text-sm text-slate-500">
                Drag & drop here, or{" "}
                <span className="text-indigo-600 font-medium underline">
                  click to browse
                </span>
              </p>
              {selectedAttachmentIndex !== null ? (
                <p className="text-xs text-indigo-500 mt-1">
                  Uploading to row:{" "}
                  <strong>{selectedAttachmentIndex + 1}</strong>
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">
                  Select a row below first
                </p>
              )}
            </div>

            {/* Hidden file input for drag & drop zone */}
            <input
              type="file"
              id="modal-file-upload"
              className="hidden"
              onChange={(e) => {
                if (e.target.files[0] && selectedAttachmentIndex !== null) {
                  handleInputChange(
                    renameFile(e.target.files[0]),
                    selectedAttachmentIndex,
                    "filePath",
                  );
                  e.target.value = "";
                }
              }}
              disabled={readOnly}
            />

            {/* Attachments Table */}
            <div className="max-h-[200px] overflow-auto">
              <div className="border-collapse bg-[#F1F1F0] shadow-sm overflow-auto">
                <table className="bg-gray-200 text-gray-800 text-sm table-auto w-full">
                  <thead className="py-2 font-medium sticky top-0">
                    <tr>
                      <th className="py-2 text-xs w-10 text-center border-r border-white/50">
                        S.No
                      </th>
                      <th className="py-2 text-xs w-60 text-center border-r border-white/50">
                        Name
                      </th>
                      <th className="py-2 text-xs w-60 text-center border-r border-white/50">
                        File
                      </th>
                      <th className="py-2 text-xs w-10 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attachments?.map((item, index) => (
                      <tr
                        key={index}
                        onClick={() => setSelectedAttachmentIndex(index)}
                        className={`transition-colors border-b border-gray-200 text-[12px] cursor-pointer ${
                          index === selectedAttachmentIndex
                            ? "bg-indigo-100 border-l-2 border-l-indigo-500"
                            : index % 2 === 0
                              ? "bg-white hover:bg-gray-50"
                              : "bg-gray-100 hover:bg-gray-50"
                        }`}
                      >
                        {/* S.No */}
                        <td className="border-r border-white/50 h-8 text-center">
                          {index + 1}
                        </td>

                        {/* Name */}
                        <td className="border-r border-white/50 h-8">
                          <input
                            type="text"
                            className="text-left rounded py-1 px-2 w-full focus:outline-none focus:ring focus:border-blue-300 bg-transparent"
                            value={item?.name}
                            onChange={(e) =>
                              handleInputChange(e.target.value, index, "name")
                            }
                            onClick={(e) => e.stopPropagation()}
                            disabled={readOnly}
                          />
                        </td>

                        {/* File */}
                        <td className="border-r border-white/50 h-8 px-2">
                          <div className="flex items-center gap-2">
                            {!readOnly && (
                              <label
                                htmlFor={`modal-row-upload-${index}`}
                                className="cursor-pointer flex items-center justify-center p-1 bg-gray-100 rounded hover:bg-gray-200"
                                title="Attach file"
                                onClick={(e) => e.stopPropagation()}
                              >
                                📎
                                <input
                                  type="file"
                                  id={`modal-row-upload-${index}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files[0]) {
                                      handleInputChange(
                                        renameFile(e.target.files[0]),
                                        index,
                                        "filePath",
                                      );
                                      e.target.value = "";
                                    }
                                  }}
                                  disabled={readOnly}
                                />
                              </label>
                            )}

                            {item.filePath ? (
                              <>
                                <span className="truncate max-w-[120px] text-green-700 font-medium">
                                  ✅ {item.filePath?.name ?? item.filePath}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPreview(item.filePath);
                                  }}
                                  className="text-blue-600 text-xs hover:underline"
                                >
                                  View
                                </button>
                                {!readOnly && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInputChange("", index, "filePath");
                                    }}
                                    className="text-red-600 text-xs"
                                    title="Remove file"
                                    disabled={readOnly}
                                  >
                                    ✕
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 italic text-xs">
                                No file
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="w-[30px] border-gray-200 h-8">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addNewComments();
                              }}
                              disabled={readOnly}
                              className="flex items-center px-1 bg-blue-50 rounded"
                            >
                              <Plus size={18} className="text-blue-800" />
                            </button>
                            <button
                              className="flex items-center px-1 bg-red-50 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteRow(index);
                                if (selectedAttachmentIndex === index) {
                                  setSelectedAttachmentIndex(null);
                                }
                              }}
                              disabled={readOnly}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-red-800"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  setAttachmentModal(false);
                  setSelectedAttachmentIndex(null);
                }}
                className="px-2 py-1 text-sm rounded bg-green-700 text-white hover:bg-green-800 border border-green-800"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {printModalOpen && (
        <Modal
          isOpen={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
          widthClass="w-[90%] h-[90%]"
        >
          <PDFViewer className="w-full h-full border-none">
            <OrderEntryPrintFormat
              data={singleData?.data}
              taxDetails={enrichedData}
              totals={enrichedData}
              customerDetails={
                customerList?.data?.find((c) => c.id === customerId) ||
                supplierData?.data
              }
              branchData={branchData?.data}
              isCustomerExport={isCustomerExport}
              cityList={cityList}
              currencyList={currencyList}
              payTermList={payTermList}
              bankList={bankList}
              carriageFinalAmt={carriageFinalAmt}
              uomList={uomList}
              sizeList={sizeList}
              hsnList={hsnList}
              colorList={colorList}
              gsmList={gsmList}
              designList={designList}
              kDiaList={kDiaList}
              fDiaList={fDiaList}
              loopLengthList={loopLengthList}
              gaugeList={gaugeList}
              fabricList={fabricList}
              yarnList={yarnList}
            />
          </PDFViewer>
        </Modal>
      )}
      <TransactionLayout
        title="Order Entry"
        badge={<ModeChip id={id} readOnly={readOnly} />}
        closeIcon={<IoArrowBackCircleSharp className="w-7 h-7" />}
        onClose={onClose}
        onKeyDown={handleKeyDown}
        header={
          <div className="flex flex-col gap-2">
            <div className="flex flex-col xl:flex-row gap-1">
              {/* Basic Details */}

              <div className="w-fit border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
                <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">
                  Basic Details
                </h2>
                <div className="flex gap-2">
                  <div className="w-36">
                    <TextInput name="Order No" value={docId} disabled={true} />
                  </div>
                  <div className="w-24">
                    <DateInputNew
                      name="Order Date"
                      value={docDate}
                      setValue={setDocDate}
                      disabled={true}
                      required={true}
                      type="date"
                    />
                  </div>
                </div>
              </div>
              {/* Customer Details */}

              <div className=" w-fit border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
                <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">
                  Customer Details
                </h2>
                <div className="flex gap-2">
                  <div className="w-48">
                    <DropdownWithModal
                      name="Customer"
                      options={dropDownListObject(
                        id
                          ? customerList?.data?.filter(
                              (item) => item?.isCustomer,
                            )
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
                      className={`w-full`}
                      addNewLabel="+ Add New Customer"
                      childComponent={PartyMaster}
                      addNewModalWidth="w-[90%] h-[95%]"
                      disabled={childRecord.current > 0 || readOnly || id}
                      ref={customerRef}
                      openOnFocus={true}
                    />
                  </div>
                  <div className="w-28">
                    <TextInput
                      name="Contact Person"
                      placeholder="Contact name"
                      value={findFromList(
                        customerId,
                        customerList?.data,
                        "contactPersonName",
                      )}
                      disabled={true}
                    />
                  </div>
                  <div className="w-24">
                    <TextInput
                      name="Phone"
                      placeholder="Contact number"
                      value={findFromList(
                        customerId,
                        customerList?.data,
                        "contactNumber",
                      )}
                      disabled={true}
                    />
                  </div>
                </div>
              </div>
              {/* Order Details */}

              <div className="flex-1 border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
                <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">
                  Order Details
                </h2>
                <div className="flex gap-2">
                  <div className="w-28 md:w-32">
                    <DropdownInput
                      name="Order Type"
                      options={orderTypes}
                      value={orderType}
                      setValue={(value) => {
                        setOrderType(value);
                        setProFormaIFabricId("");
                        setProFormaIYarnId("");
                        if (value === "GENERAL") {
                          setFabricItems(padFabricItems([]));
                          setYarnItems(padYarnItems([]));
                          setTaxTemplateId("");
                          setDiscountType("");
                          setDiscountValue();
                          setTermsId("");
                          setTermsAndCondition("");
                          setDeliveryDate("");
                          setRemarks("");
                          setPayTermId("");
                          setBankId("");
                          setCurrencyId("");
                          setCarriageCharge("");
                          setLoadingId("");
                          setDeliveryId("");
                          setCarriageTax("");
                          setCustomerPoNo("");
                        }
                      }}
                      required={true}
                      readOnly={readOnly}
                      disabled={childRecord.current > 0 || readOnly || id}
                    />
                  </div>
                  <div className="w-24 mr-1">
                    <DropdownInput
                      name="Item Type"
                      options={gridTypes}
                      value={orderGridType}
                      setValue={(value) => {
                        setOrderGridType(value);
                      }}
                      required={true}
                      readOnly={readOnly}
                      disabled={childRecord.current > 0 || readOnly || id}
                    />
                  </div>
                  {orderGridType === "FABRIC" ? (
                    <>
                      {id ? (
                        <>
                          <div className="w-44">
                            <TextInput
                              name="Fabric PI No"
                              placeholder="Fabric PI No"
                              value={fabricPIDocId}
                              disabled={true}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-44">
                            <DropdownNew
                              name="Fabric PI No"
                              dataList={fabricPIList?.data?.filter(
                                (item) => item?.customerId === customerId,
                              )}
                              value={proFormaFabricId}
                              setValue={setProFormaIFabricId}
                              required={orderType === "AGAINSTPI"}
                              readOnly={
                                childRecord.current > 0 ||
                                readOnly ||
                                orderType === "GENERAL"
                              }
                              disabled={
                                childRecord.current > 0 ||
                                readOnly ||
                                orderType === "GENERAL"
                              }
                              otherField={"docId"}
                              beforeChange={async (selectedValue) => {
                                if (!selectedValue) {
                                  setFabricItems(padFabricItems([]));
                                  return;
                                }

                                const res = await getPIById(
                                  selectedValue?.id,
                                ).unwrap();

                                setTaxTemplateId(
                                  res?.data?.taxTemplateId || "",
                                );
                                setDiscountType(res?.data?.discountType || "");
                                setDiscountValue(res?.data?.discountValue);

                                if (res?.data?.termsId)
                                  setTermsId(res.data.termsId);
                                if (res?.data?.termsAndCondition)
                                  setTermsAndCondition(
                                    res.data.termsAndCondition,
                                  );
                                if (res?.data?.deliveryDate)
                                  setDeliveryDate(
                                    moment
                                      .utc(res.data.deliveryDate)
                                      .format("YYYY-MM-DD"),
                                  );
                                if (res?.data?.remarks)
                                  setRemarks(res.data.remarks);

                                setPayTermId(res?.data?.payTermId || "");
                                setBankId(res?.data?.bankId || "");
                                setCurrencyId(res?.data?.currencyId || "");

                                setCarriageCharge(
                                  res?.data?.carriageCharge?.toFixed(2) || "",
                                );
                                setLoadingId(res?.data?.loadingId || "");
                                setDeliveryId(res?.data?.deliveryId || "");
                                setCarriageTax(res?.data?.carriageTax || "");
                                setCustomerPoNo(res?.data?.customerPoNo || "");

                                const itemsArr = res?.data?.fabricItems || [];
                                const maxVersion =
                                  itemsArr.length > 0
                                    ? Math.max(
                                        res?.data?.quoteVersion || 1,
                                        ...itemsArr.map(
                                          (i) => Number(i.quoteVersion) || 1,
                                        ),
                                      )
                                    : res?.data?.quoteVersion || 1;

                                const latestItems = itemsArr.filter(
                                  (item) =>
                                    (Number(item.quoteVersion) || 1) ===
                                    Number(maxVersion),
                                );

                                const mappedItems = latestItems?.map(
                                  (item) => ({
                                    ...item,
                                    weightPerRoll: item?.weightPerRoll
                                      ? Number(item?.weightPerRoll)?.toFixed(3)
                                      : "",
                                    totalKgs: item?.totalKgs
                                      ? Number(item?.totalKgs)?.toFixed(3)
                                      : "",
                                    pricePerKg: item?.pricePerKg
                                      ? Number(item?.pricePerKg)?.toFixed(2)
                                      : "",
                                    totalPrice: item?.totalPrice
                                      ? Number(item?.totalPrice)?.toFixed(2)
                                      : "",
                                    qty: item?.qty
                                      ? Number(item?.qty)?.toFixed(3)
                                      : "",
                                    price: item?.price
                                      ? Number(item?.price)?.toFixed(2)
                                      : "",
                                    amount: item?.amount
                                      ? Number(item?.amount)?.toFixed(2)
                                      : "",
                                  }),
                                );

                                setFabricItems(padFabricItems(mappedItems));
                              }}
                            />
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {id ? (
                        <>
                          <div className="w-44">
                            <TextInput
                              name="Yarn PI No"
                              placeholder="Yarn PI No"
                              value={yarnPIDocId}
                              disabled={true}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-44">
                            <DropdownNew
                              name="Yarn PI No"
                              dataList={YarnPIList?.data?.filter(
                                (item) => item?.customerId === customerId,
                              )}
                              value={proFormaYarnId}
                              setValue={setProFormaIYarnId}
                              required={orderType === "AGAINSTPI"}
                              readOnly={
                                childRecord.current > 0 ||
                                readOnly ||
                                orderType === "GENERAL"
                              }
                              disabled={
                                childRecord.current > 0 ||
                                readOnly ||
                                orderType === "GENERAL"
                              }
                              otherField={"docId"}
                              beforeChange={async (selectedValue) => {
                                if (!selectedValue) {
                                  setYarnItems(padYarnItems([]));
                                  return;
                                }

                                const res = await getYarnPIById(
                                  selectedValue?.id,
                                ).unwrap();

                                setTaxTemplateId(
                                  res?.data?.taxTemplateId || "",
                                );
                                setDiscountType(res?.data?.discountType || "");
                                setDiscountValue(res?.data?.discountValue);

                                if (res?.data?.termsId)
                                  setTermsId(res.data.termsId);
                                if (res?.data?.termsAndCondition)
                                  setTermsAndCondition(
                                    res.data.termsAndCondition,
                                  );
                                if (res?.data?.deliveryDate)
                                  setDeliveryDate(
                                    moment
                                      .utc(res.data.deliveryDate)
                                      .format("YYYY-MM-DD"),
                                  );
                                if (res?.data?.remarks)
                                  setRemarks(res.data.remarks);

                                setPayTermId(res?.data?.payTermId || "");
                                setBankId(res?.data?.bankId || "");
                                setCurrencyId(res?.data?.currencyId || "");

                                setCarriageCharge(
                                  res?.data?.carriageCharge?.toFixed(2) || "",
                                );
                                setLoadingId(res?.data?.loadingId || "");
                                setDeliveryId(res?.data?.deliveryId || "");
                                setCarriageTax(res?.data?.carriageTax || "");
                                setCustomerPoNo(res?.data?.customerPoNo || "");

                                const itemsArr = res?.data?.yarnItems || [];
                                const maxVersion =
                                  itemsArr.length > 0
                                    ? Math.max(
                                        res?.data?.quoteVersion || 1,
                                        ...itemsArr.map(
                                          (i) => Number(i.quoteVersion) || 1,
                                        ),
                                      )
                                    : res?.data?.quoteVersion || 1;

                                const latestItems = itemsArr.filter(
                                  (item) =>
                                    (Number(item.quoteVersion) || 1) ===
                                    Number(maxVersion),
                                );

                                const mappedItems = latestItems?.map(
                                  (item) => ({
                                    ...item,
                                    weightPerBag: item?.weightPerBag
                                      ? Number(item?.weightPerBag)?.toFixed(3)
                                      : "",
                                    qty: item?.qty
                                      ? Number(item?.qty)?.toFixed(3)
                                      : "",
                                    price: item?.price
                                      ? Number(item?.price)?.toFixed(2)
                                      : "",
                                    amount: item?.amount
                                      ? Number(item?.amount)?.toFixed(2)
                                      : "",
                                  }),
                                );

                                setYarnItems(padYarnItems(mappedItems));
                              }}
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}

                  <div className="flex-1 min-w-[130px]">
                    <TextInput
                      name="Customer Po No"
                      value={customerPoNo}
                      setValue={setCustomerPoNo}
                      readOnly={readOnly}
                      disabled={
                        childRecord.current > 0 ||
                        readOnly ||
                        orderType === "AGAINSTPI"
                      }
                      type="text"
                      onFocus={(e) => {
                        e.target.select();
                      }}
                    />
                  </div>

                  <div className="w-32">
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
                      readOnly={
                        childRecord.current > 0 ||
                        readOnly ||
                        orderType === "AGAINSTPI"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Other Details */}

            <div className="border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
              <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">
                Other Details
              </h2>
              <div className="flex gap-2 gap-x-2">
                <div className="w-32 ml-10">
                  <DropdownWithModal
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
                    required={false}
                    readOnly={readOnly || orderType === "AGAINSTPI"}
                    className={`w-full max-w-none`}
                    dropdownMinWidth={240}
                    addNewLabel="+ Add New Pay Term"
                    childComponent={PayTermMaster}
                    addNewModalWidth="w-[40%] h-[66%]"
                    disabled={
                      childRecord.current > 0 ||
                      readOnly ||
                      orderType === "AGAINSTPI"
                    }
                  />
                </div>

                <div className="w-32">
                  <DropdownWithModal
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
                    className={`w-full max-w-none`}
                    dropdownMinWidth={240}
                    addNewLabel="+ Add New Currency"
                    childComponent={CurrencyMaster}
                    addNewModalWidth="w-[40%] h-[66%]"
                    readOnly={
                      childRecord.current > 0 ||
                      readOnly ||
                      orderType === "AGAINSTPI" ||
                      !isCustomerExport
                    }
                    required={isCustomerExport}
                  />
                </div>

                <div className="w-64">
                  <DropdownInput
                    name="Loading Port"
                    options={dropDownListObject(
                      cityList?.data?.filter((item) => item.active),
                      "name",
                      "id",
                    )}
                    value={loadingId}
                    setValue={setLoadingId}
                    readOnly={
                      childRecord.current > 0 ||
                      readOnly ||
                      orderType === "AGAINSTPI" ||
                      !isCustomerExport
                    }
                    required={isCustomerExport}
                  />
                </div>
                <div className="w-64">
                  <DropdownInput
                    name="Delivery Port"
                    options={dropDownListObject(
                      cityList?.data?.filter((item) => item.active),
                      "name",
                      "id",
                    )}
                    value={deliveryId}
                    setValue={setDeliveryId}
                    readOnly={
                      childRecord.current > 0 ||
                      readOnly ||
                      orderType === "AGAINSTPI" ||
                      !isCustomerExport
                    }
                    required={isCustomerExport}
                  />
                </div>

                <div className="w-[105px]">
                  <DateInputNew
                    name="Delivery Date"
                    value={deliveryDate}
                    setValue={setDeliveryDate}
                    required={true}
                    readOnly={
                      childRecord.current > 0 ||
                      readOnly ||
                      orderType === "AGAINSTPI"
                    }
                    min={docDate}
                    type={"date"}
                  />
                </div>

                <div className="w-32">
                  <TextInput
                    name={`Carriage Charges ${currencyId ? `(${isCurrencySymbol})` : ""}`}
                    value={carriageCharge}
                    setValue={setCarriageCharge}
                    type="number"
                    min="0"
                    className="text-right"
                    disabled={
                      childRecord.current > 0 ||
                      readOnly ||
                      orderType === "AGAINSTPI"
                    }
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
                <div className="w-24">
                  <TextInput
                    name="Carriage Tax%"
                    value={carriageTax}
                    setValue={setCarriageTax}
                    disabled={
                      childRecord.current > 0 ||
                      readOnly ||
                      orderType === "AGAINSTPI"
                    }
                    type="number"
                    min="0"
                    className="text-right"
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
                <div className="w-32">
                  <TextInput
                    name="Carriage Final Amount"
                    value={carriageFinalAmt}
                    disabled={true}
                    type="number"
                    min="0"
                    className="text-right"
                    onFocus={(e) => {
                      e.target.select();
                    }}
                  />
                </div>
                <div className="w-60">
                  <DropdownWithModal
                    name="Advising Bank"
                    options={dropDownListObjectMultiple(
                      bankList?.data,
                      ["name", "Branch.name"],
                      "id",
                    )}
                    value={bankId}
                    setValue={setBankId}
                    required={false}
                    readOnly={
                      childRecord.current > 0 ||
                      readOnly ||
                      orderType === "AGAINSTPI"
                    }
                    className={`w-[150px]`}
                    addNewLabel="+ Add New Bank"
                    childComponent={BankMaster}
                    addNewModalWidth="w-[45%] h-[64%]"
                    disabled={
                      childRecord.current > 0 ||
                      readOnly ||
                      orderType === "AGAINSTPI"
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        }
        detailsLayout="default"
        detailsLayouts={["default"]}
        gridItems={
          orderGridType === "FABRIC" ? (
            <FabricItems
              orderFabricItems={orderFabricItems}
              setFabricItems={setFabricItems}
              readOnly={
                readOnly ||
                childRecord?.current > 0 ||
                orderType === "AGAINSTPI"
              }
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
              id={id}
              termsRef={termsRef}
              childRecord={childRecord}
              enrichedItems={enrichedData}
              taxTemplateId={taxTemplateId}
              isSupplierOutside={isSupplierOutside}
              orderType={orderType}
              isCustomerExport={isCustomerExport}
              currencyCode={currencyCode}
              isCurrencySymbol={isCurrencySymbol}
            />
          ) : (
            <YarnItems
              orderYarnItems={orderYarnItems}
              setYarnItems={setYarnItems}
              readOnly={
                readOnly ||
                childRecord?.current > 0 ||
                orderType === "AGAINSTPI"
              }
              uomList={uomList}
              hsnList={hsnList}
              colorList={colorList}
              yarnList={yarnList}
              id={id}
              termsRef={termsRef}
              childRecord={childRecord}
              enrichedItems={enrichedData}
              taxTemplateId={taxTemplateId}
              isSupplierOutside={isSupplierOutside}
              orderType={orderType}
              isCustomerExport={isCustomerExport}
              currencyCode={currencyCode}
              isCurrencySymbol={isCurrencySymbol}
            />
          )
        }
        footer={
          <>
            <CommonFormFooter
              remarks={remarks}
              setRemarks={setRemarks}
              terms={termsAndCondition}
              setTerms={setTermsAndCondition}
              readOnly={readOnly || childRecord.current > 0}
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
                  key: "netAmount",
                  label: "Total Amount",
                  value: `${isCurrencySymbol ? isCurrencySymbol + " " : ""}${formatCurrencyAmount(
                    !isCustomerExport
                      ? enrichedData.net
                      : (enrichedData.items?.reduce(
                          (sum, item) => sum + (parseFloat(item.amount) || 0),
                          0,
                        ) || 0) -
                          (enrichedData.itemDiscount +
                            enrichedData.overallDiscount >
                          0
                            ? enrichedData.itemDiscount +
                              enrichedData.overallDiscount
                            : 0),
                    currencyCode || isCurrencySymbol,
                  )}`,
                  summaryColumn: "right",
                  emphasized: true,
                  valueClassName: "text-indigo-700",
                },
                {
                  key: "carriageCharges",
                  label: "Carriage Charges",
                  value: `${isCurrencySymbol ? isCurrencySymbol + " " : ""}${
                    !isNaN(parseFloat(carriageFinalAmt)) &&
                    carriageFinalAmt !== ""
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
                    (!isCustomerExport
                      ? enrichedData.net
                      : (enrichedData.items?.reduce(
                          (sum, item) => sum + (parseFloat(item.amount) || 0),
                          0,
                        ) || 0) -
                        (enrichedData.itemDiscount +
                          enrichedData.overallDiscount >
                        0
                          ? enrichedData.itemDiscount +
                            enrichedData.overallDiscount
                          : 0)) + (parseFloat(carriageFinalAmt) || 0),
                    currencyCode || isCurrencySymbol,
                  )}`,
                  summaryColumn: "right",
                  emphasized: true,
                  valueClassName: "text-indigo-700",
                },
              ]}
            />
            <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
              {/* Left Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => saveData("close")}
                  disabled={isDisabled || readOnly || childRecord.current > 0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveData("close");
                      e.stopPropagation();
                    }
                  }}
                  className={`bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 flex items-center text-xs ${
                    isDisabled || readOnly || childRecord.current > 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <HiOutlineRefresh className="w-4 h-4 mr-2" />
                  {id ? "Update & Close" : "Save & Close"}
                </button>
                <button
                  onClick={() => saveData("new")}
                  disabled={isDisabled || readOnly || childRecord.current > 0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      saveData("new");
                    }
                  }}
                  className={`bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 flex items-center text-xs ${
                    isDisabled || readOnly || childRecord.current > 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  {id ? "Update & New" : " Save & New"}
                </button>
                <button
                  onClick={() => {
                    if (!taxTemplateId) {
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
                  onKeyDown={(e) => {
                    if (!taxTemplateId) {
                      e.preventDefault();
                      e.stopPropagation();
                      toast.info("Please Select Tax Template !", {
                        position: "top-center",
                      });
                      return;
                    }
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      setSummary(true);
                    }
                  }}
                  className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center text-xs"
                >
                  <FiEye className="w-4 h-4 mr-2" />
                  View Summary
                </button>
                {status === "REJECTED" && (
                  <button
                    onClick={() => saveData("close", { submitApproval: true })}
                    disabled={readOnly}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        saveData("close", { submitApproval: true });
                      }
                    }}
                    title="Submit Approval"
                    className="bg-green-700 text-white px-2 py-1 rounded hover:bg-green-800 flex items-center text-xs"
                  >
                    <FiSend className="w-4 h-4" />
                  </button>
                )}
                {id && status === "PENDING" && canApprove && (
                  <button
                    onClick={() => {
                      handleApprovalAction("REJECT");
                    }}
                    disabled={readOnly}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleApprovalAction("REJECT");
                      }
                    }}
                    title="Send Back for Review"
                    className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center text-xs"
                  >
                    <MdKeyboardDoubleArrowLeft className="w-4 h-4" />
                  </button>
                )}
                {id && status === "PENDING" && canApprove && (
                  <button
                    onClick={() => {
                      handleApprovalAction("APPROVE");
                    }}
                    disabled={readOnly}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleApprovalAction("APPROVE");
                      }
                    }}
                    title="Approve"
                    className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 flex items-center text-xs"
                  >
                    <FiCheck className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {!id ||
                  (readOnly && (
                    <button
                      className="bg-yellow-600 text-white px-4 py-1 rounded hover:bg-yellow-700 flex items-center text-xs"
                      onClick={() =>
                        hasPermission(() => setReadOnly(false), "edit")
                      }
                      disabled={isDisabled}
                    >
                      <FiEdit2 className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  ))}
                {id &&
                  (status === "APPROVED" || status === "NOT_CONFIGURED") && (
                    <button
                      onClick={() => {
                        if (qrRef.current) {
                          setQrCodeDataUrl(
                            qrRef.current.toDataURL("image/png"),
                          );
                        }
                        setPrintModalOpen(true);
                      }}
                      className="bg-slate-600 text-white px-2 py-1 rounded hover:bg-slate-700 flex items-center text-xs"
                    >
                      <FiFileText className="w-4 h-4 mr-2" />
                      PDF Export
                    </button>
                  )}
                {
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAttachmentIndex(null);
                      setAttachmentModal(true);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    📎 Upload
                  </button>
                }
              </div>
            </div>
          </>
        }
      />
    </>
  );
};
export default OrderEntryForm;
