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
import {
  amountInWords,
  findFromList,
  formatAmountIN,
  getCommonParams,
  ModeChip,
} from "../../../Utils/helper";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { toast } from "react-toastify";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiEye,
  FiLayers,
  FiPrinter,
  FiSave,
  FiSend,
  FiTruck,
  FiUser,
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

const padFabricItems = (itemsArray = [], minLength = 10, quoteVersion = "") => {
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

const padYarnItems = (itemsArray = [], minLength = 10, quoteVersion = "") => {
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
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [approvalModal, setApprovalModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
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
  const [orderDocId, setOrderDocId] = useState("");
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
        const missing = 10 - (visibleFabricItems?.length || 0);
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
        finalFabricItems = Array.from({ length: 10 }, () => ({
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
        const missing = 10 - (visibleYarnItems?.length || 0);
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
        finalYarnItems = Array.from({ length: 10 }, () => ({
          ...EMPTY_YARN_ROW,
          quoteVersion: resolvedQuoteVersion || 1,
          rowId: Math.random().toString(36).substring(2, 9),
        }));
      }
      setPoYarnItems(finalYarnItems);
      setPayTermId(data?.payTermId ? data?.payTermId : "");
      setOrderDocId(data?.OrderEntry?.docId);
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

  const handlePoTypeChange = (newPoType) => {
    if (newPoType === poType) return;
    setPoType(newPoType);
    setPoItems(
      createPurchaseOrderRows(DEFAULT_PURCHASE_ORDER_ROWS, quoteVersion),
    );
    setPoFabricItems(padFabricItems([], 10, quoteVersion));
    setPoYarnItems(padYarnItems([], 10, quoteVersion));
    if (newPoType !== "ORDER") {
      setOrderEntryId("");
      setSelectedOrderGridType("");
    }
  };

  const handleItemTypeChange = (newGridType) => {
    if (newGridType === orderGridType) return;
    setOrderGridType(newGridType);
    setPoItems(
      createPurchaseOrderRows(DEFAULT_PURCHASE_ORDER_ROWS, quoteVersion),
    );
    setPoFabricItems(padFabricItems([], 10, quoteVersion));
    setPoYarnItems(padYarnItems([], 10, quoteVersion));
  };

  const handleOrderNoChange = async (selectedOrderEntryId) => {
    setOrderEntryId(selectedOrderEntryId);
    if (!selectedOrderEntryId) {
      setSelectedOrderGridType("");
      setPoFabricItems(padFabricItems([], 10, quoteVersion));
      setPoYarnItems(padYarnItems([], 10, quoteVersion));
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
          numberOfRolls: item?.numberOfRolls ?? "",
          weightPerRoll: item?.weightPerRoll
            ? Number(item?.weightPerRoll)?.toFixed(3)
            : "",
          totalKgs: item?.totalKgs ? Number(item?.totalKgs)?.toFixed(3) : "",
          pricePerKg: "",
          totalPrice: "",
          qty: item?.qty ? Number(item?.qty)?.toFixed(3) : "",
          price: "",
          amount: "",
          taxPercent: item?.taxPercent ?? "",
          discountValue: "",
          discountvalue: "",
          discountType: "",
          discounttype: "",
          rowId: Math.random().toString(36).substring(2, 9),
        }));
        setPoFabricItems(padFabricItems(mapped, 10, quoteVersion));

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
            price: "",
            amount: "",
            taxPercent: item?.taxPercent ?? "",
            discountValue: "",
            discountvalue: "",
            discountType: "",
            discounttype: "",
            rowId: Math.random().toString(36).substring(2, 9),
          }));
          setPoYarnItems(padYarnItems(yarnMapped, 10, quoteVersion));
        } else {
          setPoYarnItems(padYarnItems([], 10, quoteVersion));
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
          price: "",
          amount: "",
          taxPercent: item?.taxPercent ?? "",
          discountValue: "",
          discountvalue: "",
          discountType: "",
          discounttype: "",
          rowId: Math.random().toString(36).substring(2, 9),
        }));
        setPoYarnItems(padYarnItems(mapped, 10, quoteVersion));
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

  useEffect(() => {
    setShowVersionDropdown(false);
  }, [id]);

  const versionDropdown = (
    <div className="flex items-center bg-[#102438]/90 border border-[#28496D] px-1.5 py-0 rounded-md shadow-xs h-6">
      <div className="relative flex items-center">
        <select
          value={quoteVersion}
          onChange={(e) => setQuoteVersion(Number(e.target.value))}
          className="appearance-none bg-transparent border-0 text-white text-xs pl-1 pr-4 py-0 focus:outline-none cursor-pointer font-semibold leading-none"
        >
          {quoteVersionOptions.length > 0 ? (
            quoteVersionOptions.map((v, index) => (
              <option key={v} value={v} className="bg-[#102438] text-white">
                {index === quoteVersionOptions.length - 1 ? "Latest" : `V${v}`}
              </option>
            ))
          ) : (
            <option
              value={quoteVersion || 1}
              className="bg-[#102438] text-white"
            >
              V{quoteVersion || 1}
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
    "px-2 py-1 rounded-md flex items-center justify-center text-xs font-medium text-white shadow-sm hover:shadow-md active:scale-95 hover:-translate-y-0.5 transition-all duration-150 border border-white/20";

  const handleViewSummary = (e) => {
    if (e && e.key && e.key !== "Enter") return;
    if (!taxTemplateId) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      toast.info("Please Select Tax Template !", {
        position: "top-center",
      });
      return;
    }
    if (e && e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
    setSummary(true);
  };

  const leftActions = [
    ...(isFullyLocked
      ? []
      : [
          {
            key: "save-close",
            icon: <HiOutlineRefresh className="w-3.5 h-3.5 mr-1" />,
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
            className: `bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-2.5 py-1 rounded-md flex items-center text-xs font-medium shadow-sm hover:shadow-md hover:shadow-blue-500/25 active:scale-95 transition-all duration-150 border border-blue-400/25 ${
              readOnly || status === "APPROVED"
                ? "opacity-50 cursor-not-allowed hover:shadow-none hover:from-blue-600 hover:to-indigo-600 active:scale-100"
                : "hover:-translate-y-0.5"
            }`,
          },
          ...(status === "APPROVED"
            ? []
            : [
                {
                  key: "save-new",
                  icon: <FiSave className="w-3.5 h-3.5 mr-1" />,
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
                  className: `bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-2.5 py-1 rounded-md flex items-center text-xs font-medium shadow-sm hover:shadow-md hover:shadow-emerald-500/25 active:scale-95 transition-all duration-150 border border-emerald-400/25 ${
                    readOnly
                      ? "opacity-50 cursor-not-allowed hover:shadow-none hover:from-emerald-600 hover:to-teal-600 active:scale-100"
                      : "hover:-translate-y-0.5"
                  }`,
                },
              ]),
        ]),
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
            className: `bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 hover:shadow-green-500/25 ${actionButtonClass}`,
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
            className: `bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25 ${actionButtonClass}`,
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
            className: `bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/25 ${actionButtonClass}`,
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
            icon: <FiEdit2 className="w-3.5 h-3.5 mr-1" />,
            label: "Edit",
            hoverLabel: "Edit",
            onClick: () => setReadOnly(false),
            className: `bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white px-2.5 py-1 rounded-md flex items-center text-xs font-medium shadow-sm hover:shadow-md hover:shadow-amber-500/25 active:scale-95 hover:-translate-y-0.5 transition-all duration-150 border border-amber-400/25`,
          },
        ]),
    ...(id
      ? [
          {
            key: "print",
            icon: <FiPrinter className="w-3.5 h-3.5 mr-1" />,
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
            className: `bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white px-2.5 py-1 rounded-md flex items-center text-xs font-medium shadow-sm hover:shadow-md hover:shadow-orange-500/25 active:scale-95 hover:-translate-y-0.5 transition-all duration-150 border border-orange-400/25`,
          },
        ]
      : []),
  ];

  const headerActionsContent = (
    <div className="flex items-center gap-1.5 flex-wrap">
      {leftActions.map((action, index) => (
        <button
          key={action.key || index}
          type="button"
          onClick={action.onClick}
          onKeyDown={action.onKeyDown}
          disabled={action.disabled}
          className={action.className}
          title={action.hoverLabel || action.title}
        >
          {action.icon}
          {!action.iconOnly && action.label}
        </button>
      ))}
      {rightActions.map((action, index) => (
        <button
          key={action.key || index}
          type="button"
          onClick={action.onClick}
          onKeyDown={action.onKeyDown}
          disabled={action.disabled}
          className={action.className}
          title={action.hoverLabel || action.title}
        >
          {action.icon}
          {!action.iconOnly && action.label}
        </button>
      ))}
    </div>
  );

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

  const compactFieldClass = "px-2 py-1 text-[11px] text-black !text-black";
  const compactModalFieldClass =
    "w-full px-2 py-1 text-[11px] text-black !text-black";
  const compactCardClass =
    "border border-slate-200 px-1.5 py-1 bg-white rounded-md shadow-sm";
  const compactSectionTitleClass =
    "font-medium text-[11px] text-slate-700 mb-0.5";
  const fieldWidthShort = "w-full min-w-0";
  const fieldWidthMedium = "w-full min-w-0";
  const fieldWidthDate = "w-full min-w-0";
  const narrowFieldWrap = "min-w-0";
  const partyDropdownMinWidth = 260;
  const supplierCompactGridClass =
    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 items-end";
  const deliveryCompactGridClass =
    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 items-end";
  const sidebarSectionGridClass = "grid grid-cols-1 gap-1";
  const sidebarTwoColumnGridClass = "grid grid-cols-2 gap-1";

  const basicDetailsFields = (
    <>
      <div
        className={`${narrowFieldWrap} ${id ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (id) setShowVersionDropdown((prev) => !prev);
        }}
        title={id ? "Click to toggle version dropdown" : ""}
      >
        <ReusableInput
          label="Po No"
          readOnly
          value={docId}
          className={`${compactFieldClass} ${fieldWidthMedium} ${id ? "cursor-pointer" : ""}`}
          labelClass="!text-[#7098BC]"
        />
      </div>
      <div className={narrowFieldWrap}>
        <ReusableInput
          label="Date"
          value={docDate}
          type={"date"}
          required={true}
          readOnly={true}
          disabled
          className={`${compactFieldClass} ${fieldWidthDate}`}
          labelClass="!text-[#7098BC]"
        />
      </div>
      <div className={narrowFieldWrap}>
        <DropdownInput
          name="Po Type"
          options={poTypes}
          value={poType}
          setValue={handlePoTypeChange}
          required={true}
          readOnly={isCoreLocked}
          disabled={id || orderId || childRecordCount > 0 || isCoreLocked}
          ref={supplierRef}
          className={`${compactFieldClass} w-full max-w-none`}
          autoFocus={true}
        />
      </div>
      {id ? (
        <div className={narrowFieldWrap}>
          <ReusableInput
            label="Order No"
            value={orderDocId}
            readOnly
            className={`${compactFieldClass} w-full max-w-none`}
          />
        </div>
      ) : (
        <>
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
        </>
      )}

      <div className={narrowFieldWrap}>
        <DropdownInput
          name="Item Type"
          options={itemTypeOptions}
          value={orderGridType}
          setValue={handleItemTypeChange}
          required={true}
          readOnly={isCoreLocked}
          disabled={id || isItemTypeDisabled}
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
          readOnly={isCoreLocked}
          className={`${compactFieldClass} w-full max-w-none`}
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
    <div
      style={{
        backgroundImage:
          "radial-gradient(120% 70% at 50% 0%, rgba(96, 165, 250, 0.22) 0%, rgba(30, 75, 125, 0.12) 45%, transparent 75%), linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%), linear-gradient(180deg, #16304C 0%, #0d1e30 40%, #050b12 75%, #000000 100%)",
      }}
      className="border border-[#20456C] text-white rounded-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_1px_3px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col border-l-4 border-l-white
      [&_label]:!text-[#7098BC] [&_label]:!text-[10px] [&_label]:!font-bold [&_label]:!tracking-[0.1em] [&_label]:!uppercase
      [&_label_p]:!text-[#7098BC] [&_label_span:not(.text-red-500)]:!text-[#7098BC] [&_.text-red-500]:!text-rose-400
      [&_input]:!bg-[#102438] [&_input]:!border-[#28496D] [&_input]:!text-white [&_input]:[-webkit-text-fill-color:white] [&_input]:!opacity-100 [&_input]:!rounded-md [&_input]:[color-scheme:dark]
      [&_select]:!bg-[#102438] [&_select]:!border-[#28496D] [&_select]:!text-white [&_select]:!rounded-md
      [&_select_option]:!bg-[#102438] [&_select_option]:!text-white
      [&_.bg-slate-100]:!bg-[#102438] [&_.bg-slate-100]:!border-[#28496D] [&_.bg-slate-100]:!text-white [&_.bg-slate-100]:[-webkit-text-fill-color:white] [&_.bg-slate-100]:!rounded-md
      [&_.mb-1_button]:!bg-[#102438] [&_.mb-1_button]:!border-[#28496D] [&_.mb-1_button]:!text-white [&_.mb-1_button]:!rounded-md [&_.mb-1_button_span]:!text-white [&_.mb-1_button_svg]:!text-[#7098BC]"
    >
      <div className="flex items-center justify-between px-2.5 py-1 border-b border-[#20456C] bg-transparent rounded-t-md flex-none">
        <div className="flex items-center gap-2 min-w-0 flex-nowrap h-6">
          <FiLayers className="w-3.5 h-3.5 text-[#7098BC] flex-shrink-0" />
          <span
            onClick={() => {
              if (id) setShowVersionDropdown((prev) => !prev);
            }}
            className={`font-bold text-[10px] text-[#7098BC] tracking-[0.12em] uppercase truncate select-none ${
              id ? "cursor-pointer hover:text-white" : ""
            }`}
            title={id ? "Click to toggle version dropdown" : ""}
          >
            Basic Details · {docId && docId !== "New" ? docId : "New PO"}
          </span>
          {id && (
            <div
              className={`flex items-center flex-shrink-0 transition-opacity duration-150 ${
                showVersionDropdown
                  ? "opacity-100 visible"
                  : "opacity-0 invisible pointer-events-none"
              }`}
            >
              {versionDropdown}
            </div>
          )}
        </div>
      </div>
      <div className="px-2 py-1 flex-1 min-h-0">
        <div className="grid grid-cols-2 gap-1 gap-x-2 items-end md:grid-cols-3 xl:grid-cols-[minmax(0,1fr)_95px_140px_170px]">
          {basicDetailsFields}
        </div>
      </div>
    </div>
  );

  const supplierDetailsCompactSection = (
    <div className="border border-slate-200 bg-white rounded-md shadow-sm overflow-hidden flex flex-col border-l-4 border-l-blue-600">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200/80 bg-slate-50 rounded-t-md flex-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <FiUser className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="font-semibold text-[11px] text-slate-800 tracking-wider uppercase truncate">
            Supplier Details
          </span>
        </div>
      </div>
      <div className="px-2.5 py-2 flex-1 min-h-0">
        <div className={supplierCompactGridClass}>{supplierDetailsFields}</div>
      </div>
    </div>
  );

  const deliveryDetailsCompactSection = (
    <div className="border border-slate-200 bg-white rounded-md shadow-sm overflow-hidden flex flex-col border-l-4 border-l-amber-500">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200/80 bg-slate-50 rounded-t-md flex-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <FiTruck className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="font-semibold text-[11px] text-slate-800 tracking-wider uppercase truncate">
            Delivery Details
          </span>
        </div>
      </div>
      <div className="px-2.5 py-2 flex-1 min-h-0">
        <div className={deliveryCompactGridClass}>{deliveryDetailsFields}</div>
      </div>
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
            setValue={handlePoTypeChange}
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
          readOnly={readOnly}
          className={`${compactFieldClass} w-full max-w-none`}
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
  const basicDetailsSidebar = (
    <aside
      style={{
        backgroundImage:
          "radial-gradient(120% 70% at 50% 0%, rgba(96, 165, 250, 0.25) 0%, rgba(30, 75, 125, 0.12) 45%, transparent 75%), linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%), linear-gradient(180deg, #16304C 0%, #0d1e30 40%, #050b12 75%, #000000 100%)",
      }}
      className={`transition-all duration-300 ease-in-out flex flex-col min-h-0 flex-none self-stretch text-white rounded-md border border-[#20456C] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_1px_3px_rgba(0,0,0,0.3)] border-l-4 border-l-white overflow-hidden relative ${
        isSidebarOpen ? "w-[260px] xl:w-[280px]" : "w-[44px]"
      }`}
    >
      {isSidebarOpen ? (
        <div className="flex flex-col h-full min-h-0 relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-28 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none" />
          {/* Header of Sidebar */}
          <div className="px-3.5 pt-2.5 pb-2.5 border-b border-[#20456C] flex-none">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-[#7098BC] tracking-[0.14em] uppercase block leading-tight">
                    Purchase Order
                  </span>
                  {id && <ModeChip id={id} readOnly={effectiveReadOnly} />}
                </div>
                <div className="flex items-center gap-2 flex-nowrap mt-1 h-7">
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
                    {docId && docId !== "New" ? docId : "New PO"}
                  </h2>
                  {id && (
                    <div
                      className={`flex items-center flex-shrink-0 transition-opacity duration-150 ${
                        showVersionDropdown
                          ? "opacity-100 visible"
                          : "opacity-0 invisible pointer-events-none"
                      }`}
                    >
                      {versionDropdown}
                    </div>
                  )}
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

            {/* Approval banner inside basic details */}
            {id && approvalStatusBanner && (
              <div className="mt-2 pt-2 border-t border-[#20456C]/80 flex items-center justify-between gap-2 flex-wrap">
                {approvalStatusBanner}
              </div>
            )}
          </div>

          {/* Form Content */}
          <div
            className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5 space-y-2.5
            [&_label]:!text-[#7098BC] [&_label]:!text-[10px] [&_label]:!font-bold [&_label]:!tracking-[0.1em] [&_label]:!uppercase [&_label]:!mb-1
            [&_label_p]:!text-[#7098BC] [&_label_span:not(.text-red-500)]:!text-[#7098BC] [&_.text-red-500]:!text-rose-400
            [&_input]:!bg-[#102438] [&_input]:!border-[#28496D] [&_input]:!text-white [&_input]:[-webkit-text-fill-color:white] [&_input]:!opacity-100 [&_input]:!rounded-md [&_input]:[color-scheme:dark] [&_input:focus]:!border-sky-400
            [&_select]:!bg-[#102438] [&_select]:!border-[#28496D] [&_select]:!text-white [&_select]:!rounded-md [&_select:focus]:!border-sky-400
            [&_select_option]:!bg-[#102438] [&_select_option]:!text-white
            [&_.bg-slate-100]:!bg-[#102438] [&_.bg-slate-100]:!border-[#28496D] [&_.bg-slate-100]:!text-white [&_.bg-slate-100]:[-webkit-text-fill-color:white] [&_.bg-slate-100]:!rounded-md
            [&_.mb-1_button]:!bg-[#102438] [&_.mb-1_button]:!border-[#28496D] [&_.mb-1_button]:!text-white [&_.mb-1_button]:!rounded-md [&_.mb-1_button_span]:!text-white [&_.mb-1_button_svg]:!text-[#7098BC]"
          >
            {/* PO No and Date */}
            <div className="grid grid-cols-2 gap-1.5">
              <div
                className={`${narrowFieldWrap} ${id ? "cursor-pointer" : ""}`}
                onClick={() => {
                  if (id) setShowVersionDropdown((prev) => !prev);
                }}
                title={id ? "Click to toggle version dropdown" : ""}
              >
                <ReusableInput
                  label="Po No"
                  readOnly
                  value={docId}
                  className={`${compactFieldClass} w-full ${id ? "cursor-pointer" : ""}`}
                  labelClass="!text-[#7098BC]"
                />
              </div>
              <div className={narrowFieldWrap}>
                <ReusableInput
                  label="Date"
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

            {/* Row 2: PO Type & Order No */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className={narrowFieldWrap}>
                <DropdownInput
                  name="Po Type"
                  options={poTypes}
                  value={poType}
                  setValue={handlePoTypeChange}
                  required={true}
                  readOnly={isCoreLocked}
                  disabled={
                    id || orderId || childRecordCount > 0 || isCoreLocked
                  }
                  ref={supplierRef}
                  className={`${compactFieldClass} w-full max-w-none`}
                  autoFocus={true}
                />
              </div>

              {id ? (
                <div className={narrowFieldWrap}>
                  <ReusableInput
                    label="Order No"
                    value={orderDocId}
                    readOnly
                    className={`${compactFieldClass} w-full max-w-none`}
                    labelClass="!text-[#7098BC]"
                  />
                </div>
              ) : (
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
              )}
            </div>

            {/* Row 3: Item Type & Tax Type */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className={narrowFieldWrap}>
                <DropdownInput
                  name="Item Type"
                  options={itemTypeOptions}
                  value={orderGridType}
                  setValue={handleItemTypeChange}
                  required={true}
                  readOnly={isCoreLocked}
                  disabled={id || isItemTypeDisabled}
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
            </div>

            {/* Pay Term */}
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
                readOnly={isCoreLocked}
                className={`${compactFieldClass} w-full max-w-none`}
              />
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
                  INR
                </span>
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  {formatAmountIN(activeTotals?.net || 0)}
                </span>
              </div>
              <div className="text-[11px] font-medium text-[#7098BC] leading-snug break-words mt-1.5">
                {amountInWords(Number(activeTotals?.net || 0))}
              </div>
            </div>

            {/* View Summary Button */}
            <button
              type="button"
              onClick={handleViewSummary}
              onKeyDown={handleViewSummary}
              className="w-full bg-[#102438] hover:bg-[#152e47] active:bg-[#0c1c2c] text-white py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold shadow-sm transition border border-[#28496D]"
              title="View PO Summary"
            >
              <FiEye className="w-4 h-4 text-white" />
              <span>View summary</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full min-h-0 items-center justify-between py-2">
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
              title={`Net Amount: ₹ ${formatAmountIN(activeTotals?.net || 0)}\n${amountInWords(Number(activeTotals?.net || 0))}`}
              onClick={toggleSidebar}
            >
              ₹
              {parseFloat(activeTotals?.net || 0) >= 1000
                ? `${(parseFloat(activeTotals?.net || 0) / 1000).toFixed(1)}k`
                : parseFloat(activeTotals?.net || 0).toFixed(0)}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleViewSummary(e);
              }}
              title="View summary"
              className="p-1.5 rounded-md text-white hover:bg-[#102438] transition border border-transparent hover:border-[#28496D]"
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
                  title={`PO: ${docId}`}
                >
                  #{docId.slice(-4)}
                </span>
              )}
              <span
                className="px-1 py-0.5 rounded bg-white/10 text-white/90 font-medium text-[9px] uppercase"
                title={`Type: ${poType}`}
              >
                {poType?.slice(0, 3)}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );

  const headerContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 w-full">
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
        sectionColClass="md:col-span-3"
        summaryColClass="md:col-span-6"
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
    <div className="po-form-geist w-full h-full min-h-0 flex flex-col">
      <Modal
        isOpen={approvalModal}
        onClose={() => setApprovalModal(false)}
        widthClass="w-[420px]"
      >
        <div className="po-form-geist space-y-4">
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
        widthClass="!p-0 !rounded-xl overflow-hidden shadow-2xl max-w-lg w-full"
      >
        <div className="po-form-geist">
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
        </div>
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
        className="po-form-geist"
        showTabs={true}
        title="Purchase Order"
        closeIcon={<IoArrowBackCircleSharp className="w-6 h-6" />}
        onClose={onClose}
        onKeyDown={handleKeyDown}
        leftSidebar={basicDetailsSidebar}
        headerActions={headerActionsContent}
        header={headerContent}
        detailsContent={headerContent}
        detailsTitle="Transaction Details"
        detailsSummary={transactionDetailsSummary}
        sidebarDetailsSections={sidebarDetailsSections}
        sidebarWidthClass="w-[260px] xl:w-[280px]"
        sidebarFooter={sidebarFooterContent}
        gridItems={
          orderGridType === "FABRIC" ? (
            <FabricItems
              poType={poType}
              selectedOrderGridType={selectedOrderGridType}
              poFabricItems={poFabricItems}
              setPoFabricItems={setPoFabricItems}
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
              poType={poType}
              selectedOrderGridType={selectedOrderGridType}
              poYarnItems={poYarnItems}
              setPoYarnItems={setPoYarnItems}
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
      />
    </div>
  );
};
export default PurchaseOrderForm;
