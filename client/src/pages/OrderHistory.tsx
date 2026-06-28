import React from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { orderService } from "../services/order.service"
import { Loader2, ReceiptText, ChevronRight, Clock } from "lucide-react"

export const OrderHistory: React.FC = () => {
  const navigate = useNavigate()

  // Fetch all orders of logged in user
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderService.getOrders(),
  })

  const orders = ordersData?.orders || []

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
      case "cancelled":
        return "bg-red-500/10 border-red-500/25 text-red-400"
      case "preparing":
      case "out_for_delivery":
        return "bg-primary/10 border-primary/25 text-primary"
      default:
        return "bg-yellow-500/10 border-yellow-500/25 text-yellow-400"
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ")
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-background">Your Orders</h1>
        <p className="text-on-surface-variant text-xs md:text-sm mt-0.5">
          Review your previous premium dining selections from KCWALE.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-low rounded-3xl border border-outline-variant/20 space-y-4">
          <ReceiptText className="w-12 h-12 text-on-surface-variant/50 mx-auto" />
          <p className="text-on-surface-variant text-sm font-semibold">You haven't placed any orders yet.</p>
          <button
            onClick={() => navigate("/menu")}
            className="bg-primary hover:bg-primary/95 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-lg active:scale-95 transition-transform"
          >
            Explore Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              onClick={() => navigate(`/order-tracking/${order._id}`)}
              className="border border-outline-variant/30 bg-surface-container-low p-5 rounded-2xl hover:bg-surface-container transition-colors duration-200 cursor-pointer shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-on-surface select-all">#{order._id.substring(18)}</span>
                  <span className="text-[10px] text-on-surface-variant font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-on-surface-variant/90 font-medium">
                  {order.items.map((item) => `${item.name} (${item.quantity}x)`).join(", ")}
                </div>
                <div className="text-sm font-extrabold text-on-surface">₹{order.totalAmount}</div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-outline-variant/20 pt-2 sm:pt-0">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border rounded-full capitalize ${getStatusBadgeClass(
                    order.status
                  )}`}
                >
                  {formatStatus(order.status)}
                </span>
                <ChevronRight className="w-5 h-5 text-on-surface-variant hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
