import React from "react"
import type { OrderStatus } from "../../services/admin.service"

const statusConfig: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending: { label: "Pending", bg: "bg-yellow-500/15", text: "text-yellow-400" },
  confirmed: { label: "Confirmed", bg: "bg-blue-500/15", text: "text-blue-400" },
  preparing: { label: "Preparing", bg: "bg-orange-500/15", text: "text-orange-400" },
  out_for_delivery: { label: "Out for Delivery", bg: "bg-purple-500/15", text: "text-purple-400" },
  delivered: { label: "Delivered", bg: "bg-emerald-500/15", text: "text-emerald-400" },
  cancelled: { label: "Cancelled", bg: "bg-red-500/15", text: "text-red-400" },
}

interface StatusBadgeProps {
  status: OrderStatus
  size?: "sm" | "md"
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "sm" }) => {
  const config = statusConfig[status] || statusConfig.pending

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${config.bg} ${config.text} ${
        size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.text} bg-current`}></span>
      {config.label}
    </span>
  )
}

// Payment status badge
const paymentConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Pending", bg: "bg-yellow-500/15", text: "text-yellow-400" },
  confirmed: { label: "Confirmed", bg: "bg-emerald-500/15", text: "text-emerald-400" },
  paid: { label: "Confirmed", bg: "bg-emerald-500/15", text: "text-emerald-400" },
  failed: { label: "Failed", bg: "bg-red-500/15", text: "text-red-400" },
}

interface PaymentBadgeProps {
  status: string
}

export const PaymentBadge: React.FC<PaymentBadgeProps> = ({ status }) => {
  const config = paymentConfig[status] || paymentConfig.pending
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}
