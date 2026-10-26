import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { push, remove } from "../../../redux/features/opentabs";
import { CLOSE_ICON, DOUBLE_NEXT_ICON } from "../../../icons";

const ActiveTabsHeader = ({ className = "" }) => {
  const openTabs = useSelector((state) => state.openTabs);
  const dispatch = useDispatch();
  const [showHidden, setShowHidden] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const activeTabRef = useRef(null);

  // Maximum width available for tabs up to the search bar
  const [maxAvailableWidth, setMaxAvailableWidth] = useState(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    return Math.max(250, w - 580);
  });

  const updateSearchBoundary = useCallback(() => {
    if (typeof window === "undefined") return;

    // Dynamically locate the search bar input in the top header
    const searchInput =
      document.querySelector('input[placeholder*="SEARCH" i]') ||
      document.getElementById("pageSearch") ||
      document.querySelector("[data-page-search]");

    let boundaryX = window.innerWidth - 580; // Default right offset for PageSearch + profile

    if (searchInput) {
      const searchRect = searchInput.getBoundingClientRect();
      if (searchRect.left > 200) {
        // Stop 20px before the search bar begins
        boundaryX = searchRect.left - 20;
      }
    }

    let containerLeft = 0;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.left > 0) containerLeft = rect.left;
    }

    const available = Math.max(200, boundaryX - containerLeft);
    setMaxAvailableWidth(available);
  }, []);

  useEffect(() => {
    updateSearchBoundary();
    window.addEventListener("resize", updateSearchBoundary);

    const t1 = setTimeout(updateSearchBoundary, 100);
    const t2 = setTimeout(updateSearchBoundary, 400);

    return () => {
      window.removeEventListener("resize", updateSearchBoundary);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [updateSearchBoundary]);

  // Robust click outside & Escape key listener
  useEffect(() => {
    if (!showHidden) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowHidden(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowHidden(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showHidden]);

  const tabsList = openTabs?.tabs || [];
  if (tabsList.length === 0) return null;

  // Tabs fit within available space up to search bar (~125px per tab pill + gap)
  // Reserve ~52px for the overflow ">> N" button
  const spaceForTabs = Math.max(100, maxAvailableWidth - 52);
  const itemsToShow = Math.max(1, Math.floor(spaceForTabs / 125));
  const activeIndex = tabsList.findIndex((t) => t.active);

  let currentShowingTabs = [];
  let hiddenTabs = [];

  if (tabsList.length <= itemsToShow) {
    currentShowingTabs = tabsList;
    hiddenTabs = [];
  } else {
    // Ensure the active tab is ALWAYS included in the visible tab strip
    let startIndex = 0;
    if (activeIndex >= itemsToShow) {
      startIndex = Math.min(
        tabsList.length - itemsToShow,
        Math.max(0, activeIndex - itemsToShow + 1),
      );
    }
    currentShowingTabs = tabsList.slice(startIndex, startIndex + itemsToShow);
    hiddenTabs = tabsList.filter(
      (tab) => !currentShowingTabs.some((shown) => shown.name === tab.name),
    );
  }

  // Scroll active tab into view when activeIndex changes
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "nearest",
        block: "nearest",
      });
    }
  }, [activeIndex]);

  const handleWheel = (e) => {
    if (e.deltaY !== 0 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`active-tabs-header flex items-center gap-1.5 relative min-w-0 max-w-full ${className}`}
      style={{ maxWidth: `${maxAvailableWidth}px` }}
    >
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        style={{
          maxWidth: `${Math.max(100, maxAvailableWidth - (hiddenTabs.length > 0 ? 56 : 0))}px`,
        }}
        className="flex items-center gap-1.5 flex-nowrap overflow-x-auto overflow-y-hidden py-0 no-scrollbar h-7"
      >
        {currentShowingTabs.map((tab, index) => {
          const isActive = Boolean(tab.active);
          return (
            <div
              key={tab.name || index}
              ref={isActive ? activeTabRef : null}
              className={`h-[26px] px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all duration-150 select-none flex-shrink-0 cursor-pointer shadow-xs leading-none ${
                isActive
                  ? "bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white border border-blue-400/40 shadow-sm shadow-blue-500/25 ring-1 ring-blue-500/20"
                  : "bg-slate-50/90 text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
              }`}
              onClick={() => {
                if (!isActive) {
                  dispatch(push({ name: tab.name }));
                }
              }}
              title={tab.name}
            >
              <span className="tracking-wide uppercase whitespace-nowrap leading-none text-[11px]">
                {tab.name}
              </span>
              <button
                type="button"
                className={`w-4 h-4 p-0 rounded-full transition-all duration-150 flex items-center justify-center cursor-pointer text-[10px] leading-none ${
                  isActive
                    ? "text-blue-200 hover:bg-white/20 hover:text-white"
                    : "text-slate-400 hover:bg-rose-500 hover:text-white"
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
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowHidden((prev) => !prev)}
            className="h-[26px] px-2 text-xs text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg hover:bg-blue-50 transition-all duration-150 flex items-center gap-1 cursor-pointer bg-white shadow-xs select-none"
            title={`${hiddenTabs.length} more tabs hidden inside. Click to open`}
          >
            {DOUBLE_NEXT_ICON}
            <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded-full leading-tight">
              {hiddenTabs.length}
            </span>
          </button>

          {showHidden && (
            <div className="absolute left-0 top-full mt-1.5 bg-white border border-slate-200 rounded-lg shadow-2xl z-[9999] min-w-[220px] max-w-[320px] max-h-72 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Hidden Tabs ({hiddenTabs.length})</span>
                <span className="text-[9px] text-slate-400 font-normal">
                  Click to switch
                </span>
              </div>
              <ul className="py-1 overflow-y-auto max-h-60 text-xs">
                {hiddenTabs.map((tab) => (
                  <li
                    key={tab.name}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-all duration-150 ${
                      tab.active
                        ? "bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white font-semibold"
                        : "text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
                    }`}
                    onClick={() => {
                      dispatch(push({ name: tab.name }));
                      setShowHidden(false);
                    }}
                  >
                    <div className="flex items-center gap-1.5 truncate mr-2">
                      <span className="truncate uppercase text-[11px] font-semibold">
                        {tab.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`w-4 h-4 p-0 rounded-full transition flex items-center justify-center flex-shrink-0 text-[10px] ${
                        tab.active
                          ? "text-blue-200 hover:bg-white/20 hover:text-white"
                          : "text-slate-400 hover:bg-rose-500 hover:text-white"
                      }`}
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveTabsHeader;
