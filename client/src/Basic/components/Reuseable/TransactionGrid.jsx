const TransactionGrid = ({
  title = "Items",
  className = "",
  containerClassName = "",
  tableClassName = "w-full border-collapse table-fixed",
  headClassName = "bg-slate-50 text-slate-800 sticky top-0 z-20 border-b border-slate-200/80",
  bodyClassName = "",
  footer,
  columns = [],
  rows = [],
  getRowKey,
  getRowClassName,
  renderRow,
  emptyState = null,
  borderColor = "border-l-cyan-600",
}) => {
  const visibleRows = Array.isArray(rows) ? rows : [];

  return (
    <div
      className={`border border-slate-200 px-2 bg-white rounded-md shadow-sm w-full h-full min-h-0 min-w-0 flex flex-col border-l-4 ${borderColor} overflow-hidden ${containerClassName}`}
    >
      {title ? (
        <div className="flex justify-between items-center my-2 shrink-0">
          <h2 className="font-medium text-slate-700">{title}</h2>
        </div>
      ) : null}

      <div
        className={`w-full flex-1 min-h-0 min-w-0 overflow-auto my-1 ${className}`}
        onScroll={(e) => {
          if (
            document.activeElement &&
            (document.activeElement.closest(".grid-editable-cell") ||
              document.activeElement.closest("td"))
          ) {
            document.activeElement.blur();
          }
        }}
      >
        <table className={tableClassName}>
          <thead className={headClassName}>
            <tr>
              {columns.map((column) => {
                const isSticky = column.className?.includes("sticky");
                const hasTop = column.className?.includes("top-");
                const thClassName =
                  isSticky && !hasTop
                    ? `${column.className} top-0`
                    : column.className;
                return (
                  <th key={column.key} className={thClassName}>
                    {column.label}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className={bodyClassName}>
            {visibleRows.length === 0 && emptyState ? (
              <tr>
                <td colSpan={columns.length}>{emptyState}</td>
              </tr>
            ) : (
              visibleRows.map((row, index) => (
                <tr
                  key={getRowKey ? getRowKey(row, index) : index}
                  className={
                    getRowClassName ? getRowClassName(row, index) : undefined
                  }
                >
                  {renderRow(row, index)}
                </tr>
              ))
            )}
          </tbody>

          {footer ? (
            <tfoot className="sticky bottom-0 z-20 bg-slate-50 border-t border-slate-200/80">{footer}</tfoot>
          ) : null}
        </table>
      </div>
    </div>
  );
};

export default TransactionGrid;
