import { IoArrowBackCircleSharp } from "react-icons/io5";

import {
  CheckBox,
  DateInputNew,
  DropdownInput,
  ReusableInput,
  ReusableSearchableInput,
  TextInput,
} from "../../../Inputs";
import {
  deliveryTypes,
  gridTypes,
  gridTypesPo,
  poTypes,
} from "../../../Utils/DropdownData";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import { findFromList, getCommonParams, ModeChip } from "../../../Utils/helper";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { toast } from "react-toastify";
import {
  FiCheck,
  FiEdit2,
  FiEye,
  FiPrinter,
  FiSave,
  FiSend,
} from "react-icons/fi";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import {
  useAddApprovalStausMutation,
  useAddPoMutation,
  useGetPoByIdQuery,
  useUpdatePoMutation,
} from "../../../redux/uniformService/PoServices";
import Swal from "sweetalert2";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import Modal from "../../../UiComponents/Modal";
import { dropDownListObject } from "../../../Utils/contructObject";
import PoSummary from "./PoSummary";
import { useGetBranchByIdQuery } from "../../../redux/services/BranchMasterService";
import { groupBy } from "lodash";
import PoItems from "./PoItems";
import FabricItems from "./fabricItems.jsx";
import YarnItems from "./yarnItems.jsx";
import { calculateTaxWithHSNBreakupAndInsertIntoPoItems } from "../../../Utils/taxSummary";
import PurchaseOrderPrintFormat from "./PrintFormat-PO";
import { invalidatePurchaseModule } from "../../../redux/Dispatch/PurchaseInvalidateTags";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";
import { DropdownWithModal } from "../../../Inputs/Reuseable";
import { PayTermMaster, TermsAndCondition } from "../../../Basic/components";
import { PartyMaster, TaxTemplate } from "..";
import { useSelector } from "react-redux";
import { useGetPagesQuery } from "../../../redux/services/PageMasterService";
import {
  CommonFormFooter,
  TransactionActions,
  TransactionLayout,
} from "../../../Basic/components/Reuseable";
import {
  createPurchaseOrderRows,
  DEFAULT_PURCHASE_ORDER_ROWS,
  getPurchaseOrderPayload,
  getPurchaseOrderTaxSnapshot,
  showValidationResult,
  validatePurchaseOrderData,
} from "./purchaseOrder.module";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import {
  useGetOrderEntryQuery,
  useLazyGetOrderEntryByIdQuery,
} from "../../../redux/uniformService/OrderEntryService";
import { useGetYarnMasterQuery } from "../../../redux/services/YarnMasterService";
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
  quoteVersion: "",
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
  quoteVersion: "",
};

const padFabricItems = (itemsArray = [], minLength = 14, quoteVersion = "") => {
  const currentLength = itemsArray.length;
  const formattedItems = (itemsArray || []).map((item) => ({
    ...item,
    quoteVersion: item.quoteVersion ?? (quoteVersion || 1),
    rowId: item.rowId || Math.random().toString(36).substring(2, 9),
  }));

  if (currentLength < minLength) {
    const padding = Array.from({ length: minLength - currentLength }, () => ({
      ...EMPTY_FABRIC_ROW,
      quoteVersion: quoteVersion || 1,
      rowId: Math.random().toString(36).substring(2, 9),
    }));
    return [...formattedItems, ...padding];
  }
  return formattedItems;
};

const padYarnItems = (itemsArray = [], minLength = 14, quoteVersion = "") => {
  const currentLength = itemsArray.length;
  const formattedItems = (itemsArray || []).map((item) => ({
    ...item,
    quoteVersion: item.quoteVersion ?? (quoteVersion || 1),
    rowId: item.rowId || Math.random().toString(36).substring(2, 9),
  }));

  if (currentLength < minLength) {
    const padding = Array.from({ length: minLength - currentLength }, () => ({
      ...EMPTY_YARN_ROW,
      quoteVersion: quoteVersion || 1,
      rowId: Math.random().toString(36).substring(2, 9),
    }));
    return [...formattedItems, ...padding];
  }
  return formattedItems;
};

const PurchaseOrderForm = ({
  onClose,
  id,
  setId,
  readOnly,
  setReadOnly,
  taxTypeList,
  supplierList,
  uomList,
  styleItemList,
  termsData,
  branchList,
  hsnList,
  payTermList,
  itemGroupList,
  sizeList,
  colorList,
  branchData,
  gsmList,
  userData,
}) => {
  const today = new Date();
  const [pendingAction, setPendingAction] = useState(null);
  const [docDate, setDocDate] = useState(
    moment.utc(today).format("YYYY-MM-DD"),
  );
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [payTermId, setPayTermId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [poType, setPoType] = useState("GENERAL");
  const [orderGridType, setOrderGridType] = useState("GENERAL");
  const [supplierId, setSupplierId] = useState("");
  const [termsAndCondtion, setTermsAndCondtion] = useState("");
  const [termsId, setTermsId] = useState("");
  const [poItems, setPoItems] = useState([]);
  const [discountType, setDiscountType] = useState("");
  const [discountValue, setDiscountValue] = useState();
  const [taxPercent, setTaxPercent] = useState();
  const [orderId, setOrderId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [summary, setSummary] = useState(false);
  const [docId, setDocId] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [deliveryToId, setDeliveryToId] = useState("");
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [isNewVersion, setIsNewVersion] = useState(false);
  const [quoteVersion, setQuoteVersion] = useState("");
  const [approvalModal, setApprovalModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [requirementId, setRequirementId] = useState("");
  const [isPostApprovalLock, setIsPostApprovalLock] = useState(false);
  const [isDeliveryThresholdPassed, setIsDeliveryThresholdPassed] =
    useState(false);
  const [orderEntryId, setOrderEntryId] = useState("");
  const [selectedOrderGridType, setSelectedOrderGridType] = useState("");
  const supplierRef = useRef(null);
  const termsRef = useRef(null);
  const [dispatchInvalidate] = useInvalidateTags();
  const [poFabricItems, setPoFabricItems] = useState(padFabricItems([]));
  const [poYarnItems, setPoYarnItems] = useState(padYarnItems([]));
  const { branchId, userId, finYearId, companyId } = getCommonParams();
  const params = { branchId, userId, finYearId };
  const { data: supplierDetails } = useGetPartyByIdQuery(supplierId, {
    skip: !supplierId,
  });
  const openTabs = useSelector((state) => state.openTabs);

  const activeTab = openTabs.tabs.find((tab) => tab.active);
  const { data: pageData } = useGetPagesQuery({});

  const { data: yarnList } = useGetYarnMasterQuery({ params });
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
  const currentPageId =
    (pageData?.data || []).find((i) => i.name === activeTab.name)?.id || "";

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPoByIdQuery(id, { skip: !id });

  const childRecordCount =
    singleData?.data?.childRecordInward + singleData?.data?.childRecordCancel;

  const { data: orderData } = useGetOrderEntryQuery({ params });

  const [addApprovalStatus] = useAddApprovalStausMutation();
  const [addData] = useAddPoMutation();
  const [updateData] = useUpdatePoMutation();
  const [getOrderEntryById] = useLazyGetOrderEntryByIdQuery();
  const status = singleData?.data?.approvalStatus?.status;

  const syncFormWithDb = useCallback(
    (data) => {
      const status = data?.approvalStatus?.status;
      const isAdminRole = userData?.role?.name === "ADMIN";

      const deliveryDate = data?.dueDate;
      const thresholdPassed =
        deliveryDate && moment(deliveryDate).diff(moment(), "days", true) <= 2;

      setIsPostApprovalLock(status === "APPROVED");
      setIsDeliveryThresholdPassed(thresholdPassed);

      setReadOnly(
        (["PENDING"].includes(status) && !isAdminRole) ||
          (status === "APPROVED" && thresholdPassed && !isAdminRole) ||
          readOnly,
      );
      setPoType(data?.poType ? data?.poType : "GENERAL");
      setOrderGridType(data?.orderGridType || "GENERAL");
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(new Date()).format("YYYY-MM-DD"),
      );
      setOrderEntryId(data?.orderEntryId || "");
      const matchedOrder = (orderData?.data || []).find(
        (o) => o.id === data?.orderEntryId,
      );
      const resolvedOrderGridType =
        data?.OrderEntry?.orderGridType ||
        matchedOrder?.orderGridType ||
        (data?.poType === "ORDER" && data?.orderGridType === "FABRIC"
          ? "FABRIC"
          : "");
      setSelectedOrderGridType(resolvedOrderGridType || "");
      setDocId(data?.docId ? data?.docId : "New");
      setDiscountType(data?.discountType || "");
      setTaxPercent(data?.taxPercent ? data?.taxPercent : "");
      setDiscountValue(data?.discountValue || "0");
      setSupplierId(data?.supplierId || "");
      setDueDate(
        data?.dueDate ? moment.utc(data.dueDate).format("YYYY-MM-DD") : "",
      );
      setDeliveryType(data?.deliveryType || "");
      setDeliveryToId(
        data?.deliveryType === "ToSelf"
          ? data?.deliveryBranchId
          : data?.deliveryToId || "",
      );
      setRemarks(data?.remarks || "");
      setOrderId(data?.orderId ? data?.orderId : "");
      setRequirementId(data?.requirementId ? data?.requirementId : "");
      setTaxTemplateId(data?.taxTemplateId ? data?.taxTemplateId : "");
      setTermsAndCondtion(data?.termsAndCondtion ? data?.termsAndCondtion : "");
      setTermsId(data?.termsId ? data?.termsId : "");
      setIsNewVersion(false);
      // ✅ Set quoteVersion BEFORE poItems so isVisibleRow works correctly on first render
      let resolvedQuoteVersion = data?.quoteVersion || "";

      // ✅ Find the maximum quoteVersion from poItems, poFabricItems, or poYarnItems to ensure we always default to the latest version
      const allItemsWithVersion = [
        ...(data?.poItems || []),
        ...(data?.poFabricItems || data?.orderFabricItems || []),
        ...(data?.poYarnItems || data?.orderYarnItems || []),
      ];

      if (allItemsWithVersion.length) {
        const validVersions = allItemsWithVersion
          .filter((i) => i.quoteVersion && i.quoteVersion !== "New")
          .map((i) => Number(i.quoteVersion))
          .filter((n) => !isNaN(n) && n > 0);

        if (validVersions.length > 0) {
          const maxVersion = Math.max(...validVersions);
          if (maxVersion > Number(resolvedQuoteVersion || 0)) {
            resolvedQuoteVersion = maxVersion;
          }
        }
      }

      setQuoteVersion(resolvedQuoteVersion);

      // ✅ Pass quoteVersion directly to filter correctly
      let finalPoItems = [];
      if (data?.poItems) {
        finalPoItems = [...data.poItems];
        const visibleItems = finalPoItems?.filter((i) => {
          if (!resolvedQuoteVersion) return i?.quoteVersion !== "New";
          return parseInt(i?.quoteVersion) === parseInt(resolvedQuoteVersion);
        });
        const missing = DEFAULT_PURCHASE_ORDER_ROWS - visibleItems?.length;
        if (missing > 0) {
          finalPoItems = [
            ...finalPoItems,
            ...createPurchaseOrderRows(missing, resolvedQuoteVersion),
          ];
        }
      } else {
        finalPoItems = createPurchaseOrderRows(
          DEFAULT_PURCHASE_ORDER_ROWS,
          resolvedQuoteVersion,
        );
      }
      setPoItems(finalPoItems);
      // ✅ Fabric Items with versioning logic
      let finalFabricItems = [];
      const rawFabricItems = data?.poFabricItems || data?.orderFabricItems;
      if (rawFabricItems?.length) {
        finalFabricItems = rawFabricItems.map((item) => ({
          ...item,
          quoteVersion: item.quoteVersion ?? (resolvedQuoteVersion || 1),
          rowId: item.rowId || Math.random().toString(36).substring(2, 9),
        }));
        const visibleFabricItems = finalFabricItems.filter((i) => {
          if (!resolvedQuoteVersion) return i?.quoteVersion !== "New";
          return parseInt(i?.quoteVersion) === parseInt(resolvedQuoteVersion);
        });
        const missing = 14 - (visibleFabricItems?.length || 0);
        if (missing > 0) {
          finalFabricItems = [
            ...finalFabricItems,
            ...Array.from({ length: missing }, () => ({
              ...EMPTY_FABRIC_ROW,
              quoteVersion: resolvedQuoteVersion || 1,
              rowId: Math.random().toString(36).substring(2, 9),
            })),
          ];
        }
      } else {
        finalFabricItems = Array.from({ length: 14 }, () => ({
          ...EMPTY_FABRIC_ROW,
          quoteVersion: resolvedQuoteVersion || 1,
          rowId: Math.random().toString(36).substring(2, 9),
        }));
      }
      setPoFabricItems(finalFabricItems);

      // ✅ Yarn Items with versioning logic
      let finalYarnItems = [];
      const rawYarnItems = data?.poYarnItems || data?.orderYarnItems;
      if (rawYarnItems?.length) {
        finalYarnItems = rawYarnItems.map((item) => ({
          ...item,
          quoteVersion: item.quoteVersion ?? (resolvedQuoteVersion || 1),
          rowId: item.rowId || Math.random().toString(36).substring(2, 9),
        }));
        const visibleYarnItems = finalYarnItems.filter((i) => {
          if (!resolvedQuoteVersion) return i?.quoteVersion !== "New";
          return parseInt(i?.quoteVersion) === parseInt(resolvedQuoteVersion);
        });
        const missing = 14 - (visibleYarnItems?.length || 0);
        if (missing > 0) {
          finalYarnItems = [
            ...finalYarnItems,
            ...Array.from({ length: missing }, () => ({
              ...EMPTY_YARN_ROW,
              quoteVersion: resolvedQuoteVersion || 1,
              rowId: Math.random().toString(36).substring(2, 9),
            })),
          ];
        }
      } else {
        finalYarnItems = Array.from({ length: 14 }, () => ({
          ...EMPTY_YARN_ROW,
          quoteVersion: resolvedQuoteVersion || 1,
          rowId: Math.random().toString(36).substring(2, 9),
        }));
      }
      setPoYarnItems(finalYarnItems);
      setPayTermId(data?.payTermId ? data?.payTermId : "");
    },
    [id],
  );

  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  useEffect(() => {
    if (
      poType === "ORDER" &&
      orderEntryId &&
      !selectedOrderGridType &&
      orderData?.data?.length
    ) {
      const matched = orderData.data.find((o) => o.id === orderEntryId);
      if (matched?.orderGridType) {
        setSelectedOrderGridType(matched.orderGridType);
      }
    }
  }, [poType, orderEntryId, selectedOrderGridType, orderData]);

  const handleOrderNoChange = async (selectedOrderEntryId) => {
    setOrderEntryId(selectedOrderEntryId);
    if (!selectedOrderEntryId) {
      setSelectedOrderGridType("");
      setPoFabricItems(padFabricItems([], 14, quoteVersion));
      setPoYarnItems(padYarnItems([], 14, quoteVersion));
      setPoItems(
        createPurchaseOrderRows(DEFAULT_PURCHASE_ORDER_ROWS, quoteVersion),
      );
      return;
    }
    try {
      const res = await getOrderEntryById(selectedOrderEntryId).unwrap();
      const order = res?.data;
      if (!order) return;

      const gridType = order?.orderGridType || "GENERAL";
      setSelectedOrderGridType(gridType);
      setOrderGridType(gridType);
      if (!quoteVersion) {
        setQuoteVersion(1);
      }

      // if (order.taxTemplateId) setTaxTemplateId(order.taxTemplateId);
      // if (order.termsId) setTermsId(order.termsId);
      // if (order.termsAndCondition) setTermsAndCondtion(order.termsAndCondition);
      // if (order.remarks) setRemarks(order.remarks);
      // if (order.deliveryDate) {
      //   setDueDate(moment.utc(order.deliveryDate).format("YYYY-MM-DD"));
      // }
      // if (order.payTermId) setPayTermId(order.payTermId);
      // if (order.discountType) setDiscountType(order.discountType);
      // if (order.discountValue != null) setDiscountValue(order.discountValue);

      if (gridType === "FABRIC") {
        const itemsArr = order?.orderFabricItems || [];
        const mapped = itemsArr.map((item) => ({
          ...EMPTY_FABRIC_ROW,
          ...item,
          quoteVersion: quoteVersion || 1,
          weightPerRoll: item?.weightPerRoll
            ? Number(item?.weightPerRoll)?.toFixed(3)
            : "",
          totalKgs: item?.totalKgs ? Number(item?.totalKgs)?.toFixed(3) : "",
          pricePerKg: item?.pricePerKg
            ? Number(item?.pricePerKg)?.toFixed(2)
            : "",
          totalPrice: item?.totalPrice
            ? Number(item?.totalPrice)?.toFixed(2)
            : "",
          qty: item?.qty ? Number(item?.qty)?.toFixed(3) : "",
          price: item?.price ? Number(item?.price)?.toFixed(2) : "",
          amount: item?.amount ? Number(item?.amount)?.toFixed(2) : "",
          taxPercent: item?.taxPercent ?? "",
          discountValue: item?.discountValue ?? "",
          discountType: item?.discountType ?? "",
          rowId: Math.random().toString(36).substring(2, 9),
        }));
        setPoFabricItems(padFabricItems(mapped, 14, quoteVersion));

        if (order?.orderYarnItems?.length) {
          const yarnMapped = order.orderYarnItems.map((item) => ({
            ...EMPTY_YARN_ROW,
            ...item,
            quoteVersion: quoteVersion || 1,
            noOfbags: item?.noOfbags ?? "",
            weightPerBag: item?.weightPerBag
              ? Number(item?.weightPerBag)?.toFixed(3)
              : "",
            qty: item?.qty ? Number(item?.qty)?.toFixed(3) : "",
            price: item?.price ? Number(item?.price)?.toFixed(2) : "",
            amount: item?.amount ? Number(item?.amount)?.toFixed(2) : "",
            taxPercent: item?.taxPercent ?? "",
            discountValue: item?.discountValue ?? "",
            discountType: item?.discountType ?? "",
            rowId: Math.random().toString(36).substring(2, 9),
          }));
          setPoYarnItems(padYarnItems(yarnMapped, 14, quoteVersion));
        } else {
          setPoYarnItems(padYarnItems([], 14, quoteVersion));
        }
      } else if (gridType === "YARN") {
        const itemsArr = order?.orderYarnItems || [];
        const mapped = itemsArr.map((item) => ({
          ...EMPTY_YARN_ROW,
          ...item,
          quoteVersion: quoteVersion || 1,
          noOfbags: item?.noOfbags ?? "",
          weightPerBag: item?.weightPerBag
            ? Number(item?.weightPerBag)?.toFixed(3)
            : "",
          qty: item?.qty ? Number(item?.qty)?.toFixed(3) : "",
          price: item?.price ? Number(item?.price)?.toFixed(2) : "",
          amount: item?.amount ? Number(item?.amount)?.toFixed(2) : "",
          taxPercent: item?.taxPercent ?? "",
          discountValue: item?.discountValue ?? "",
          discountType: item?.discountType ?? "",
          rowId: Math.random().toString(36).substring(2, 9),
        }));
        setPoYarnItems(padYarnItems(mapped, 14, quoteVersion));
      }
    } catch (err) {
      console.error("Failed to fetch order entry details:", err);
      toast.error("Failed to fetch order details");
    }
  };

  // PurchaseOrderForm.jsx — handleSubmitCustom
  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      const returnData = await callback(data).unwrap();

      if (returnData.statusCode === 1) {
        toast.error(returnData.message);
        return;
      }
      // ✅ Sync quoteVersion immediately from the response
      if (returnData?.data?.quoteVersion) {
        setQuoteVersion(returnData.data.quoteVersion);
      }
      // ✅ Show re-approval message if backend sent one
      const successMessage = returnData.message || `${text} Successfully`;
      const isReApproval = returnData.message?.includes("Re-approval");

      Swal.fire({
        icon: isReApproval ? "warning" : "success",
        title: isReApproval
          ? "⚠️ Re-approval Required"
          : `${text} Successfully`,
        text: isReApproval ? returnData.message : undefined,
        showConfirmButton: isReApproval, // ✅ user must acknowledge re-approval
        confirmButtonText: "OK, I understand",
        timer: isReApproval ? undefined : 2000, // no auto-close for re-approval
        didClose: () => {
          invalidatePurchaseModule();
          dispatchInvalidate();

          if (returnData.statusCode === 0) {
            if (!id) {
              Swal.fire({
                icon: "question",
                title: "Do You Want to Print?",
                showCancelButton: true,
                confirmButtonText: "Yes, Print",
                cancelButtonText: "No, Thanks [Esc]",
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#6b7280",
                focusConfirm: true, // ✅ Auto-focus confirm button
                allowEnterKey: true, // ✅ Allow Enter to confirm
                allowEscapeKey: true, // ✅ Allow Escape to cancel
                didOpen: () => {
                  // ✅ Ensure confirm button is focused when modal opens
                  const confirmButton = Swal.getConfirmButton();
                  const cancelButton = Swal.getCancelButton();

                  if (confirmButton) {
                    confirmButton.focus();

                    // ✅ Add keyboard navigation
                    confirmButton.addEventListener("keydown", (e) => {
                      if (e.key === "Tab" && !e.shiftKey) {
                        e.preventDefault();
                        cancelButton?.focus();
                      }
                    });
                  }

                  if (cancelButton) {
                    cancelButton.addEventListener("keydown", (e) => {
                      if (e.key === "Tab" && e.shiftKey) {
                        e.preventDefault();
                        confirmButton?.focus();
                      }
                    });
                  }
                },
              }).then((result) => {
                if (result.isConfirmed) {
                  // ✅ User clicked "Yes, Print"
                  setPrintModalOpen(true);
                  // Set the ID so the print modal can access the saved data
                  if (returnData?.data?.id) {
                    setId(returnData.data.id);
                  }
                  setPendingAction(nextProcess);
                } else {
                  // ✅ User clicked "No, Thanks" - proceed with normal flow
                  if (nextProcess === "new") {
                    syncFormWithDb(undefined);
                    setId("");
                    setDocId("New");

                    setTimeout(() => {
                      supplierRef.current?.focus();
                    }, 300);
                  }
                  if (nextProcess === "close") {
                    onClose();
                  }
                }
              });
            } else {
              if (nextProcess === "new") {
                setId("");
                setDocId("New");
                syncFormWithDb(undefined);
              }
              if (nextProcess === "close") {
                onClose();
              }
            }
          }
        },
      });
    } catch (error) {
      console.log("handle", error);
    }
  };

  const validateData = (data) => {
    const result = validatePurchaseOrderData({
      data,
      id,
      isNewVersion,
      quoteVersion,
      styleItemList,
      sizeList,
      colorList,
      gsmList,
    });
    return showValidationResult(result);
  };

  const saveData = (nextProcess, options = {}) => {
    const submitApprovalFlag = !!options.submitApprovalOverride;
    const payload = getPurchaseOrderPayload({
      supplierId,
      dueDate,
      docDate,
      branchId,
      id,
      userId,
      remarks,
      poItems,
      orderGridType,
      poFabricItems,
      poYarnItems,
      deliveryType,
      deliveryToId,
      discountType,
      discountValue,
      taxPercent,
      finYearId,
      poType,
      taxTemplateId,
      termsAndCondtion,
      termsId,
      isNewVersion,
      quoteVersion,
      payTermId,
      pageId: currentPageId,
      totalNetAmount: activeTotals?.net,
      submitApproval: submitApprovalFlag,
      orderEntryId,
    });

    if (!validateData(payload)) {
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
        { ...payload, draftSave: true },
        "Added",
        nextProcess,
      );
    } else if (id && nextProcess == "draft") {
      handleSubmitCustom(
        updateData,
        { ...payload, draftSave: true },
        "Updated",
        nextProcess,
      );
    } else if (id) {
      handleSubmitCustom(updateData, payload, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, payload, "Added", nextProcess);
    }
  };

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
        referencePage: "PURCHASE ORDER",
        recordData: {},
      }).unwrap();

      if (result.statusCode === 0) {
        toast.success(
          result.message ||
            (actionType === "APPROVE"
              ? "Purchase Order Approved!"
              : "Sent Back for Review!"),
        );
        setApprovalModal(false);
        invalidatePurchaseModule();
        dispatchInvalidate();
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

  const dateRef = useRef(null);

  useEffect(() => {
    if (dateRef.current && !id) {
      dateRef.current.focus();
    }
  }, []);

  const allSuppliers = supplierList ? supplierList.data : [];

  const { data: deliveryToBranch } = useGetBranchByIdQuery(deliveryToId, {
    skip: deliveryType === "ToParty",
  });
  const { data: deliveryToSupplier } = useGetPartyByIdQuery(deliveryToId, {
    skip: deliveryType === "ToSelf",
  });

  let deliveryTo =
    deliveryType === "ToParty"
      ? deliveryToSupplier?.data
      : deliveryToBranch?.data;

  const { isSupplierOutside, enrichedPoItems, totals } =
    getPurchaseOrderTaxSnapshot({
      poItems,
      supplierDetails,
      discountType,
      discountValue,
      id,
      isNewVersion,
      quoteVersion,
    });

  const activeTotals = useMemo(() => {
    const isVisibleRow = (row) => {
      if (!id) return true;
      if (isNewVersion) return row.quoteVersion === "New";
      if (!quoteVersion) return row.quoteVersion !== "New";
      return parseInt(row.quoteVersion) === parseInt(quoteVersion);
    };

    if (orderGridType === "FABRIC") {
      const filtered = (poFabricItems || [])
        .filter((i) => isVisibleRow(i) && i.fabricId)
        .map((i) => ({ ...i, qty: i.qty }));
      if (!filtered.length) {
        return {
          items: [],
          gross: 0,
          itemDiscount: 0,
          overallDiscount: 0,
          taxable: 0,
          roundOff: 0,
          net: 0,
          slabBreakup: [],
          hsnBreakup: {},
        };
      }
      return calculateTaxWithHSNBreakupAndInsertIntoPoItems(
        filtered,
        isSupplierOutside,
        discountType,
        discountValue,
      );
    }
    if (orderGridType === "YARN") {
      const filtered = (poYarnItems || [])
        .filter((i) => isVisibleRow(i) && i.yarnId)
        .map((i) => ({ ...i, qty: i.qty }));
      if (!filtered.length) {
        return {
          items: [],
          gross: 0,
          itemDiscount: 0,
          overallDiscount: 0,
          taxable: 0,
          roundOff: 0,
          net: 0,
          slabBreakup: [],
          hsnBreakup: {},
        };
      }
      return calculateTaxWithHSNBreakupAndInsertIntoPoItems(
        filtered,
        isSupplierOutside,
        discountType,
        discountValue,
      );
    }
    return totals;
  }, [
    orderGridType,
    poFabricItems,
    poYarnItems,
    isSupplierOutside,
    discountType,
    discountValue,
    totals,
    id,
    isNewVersion,
    quoteVersion,
  ]);

  const taxGroupWise = groupBy(
    orderGridType === "FABRIC"
      ? poFabricItems
      : orderGridType === "YARN"
        ? poYarnItems
        : poItems,
    "taxPercent",
  );

  const taxBreakdownSummaryRaw = activeTotals?.slabBreakup || [];
  const aggregatedTaxBreakdown = taxBreakdownSummaryRaw?.reduce((acc, row) => {
    const taxType = row?.tax?.split(" ")[0];
    if (!acc[taxType]) {
      acc[taxType] = { tax: taxType, amount: 0 };
    }
    acc[taxType].amount += parseFloat(row?.amount || 0);
    return acc;
  }, {});

  const taxBreakdownSummary = Object.values(aggregatedTaxBreakdown);

  const taxBreakdownContent =
    taxBreakdownSummary.length > 0 ? (
      <div className="space-y-0.5 border-t border-slate-100 pt-1">
        {taxBreakdownSummary.map((row) => (
          <div
            key={`${row.tax}-${row.amount}`}
            className="flex items-center justify-between gap-2 text-[11px]"
          >
            <span className="text-slate-500">{row.tax}</span>
            <span className="font-medium text-slate-700">
              {`Rs.${parseFloat(row.amount || 0).toFixed(2)}`}
            </span>
          </div>
        ))}
      </div>
    ) : null;

  const currentActiveItems =
    orderGridType === "FABRIC"
      ? poFabricItems
      : orderGridType === "YARN"
        ? poYarnItems
        : poItems;

  const quoteVersionOptions = [
    ...new Set(
      currentActiveItems
        .filter(
          (i) =>
            (i?.styleItemId || i?.fabricId || i?.yarnId) &&
            i?.quoteVersion &&
            i?.quoteVersion !== "New",
        )
        .map((i) => Number(i.quoteVersion))
        .filter((n) => n > 0),
    ),
  ].sort((a, b) => a - b);

  const maxQuoteVersion =
    quoteVersionOptions.length > 0
      ? quoteVersionOptions[quoteVersionOptions.length - 1]
      : 0;

  const isOldVersion =
    Boolean(id) &&
    !isNewVersion &&
    maxQuoteVersion > 0 &&
    Boolean(quoteVersion) &&
    Number(quoteVersion) < maxQuoteVersion;
  const effectiveReadOnly = readOnly || isOldVersion;

  const versionDropdown = (
    <div className="flex items-center gap-2 ml-2">
      <span className="text-xs text-gray-500 mt-1">Version</span>

      <div className="relative">
        <select
          value={quoteVersion}
          onChange={(e) => setQuoteVersion(Number(e.target.value))}
          className="appearance-none bg-white border border-gray-300 text-gray-700 text-xs rounded-md pl-2 pr-6 py-1 
                   focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 
                   hover:border-gray-400 transition"
        >
          {quoteVersionOptions.map((v, index) => (
            <option key={v} value={v}>
              {index === quoteVersionOptions.length - 1 ? "Latest" : `V${v}`}
            </option>
          ))}
        </select>

        {/* Custom arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center text-gray-400">
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

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData("close");
    }
  };

  useEffect(() => {
    supplierRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!id) {
      setTaxTemplateId(
        taxTypeList?.data?.filter((item) => item.name === "DEFAULT")[0]?.id,
      );
    }
  }, []);

  useEffect(() => {
    if (!id) {
      const selectedTerm = termsData?.data?.find(
        (item) => String(item.id) === String(termsId),
      );
      setTermsAndCondtion(selectedTerm?.description || "");
    }
  }, [id, termsData, termsId]);

  const getModeChip = () => {
    if (id && readOnly) {
      return { label: "Read", className: "bg-red-600 text-white" };
    }
    if (id && !readOnly) {
      return { label: "Edit", className: "bg-yellow-600 text-white" };
    }
    if (!id && !readOnly) {
      return;
    }
    return null;
  };
  const isFullyLocked =
    effectiveReadOnly || (isPostApprovalLock && isDeliveryThresholdPassed);
  const isCoreLocked = isFullyLocked || isPostApprovalLock;

  const itemTypeOptions = useMemo(() => {
    if (poType === "ORDER" && selectedOrderGridType === "FABRIC") {
      return gridTypes;
    }
    return gridTypesPo;
  }, [poType, selectedOrderGridType]);

  const isItemTypeDisabled = useMemo(() => {
    if (childRecordCount > 0 || readOnly) {
      return true;
    }
    if (poType === "ORDER") {
      return selectedOrderGridType !== "FABRIC";
    }
    return false;
  }, [childRecordCount, readOnly, poType, selectedOrderGridType]);

  const actionButtonClass =
    "px-2 py-1 rounded flex items-center justify-center text-xs text-white transition";

  const leftActions = [
    ...(isFullyLocked
      ? []
      : [
          {
            key: "save-close",
            icon: <HiOutlineRefresh className="w-4 h-4 mr-2" />,
            label: id ? "Update & Close" : "Save & Close",
            hoverLabel: id ? "Update & Close" : "Save & Close",
            onClick: () => saveData("close"),
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                saveData("close");
                e.stopPropagation();
              }
            },
            disabled: readOnly || status === "APPROVED",
            className: `bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded flex items-center text-xs transition ${
              readOnly || status === "APPROVED"
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`,
          },
          ...(status === "APPROVED"
            ? []
            : [
                {
                  key: "save-new",
                  icon: <FiSave className="w-4 h-4 mr-2" />,
                  label: id ? "Update & New" : "Save & New",
                  hoverLabel: id ? "Update & New" : "Save & New",
                  onClick: () => saveData("new"),
                  onKeyDown: (e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      saveData("new");
                    }
                  },
                  disabled: readOnly,
                  className: `bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded flex items-center text-xs transition ${
                    readOnly ? "opacity-50 cursor-not-allowed" : ""
                  }`,
                },
              ]),
        ]),
    {
      key: "summary",
      icon: <FiEye className="w-4 h-4 mr-2" />,
      label: "View Summary",
      hoverLabel: "View PO Summary",
      onClick: () => {
        if (!taxTemplateId) {
          toast.info("Please Select Tax Template !", {
            position: "top-center",
          });
          return;
        }
        setSummary(true);
      },
      onKeyDown: (e) => {
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
      },
      className:
        "bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded flex items-center text-xs transition",
    },
    ...(!id ||
    status === "PENDING" ||
    status === "APPROVED" ||
    status === "SUPERSEDED" ||
    status === "NOT_CONFIGURED"
      ? []
      : [
          {
            key: "submit-approval",
            icon: <FiSend className="h-4 w-4" />,
            hoverLabel: "Submit Approval",
            iconOnly: true,
            onClick: () => {
              saveData("close", { submitApprovalOverride: true });
            },
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                saveData("close", { submitApprovalOverride: true });
              }
            },
            className: `bg-green-700 hover:bg-green-800 ${actionButtonClass}`,
          },
        ]),
    ...((id && status === "PENDING") || status === "SUPERSEDED"
      ? [
          {
            key: "send-back",
            icon: <MdKeyboardDoubleArrowLeft className="h-4 w-4" />,
            hoverLabel: "Send Back for Review",
            iconOnly: true,
            onClick: () => handleApprovalAction("REJECT"),
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                handleApprovalAction("REJECT");
              }
            },
            className: `bg-blue-600 hover:bg-blue-700 ${actionButtonClass}`,
          },
          {
            key: "approve",
            icon: <FiCheck className="h-4 w-4" />,
            hoverLabel: "Approve",
            iconOnly: true,
            onClick: () => handleApprovalAction("APPROVE"),
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                handleApprovalAction("APPROVE");
              }
            },
            className: `bg-green-600 hover:bg-green-700 ${actionButtonClass}`,
          },
        ]
      : []),
  ];

  const rightActions = [
    ...(!id ||
    !readOnly ||
    status === "PENDING" ||
    status === "SUPERSEDED" ||
    isOldVersion
      ? []
      : [
          {
            key: "edit",
            icon: <FiEdit2 className="w-4 h-4 mr-2" />,
            label: "Edit",
            hoverLabel: "Edit",
            onClick: () => setReadOnly(false),
            className: `bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1 rounded flex items-center text-xs transition`,
          },
        ]),
    {
      key: "print",
      icon: <FiPrinter className="w-4 h-4 mr-2" />,
      label: "Print",
      hoverLabel: "Print",
      onClick: () => {
        setPrintModalOpen(true);
      },
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          setPrintModalOpen(true);
        }
      },
      className: `bg-slate-600 hover:bg-slate-700 text-white px-2 py-1 rounded flex items-center text-xs transition`,
    },
  ];

  const approvalStatusBanner = (() => {
    if (!isPostApprovalLock) return null;

    return (
      <div
        className={`text-[11px] px-3 py-1 rounded border flex items-center gap-2 ${
          isDeliveryThresholdPassed
            ? "bg-red-50 border-red-200 text-red-700"
            : ""
        }`}
      >
        {/* <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> */}
        {isDeliveryThresholdPassed && (
          <span>
            <strong>PO FULLY LOCKED:</strong> Approved & within 2-day delivery
            window. No edits allowed.
          </span>
        )}
      </div>
    );
  })();

  const compactFieldClass = "px-2 py-1 text-[11px]";
  const compactModalFieldClass = "w-full px-2 py-1 text-[11px]";
  const compactCardClass =
    "border border-slate-200 px-1.5 py-1 bg-white rounded-md shadow-sm";
  const compactSectionTitleClass =
    "font-medium text-[11px] text-slate-700 mb-0.5";
  const fieldWidthShort = "w-full min-w-0";
  const fieldWidthMedium = "w-full min-w-0";
  const fieldWidthDate = "w-full min-w-0";
  const narrowFieldWrap = "min-w-0";
  const partyDropdownMinWidth = 260;
  const supplierCompactGridClass = "grid grid-cols-3 gap-x-3";
  const deliveryCompactGridClass = "grid grid-cols-3 gap-x-3";
  const sidebarSectionGridClass = "grid grid-cols-1 gap-1";
  const sidebarTwoColumnGridClass = "grid grid-cols-2 gap-1";

  const basicDetailsFields = (
    <>
      <div className={narrowFieldWrap}>
        <ReusableInput
          label="Po No"
          readOnly
          value={docId}
          className={`${compactFieldClass} ${fieldWidthMedium}`}
        />
      </div>
      <div className={narrowFieldWrap}>
        <ReusableInput
          label=" Date"
          value={docDate}
          type={"date"}
          required={true}
          readOnly={true}
          disabled
          className={`${compactFieldClass} ${fieldWidthDate}`}
        />
      </div>
      <div className={narrowFieldWrap}>
        <DropdownInput
          name="Po Type"
          options={poTypes}
          value={poType}
          setValue={(value) => {
            setPoType(value);
            if (value !== "ORDER") {
              setOrderEntryId("");
              setSelectedOrderGridType("");
            }
          }}
          required={true}
          readOnly={isCoreLocked}
          disabled={orderId || childRecordCount > 0 || isCoreLocked}
          ref={supplierRef}
          className={`${compactFieldClass} w-full max-w-none`}
          autoFocus={true}
        />
      </div>
      <div className={narrowFieldWrap}>
        <DropdownInput
          name="Order No"
          options={dropDownListObject(
            orderData ? orderData?.data : [],
            "docId",
            "id",
          )}
          value={orderEntryId}
          setValue={handleOrderNoChange}
          readOnly={isCoreLocked || poType !== "ORDER"}
          className={`${compactFieldClass} w-full max-w-none`}
        />
      </div>
      <div className={narrowFieldWrap}>
        <DropdownInput
          name="Item Type"
          options={itemTypeOptions}
          value={orderGridType}
          setValue={(value) => {
            setOrderGridType(value);
          }}
          required={true}
          readOnly={isCoreLocked}
          disabled={isItemTypeDisabled}
          className={`${compactFieldClass} w-full max-w-none`}
          autoFocus={true}
        />
      </div>
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
          required={true}
          readOnly={isCoreLocked}
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
          required={true}
          readOnly={isCoreLocked}
          className={`${compactModalFieldClass} w-full max-w-none`}
          dropdownMinWidth={240}
          addNewLabel="+ Add New Pay Term"
          childComponent={PayTermMaster}
          addNewModalWidth="w-[40%] h-[66%]"
        />
      </div>
    </>
  );

  const supplierDetailsFields = (
    <>
      <div className="min-w-0 md:col-span-2 xl:col-span-2">
        <DropdownWithModal
          name="Supplier"
          options={dropDownListObject(
            id
              ? supplierList?.data?.filter((item) => item?.isSupplier)
              : supplierList?.data?.filter(
                  (item) => item?.active && item?.isSupplier,
                ),
            "name",
            "id",
          )}
          value={supplierId}
          setValue={setSupplierId}
          required={true}
          readOnly={isCoreLocked}
          className={compactModalFieldClass}
          dropdownMinWidth={partyDropdownMinWidth}
          addNewLabel="+ Add New Supplier"
          childComponent={PartyMaster}
          addNewModalWidth="w-[90%] h-[95%]"
          disabled={childRecordCount > 0}
        />
      </div>

      <div className="col-span-1">
        <TextInput
          name="Contact Person"
          placeholder="Contact name"
          value={findFromList(
            supplierId,
            supplierList?.data,
            "contactPersonName",
          )}
          disabled={true}
          className={`${compactFieldClass} ${fieldWidthMedium}`}
        />
      </div>

      <div className="col-span-1">
        <TextInput
          name="Phone"
          placeholder="Contact name"
          value={findFromList(supplierId, supplierList?.data, "contactNumber")}
          disabled={true}
          className={`${compactFieldClass} ${fieldWidthMedium}`}
        />
      </div>
    </>
  );

  const deliveryDetailsFields = (
    <>
      <div className="col-span-1">
        <DropdownInput
          name="Delivery Type"
          options={deliveryTypes}
          value={deliveryType}
          setValue={setDeliveryType}
          required={true}
          readOnly={isCoreLocked}
          className={`${compactFieldClass} ${fieldWidthShort}`}
        />
      </div>
      <div className="col-span-2">
        {deliveryType == "ToSelf" ? (
          <DropdownInput
            name="Delivery To"
            options={
              deliveryType === "ToSelf"
                ? dropDownListObject(
                    branchList ? branchList.data : [],
                    "branchName",
                    "id",
                  )
                : dropDownListObject(allSuppliers, "name", "id")
            }
            value={deliveryToId}
            setValue={setDeliveryToId}
            required={true}
            readOnly={isCoreLocked}
            className={compactFieldClass}
          />
        ) : (
          <DropdownWithModal
            name="Delivery To"
            options={dropDownListObject(
              id
                ? supplierList?.data
                : supplierList?.data?.filter((item) => item?.active),
              "name",
              "id",
            )}
            value={deliveryToId}
            setValue={setDeliveryToId}
            required={true}
            readOnly={isCoreLocked}
            className={compactModalFieldClass}
            dropdownMinWidth={partyDropdownMinWidth}
            addNewLabel="+ Add New Customer"
            childComponent={PartyMaster}
            addNewModalWidth="w-[90%] h-[95%]"
          />
        )}
      </div>
      <div className="col-span-1">
        <DateInputNew
          name="Delivery Date"
          value={dueDate}
          setValue={setDueDate}
          type={"date"}
          required={true}
          readOnly={isCoreLocked}
          min={docDate}
          className={`${compactFieldClass} ${fieldWidthDate}`}
        />
      </div>
    </>
  );

  const basicDetailsCompactSection = (
    <div className={compactCardClass}>
      <h2 className={compactSectionTitleClass}>Basic Details</h2>
      <div className="grid grid-cols-2 gap-1 gap-x-2 items-end md:grid-cols-3 xl:grid-cols-[minmax(0,1fr)_95px_140px_170px]">
        {basicDetailsFields}
      </div>
    </div>
  );

  const supplierDetailsCompactSection = (
    <div className={compactCardClass}>
      <h2 className={compactSectionTitleClass}>Supplier Details</h2>
      <div className={supplierCompactGridClass}>{supplierDetailsFields}</div>
    </div>
  );

  const deliveryDetailsCompactSection = (
    <div className={compactCardClass}>
      <h2 className={compactSectionTitleClass}>Delivery Details</h2>
      <div className={deliveryCompactGridClass}>{deliveryDetailsFields}</div>
    </div>
  );

  const basicDetailsSidebarSection = (
    <div className={sidebarSectionGridClass}>
      <div className={sidebarTwoColumnGridClass}>
        <div className={narrowFieldWrap}>
          <ReusableInput
            label="Order No"
            readOnly
            value={docId}
            className={`${compactFieldClass} ${fieldWidthMedium}`}
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
            className={`${compactFieldClass} ${fieldWidthDate}`}
          />
        </div>
      </div>
      <div className={sidebarTwoColumnGridClass}>
        <div className={narrowFieldWrap}>
          <DropdownInput
            name="Po Type"
            options={poTypes}
            value={poType}
            setValue={(value) => {
              setPoType(value);
            }}
            required={true}
            readOnly={readOnly}
            disabled={orderId || id}
            className={`${compactFieldClass} w-full max-w-none`}
          />
        </div>
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
            required={true}
            readOnly={readOnly}
            className={`${compactFieldClass} w-full max-w-none`}
          />
        </div>
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
          required={true}
          readOnly={readOnly}
          className={`${compactModalFieldClass} w-full max-w-none`}
          dropdownMinWidth={240}
          addNewLabel="+ Add New Pay Term"
          childComponent={PayTermMaster}
          addNewModalWidth="w-[40%] h-[66%]"
        />
      </div>
    </div>
  );

  const supplierDetailsSidebarSection = (
    <div className={sidebarSectionGridClass}>
      <div className={narrowFieldWrap}>
        <DropdownWithModal
          name="Supplier"
          options={dropDownListObject(
            id
              ? supplierList?.data?.filter((item) => item?.isSupplier)
              : supplierList?.data?.filter(
                  (item) => item?.active && item?.isSupplier,
                ),
            "name",
            "id",
          )}
          value={supplierId}
          setValue={setSupplierId}
          required={true}
          readOnly={readOnly}
          className={compactModalFieldClass}
          dropdownMinWidth={partyDropdownMinWidth}
          addNewLabel="+ Add New Supplier"
          childComponent={PartyMaster}
          addNewModalWidth="w-[90%] h-[95%]"
          disabled={id}
        />
      </div>
      <div className={sidebarTwoColumnGridClass}>
        <div className={narrowFieldWrap}>
          <TextInput
            name="Contact Person"
            placeholder="Contact name"
            value={findFromList(
              supplierId,
              supplierList?.data,
              "contactPersonName",
            )}
            disabled={true}
            className={`${compactFieldClass} ${fieldWidthMedium}`}
          />
        </div>
        <div className={narrowFieldWrap}>
          <TextInput
            name="Phone"
            placeholder="Contact name"
            value={findFromList(
              supplierId,
              supplierList?.data,
              "contactNumber",
            )}
            disabled={true}
            className={`${compactFieldClass} ${fieldWidthMedium}`}
          />
        </div>
      </div>
    </div>
  );

  const deliveryDetailsSidebarSection = (
    <div className={sidebarSectionGridClass}>
      <div className={narrowFieldWrap}>
        <DropdownInput
          name="Delivery Type"
          options={deliveryTypes}
          value={deliveryType}
          setValue={setDeliveryType}
          required={true}
          readOnly={readOnly}
          className={`${compactFieldClass} ${fieldWidthShort}`}
        />
      </div>
      <div className="min-w-0">
        {deliveryType == "ToSelf" ? (
          <DropdownInput
            name="Delivery To"
            options={
              deliveryType === "ToSelf"
                ? dropDownListObject(
                    branchList ? branchList.data : [],
                    "branchName",
                    "id",
                  )
                : dropDownListObject(allSuppliers, "name", "id")
            }
            value={deliveryToId}
            setValue={setDeliveryToId}
            required={true}
            readOnly={readOnly}
            className={compactFieldClass}
          />
        ) : (
          <DropdownWithModal
            name="Delivery To"
            options={dropDownListObject(
              id
                ? supplierList?.data
                : supplierList?.data?.filter((item) => item?.active),
              "name",
              "id",
            )}
            value={deliveryToId}
            setValue={setDeliveryToId}
            required={true}
            readOnly={readOnly}
            className={compactModalFieldClass}
            dropdownMinWidth={partyDropdownMinWidth}
            addNewLabel="+ Add New Customer"
            childComponent={PartyMaster}
            addNewModalWidth="w-[90%] h-[95%]"
          />
        )}
      </div>
      <div className={narrowFieldWrap}>
        <DateInputNew
          name="Delivery Date"
          value={dueDate}
          setValue={setDueDate}
          type={"date"}
          required={true}
          readOnly={readOnly}
          min={docDate}
          className={`${compactFieldClass} ${fieldWidthDate}`}
        />
      </div>
    </div>
  );
  // Add this just before the headerContent definition

  const headerContent = (
    <div className="grid grid-cols-1 gap-1 xl:grid-cols-[minmax(0,5fr)_minmax(0,3.6fr)_minmax(0,3.4fr)]">
      {basicDetailsCompactSection}
      {supplierDetailsCompactSection}
      {deliveryDetailsCompactSection}
    </div>
  );

  const footerContent = (
    <>
      <CommonFormFooter
        remarks={remarks}
        setRemarks={setRemarks}
        terms={termsAndCondtion}
        setTerms={setTermsAndCondtion}
        readOnly={isCoreLocked || childRecordCount > 0}
        remarksReadOnly={isFullyLocked}
        showTermSelect={true}
        termValue={termsId}
        onTermChange={(value) => setTermsId(value)}
        twoColumnRightSummary={true}
        rightSummaryTitle="Summary"
        termOptions={
          (id
            ? termsData?.data
            : termsData?.data?.filter((item) => item?.active)
          )?.map((item) => ({
            value: item?.id,
            label: item?.name,
            templateText: item?.description || "",
          })) || []
        }
        totalsRows={[
          {
            key: "totalDiscount",
            label: "Total Discount",
            value: `Rs.${parseFloat((activeTotals?.itemDiscount || 0) + (activeTotals?.overallDiscount || 0)).toFixed(2)}`,
            summaryColumn: "right",
          },
          {
            key: "taxableAmount",
            label: "Taxable Amount",
            value: `Rs.${parseFloat(activeTotals?.taxable || 0).toFixed(2)}`,
            summaryColumn: "right",
          },
          ...taxBreakdownSummary.map((row, index) => ({
            key: `${row.tax}-${row.amount}`,
            label: row.tax,
            value: `Rs.${parseFloat(row.amount || 0).toFixed(2)}`,
            summaryColumn: "right",
            labelClassName: "!text-slate-500 font-normal",
            valueClassName: "text-slate-700",
            className: index === 0 ? "border-t border-slate-100 pt-1" : "",
          })),
          {
            key: "roundOff",
            label: "Round Off",
            value: `Rs.${parseFloat(activeTotals?.roundOff || 0).toFixed(2)}`,
            summaryColumn: "right",
            labelClassName: "!text-slate-500 font-normal",
            valueClassName: "text-slate-700",
          },
          {
            key: "netAmount",
            label: "Net Amount",
            value: `Rs.${parseFloat(activeTotals?.net || 0).toFixed(2)}`,
            summaryColumn: "right",
            emphasized: true,
          },
        ]}
        // extraTotalsContent={taxBreakdownContent}
        // extraTotalsContentColumn="right"
      />
      <TransactionActions
        leftActions={leftActions}
        rightActions={rightActions}
      />
    </>
  );

  const sidebarFooterContent = (
    <>
      <CommonFormFooter
        remarks={remarks}
        setRemarks={setRemarks}
        terms={termsAndCondtion}
        setTerms={setTermsAndCondtion}
        readOnly={isCoreLocked}
        remarksReadOnly={isFullyLocked}
        showTermSelect={true}
        termValue={termsId}
        onTermChange={(value) => setTermsId(value)}
        termOptions={
          (id
            ? termsData?.data
            : termsData?.data?.filter((item) => item?.active)
          )?.map((item) => ({
            value: item?.id,
            label: item?.name,
            templateText: item?.description || "",
          })) || []
        }
        totalsRows={[
          {
            key: "taxableAmount",
            label: "Taxable Amount",
            value: `Rs.${parseFloat(activeTotals?.taxable || 0).toFixed(2)}`,
            summaryColumn: "right",
          },
          {
            key: "netAmount",
            label: "Net Amount",
            value: `Rs.${parseFloat(activeTotals?.net || 0).toFixed(2)}`,
            summaryColumn: "right",
            emphasized: true,
          },
        ]}
        extraTotalsContent={taxBreakdownContent}
        extraTotalsContentColumn="right"
        stacked={true}
      />
      <TransactionActions
        leftActions={leftActions}
        rightActions={rightActions}
      />
    </>
  );

  const summaryPair = (label, value) => (
    <span>
      <span className="font-semibold text-slate-800">{label}:</span>{" "}
      <span className="font-normal text-slate-700">{value || "-"}</span>
    </span>
  );

  const transactionDetailsSummary = [
    summaryPair("Order No", `${docId || "New"} · ${docDate || "No date"}`),
    summaryPair("PO Type", poType),
    summaryPair(
      "Tax",
      findFromList(taxTemplateId, taxTypeList?.data, "name") || "-",
    ),
    summaryPair(
      "Pay Term",
      findFromList(payTermId, payTermList?.data, "name") || "-",
    ),
    summaryPair(
      "Supplier",
      findFromList(supplierId, supplierList?.data, "name") || "-",
    ),
    summaryPair(
      "Contact",
      findFromList(supplierId, supplierList?.data, "contactPersonName") || "-",
    ),
    summaryPair(
      "Phone",
      findFromList(supplierId, supplierList?.data, "contactNumber") || "-",
    ),
    summaryPair(
      "Delivery",
      `${deliveryType || "-"} to ${
        deliveryType === "ToSelf"
          ? findFromList(deliveryToId, branchList?.data, "branchName") || "-"
          : findFromList(deliveryToId, supplierList?.data, "name") || "-"
      }`,
    ),
    summaryPair("Due", dueDate),
  ];

  const sidebarDetailsSections = [
    {
      id: "basic-details",
      title: "Basic Details",
      content: basicDetailsSidebarSection,
      summary: [
        summaryPair("Order No", docId || "New"),
        summaryPair("Date", docDate || "-"),
        summaryPair("PO Type", poType || "-"),
        summaryPair(
          "Tax",
          findFromList(taxTemplateId, taxTypeList?.data, "name") || "-",
        ),
        summaryPair(
          "Pay Term",
          findFromList(payTermId, payTermList?.data, "name") || "-",
        ),
      ],
    },
    {
      id: "supplier-details",
      title: "Supplier Details",
      content: supplierDetailsSidebarSection,
      summary: [
        summaryPair(
          "Supplier",
          findFromList(supplierId, supplierList?.data, "name") || "-",
        ),
        summaryPair(
          "Contact",
          findFromList(supplierId, supplierList?.data, "contactPersonName") ||
            "-",
        ),
        summaryPair(
          "Phone",
          findFromList(supplierId, supplierList?.data, "contactNumber") || "-",
        ),
      ],
    },
    {
      id: "delivery-details",
      title: "Delivery Details",
      content: deliveryDetailsSidebarSection,
      summary: [
        summaryPair("Type", deliveryType || "-"),
        summaryPair(
          "To",
          deliveryType === "ToSelf"
            ? findFromList(deliveryToId, branchList?.data, "branchName") || "-"
            : findFromList(deliveryToId, supplierList?.data, "name") || "-",
        ),
        summaryPair("Date", dueDate || "-"),
      ],
    },
  ];

  return (
    <>
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
              ? "✅ Approve Purchase Order"
              : "↩️ Send Back for Review"}
          </h2>

          <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">PO No</span>
              <span className="font-medium text-gray-800">{docId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Supplier</span>
              <span className="font-medium text-gray-800">
                {findFromList(supplierId, supplierList?.data, "name")}
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
      <Modal
        isOpen={summary}
        onClose={() => setSummary(false)}
        widthClass={"p-10"}
      >
        <PoSummary
          remarks={remarks}
          setRemarks={setRemarks}
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          poItems={
            orderGridType === "FABRIC"
              ? poFabricItems
              : orderGridType === "YARN"
                ? poYarnItems
                : poItems
          }
          taxTypeId={taxTemplateId}
          readOnly={readOnly}
          // isSupplierOutside={isSupplierOutside()}
          isNewVersion={isNewVersion}
          quoteVersion={quoteVersion}
          totals={activeTotals}
          id={id}
          setSummary={setSummary}
        />
      </Modal>
      <Modal
        isOpen={printModalOpen}
        onClose={() => {
          setPrintModalOpen(false);

          // Execute pending action after print modal closes
          if (pendingAction === "new") {
            setId("");
            setDocId("New");
            syncFormWithDb(undefined);
            setTimeout(() => {
              supplierRef.current?.focus();
            }, 100);
          }
          if (pendingAction === "close") {
            onClose();
          }
          setPendingAction(null);
        }}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <PurchaseOrderPrintFormat
            singleData={singleData?.data}
            supplierDetails={supplierDetails?.data}
            deliveryTo={deliveryTo}
            deliveryType={deliveryType}
            branchData={branchData?.data}
            taxDetails={totals}
            taxGroupWise={taxGroupWise}
            colorList={colorList}
            uomList={uomList}
            styleItemList={styleItemList}
            discountType={discountType}
            sizeList={sizeList}
            quoteVersion={quoteVersion}
            discountValue={discountValue}
          />
        </PDFViewer>
      </Modal>
      <TransactionLayout
        title="Purchase Order"
        badge={<ModeChip id={id} readOnly={effectiveReadOnly} />}
        closeIcon={<IoArrowBackCircleSharp className="w-7 h-7" />}
        onClose={onClose}
        onKeyDown={handleKeyDown}
        header={headerContent}
        detailsContent={headerContent}
        detailsTitle="Transaction Details"
        detailsSummary={transactionDetailsSummary}
        sidebarDetailsSections={sidebarDetailsSections}
        sidebarWidthClass="w-[300px]"
        sidebarFooter={sidebarFooterContent}
        gridItems={
          orderGridType === "FABRIC" ? (
            <FabricItems
              poFabricItems={poFabricItems}
              setPoFabricItems={setPoFabricItems}
              orderFabricItems={poFabricItems}
              setFabricItems={setPoFabricItems}
              readOnly={effectiveReadOnly}
              quoteVersion={quoteVersion}
              isNewVersion={isNewVersion}
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
              enrichedItems={activeTotals}
              taxTemplateId={taxTemplateId}
              isSupplierOutside={isSupplierOutside}
              isCustomerExport={false}
              currencyCode={"INR"}
              isCurrencySymbol={"₹"}
            />
          ) : orderGridType === "YARN" ? (
            <YarnItems
              poYarnItems={poYarnItems}
              setPoYarnItems={setPoYarnItems}
              orderYarnItems={poYarnItems}
              setYarnItems={setPoYarnItems}
              readOnly={effectiveReadOnly}
              quoteVersion={quoteVersion}
              isNewVersion={isNewVersion}
              uomList={uomList}
              hsnList={hsnList}
              colorList={colorList}
              yarnList={yarnList}
              id={id}
              termsRef={termsRef}
              enrichedItems={activeTotals}
              taxTemplateId={taxTemplateId}
              isSupplierOutside={isSupplierOutside}
              isCustomerExport={false}
              currencyCode={"INR"}
              isCurrencySymbol={"₹"}
            />
          ) : (
            <PoItems
              id={id}
              poItems={poItems}
              enrichedPoItems={enrichedPoItems}
              setPoItems={setPoItems}
              uomList={uomList}
              hsnList={hsnList}
              readOnly={effectiveReadOnly}
              styleItemList={styleItemList}
              taxTemplateId={taxTemplateId}
              isNewVersion={isNewVersion}
              quoteVersion={quoteVersion}
              itemGroupList={itemGroupList}
              sizeList={sizeList}
              colorList={colorList}
              termsRef={termsRef}
              gsmList={gsmList}
              isSupplierOutside={isSupplierOutside}
            />
          )
        }
        footer={footerContent}
        versionDropdown={
          <div className="flex items-center gap-4">
            {id ? versionDropdown : null}
            {approvalStatusBanner}
          </div>
        }
      />
    </>
  );
};
export default PurchaseOrderForm;
