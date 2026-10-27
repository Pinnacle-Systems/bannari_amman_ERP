import React, { useState, useEffect, useRef } from "react";
import FxSelect, { FxSelectWithAdd } from "../../../Inputs/index.js";

import {
  findFromList,
  getCommonParams,
  formatCurrencyAmount,
} from "../../../Utils/helper.js";
import { VIEW } from "../../../icons/index.js";
import Modal from "../../../UiComponents/Modal/index.js";
import TaxDetailsFullTemplate from "../TaxDetailsCompleteTemplate/index.js";
import Swal from "sweetalert2";
import { UomMaster, ColorMaster } from "../index.js";
import { YarnMaster } from "../../../Basic/components/index.js";
import { TransactionGrid } from "../../../Basic/components/Reuseable/index.js";
import { Plus } from "lucide-react";

const YarnItems = ({
  poType,
  selectedOrderGridType,
  poYarnItems,
  setPoYarnItems,
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
  yarnList,
}) => {
  const isOrderYarnLocked =
    poType === "ORDER" && selectedOrderGridType === "YARN";
  const styleItemRefs = useRef({});
  const { companyId } = getCommonParams();

  const EMPTY_ROW = {
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

  const [contextMenu, setContextMenu] = useState(null);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);

  const [focusedField, setFocusedField] = useState(null);
  const gridWrapperRef = useRef(null);

  const effectiveQuoteVersion =
    quoteVersion ||
    Math.max(
      ...poYarnItems
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

  const visibleRows = poYarnItems
    .map((row, originalIndex) => ({ row, originalIndex }))
    .filter(({ row }) => isVisibleRow(row));

  const addRow = () => {
    if (isOrderYarnLocked) return;
    setPoYarnItems([
      ...poYarnItems,
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
      const newItems = [...poYarnItems];
      if (newItems[originalIndex]) {
        newItems[originalIndex] = {
          ...EMPTY_ROW,
          quoteVersion:
            newItems[originalIndex]?.quoteVersion ||
            (isNewVersion ? "New" : effectiveQuoteVersion || 1),
          rowId: Math.random().toString(36).substring(2, 9),
        };
        setPoYarnItems(newItems);
      }
    } else {
      setPoYarnItems(poYarnItems.filter((_, i) => i !== originalIndex));
    }
  };

  useEffect(() => {
    if (!id) return;
    setPoYarnItems((prev) => {
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
  }, [id, isNewVersion, effectiveQuoteVersion, setPoYarnItems]);

  useEffect(() => {
    if (!isNewVersion) return;

    setPoYarnItems((prev) => [
      ...prev.filter((item) => item.quoteVersion !== "New"),
      ...prev
        .filter(
          (item) => parseInt(item.quoteVersion) === parseInt(quoteVersion),
        )
        .map((item) => ({ ...item, quoteVersion: "New" })),
    ]);
  }, [isNewVersion, quoteVersion, setPoYarnItems]);

  const handleInputChange = async (value, index, field) => {
    const newItems = [...poYarnItems];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    if (field === "yarnId") {
      const selectedFabric = yarnList?.data?.find((f) => f.id === value);
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
    if (field === "noOfbags" || field === "weightPerBag") {
      const noOfbagsVal = newItems[index].noOfbags;
      const weightPerBagVal = newItems[index].weightPerBag;
      if (noOfbagsVal !== "" || weightPerBagVal !== "") {
        const noOfbags = parseFloat(noOfbagsVal) || 0;
        const weightPerBag = parseFloat(weightPerBagVal) || 0;
        const qty = noOfbags * weightPerBag;
        newItems[index].qty = qty ? qty.toFixed(3) : "";
        const price = parseFloat(newItems[index].price) || 0;
        newItems[index].amount = price && qty ? (qty * price).toFixed(2) : "";
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
    setPoYarnItems(newItems);
  };

  const handleRightClick = (event, rowIndex) => {
    if (isOrderYarnLocked) return;
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
    if (!poYarnItems[nextIndex]) {
      if (!isOrderYarnLocked) {
        setPoYarnItems((prev) => [
          ...prev,
          { ...EMPTY_ROW, rowId: Math.random().toString(36).substring(2, 9) },
        ]);
        setTimeout(() => {
          styleItemRefs.current[nextIndex]?.focus?.();
        }, 300);
      }
    } else {
      setTimeout(() => {
        styleItemRefs.current[nextIndex]?.focus?.();
      }, 50);
    }
  };

  const deleteSelectedRows = () => {
    setPoYarnItems((rows) => rows.filter((r) => !r.selected));
    setContextMenu(null);
  };

  const handleDeleteAllRows = () => {
    const targetVersion = isNewVersion ? "New" : effectiveQuoteVersion || 1;
    const nonVisibleItems = id
      ? poYarnItems.filter((r) => !isVisibleRow(r))
      : [];
    const newItems = Array.from({ length: 10 }, () => ({
      ...EMPTY_ROW,
      quoteVersion: targetVersion,
      rowId: Math.random().toString(36).substring(2, 9),
    }));
    setPoYarnItems([...nonVisibleItems, ...newItems]);
  };

  const enrichedYarnItems = poYarnItems.map((row) => {
    const matched = enrichedItems?.items?.find((item) =>
      row.rowId
        ? item.rowId === row.rowId
        : item.yarnId && item.yarnId === row.yarnId,
    );
    return matched || row;
  });

  return (
    <>
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
          poItems={enrichedYarnItems}
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
          if (td && !readOnly && !isOrderYarnLocked) {
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
          tableClassName="min-w-[1450px] w-full border-collapse table-fixed"
          containerClassName="h-full min-h-0 min-w-0 flex-1"
          columns={[
            {
              key: "serial",
              label: "S.No",
              className: "w-10 px-2 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "desc",
              label: (
                <>
                  Description of Goods<span className="text-red-500">*</span>
                </>
              ),
              className: "w-72 px-2 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "hsn",
              label: "HSN",
              className: "w-28 px-2 py-2 text-center font-medium text-[11px]",
            },

            // {
            //   key: "content",
            //   label: "Content",
            //   className:
            //     "w-36 px-1 py-2 text-center font-medium text-[11px]",
            // },
            // {
            //   key: "counts",
            //   label: "Counts",
            //   className:
            //     "w-28 px-1 py-2 text-center font-medium text-[11px]",
            // },
            {
              key: "color",
              label: "Color",
              className:
                "w-60 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "uom",
              label: "UOM",
              className:
                "w-24 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "noOfbags",
              label: "No of Bags",
              className:
                "w-24 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "weightPerBag",
              label: "Weight per Bag",
              className:
                "w-24 px-1 py-2 text-center font-medium text-[11px]",
            },

            {
              key: "qty",
              label: (
                <>
                  Total Weight<span className="text-red-500">*</span>
                </>
              ),
              className:
                "w-28 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "price",
              label: (
                <>
                  Rate Per KG{isCurrencySymbol && `(${isCurrencySymbol})`}
                  <span className="text-red-500">*</span>
                </>
              ),
              className:
                "w-28 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "gross",
              label: "Gross",
              className:
                "w-32 px-1 py-2 text-center font-medium text-[11px]",
            },
            {
              key: "tax",
              label: "Tax",
              className:
                "w-16 px-1 py-2 text-center font-medium text-[11px]",
            },

            {
              key: "actions",
              label: "Actions",
              className:
                "w-16 px-2 py-2 text-center font-medium text-[11px]",
            },
          ]}
          rows={visibleRows}
          footer={
            <tr className="bg-slate-50 h-7 font-bold text-slate-800 text-[12px]">
              <td
                className="text-right px-2 border border-gray-300 bg-slate-50"
                colSpan={7}
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
          getRowClassName={() =>
            `bg-white hover:bg-gray-50 border border-blue-gray-200 cursor-pointer h-6`
          }
          renderRow={(item, index) => {
            const rowItem = item.row;
            const originalIndex = item.originalIndex;
            const isFilledRow = Boolean(rowItem.yarnId);
            return (
              <>
                <td
                  data-grid-row={index}
                  data-grid-col={0}
                  className="w-12 border border-gray-300 text-[11px] text-center"
                >
                  {index + 1}
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={1}
                  data-grid-editable="true"
                  className="grid-editable-cell border border-gray-300"
                >
                  <FxSelectWithAdd
                    value={rowItem.yarnId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "yarnId")
                    }
                    options={(yarnList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly || isOrderYarnLocked}
                    disabled={readOnly || isOrderYarnLocked}
                    placeholder=""
                    addNew={!isOrderYarnLocked}
                    childComponent={YarnMaster}
                    addNewModalWidth="w-[65vw] h-[60vh]"
                    ref={(el) => (styleItemRefs.current[originalIndex] = el)}
                    nextRef={termsRef}
                  />
                </td>
                <td
                  data-grid-row={index}
                  className="grid-editable-cell border border-gray-300 text-[11px] px-2"
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

                {/* <td
                  data-grid-row={index}
                  data-grid-col={2}
                  data-grid-editable="true"
                  className="grid-editable-cell border border-gray-300 text-[11px] items-center"
                >
                  <FxSelectWithAdd
                    value={rowItem.contentId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "contentId")
                    }
                    options={(contentList?.data || [])
                      ?.filter((i) => (id ? true : i.active))
                      ?.map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly}
                    addNew={true}
                    placeholder=""
                    childComponent={ContentMaster}
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
                    value={rowItem.countsId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "countsId")
                    }
                    options={(countsList?.data || [])
                      ?.filter((i) => (id ? true : i.active))
                      ?.map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly}
                    addNew={true}
                    placeholder=""
                    childComponent={CountsMaster}
                    addNewModalWidth="w-[50%] h-[57%]"
                  />
                </td> */}
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
                    readOnly={readOnly || isOrderYarnLocked}
                    disabled={readOnly || isOrderYarnLocked}
                    addNew={!isOrderYarnLocked}
                    placeholder=""
                    childComponent={ColorMaster}
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
                    readOnly={readOnly || isOrderYarnLocked}
                    disabled={readOnly || isOrderYarnLocked}
                    addNew={!isOrderYarnLocked}
                    placeholder=""
                    childComponent={UomMaster}
                    addNewModalWidth="w-[50%] h-[57%]"
                  />
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
                    value={rowItem.noOfbags}
                    onChange={(e) =>
                      handleInputChange(
                        e.target.value,
                        originalIndex,
                        "noOfbags",
                      )
                    }
                    readOnly={readOnly || (isOrderYarnLocked && !isFilledRow)}
                    disabled={readOnly || (isOrderYarnLocked && !isFilledRow)}
                  />
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
                    value={rowItem.weightPerBag}
                    onChange={(e) =>
                      handleInputChange(
                        e.target.value,
                        originalIndex,
                        "weightPerBag",
                      )
                    }
                    onBlur={(e) => {
                      const val = e.target.value;
                      if (val) {
                        handleInputChange(
                          parseFloat(val).toFixed(3),
                          originalIndex,
                          "weightPerBag",
                        );
                      }
                    }}
                    readOnly={readOnly || (isOrderYarnLocked && !isFilledRow)}
                    disabled={readOnly || (isOrderYarnLocked && !isFilledRow)}
                  />
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
                    readOnly={
                      readOnly ||
                      (isOrderYarnLocked && !isFilledRow) ||
                      Boolean(rowItem.noOfbags && rowItem.weightPerBag)
                    }
                    disabled={
                      readOnly ||
                      (isOrderYarnLocked && !isFilledRow) ||
                      Boolean(rowItem.noOfbags && rowItem.weightPerBag)
                    }
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
                      readOnly={readOnly || (isOrderYarnLocked && !isFilledRow)}
                      disabled={readOnly || (isOrderYarnLocked && !isFilledRow)}
                      onFocus={(e) => {
                        if (isOrderYarnLocked && !isFilledRow) return;
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
                          e.key === "Enter" &&
                          index === poYarnItems.length - 1 &&
                          !isOrderYarnLocked
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
                    {isCurrencySymbol && rowItem.yarnId
                      ? ` ${isCurrencySymbol}`
                      : ""}
                  </span>
                  {rowItem.yarnId
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
                    disabled={!rowItem.yarnId || isCustomerExport}
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
                  {!readOnly && !isOrderYarnLocked && (
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

      {!isOrderYarnLocked && contextMenu && (
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

export default YarnItems;
