import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { TransactionGrid } from "../../../Basic/components/Reuseable";
import { FxSelectWithAdd } from "../../../Inputs";
import { ProcessMaster } from "..";
import { useGetProcessMasterQuery } from "../../../redux/services/ProcessMasterService";
import { Plus, Trash2, X } from "lucide-react";

const DEFAULT_ROWS = 4;

const createEmptyRow = () => ({
  rowId: Math.random().toString(36).substring(2, 9),
  processId: "",
  lossPercentage: "",
});

const YarnProcessDetails = ({
  currentYarnIndex,
  currentFabricIndex,
  orderFabricItems,
  setFabricItems,
  readOnly,
  yarnList,
  processList: propProcessList,
  onClose,
}) => {
  const [contextMenu, setContextMenu] = useState(null);

  const companyId = useSelector((state) => state?.auth?.user?.companyId);
  const { data: queryProcessList } = useGetProcessMasterQuery({
    params: companyId ? { companyId } : undefined,
  });
  const processList = propProcessList || queryProcessList;

  const currentFabricItem = orderFabricItems?.[currentFabricIndex];
  const currentYarnRow =
    currentFabricItem?.yarnDetails?.[currentYarnIndex];

  const selectedYarn = (yarnList?.data || []).find(
    (y) => y.id === currentYarnRow?.yarnId
  );
  const yarnDisplayName = selectedYarn?.name || currentYarnRow?.yarnId || "";

  const childRows = useMemo(() => {
    const existing = currentYarnRow?.processDetails;
    if (Array.isArray(existing) && existing.length > 0) {
      if (existing.length >= DEFAULT_ROWS) return existing;
      const padded = [...existing];
      while (padded.length < DEFAULT_ROWS) padded.push(createEmptyRow());
      return padded;
    }
    return Array.from({ length: DEFAULT_ROWS }, () => createEmptyRow());
  }, [orderFabricItems, currentFabricIndex, currentYarnIndex]);

  const updateParent = (updatedRows) => {
    const newFabricItems = [...orderFabricItems];
    const fabric = { ...newFabricItems[currentFabricIndex] };
    const yarnDetails = [...(fabric.yarnDetails || [])];
    yarnDetails[currentYarnIndex] = {
      ...yarnDetails[currentYarnIndex],
      processDetails: updatedRows,
    };
    fabric.yarnDetails = yarnDetails;
    newFabricItems[currentFabricIndex] = fabric;
    setFabricItems(newFabricItems);
  };

  const handleRowChange = (val, field, rowIndex) => {
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
    const updated = Array.from({ length: DEFAULT_ROWS }, () => createEmptyRow());
    updateParent(updated);
    setContextMenu(null);
  };

  if (
    !Number.isInteger(currentFabricIndex) ||
    !Number.isInteger(currentYarnIndex) ||
    !currentYarnRow
  ) {
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col bg-white text-slate-800 font-sans border border-gray-300 rounded-none overflow-hidden shadow-2xs">
      {/* Panel Header */}
      <div className="px-3 py-2 bg-slate-50 border-b border-gray-300 flex items-center justify-between flex-shrink-0">
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
            <X size={15} />
          </button>
        )}
      </div>

      {/* Table Area */}
      <div className="p-3 flex-1 min-h-0 flex flex-col justify-between bg-white overflow-hidden">
        <div
          className="w-full h-[330px] overflow-hidden flex flex-col"
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
                key: "processId",
                label: (
                  <>
                    Process<span className="text-red-500">*</span>
                  </>
                ),
                className:
                  "px-2 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
              },
              {
                key: "lossPercentage",
                label: "Loss %",
                className:
                  "w-24 px-2 py-2 text-center font-medium text-[11px] border-r border-b border-gray-300 bg-slate-50",
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
                <td className="text-right px-2 border-r border-b border-gray-300 bg-slate-50">
                  Total
                </td>
                <td className="w-24 text-right px-2 border-r border-b border-gray-300">
                  {childRows
                    .reduce(
                      (sum, r) =>
                        sum +
                        (parseFloat(r.lossPercentage ?? r.lossPercenatge) || 0),
                      0
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
                      value={rowItem.processId ?? rowItem.process ?? ""}
                      onChange={(val) =>
                        handleRowChange(val, "processId", originalIndex)
                      }
                      options={(processList?.data || [])
                        .filter((i) => i.active)
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
                    className="w-24 grid-editable-cell text-[11px] border-r border-b border-gray-300 text-right bg-white group-hover:bg-gray-50"
                  >
                    <input
                      type="number"
                      step="any"
                      className="text-right px-2 w-full table-data-input bg-transparent"
                      value={rowItem.lossPercentage ?? rowItem.lossPercenatge ?? ""}
                      onChange={(e) =>
                        handleRowChange(
                          e.target.value,
                          "lossPercentage",
                          originalIndex
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
                              originalIndex
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
                    className="w-16 border-r border-b border-gray-300 align-middle text-center bg-gray-50"
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

      {/* Context Menu */}
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

export default YarnProcessDetails;
