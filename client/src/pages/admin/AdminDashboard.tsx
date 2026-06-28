import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  Users,
  ShoppingCart,
  Package,
  IndianRupee,
  Clock,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react"
import { adminService } from "../../services/admin.service"
import { StatCard } from "../../components/admin/StatCard"
import { StatusBadge } from "../../components/admin/StatusBadge"
import { EmptyState } from "../../components/admin/EmptyState"
import { Button } from "../../components/ui/button"

export const AdminDashboard: React.FC = () => {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: adminService.getDashboardStats,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  })

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Welcome Shimmer */}
        <div className="h-28 bg-surface-container rounded-3xl w-full"></div>

        {/* Stats Shimmer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface-container rounded-2xl"></div>
          ))}
        </div>

        {/* Tables Shimmer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-surface-container rounded-2xl"></div>
          <div className="h-96 bg-surface-container rounded-2xl"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
        <p className="text-error font-semibold text-lg mb-2">Failed to load dashboard data</p>
        <p className="text-on-surface-variant text-sm max-w-sm mb-4">
          Please check your connection and ensure you are logged in as an administrator.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  const stats = dashboardData?.stats
  const recentOrders = dashboardData?.recentOrders || []

  const statItems = [
    {
      label: "Total Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      iconColor: "text-emerald-400",
      trend: "Real-time earnings",
      trendUp: true,
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      iconColor: "text-primary",
      trend: `${stats?.pending || 0} pending orders`,
      trendUp: (stats?.pending || 0) > 0,
    },
    {
      label: "Active Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      iconColor: "text-blue-400",
      trend: "Items in menu",
      trendUp: true,
    },
    {
      label: "Total Customers",
      value: stats?.totalUsers || 0,
      icon: Users,
      iconColor: "text-purple-400",
      trend: "Registered accounts",
      trendUp: true,
    },
  ]

  // Status breakdown list
  const statuses = [
    { key: "pending", label: "Pending", value: stats?.pending || 0, color: "bg-yellow-500", text: "text-yellow-400" },
    { key: "confirmed", label: "Confirmed", value: stats?.confirmed || 0, color: "bg-blue-500", text: "text-blue-400" },
    { key: "preparing", label: "Preparing", value: stats?.preparing || 0, color: "bg-orange-500", text: "text-orange-400" },
    { key: "out_for_delivery", label: "Out for Delivery", value: stats?.out_for_delivery || 0, color: "bg-purple-500", text: "text-purple-400" },
    { key: "delivered", label: "Delivered", value: stats?.delivered || 0, color: "bg-emerald-500", text: "text-emerald-400" },
    { key: "cancelled", label: "Cancelled", value: stats?.cancelled || 0, color: "bg-red-500", text: "text-red-400" },
  ]

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Admin Control Center
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
            Welcome back, Admin!
          </h1>
          <p className="text-on-surface-variant text-sm max-w-xl">
            Here's a quick overview of what's happening at KCWale today. Monitor sales, track order pipelines, and manage the menu effortlessly.
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
          <Link to="/admin/orders">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
              Manage Orders
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/admin/products/new">
            <Button variant="outline" className="border-border hover:bg-surface-container flex items-center gap-2">
              Add Product
            </Button>
          </Link>
        </div>
        {/* Decorative background element */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none translate-x-20 translate-y-20"></div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item, idx) => (
          <StatCard
            key={idx}
            label={item.label}
            value={item.value}
            icon={item.icon}
            iconColor={item.iconColor}
            trend={item.trend}
            trendUp={item.trendUp}
          />
        ))}
      </div>

      {/* Main Grid: Orders & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-on-surface">Recent Orders</h2>
              <p className="text-xs text-on-surface-variant">Latest orders from customers</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
              View All Orders
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto -mx-5">
            <div className="inline-block min-w-full align-middle px-5">
              <table className="min-w-full divide-y divide-outline-variant/10">
                <thead>
                  <tr className="text-left text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm text-on-surface">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8">
                        <EmptyState title="No Recent Orders" description="New orders will appear here automatically." />
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-surface-container/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold">
                          #{order._id.substring(order._id.length - 6).toUpperCase()}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-xs md:text-sm">{order.user?.name || "Guest"}</div>
                          <div className="text-[10px] text-on-surface-variant">{order.user?.phone || "No phone"}</div>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-xs md:text-sm text-primary">
                          ₹{order.totalAmount}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-3.5 px-4 text-xs text-on-surface-variant">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link to={`/admin/orders/${order._id}`}>
                            <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-primary hover:bg-primary/10">
                              Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Pipeline / Status Breakdown */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 flex flex-col space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-on-surface">Order Pipeline</h2>
            <p className="text-xs text-on-surface-variant">Real-time status breakdown</p>
          </div>

          <div className="space-y-4">
            {statuses.map((status) => {
              const maxCount = Math.max(...statuses.map((s) => s.value), 1)
              const percentage = Math.round((status.value / maxCount) * 100)

              return (
                <div key={status.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${status.color}`}></span>
                      {status.label}
                    </span>
                    <span className={status.text}>{status.value}</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${status.color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs text-on-surface-variant">
              <span>Auto-refresh Active</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Every 30s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
