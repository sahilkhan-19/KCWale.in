import React, { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { orderService } from "../services/order.service"
import type { OrderStatus } from "../services/order.service"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Clock, Check, XCircle, MapPin, ReceiptText } from "lucide-react"

export const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch single order details
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.getSingleOrder(id || ""),
    enabled: !!id,
    refetchInterval: 10000, // Poll every 10 seconds to get live status updates
  })

  // Mutation to cancel order
  const cancelOrderMutation = useMutation({
    mutationFn: () => orderService.cancelOrder(id || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Order cancelled successfully")
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to cancel order")
    },
  })

  const handleCancelOrder = () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      cancelOrderMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <p className="text-error font-bold text-sm font-body">Order not found or invalid ID.</p>
        <button onClick={() => navigate("/orders")} className="text-primary font-bold hover:underline text-xs mt-2">
          Back to Orders
        </button>
      </div>
    )
  }

  const steps: { label: string; status: OrderStatus; desc: string }[] = [
    { label: "Placed", status: "pending", desc: "We have received your order details." },
    { label: "Confirmed", status: "confirmed", desc: "Our cloud kitchen has accepted your order." },
    { label: "Preparing", status: "preparing", desc: "Our chefs are preparing your order fresh." },
    {
      label: "Out for Delivery",
      status: "out_for_delivery",
      desc: "Our delivery executive is bringing your food hot.",
    },
    { label: "Delivered", status: "delivered", desc: "Food is delivered. Enjoy your hot premium meal!" },
  ]

  const getStatusIndex = (currentStatus: OrderStatus) => {
    if (currentStatus === "cancelled") return -1
    return steps.findIndex((step) => step.status === currentStatus)
  }

  const currentStepIndex = getStatusIndex(order.status)

  const isStepActive = (index: number) => {
    if (order.status === "cancelled") return false
    return index <= currentStepIndex
  }

  const isStepCurrent = (index: number) => {
    if (order.status === "cancelled") return false
    return index === currentStepIndex
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <header className="flex items-center gap-4 py-2 border-b border-outline-variant/30">
        <button
          onClick={() => navigate("/orders")}
          className="p-2 hover:bg-surface-container rounded-full text-on-surface transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-headline text-xl font-bold text-on-background">Track Order</h1>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider select-all">
            Order #{order._id}
          </p>
        </div>
      </header>

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-xs text-left">
            <p className="text-on-surface-variant font-bold uppercase tracking-wider">Estimated Time</p>
            <p className="text-sm font-extrabold text-on-surface mt-0.5">
              {order.status === "delivered"
                ? "Delivered"
                : order.estimatedDuration
                ? `${order.estimatedDuration} - ${order.estimatedDuration + 7} mins`
                : "25 - 35 mins"}
            </p>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
            <Check className="w-5 h-5" />
          </div>
          <div className="text-xs text-left">
            <p className="text-on-surface-variant font-bold uppercase tracking-wider">Total Bill</p>
            <p className="text-sm font-extrabold text-on-surface mt-0.5">₹{order.totalAmount}</p>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <ReceiptText className="w-5 h-5" />
          </div>
          <div className="text-xs text-left">
            <p className="text-on-surface-variant font-bold uppercase tracking-wider">Payment Status</p>
            <p className="text-sm font-extrabold text-on-surface mt-0.5 capitalize">{order.paymentStatus}</p>
          </div>
        </div>
      </div>

      {/* Status Stepper */}
      <section className="border border-outline-variant/30 bg-surface-container-low p-6 rounded-2xl shadow-lg">
        {order.status === "cancelled" ? (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            <XCircle className="w-6 h-6 shrink-0" />
            <div className="text-xs text-left">
              <p className="font-bold text-sm">Order Cancelled</p>
              <p className="mt-0.5">This order has been cancelled and won't be processed further.</p>
            </div>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 border-l-2 border-outline-variant/30 ml-4 py-2">
            {steps.map((step, idx) => {
              const active = isStepActive(idx)
              const current = isStepCurrent(idx)

              return (
                <div key={idx} className="relative">
                  {/* Circle Indicator */}
                  <span
                    className={`absolute -left-10 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 text-xs font-bold ${
                      active
                        ? "border-primary bg-primary text-white scale-110"
                        : "border-outline-variant/40 bg-surface-container-low text-on-surface-variant"
                    }`}
                  >
                    {active ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </span>

                  {/* Step Label and Details */}
                  <div className="space-y-0.5 text-left">
                    <h3
                      className={`text-sm font-extrabold transition-colors duration-300 ${
                        current ? "text-primary text-base" : active ? "text-on-surface" : "text-on-surface-variant/60"
                      }`}
                    >
                      {step.label}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed transition-colors duration-300 ${
                        active ? "text-on-surface-variant" : "text-on-surface-variant/40"
                      }`}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Delivery Address & Details Summary */}
      <section className="border border-outline-variant/30 bg-surface-container-low p-6 rounded-2xl shadow-lg space-y-4 text-xs font-semibold text-on-surface-variant">
        <div className="flex gap-2">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <div className="text-left">
            <p className="font-bold text-on-surface text-sm mb-1">Delivered to</p>
            <p className="leading-relaxed text-on-surface">
              {order.deliveryAddress.house}, {order.deliveryAddress.apartment ? `${order.deliveryAddress.apartment}, ` : ""}
              {order.deliveryAddress.street}, {order.deliveryAddress.landmark ? `Landmark: ${order.deliveryAddress.landmark}, ` : ""}
              {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
            </p>
            {order.distanceInKm !== undefined && order.deliveryCharge !== undefined && (
              <div className="mt-2 text-xs font-bold text-primary flex gap-4">
                <span>Distance: {order.distanceInKm.toFixed(1)} km</span>
                <span>•</span>
                <span>Delivery Charge: ₹{order.deliveryCharge}</span>
              </div>
            )}
          </div>
        </div>

        <hr className="border-outline-variant/20" />

        <div className="space-y-2">
          <p className="font-bold text-on-surface text-sm mb-2">Order Items Summary</p>
          {order.items.map((item) => (
            <div key={item._id} className="space-y-0.5 border-b border-outline-variant/10 pb-2 last:border-0 last:pb-0">
              <div className="flex justify-between text-on-surface-variant">
                <span>
                  {item.name} <span className="text-[10px] text-on-surface-variant/80">({item.quantity}x)</span>
                </span>
                <span className="text-on-surface">₹{item.price * item.quantity}</span>
              </div>
              {item.selectedAddon && (
                <p className="text-[10px] text-primary font-bold">
                  + {item.selectedAddon.name} (+₹{item.selectedAddon.price})
                </p>
              )}
            </div>
          ))}
          <div className="border-t border-outline-variant/30 pt-2 flex justify-between text-sm font-bold text-on-surface">
            <span>Bill Amount</span>
            <span className="text-primary">₹{order.totalAmount}</span>
          </div>
        </div>
      </section>

      {/* Cancellation control */}
      {order.status !== "delivered" && order.status !== "cancelled" && (
        <button
          onClick={handleCancelOrder}
          disabled={cancelOrderMutation.isPending}
          className="w-full bg-surface-container-low hover:bg-red-500/10 border border-red-500/30 hover:border-red-500/50 text-red-400 font-bold py-3 rounded-xl transition-all duration-300 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
        >
          {cancelOrderMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Cancel Order"
          )}
        </button>
      )}
    </div>
  )
}
