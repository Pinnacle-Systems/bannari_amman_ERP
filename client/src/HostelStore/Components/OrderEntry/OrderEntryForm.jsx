import { IoArrowBackCircleSharp } from "react-icons/io5";

import {
  DateInputNew,
  DropdownInput,
  TextInput,
  ReusableInput,
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
  amountInWords,
  formatAmountIN,
} from "../../../Utils/helper";
import { toast } from "react-toastify";
import {
  FiCheck,
  FiEdit2,
  FiSave,
  FiSend,
  FiFileText,
  FiPrinter,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiLayers,
  FiTruck,
  FiUserCheck,
} from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import Swal from "sweetalert2";
import { TransactionLayout } from "../../../Basic/components/Reuseable";
import {
  dropDownListObject,
  dropDownListObjectMultiple,
} from "../../../Utils/contructObject";
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

import { useGetSizeMasterQuery } from "../../../redux/services/SizemasterService.js";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { useAddApprovalStausMutation } from "../../../redux/uniformService/PoServices.js";
import { useGetUomQuery } from "../../../redux/services/UomMasterService.js";
import { useGetGsmMasterQuery } from "../../../redux/services/GsmMasterService.js";
import {
  useGetPIListQuery,
  useLazyGetProformaInvoiceByIdQuery,
} from "../../../redux/uniformService/ProformaInvoiceService.js";

import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices.js";

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
import { useGetProcessMasterQuery } from "../../../redux/services/ProcessMasterService";

import { invalidateFabricModule } from "../../../redux/Dispatch/fabircInvalidateTags.js";
import { invalidateYarnModule } from "../../../redux/Dispatch/yarnInvalidateTags";
import { invalidateOrderEntryModule } from "../../../redux/Dispatch/OrderInvalidateTags.js";
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
  wastePercentage: "",
  requiredQty: "",
  price: "",
  amount: "",
  taxPercent: "",
  discountvalue: "",
  discounttype: "",
  fabricYarnDetails: [],
  fabricProcess: [],
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

const padFabricItems = (itemsArray = [], minLength = 10) => {
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

const padYarnItems = (itemsArray = [], minLength = 10) => {
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
  const [orderType, setOrderType] = useState("GENERAL");
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
  const qrRef = useRef(null);
  const customerRef = useRef(null);
  const childRecord = useRef(0);
  const termsRef = useRef(null);

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
  const { data: processList } = useGetProcessMasterQuery({ params });

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
      setOrderType(data?.orderType || "GENERAL");
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
        wastePercentage:
          item?.wastePercentage != null
            ? Number(item?.wastePercentage).toFixed(2)
            : "",
        requiredQty:
          item?.requiredQty != null
            ? Number(item?.requiredQty).toFixed(3)
            : item?.qty != null
              ? (
                  Number(item?.qty) +
                  (Number(item?.qty) * (Number(item?.wastePercentage) || 0)) /
                    100
                ).toFixed(3)
              : "",
        fabricYarnDetails: Array.isArray(item?.fabricYarnDetails)
          ? item.fabricYarnDetails?.map((yd) => {
              const reqNum =
                item?.requiredQty != null
                  ? Number(item?.requiredQty)
                  : item?.qty != null
                    ? Number(item?.qty) +
                      (Number(item?.qty) *
                        (Number(item?.wastePercentage) || 0)) /
                        100
                    : 0;
              const pct = parseFloat(yd.percentage);
              return {
                ...yd,
                process: yd?.process || "No",
                yarnProcessDetails: Array.isArray(yd?.yarnProcessDetails)
                  ? yd.yarnProcessDetails?.map((yp) => ({
                      ...yp,
                      dyeing: yp?.dyeing || "No",
                    }))
                  : [],
                yarnQty:
                  reqNum > 0 && !isNaN(pct)
                    ? ((reqNum * pct) / 100).toFixed(3)
                    : yd.yarnQty,
              };
            })
          : item?.fabricYarnDetails || [],
        fabricProcess: Array.isArray(item?.fabricProcess)
          ? item.fabricProcess
          : [],
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
      setDiscountValue(data?.discountValue || "");
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
    orderFabricItems: orderFabricItems
      ?.filter((i) => i.fabricId)
      .map((item) => ({
        ...item,
        fabricYarnDetails: (item.fabricYarnDetails || [])
          .filter((yd) => yd.yarnId)
          .map((yd) => ({
            ...yd,
            yarnProcessDetails: (yd.yarnProcessDetails || [])
              .filter((yp) => yp.processId)
              .map((yp) => ({
                ...yp,
                yarnProcessColors: (yp.yarnProcessColors || []).filter(
                  (yc) => yc.colorId,
                ),
              })),
          })),
        fabricProcess: (item.fabricProcess || []).filter((fp) => fp.processId),
      })),
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
        invalidateFabricModule();
        invalidateYarnModule();
        invalidateOrderEntryModule();
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const calculatedGrandTotal = useMemo(() => {
    const baseNet = !isCustomerExport
      ? enrichedData.net
      : (enrichedData.items?.reduce(
          (sum, item) => sum + (parseFloat(item.amount) || 0),
          0,
        ) || 0) -
        (enrichedData.itemDiscount + enrichedData.overallDiscount > 0
          ? enrichedData.itemDiscount + enrichedData.overallDiscount
          : 0);
    return (baseNet || 0) + (parseFloat(carriageFinalAmt) || 0);
  }, [enrichedData, isCustomerExport, carriageFinalAmt]);

  const compactFieldClass = "!h-7 text-xs";
  const compactModalFieldClass = "!h-7 !py-0 text-xs";
  const narrowFieldWrap = "min-w-0";
  const partyDropdownMinWidth = 260;
  const supplierCompactGridClass =
    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 items-end";
  const shippingPortsGridClass =
    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 items-end";
  const shippingChargesGridClass =
    "grid grid-cols-2 sm:grid-cols-[minmax(0,120px)_minmax(0,120px)_minmax(0,95px)_minmax(0,130px)] gap-2 items-end";

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
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-[#7098BC] tracking-[0.14em] uppercase block leading-tight">
                    Order Entry
                  </span>
                  {id && <ModeChip id={id} readOnly={readOnly} />}
                </div>
                <div className="flex items-center gap-2 flex-nowrap mt-1 h-7">
                  <h2 className="text-md font-extrabold tracking-tight truncate leading-none select-none text-white">
                    {docId && docId !== "New" ? docId : "New Order"}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleSidebar}
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-sky-600 active:bg-sky-700 text-white border border-white/25 hover:border-sky-400 shadow-md flex items-center justify-center transition active:scale-95 flex-shrink-0 cursor-pointer"
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
            {/* Order No and Order Date */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className={narrowFieldWrap}>
                <ReusableInput
                  label="Order No"
                  readOnly
                  value={docId}
                  className={`${compactFieldClass} w-full`}
                  labelClass="!text-[#7098BC]"
                />
              </div>
              <div className={narrowFieldWrap}>
                <ReusableInput
                  label="Order Date"
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

            {/* Order Type & Item Type */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className={narrowFieldWrap}>
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
                  className={`${compactFieldClass} w-full max-w-none`}
                />
              </div>
              <div className={narrowFieldWrap}>
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
                  className={`${compactFieldClass} w-full max-w-none`}
                />
              </div>
            </div>

            {/* PI Selection when AGAINSTPI */}
            <div className={narrowFieldWrap}>
              {orderGridType === "FABRIC" ? (
                id ? (
                  <TextInput
                    name="Fabric PI No"
                    placeholder="Fabric PI No"
                    value={fabricPIDocId}
                    disabled={true}
                    className={`${compactFieldClass} w-full`}
                  />
                ) : (
                  <DropdownInput
                    name="Fabric PI No"
                    options={dropDownListObject(
                      fabricPIList?.data?.filter(
                        (item) => item?.customerId === customerId,
                      ) || [],
                      "docId",
                      "id",
                    )}
                    value={proFormaFabricId}
                    setValue={async (val) => {
                      setProFormaIFabricId(val);
                      if (!val) {
                        setFabricItems(padFabricItems([]));
                        return;
                      }

                      const res = await getPIById(val).unwrap();

                      setTaxTemplateId(res?.data?.taxTemplateId || "");
                      setDiscountType(res?.data?.discountType || "");
                      setDiscountValue(res?.data?.discountValue || "");

                      if (res?.data?.termsId) setTermsId(res.data.termsId);
                      if (res?.data?.termsAndCondition)
                        setTermsAndCondition(res.data.termsAndCondition);
                      if (res?.data?.deliveryDate)
                        setDeliveryDate(
                          moment
                            .utc(res.data.deliveryDate)
                            .format("YYYY-MM-DD"),
                        );
                      if (res?.data?.remarks) setRemarks(res.data.remarks);

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

                      const mappedItems = latestItems?.map((item) => ({
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
                        qty: item?.qty ? Number(item?.qty)?.toFixed(3) : "",
                        wastePercentage: item?.wastePercentage
                          ? Number(item?.wastePercentage)?.toFixed(2)
                          : "",
                        requiredQty: item?.requiredQty
                          ? Number(item?.requiredQty)?.toFixed(3)
                          : "",
                        price: item?.price
                          ? Number(item?.price)?.toFixed(2)
                          : "",
                        amount: item?.amount
                          ? Number(item?.amount)?.toFixed(2)
                          : "",
                      }));

                      setFabricItems(padFabricItems(mappedItems));
                    }}
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
                    className={`${compactFieldClass} w-full max-w-none`}
                  />
                )
              ) : id ? (
                <TextInput
                  name="Yarn PI No"
                  placeholder="Yarn PI No"
                  value={yarnPIDocId}
                  disabled={true}
                  className={`${compactFieldClass} w-full`}
                />
              ) : (
                <DropdownInput
                  name="Yarn PI No"
                  options={dropDownListObject(
                    YarnPIList?.data?.filter(
                      (item) => item?.customerId === customerId,
                    ) || [],
                    "docId",
                    "id",
                  )}
                  value={proFormaYarnId}
                  setValue={async (val) => {
                    setProFormaIYarnId(val);
                    if (!val) {
                      setYarnItems(padYarnItems([]));
                      return;
                    }

                    const res = await getYarnPIById(val).unwrap();

                    setTaxTemplateId(res?.data?.taxTemplateId || "");
                    setDiscountType(res?.data?.discountType || "");
                    setDiscountValue(res?.data?.discountValue || "");

                    if (res?.data?.termsId) setTermsId(res.data.termsId);
                    if (res?.data?.termsAndCondition)
                      setTermsAndCondition(res.data.termsAndCondition);
                    if (res?.data?.deliveryDate)
                      setDeliveryDate(
                        moment.utc(res.data.deliveryDate).format("YYYY-MM-DD"),
                      );
                    if (res?.data?.remarks) setRemarks(res.data.remarks);

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
                            ...itemsArr.map((i) => Number(i.quoteVersion) || 1),
                          )
                        : res?.data?.quoteVersion || 1;

                    const latestItems = itemsArr.filter(
                      (item) =>
                        (Number(item.quoteVersion) || 1) === Number(maxVersion),
                    );

                    const mappedItems = latestItems?.map((item) => ({
                      ...item,
                      weightPerBag: item?.weightPerBag
                        ? Number(item?.weightPerBag)?.toFixed(3)
                        : "",
                      qty: item?.qty ? Number(item?.qty)?.toFixed(3) : "",
                      price: item?.price ? Number(item?.price)?.toFixed(2) : "",
                      amount: item?.amount
                        ? Number(item?.amount)?.toFixed(2)
                        : "",
                    }));

                    setYarnItems(padYarnItems(mappedItems));
                  }}
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
                  className={`${compactFieldClass} w-full max-w-none`}
                />
              )}
            </div>

            {/* Tax Type & Pay Term */}
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
                  readOnly={
                    childRecord.current > 0 ||
                    readOnly ||
                    orderType === "AGAINSTPI"
                  }
                  className={`${compactFieldClass} w-full max-w-none`}
                />
              </div>

              <div className={narrowFieldWrap}>
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
                  className={`${compactFieldClass} w-full max-w-none`}
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
            </div>

            {/* Currency & Customer Po No */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className={narrowFieldWrap}>
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
                  className={`${compactFieldClass} w-full max-w-none`}
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

              <div className={narrowFieldWrap}>
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
              className="w-full bg-[#102438] hover:bg-[#152e47] active:bg-[#0c1c2c] text-white py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold shadow-sm transition border border-[#28496D] cursor-pointer"
              title="View Order Summary"
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
            <div className="flex flex-col items-center gap-2">
              <FiLayers
                className={`w-3.5 h-3.5 ${
                  docId && docId !== "New" ? "text-sky-300" : "text-[#7098BC]"
                }`}
              />
              <span
                className={`text-[10px] font-bold uppercase whitespace-nowrap ${
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
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-sky-600 active:bg-sky-700 text-white border border-white/20 hover:border-sky-400 shadow-sm flex items-center justify-center transition cursor-pointer"
              title="View Summary"
            >
              <FiEye className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );

  const customerDetailsCompactSection = (
    <div className="border border-slate-200 bg-white rounded-md shadow-sm overflow-hidden flex flex-col border-l-4 border-l-blue-600">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200/80 bg-slate-50 rounded-t-md flex-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <FiUserCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
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
              disabled={childRecord.current > 0 || readOnly || id}
              ref={customerRef}
              openOnFocus={true}
            />
          </div>
          <div className="min-w-0">
            <TextInput
              name="Contact Person"
              placeholder=""
              value={
                findFromList(
                  customerId,
                  customerList?.data,
                  "contactPersonName",
                ) || ""
              }
              disabled={true}
              className={compactFieldClass}
            />
          </div>
          <div className="min-w-0">
            <TextInput
              name="Phone"
              placeholder=""
              value={
                findFromList(customerId, customerList?.data, "contactNumber") ||
                ""
              }
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
              readOnly={
                childRecord.current > 0 ||
                readOnly ||
                orderType === "AGAINSTPI" ||
                !isCustomerExport
              }
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
              readOnly={
                childRecord.current > 0 ||
                readOnly ||
                orderType === "AGAINSTPI" ||
                !isCustomerExport
              }
              required={isCustomerExport}
              className={compactFieldClass}
            />
          </div>
          <div className="min-w-0">
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
                childRecord.current > 0 || readOnly || orderType === "AGAINSTPI"
              }
              className={compactFieldClass}
              addNewLabel="+ Add New Bank"
              childComponent={BankMaster}
              addNewModalWidth="w-[45%] h-[64%]"
              disabled={
                childRecord.current > 0 || readOnly || orderType === "AGAINSTPI"
              }
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
              required={true}
              readOnly={
                childRecord.current > 0 || readOnly || orderType === "AGAINSTPI"
              }
              min={docDate}
              type={"date"}
              className={compactFieldClass}
            />
          </div>

          <div className="min-w-0">
            <TextInput
              name={`Carriage Charges ${currencyId ? `(${isCurrencySymbol})` : ""}`}
              value={carriageCharge}
              setValue={setCarriageCharge}
              type="number"
              min="0"
              className={`${compactFieldClass} text-right`}
              disabled={
                childRecord.current > 0 || readOnly || orderType === "AGAINSTPI"
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
          <div className="min-w-0">
            <TextInput
              name="Carriage Tax%"
              value={carriageTax}
              setValue={setCarriageTax}
              disabled={
                childRecord.current > 0 || readOnly || orderType === "AGAINSTPI"
              }
              type="number"
              min="0"
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
        onClick={() => saveData("close")}
        disabled={isDisabled || readOnly || childRecord.current > 0}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            saveData("close");
            e.stopPropagation();
          }
        }}
        className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-2.5 py-1 rounded-md flex items-center text-xs font-medium shadow-sm hover:shadow-md hover:shadow-blue-500/25 active:scale-95 transition-all duration-150 border border-blue-400/25 ${
          isDisabled || readOnly || childRecord.current > 0
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
        onClick={() => saveData("new")}
        disabled={isDisabled || readOnly || childRecord.current > 0}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            saveData("new");
          }
        }}
        className={`bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-2.5 py-1 rounded-md flex items-center text-xs font-medium shadow-sm hover:shadow-md hover:shadow-emerald-500/25 active:scale-95 transition-all duration-150 border border-emerald-400/25 ${
          isDisabled || readOnly || childRecord.current > 0
            ? "opacity-50 cursor-not-allowed hover:shadow-none hover:from-emerald-600 hover:to-teal-600 active:scale-100"
            : "hover:-translate-y-0.5 cursor-pointer"
        }`}
        title={id ? "Update & New" : "Save & New"}
      >
        <FiSave className="w-3.5 h-3.5 mr-1" />
        {id ? "Update & New" : "Save & New"}
      </button>

      {(!id || readOnly) && id && (
        <button
          type="button"
          onClick={() => hasPermission(() => setReadOnly(false), "edit")}
          disabled={isDisabled}
          className={`bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white px-2.5 py-1 rounded-md flex items-center text-xs font-medium shadow-sm hover:shadow-md hover:shadow-amber-500/25 active:scale-95 transition-all duration-150 border border-amber-400/25 ${
            isDisabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:-translate-y-0.5 cursor-pointer"
          }`}
          title="Edit"
        >
          <FiEdit2 className="w-3.5 h-3.5 mr-1" />
          Edit
        </button>
      )}

      {id && (status === "APPROVED" || status === "NOT_CONFIGURED") && (
        <button
          type="button"
          onClick={() => {
            if (qrRef.current) {
              setQrCodeDataUrl(qrRef.current.toDataURL("image/png"));
            }
            setPrintModalOpen(true);
          }}
          className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white px-2.5 py-1 rounded-md flex items-center text-xs font-medium shadow-sm hover:shadow-md hover:shadow-slate-500/25 active:scale-95 hover:-translate-y-0.5 transition-all duration-150 border border-slate-400/25 cursor-pointer"
          title="PDF Export"
        >
          <FiFileText className="w-3.5 h-3.5 mr-1" />
          PDF Export
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          setSelectedAttachmentIndex(null);
          setAttachmentModal(true);
        }}
        className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white px-2.5 py-1 rounded-md flex items-center text-xs font-medium shadow-sm hover:shadow-md hover:shadow-rose-500/25 active:scale-95 hover:-translate-y-0.5 transition-all duration-150 border border-rose-400/25 cursor-pointer"
        title="Upload Attachments"
      >
        📎 Upload
      </button>

      {status === "REJECTED" && (
        <button
          type="button"
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
          className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white px-2.5 py-1 rounded-md flex items-center text-xs font-medium shadow-sm hover:shadow-md active:scale-95 hover:-translate-y-0.5 transition-all duration-150 border border-emerald-400/25 cursor-pointer"
        >
          <FiSend className="w-3.5 h-3.5 mr-1" />
          Submit Approval
        </button>
      )}

      {id && status === "PENDING" && canApprove && (
        <>
          <button
            type="button"
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
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-2.5 py-1 rounded-md flex items-center text-xs font-medium shadow-sm hover:shadow-md active:scale-95 hover:-translate-y-0.5 transition-all duration-150 border border-blue-400/25 cursor-pointer"
          >
            <MdKeyboardDoubleArrowLeft className="w-4 h-4 mr-1" />
            Send Back
          </button>
          <button
            type="button"
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
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-2.5 py-1 rounded-md flex items-center text-xs font-medium shadow-sm hover:shadow-md active:scale-95 hover:-translate-y-0.5 transition-all duration-150 border border-green-400/25 cursor-pointer"
          >
            <FiCheck className="w-4 h-4 mr-1" />
            Approve
          </button>
        </>
      )}
    </div>
  );

  const footerContent = (
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
                  (enrichedData.itemDiscount + enrichedData.overallDiscount > 0
                    ? enrichedData.itemDiscount + enrichedData.overallDiscount
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
            calculatedGrandTotal || 0,
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
        className="po-form-geist"
        showTabs={true}
        title="Order Entry"
        badge={<ModeChip id={id} readOnly={readOnly} />}
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
          orderGridType === "FABRIC" ? (
            <FabricItems
              orderFabricItems={orderFabricItems}
              setFabricItems={setFabricItems}
              readOnly={
                readOnly ||
                childRecord?.current > 0 ||
                orderType === "AGAINSTPI"
              }
              isNewFieldsReadOnly={Boolean(
                readOnly || childRecord?.current > 0,
              )}
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
              yarnList={yarnList}
              processList={processList}
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
        footer={footerContent}
      />
    </div>
  );
};
export default OrderEntryForm;
