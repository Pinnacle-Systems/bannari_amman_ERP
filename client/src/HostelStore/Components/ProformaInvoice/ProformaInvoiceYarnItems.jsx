import React, { useState, useEffect, useRef } from "react";
import FxSelect, { FxSelectWithAdd } from "../../../Inputs";
import {
  useGetStyleItemMasterQuery,
  useLazyGetStyleItemMasterByIdQuery,
} from "../../../redux/services/StyleItemMasterService";
import { useGetSizeMasterQuery } from "../../../redux/services/SizemasterService";
import { useGetGsmMasterQuery } from "../../../redux/services/GsmMasterService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import {
  findFromList,
  getCommonParams,
  formatCurrencyAmount,
} from "../../../Utils/helper";
import { VIEW } from "../../../icons";
import Modal from "../../../UiComponents/Modal";
import TaxDetailsFullTemplate from "../TaxDetailsCompleteTemplate";
import Swal from "sweetalert2";
import {
  Gsm,
  HsnMaster,
  ItemGroup,
  Size,
  StyleItemMaster,
  UomMaster,
  StyleMaster,
} from "..";
import { ItemSubGroupMaster } from "../../../Basic/components";
import { TransactionGrid } from "../../../Basic/components/Reuseable";
import { Plus } from "lucide-react";
import { FaEye, FaTrash } from "react-icons/fa";

// EMPTY DEFINITIONS
const EMPTY_SIZE_ROW = () => ({ sizeId: "", qty: "" });
const EMPTY_STYLE_ROW = () => ({
  styleId: "",
  sizeBreakup: [EMPTY_SIZE_ROW()],
});

const ProformaInvoiceYarnItems = ({
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
  itemGroupList,
  itemSubGroupList,
  styleList,
}) => {
  const styleItemRefs = useRef({});
  const { companyId } = getCommonParams();
  const { data: styleItemList } = useGetStyleItemMasterQuery({
    params: { companyId },
  });
  const { data: sizeList } = useGetSizeMasterQuery({ params: { companyId } });
  const { data: gsmList } = useGetGsmMasterQuery({ params: { companyId } });
  const { data: uomList } = useGetUomQuery({ params: { companyId } });
  const { data: hsnList } = useGetHsnMasterQuery({ params: { companyId } });

  const EMPTY_ROW = {
    itemGroupId: "",
    itemSubGroupId: "",
    styleItemId: "",
    uomId: "",
    gsmId: "",
    hsnId: "",
    qty: "",
    labelWidth: "",
    price: "",
    amount: "", // Used for "Gross"
    dozen: "",
    styleBreakup: [EMPTY_STYLE_ROW()],
  };

  const [contextMenu, setContextMenu] = useState(null);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);
  const [activeModalRowIndex, setActiveModalRowIndex] = useState(null);
  const [activeStyleIndex, setActiveStyleIndex] = useState(0);
  const [focusedField, setFocusedField] = useState(null);
  const gridWrapperRef = useRef(null);

  const [triggerGetStyleItem, { data: styleData }] =
    useLazyGetStyleItemMasterByIdQuery();

  const addRow = () => {
    setItems([
      ...items,
      { ...EMPTY_ROW, rowId: Math.random().toString(36).substring(2, 9) },
    ]);
  };

  const deleteRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const recalculateOrderQty = (rowBreakup) => {
    let orderQty = 0;
    rowBreakup.forEach((style) => {
      style.sizeBreakup.forEach((sz) => {
        orderQty += Number(sz.qty) || 0;
      });
    });
    return orderQty;
  };

  const handleInputChange = async (value, index, field) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Calculate gross (amount)
    const qty = parseFloat(newItems[index].qty) || 0;
    const price = parseFloat(newItems[index].price) || 0;
    const dozen = qty / 12;
    newItems[index].dozen = dozen ? dozen.toFixed(2) : "";

    setItems(newItems);
    if (field === "styleItemId" && value) {
      newItems[index].styleItemId = value;
      setItems([...newItems]);

      try {
        const response = await triggerGetStyleItem(value).unwrap();
        const hsnId = response?.data?.hsnId;
        const hsnObj = hsnList?.data?.find((h) => h.id === hsnId);

        const updatedItems = items.map((item, i) =>
          i === index
            ? {
                ...item,
                styleItemId: value,
                hsnId: hsnId,
                uomId: response?.data?.uomId,
                taxPercent: hsnObj ? hsnObj.tax : "",
                styleBreakup:
                  item.styleBreakup && item.styleBreakup.length > 0
                    ? item.styleBreakup
                    : [EMPTY_STYLE_ROW()],
              }
            : item,
        );
        setItems(updatedItems);
      } catch (e) {
        console.error("Style fetch failed", e);
      }
    }
  };

  const handleStyleChange = (rowIndex, styleIndex, field, value) => {
    setItems((prev) => {
      const rows = [...prev];
      const row = { ...rows[rowIndex] };
      const breakup = [...(row.styleBreakup || [])];

      if (field === "styleId" && value) {
        const isDuplicate = breakup.some(
          (item, idx) => idx !== styleIndex && item.styleId === value,
        );
        if (isDuplicate) {
          Swal.fire({
            icon: "warning",
            title: "Duplicate Style",
            text: "This style is already selected.",
          });
          return prev;
        }
      }

      breakup[styleIndex] = { ...breakup[styleIndex], [field]: value };
      row.styleBreakup = breakup;
      rows[rowIndex] = row;
      return rows;
    });
  };

  const addStyleRow = (rowIndex) => {
    setItems((prev) => {
      const rows = [...prev];
      const row = { ...rows[rowIndex] };
      row.styleBreakup = [...(row.styleBreakup || []), EMPTY_STYLE_ROW()];
      rows[rowIndex] = row;
      return rows;
    });
  };

  const deleteStyleRow = (rowIndex, styleIndex) => {
    setItems((prev) => {
      const rows = [...prev];
      const row = { ...rows[rowIndex] };
      const breakup = row.styleBreakup.filter((_, i) => i !== styleIndex);
      row.styleBreakup = breakup.length > 0 ? breakup : [EMPTY_STYLE_ROW()];

      row.qty = recalculateOrderQty(row.styleBreakup);
      const price = row.price;
      const dozen = row.qty / 12;
      row.dozen = dozen ? dozen.toFixed(2) : "";

      rows[rowIndex] = row;
      return rows;
    });
  };

  const handleNestedSizeChange = (
    rowIndex,
    styleIndex,
    sizeIndex,
    field,
    value,
  ) => {
    setItems((prev) => {
      const rows = [...prev];
      const row = { ...rows[rowIndex] };
      const styleBreakup = [...(row.styleBreakup || [])];
      const styleObj = { ...styleBreakup[styleIndex] };
      const sizeBreakup = [...(styleObj.sizeBreakup || [])];

      if (field === "sizeId" && value) {
        const isDuplicate = sizeBreakup.some(
          (item, idx) => idx !== sizeIndex && item.sizeId === value,
        );
        if (isDuplicate) {
          Swal.fire({
            icon: "warning",
            title: "Duplicate Size",
            text: "This size is already selected.",
          });
          return prev;
        }
      }

      sizeBreakup[sizeIndex] = { ...sizeBreakup[sizeIndex], [field]: value };
      styleObj.sizeBreakup = sizeBreakup;
      styleBreakup[styleIndex] = styleObj;
      row.styleBreakup = styleBreakup;

      if (field === "qty") {
        const orderQty = recalculateOrderQty(styleBreakup);
        row.qty = orderQty;
        const price = row.price;
        const dozen = orderQty / 12;
        row.dozen = dozen ? dozen.toFixed(2) : "";
      }

      rows[rowIndex] = row;
      return rows;
    });
  };

  const addNestedSizeRow = (rowIndex, styleIndex) => {
    setItems((prev) => {
      const rows = [...prev];
      const row = { ...rows[rowIndex] };
      const styleBreakup = [...(row.styleBreakup || [])];
      const styleObj = { ...styleBreakup[styleIndex] };

      styleObj.sizeBreakup = [
        ...(styleObj.sizeBreakup || []),
        EMPTY_SIZE_ROW(),
      ];
      styleBreakup[styleIndex] = styleObj;
      row.styleBreakup = styleBreakup;
      rows[rowIndex] = row;
      return rows;
    });
  };

  const deleteNestedSizeRow = (rowIndex, styleIndex, sizeIndex) => {
    setItems((prev) => {
      const rows = [...prev];
      const row = { ...rows[rowIndex] };
      const styleBreakup = [...(row.styleBreakup || [])];
      const styleObj = { ...styleBreakup[styleIndex] };

      const sizeBreakup = styleObj.sizeBreakup.filter(
        (_, i) => i !== sizeIndex,
      );
      styleObj.sizeBreakup =
        sizeBreakup.length > 0 ? sizeBreakup : [EMPTY_SIZE_ROW()];
      styleBreakup[styleIndex] = styleObj;
      row.styleBreakup = styleBreakup;

      row.qty = recalculateOrderQty(styleBreakup);
      const price = row.price;
      const dozen = row.qty / 12;
      row.dozen = dozen ? dozen.toFixed(2) : "";

      rows[rowIndex] = row;
      return rows;
    });
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
    const enrichedItem = enrichedItems?.items?.find((i) => i.rowId === item.rowId);
    return enrichedItem ? { ...item, totals: enrichedItem.totals } : item;
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

      <div ref={gridWrapperRef} className="h-full">
        <TransactionGrid
          title=""
          columns={[
            {
              key: "serial",
              label: "S.No",
              className:
                "w-10 px-1 py-2 text-center text-xs border border-gray-300",
            },
            {
              key: "itemGroup",
              label: "Item Group",
              className:
                "w-36 px-2 py-2 text-center text-xs  border border-gray-300",
            },

            {
              key: "desc",
              label: (
                <>
                  Description of Goods<span className="text-red-500">*</span>
                </>
              ),
              className:
                "w-80 px-2 py-2 text-center text-xs  border border-gray-300",
            },
            {
              key: "hsn",
              label: "HSN",
              className:
                "w-40 px-1 py-2 text-center text-xs  border border-gray-300",
            },
            {
              key: "uom",
              label: "UOM",
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
                "w-24 px-1 py-2 text-center text-xs  border border-gray-300",
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
                "w-32 px-1 py-2 text-center text-xs  border border-gray-300",
            },
            {
              key: "gross",
              label: "Gross",
              className:
                "w-32 px-1 py-2 text-center text-xs  border border-gray-300",
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
                className="text-right px-2 border border-gray-300"
                colSpan={5}
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

              <td className="border border-gray-300 bg-gray-50" colSpan={1} />
              <td className="border border-gray-300 bg-gray-50" colSpan={1} />
            </tr>
          }
          getRowKey={(item) => item.row.rowId || item.originalIndex}
          getRowClassName={(_, index) =>
            `h-6 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`
          }
          renderRow={(item, index) => {
            const rowItem = item.row;
            const originalIndex = item.originalIndex;
            return (
              <>
                <td
                  data-grid-row={index}
                  data-grid-col={0}
                  className="text-[11px] text-center border border-gray-300"
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
                  className="grid-editable-cell border border-gray-300 text-[11px] items-center"
                >
                  <FxSelectWithAdd
                    value={rowItem.itemGroupId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "itemGroupId")
                    }
                    options={(itemGroupList?.data || [])
                      .filter((i) => (id ? true : i.active))
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly}
                    placeholder=""
                    addNew={true}
                    childComponent={ItemGroup}
                    addNewModalWidth="w-[38%] h-[50%]"
                  />
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={2}
                  data-grid-editable="true"
                  className="grid-editable-cell border border-gray-300"
                >
                  <FxSelectWithAdd
                    value={rowItem.styleItemId}
                    onChange={(val) =>
                      handleInputChange(val, originalIndex, "styleItemId")
                    }
                    options={(styleItemList?.data || [])
                      .filter(
                        (i) =>
                          (id ? true : i.active) &&
                          i.itemGroupId === rowItem.itemGroupId &&
                          true,
                      )
                      .map((i) => ({ label: i.name, value: i.id }))}
                    readOnly={readOnly}
                    placeholder=""
                    addNew={true}
                    childComponent={StyleItemMaster}
                    addNewModalWidth="w-[50%] h-[57%]"
                    ref={(el) => (styleItemRefs.current[originalIndex] = el)}
                    nextRef={termsRef}
                  />
                </td>
                <td className="border border-gray-300 text-[11px] px-2">
                  <span className="">
                    {findFromList(rowItem.hsnId, hsnList?.data, "name") || ""}
                  </span>
                </td>
                <td className="border border-gray-300 text-[11px] px-2 text-center">
                  <span>
                    {findFromList(rowItem.uomId, uomList?.data, "name") || ""}
                  </span>
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={3}
                  data-grid-editable="true"
                  className="grid-editable-cell text-[11px] border border-gray-300 text-right pr-2 font-medium"
                >
                  {rowItem.qty ? Number(rowItem.qty) : ""}
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={4}
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
                    {isCurrencySymbol && rowItem.styleItemId
                      ? ` ${isCurrencySymbol}`
                      : ""}
                  </span>
                  {rowItem.styleItemId
                    ? formatCurrencyAmount(
                        rowItem.amount || 0,
                        currencyCode || isCurrencySymbol,
                      )
                    : ""}
                </td>
                <td
                  data-grid-row={index}
                  data-grid-col={5}
                  data-grid-editable="true"
                  className="grid-editable-cell border border-gray-300 text-center text-[11px]"
                >
                  <button
                    disabled={!rowItem.styleItemId || !isCustomerExport}
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

export default ProformaInvoiceYarnItems;
