import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  PackageOpen,
  XCircle,
} from "lucide-react"
import { adminService } from "../../services/admin.service"
import type { OrderStatus } from "../../services/admin.service"
import { StatusBadge, PaymentBadge } from "../../components/admin/StatusBadge"
import { Button } from "../../components/ui/button"
import { toast } from "sonner"

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["adminOrderDetail", id],
    queryFn: () => adminService.getOrderById(id!),
    enabled: !!id,
  })

  const updateStatusMutation = useMutation({
    mutationFn: (status: OrderStatus) => adminService.updateOrderStatus(id!, status),
    onSuccess: (updatedOrder) => {
      toast.success(`Order status updated to ${updatedOrder.status}`)
      queryClient.invalidateQueries({ queryKey: ["adminOrderDetail", id] })
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] })
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update order status")
    },
  })

  const updatePaymentStatusMutation = useMutation({
    mutationFn: (paymentStatus: "pending" | "confirmed" | "failed" | "paid") =>
      adminService.updateOrderPaymentStatus(id!, paymentStatus),
    onSuccess: (updatedOrder) => {
      toast.success(`Payment status updated to ${updatedOrder.paymentStatus}`)
      queryClient.invalidateQueries({ queryKey: ["adminOrderDetail", id] })
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] })
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update payment status")
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-surface-container rounded w-1/4"></div>
        <div className="h-40 bg-surface-container rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-96 bg-surface-container rounded-2xl"></div>
          <div className="h-96 bg-surface-container rounded-2xl"></div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
        <p className="text-error font-semibold text-lg mb-2">Order Not Found</p>
        <p className="text-on-surface-variant text-sm max-w-sm mb-4">
          The order you are looking for does not exist or you do not have permission to view it.
        </p>
        <Button onClick={() => navigate("/admin/orders")} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Button>
      </div>
    )
  }

  const handleStatusChange = (status: OrderStatus) => {
    updateStatusMutation.mutate(status)
  }

  const handlePaymentStatusChange = (paymentStatus: "pending" | "confirmed" | "failed" | "paid") => {
    updatePaymentStatusMutation.mutate(paymentStatus)
  }

  // Timeline helper
  const timelineSteps = [
    { label: "Pending", status: "pending", icon: Clock, desc: "Order submitted by customer" },
    { label: "Confirmed", status: "confirmed", icon: CheckCircle, desc: "Order accepted by kitchen" },
    { label: "Preparing", status: "preparing", icon: ShoppingBag, desc: "Food is being freshly prepared" },
    { label: "Out for Delivery", status: "out_for_delivery", icon: Truck, desc: "Assigned to delivery agent" },
    { label: "Delivered", status: "delivered", icon: PackageOpen, desc: "Delivered to customer" },
  ]

  const getCurrentStepIndex = () => {
    if (order.status === "cancelled") return -1
    return timelineSteps.findIndex((step) => step.status === order.status)
  }

  const currentStepIdx = getCurrentStepIndex()

  return (
    <div className="space-y-6 pb-16">
      {/* Header Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/admin/orders")}
            className="border-border hover:bg-surface-container h-9 w-9 rounded-full text-on-surface"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-on-surface">
                Order #{order._id.substring(order._id.length - 6).toUpperCase()}
              </h1>
              <StatusBadge status={order.status} size="md" />
            </div>
            <p className="text-xs text-on-surface-variant flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Placed on {new Date(order.createdAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Order Invoice & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items invoice card */}
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-4">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/10 pb-3">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Order Items ({order.items.reduce((acc, it) => acc + it.quantity, 0)})
            </h2>

            {/* List */}
            <div className="divide-y divide-outline-variant/10">
              {order.items.map((item) => (
                <div key={item._id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center border border-outline-variant/10 overflow-hidden">
                      {item.product?.images && item.product.images[0] ? (
                        <img src={item.product.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-outline" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">{item.name}</h4>
                      <p className="text-xs text-on-surface-variant">
                        ₹{item.price} x {item.quantity}
                      </p>
                      {item.selectedAddon && (
                        <p className="text-[10px] text-primary font-bold mt-0.5">
                          + {item.selectedAddon.name} (+₹{item.selectedAddon.price})
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-primary">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Invoice total */}
            {(() => {
              const subtotal = order.items.reduce((acc, it) => acc + it.price * it.quantity, 0)
              const taxes = Number((subtotal * 0.05).toFixed(2))
              return (
                <div className="border-t border-outline-variant/10 pt-4 space-y-2 max-w-xs ml-auto text-left">
                  <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                    <span>Delivery Charge</span>
                    <span className="text-on-surface">
                      ₹{order.deliveryCharge ?? 40}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                    <span>Taxes & Charges (5% GST)</span>
                    <span>₹{taxes}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-on-surface border-t border-outline-variant/10 pt-2">
                    <span>Grand Total</span>
                    <span className="text-primary">₹{order.totalAmount}</span>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Timeline Card */}
          {order.status !== "cancelled" && (
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-6">
              <h2 className="text-lg font-bold text-on-surface">Order Progress Timeline</h2>
              <div className="relative pl-6 border-l-2 border-outline-variant/20 space-y-6 ml-3">
                {timelineSteps.map((step, idx) => {
                  const IconComponent = step.icon
                  const isDone = idx <= currentStepIdx
                  const isCurrent = idx === currentStepIdx

                  return (
                    <div key={step.status} className="relative">
                      {/* Node Icon */}
                      <span
                        className={`absolute -left-[35px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isDone
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-surface-container border-outline-variant text-on-surface-variant"
                        } ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </span>
                      {/* Content */}
                      <div className="space-y-0.5">
                        <h4 className={`text-sm font-bold ${isDone ? "text-on-surface" : "text-on-surface-variant/60"}`}>
                          {step.label}
                        </h4>
                        <p className={`text-xs ${isDone ? "text-on-surface-variant" : "text-on-surface-variant/40"}`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {order.status === "cancelled" && (
            <div className="bg-error/10 border border-error/20 rounded-2xl p-5 md:p-6 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-error/15 text-error">
                <XCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-error">Order Cancelled</h3>
                <p className="text-xs text-on-surface-variant">
                  This order was cancelled by either the customer or the kitchen. No further updates are permitted.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Customer Info & Status Updator */}
        <div className="space-y-6">
          {/* Status Updator Card */}
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-4">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Update Order Status
            </h2>
            <p className="text-xs text-on-surface-variant">
              Manage order preparation and delivery steps.
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant">Current Status: <span className="capitalize text-primary">{order.status}</span></label>
              <select
                value={order.status}
                disabled={updateStatusMutation.isPending}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                className="w-full text-xs font-bold border border-outline-variant/30 bg-surface-container rounded-xl p-3 focus:outline-none focus:border-primary text-on-surface"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Quick Status Buttons */}
            {order.status !== "cancelled" && order.status !== "delivered" && (
              <div className="space-y-2 pt-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Quick Next Steps</p>
                {order.status === "pending" && (
                  <Button
                    onClick={() => handleStatusChange("confirmed")}
                    disabled={updateStatusMutation.isPending}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold"
                  >
                    Confirm Order
                  </Button>
                )}
                {order.status === "confirmed" && (
                  <Button
                    onClick={() => handleStatusChange("preparing")}
                    disabled={updateStatusMutation.isPending}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                  >
                    Start Preparing
                  </Button>
                )}
                {order.status === "preparing" && (
                  <Button
                    onClick={() => handleStatusChange("out_for_delivery")}
                    disabled={updateStatusMutation.isPending}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold"
                  >
                    Dispatch for Delivery
                  </Button>
                )}
                {order.status === "out_for_delivery" && (
                  <Button
                    onClick={() => handleStatusChange("delivered")}
                    disabled={updateStatusMutation.isPending}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold"
                  >
                    Mark as Delivered
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Customer Details Card */}
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-4">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/10 pb-3">
              <User className="w-5 h-5 text-primary" />
              Customer Details
            </h2>

            <div className="space-y-3.5 text-xs text-on-surface">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-on-surface-variant mt-0.5" />
                <div>
                  <p className="font-semibold text-on-surface-variant">Name</p>
                  <p className="font-bold">{order.user?.name || "Guest"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-on-surface-variant mt-0.5" />
                <div>
                  <p className="font-semibold text-on-surface-variant">Phone</p>
                  <p className="font-bold">{order.user?.phone || "No phone listed"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-on-surface-variant mt-0.5" />
                <div>
                  <p className="font-semibold text-on-surface-variant">Email</p>
                  <p className="font-bold truncate max-w-[200px]">{order.user?.email || "No email"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-outline-variant/10">
                <MapPin className="w-4 h-4 text-on-surface-variant mt-0.5" />
                <div className="text-left w-full">
                  <p className="font-semibold text-on-surface-variant">Delivery Address</p>
                  <p className="font-medium text-xs text-on-surface leading-relaxed whitespace-pre-wrap">
                    {order.deliveryAddress ? (
                      <>
                        {order.deliveryAddress.house}, {order.deliveryAddress.apartment ? `${order.deliveryAddress.apartment}, ` : ""}
                        {order.deliveryAddress.street}, {order.deliveryAddress.landmark ? `Landmark: ${order.deliveryAddress.landmark}, ` : ""}
                        {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                      </>
                    ) : "No delivery address provided"}
                  </p>
                  <div className="mt-2 space-y-1.5 text-xs">
                    <p className="font-medium">
                      <span className="text-on-surface-variant font-semibold">Latitude:</span>{" "}
                      {order.deliveryLocation?.latitude !== undefined && order.deliveryLocation?.latitude !== null
                        ? order.deliveryLocation.latitude
                        : "Location unavailable"}
                    </p>
                    <p className="font-medium">
                      <span className="text-on-surface-variant font-semibold">Longitude:</span>{" "}
                      {order.deliveryLocation?.longitude !== undefined && order.deliveryLocation?.longitude !== null
                        ? order.deliveryLocation.longitude
                        : "Location unavailable"}
                    </p>
                    {order.deliveryLocation?.latitude !== undefined &&
                    order.deliveryLocation?.longitude !== undefined &&
                    order.deliveryLocation?.latitude !== null &&
                    order.deliveryLocation?.longitude !== null ? (
                      <a
                        href={`https://www.google.com/maps?q=${order.deliveryLocation.latitude},${order.deliveryLocation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-2 bg-primary text-white text-xs font-bold rounded-lg shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        📍 Get Location
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-2 bg-outline-variant/30 text-on-surface-variant/40 text-xs font-bold rounded-lg cursor-not-allowed"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        📍 Location unavailable
                      </button>
                    )}
                  </div>
                  {order.distanceInKm !== undefined && (
                    <p className="text-[10px] text-primary font-bold mt-2">
                      Distance: {order.distanceInKm.toFixed(1)} km
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Card */}
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-4">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/10 pb-3">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Info
            </h2>

            <div className="space-y-3.5 text-xs text-on-surface">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-on-surface-variant">Method</span>
                <span className="font-extrabold uppercase text-primary">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-on-surface-variant">Status</span>
                <PaymentBadge status={order.paymentStatus} />
              </div>
              <div className="flex flex-col gap-2 pt-3 border-t border-outline-variant/10">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Update Payment Status
                </label>
                <select
                  value={order.paymentStatus === "paid" ? "confirmed" : order.paymentStatus}
                  disabled={updatePaymentStatusMutation.isPending}
                  onChange={(e) => handlePaymentStatusChange(e.target.value as "pending" | "confirmed" | "failed")}
                  className="w-full text-xs font-bold border border-outline-variant/30 bg-surface-container rounded-xl p-2.5 focus:outline-none focus:border-primary text-on-surface"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="failed">Failed</option>
                </select>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={order.paymentStatus === "confirmed" || order.paymentStatus === "paid" || updatePaymentStatusMutation.isPending}
                    onClick={() => handlePaymentStatusChange("confirmed")}
                    className="h-9 border-outline-variant/40 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30 text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                  >
                    <span>✅ Mark as Confirmed</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={order.paymentStatus === "failed" || updatePaymentStatusMutation.isPending}
                    onClick={() => handlePaymentStatusChange("failed")}
                    className="h-9 border-outline-variant/40 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                  >
                    <span>❌ Mark as Failed</span>
                  </Button>
                </div>
              </div>
              {order.razorpayOrderId && (
                <div className="pt-2 border-t border-outline-variant/10 space-y-1.5 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Razorpay Order ID:</span>
                    <span className="font-semibold">{order.razorpayOrderId}</span>
                  </div>
                  {order.razorpayPaymentId && (
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Payment ID:</span>
                      <span className="font-semibold">{order.razorpayPaymentId}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
