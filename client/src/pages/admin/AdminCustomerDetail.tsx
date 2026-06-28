import React from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Globe,
  Key,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { adminService } from "../../services/admin.service"
import { StatusBadge } from "../../components/admin/StatusBadge"
import { EmptyState } from "../../components/admin/EmptyState"
import { Button } from "../../components/ui/button"

export const AdminCustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Fetch single user details
  const { data: customer, isLoading: isLoadingCustomer, error: customerError } = useQuery({
    queryKey: ["adminCustomerDetail", id],
    queryFn: () => adminService.getSingleUser(id!),
    enabled: !!id,
  })

  // Fetch all orders to filter client-side for this customer's orders
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["adminAllOrdersForCustomer", id],
    queryFn: () => adminService.getAllOrders({ limit: 100 }), // Fetch larger batch to extract user orders
    enabled: !!id,
  })

  const customerOrders = React.useMemo(() => {
    if (!ordersData?.orders || !id) return []
    return ordersData.orders.filter((order) => order.user?._id === id)
  }, [ordersData, id])

  const isLoading = isLoadingCustomer || isLoadingOrders

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-surface-container rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 bg-surface-container rounded-2xl"></div>
          <div className="md:col-span-2 h-96 bg-surface-container rounded-2xl"></div>
        </div>
      </div>
    )
  }

  if (customerError || !customer) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
        <AlertCircle className="w-12 h-12 text-error mb-2" />
        <p className="text-error font-semibold text-lg mb-2">Customer Not Found</p>
        <p className="text-on-surface-variant text-sm max-w-sm mb-4">
          The user account you are looking for does not exist or has been deleted.
        </p>
        <Button onClick={() => navigate("/admin/customers")} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </Button>
      </div>
    )
  }

  const initials = customer.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "U"

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/admin/customers")}
          className="border-border hover:bg-surface-container h-9 w-9 rounded-full text-on-surface"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">Customer Details</h1>
          <p className="text-xs text-on-surface-variant">Inspect profile parameters and history for this user</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Customer Profile Summary */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-6 self-start">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-2xl overflow-hidden shrink-0">
              {customer.avatar ? (
                <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">{customer.name}</h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase mt-1.5 ${
                  customer.role === "admin"
                    ? "bg-red-500/15 text-red-400 border border-red-500/10"
                    : "bg-blue-500/15 text-blue-400 border border-blue-500/10"
                }`}
              >
                {customer.role === "admin" && <Shield className="w-2.5 h-2.5" />}
                {customer.role}
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-outline-variant/10 text-xs text-on-surface">
            {/* Contact */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-on-surface-variant mt-0.5" />
                <div>
                  <p className="font-semibold text-on-surface-variant">Email</p>
                  <p className="font-bold truncate max-w-[200px]">{customer.email}</p>
                  <span className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded ${customer.isEmailVerified ? "bg-emerald-500/15 text-emerald-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                    {customer.isEmailVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-on-surface-variant mt-0.5" />
                <div>
                  <p className="font-semibold text-on-surface-variant">Phone</p>
                  <p className="font-bold">{customer.phone || "No phone listed"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-on-surface-variant mt-0.5" />
                <div>
                  <p className="font-semibold text-on-surface-variant">Saved Address</p>
                  <p className="font-medium text-xs text-on-surface leading-relaxed whitespace-pre-wrap">
                    {customer.address || "No saved address found"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-outline-variant/10">
                <Calendar className="w-4 h-4 text-on-surface-variant mt-0.5" />
                <div>
                  <p className="font-semibold text-on-surface-variant">Joined Date</p>
                  <p className="font-bold">
                    {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {customer.authProvider === "google" ? (
                  <Globe className="w-4 h-4 text-blue-400 mt-0.5" />
                ) : (
                  <Key className="w-4 h-4 text-yellow-400 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold text-on-surface-variant">Authentication Provider</p>
                  <p className="font-bold capitalize">{customer.authProvider} Provider</p>
                  {customer.googleId && (
                    <p className="text-[9px] font-mono text-on-surface-variant mt-0.5">Google ID: {customer.googleId}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Order History */}
        <div className="lg:col-span-2 bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Order History
            </h2>
            <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
              {customerOrders.length} Orders
            </span>
          </div>

          {customerOrders.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="No Orders Found"
                description="This customer hasn't placed any orders yet."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-outline-variant/10">
                <thead>
                  <tr className="text-left text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm text-on-surface">
                  {customerOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-surface-container/30 transition-colors align-middle">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-primary">
                        <Link to={`/admin/orders/${order._id}`} className="hover:underline">
                          #{order._id.substring(order._id.length - 6).toUpperCase()}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-xs text-on-surface-variant whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold max-w-xs truncate text-on-surface-variant">
                        {order.items.map((item) => `${item.name} (x${item.quantity})`).join(", ")}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-xs md:text-sm text-primary">
                        ₹{order.totalAmount}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link to={`/admin/orders/${order._id}`}>
                          <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-primary hover:bg-primary/10">
                            View Order
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
