import React, { useEffect } from "react";
import { discountTypes } from "../../../Utils/DropdownData";
import { numberToWords } from "number-to-words";
import { numberToText } from "number-to-text";
import { groupBy } from "lodash";
import { FiFileText, FiInfo } from "react-icons/fi";

const PoSummary = ({
  poItems = [],
  readOnly,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  totals,
  isNewVersion,
  id,
  setSummary,
  isCustomerExport,
}) => {
  const amount = Math.abs(totals?.net || 0);

  const amountWords =
    amount === 0
      ? "Rupees Zero Only"
      : "Rupees " +
        numberToWords
          .toWords(amount)
          .replace(/,/g, "") // remove commas only
          .replace(/-/g, " ") // ✅ hyphen → space ("Fifty Five")
          .replace(/\b\w/g, (c) => c.toUpperCase()) +
        " Only";

  return (
    <div className="w-full max-w-[520px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-slate-800">
      {/* Modal Card Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between pr-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100/70 border border-blue-200/60 flex items-center justify-center text-blue-600 shadow-2xs">
            <FiFileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 tracking-tight leading-tight">
              Tax & Amount Summary
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Breakdown of gross value, taxes, discount & net payable
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
                  Particulars
                </th>
                <th className="text-right px-3.5 py-2 font-semibold text-[11px] uppercase tracking-wider w-44">
                  Value (₹)
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
                  {(totals?.gross || 0).toFixed(2)}
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
                    name="type"
                    disabled={readOnly || isCustomerExport}
                    className="w-full text-xs rounded-md border border-slate-300 bg-white py-1 px-2.5 text-slate-800 shadow-2xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
                    value={discountType}
                    onChange={(e) => {
                      setDiscountType(e.target.value);
                    }}
                  >
                    <option value={""}>Select</option>
                    {discountTypes.map((option, index) => (
                      <option key={index} value={option.value}>
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
                    type="text"
                    name="value"
                    disabled={readOnly || !discountType || isCustomerExport}
                    className="w-full text-xs rounded-md border border-slate-300 bg-white py-1 px-2.5 text-right font-semibold text-slate-800 shadow-2xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:bg-slate-100 disabled:text-slate-400 placeholder:text-slate-400"
                    placeholder="0.00"
                    value={discountValue}
                    onKeyDown={(e) => {
                      if (e.code === "Minus" || e.code === "NumpadSubtract")
                        e.preventDefault();
                      if (e.key === "Delete") {
                        setDiscountValue(0);
                      }
                      if (e.key === "Enter") {
                        setSummary(false);
                      }
                    }}
                    min={"0"}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      setDiscountValue(e.target.value);
                    }}
                  />
                </td>
              </tr>

              {/* Taxable Amount */}
              <tr className="bg-slate-50/80 hover:bg-slate-100/60 transition-colors">
                <td className="px-3.5 py-2 font-semibold text-slate-800">
                  Taxable Amount
                </td>
                <td className="px-3.5 py-2 text-right font-bold text-slate-900 tabular-nums">
                  {(totals?.taxable || 0).toFixed(2)}
                </td>
              </tr>

              {/* Slab Breakup */}
              {!isCustomerExport &&
                totals?.slabBreakup
                  ?.filter((item) => item.amount > 0)
                  ?.map((i, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-3.5 py-1.5 text-slate-600 font-normal pl-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <span>{i.tax}</span>
                      </td>
                      <td className="px-3.5 py-1.5 text-right font-medium text-slate-700 tabular-nums">
                        {i.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}

              {/* Round Off */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-3.5 py-1.5 text-slate-500 font-medium">
                  Round Off
                </td>
                <td className="px-3.5 py-1.5 text-right font-medium text-slate-600 tabular-nums">
                  {parseFloat(totals?.roundOff || 0).toFixed(2)}
                </td>
              </tr>

              {/* Net Amount Row */}
              <tr className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 border-t-2 border-blue-200">
                <td className="px-3.5 py-2.5 font-bold text-blue-900 text-xs uppercase tracking-wide">
                  Net Amount
                </td>
                <td className="px-3.5 py-2.5 text-right font-extrabold text-blue-700 text-sm tabular-nums">
                  ₹{" "}
                  {(isCustomerExport
                    ? totals?.taxable
                    : totals?.net || 0
                  ).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in words card */}
        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
          <div className="flex items-center gap-1.5 mb-1">
            <FiInfo className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Amount in Words
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-700 italic leading-snug break-words pl-5">
            {amountWords}
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 text-[10px] font-mono text-slate-600 shadow-2xs">
            Enter
          </kbd>
          <span>to apply & close</span>
        </span>
        <button
          type="button"
          onClick={() => setSummary(false)}
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-sm transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default PoSummary;
