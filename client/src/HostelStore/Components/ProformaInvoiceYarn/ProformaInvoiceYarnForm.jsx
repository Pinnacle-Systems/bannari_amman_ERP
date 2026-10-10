import React, { useEffect, useState, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import {
  TextInput,
  DropdownInput,
  DateInputNew,
} from "../../../Inputs/index.js";
import {
  useAddYarnProformaInvoiceMutation,
  useUpdateYarnProformaInvoiceMutation,
  useGetYarnProformaInvoiceByIdQuery,
  useGetYarnProformaInvoiceQuery,
} from "../../../redux/uniformService/YarnProformaInvoiceService.js";
import {
  findFromList,
  getCommonParams,
  ModeChip,
  formatCurrencyAmount,
} from "../../../Utils/helper.js";
import {
  dropDownListObject,
  dropDownListObjectMultiple,
} from "../../../Utils/contructObject.js";
import ProformaInvoiceYarnItems from "./ProformaInvoiceYarnItems.jsx";
import moment from "moment";
import { PDFViewer } from "@react-pdf/renderer";
import Modal from "../../../UiComponents/Modal/index.js";
import ProformaInvoiceYarnPrintFormat from "./ProformaInvoiceYarnPrintFormat.jsx";
import tw from "../../../Utils/tailwind-react-pdf.js";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { FiEdit2, FiSave, FiPrinter, FiEye } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import OrderEntryApi from "../../../redux/uniformService/OrderEntryService.js";
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
import {
  BankMaster,
  CurrencyMaster,
  PayTermMaster,
} from "../../../Basic/components/index.js";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags.js";
import { useDispatch } from "react-redux";

const EMPTY_ROW = {
  yarnId: "",
  hsnId: "",
  contentId: "",
  countsId: "",
  colorId: "",
  uomId: "",
  qty: "",
  price: "",
  amount: "",
  taxPercent: "",
  discountvalue: "",
  discounttype: "",
};

const padItems = (itemsArray = []) => {
  const minLength = 14;
  const currentLength = itemsArray.length;

  const formattedItems = itemsArray.map((item) =>
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

const ProformaInvoiceYarnForm = ({
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
  const [yarnItems, setYarnItems] = useState(padItems([]));
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

  const { data: allData } = useGetYarnProformaInvoiceQuery({
    params: { branchId },
  });
  const { data: singleData } = useGetYarnProformaInvoiceByIdQuery(id, {
    skip: !id,
  });
  const { data: taxTypeList } = useGetTaxTemplateQuery({
    params: { companyId },
  });

  const { data: supplierData } = useGetPartyByIdQuery(customerId, {
    skip: !customerId,
  });

  const [dispatchInvalidate] = useInvalidateTags();

  const [addData, { isLoading: isSaving }] =
    useAddYarnProformaInvoiceMutation();
  const [updateData, { isLoading: isUpdating }] =
    useUpdateYarnProformaInvoiceMutation();

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
      if (data.yarnItems?.length > 0) {
        loadedVersions = [
          ...new Set(data.yarnItems.map((i) => i.quoteVersion).filter(Boolean)),
        ].sort((a, b) => b - a);
      }
      setAvailableVersions(loadedVersions);
      setSelectedQuoteVersion("Latest");

      const targetVersion =
        loadedVersions.length > 0 ? Math.max(...loadedVersions, 1) : 1;
      const filteredItems = (data?.yarnItems || []).filter(
        (i) => (i.quoteVersion || 1) === targetVersion,
      );
      const mappedItems = filteredItems?.map((item) => ({
        ...item,

        qty: item?.qty?.toFixed(3),
        price: item?.price?.toFixed(2),
        amount: item?.amount?.toFixed(2),
      }));

      setYarnItems(padItems(mappedItems));

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
    if (singleData?.data?.yarnItems && id) {
      const itemsArr = singleData.data.yarnItems;
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

        qty: item?.qty?.toFixed(3),
        price: item?.price?.toFixed(2),
        amount: item?.amount?.toFixed(2),
      }));

      setYarnItems(padItems(mappedItems));
    }
  }, [selectedQuoteVersion, singleData, id, availableVersions]);

  useEffect(() => {
    customerRef.current?.focus();
  }, []);

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
      if (!item.yarnId) {
        errors.push(`Row ${index + 1}: Fabric is required`);
      }
      if (!item.hsnId) {
        errors.push(`Row ${index + 1}: HSN is required`);
      }
      if (!item.uomId) {
        errors.push(`Row ${index + 1}: UOM is required`);
      }
      if (!item.qty || Number(item.qty) <= 0) {
        errors.push(`Row ${index + 1}: Qty is required`);
      }
      const key = `${item.yarnId}_${item.designId}_${item.gsmId}_${item.colorId}`;
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
        text: "User Date cannot be smaller than Doc Date",
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

    if (validityTo < docDate) {
      Swal.fire({
        title: "Warning",
        text: "Valid To Date cannot be smaller than Doc Date",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    if (deliveryDate < docDate) {
      Swal.fire({
        title: "Warning",
        text: "Delivery Date cannot be smaller than Doc Date",
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

    const filteredItems = yarnItems.filter((item) => item.yarnId);

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
      dispatch(OrderEntryApi.util.invalidateTags(["orderEntry"]));
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
    setYarnItems(padItems([]));
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

  const shippingAccordion = (
    <div className="border border-slate-200 rounded-md bg-white shadow-sm mt-1">
      <div className="w-full flex items-center justify-between px-3 py-1.5 text-left bg-gray-50 rounded-t-md border-b border-slate-200">
        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">
          Other Details
        </span>
      </div>
      <div className="px-3 pt-2 pb-2">
        <div className="flex gap-2 gap-x-4 w-fit ml-6">
          <div className="w-[105px]">
            <DateInputNew
              name="Valid To"
              value={validityTo}
              setValue={setValidityTo}
              disabled={effectiveReadOnly}
              required={true}
              type="date"
              min={docDate}
            />
          </div>
          <div className="w-60">
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
            />
          </div>
          <div className="w-60">
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
            />
          </div>

          <div className="w-[105px]">
            <DateInputNew
              name="Delivery Date"
              value={deliveryDate}
              setValue={setDeliveryDate}
              disabled={effectiveReadOnly}
              type="date"
              min={docDate}
            />
          </div>
          <div className="w-28">
            <TextInput
              name={`Carriage Charges ${currencyId ? `(${isCurrencySymbol})` : ""}`}
              value={carriageCharge}
              setValue={setCarriageCharge}
              disabled={effectiveReadOnly}
              type="number"
              min="0"
              className="text-right"
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
              disabled={effectiveReadOnly}
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
          <div className="w-72">
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
              className={`w-[150px]`}
              addNewLabel="+ Add New Bank"
              childComponent={BankMaster}
              addNewModalWidth="w-[45%] h-[64%]"
              disabled={readOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const headerContent = (
    <>
      <div className="flex flex-col md:flex-row gap-1 w-full">
        <div className="flex flex-col md:flex-row gap-1 w-full">
          <div className="w-fit border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
            <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">
              Basic Details
            </h2>
            <div className="flex gap-2">
              <div className="w-36">
                <TextInput name="PI No" value={docId} disabled={true} />
              </div>
              <div className="w-24">
                <DateInputNew
                  name="PI Date"
                  value={docDate}
                  setValue={setDocDate}
                  disabled={true}
                  required={true}
                  type="date"
                />
              </div>
              <div className="w-[105px]">
                <DateInputNew
                  name="User Date"
                  value={userDate}
                  setValue={setUserDate}
                  disabled={effectiveReadOnly}
                  required={false}
                  type="date"
                  min={docDate}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 border border-slate-200 p-1.5 bg-white rounded-md shadow-sm">
            <h2 className="text-[10px] font-bold text-gray-500 mb-1 uppercase border-b pb-0.5">
              Customer Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-8 gap-2">
              <div className="md:col-span-2">
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
                  className={`w-[150px]`}
                  addNewLabel="+ Add New Customer"
                  childComponent={PartyMaster}
                  addNewModalWidth="w-[90%] h-[95%]"
                  disabled={effectiveReadOnly}
                  openOnFocus={true}
                  // autoFocus={true}
                  ref={customerRef}
                />
              </div>
              <div className="md:col-span-1">
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
              <div className="md:col-span-1">
                <TextInput
                  name="Phone"
                  placeholder="Contact name"
                  value={findFromList(
                    customerId,
                    customerList?.data,
                    "contactNumber",
                  )}
                  disabled={true}
                />
              </div>

              <TextInput
                name="Customer Po No"
                value={customerPoNo}
                setValue={setCustomerPoNo}
                disabled={effectiveReadOnly}
                type="text"
                onFocus={(e) => {
                  e.target.select();
                }}
              />
              <div className="md:col-span-1">
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
                />
              </div>
              <div className="md:col-span-1">
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
                  readOnly={effectiveReadOnly}
                  className={`w-full max-w-none`}
                  dropdownMinWidth={240}
                  addNewLabel="+ Add New Pay Term"
                  childComponent={PayTermMaster}
                  addNewModalWidth="w-[40%] h-[66%]"
                />
              </div>
              <div className="md:col-span-1">
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
                  required={isCustomerExport}
                  readOnly={effectiveReadOnly || !isCustomerExport}
                  className={`w-full max-w-none`}
                  dropdownMinWidth={240}
                  addNewLabel="+ Add New Currency"
                  childComponent={CurrencyMaster}
                  addNewModalWidth="w-[40%] h-[66%]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {shippingAccordion}
    </>
  );

  const isSupplierOutside = useMemo(() => {
    return supplierData?.data?.City?.state?.name !== "TAMILNADU";
  }, [supplierData]);

  const enrichedData = useMemo(() => {
    const filteredItems = yarnItems.filter((i) => i.yarnId);
    if (!filteredItems.length)
      return {
        items: [],
        gross: 0,
        taxable: 0,
        net: 0,
        slabBreakup: [],
        roundOff: 0,
      };

    // We need taxPercent for each item. If missing, we should ideally get it from HSN master.
    // For now, we'll try to use what's in the item.
    return calculateTaxWithHSNBreakupAndInsertIntoPoItems(
      filteredItems,
      isSupplierOutside,
      discountType,
      discountValue,
    );
  }, [yarnItems, isSupplierOutside, discountType, discountValue]);

  const versionDropdown = (
    <div className="flex items-center gap-2 ml-2">
      <span className="text-xs text-gray-500 mt-1">Version</span>

      <div className="relative">
        <select
          value={selectedQuoteVersion}
          onChange={(e) => setSelectedQuoteVersion(e.target.value)}
          className="appearance-none bg-white border border-gray-300 text-gray-700 text-xs rounded-md pl-2 pr-6 py-1 
                   focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 
                   hover:border-gray-400 transition"
        >
          {availableVersions.length > 0 ? (
            availableVersions.map((v) => (
              <option
                key={v}
                value={
                  Math.max(...availableVersions) === v ? "Latest" : `V${v}`
                }
              >
                {Math.max(...availableVersions) === v ? "Latest" : `V${v}`}
              </option>
            ))
          ) : (
            <option value="Latest">Latest</option>
          )}
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

  const totalQty = enrichedData?.items?.reduce(
    (sum, item) => sum + (parseFloat(item.qty) || 0),
    0,
  );

  const footerContent = (
    <>
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
            key: "netAmount",
            label: "Total Amount",
            value: `${isCurrencySymbol ? isCurrencySymbol + " " : ""}${formatCurrencyAmount(
              !isCustomerExport
                ? enrichedData.net
                : (enrichedData.items?.reduce(
                    (sum, item) => sum + (parseFloat(item.amount) || 0),
                    0,
                  ) || 0) -
                    (enrichedData.itemDiscount + enrichedData.overallDiscount >
                    0
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
              (!isCustomerExport
                ? enrichedData.net
                : (enrichedData.items?.reduce(
                    (sum, item) => sum + (parseFloat(item.amount) || 0),
                    0,
                  ) || 0) -
                  (enrichedData.itemDiscount + enrichedData.overallDiscount > 0
                    ? enrichedData.itemDiscount + enrichedData.overallDiscount
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
            onClick={() => handleSave("close")}
            disabled={effectiveReadOnly || isSaving || isUpdating}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave("close");
                e.stopPropagation();
              }
            }}
            className={`bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 flex items-center text-xs ${
              effectiveReadOnly || isSaving || isUpdating
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }`}
          >
            <HiOutlineRefresh className="w-4 h-4 mr-2" />
            {id ? "Update & Close" : "Save & Close"}
          </button>
          <button
            onClick={() => handleSave("new")}
            disabled={effectiveReadOnly || isSaving || isUpdating}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                handleSave("new");
              }
            }}
            className={`bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 flex items-center text-xs ${
              effectiveReadOnly || isSaving || isUpdating
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
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
        </div>

        {/* Right Buttons */}
        <div className="flex gap-2 flex-wrap">
          {readOnly && id && !isOldVersion && (
            <button
              onClick={() => hasPermission(() => setReadOnly(false), "edit")}
              className="bg-yellow-600 text-white px-4 py-1 rounded hover:bg-yellow-700 flex items-center text-xs"
            >
              <FiEdit2 className="w-4 h-4 mr-2" />
              Edit
            </button>
          )}
          {/* {id && (
            <button
              onClick={() => setPrintModalOpen(true)}
              className="bg-slate-600 text-white px-4 py-1 rounded hover:bg-slate-700 flex items-center text-xs"
            >
              <FiPrinter className="w-4 h-4 mr-2" />
              Print
            </button>
          )} */}
        </div>
      </div>
    </>
  );

  return (
    <>
      <Modal isOpen={summary} onClose={() => setSummary(false)} widthClass="">
        <PoSummary
          poItems={yarnItems}
          totals={enrichedData}
          readOnly={effectiveReadOnly}
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          setSummary={setSummary}
          isCustomerExport={isCustomerExport}
        />
      </Modal>

      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <ProformaInvoiceYarnPrintFormat
            data={{
              ...singleData?.data,
              items: yarnItems.filter(
                (i) =>
                  i.styleItemId ||
                  (i.styleBreakup && i.styleBreakup.length > 0) ||
                  i.itemGroupId,
              ),
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
          />
        </PDFViewer>
      </Modal>

      <TransactionLayout
        title="Yarn Proforma Invoice"
        badge={<ModeChip id={id} readOnly={readOnly} />}
        closeIcon={<IoArrowBackCircleSharp className="w-7 h-7" />}
        onClose={onClose}
        onKeyDown={handleKeyDown}
        header={headerContent}
        detailsLayout="default"
        detailsLayouts={["default"]}
        gridItems={
          <div className="flex flex-col h-full w-full border border-gray-300 rounded bg-white mt-1">
            <div className="flex-1 overflow-hidden">
              <ProformaInvoiceYarnItems
                yarnItems={yarnItems}
                enrichedItems={enrichedData}
                setYarnItems={setYarnItems}
                readOnly={effectiveReadOnly}
                taxTemplateId={taxTemplateId}
                id={id}
                isCurrencySymbol={isCurrencySymbol}
                currencyCode={currencyCode}
                termsRef={termsRef}
                isCustomerExport={isCustomerExport}
                isSupplierOutside={isSupplierOutside}
              />
            </div>
          </div>
        }
        footer={footerContent}
        versionDropdown={id ? versionDropdown : null}
      />
    </>
  );
};

export default ProformaInvoiceYarnForm;
