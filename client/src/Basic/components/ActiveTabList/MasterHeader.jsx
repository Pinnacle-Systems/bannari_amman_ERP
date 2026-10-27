import React from "react";
import ActiveTabsHeader from "./ActiveTabsHeader";

const MasterHeader = ({ children, className = "" }) => {
  return (
    <div className={`w-full flex bg-white py-1 px-2 justify-between items-center rounded-md shadow-sm border border-gray-200 mb-2 relative z-30 ${className}`}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <ActiveTabsHeader />
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};

export default MasterHeader;
