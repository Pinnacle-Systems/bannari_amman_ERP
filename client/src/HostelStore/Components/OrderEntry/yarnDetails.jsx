import React, { useState, useMemo, useEffect } from "react";
import { FxSelectWithAdd } from "../../../Inputs";
import { YarnMaster } from "../../../Basic/components";
import { TransactionGrid } from "../../../Basic/components/Reuseable";
import { Plus, Trash2, X, Layers } from "lucide-react";
import { ColorMaster } from "..";
import Swal from "sweetalert2";
import YarnProcessDetails from "./yarnProcessDetails.jsx";

const DEFAULT_ROWS = 4;

const createEmptyRow = () => ({
  rowId: Math.random().toString(36).substring(2, 9),
  yarnId: "",
  colorId: "",
  percentage: "",
  yarnQty: "",
  process: "Yes",
  processDetails: [],
});

const YarnDetails = ({
  currentIndex,
  orderFabricItems,
  setFabricItems,
  fabricList,
  yarnList,
  readOnly,
  onClose,
  colorList,
}) => {
  const activeYarnList = yarnList;
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const currentFabricItem = orderFabricItems?.[currentIndex];
  const selectedFabric = fabricList?.data?.find(
    (f) => f.id === currentFabricItem?.fabricId,
  );
  const fabricName = selectedFabric?.name || "";

  // Robustly determine the parent required quantity
  const parentRequiredQty = useMemo(() => {
    const req = parseFloat(currentFabricItem?.requiredQty);
    if (!isNaN(req) && req > 0) return req;
    const q = parseFloat(currentFabricItem?.qty);
    if (!isNaN(q) && q > 0) {
      const loss = parseFloat(currentFabricItem?.wastePercentage) || 0;
      return q + (q * loss) / 100;
    }
    const totalKgs = parseFloat(currentFabricItem?.totalKgs);
    if (!isNaN(totalKgs) && totalKgs > 0) {
      const loss = parseFloat(currentFabricItem?.wastePercentage) || 0;
      return totalKgs + (totalKgs * loss) / 100;
    }
    return 0;
  }, [
    currentFabricItem?.requiredQty,
    currentFabricItem?.qty,
    currentFabricItem?.totalKgs,
    currentFabricItem?.wastePercentage,
  ]);

  const childRows = useMemo(() => {
    const existing = orderFabricItems?.[currentIndex]?.yarnDetails;
    const formatRow = (r) => {
      const pct = parseFloat(r?.percentage);
      const computedQty =
        parentRequiredQty > 0 && !isNaN(pct)
          ? ((parentRequiredQty * pct) / 100).toFixed(3)
          : r?.yarnQty ?? "";
      return {
        ...r,
        yarnQty: computedQty,
      };
    };

    if (Array.isArray(existing) && existing.length > 0) {
      const formatted = existing.map(formatRow);
      if (formatted.length >= DEFAULT_ROWS) {
        return formatted;
      }
      const padded = [...formatted];
      while (padded.length < DEFAULT_ROWS) {
        padded.push(createEmptyRow());
      }
      return padded;
    }
    return Array.from({ length: DEFAULT_ROWS }, () => createEmptyRow());
  }, [orderFabricItems, currentIndex, parentRequiredQty]);

  const updateParent = (updatedRows) => {
    const newFabricItems = [...orderFabricItems];
    const item = newFabricItems[currentIndex];
    newFabricItems[currentIndex] = {
      ...item,
      requiredQty:
        item?.requiredQty ||
        (parentRequiredQty > 0
          ? parentRequiredQty.toFixed(3)
          : item?.requiredQty),
      yarnDetails: updatedRows,
    };
    setFabricItems(newFabricItems);
  };

  // Synchronize any existing yarn details with the latest parentRequiredQty
  useEffect(() => {
    const existing = orderFabricItems?.[currentIndex]?.yarnDetails;
    if (
      Array.isArray(existing) &&
      existing.length > 0 &&
      parentRequiredQty > 0
    ) {
      let needsUpdate = false;
      const updated = existing.map((r) => {
        const pct = parseFloat(r?.percentage);
        if (!isNaN(pct)) {
          const expectedQty = ((parentRequiredQty * pct) / 100).toFixed(3);
          if (r.yarnQty !== expectedQty) {
            needsUpdate = true;
            return { ...r, yarnQty: expectedQty };
          }
        }
        return r;
      });
      if (needsUpdate) {
        updateParent(updated);
      }
    }
  }, [parentRequiredQty, currentIndex]);

  const handleRowChange = (val, field, rowIndex) => {
    const currentDetails = [...childRows];

    if (field === "percentage") {
      const pct = parseFloat(val);

      if (!isNaN(pct)) {
        // Sum of all other rows' percentages (excluding current row)
        const otherSum = currentDetails.reduce((sum, row, idx) => {
          if (idx === rowIndex) return sum;
          return sum + (parseFloat(row.percentage) || 0);
        }, 0);

        if (otherSum + pct > 100) {
          Swal.fire({
            icon: "warning",
            title: "Percentage Exceeded",
            text: `Total percentage cannot exceed 100%. Current used: ${otherSum.toFixed(2)}%, Available: ${(100 - otherSum).toFixed(2)}%`,
            confirmButtonColor: "#4f46e5",
            timer: 3000,
            timerProgressBar: true,
          });
          return; // Block the update
        }
      }

      const newQty =
        parentRequiredQty > 0 && !isNaN(pct)
          ? ((parentRequiredQty * pct) / 100).toFixed(3)
          : "";
      currentDetails[rowIndex] = {
        ...currentDetails[rowIndex],
        percentage: val,
        yarnQty: newQty,
      };
    } else {
      currentDetails[rowIndex] = {
        ...currentDetails[rowIndex],
        [field]: val,
      };
    }

    updateParent(currentDetails);
  };

  const handleAddRow = () => {
    const updated = [...childRows, createEmptyRow()];
    updateParent(updated);
  };

  const handleDeleteRow = (indexToDelete) => {
    const filtered = childRows.filter((_, i) => i !== indexToDelete);
    const updated = [...filtered];
    while (updated.length < DEFAULT_ROWS) {
      updated.push(createEmptyRow());
    }
    updateParent(updated);
    if (selectedRowIndex === indexToDelete) {
      setSelectedRowIndex(null);
    } else if (selectedRowIndex > indexToDelete) {
      setSelectedRowIndex(selectedRowIndex - 1);
    }
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

  const handleDeleteAllRows = () => {
    const updated = Array.from({ length: DEFAULT_ROWS }, () =>
      createEmptyRow(),
    );
    updateParent(updated);
    setContextMenu(null);
    setSelectedRowIndex(null);
  };

  const selectedRow =
    Number.isInteger(selectedRowIndex) && childRows[selectedRowIndex]
      ? childRows[selectedRowIndex]
      : null;

  const isProcessYes =
    selectedRow?.process?.toString().toLowerCase() === "yes";

  const showProcessDetails = selectedRow !== null && isProcessYes;

  if (!Number.isInteger(currentIndex) || !currentFabricItem) {
    return null;
  }

  return (
    <div className="w-[1300px] max-w-[96vw] h-[520px] max-h-[92vh] flex flex-col bg-white text-slate-800 font-sans">
      {/* Modal Header */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100/70 border border-indigo-200/60 flex items-center justify-center text-indigo-600 shadow-2xs font-semibold text-xs">
            #{currentIndex + 1}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 tracking-tight leading-tight">
              Yarn Details
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {fabricName ? `${fabricName} — ` : ""}Row #{currentIndex + 1}
              {parentRequiredQty > 0
                ? ` (Required Qty: ${parentRequiredQty.toFixed(3)})`
                : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition"
          title="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="p-4 flex-1 min-h-0 flex flex-col justify-between bg-white overflow-hidden">
        <div className="flex-1 min-h-0 flex gap-3 overflow-hidden">
          {/* Left Side: Yarn Details Table */}
          <div className="w-[58%] min-w-0 flex flex-col h-full">
            <div
              className="w-full h-full min-h-0 flex flex-col overflow-hidden"
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
                tableClassName="w-full border-separate border-spacing-0 table-fixed border-l border-t border-gray-300"
                containerClassName="h-full min-h-0 min-w-0 flex-1 !p-0 !border !border-gray-300 !rounded-none shadow-none"
                className="w-full flex-1 min-h-0 min-w-0 overflow-auto my-0"
                columns={[
                  {
                    key: "serial",
                    label: "S.No",
                    className:
                      "w-[40px] min-w-[40px] max-w-[40px] px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300 sticky left-0 bg-slate-50 z-[32]",
                  },
                  {
                    key: "yarnName",
                    label: (
                      <>
                        Yarn Name<span className="text-red-500">*</span>
                      </>
                    ),
                    className:
                      "px-2 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
                  },
                  {
                    key: "colorId",
                    label: (
                      <>
                        Yarn Color<span className="text-red-500">*</span>
                      </>
                    ),
                    className:
                      "w-40 px-2 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
                  },
                  {
                    key: "percentage",
                    label: (
                      <>
                        Percentage<span className="text-red-500">*</span>
                      </>
                    ),
                    className:
                      "w-20 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
                  },
                  {
                    key: "yarnQty",
                    label: "Yarn Qty",
                    className:
                      "w-24 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
                  },
                  {
                    key: "process",
                    label: "Process",
                    className:
                      "w-20 px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
                  },
                  {
                    key: "actions",
                    label: "Actions",
                    className:
                      "w-16 px-2 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
                  },
                ]}
                rows={childRows.map((item, index) => ({
                  row: item,
                  originalIndex: index,
                }))}
                footer={
                  <tr className="bg-slate-50 h-7 font-bold text-slate-800 text-[11px]">
                    <td className="w-[40px] min-w-[40px] max-w-[40px] text-center border-r border-b border-gray-300 bg-slate-50" />
                    <td
                      className="text-right px-2 border-r border-b border-gray-300 bg-slate-50"
                      colSpan={2}
                    >
                      Total
                    </td>
                    <td className="w-20 text-right px-2 border-r border-b border-gray-300">
                      {childRows
                        .reduce(
                          (sum, r) => sum + (parseFloat(r.percentage) || 0),
                          0,
                        )
                        .toFixed(2)}
                      %
                    </td>
                    <td className="w-24 text-right px-2 border-r border-b border-gray-300">
                      {childRows
                        .reduce((sum, r) => sum + (parseFloat(r.yarnQty) || 0), 0)
                        .toFixed(3)}
                    </td>
                    <td className="w-20 border-r border-b border-gray-300 bg-slate-50" />
                    <td className="w-16 border-r border-b border-gray-300 bg-slate-50" />
                  </tr>
                }
                getRowKey={(item) => item.row.rowId || item.originalIndex}
                getRowClassName={(item) => {
                  const isSelected = item.originalIndex === selectedRowIndex;
                  return `h-6 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-indigo-50/70 font-medium"
                      : "bg-white hover:bg-slate-50 group"
                  }`;
                }}
                renderRow={(item, index) => {
                  const rowItem = item.row;
                  const originalIndex = item.originalIndex;
                  const isSelected = originalIndex === selectedRowIndex;

                  return (
                    <>
                      <td
                        data-grid-row={index}
                        data-grid-col={0}
                        onClick={() => setSelectedRowIndex(originalIndex)}
                        className={`w-[40px] min-w-[40px] max-w-[40px] text-[11px] text-center border-r border-b border-gray-300 sticky left-0 z-[12] cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-indigo-100 text-indigo-700 font-bold border-l-2 border-l-indigo-600"
                            : "bg-white group-hover:bg-gray-50"
                        }`}
                      >
                        {index + 1}
                      </td>
                      <td
                        data-grid-row={index}
                        data-grid-col={1}
                        data-grid-editable="true"
                        onClick={() => setSelectedRowIndex(originalIndex)}
                        className={`grid-editable-cell border-r border-b border-gray-300 transition-colors ${
                          isSelected ? "bg-indigo-50/50" : "bg-white group-hover:bg-gray-50"
                        }`}
                      >
                        <FxSelectWithAdd
                          value={rowItem.yarnId}
                          onChange={(val) =>
                            handleRowChange(val, "yarnId", originalIndex)
                          }
                          options={(activeYarnList?.data || [])
                            .filter((i) => i.active)
                            .map((i) => ({ label: i.name, value: i.id }))}
                          readOnly={readOnly}
                          placeholder=""
                          addNew={true}
                          childComponent={YarnMaster}
                          addNewModalWidth="w-[65vw] h-[60vh]"
                        />
                      </td>
                      <td
                        data-grid-row={index}
                        data-grid-col={2}
                        data-grid-editable="true"
                        onClick={() => setSelectedRowIndex(originalIndex)}
                        className={`w-40 grid-editable-cell border-r border-b border-gray-300 transition-colors ${
                          isSelected ? "bg-indigo-50/50" : "bg-white group-hover:bg-gray-50"
                        }`}
                      >
                        <FxSelectWithAdd
                          value={rowItem.colorId}
                          onChange={(val) =>
                            handleRowChange(val, "colorId", originalIndex)
                          }
                          options={(colorList?.data || [])
                            .filter((i) => i.active)
                            .map((i) => ({ label: i.name, value: i.id }))}
                          readOnly={readOnly}
                          placeholder=""
                          addNew={true}
                          childComponent={ColorMaster}
                          addNewModalWidth="w-[65vw] h-[60vh]"
                        />
                      </td>
                      <td
                        data-grid-row={index}
                        data-grid-col={3}
                        data-grid-editable="true"
                        onClick={() => setSelectedRowIndex(originalIndex)}
                        className={`w-20 grid-editable-cell text-[11px] border-r border-b border-gray-300 text-right transition-colors ${
                          isSelected ? "bg-indigo-50/50" : ""
                        }`}
                      >
                        <input
                          type="number"
                          step="any"
                          className="text-right px-3 w-full table-data-input bg-transparent"
                          value={rowItem.percentage ?? ""}
                          onChange={(e) =>
                            handleRowChange(
                              e.target.value,
                              "percentage",
                              originalIndex,
                            )
                          }
                          onBlur={() => {
                            const val = rowItem.percentage;
                            if (val !== "" && val !== undefined && val !== null) {
                              const num = parseFloat(val);
                              if (!isNaN(num)) {
                                handleRowChange(
                                  num.toFixed(2),
                                  "percentage",
                                  originalIndex,
                                );
                              }
                            }
                          }}
                          readOnly={readOnly}
                        />
                      </td>
                      <td
                        data-grid-row={index}
                        data-grid-col={4}
                        data-grid-editable="false"
                        onClick={() => setSelectedRowIndex(originalIndex)}
                        className={`w-24 grid-editable-cell text-[11px] border-r border-b border-gray-300 text-right transition-colors ${
                          isSelected ? "bg-indigo-50/40" : "bg-slate-50/50"
                        }`}
                      >
                        <input
                          type="text"
                          className="text-right px-3 w-full table-data-input bg-transparent cursor-default focus:outline-none"
                          value={rowItem.yarnQty ?? ""}
                          readOnly={true}
                          tabIndex={-1}
                        />
                      </td>
                      {/* Process dropdown */}
                      <td
                        data-grid-row={index}
                        data-grid-col={5}
                        data-grid-editable="true"
                        onClick={() => setSelectedRowIndex(originalIndex)}
                        className={`w-20 grid-editable-cell text-[11px] border-r border-b border-gray-300 transition-colors ${
                          isSelected ? "bg-indigo-50/50" : "bg-white group-hover:bg-gray-50"
                        }`}
                      >
                        <select
                          className="w-full px-1 text-[11px] table-data-input bg-transparent focus:outline-none cursor-pointer h-full font-medium"
                          value={rowItem.process ?? "Yes"}
                          onChange={(e) =>
                            handleRowChange(e.target.value, "process", originalIndex)
                          }
                          disabled={readOnly}
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </td>
                      <td
                        data-grid-row={index}
                        className={`w-16 border-r border-b border-gray-300 align-middle text-center transition-colors ${
                          isSelected ? "bg-indigo-50/50" : "bg-gray-50"
                        }`}
                      >
                        {!readOnly && (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddRow();
                              }}
                              className="flex items-center justify-center p-0.5 bg-blue-50 hover:bg-blue-100 rounded"
                              title="Add row"
                              tabIndex={-1}
                            >
                              <Plus size={13} className="text-blue-700" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRow(originalIndex);
                              }}
                              className="flex items-center justify-center p-0.5 bg-red-50 hover:bg-red-100 rounded text-red-600"
                              title="Delete row"
                              tabIndex={-1}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </>
                  );
                }}
              />
            </div>
          </div>

          {/* Right Side: Child Yarn Process Details or Empty State */}
          <div className="w-[42%] min-w-0 flex flex-col h-full">
            {showProcessDetails ? (
              <YarnProcessDetails
                currentYarnIndex={selectedRowIndex}
                currentFabricIndex={currentIndex}
                orderFabricItems={orderFabricItems}
                setFabricItems={setFabricItems}
                readOnly={readOnly}
                yarnList={yarnList}
                onClose={() => setSelectedRowIndex(null)}
              />
            ) : (
              <div className="w-full h-full border border-dashed border-gray-300 rounded-none bg-slate-50/60 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-2 shadow-2xs">
                  <Layers size={18} />
                </div>
                <h4 className="text-xs font-semibold text-slate-700">
                  Yarn Process Details
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[240px] leading-relaxed">
                  {selectedRow !== null && !isProcessYes
                    ? `Row #${selectedRowIndex + 1} has Process set to "No". Change Process to "Yes" to view and edit its process details.`
                    : "Click on any yarn row on the left with Process set to \"Yes\" to view and edit its process details here."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 flex-shrink-0 border-t border-slate-100 mt-2">
          <div className="text-[11px] text-slate-500">
            {showProcessDetails ? (
              <span className="inline-flex items-center gap-1.5 text-indigo-600 font-medium bg-indigo-50 px-2.5 py-1 rounded">
                Editing Process Details for Yarn Row #{selectedRowIndex + 1}
              </span>
            ) : (
              <span className="text-slate-400">
                Click any row with Process "Yes" to edit its process details on the right
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium transition shadow-xs"
          >
            Done
          </button>
        </div>
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
            zIndex: 10000,
          }}
          className="bg-gray-100"
          onMouseLeave={handleCloseContextMenu}
        >
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className="text-black text-[12px] text-left rounded px-1 hover:bg-gray-200"
              onClick={() => {
                handleDeleteRow(contextMenu.rowId);
                handleCloseContextMenu();
              }}
            >
              Delete
            </button>
            <button
              type="button"
              className="text-black text-[12px] text-left rounded px-1 hover:bg-gray-200"
              onClick={handleDeleteAllRows}
            >
              Delete All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default YarnDetails;
