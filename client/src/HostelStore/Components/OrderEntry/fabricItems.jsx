import React, { useState, useEffect, useRef, useMemo } from "react";
import FxSelect, { FxSelectWithAdd } from "../../../Inputs";

import {
  findFromList,
  getCommonParams,
  formatCurrencyAmount,
} from "../../../Utils/helper";
import { VIEW } from "../../../icons";
import Modal from "../../../UiComponents/Modal";
import TaxDetailsFullTemplate from "../TaxDetailsCompleteTemplate";
import YarnDetails from "./yarnDetails.jsx";
import FabricProcess from "./fabricProcess.jsx";
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
  orderFabricItems,
  enrichedItems,
  setFabricItems,
  readOnly,
  isNewFieldsReadOnly,
  childRecord,
  orderType,
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
  yarnList,
  processList,
}) => {
  const newFieldsReadOnly =
    isNewFieldsReadOnly !== undefined
      ? isNewFieldsReadOnly
      : Boolean(
          readOnly &&
          (orderType === "AGAINSTPI" ? childRecord?.current > 0 : true),
        );
  const styleItemRefs = useRef({});
  const { companyId } = getCommonParams();
  console.log(orderFabricItems, "orderFabricItems");

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
    wastePercentage: "",
    requiredQty: "",
    price: "",
    amount: "",
    taxPercent: "",
    discountValue: "",
    discountType: "",
    discountvalue: "",
    discounttype: "",
    fabricYarnDetails: [],
    fabricProcess: [],
  };

  const [contextMenu, setContextMenu] = useState(null);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);
  const [currentWeightSelectedIndex, setCurrentWeightSelectedIndex] =
    useState(null);
  const [currentYarnSelectedIndex, setCurrentYarnSelectedIndex] =
    useState(null);
  const [
    currentFabricProcessSelectedIndex,
    setCurrentFabricProcessSelectedIndex,
  ] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const gridWrapperRef = useRef(null);

  const addRow = () => {
    setFabricItems([
      ...orderFabricItems,
      { ...EMPTY_ROW, rowId: Math.random().toString(36).substring(2, 9) },
    ]);
  };

  const deleteRow = (index) => {
    if (orderFabricItems.length <= 10) {
      const newItems = [...orderFabricItems];
      newItems[index] = {
        ...EMPTY_ROW,
        rowId:
          newItems[index].rowId || Math.random().toString(36).substring(2, 9),
      };
      setFabricItems(newItems);
    } else {
      setFabricItems(orderFabricItems.filter((_, i) => i !== index));
    }
  };

  const handleInputChange = async (value, index, field) => {
    const newItems = [...orderFabricItems];
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
      newItems[index].totalKgs = (num * weight).toFixed(3);
      newItems[index].qty = newItems[index].totalKgs;

      const totalKgs = parseFloat(newItems[index].totalKgs) || 0;
      const pricePerKg = parseFloat(newItems[index].pricePerKg) || 0;
      newItems[index].totalPrice = (totalKgs * pricePerKg).toFixed(2);
      newItems[index].amount = newItems[index].totalPrice;

      const q = parseFloat(newItems[index].qty) || 0;
      const waste = parseFloat(newItems[index].wastePercentage) || 0;
      if (q > 0) {
        const required = q + (q * waste) / 100;
        newItems[index].requiredQty = required.toFixed(3);
      } else {
        newItems[index].requiredQty = "";
      }

      const rawYarnDetails =
        newItems[index].fabricYarnDetails || newItems[index].yarnDetails;
      if (Array.isArray(rawYarnDetails)) {
        const reqNum = parseFloat(newItems[index].requiredQty) || 0;
        newItems[index].fabricYarnDetails = rawYarnDetails.map((yd) => {
          const pct = parseFloat(yd.percentage);
          return {
            ...yd,
            yarnQty:
              reqNum > 0 && !isNaN(pct)
                ? ((reqNum * pct) / 100).toFixed(3)
                : yd.yarnQty,
          };
        });
      }
    }

    if (field === "pricePerKg") {
      newItems[index].price = newItems[index].pricePerKg;

      const totalKgs = parseFloat(newItems[index].totalKgs) || 0;
      const pricePerKg = parseFloat(newItems[index].pricePerKg) || 0;
      newItems[index].totalPrice = (totalKgs * pricePerKg).toFixed(2);
      newItems[index].amount = newItems[index].totalPrice;
    }

    if (field === "qty" || field === "price") {
      const qty = parseFloat(newItems[index].qty) || 0;
      const price = parseFloat(newItems[index].price) || 0;
      newItems[index].amount = (qty * price).toFixed(2);
    }

    if (
      field === "qty" ||
      field === "wastePercentage" ||
      field === "requiredQty"
    ) {
      if (field === "qty" || field === "wastePercentage") {
        const q = parseFloat(newItems[index].qty) || 0;
        const waste = parseFloat(newItems[index].wastePercentage) || 0;
        if (q > 0) {
          const required = q + (q * waste) / 100;
          newItems[index].requiredQty = required.toFixed(3);
        } else {
          newItems[index].requiredQty = "";
        }
      }

      const rawYarnDetails = newItems[index].fabricYarnDetails;
      if (Array.isArray(rawYarnDetails)) {
        const reqNum = parseFloat(newItems[index].requiredQty) || 0;
        newItems[index].fabricYarnDetails = rawYarnDetails.map((yd) => {
          const pct = parseFloat(yd.percentage);
          return {
            ...yd,
            yarnQty:
              reqNum > 0 && !isNaN(pct)
                ? ((reqNum * pct) / 100).toFixed(3)
                : yd.yarnQty,
          };
        });
      }
    }

    setFabricItems(newItems);
  };

  const handleRightClick = (event, rowIndex) => {
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
    if (!orderFabricItems[nextIndex]) {
      setFabricItems((prev) => [
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
    setFabricItems((rows) => rows.filter((r) => !r.selected));
    setContextMenu(null);
  };

  const handleDeleteAllRows = () => {
    setFabricItems(
      Array.from({ length: 10 }, () => ({
        ...EMPTY_ROW,
        rowId: Math.random().toString(36).substring(2, 9),
      })),
    );
  };

  const enrichedFabricItems = useMemo(() => {
    return (orderFabricItems || []).map((row) => {
      const matched = enrichedItems?.items?.find((item) =>
        row.rowId
          ? item.rowId === row.rowId
          : item.fabricId && item.fabricId === row.fabricId,
      );
      return matched || row;
    });
  }, [orderFabricItems, enrichedItems]);

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
            orderFabricItems[currentWeightSelectedIndex] && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Number of Rolls
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={
                        orderFabricItems[currentWeightSelectedIndex]
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
                      step="any"
                      className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={
                        orderFabricItems[currentWeightSelectedIndex]
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
                          orderFabricItems[currentWeightSelectedIndex]
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
                        orderFabricItems[currentWeightSelectedIndex]
                          ?.totalKgs || ""
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
                      step="any"
                      className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={
                        orderFabricItems[currentWeightSelectedIndex]
                          .pricePerKg || ""
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
                          orderFabricItems[currentWeightSelectedIndex]
                            .pricePerKg;
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
                        orderFabricItems[currentWeightSelectedIndex]
                          ?.totalPrice || ""
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

      <Modal
        isOpen={Number.isInteger(currentYarnSelectedIndex)}
        onClose={() => {
          setCurrentYarnSelectedIndex(null);
        }}
        widthClass="!p-0 !rounded-xl overflow-hidden shadow-2xl w-[1280px] h-[760px] max-w-[98vw] max-h-[96vh]"
      >
        <YarnDetails
          currentIndex={currentYarnSelectedIndex}
          orderFabricItems={orderFabricItems}
          setFabricItems={setFabricItems}
          fabricList={fabricList}
          yarnList={yarnList}
          processList={processList}
          readOnly={newFieldsReadOnly}
          colorList={colorList}
          onClose={() => setCurrentYarnSelectedIndex(null)}
        />
      </Modal>

      <Modal
        isOpen={Number.isInteger(currentFabricProcessSelectedIndex)}
        onClose={() => {
          setCurrentFabricProcessSelectedIndex(null);
        }}
        widthClass="!p-0 !rounded-xl overflow-hidden shadow-2xl w-[820px] h-[480px] max-w-[94vw] max-h-[90vh]"
      >
        <FabricProcess
          currentIndex={currentFabricProcessSelectedIndex}
          orderFabricItems={orderFabricItems}
          setFabricItems={setFabricItems}
          fabricList={fabricList}
          processList={processList}
          readOnly={newFieldsReadOnly}
          onClose={() => setCurrentFabricProcessSelectedIndex(null)}
        />
      </Modal>

      <div
        className="w-full h-full min-h-0 min-w-0 flex flex-col overflow-hidden"
        tabIndex={-1}
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
          if (td && !readOnly) {
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
          tableClassName="w-[2294px] min-w-[2294px] border-separate border-spacing-0 table-fixed border-l border-t border-gray-300"
          containerClassName="h-full min-h-0 min-w-0 flex-1"
          columns={[
            {
              key: "serial",
              label: "S.No",
              className:
                "w-[40px] min-w-[40px] max-w-[40px] px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300 sticky top-0 left-0 bg-slate-50 z-[35]",
            },
            {
              key: "desc",
              label: (
                <>
                  Description of Goods<span className="text-red-500">*</span>
                </>
              ),
              className:
                "w-[360px] min-w-[360px] max-w-[360px] px-2 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300 sticky top-0 left-[40px] bg-slate-50 z-[34]",
            },
            {
              key: "hsn",
              label: "HSN",
              className:
                "w-[110px] min-w-[110px] max-w-[110px] px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.1)] sticky left-[400px] bg-slate-50 z-[30]",
            },

            {
              key: "color",
              label: "Color",
              className:
                "w-64 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            },
            {
              key: "design",
              label: "Design",
              className:
                "w-40 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            },
            {
              key: "gauge",
              label: "Gauge",
              className:
                "w-20 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            },
            {
              key: "loop",
              label: "Loop Length",
              className:
                "w-28 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            },
            {
              key: "gsm",
              label: "GSM",
              className:
                "w-24 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            },
            {
              key: "kDia",
              label: "K-Dia",
              className:
                "w-24 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            },
            {
              key: "fDia",
              label: "F-Dia",
              className:
                "w-24 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            },
            {
              key: "uom",
              label: "UOM",
              className:
                "w-24 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            },

            // {
            //   key: "width",
            //   label: "Width",
            //   className:
            //     "w-24 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            // },
            // {
            //   key: "weight",
            //   label: "Weight",
            //   className:
            //     "w-24 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            // },
            {
              key: "qty",
              label: (
                <>
                  Order Qty<span className="text-red-500">*</span>
                </>
              ),
              className:
                "w-28 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            },
            {
              key: "wastePercentage",
              label: "Loss %",
              className:
                "w-24 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            },
            {
              key: "requiredQty",
              label: "Required Qty",
              className:
                "w-28 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            },
            {
              key: "yarn",
              label: "Yarn",
              className:
                "w-14 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            },
            {
              key: "process",
              label: "Process",
              className:
                "w-16 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            },
            {
              key: "price",
              label: (
                <>
                  Price {isCurrencySymbol && `(${isCurrencySymbol})`}
                  <span className="text-red-500">*</span>
                </>
              ),
              className:
                "w-28 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            },
            {
              key: "gross",
              label: "Gross",
              className:
                "w-32 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            },
            {
              key: "tax",
              label: "Tax",
              className:
                "w-12 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            },

            {
              key: "actions",
              label: "Actions",
              className:
                "w-16 px-2 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300",
            },
          ]}
          rows={
            orderFabricItems?.map((item, index) => ({
              row: item,
              originalIndex: index,
            })) || []
          }
          footer={
            <tr className="bg-slate-50 h-7 font-bold text-slate-800 text-[12px]">
              <td className="w-[40px] min-w-[40px] max-w-[40px] sticky left-0 z-[22] bg-slate-50 border-r border-b border-gray-300" />
              <td className="w-[360px] min-w-[360px] max-w-[360px] sticky left-[40px] z-[21] bg-slate-50 border-r border-b border-gray-300" />
              <td className="w-[110px] min-w-[110px] max-w-[110px] sticky left-[400px] z-[20] bg-slate-50 border-r border-b border-gray-300 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.1)]" />
              <td
                className="text-right px-2 border-r border-b border-gray-300 bg-slate-50"
                colSpan={8}
              >
                Total
              </td>
              <td className="w-28 text-right px-1 border-r border-b border-gray-300">
                {orderFabricItems
                  ?.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0)
                  .toFixed(3)}
              </td>
              <td className="w-24 border-r border-b border-gray-300 bg-slate-50" />
              <td className="w-28 text-right px-1 border-r border-b border-gray-300">
                {orderFabricItems
                  ?.reduce(
                    (sum, i) => sum + (parseFloat(i.requiredQty) || 0),
                    0,
                  )
                  .toFixed(3)}
              </td>
              <td className="w-14 border-r border-b border-gray-300 bg-slate-50" />
              <td className="w-16 border-r border-b border-gray-300 bg-slate-50" />
              <td className="w-28 text-right px-1 border-r border-b border-gray-300">
                {isCurrencySymbol ? ` ${isCurrencySymbol}` : ""}
                {orderFabricItems
                  ?.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0)
                  .toFixed(2)}
              </td>
              <td className="w-32 text-right px-1 border-r border-b border-gray-300 text-black">
                {isCurrencySymbol ? ` ${isCurrencySymbol}` : ""}
                {formatCurrencyAmount(
                  orderFabricItems?.reduce(
                    (sum, i) => sum + (parseFloat(i.amount) || 0),
                    0,
                  ) || 0,
                  currencyCode || isCurrencySymbol,
                )}
              </td>

              <td
                className="border-r border-b border-gray-300 bg-slate-50"
                colSpan={2}
              />
            </tr>
          }
          getRowKey={(item) => item.row.rowId || item.originalIndex}
          getRowClassName={() => `h-6 bg-white hover:bg-gray-50 group`}
          renderRow={(item, index) => {
            const rowItem = item.row;
            const originalIndex = item.originalIndex;
            return (
              <>
                <td
                  data-grid-row={index}
                  data-grid-col={0}
                  className="w-[40px] min-w-[40px] max-w-[40px] text-[11px] text-center border-r border-b border-gray-300 sticky left-0 bg-white group-hover:bg-gray-50 z-[12]"
                >
                  {index + 1}
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={1}
                  data-grid-editable="true"
                  className="w-[360px] min-w-[360px] max-w-[360px] grid-editable-cell border-r border-b border-gray-300 sticky left-[40px] bg-white group-hover:bg-gray-50 z-[11]"
                >
                  <FxSelectWithAdd
                    value={rowItem.fabricId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "fabricId")
                    }
                    options={(fabricList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly}
                    placeholder=""
                    addNew={true}
                    childComponent={FabricMaster}
                    addNewModalWidth="w-[50%] h-[57%]"
                    ref={(el) => (styleItemRefs.current[originalIndex] = el)}
                    nextRef={termsRef}
                  />
                </td>
                <td
                  data-grid-row={index}
                  className="w-[110px] min-w-[110px] max-w-[110px] grid-editable-cell border-r border-b border-gray-300 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.1)] text-[11px] px-2 sticky left-[400px] bg-white group-hover:bg-gray-50 z-[10]"
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
                  className="w-64 grid-editable-cell border-r border-b border-gray-300 text-[11px] items-center"
                >
                  <FxSelectWithAdd
                    value={rowItem.colorId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "colorId")
                    }
                    options={(colorList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly}
                    addNew={true}
                    placeholder=""
                    childComponent={ColorMaster}
                    addNewModalWidth="w-[50%] h-[57%]"
                  />
                </td>
                <td
                  data-grid-row={index}
                  className="w-40 grid-editable-cell border-r border-b border-gray-300 text-[11px] items-center"
                >
                  <FxSelectWithAdd
                    value={rowItem.designId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "designId")
                    }
                    options={(designList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly}
                    addNew={true}
                    placeholder=""
                    childComponent={DesignMaster}
                    addNewModalWidth="w-[50%] h-[57%]"
                  />
                </td>
                <td
                  data-grid-row={index}
                  className="w-20 grid-editable-cell border-r border-b border-gray-300 text-[11px] items-center"
                >
                  <FxSelectWithAdd
                    value={rowItem?.gaugeId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "gaugeId")
                    }
                    options={(gaugeList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly}
                    addNew={true}
                    placeholder=""
                    childComponent={GaugeMaster}
                    addNewModalWidth="w-[50%] h-[57%]"
                  />
                </td>
                <td
                  data-grid-row={index}
                  className="w-28 grid-editable-cell border-r border-b border-gray-300 text-[11px] items-center"
                >
                  <FxSelectWithAdd
                    value={rowItem.loopLengthId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "loopLengthId")
                    }
                    options={(loopLengthList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly}
                    addNew={true}
                    placeholder=""
                    childComponent={LoopLengthMaster}
                    addNewModalWidth="w-[50%] h-[57%]"
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={3}
                  data-grid-editable="true"
                  className="w-24 grid-editable-cell border-r border-b border-gray-300 text-[11px] items-center"
                >
                  <FxSelectWithAdd
                    value={rowItem.gsmId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "gsmId")
                    }
                    options={(gsmList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly}
                    addNew={true}
                    placeholder=""
                    childComponent={Gsm}
                    addNewModalWidth="w-[50%] h-[57%]"
                  />
                </td>

                <td
                  data-grid-row={index}
                  data-grid-col={2}
                  data-grid-editable="true"
                  className="w-24 grid-editable-cell border-r border-b border-gray-300 text-[11px] items-center"
                >
                  <FxSelectWithAdd
                    value={rowItem.kDiaId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "kDiaId")
                    }
                    options={(kDiaList || [])
                      ?.filter((i) => (id ? true : i.active))
                      ?.map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly}
                    addNew={true}
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
                  className="w-24 grid-editable-cell border-r border-b border-gray-300 text-[11px] items-center"
                >
                  <FxSelectWithAdd
                    value={rowItem.fDiaId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "fDiaId")
                    }
                    options={(fDiaList || [])
                      ?.filter((i) => (id ? true : i.active))
                      ?.map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly}
                    addNew={true}
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
                  className="w-24 grid-editable-cell border-r border-b border-gray-300 text-[11px] items-center"
                >
                  <FxSelectWithAdd
                    value={rowItem.uomId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "uomId")
                    }
                    options={(uomList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly}
                    addNew={true}
                    placeholder=""
                    childComponent={UomMaster}
                    addNewModalWidth="w-[50%] h-[57%]"
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={6}
                  data-grid-editable="true"
                  className="w-28 grid-editable-cell text-[11px] border-r border-b border-gray-300 text-right"
                >
                  <input
                    type="number"
                    step="any"
                    className="text-right px-3 w-full table-data-input bg-transparent"
                    value={rowItem.qty}
                    onChange={(e) =>
                      handleInputChange(e.target.value, originalIndex, "qty")
                    }
                    onBlur={() => {
                      const val = rowItem.qty;
                      if (val !== "" && val !== undefined && val !== null) {
                        const num = parseFloat(val);
                        handleInputChange(
                          !isNaN(num) ? num.toFixed(3) : "",
                          originalIndex,
                          "qty",
                        );
                      }
                    }}
                    readOnly={
                      readOnly ||
                      rowItem.pricePerKg > 0 ||
                      rowItem.weightPerRoll > 0
                    }
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-editable="true"
                  className="w-24 grid-editable-cell text-[11px] border-r border-b border-gray-300 text-right"
                >
                  <input
                    type="number"
                    step="any"
                    className="text-right px-3 w-full table-data-input bg-transparent"
                    value={rowItem.wastePercentage ?? ""}
                    onChange={(e) =>
                      handleInputChange(
                        e.target.value,
                        originalIndex,
                        "wastePercentage",
                      )
                    }
                    onBlur={() => {
                      const val = rowItem.wastePercentage;
                      if (val !== "" && val !== undefined && val !== null) {
                        const num = parseFloat(val);
                        handleInputChange(
                          !isNaN(num) ? num.toFixed(2) : "",
                          originalIndex,
                          "wastePercentage",
                        );
                      }
                    }}
                    readOnly={newFieldsReadOnly}
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-editable="true"
                  className="w-28 grid-editable-cell text-[11px] border-r border-b border-gray-300 text-right"
                >
                  <input
                    type="number"
                    step="any"
                    className="text-right px-3 w-full table-data-input bg-transparent"
                    value={rowItem.requiredQty ?? ""}
                    onChange={(e) =>
                      handleInputChange(
                        e.target.value,
                        originalIndex,
                        "requiredQty",
                      )
                    }
                    onBlur={() => {
                      const val = rowItem.requiredQty;
                      if (val !== "" && val !== undefined && val !== null) {
                        const num = parseFloat(val);
                        handleInputChange(
                          !isNaN(num) ? num.toFixed(3) : "",
                          originalIndex,
                          "requiredQty",
                        );
                      }
                    }}
                    readOnly={newFieldsReadOnly}
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-editable="true"
                  className="w-14 grid-editable-cell border-r border-b border-gray-300 text-center text-[11px]"
                >
                  <button
                    type="button"
                    disabled={
                      !rowItem.fabricId ||
                      !rowItem.requiredQty ||
                      parseFloat(rowItem.requiredQty) <= 0
                    }
                    className="text-indigo-600 w-full flex items-center justify-center hover:text-indigo-800 disabled:text-gray-300 table-data-input"
                    onClick={() => {
                      setCurrentYarnSelectedIndex(originalIndex);
                    }}
                  >
                    {VIEW}
                  </button>
                </td>
                <td
                  data-grid-row={index}
                  data-grid-editable="true"
                  className="w-16 grid-editable-cell border-r border-b border-gray-300 text-center text-[11px]"
                >
                  <button
                    type="button"
                    disabled={!rowItem.fabricId}
                    className="text-indigo-600 w-full flex items-center justify-center hover:text-indigo-800 disabled:text-gray-300 table-data-input"
                    onClick={() => {
                      setCurrentFabricProcessSelectedIndex(originalIndex);
                    }}
                    title="Fabric Process Details"
                  >
                    {VIEW}
                  </button>
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={7}
                  data-grid-editable="true"
                  className="w-28 grid-editable-cell text-[11px] border-r border-b border-gray-300 text-right"
                >
                  <div className="relative w-full">
                    <input
                      type={
                        focusedField === `price-${originalIndex}`
                          ? "number"
                          : "text"
                      }
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
                        readOnly ||
                        rowItem.pricePerKg > 0 ||
                        rowItem.weightPerRoll > 0
                      }
                      onFocus={(e) => {
                        e.target.select();
                        setFocusedField(`price-${originalIndex}`);
                      }}
                      onBlur={(e) => {
                        const num = parseFloat(e.target.value);
                        handleInputChange(
                          num ? Number(num).toFixed(2) : "",
                          originalIndex,
                          "price",
                        );
                        setFocusedField(null);
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          index === orderFabricItems.length - 1
                        ) {
                          addRow();
                        }
                      }}
                    />
                  </div>
                </td>
                <td
                  data-grid-row={index}
                  className="w-32 text-[11px] text-right px-1 border-r border-b border-gray-300 bg-gray-50 bg-transparent gap-x-2"
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
                  className="w-12 grid-editable-cell border-r border-b border-gray-300 text-center text-[11px]"
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
                  className="w-16 border-r border-b border-gray-300 align-top pt-1 bg-gray-50"
                >
                  {!readOnly && (
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

      {contextMenu && (
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
