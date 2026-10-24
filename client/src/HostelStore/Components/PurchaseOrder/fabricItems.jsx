import React, { useState, useEffect, useRef } from "react";
import FxSelect, { FxSelectWithAdd } from "../../../Inputs";

import {
  findFromList,
  getCommonParams,
  formatCurrencyAmount,
} from "../../../Utils/helper";
import { VIEW } from "../../../icons";
import Modal from "../../../UiComponents/Modal";
import TaxDetailsFullTemplate from "../TaxDetailsCompleteTemplate";
import Swal from "sweetalert2";
import { Gsm, UomMaster, ColorMaster } from "..";
import {
  DesignMaster,
  DiaMaster,
  FabricMaster,
  GaugeMaster,
  LoopLengthMaster,
} from "../../../Basic/components";
import { TransactionGrid } from "../../../Basic/components/Reuseable";
import { Plus } from "lucide-react";

const FabricItems = ({
  poType,
  selectedOrderGridType,
  poFabricItems,
  setPoFabricItems,
  enrichedItems,
  readOnly,
  quoteVersion,
  isNewVersion,
  taxTemplateId,
  id,
  isCurrencySymbol,
  currencyCode,
  isCustomerExport,
  termsRef,
  isSupplierOutside,
  uomList,
  hsnList,
  colorList,
  gsmList,
  designList,
  kDiaList,
  fDiaList,
  loopLengthList,
  gaugeList,
  fabricList,
}) => {
  const isOrderFabricLocked =
    poType === "ORDER" &&
    (!selectedOrderGridType || selectedOrderGridType === "FABRIC");
  const styleItemRefs = useRef({});
  const { companyId } = getCommonParams();

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
    quoteVersion: "",
  };

  const [contextMenu, setContextMenu] = useState(null);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);
  const [currentWeightSelectedIndex, setCurrentWeightSelectedIndex] =
    useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const gridWrapperRef = useRef(null);

  const effectiveQuoteVersion =
    quoteVersion ||
    Math.max(
      ...poFabricItems
        .map((i) => parseInt(i.quoteVersion))
        .filter((v) => !isNaN(v) && v > 0),
      0,
    ) ||
    "";

  const isVisibleRow = (row) => {
    if (!id) return true;
    if (isNewVersion) return row.quoteVersion === "New";
    if (!effectiveQuoteVersion) return row.quoteVersion !== "New";
    return parseInt(row.quoteVersion) === parseInt(effectiveQuoteVersion);
  };

  const visibleRows = poFabricItems
    .map((row, originalIndex) => ({ row, originalIndex }))
    .filter(({ row }) => isVisibleRow(row));

  const addRow = () => {
    if (isOrderFabricLocked) return;
    setPoFabricItems([
      ...poFabricItems,
      {
        ...EMPTY_ROW,
        quoteVersion: id
          ? isNewVersion
            ? "New"
            : effectiveQuoteVersion || 1
          : effectiveQuoteVersion || 1,
        rowId: Math.random().toString(36).substring(2, 9),
      },
    ]);
  };

  const deleteRow = (targetIndex) => {
    const originalIndex =
      typeof targetIndex === "number" && visibleRows[targetIndex]
        ? visibleRows[targetIndex].originalIndex
        : targetIndex;

    if (visibleRows.length <= 10) {
      const newItems = [...poFabricItems];
      if (newItems[originalIndex]) {
        newItems[originalIndex] = {
          ...EMPTY_ROW,
          quoteVersion:
            newItems[originalIndex]?.quoteVersion ||
            (isNewVersion ? "New" : effectiveQuoteVersion || 1),
          rowId: Math.random().toString(36).substring(2, 9),
        };
        setPoFabricItems(newItems);
      }
    } else {
      setPoFabricItems(poFabricItems.filter((_, i) => i !== originalIndex));
    }
  };

  useEffect(() => {
    if (!id) return;
    setPoFabricItems((prev) => {
      const localVisibleRows = prev.filter((row) => isVisibleRow(row));
      const missing = 10 - localVisibleRows.length;
      if (missing <= 0) return prev;
      return [
        ...prev,
        ...Array.from({ length: missing }, () => ({
          ...EMPTY_ROW,
          quoteVersion: isNewVersion ? "New" : effectiveQuoteVersion || 1,
          rowId: Math.random().toString(36).substring(2, 9),
        })),
      ];
    });
  }, [id, isNewVersion, effectiveQuoteVersion, setPoFabricItems]);

  useEffect(() => {
    if (!isNewVersion) return;

    setPoFabricItems((prev) => [
      ...prev.filter((item) => item.quoteVersion !== "New"),
      ...prev
        .filter(
          (item) => parseInt(item.quoteVersion) === parseInt(quoteVersion),
        )
        .map((item) => ({ ...item, quoteVersion: "New" })),
    ]);
  }, [isNewVersion, quoteVersion, setPoFabricItems]);

  const handleInputChange = async (value, index, field) => {
    const newItems = [...poFabricItems];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    if (field === "fabricId") {
      const selectedFabric = fabricList?.data?.find((f) => f.id === value);
      if (selectedFabric && selectedFabric.hsnId) {
        newItems[index].hsnId = selectedFabric.hsnId;
        const hsnObj = hsnList?.data?.find(
          (h) => h.id === selectedFabric.hsnId,
        );
        if (hsnObj) {
          newItems[index].taxPercent = hsnObj.tax;
        }
      }
    }

    if (field === "hsnId") {
      const hsnObj = hsnList?.data?.find((h) => h.id === value);
      if (hsnObj) {
        newItems[index].taxPercent = hsnObj.tax;
      }
    }

    if (field === "numberOfRolls" || field === "weightPerRoll") {
      const num = parseFloat(newItems[index].numberOfRolls) || 0;
      const weight = parseFloat(newItems[index].weightPerRoll) || 0;
      const totalKgs = num && weight ? (num * weight).toFixed(3) : "";
      newItems[index].totalKgs = totalKgs;
      if (totalKgs) {
        newItems[index].qty = totalKgs;
      }

      const totalKgsNum = parseFloat(newItems[index].totalKgs) || 0;
      const pricePerKg =
        parseFloat(newItems[index].pricePerKg) ||
        parseFloat(newItems[index].price) ||
        0;
      if (totalKgsNum && pricePerKg) {
        newItems[index].totalPrice = (totalKgsNum * pricePerKg).toFixed(2);
        newItems[index].amount = newItems[index].totalPrice;
      } else {
        newItems[index].totalPrice = "";
        const qtyNum = parseFloat(newItems[index].qty) || 0;
        const priceNum = parseFloat(newItems[index].price) || 0;
        newItems[index].amount =
          qtyNum && priceNum ? (qtyNum * priceNum).toFixed(2) : "";
      }
    }

    if (field === "pricePerKg") {
      newItems[index].price = value;

      const totalKgs =
        parseFloat(newItems[index].totalKgs) ||
        parseFloat(newItems[index].qty) ||
        0;
      const pricePerKg = parseFloat(value) || 0;
      if (totalKgs && pricePerKg) {
        newItems[index].totalPrice = (totalKgs * pricePerKg).toFixed(2);
        newItems[index].amount = newItems[index].totalPrice;
      } else {
        newItems[index].totalPrice = "";
        newItems[index].amount = "";
      }
    }

    if (field === "qty" || field === "price") {
      const qtyVal = newItems[index].qty;
      const priceVal = newItems[index].price;
      if (qtyVal === "" || priceVal === "") {
        newItems[index].amount = "";
      } else {
        const qty = parseFloat(qtyVal) || 0;
        const price = parseFloat(priceVal) || 0;
        newItems[index].amount = (qty * price).toFixed(2);
      }
    }

    setPoFabricItems(newItems);
  };

  const handleRightClick = (event, rowIndex) => {
    if (isOrderFabricLocked) return;
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      rowId: rowIndex,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleFocusNextRow = (index) => {
    const nextIndex = index + 1;
    if (!poFabricItems[nextIndex]) {
      if (isOrderFabricLocked) return;
      setPoFabricItems((prev) => [
        ...prev,
        { ...EMPTY_ROW, rowId: Math.random().toString(36).substring(2, 9) },
      ]);
      setTimeout(() => {
        styleItemRefs.current[nextIndex]?.focus?.();
      }, 300);
    } else {
      setTimeout(() => {
        styleItemRefs.current[nextIndex]?.focus?.();
      }, 50);
    }
  };

  const deleteSelectedRows = () => {
    setPoFabricItems((rows) => rows.filter((r) => !r.selected));
    setContextMenu(null);
  };

  const handleDeleteAllRows = () => {
    const targetVersion = isNewVersion ? "New" : effectiveQuoteVersion || 1;
    const nonVisibleItems = id
      ? poFabricItems.filter((r) => !isVisibleRow(r))
      : [];
    const newItems = Array.from({ length: 10 }, () => ({
      ...EMPTY_ROW,
      quoteVersion: targetVersion,
      rowId: Math.random().toString(36).substring(2, 9),
    }));
    setPoFabricItems([...nonVisibleItems, ...newItems]);
  };

  const enrichedFabricItems = poFabricItems.map((row) => {
    const matched = enrichedItems?.items?.find((item) =>
      row.rowId
        ? item.rowId === row.rowId
        : item.fabricId && item.fabricId === row.fabricId,
    );
    return matched || row;
  });

  return (
    <>
      <Modal
        isOpen={Number.isInteger(currentWeightSelectedIndex)}
        onClose={() => {
          setCurrentWeightSelectedIndex("");
        }}
      >
        <div className="p-4 bg-white rounded-lg min-w-[40vw]">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            Weight Details
          </h2>
          {Number.isInteger(currentWeightSelectedIndex) &&
            poFabricItems[currentWeightSelectedIndex] && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Number of Rolls
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={
                        poFabricItems[currentWeightSelectedIndex]
                          .numberOfRolls || ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          currentWeightSelectedIndex,
                          "numberOfRolls",
                        )
                      }
                      readOnly={readOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Weight per Roll
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={
                        poFabricItems[currentWeightSelectedIndex]
                          .weightPerRoll || ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          currentWeightSelectedIndex,
                          "weightPerRoll",
                        )
                      }
                      onBlur={() => {
                        const val =
                          poFabricItems[currentWeightSelectedIndex]
                            .weightPerRoll;
                        handleInputChange(
                          val ? parseFloat(val).toFixed(3) : "",
                          currentWeightSelectedIndex,
                          "weightPerRoll",
                        );
                      }}
                      readOnly={readOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Kgs
                    </label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 border bg-gray-100 p-2 text-sm"
                      value={
                        poFabricItems[currentWeightSelectedIndex]?.totalKgs ||
                        ""
                      }
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price per Kg
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={
                        poFabricItems[currentWeightSelectedIndex].pricePerKg ||
                        ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          currentWeightSelectedIndex,
                          "pricePerKg",
                        )
                      }
                      onBlur={() => {
                        const val =
                          poFabricItems[currentWeightSelectedIndex].pricePerKg;
                        handleInputChange(
                          val ? parseFloat(val).toFixed(2) : "",
                          currentWeightSelectedIndex,
                          "pricePerKg",
                        );
                      }}
                      readOnly={readOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Price
                    </label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 border bg-gray-100 p-2 text-sm"
                      value={
                        poFabricItems[currentWeightSelectedIndex]?.totalPrice ||
                        ""
                      }
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentWeightSelectedIndex("")}
                    className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
        </div>
      </Modal>

      <Modal
        isOpen={Number.isInteger(currentSelectedIndex)}
        onClose={() => {
          setCurrentSelectedIndex("");
          window.setTimeout(() => {
            handleFocusNextRow?.(currentSelectedIndex);
          }, 0);
        }}
        widthClass="!p-0 !rounded-xl overflow-hidden shadow-2xl max-w-md w-full"
      >
        <TaxDetailsFullTemplate
          readOnly={readOnly}
          taxTypeId={taxTemplateId}
          currentIndex={currentSelectedIndex}
          serialNumber={
            visibleRows.findIndex(
              (item) => item.originalIndex === currentSelectedIndex,
            ) !== -1
              ? visibleRows.findIndex(
                  (item) => item.originalIndex === currentSelectedIndex,
                ) + 1
              : currentSelectedIndex + 1
          }
          setCurrentSelectedIndex={setCurrentSelectedIndex}
          poItems={enrichedFabricItems}
          handleInputChange={handleInputChange}
          id={id}
          isNewVersion={false}
          onCloseFocus={handleFocusNextRow}
          isSupplierOutside={isSupplierOutside}
          currencyCode={currencyCode || isCurrencySymbol}
        />
      </Modal>

      <div
        ref={gridWrapperRef}
        className="w-full h-full min-h-0 min-w-0 flex flex-col overflow-hidden"
        onScroll={(e) => {
          if (
            document.activeElement &&
            (document.activeElement.closest(".grid-editable-cell") ||
              document.activeElement.closest("td"))
          ) {
            document.activeElement.blur();
          }
        }}
        onContextMenu={(e) => {
          const td = e.target.closest("td[data-grid-row]");
          if (td && !readOnly && !isOrderFabricLocked) {
            e.preventDefault();
            const rowIndex = parseInt(td.getAttribute("data-grid-row"), 10);
            handleRightClick(e, rowIndex);
          }
        }}
        onMouseDownCapture={(e) => {
          if (e.button === 2) {
            e.stopPropagation();
          }
        }}
      >
        <TransactionGrid
          title=""
          tableClassName="min-w-[2300px] w-full border-collapse table-fixed"
          containerClassName="h-full min-h-0 min-w-0 flex-1"
          columns={[
            {
              key: "serial",
              label: "S.No",
              className:
                "w-10 px-1 py-2 text-center font-medium text-[11px] sticky left-0 bg-slate-50 z-[20]",
            },
            {
              key: "desc",
              label: (
                <>
                  Description of Goods<span className="text-red-500">*</span>
                </>
              ),
              className:
                "w-80 px-2 py-2 text-center font-medium text-[11px] sticky left-[40px] bg-slate-50 z-[20]",
            },
            {
              key: "hsn",
              label: "HSN",
              className:
                "w-28 px-1 py-2 text-center font-medium text-[11px] sticky left-[328px] bg-slate-50 z-[20]",
            },

            {
              key: "color",
              label: "Color",
              className: "w-60 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "design",
              label: "Design",
              className: "w-60 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "gauge",
              label: "Gauge",
              className: "w-40 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "loop",
              label: "Loop Length",
              className: "w-40 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "gsm",
              label: "GSM",
              className: "w-28 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "kDia",
              label: "K-Dia",
              className: "w-24 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "fDia",
              label: "F-Dia",
              className: "w-24 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "uom",
              label: "UOM",
              className: "w-24 px-1 py-2 text-center font-medium text-[11px]",
            },

            {
              key: "width",
              label: "Width",
              className: "w-24 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "weight",
              label: "Weight",
              className: "w-24 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "qty",
              label: (
                <>
                  Qty<span className="text-red-500">*</span>
                </>
              ),
              className: "w-28 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "price",
              label: (
                <>
                  Price {isCurrencySymbol && `(${isCurrencySymbol})`}
                  <span className="text-red-500">*</span>
                </>
              ),
              className: "w-28 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "gross",
              label: "Gross",
              className: "w-32 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "tax",
              label: "Tax",
              className: "w-12 px-1 py-2 text-center font-medium text-[11px]",
            },

            {
              key: "actions",
              label: "Actions",
              className: "w-16 px-2 py-2 text-center font-medium text-[11px]",
            },
          ]}
          rows={visibleRows}
          footer={
            <tr className="bg-slate-50 h-7 font-bold text-slate-800 text-[12px]">
              <td
                className="text-right px-2 border border-gray-300 bg-slate-50"
                colSpan={13}
              >
                Total
              </td>
              <td className="text-right px-1 border border-gray-300">
                {visibleRows
                  ?.reduce((sum, i) => sum + (parseFloat(i.row?.qty) || 0), 0)
                  .toFixed(3)}
              </td>
              <td className="text-right px-1 border border-gray-300">
                {isCurrencySymbol ? ` ${isCurrencySymbol}` : ""}
                {visibleRows
                  ?.reduce((sum, i) => sum + (parseFloat(i.row?.price) || 0), 0)
                  .toFixed(2)}
              </td>
              <td className="text-right px-1 border border-gray-300 text-black">
                {isCurrencySymbol ? ` ${isCurrencySymbol}` : ""}
                {formatCurrencyAmount(
                  visibleRows?.reduce(
                    (sum, i) => sum + (parseFloat(i.row?.amount) || 0),
                    0,
                  ) || 0,
                  currencyCode || isCurrencySymbol,
                )}
              </td>

              <td className="border border-gray-300 bg-slate-50" colSpan={2} />
            </tr>
          }
          getRowKey={(item) => item.row.rowId || item.originalIndex}
          getRowClassName={() => `h-6 bg-white hover:bg-gray-50`}
          renderRow={(item, index) => {
            const rowItem = item.row;
            const originalIndex = item.originalIndex;
            const isFilledRow = Boolean(rowItem.fabricId);
            return (
              <>
                <td
                  data-grid-row={index}
                  data-grid-col={0}
                  className="text-[11px] text-center border border-gray-300 shadow-[inset_-1px_0_0_#d1d5db] sticky left-0 bg-inherit z-[1]"
                >
                  {index + 1}
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={1}
                  data-grid-editable="true"
                  className="grid-editable-cell border border-gray-300 shadow-[inset_-1px_0_0_#d1d5db] sticky left-[40px] bg-inherit z-[1]"
                >
                  <FxSelectWithAdd
                    value={rowItem.fabricId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "fabricId")
                    }
                    options={(fabricList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly || isOrderFabricLocked}
                    disabled={readOnly || isOrderFabricLocked}
                    placeholder=""
                    addNew={!isOrderFabricLocked}
                    childComponent={FabricMaster}
                    addNewModalWidth="w-[50%] h-[57%]"
                    ref={(el) => (styleItemRefs.current[originalIndex] = el)}
                    nextRef={termsRef}
                  />
                </td>
                <td
                  data-grid-row={index}
                  className="grid-editable-cell border border-gray-300 shadow-[inset_-1px_0_0_#d1d5db] text-[11px] px-2 sticky left-[328px] bg-inherit z-[1]"
                >
                  <FxSelect
                    value={rowItem.hsnId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "hsnId")
                    }
                    options={(hsnList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={true}
                    disabled={true}
                    placeholder=""
                  />
                </td>

                <td
                  data-grid-row={index}
                  className="grid-editable-cell border border-gray-300 text-[11px] px-2"
                >
                  <FxSelectWithAdd
                    value={rowItem.colorId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "colorId")
                    }
                    options={(colorList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly || isOrderFabricLocked}
                    disabled={readOnly || isOrderFabricLocked}
                    addNew={!isOrderFabricLocked}
                    placeholder=""
                    childComponent={ColorMaster}
                    addNewModalWidth="w-[50%] h-[57%]"
                  />
                </td>
                <td
                  data-grid-row={index}
                  className="grid-editable-cell border border-gray-300 text-[11px] px-2"
                >
                  <FxSelectWithAdd
                    value={rowItem.designId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "designId")
                    }
                    options={(designList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly || isOrderFabricLocked}
                    disabled={readOnly || isOrderFabricLocked}
                    addNew={!isOrderFabricLocked}
                    placeholder=""
                    childComponent={DesignMaster}
                    addNewModalWidth="w-[50%] h-[57%]"
                  />
                </td>
                <td
                  data-grid-row={index}
                  className="grid-editable-cell border border-gray-300 text-[11px] px-2"
                >
                  <FxSelectWithAdd
                    value={rowItem?.gaugeId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "gaugeId")
                    }
                    options={(gaugeList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly || isOrderFabricLocked}
                    disabled={readOnly || isOrderFabricLocked}
                    addNew={!isOrderFabricLocked}
                    placeholder=""
                    childComponent={GaugeMaster}
                    addNewModalWidth="w-[50%] h-[57%]"
                  />
                </td>
                <td
                  data-grid-row={index}
                  className="grid-editable-cell border border-gray-300 text-[11px] px-2"
                >
                  <FxSelectWithAdd
                    value={rowItem.loopLengthId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "loopLengthId")
                    }
                    options={(loopLengthList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly || isOrderFabricLocked}
                    disabled={readOnly || isOrderFabricLocked}
                    addNew={!isOrderFabricLocked}
                    placeholder=""
                    childComponent={LoopLengthMaster}
                    addNewModalWidth="w-[50%] h-[57%]"
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={3}
                  data-grid-editable="true"
                  className="grid-editable-cell border border-gray-300 text-[11px] items-center"
                >
                  <FxSelectWithAdd
                    value={rowItem.gsmId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "gsmId")
                    }
                    options={(gsmList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly || isOrderFabricLocked}
                    disabled={readOnly || isOrderFabricLocked}
                    addNew={!isOrderFabricLocked}
                    placeholder=""
                    childComponent={Gsm}
                    addNewModalWidth="w-[50%] h-[57%]"
                  />
                </td>

                <td
                  data-grid-row={index}
                  data-grid-col={2}
                  data-grid-editable="true"
                  className="grid-editable-cell border border-gray-300 text-[11px] items-center"
                >
                  <FxSelectWithAdd
                    value={rowItem.kDiaId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "kDiaId")
                    }
                    options={(kDiaList || [])
                      ?.filter((i) => (id ? true : i.active))
                      ?.map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly || isOrderFabricLocked}
                    disabled={readOnly || isOrderFabricLocked}
                    addNew={!isOrderFabricLocked}
                    placeholder=""
                    childComponent={DiaMaster}
                    childComponentProps={{ defaultKDia: true }}
                    addNewModalWidth="w-[50%] h-[57%]"
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={2}
                  data-grid-editable="true"
                  className="grid-editable-cell border border-gray-300 text-[11px] items-center"
                >
                  <FxSelectWithAdd
                    value={rowItem.fDiaId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "fDiaId")
                    }
                    options={(fDiaList || [])
                      ?.filter((i) => (id ? true : i.active))
                      ?.map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly || isOrderFabricLocked}
                    disabled={readOnly || isOrderFabricLocked}
                    addNew={!isOrderFabricLocked}
                    placeholder=""
                    childComponent={DiaMaster}
                    childComponentProps={{ defaultFDia: true }}
                    addNewModalWidth="w-[50%] h-[57%]"
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={2}
                  data-grid-editable="true"
                  className="grid-editable-cell border border-gray-300 text-[11px] items-center"
                >
                  <FxSelectWithAdd
                    value={rowItem.uomId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "uomId")
                    }
                    options={(uomList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly || isOrderFabricLocked}
                    disabled={readOnly || isOrderFabricLocked}
                    addNew={!isOrderFabricLocked}
                    placeholder=""
                    childComponent={UomMaster}
                    addNewModalWidth="w-[50%] h-[57%]"
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={4}
                  data-grid-editable="true"
                  className="grid-editable-cell text-[11px] border border-gray-300 text-right"
                >
                  <input
                    type="text"
                    className="text-left px-3 w-full table-data-input bg-transparent"
                    value={rowItem.width}
                    onChange={(e) =>
                      handleInputChange(e.target.value, originalIndex, "width")
                    }
                    readOnly={readOnly || isOrderFabricLocked}
                    disabled={readOnly || isOrderFabricLocked}
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={5}
                  data-grid-editable="true"
                  className="grid-editable-cell border border-gray-300 text-center text-[11px]"
                >
                  <button
                    disabled={!rowItem.fabricId}
                    className="text-indigo-600 w-full hover:text-indigo-800 disabled:text-gray-300 table-data-input"
                    onClick={() => {
                      setCurrentWeightSelectedIndex(originalIndex);
                    }}
                  >
                    {VIEW}
                  </button>
                </td>

                <td
                  data-grid-row={index}
                  data-grid-col={6}
                  data-grid-editable="true"
                  className="grid-editable-cell text-[11px] border border-gray-300 text-right"
                >
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="text-right px-3 w-full table-data-input bg-transparent"
                    value={rowItem.qty}
                    onChange={(e) =>
                      handleInputChange(e.target.value, originalIndex, "qty")
                    }
                    readOnly={readOnly || (isOrderFabricLocked && !isFilledRow)}
                    disabled={readOnly || (isOrderFabricLocked && !isFilledRow)}
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={7}
                  data-grid-editable="true"
                  className="grid-editable-cell text-[11px] border border-gray-300 text-right"
                >
                  <div className="relative w-full">
                    <input
                      type={
                        focusedField === `price-${originalIndex}`
                          ? "number"
                          : "text"
                      }
                      min="0"
                      step="0.01"
                      className="text-right px-3 w-full table-data-input bg-transparent"
                      value={
                        focusedField === `price-${originalIndex}`
                          ? (rowItem.price ?? "")
                          : rowItem.price
                            ? formatCurrencyAmount(
                                rowItem.price,
                                currencyCode || isCurrencySymbol,
                              )
                            : ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          originalIndex,
                          "price",
                        )
                      }
                      readOnly={
                        readOnly || (isOrderFabricLocked && !isFilledRow)
                      }
                      disabled={
                        readOnly || (isOrderFabricLocked && !isFilledRow)
                      }
                      onFocus={(e) => {
                        if (isOrderFabricLocked && !isFilledRow) return;
                        e.target.select();
                        setFocusedField(`price-${originalIndex}`);
                      }}
                      onBlur={(e) => {
                        const val = e.target.value ? e.target.value.trim() : "";
                        if (val === "") {
                          handleInputChange("", originalIndex, "price");
                        } else {
                          const num = parseFloat(val);
                          handleInputChange(
                            !isNaN(num) ? Number(num).toFixed(2) : "",
                            originalIndex,
                            "price",
                          );
                        }
                        setFocusedField(null);
                      }}
                      onKeyDown={(e) => {
                        if (
                          !isOrderFabricLocked &&
                          e.key === "Enter" &&
                          index === poFabricItems.length - 1
                        ) {
                          addRow();
                        }
                      }}
                    />
                  </div>
                </td>
                <td
                  data-grid-row={index}
                  className="text-[11px] text-right px-1 border border-gray-300 bg-gray-50 bg-transparent gap-x-2"
                >
                  <span className="pr-1">
                    {isCurrencySymbol && rowItem.fabricId
                      ? ` ${isCurrencySymbol}`
                      : ""}
                  </span>
                  {rowItem.fabricId
                    ? formatCurrencyAmount(
                        rowItem.amount,
                        currencyCode || isCurrencySymbol,
                      )
                    : ""}
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={6}
                  data-grid-editable="true"
                  className="grid-editable-cell border border-gray-300 text-center text-[11px]"
                >
                  <button
                    disabled={!rowItem.fabricId || isCustomerExport}
                    className="text-indigo-600 w-full hover:text-indigo-800 disabled:text-gray-300 table-data-input"
                    onClick={() => {
                      if (!taxTemplateId) {
                        return Swal.fire({
                          title: "Information",
                          text: "Please select Tax Type",
                          icon: "info",
                          confirmButtonColor: "#3085d6",
                        });
                      }
                      setCurrentSelectedIndex(originalIndex);
                    }}
                  >
                    {VIEW}
                  </button>
                </td>

                <td
                  data-grid-row={index}
                  className="w-12 border border-gray-300 align-top pt-1 bg-inherit"
                >
                  {!readOnly && !isOrderFabricLocked && (
                    <div className="flex items-center justify-center">
                      <button
                        onClick={addRow}
                        className="flex items-center justify-center p-0.5 bg-blue-50 hover:bg-blue-100 rounded"
                        title="Add row"
                        tabIndex={-1}
                      >
                        <Plus size={13} className="text-blue-700" />
                      </button>
                    </div>
                  )}
                </td>
              </>
            );
          }}
        />
      </div>

      {!isOrderFabricLocked && contextMenu && (
        <div
          style={{
            position: "fixed",
            top: `${contextMenu.mouseY - 20}px`,
            left: `${contextMenu.mouseX + 20}px`,
            boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
            padding: "8px",
            borderRadius: "4px",
            zIndex: 1000,
          }}
          className="bg-gray-100"
          onMouseLeave={handleCloseContextMenu}
        >
          <div className="flex flex-col gap-1">
            <button
              className=" text-black text-[12px] text-left rounded px-1"
              onClick={() => {
                deleteRow(contextMenu.rowId);
                deleteSelectedRows();
                handleCloseContextMenu();
              }}
            >
              Delete
            </button>
            <button
              className=" text-black text-[12px] text-left rounded px-1"
              onClick={() => {
                handleDeleteAllRows();
                handleCloseContextMenu();
              }}
            >
              Delete All
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FabricItems;
