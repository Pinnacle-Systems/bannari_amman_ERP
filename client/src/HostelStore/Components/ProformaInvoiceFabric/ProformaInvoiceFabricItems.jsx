import React, { useState, useEffect, useRef } from "react";
import FxSelect, { FxSelectWithAdd } from "../../../Inputs";
import { useGetFabricMasterQuery } from "../../../redux/services/FabricMasterService.js";
import { useGetGsmMasterQuery } from "../../../redux/services/GsmMasterService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import { useGetColorMasterQuery } from "../../../redux/services/ColorMasterService";
import { useGetDesignMasterQuery } from "../../../redux/services/DesignMasterService";
import { useGetLoopLengthMasterQuery } from "../../../redux/services/LooplengthMasterService";
import { useGetDiaMasterQuery } from "../../../redux/services/DiaMasterService";
import { useGetGaugeMasterQuery } from "../../../redux/services/GaugeMasterService";
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
} from "../../../Basic/components";
import { TransactionGrid } from "../../../Basic/components/Reuseable";
import { Plus } from "lucide-react";

const ProformaInvoiceFabricItems = ({
  items,
  enrichedItems,
  setItems,
  readOnly,
  taxTemplateId,
  id,
  isCurrencySymbol,
  currencyCode,
  isCustomerExport,
  termsRef,
  isSupplierOutside,
}) => {
  const styleItemRefs = useRef({});
  const { companyId } = getCommonParams();
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

  const EMPTY_ROW = {
    fabricId: "",
    hsnId: "",
    designId: "",
    colorId: "",
    loopLengthId: "",
    gsmId: "",
    kDiaId: "",
    fDiaId: "",
    uomId: "",
    width: "",
    qty: "",
    price: "",
    discountvalue: "",
    discounttype: "",
    taxPercent: "",
  };

  const [contextMenu, setContextMenu] = useState(null);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);
  const [currentWeightSelectedIndex, setCurrentWeightSelectedIndex] =
    useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const gridWrapperRef = useRef(null);

  const addRow = () => {
    setItems([
      ...items,
      { ...EMPTY_ROW, rowId: Math.random().toString(36).substring(2, 9) },
    ]);
  };

  const deleteRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleInputChange = async (value, index, field) => {
    const newItems = [...items];
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

    if (field === "qty" || field === "price") {
      const qty = parseFloat(newItems[index].qty) || 0;
      const price = parseFloat(newItems[index].price) || 0;
      newItems[index].amount = (qty * price).toFixed(2);
    }

    setItems(newItems);
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
    if (!items[nextIndex]) {
      setItems((prev) => [
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
    setItems((rows) => rows.filter((r) => !r.selected));
    setContextMenu(null);
  };

  const handleDeleteAllRows = () => {
    setItems(
      Array.from({ length: 14 }, () => ({
        ...EMPTY_ROW,
        rowId: Math.random().toString(36).substring(2, 9),
      })),
    );
  };

  const mergedItems = items.map((item) => {
    const enrichedItem = enrichedItems?.items?.find(
      (i) => i.rowId === item.rowId,
    );
    return enrichedItem ? { ...item, totals: enrichedItem.totals } : item;
  });

  return (
    <>
      <Modal
        isOpen={Number.isInteger(currentWeightSelectedIndex)}
        onClose={() => {
          setCurrentWeightSelectedIndex("");
        }}
      >
        <div className="p-4 bg-white rounded-lg min-w-[50vw] min-h-[40vh]">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            Weight Details
          </h2>
          <p className="text-gray-600">Weight configuration goes here...</p>
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
      >
        <TaxDetailsFullTemplate
          readOnly={readOnly}
          taxTypeId={taxTemplateId}
          currentIndex={currentSelectedIndex}
          setCurrentSelectedIndex={setCurrentSelectedIndex}
          poItems={mergedItems}
          handleInputChange={handleInputChange}
          id={id}
          isNewVersion={false}
          onCloseFocus={handleFocusNextRow}
          isSupplierOutside={isSupplierOutside}
          currencyCode={currencyCode || isCurrencySymbol}
        />
      </Modal>

      <div ref={gridWrapperRef} className="h-full overflow-x-auto w-[100vw]">
        <TransactionGrid
          title=""
          columns={[
            {
              key: "serial",
              label: "S.No",
              className:
                "w-10 px-1 py-2 text-center text-xs border border-gray-300 sticky left-0 bg-gray-200 z-[2]",
            },
            {
              key: "desc",
              label: (
                <>
                  Description of Goods<span className="text-red-500">*</span>
                </>
              ),
              className:
                "w-72 px-2 py-2 text-center text-xs  border border-gray-300 sticky left-[40px] bg-gray-200 z-[2]",
            },
            {
              key: "hsn",
              label: "HSN",
              className:
                "w-28 px-1 py-2 text-center text-xs  border border-gray-300 sticky left-[328px] bg-gray-200 z-[2]",
            },

            {
              key: "color",
              label: "Color",
              className:
                "w-60 px-1 py-2 text-center text-xs  border border-gray-300",
            },
            {
              key: "design",
              label: "Design",
              className:
                "w-60 px-1 py-2 text-center text-xs  border border-gray-300",
            },
            {
              key: "gauge",
              label: "Gauge",
              className:
                "w-40 px-1 py-2 text-center text-xs  border border-gray-300",
            },
            {
              key: "loop",
              label: "Loop Length",
              className:
                "w-40 px-1 py-2 text-center text-xs  border border-gray-300",
            },
            {
              key: "gsm",
              label: "GSM",
              className:
                "w-28 px-1 py-2 text-center text-xs  border border-gray-300",
            },
            {
              key: "kDia",
              label: "K-Dia",
              className:
                "w-24 px-1 py-2 text-center text-xs  border border-gray-300",
            },
            {
              key: "fDia",
              label: "F-Dia",
              className:
                "w-24 px-1 py-2 text-center text-xs  border border-gray-300",
            },
            {
              key: "uom",
              label: "UOM",
              className:
                "w-24 px-1 py-2 text-center text-xs  border border-gray-300",
            },

            {
              key: "width",
              label: "Width",
              className:
                "w-24 px-1 py-2 text-center text-xs  border border-gray-300",
            },
            {
              key: "weight",
              label: "Weight",
              className:
                "w-24 px-1 py-2 text-center text-xs  border border-gray-300",
            },
            {
              key: "qty",
              label: (
                <>
                  Qty<span className="text-red-500">*</span>
                </>
              ),
              className:
                "w-20 px-1 py-2 text-center text-xs  border border-gray-300",
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
                "w-24 px-1 py-2 text-center text-xs  border border-gray-300",
            },
            {
              key: "gross",
              label: "Gross",
              className:
                "w-28 px-1 py-2 text-center text-xs  border border-gray-300",
            },
            {
              key: "tax",
              label: "Tax",
              className:
                "w-12 px-1 py-2 text-center text-xs  border border-gray-300",
            },

            {
              key: "actions",
              label: "Actions",
              className:
                "w-16 px-2 py-2 text-center text-xs  border border-gray-300",
            },
          ]}
          rows={
            items?.map((item, index) => ({
              row: item,
              originalIndex: index,
            })) || []
          }
          footer={
            <tr className="bg-gray-200 h-7 font-bold text-gray-800 text-[12px]">
              <td
                className="text-right px-2 border border-gray-300 sticky left-0 bg-gray-200 z-[1]"
                colSpan={13}
              >
                Total
              </td>
              <td className="text-right px-1 border border-gray-300">
                {items
                  ?.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0)
                  .toFixed(3)}
              </td>
              <td className="text-right px-1 border border-gray-300">
                {isCurrencySymbol ? ` ${isCurrencySymbol}` : ""}
                {items
                  ?.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0)
                  .toFixed(2)}
              </td>
              <td className="text-right px-1 border border-gray-300 text-black">
                {isCurrencySymbol ? ` ${isCurrencySymbol}` : ""}
                {formatCurrencyAmount(
                  items?.reduce(
                    (sum, i) => sum + (parseFloat(i.amount) || 0),
                    0,
                  ),
                  currencyCode || isCurrencySymbol,
                )}
              </td>

              <td className="border border-gray-300 bg-gray-200" colSpan={3} />
            </tr>
          }
          getRowKey={(item) => item.row.rowId || item.originalIndex}
          getRowClassName={(_, index) =>
            `h-6 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-100"}`
          }
          renderRow={(item, index) => {
            const rowItem = item.row;
            const originalIndex = item.originalIndex;
            return (
              <>
                <td
                  data-grid-row={index}
                  data-grid-col={0}
                  className="text-[11px] text-center border border-gray-300 sticky left-0 bg-inherit z-[1]"
                  onContextMenu={(e) => {
                    if (!readOnly) {
                      handleRightClick(e, originalIndex);
                    }
                  }}
                >
                  {index + 1}
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={1}
                  data-grid-editable="true"
                  className="grid-editable-cell border border-gray-300 sticky left-[40px] bg-inherit z-[1]"
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
                <td className="grid-editable-cell border border-gray-300 text-[11px] px-2 sticky left-[328px] bg-inherit z-[1]">
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

                <td className="grid-editable-cell border border-gray-300 text-[11px] px-2">
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
                <td className=" grid-editable-cell border border-gray-300 text-[11px] px-2">
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
                <td className="grid-editable-cell border border-gray-300 text-[11px] px-2">
                  <FxSelectWithAdd
                    value={rowItem.gaugeId}
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
                <td className="grid-editable-cell border border-gray-300 text-[11px] px-2">
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
                    childComponent={ColorMaster}
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
                  className="grid-editable-cell border border-gray-300 text-[11px] items-center"
                >
                  <FxSelectWithAdd
                    value={rowItem.kDia}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "kDia")
                    }
                    options={(kDiaList || [])
                      ?.filter((i) => (id ? true : i.active))
                      ?.map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly}
                    addNew={true}
                    placeholder=""
                    childComponent={DiaMaster}
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
                    value={rowItem.fDia}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "fDia")
                    }
                    options={(fDiaList || [])
                      ?.filter((i) => (id ? true : i.active))
                      ?.map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly}
                    addNew={true}
                    placeholder=""
                    childComponent={DiaMaster}
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
                    readOnly={readOnly}
                    addNew={true}
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
                    readOnly={readOnly}
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={5}
                  data-grid-editable="true"
                  className="grid-editable-cell border border-gray-300 text-center text-[11px]"
                >
                  <button
                    disabled={!rowItem.fabricId || readOnly}
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
                    step="any"
                    className="text-right px-3 w-full table-data-input bg-transparent"
                    value={rowItem.qty}
                    onChange={(e) =>
                      handleInputChange(e.target.value, originalIndex, "qty")
                    }
                    readOnly={readOnly}
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
                      readOnly={readOnly}
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
                        if (e.key === "Enter" && index === items.length - 1) {
                          addRow();
                        }
                      }}
                    />
                  </div>
                </td>
                <td className="text-[11px] text-right px-1 border border-gray-300 bg-gray-50 bg-transparent gap-x-2">
                  <span className="pr-1">
                    {isCurrencySymbol && rowItem.fabricId
                      ? ` ${isCurrencySymbol}`
                      : ""}
                  </span>
                  {rowItem.fabricId
                    ? formatCurrencyAmount(
                        rowItem.amount || 0,
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

                <td className="w-12 border border-gray-300 align-top pt-1 bg-gray-50">
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

export default ProformaInvoiceFabricItems;
