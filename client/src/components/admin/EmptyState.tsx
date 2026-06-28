import React from "react"
import { PackageOpen } from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data found",
  description = "There's nothing to display here yet.",
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant border border-outline-variant/20">
        <PackageOpen className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-on-surface">{title}</h3>
        <p className="text-sm text-on-surface-variant max-w-sm">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2 rounded-full text-xs shadow-lg shadow-primary/10 active:scale-95 transition-transform"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
