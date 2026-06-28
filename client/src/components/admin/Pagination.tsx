import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const pages: (number | string)[] = []
    const delta = 1

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...")
      }
    }
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getVisiblePages().map((page, idx) =>
        typeof page === "string" ? (
          <span key={`dots-${idx}`} className="px-2 text-on-surface-variant text-xs">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[32px] h-8 rounded-lg text-xs font-bold transition-colors ${
              page === currentPage
                ? "bg-primary text-white"
                : "hover:bg-surface-container text-on-surface-variant"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
