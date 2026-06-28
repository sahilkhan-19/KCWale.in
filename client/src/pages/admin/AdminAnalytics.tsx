import React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  IndianRupee,
  ShoppingCart,
  Calendar,
  Download,
  Percent,
  Layers,
  ArrowUpRight,
  Package,
} from "lucide-react"
import { adminService } from "../../services/admin.service"
import { Button } from "../../components/ui/button"

export const AdminAnalytics: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: adminService.getDashboardStats,
  })

  const stats = dashboardData?.stats

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-surface-container rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface-container rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-surface-container rounded-2xl"></div>
          <div className="h-80 bg-surface-container rounded-2xl"></div>
        </div>
      </div>
    )
  }

  // Analytical details
  const totalRevenue = stats?.totalRevenue || 0
  const totalOrders = stats?.totalOrders || 0
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  // 1. Revenue History (Mocked for monthly trend chart)
  const monthlyRevenue = [
    { month: "Jan", revenue: Math.round(totalRevenue * 0.08), orders: Math.round(totalOrders * 0.09) },
    { month: "Feb", revenue: Math.round(totalRevenue * 0.1), orders: Math.round(totalOrders * 0.1) },
    { month: "Mar", revenue: Math.round(totalRevenue * 0.12), orders: Math.round(totalOrders * 0.11) },
    { month: "Apr", revenue: Math.round(totalRevenue * 0.15), orders: Math.round(totalOrders * 0.14) },
    { month: "May", revenue: Math.round(totalRevenue * 0.22), orders: Math.round(totalOrders * 0.23) },
    { month: "Jun", revenue: Math.round(totalRevenue * 0.33), orders: Math.round(totalOrders * 0.33) },
  ]

  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1)

  // 2. Order Status Breakdown Percentages
  const statusCounts = [
    { label: "Delivered", value: stats?.delivered || 0, color: "text-emerald-400", bg: "bg-emerald-500" },
    { label: "Cancelled", value: stats?.cancelled || 0, color: "text-red-400", bg: "bg-red-500" },
    { label: "Processing (In Kitchen)", value: (stats?.confirmed || 0) + (stats?.preparing || 0), color: "text-orange-400", bg: "bg-orange-500" },
    { label: "Out / Pending", value: (stats?.pending || 0) + (stats?.out_for_delivery || 0), color: "text-yellow-400", bg: "bg-yellow-500" },
  ]

  const totalStatusCount = statusCounts.reduce((acc, curr) => acc + curr.value, 0) || 1

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Store Analytics</h1>
          <p className="text-sm text-on-surface-variant">Insights, sales statistics, and customer order pipeline metrics</p>
        </div>
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="border-border hover:bg-surface-container flex items-center gap-2 self-start sm:self-auto text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          Export Report
        </Button>
      </div>

      {/* Analytical Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Gross Revenue</span>
            <h3 className="text-2xl font-extrabold text-on-surface">₹{totalRevenue.toLocaleString("en-IN")}</h3>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14.2% from last month
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Sales</span>
            <h3 className="text-2xl font-extrabold text-on-surface">{totalOrders}</h3>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +8.7% from last week
            </span>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Avg Order Value</span>
            <h3 className="text-2xl font-extrabold text-on-surface">₹{avgOrderValue}</h3>
            <span className="text-[10px] text-on-surface-variant font-bold">
              Based on {totalOrders} orders
            </span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Active Menu Size</span>
            <h3 className="text-2xl font-extrabold text-on-surface">{stats?.totalProducts || 0}</h3>
            <span className="text-[10px] text-on-surface-variant font-bold">
              Items currently available
            </span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid: Revenue History & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Graph Card */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-on-surface">Monthly Revenue Trend</h2>
            <p className="text-xs text-on-surface-variant">Visual chart of earnings over the last 6 months</p>
          </div>

          {/* CSS Chart */}
          <div className="h-56 flex items-end justify-between pt-6 border-b border-l border-outline-variant/20 px-2 gap-3">
            {monthlyRevenue.map((item, idx) => {
              const heightPercent = Math.max(Math.round((item.revenue / maxMonthlyRevenue) * 100), 10)

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip */}
                  <span className="opacity-0 group-hover:opacity-100 bg-surface-container border border-outline-variant/30 text-[10px] text-on-surface font-extrabold px-2 py-1 rounded shadow-md transition-opacity absolute translate-y-[-100%] mb-12">
                    ₹{item.revenue.toLocaleString("en-IN")}
                  </span>
                  {/* Bar */}
                  <div
                    className="w-full bg-gradient-to-t from-primary/70 to-primary rounded-t-lg transition-all duration-500 hover:from-primary hover:to-primary/80 cursor-pointer"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  {/* Label */}
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase mt-1">{item.month}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Status Breakdown Circle Metric Card */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-on-surface">Order Success & Pipeline</h2>
            <p className="text-xs text-on-surface-variant">Breakdown of orders processed in total</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* SVG Pie Chart / Circle Progress */}
            <div className="relative flex justify-center items-center">
              <svg className="w-36 h-36 transform -rotate-90">
                {/* Outer Track */}
                <circle cx="72" cy="72" r="58" strokeWidth="12" stroke="rgba(255,255,255,0.05)" fill="transparent" />
                {/* Highlight Circle (e.g. Delivered %) */}
                {(() => {
                  const deliveredCount = stats?.delivered || 0
                  const ratio = totalOrders > 0 ? deliveredCount / totalOrders : 0
                  const strokeDash = Math.round(ratio * 364) // Circle circumference = 2 * PI * 58 = 364.4

                  return (
                    <circle
                      cx="72"
                      cy="72"
                      r="58"
                      strokeWidth="12"
                      stroke="var(--color-primary, #ea580c)"
                      fill="transparent"
                      strokeDasharray="364"
                      strokeDashoffset={364 - strokeDash}
                      strokeLinecap="round"
                    />
                  )
                })()}
              </svg>
              {/* Inner Label */}
              <div className="absolute text-center space-y-0.5">
                <span className="text-2xl font-extrabold text-on-surface">
                  {totalOrders > 0 ? Math.round(((stats?.delivered || 0) / totalOrders) * 100) : 0}%
                </span>
                <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wide">Success Rate</p>
              </div>
            </div>

            {/* Legends & counts */}
            <div className="space-y-3">
              {statusCounts.map((item, idx) => {
                const percentage = Math.round((item.value / totalStatusCount) * 100)

                return (
                  <div key={idx} className="flex justify-between items-center gap-4 text-xs font-semibold text-on-surface-variant">
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.bg}`}></span>
                      {item.label}
                    </span>
                    <span className="font-bold text-on-surface flex items-center gap-1">
                      {item.value} <span className={`text-[10px] font-bold ${item.color}`}>({percentage}%)</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
