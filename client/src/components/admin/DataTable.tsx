import React from "react"

interface Column<T> {
  header: string
  accessor: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  emptyState?: React.ReactNode
}

export function DataTable<T>({ data, columns, isLoading, emptyState }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full space-y-3 p-4 animate-pulse">
        <div className="h-10 bg-surface-container rounded-lg w-full"></div>
        <div className="h-10 bg-surface-container rounded-lg w-full"></div>
        <div className="h-10 bg-surface-container rounded-lg w-full"></div>
      </div>
    )
  }

  if (data.length === 0) {
    return <div className="p-8 text-center">{emptyState}</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-outline-variant/10">
        <thead>
          <tr className="text-left text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">
            {columns.map((col, index) => (
              <th key={index} className={`py-3 px-4 ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10 text-sm text-on-surface">
          {data.map((item, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-surface-container/30 transition-colors align-middle">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={`py-3.5 px-4 ${col.className || ""}`}>
                  {col.accessor(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
