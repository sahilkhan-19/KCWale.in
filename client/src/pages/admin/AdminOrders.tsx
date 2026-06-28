import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  Search,
  ShoppingCart,
  Calendar,
  User,
  MapPin,
  ChevronRight,
  Filter,
  RefreshCw,
  Eye,
} from "lucide-react"
import { adminService } from "../../services/admin.service"
import type { OrderStatus } from "../../services/admin.service"
import { StatusBadge, PaymentBadge } from "../../components/admin/StatusBadge"
import { Pagination } from "../../components/admin/Pagination"
import { EmptyState } from "../../components/admin/EmptyState"
import { SearchBar } from "../../components/admin/SearchBar"
import { Button } from "../../components/ui/button"
import { toast } from "sonner"

export const AdminOrders: React.FC = () => {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch orders
  const { data: ordersData, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["adminOrders", statusFilter, currentPage],
    queryFn: () =>
      adminService.getAllOrders({
        status: statusFilter === "all" ? undefined : statusFilter,
        page: currentPage,
        limit: 10,
      }),
  })

  // Mutation to update order status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      adminService.updateOrderStatus(id, status),
    onSuccess: (updatedOrder) => {
      toast.success(`Order #${updatedOrder._id.substring(updatedOrder._id.length - 6).toUpperCase()} updated to ${updatedOrder.status}`)
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] })
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] })
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update order status")
    },
  })

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateStatusMutation.mutate({ id: orderId, status })
  }

  // Client side filtering for search
  const orders = ordersData?.orders || []
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true
    const term = searchQuery.toLowerCase()
    const matchId = order._id.toLowerCase().includes(term)
    const matchName = order.user?.name?.toLowerCase().includes(term)
    const matchPhone = order.user?.phone?.toLowerCase().includes(term)
    return matchId || matchName || matchPhone
  })

  const totalPages = ordersData?.pagination?.pages || 1

  const tabs: { label: string; value: string }[] = [
    { label: "All Orders", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Preparing", value: "preparing" },
    { label: "Out for Delivery", value: "out_for_delivery" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ]

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Orders Management</h1>
          <p className="text-sm text-on-surface-variant">View and process customer orders</p>
        </div>
        <Button
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["adminOrders"] })}
          className="border-border hover:bg-surface-container flex items-center gap-2 self-start sm:self-auto text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Orders
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value)
              setCurrentPage(1)
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
              statusFilter === tab.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-surface-container-low text-on-surface-variant hover:text-on-surface border-outline-variant/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            placeholder="Search by ID, name, or phone number..."
          />
        </div>
        <div className="text-xs text-on-surface-variant flex items-center gap-1.5 self-end md:self-auto font-medium">
          <Filter className="w-3.5 h-3.5" />
          Showing {filteredOrders.length} of {ordersData?.orderCount || 0} orders
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-surface-container rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <EmptyState
              title="No Orders Found"
              description={
                searchQuery
                  ? `No orders matching "${searchQuery}"`
                  : `There are no ${statusFilter !== "all" ? statusFilter : ""} orders right now.`
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-outline-variant/10">
                <thead>
                  <tr className="text-left text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Order Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm text-on-surface">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-surface-container/30 transition-colors align-top">
                      {/* Order ID */}
                      <td className="py-4 px-4">
                        <Link to={`/admin/orders/${order._id}`} className="font-mono text-xs font-bold text-primary hover:underline block">
                          #{order._id.substring(order._id.length - 6).toUpperCase()}
                        </Link>
                        <span className="text-[10px] text-on-surface-variant block mt-0.5 font-sans capitalize">
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs text-on-surface-variant whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] pl-4 mt-0.5">
                          {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-xs md:text-sm">{order.user?.name || "Guest"}</div>
                        <div className="text-[10px] text-on-surface-variant font-medium">{order.user?.phone || "No phone"}</div>
                      </td>

                      {/* Items Preview */}
                      <td className="py-4 px-4 max-w-xs truncate">
                        <div className="space-y-0.5">
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="text-xs font-medium text-on-surface-variant truncate">
                              {item.name} <span className="text-primary font-bold">x{item.quantity}</span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-[10px] font-semibold text-primary">
                              + {order.items.length - 2} more items
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 font-extrabold text-xs md:text-sm text-primary whitespace-nowrap">
                        ₹{order.totalAmount}
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <PaymentBadge status={order.paymentStatus} />
                      </td>

                      {/* Order Status & Direct Toggle */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5">
                          <StatusBadge status={order.status} />
                          <select
                            value={order.status}
                            disabled={updateStatusMutation.isPending}
                            onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                            className="text-[10px] font-bold border border-outline-variant/30 bg-surface-container rounded px-2 py-1 focus:outline-none focus:border-primary text-on-surface"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <Link to={`/admin/orders/${order._id}`}>
                          <Button size="sm" variant="outline" className="h-8 border-border hover:bg-surface-container flex items-center gap-1 text-xs">
                            <Eye className="w-3.5 h-3.5" />
                            Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-outline-variant/10">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
