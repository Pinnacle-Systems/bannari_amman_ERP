import React, { useCallback, useRef } from "react";
import { discountTypes } from "../../../Utils/DropdownData";

import { Loader } from "../../../Basic/components";
import {
  findFromList,
  substract as s,
  formatCurrencyAmount,
} from "../../../Utils/helper";
import { useGetTaxTemplateByIdQuery } from "../../../redux/services/TaxTemplateServices";
import { useGetTaxTermMasterQuery } from "../../../redux/services/TaxTermMasterServices";
import { FiPercent } from "react-icons/fi";

const TaxDetailsFullTemplate = ({
  poItems,
  currentIndex: index,
  setCurrentSelectedIndex,
  readOnly,
  handleInputChange,
  isNewVersion,
  id,
  onCloseFocus,
  isSupplierOutside,
  currencyCode,
  allowTaxEdit = false,
  serialNumber,
}) => {
  const row = poItems[index];
  const discountTypeRef = useRef(null);
  const discountValueRef = useRef(null);
  const taxPercentRef = useRef(null);
  console.log(readOnly, "readOnlyintaxtem");

  const displaySno = React.useMemo(() => {
    if (serialNumber != null && serialNumber !== "") {
      return serialNumber;
    }
    if (Array.isArray(poItems) && row) {
      const targetVersion = row.quoteVersion;
      if (targetVersion != null) {
        let count = 0;
        for (let i = 0; i <= index && i < poItems.length; i++) {
          const item = poItems[i];
          if (
            item &&
            (targetVersion === "New"
              ? item.quoteVersion === "New"
              : parseInt(item.quoteVersion) === parseInt(targetVersion))
          ) {
            count++;
          }
        }
        if (count > 0) return count;
      }
    }
    return (Number(index) || 0) + 1;
  }, [serialNumber, poItems, row, index]);

  if (!row) return null;

  let discountType = row["discountType"] || row["discounttype"] || "";
  let discountValue = row["discountValue"] ?? row["discountvalue"] ?? "";
  let taxPercent = row["taxPercent"] ?? "";

  const handleExitToNextRow = useCallback(
    (event) => {
      if (event?.key && event.key !== "Enter" && event.key !== "Tab") {
        return;
      }

      event?.preventDefault?.();
      event?.stopPropagation?.();
      document.activeElement?.blur?.();
      setCurrentSelectedIndex("");
      window.setTimeout(() => {
        onCloseFocus?.(index);
      }, 0);
    },
    [index, onCloseFocus, setCurrentSelectedIndex],
  );

  const focusField = (fieldRef) => {
    window.setTimeout(() => {
      fieldRef.current?.focus?.();
      fieldRef.current?.select?.();
    }, 0);
  };

  const focusNextEditableField = useCallback(
    (event, currentField) => {
      if (event.key !== "Enter" && event.key !== "Tab") return;

      event.preventDefault();
      event.stopPropagation();

      const orderedFields = [
        {
          key: "discountType",
          ref: discountTypeRef,
          disabled: readOnly,
        },
        {
          key: "discountValue",
          ref: discountValueRef,
          disabled: readOnly || !discountType,
        },
        {
          key: "taxPercent",
          ref: taxPercentRef,
          disabled: readOnly || !allowTaxEdit,
        },
      ];

      const currentIndex = orderedFields.findIndex(
        (field) => field.key === currentField,
      );

      const nextField = orderedFields
        .slice(currentIndex + 1)
        .find((field) => !field.disabled);

      if (nextField) {
        focusField(nextField.ref);
        return;
      }

      handleExitToNextRow(event);
    },
    [
      discountType,
      handleExitToNextRow,
      id,
      isNewVersion,
      readOnly,
      allowTaxEdit,
    ],
  );

  return (
    <div
      className={`${Number.isInteger(index) ? "block" : "hidden"} w-full bg-white text-slate-800 font-sans`}
    >
      {/* Modal Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between pr-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100/70 border border-blue-200/60 flex items-center justify-center text-blue-600 shadow-2xs">
            <FiPercent className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 tracking-tight leading-tight">
              Tax Details
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Item #{displaySno} discount and tax calculation
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 bg-white">
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 border-b border-slate-200">
                <th className="text-left px-3.5 py-2 font-semibold text-[11px] uppercase tracking-wider">
                  Tax Name
                </th>
                <th className="text-right px-3.5 py-2 font-semibold text-[11px] uppercase tracking-wider w-40">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Gross Amount */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-3.5 py-2 font-medium text-slate-700">
                  Gross Amount
                </td>
                <td className="px-3.5 py-2 text-right font-semibold text-slate-800 tabular-nums">
                  {formatCurrencyAmount(row?.totals?.gross || 0, currencyCode)}
                </td>
              </tr>

              {/* Discount Type */}
              <tr className="bg-slate-50/30 hover:bg-slate-50/70 transition-colors">
                <td className="px-3.5 py-1.5 font-medium text-slate-700">
                  Discount Type
                </td>
                <td className="px-3.5 py-1.5 text-right">
                  <select
                    autoFocus
                    ref={discountTypeRef}
                    disabled={readOnly}
                    className="w-full text-xs rounded-md border border-slate-300 bg-white py-1 px-2.5 text-slate-800 shadow-2xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
                    value={discountType}
                    onChange={(e) =>
                      handleInputChange(e.target.value, index, "discountType")
                    }
                    onKeyDown={(event) =>
                      focusNextEditableField(event, "discountType")
                    }
                  >
                    <option value={""}>Select</option>
                    {discountTypes.map((option, idx) => (
                      <option key={idx} value={option.value}>
                        {option.show}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>

              {/* Discount Value */}
              <tr className="bg-slate-50/30 hover:bg-slate-50/70 transition-colors">
                <td className="px-3.5 py-1.5 font-medium text-slate-700">
                  Discount
                </td>
                <td className="px-3.5 py-1.5 text-right">
                  <input
                    ref={discountValueRef}
                    type="text"
                    disabled={readOnly || !discountType}
                    className="w-full text-xs rounded-md border border-slate-300 bg-white py-1 px-2.5 text-right font-semibold text-slate-800 shadow-2xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:bg-slate-100 disabled:text-slate-400 placeholder:text-slate-400"
                    placeholder="0.00"
                    value={discountValue}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) =>
                      handleInputChange(e.target.value, index, "discountValue")
                    }
                    onKeyDown={(event) =>
                      focusNextEditableField(event, "discountValue")
                    }
                  />
                </td>
              </tr>

              {/* Taxable Amount */}
              <tr className="bg-slate-50/80 hover:bg-slate-100/60 transition-colors">
                <td className="px-3.5 py-2 font-semibold text-slate-800">
                  Taxable Amount
                </td>
                <td className="px-3.5 py-2 text-right font-bold text-slate-900 tabular-nums">
                  {formatCurrencyAmount(
                    row?.totals?.taxable || 0,
                    currencyCode,
                  )}
                </td>
              </tr>

              {/* Tax (%) */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-3.5 py-1.5 font-medium text-slate-700">
                  Tax
                </td>
                <td className="px-3.5 py-1.5 text-right">
                  <input
                    ref={taxPercentRef}
                    type="text"
                    disabled={readOnly || !allowTaxEdit}
                    readOnly={readOnly || !allowTaxEdit}
                    className="w-full text-xs rounded-md border border-slate-300 bg-white py-1 px-2.5 text-right font-semibold text-slate-800 shadow-2xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:bg-slate-50 disabled:text-slate-800 disabled:border-slate-200"
                    value={taxPercent}
                    onChange={(e) => {
                      handleInputChange(e.target.value, index, "taxPercent");
                    }}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(event) =>
                      focusNextEditableField(event, "taxPercent")
                    }
                  />
                </td>
              </tr>

              {/* Taxes Breakdown */}
              {isSupplierOutside ? (
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-3.5 py-1.5 text-slate-600 font-normal pl-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <span>IGST</span>
                  </td>
                  <td className="px-3.5 py-1.5 text-right font-medium text-slate-700 tabular-nums">
                    {formatCurrencyAmount(row?.totals?.igst || 0, currencyCode)}
                  </td>
                </tr>
              ) : (
                <>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3.5 py-1.5 text-slate-600 font-normal pl-6 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      <span>CGST</span>
                    </td>
                    <td className="px-3.5 py-1.5 text-right font-medium text-slate-700 tabular-nums">
                      {formatCurrencyAmount(
                        row?.totals?.cgst || 0,
                        currencyCode,
                      )}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3.5 py-1.5 text-slate-600 font-normal pl-6 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      <span>SGST</span>
                    </td>
                    <td className="px-3.5 py-1.5 text-right font-medium text-slate-700 tabular-nums">
                      {formatCurrencyAmount(
                        row?.totals?.sgst || 0,
                        currencyCode,
                      )}
                    </td>
                  </tr>
                </>
              )}

              {/* Net Amount */}
              <tr className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 border-t-2 border-blue-200">
                <td className="px-3.5 py-2.5 font-bold text-blue-900 text-xs uppercase tracking-wide">
                  Net Amount
                </td>
                <td className="px-3.5 py-2.5 text-right font-extrabold text-blue-700 text-sm tabular-nums">
                  {formatCurrencyAmount(row?.totals?.net || 0, currencyCode)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 text-[10px] font-mono text-slate-600 shadow-2xs">
            Enter
          </kbd>
          <span>to advance & apply</span>
        </span>
        <button
          type="button"
          onClick={handleExitToNextRow}
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-sm transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default TaxDetailsFullTemplate;
