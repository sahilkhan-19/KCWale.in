import React from "react"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  trend?: string
  trendUp?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  iconColor = "text-primary",
  trend,
  trendUp,
}) => {
  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 flex items-start justify-between gap-4 hover:border-outline-variant/40 transition-colors">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-extrabold text-on-surface font-headline">{value}</p>
        {trend && (
          <p className={`text-[11px] font-bold ${trendUp ? "text-tertiary" : "text-error"}`}>
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-surface-container ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  )
}
