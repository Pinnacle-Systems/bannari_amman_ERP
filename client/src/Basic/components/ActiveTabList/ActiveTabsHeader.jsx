import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { push, remove } from "../../../redux/features/opentabs";
import { CLOSE_ICON, DOUBLE_NEXT_ICON } from "../../../icons";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";

const ActiveTabsHeader = ({ className = "" }) => {
  const openTabs = useSelector((state) => state.openTabs);
  const dispatch = useDispatch();
  const [showHidden, setShowHidden] = useState(false);

  const ref = useOutsideClick(() => {
    setShowHidden(false);
  });

  const innerWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  // Reserve space for right-side action buttons and sidebar (~400px)
  const itemsToShow = Math.max(1, Math.floor((innerWidth - 420) / 140));

  const tabsList = openTabs?.tabs || [];
  const currentShowingTabs = tabsList.slice(0, itemsToShow);
  const hiddenTabs = tabsList.slice(itemsToShow);

  if (tabsList.length === 0) return null;

  return (
    <div className={`flex items-center gap-1.5 relative min-w-0 max-w-full ${className}`}>
      <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto py-0.5 no-scrollbar">
        {currentShowingTabs.map((tab, index) => {
          const isActive = Boolean(tab.active);
          return (
            <div
              key={tab.name || index}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition select-none flex-shrink-0 cursor-pointer ${
                isActive
                  ? "bg-gray-600 text-white border border-gray-600 shadow-sm"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => {
                if (!isActive) {
                  dispatch(push({ name: tab.name }));
                }
              }}
              title={tab.name}
            >
              <span className="tracking-wide uppercase whitespace-nowrap">
                {tab.name}
              </span>
              <button
                type="button"
                className={`p-0.5 rounded transition flex items-center justify-center cursor-pointer ${
                  isActive
                    ? "text-gray-300 hover:bg-red-500 hover:text-white"
                    : "text-gray-400 hover:bg-red-500 hover:text-white"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(remove({ name: tab.name }));
                }}
                title={`Close ${tab.name}`}
              >
                {CLOSE_ICON}
              </button>
            </div>
          );
        })}
      </div>

      {hiddenTabs.length > 0 && (
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowHidden(!showHidden)}
            className="p-1 px-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-100 transition flex items-center gap-1 cursor-pointer bg-white"
            title="More tabs"
          >
            {DOUBLE_NEXT_ICON}
          </button>

          {showHidden && (
            <ul
              ref={ref}
              className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 text-xs py-1 min-w-[160px] max-h-60 overflow-y-auto"
            >
              {hiddenTabs.map((tab) => (
                <li
                  key={tab.name}
                  className={`flex items-center justify-between px-3 py-1.5 cursor-pointer transition ${
                    tab.active
                      ? "bg-gray-200 font-bold text-gray-900"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    dispatch(push({ name: tab.name }));
                    setShowHidden(false);
                  }}
                >
                  <span className="truncate uppercase mr-2">{tab.name}</span>
                  <button
                    type="button"
                    className="hover:bg-red-500 hover:text-white p-0.5 rounded transition text-gray-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(remove({ name: tab.name }));
                    }}
                    title={`Close ${tab.name}`}
                  >
                    {CLOSE_ICON}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveTabsHeader;
