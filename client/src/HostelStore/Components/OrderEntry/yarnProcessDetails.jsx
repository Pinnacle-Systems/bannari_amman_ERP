import React, { useState, useMemo, useEffect } from "react";
import { TransactionGrid } from "../../../Basic/components/Reuseable";
import FxSelect, { FxSelectWithAdd } from "../../../Inputs";
import { ProcessMaster, ColorMaster } from "..";
import { Plus, Trash2, X, Palette } from "lucide-react";
import Swal from "sweetalert2";

const DEFAULT_ROWS = 4;

const createEmptyChildRow = () => ({
  rowId: Math.random().toString(36).substring(2, 9),
  colorId: "",
  yarnProPercentage: "",
});

const createEmptyRow = () => ({
  rowId: Math.random().toString(36).substring(2, 9),
  processId: "",
  lossPercentage: "",
  dyeing: "No",
  yarnProcessColors: [],
});

const YarnProcessDetails = ({
  currentYarnIndex,
  currentFabricIndex,
  orderFabricItems,
  setFabricItems,
  readOnly,
  yarnList,
  colorList,
  onClose,
  processList,
}) => {
  const [selectedProcessRowIndex, setSelectedProcessRowIndex] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [childContextMenu, setChildContextMenu] = useState(null);

  // Reset selected process row when switching yarn or fabric
  useEffect(() => {
    setSelectedProcessRowIndex(null);
  }, [currentYarnIndex, currentFabricIndex]);

  const filterProcessList = useMemo(() => {
    if (!Array.isArray(processList?.data)) return [];
    return processList.data.filter((process) =>
      process?.processGroupList?.some((pgl) =>
        Boolean(pgl?.processGroup?.isYarnProcess),
      ),
    );
  }, [processList]);

  const currentFabricItem = orderFabricItems?.[currentFabricIndex];
  const currentYarnRow = (currentFabricItem?.fabricYarnDetails ||
    currentFabricItem?.yarnDetails)?.[currentYarnIndex];

  const selectedYarn = (yarnList?.data || []).find(
    (y) => y.id === currentYarnRow?.yarnId,
  );
  const yarnDisplayName = selectedYarn?.name || currentYarnRow?.yarnId || "";

  const childRows = useMemo(() => {
    const existing = currentYarnRow?.yarnProcessDetails;
    const formatRow = (r) => ({
      ...r,
      dyeing: r?.dyeing || "No",
    });
    if (Array.isArray(existing) && existing.length > 0) {
      const formatted = existing.map(formatRow);
      if (formatted.length >= DEFAULT_ROWS) return formatted;
      const padded = [...formatted];
      while (padded.length < DEFAULT_ROWS) padded.push(createEmptyRow());
      return padded;
    }
    return Array.from({ length: DEFAULT_ROWS }, () => createEmptyRow());
  }, [orderFabricItems, currentFabricIndex, currentYarnIndex]);

  const selectedProcessIds = useMemo(() => {
    return new Set(
      childRows
        .map((r) => r.processId ?? r.process)
        .filter((id) => id !== "" && id !== undefined && id !== null),
    );
  }, [childRows]);

  const isProcessRowSelected =
    Number.isInteger(selectedProcessRowIndex) &&
    selectedProcessRowIndex >= 0 &&
    selectedProcessRowIndex < childRows.length;

  const selectedProcessRow = isProcessRowSelected
    ? childRows[selectedProcessRowIndex]
    : null;

  const selectedProcess = (processList?.data || []).find(
    (p) => p.id === selectedProcessRow?.processId,
  );
  const selectedProcessName =
    selectedProcess?.name || selectedProcessRow?.processId || "";

  const isDyeingYes =
    selectedProcessRow?.dyeing === "Yes" ||
    selectedProcessRow?.dyeing === "yes";

  const showDyeingColorDetails = isProcessRowSelected && isDyeingYes;

  const activeProcessChildRows = useMemo(() => {
    if (!showDyeingColorDetails || !selectedProcessRow) return [];
    const existing = selectedProcessRow?.yarnProcessColors;
    const formatChildRow = (r) => ({
      ...r,
      colorId: r?.colorId ?? "",
      yarnProPercentage: r?.yarnProPercentage ?? "",
    });

    if (Array.isArray(existing) && existing.length > 0) {
      const formatted = existing.map(formatChildRow);
      if (formatted.length >= DEFAULT_ROWS) return formatted;
      const padded = [...formatted];
      while (padded.length < DEFAULT_ROWS) padded.push(createEmptyChildRow());
      return padded;
    }
    return Array.from({ length: DEFAULT_ROWS }, () => createEmptyChildRow());
  }, [showDyeingColorDetails, selectedProcessRow]);

  const updateParent = (updatedRows) => {
    const newFabricItems = [...orderFabricItems];
    const fabric = { ...newFabricItems[currentFabricIndex] };
    const fabricYarnDetails = [...(fabric.fabricYarnDetails || [])];
    fabricYarnDetails[currentYarnIndex] = {
      ...fabricYarnDetails[currentYarnIndex],
      yarnProcessDetails: updatedRows,
    };
    fabric.fabricYarnDetails = fabricYarnDetails;
    newFabricItems[currentFabricIndex] = fabric;
    setFabricItems(newFabricItems);
  };

  // Top Table Handlers (Process Rows)
  const handleRowChange = (val, field, rowIndex) => {
    if ((field === "processId" || field === "process") && val) {
      const isDuplicate = childRows.some(
        (row, idx) =>
          idx !== rowIndex &&
          String(row.processId ?? row.process) === String(val),
      );
      if (isDuplicate) {
        Swal.fire({
          icon: "warning",
          title: "Duplicate Process",
          text: "This process is already selected. Please select a different process.",
          confirmButtonColor: "#4f46e5",
          timer: 3000,
          timerProgressBar: true,
        });
        return;
      }
    }

    if (field === "lossPercentage" || field === "lossPercenatge") {
      const pct = parseFloat(val);

      if (!isNaN(pct)) {
        if (pct < 0) {
          Swal.fire({
            icon: "warning",
            title: "Invalid Percentage",
            text: "Loss percentage cannot be negative.",
            confirmButtonColor: "#4f46e5",
            timer: 3000,
            timerProgressBar: true,
          });
          return;
        }

        // Sum of all other rows' loss percentages (excluding current row)
        const otherSum = childRows.reduce((sum, row, idx) => {
          if (idx === rowIndex) return sum;
          return (
            sum + (parseFloat(row.lossPercentage ?? row.lossPercenatge) || 0)
          );
        }, 0);

        if (otherSum + pct > 100) {
          Swal.fire({
            icon: "warning",
            title: "Loss Percentage Exceeded",
            text: `Total loss percentage cannot exceed 100.00%. Current used: ${otherSum.toFixed(2)}%, Available: ${(100 - otherSum).toFixed(2)}%`,
            confirmButtonColor: "#4f46e5",
            timer: 3000,
            timerProgressBar: true,
          });
          return; // Block the update
        }
      }
    }

    const updated = [...childRows];
    updated[rowIndex] = { ...updated[rowIndex], [field]: val };
    updateParent(updated);
    setSelectedProcessRowIndex(rowIndex);
  };

  const handleAddRow = () => {
    const updated = [...childRows, createEmptyRow()];
    updateParent(updated);
  };

  const handleDeleteRow = (indexToDelete) => {
    const filtered = childRows.filter((_, i) => i !== indexToDelete);
    const updated = [...filtered];
    while (updated.length < DEFAULT_ROWS) updated.push(createEmptyRow());
    updateParent(updated);
    if (selectedProcessRowIndex === indexToDelete) {
      setSelectedProcessRowIndex(null);
    } else if (selectedProcessRowIndex > indexToDelete) {
      setSelectedProcessRowIndex(selectedProcessRowIndex - 1);
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

  const handleCloseContextMenu = () => setContextMenu(null);

  const handleDeleteAllRows = () => {
    const updated = Array.from({ length: DEFAULT_ROWS }, () =>
      createEmptyRow(),
    );
    updateParent(updated);
    setContextMenu(null);
    setSelectedProcessRowIndex(null);
  };

  // Bottom Table Handlers (Child Process Colors & yarnProPercentage)
  const updateProcessChild = (updatedColorRows) => {
    if (!showDyeingColorDetails) return;
    const updatedProcessRows = [...childRows];
    const target = {
      ...(updatedProcessRows[selectedProcessRowIndex] || createEmptyRow()),
    };
    target.yarnProcessColors = updatedColorRows;
    updatedProcessRows[selectedProcessRowIndex] = target;
    updateParent(updatedProcessRows);
  };

  const handleChildRowChange = (val, field, rowIndex) => {
    if (field === "colorId" && val) {
      const isDuplicate = activeProcessChildRows.some(
        (row, idx) => idx !== rowIndex && String(row.colorId) === String(val),
      );
      if (isDuplicate) {
        Swal.fire({
          icon: "warning",
          title: "Duplicate Color",
          text: "This color is already selected. Please select a different color.",
          confirmButtonColor: "#4f46e5",
          timer: 3000,
          timerProgressBar: true,
        });
        return;
      }

      const currentPct = activeProcessChildRows[rowIndex]?.yarnProPercentage;
      let newPercentage = currentPct;

      if (!currentPct || parseFloat(currentPct) === 0) {
        const otherSum = activeProcessChildRows.reduce((sum, row, idx) => {
          if (idx === rowIndex) return sum;
          return sum + (parseFloat(row.yarnProPercentage) || 0);
        }, 0);

        if (otherSum > 0 && otherSum < 100) {
          const remaining = Math.max(0, 100 - otherSum);
          newPercentage = remaining.toFixed(2);
        }
      }

      const updated = [...activeProcessChildRows];
      updated[rowIndex] = {
        ...updated[rowIndex],
        colorId: val,
        yarnProPercentage: newPercentage,
      };
      updateProcessChild(updated);
      return;
    }

    if (field === "yarnProPercentage") {
      const pct = parseFloat(val);
      if (!isNaN(pct)) {
        if (pct < 0) {
          Swal.fire({
            icon: "warning",
            title: "Invalid Percentage",
            text: "Percentage cannot be negative.",
            confirmButtonColor: "#4f46e5",
            timer: 3000,
            timerProgressBar: true,
          });
          return;
        }

        const otherSum = activeProcessChildRows.reduce((sum, row, idx) => {
          if (idx === rowIndex) return sum;
          return sum + (parseFloat(row.yarnProPercentage) || 0);
        }, 0);

        if (otherSum + pct > 100) {
          Swal.fire({
            icon: "warning",
            title: "Percentage Exceeded",
            text: `Total percentage cannot exceed 100.00%. Current used: ${otherSum.toFixed(2)}%, Available: ${(100 - otherSum).toFixed(2)}%`,
            confirmButtonColor: "#4f46e5",
            timer: 3000,
            timerProgressBar: true,
          });
          return;
        }
      }
    }

    const updated = [...activeProcessChildRows];
    updated[rowIndex] = { ...updated[rowIndex], [field]: val };
    updateProcessChild(updated);
  };

  const handleAddChildRow = () => {
    const updated = [...activeProcessChildRows, createEmptyChildRow()];
    updateProcessChild(updated);
  };

  const handleDeleteChildRow = (indexToDelete) => {
    const filtered = activeProcessChildRows.filter(
      (_, i) => i !== indexToDelete,
    );
    const updated = [...filtered];
    while (updated.length < DEFAULT_ROWS) updated.push(createEmptyChildRow());
    updateProcessChild(updated);
  };

  const handleChildRightClick = (event, rowIndex) => {
    event.preventDefault();
    setChildContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      rowId: rowIndex,
    });
  };

  const handleCloseChildContextMenu = () => setChildContextMenu(null);

  const handleDeleteAllChildRows = () => {
    const updated = Array.from({ length: DEFAULT_ROWS }, () =>
      createEmptyChildRow(),
    );
    updateProcessChild(updated);
    setChildContextMenu(null);
  };

  if (
    !Number.isInteger(currentFabricIndex) ||
    !Number.isInteger(currentYarnIndex) ||
    !currentYarnRow
  ) {
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col bg-white text-slate-800 font-sans border border-gray-300 rounded-lg overflow-hidden shadow-xs">
      {/* Panel Header */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-gray-300 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-[11px] shadow-2xs">
            #{currentYarnIndex + 1}
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800 leading-tight">
              Yarn Process Details
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">
              Yarn Row #{currentYarnIndex + 1}
              {yarnDisplayName ? ` — ${yarnDisplayName}` : ""}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition"
            title="Close Process Details"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Main Body: Side-by-Side (Left: Process Details Table, Right: Yarn Dyed Color Details Table) */}
      <div className="p-2.5 flex-1 min-h-0 flex flex-row gap-2.5 bg-white overflow-hidden">
        {/* Left Side: Process Details Table */}
        <div className="w-1/2 min-w-0 flex flex-col h-full overflow-hidden">
          <div className="text-[11px] font-semibold text-slate-700 pb-1 flex items-center justify-between flex-shrink-0">
            <span className="flex items-center gap-1.5">
              Processes
              {isProcessRowSelected && (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                  Row #{selectedProcessRowIndex + 1} Selected
                </span>
              )}
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              Set Dyeing to "Yes" to configure yarn dyed color details
            </span>
          </div>

          <div
            className="w-full flex-1 min-h-0 flex flex-col overflow-hidden"
            onContextMenu={(e) => {
              const td = e.target.closest("td[data-grid-row]");
              if (td && !readOnly) {
                e.preventDefault();
                const rowIndex = parseInt(td.getAttribute("data-grid-row"), 10);
                handleRightClick(e, rowIndex);
              }
            }}
            onMouseDownCapture={(e) => {
              if (e.button === 2) e.stopPropagation();
            }}
          >
            <TransactionGrid
              title=""
              tableClassName="w-full border-separate border-spacing-0 table-fixed border-l border-t border-gray-300"
              containerClassName="h-full min-h-0 min-w-0 flex-1 !p-0 !border-0 !rounded-none shadow-none"
              borderColor="border-transparent"
              className="w-full flex-1 min-h-0 min-w-0 overflow-auto !my-0"
              columns={[
                {
                  key: "serial",
                  label: "S.No",
                  className:
                    "w-[40px] min-w-[40px] max-w-[40px] px-1 py-1.5 text-center font-medium text-[11px] border-r border-b border-gray-300 sticky left-0 bg-slate-50 z-[32]",
                },
                {
                  key: "processId",
                  label: (
                    <>
                      Process<span className="text-red-500">*</span>
                    </>
                  ),
                  className:
                    "px-2 py-1.5 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
                },
                {
                  key: "lossPercentage",
                  label: "Loss %",
                  className:
                    "w-24 px-2 py-1.5 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
                },
                {
                  key: "dyeing",
                  label: "Dyeing",
                  className:
                    "w-20 px-1 py-1.5 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
                },
                {
                  key: "actions",
                  label: "Actions",
                  className:
                    "w-16 px-2 py-1.5 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
                },
              ]}
              rows={childRows.map((item, index) => ({
                row: item,
                originalIndex: index,
              }))}
              footer={
                <tr className="bg-slate-50 h-6 font-bold text-slate-800 text-[11px]">
                  <td className="w-[40px] min-w-[40px] max-w-[40px] text-center border-r border-b border-gray-300 bg-slate-50" />
                  <td className="text-right px-2 border-r border-b border-gray-300 bg-slate-50">
                    Total
                  </td>
                  <td className="w-24 text-right px-2 border-r border-b border-gray-300">
                    {childRows
                      .reduce(
                        (sum, r) =>
                          sum +
                          (parseFloat(r.lossPercentage ?? r.lossPercenatge) ||
                            0),
                        0,
                      )
                      .toFixed(2)}
                    %
                  </td>
                  <td className="w-20 border-r border-b border-gray-300 bg-slate-50" />
                  <td className="w-16 border-r border-b border-gray-300 bg-slate-50" />
                </tr>
              }
              getRowKey={(item) => item.row.rowId || item.originalIndex}
              getRowClassName={(item) => {
                const isSelected =
                  isProcessRowSelected &&
                  item.originalIndex === selectedProcessRowIndex;
                return `h-6 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-emerald-50/70 font-medium"
                    : "bg-white hover:bg-slate-50 group"
                }`;
              }}
              renderRow={(item, index) => {
                const rowItem = item.row;
                const originalIndex = item.originalIndex;
                const isSelected =
                  isProcessRowSelected &&
                  originalIndex === selectedProcessRowIndex;

                return (
                  <>
                    <td
                      data-grid-row={index}
                      data-grid-col={0}
                      onClick={() => setSelectedProcessRowIndex(originalIndex)}
                      className={`w-[40px] min-w-[40px] max-w-[40px] text-[11px] text-center border-r border-b border-gray-300 sticky left-0 z-[12] cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-emerald-100 text-emerald-800 font-bold border-l-2 border-l-emerald-600"
                          : "bg-white group-hover:bg-gray-50"
                      }`}
                    >
                      {index + 1}
                    </td>
                    <td
                      data-grid-row={index}
                      data-grid-col={1}
                      data-grid-editable="true"
                      onClick={() => setSelectedProcessRowIndex(originalIndex)}
                      className={`grid-editable-cell border-r border-b border-gray-300 transition-colors ${
                        isSelected
                          ? "bg-emerald-50/40"
                          : "bg-white group-hover:bg-gray-50"
                      }`}
                    >
                      <FxSelectWithAdd
                        value={rowItem.processId ?? rowItem.process ?? ""}
                        onChange={(val) =>
                          handleRowChange(val, "processId", originalIndex)
                        }
                        options={(filterProcessList || [])
                          .filter((i) => (readOnly ? true : i.active))
                          .filter(
                            (i) =>
                              i.id === (rowItem.processId ?? rowItem.process) ||
                              !selectedProcessIds.has(i.id),
                          )
                          .map((i) => ({ label: i.name, value: i.id }))}
                        readOnly={readOnly}
                        placeholder=""
                        addNew={true}
                        childComponent={ProcessMaster}
                        addNewModalWidth="w-[65vw] h-[60vh]"
                      />
                    </td>
                    <td
                      data-grid-row={index}
                      data-grid-col={2}
                      data-grid-editable="true"
                      onClick={() => setSelectedProcessRowIndex(originalIndex)}
                      className={`w-24 grid-editable-cell text-[11px] border-r border-b border-gray-300 text-right transition-colors ${
                        isSelected
                          ? "bg-emerald-50/40"
                          : "bg-white group-hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="number"
                        step="any"
                        className="text-right px-2 w-full table-data-input bg-transparent"
                        value={
                          rowItem.lossPercentage ?? rowItem.lossPercenatge ?? ""
                        }
                        onFocus={() =>
                          setSelectedProcessRowIndex(originalIndex)
                        }
                        onChange={(e) =>
                          handleRowChange(
                            e.target.value,
                            "lossPercentage",
                            originalIndex,
                          )
                        }
                        onBlur={() => {
                          const val =
                            rowItem.lossPercentage ?? rowItem.lossPercenatge;
                          if (val !== "" && val !== undefined && val !== null) {
                            const num = parseFloat(val);
                            if (!isNaN(num)) {
                              handleRowChange(
                                num.toFixed(2),
                                "lossPercentage",
                                originalIndex,
                              );
                            }
                          }
                        }}
                        readOnly={readOnly}
                        placeholder=""
                      />
                    </td>
                    <td
                      data-grid-row={index}
                      data-grid-col={3}
                      data-grid-editable="true"
                      onClick={() => setSelectedProcessRowIndex(originalIndex)}
                      className={`w-20 grid-editable-cell border-r border-b border-gray-300 transition-colors ${
                        isSelected
                          ? "bg-emerald-50/40"
                          : "bg-white group-hover:bg-gray-50"
                      }`}
                    >
                      <FxSelect
                        value={rowItem.dyeing || "No"}
                        onChange={(val) =>
                          handleRowChange(val, "dyeing", originalIndex)
                        }
                        options={[
                          { label: "No", value: "No" },
                          { label: "Yes", value: "Yes" },
                        ]}
                        readOnly={readOnly}
                        placeholder="No"
                      />
                    </td>
                    <td
                      data-grid-row={index}
                      className={`w-16 border-r border-b border-gray-300 align-middle text-center transition-colors ${
                        isSelected ? "bg-emerald-50/40" : "bg-gray-50"
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
                            title="Add process row"
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
                            title="Delete process row"
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

        {/* Right Side: Child Table for Selected Process (Color & yarnProPercentage) or Placeholder */}
        <div className="w-1/2 min-w-0 flex flex-col h-full overflow-hidden border-l border-gray-200 pl-2.5">
          {showDyeingColorDetails ? (
            <div className="w-full h-full flex flex-col overflow-hidden">
              <div className="text-[11px] font-semibold text-slate-700 pb-1 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-[9px] flex items-center justify-center">
                  #{selectedProcessRowIndex + 1}
                </span>
                <span>Yarn Dyed Color Details</span>
                {selectedProcessName && (
                  <span className="text-[10px] text-slate-500 font-normal">
                    — {selectedProcessName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-medium">
                  Child of Process Row #{selectedProcessRowIndex + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedProcessRowIndex(null)}
                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100 transition"
                  title="Close Color Details"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            <div
              className="w-full flex-1 min-h-0 flex flex-col overflow-hidden"
              onContextMenu={(e) => {
                const td = e.target.closest("td[data-grid-row]");
                if (td && !readOnly) {
                  e.preventDefault();
                  const rowIndex = parseInt(
                    td.getAttribute("data-grid-row"),
                    10,
                  );
                  handleChildRightClick(e, rowIndex);
                }
              }}
              onMouseDownCapture={(e) => {
                if (e.button === 2) e.stopPropagation();
              }}
            >
              <TransactionGrid
                title=""
                tableClassName="w-full border-separate border-spacing-0 table-fixed border-l border-t border-gray-300"
                containerClassName="h-full min-h-0 min-w-0 flex-1 !p-0 !border-0 !rounded-none shadow-none"
                borderColor="border-transparent"
                className="w-full flex-1 min-h-0 min-w-0 overflow-auto !my-0"
                columns={[
                  {
                    key: "serial",
                    label: "S.No",
                    className:
                      "w-[40px] min-w-[40px] max-w-[40px] px-1 py-1.5 text-center font-medium text-[11px] border-r border-b border-gray-300 sticky left-0 bg-slate-50 z-[32]",
                  },
                  {
                    key: "colorId",
                    label: (
                      <>
                        Yarn Process Color
                        <span className="text-red-500">*</span>
                      </>
                    ),
                    className:
                      "px-2 py-1.5 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
                  },
                  {
                    key: "yarnProPercentage",
                    label: (
                      <>
                        Yarn Process %<span className="text-red-500">*</span>
                      </>
                    ),
                    className:
                      "w-28 px-2 py-1.5 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
                  },
                  {
                    key: "actions",
                    label: "Actions",
                    className:
                      "w-16 px-2 py-1.5 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
                  },
                ]}
                rows={activeProcessChildRows.map((item, index) => ({
                  row: item,
                  originalIndex: index,
                }))}
                footer={
                  <tr className="bg-slate-50 h-6 font-bold text-slate-800 text-[11px]">
                    <td className="w-[40px] min-w-[40px] max-w-[40px] text-center border-r border-b border-gray-300 bg-slate-50" />
                    <td className="text-right px-2 border-r border-b border-gray-300 bg-slate-50">
                      Total
                    </td>
                    <td className="w-28 text-right px-2 border-r border-b border-gray-300">
                      {activeProcessChildRows
                        .reduce(
                          (sum, r) =>
                            sum + (parseFloat(r.yarnProPercentage) || 0),
                          0,
                        )
                        .toFixed(2)}
                      %
                    </td>
                    <td className="w-16 border-r border-b border-gray-300 bg-slate-50" />
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
                        className="grid-editable-cell border-r border-b border-gray-300 bg-white group-hover:bg-gray-50"
                      >
                        <FxSelectWithAdd
                          value={rowItem.colorId ?? ""}
                          onChange={(val) =>
                            handleChildRowChange(val, "colorId", originalIndex)
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
                        data-grid-col={2}
                        data-grid-editable="true"
                        className="w-28 grid-editable-cell text-[11px] border-r border-b border-gray-300 text-right bg-white group-hover:bg-gray-50"
                      >
                        <input
                          type="number"
                          step="any"
                          className="text-right px-2 w-full table-data-input bg-transparent"
                          value={rowItem.yarnProPercentage ?? ""}
                          placeholder={
                            !rowItem.yarnProPercentage && rowItem.colorId
                              ? (() => {
                                  const otherSum = activeProcessChildRows.reduce(
                                    (sum, row, idx) => {
                                      if (idx === originalIndex) return sum;
                                      return (
                                        sum +
                                        (parseFloat(row.yarnProPercentage) || 0)
                                      );
                                    },
                                    0,
                                  );
                                  return otherSum > 0 && otherSum < 100
                                    ? (100 - otherSum).toFixed(2)
                                    : "";
                                })()
                              : ""
                          }
                          onChange={(e) =>
                            handleChildRowChange(
                              e.target.value,
                              "yarnProPercentage",
                              originalIndex,
                            )
                          }
                          onFocus={() => {
                            if (
                              (!rowItem.yarnProPercentage ||
                                parseFloat(rowItem.yarnProPercentage) === 0) &&
                              rowItem.colorId
                            ) {
                              const otherSum = activeProcessChildRows.reduce(
                                (sum, row, idx) => {
                                  if (idx === originalIndex) return sum;
                                  return (
                                    sum +
                                    (parseFloat(row.yarnProPercentage) || 0)
                                  );
                                },
                                0,
                              );
                              if (otherSum > 0 && otherSum < 100) {
                                const remaining = (100 - otherSum).toFixed(2);
                                handleChildRowChange(
                                  remaining,
                                  "yarnProPercentage",
                                  originalIndex,
                                );
                              }
                            }
                          }}
                          onBlur={() => {
                            const val = rowItem.yarnProPercentage;
                            if (
                              val !== "" &&
                              val !== undefined &&
                              val !== null
                            ) {
                              const num = parseFloat(val);
                              if (!isNaN(num)) {
                                handleChildRowChange(
                                  num.toFixed(2),
                                  "yarnProPercentage",
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
                        className="w-16 border-r border-b border-gray-300 align-middle text-center bg-gray-50"
                      >
                        {!readOnly && (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddChildRow();
                              }}
                              className="flex items-center justify-center p-0.5 bg-blue-50 hover:bg-blue-100 rounded"
                              title="Add color row"
                              tabIndex={-1}
                            >
                              <Plus size={13} className="text-blue-700" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChildRow(originalIndex);
                              }}
                              className="flex items-center justify-center p-0.5 bg-red-50 hover:bg-red-100 rounded text-red-600"
                              title="Delete color row"
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
        ) : (
          <div className="w-full h-full border border-dashed border-gray-300 rounded-lg bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-2 shadow-2xs">
              <Palette size={17} />
            </div>
            <h5 className="text-xs font-semibold text-slate-700">
              Yarn Dyed Color Details
            </h5>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[260px] leading-relaxed">
              {selectedProcessRow
                ? `Dyeing is set to "${selectedProcessRow.dyeing || "No"}". Set Dyeing to "Yes" on a process row to configure dyed colors.`
                : 'Select a process row on the left with Dyeing set to "Yes" to view and edit dyed color details.'}
            </p>
          </div>
        )}
      </div>
    </div>

      {/* Top Table Context Menu */}
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
              Delete Process Row
            </button>
            <button
              type="button"
              className="text-black text-[12px] text-left rounded px-1 hover:bg-gray-200"
              onClick={handleDeleteAllRows}
            >
              Delete All Process Rows
            </button>
          </div>
        </div>
      )}

      {/* Child Table Context Menu */}
      {childContextMenu && (
        <div
          style={{
            position: "fixed",
            top: `${childContextMenu.mouseY - 20}px`,
            left: `${childContextMenu.mouseX + 20}px`,
            boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
            padding: "8px",
            borderRadius: "4px",
            zIndex: 10000,
          }}
          className="bg-gray-100"
          onMouseLeave={handleCloseChildContextMenu}
        >
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className="text-black text-[12px] text-left rounded px-1 hover:bg-gray-200"
              onClick={() => {
                handleDeleteChildRow(childContextMenu.rowId);
                handleCloseChildContextMenu();
              }}
            >
              Delete Color Row
            </button>
            <button
              type="button"
              className="text-black text-[12px] text-left rounded px-1 hover:bg-gray-200"
              onClick={handleDeleteAllChildRows}
            >
              Delete All Color Rows
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default YarnProcessDetails;
