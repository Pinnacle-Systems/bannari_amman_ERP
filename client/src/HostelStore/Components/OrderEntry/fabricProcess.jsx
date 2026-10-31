import React, { useState, useMemo } from "react";
import { FxSelectWithAdd } from "../../../Inputs";
import { ProcessMaster } from "..";
import { TransactionGrid } from "../../../Basic/components/Reuseable";
import { Plus, Trash2, X } from "lucide-react";
import Swal from "sweetalert2";

const DEFAULT_ROWS = 4;

const createEmptyRow = () => ({
  rowId: Math.random().toString(36).substring(2, 9),
  processId: "",
  description: "",
});

const FabricProcess = ({
  currentIndex,
  orderFabricItems,
  setFabricItems,
  fabricList,
  readOnly,
  onClose,
  processList: propProcessList,
}) => {
  const [contextMenu, setContextMenu] = useState(null);

  const currentFabricItem = orderFabricItems?.[currentIndex];
  const selectedFabric = fabricList?.data?.find(
    (f) => f.id === currentFabricItem?.fabricId,
  );
  const fabricName = selectedFabric?.name || "";

  // Check if any yarn row in yarnDetails for this fabric item has process set to "Yes"
  const isYarnProcessYes = useMemo(() => {
    const yarnDetails = currentFabricItem?.fabricYarnDetails;
    if (!Array.isArray(yarnDetails) || yarnDetails.length === 0) return false;
    return yarnDetails.some(
      (yd) => String(yd?.process || "").trim().toLowerCase() === "yes",
    );
  }, [currentFabricItem?.fabricYarnDetails]);

  const childRows = useMemo(() => {
    const existing = currentFabricItem?.fabricProcess;
    if (Array.isArray(existing) && existing.length > 0) {
      if (existing.length >= DEFAULT_ROWS) return existing;
      const padded = [...existing];
      while (padded.length < DEFAULT_ROWS) padded.push(createEmptyRow());
      return padded;
    }
    return Array.from({ length: DEFAULT_ROWS }, () => createEmptyRow());
  }, [orderFabricItems, currentIndex]);

  const selectedProcessIds = useMemo(() => {
    return new Set(
      childRows
        .map((r) => r.processId)
        .filter((id) => id !== "" && id !== undefined && id !== null),
    );
  }, [childRows]);

  // If yarnDetails process is "Yes", filter to matching processes "DY_DF" and "DF_DF".
  // If "No", GY_GF, GF_DF, DF_DF only should come.
  const YES_PROCESS_TYPES = useMemo(
    () => new Set(["DY_DF", "DF_DF"]),
    [],
  );

  const NO_PROCESS_TYPES = useMemo(
    () => new Set(["GY_GF", "GF_DF", "DF_DF"]),
    [],
  );

  const processList = useMemo(() => {
    if (!Array.isArray(propProcessList?.data)) {
      return propProcessList;
    }
    return {
      ...propProcessList,
      data: propProcessList.data.filter((p) => {
        const procCode = String(p?.process || "")
          .trim()
          .toUpperCase()
          .replace("-", "_");

        if (isYarnProcessYes) {
          return (
            YES_PROCESS_TYPES.has(procCode) || selectedProcessIds.has(p?.id)
          );
        } else {
          return (
            NO_PROCESS_TYPES.has(procCode) || selectedProcessIds.has(p?.id)
          );
        }
      }),
    };
  }, [
    propProcessList,
    isYarnProcessYes,
    selectedProcessIds,
    YES_PROCESS_TYPES,
    NO_PROCESS_TYPES,
  ]);

  const updateParent = (updatedRows) => {
    const newFabricItems = [...orderFabricItems];
    newFabricItems[currentIndex] = {
      ...newFabricItems[currentIndex],
      fabricProcess: updatedRows,
    };
    setFabricItems(newFabricItems);
  };

  const handleRowChange = (val, field, rowIndex) => {
    if (field === "processId" && val) {
      const isDuplicate = childRows.some(
        (row, idx) => idx !== rowIndex && String(row.processId) === String(val),
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
    const updated = [...childRows];
    updated[rowIndex] = { ...updated[rowIndex], [field]: val };
    updateParent(updated);
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
  };

  if (!Number.isInteger(currentIndex) || !currentFabricItem) {
    return null;
  }

  const configuredProcessCount = childRows.filter((r) => r.processId).length;

  return (
    <div className="w-[820px] max-w-[94vw] h-[480px] max-h-[90vh] flex flex-col bg-white text-slate-800 font-sans">
      {/* Modal Header */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100/70 border border-emerald-200/60 flex items-center justify-center text-emerald-700 shadow-2xs font-semibold text-xs">
            #{currentIndex + 1}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 tracking-tight leading-tight">
              Fabric Process Details
            </h3>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 flex-wrap">
              <span>
                {fabricName ? `${fabricName} — ` : ""}Row #{currentIndex + 1}
                {currentFabricItem?.requiredQty
                  ? ` (Required Qty: ${Number(currentFabricItem.requiredQty).toFixed(3)})`
                  : currentFabricItem?.qty
                    ? ` (Qty: ${Number(currentFabricItem.qty).toFixed(3)})`
                    : ""}
              </span>
              {isYarnProcessYes ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                  Yarn Process: Yes (DY_DF, DF_DF)
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-300 font-medium">
                  Yarn Process: No (GY_GF, GF_DF, DF_DF)
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition"
          title="Close"
        >
          {/* <X size={18} /> */}
        </button>
      </div>

      {/* Main Table Content */}
      <div className="p-4 flex-1 min-h-0 flex flex-col justify-between bg-white overflow-hidden">
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
                  "w-[45px] min-w-[45px] max-w-[45px] px-1 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300 sticky top-0 left-0 bg-slate-50 z-[35]",
              },
              {
                key: "processId",
                label: (
                  <>
                    Process<span className="text-red-500">*</span>
                  </>
                ),
                className:
                  "w-[260px] min-w-[260px] px-2 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
              },
              {
                key: "description",
                label: "Description",
                className:
                  "px-2 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
              },
              {
                key: "actions",
                label: "Actions",
                className:
                  "w-16 min-w-[64px] max-w-[64px] px-2 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
              },
            ]}
            rows={childRows.map((item, index) => ({
              row: item,
              originalIndex: index,
            }))}
            footer={
              <tr className="bg-slate-50 h-7 font-bold text-slate-800 text-[11px]">
                <td className="w-[45px] min-w-[45px] max-w-[45px] text-center border-r border-b border-gray-300 bg-slate-50 sticky left-0 z-[22]" />
                <td className="text-right px-2 border-r border-b border-gray-300 bg-slate-50">
                  Total Configured Processes
                </td>
                <td className="px-2 border-r border-b border-gray-300 text-left font-semibold text-emerald-700">
                  {configuredProcessCount}{" "}
                  {configuredProcessCount === 1 ? "process" : "processes"}
                </td>
                <td className="w-16 border-r border-b border-gray-300 bg-slate-50" />
              </tr>
            }
            getRowKey={(item) => item.row.rowId || item.originalIndex}
            getRowClassName={() =>
              "h-7 bg-white hover:bg-slate-50 group transition-colors"
            }
            renderRow={(item, index) => {
              const rowItem = item.row;
              const originalIndex = item.originalIndex;

              return (
                <>
                  <td
                    data-grid-row={index}
                    data-grid-col={0}
                    className="w-[45px] min-w-[45px] max-w-[45px] text-[11px] text-center border-r border-b border-gray-300 sticky left-0 z-[12] bg-white group-hover:bg-gray-50"
                  >
                    {index + 1}
                  </td>
                  <td
                    data-grid-row={index}
                    data-grid-col={1}
                    data-grid-editable="true"
                    className="w-[260px] min-w-[260px] grid-editable-cell border-r border-b border-gray-300 bg-white group-hover:bg-gray-50"
                  >
                    <FxSelectWithAdd
                      value={rowItem.processId ?? ""}
                      onChange={(val) =>
                        handleRowChange(val, "processId", originalIndex)
                      }
                      options={(processList?.data || [])
                        .filter((i) => (readOnly ? true : i.active))
                        .filter(
                          (i) =>
                            i.id === rowItem.processId ||
                            !selectedProcessIds.has(i.id),
                        )
                        .map((i) => ({ label: i.name, value: i.id }))}
                      readOnly={readOnly}
                      placeholder={
                        isYarnProcessYes
                          ? "Select Process (DY_DF, DF_DF)..."
                          : "Select Process (GY_GF, GF_DF, DF_DF)..."
                      }
                      addNew={true}
                      childComponent={ProcessMaster}
                      addNewModalWidth="w-[65vw] h-[60vh]"
                    />
                  </td>
                  <td
                    data-grid-row={index}
                    data-grid-col={2}
                    data-grid-editable="true"
                    className="grid-editable-cell text-[11px] border-r border-b border-gray-300 text-left bg-white group-hover:bg-gray-50"
                  >
                    <input
                      type="text"
                      className="text-left px-2.5 w-full h-full bg-transparent focus:outline-none focus:ring-0 border-0 focus:border-0"
                      value={rowItem.description ?? ""}
                      onChange={(e) =>
                        handleRowChange(
                          e.target.value,
                          "description",
                          originalIndex,
                        )
                      }
                      readOnly={readOnly}
                      placeholder="Enter process description or notes..."
                    />
                  </td>
                  <td
                    data-grid-row={index}
                    className="w-16 min-w-[64px] max-w-[64px] border-r border-b border-gray-300 align-middle text-center bg-gray-50"
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

        {/* Modal Bottom Bar */}
        <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="text-[11px] text-slate-500">
            {configuredProcessCount > 0 ? (
              <span className="font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                {configuredProcessCount} process
                {configuredProcessCount > 1 ? "es" : ""} assigned to Fabric Row
                #{currentIndex + 1}
              </span>
            ) : (
              <span>Right click on any row for quick actions</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-md shadow-xs transition"
          >
            Done
          </button>
        </div>
      </div>

      {/* Right-click Context Menu */}
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
              Delete Row
            </button>
            <button
              type="button"
              className="text-black text-[12px] text-left rounded px-1 hover:bg-gray-200"
              onClick={handleDeleteAllRows}
            >
              Delete All Rows
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricProcess;
