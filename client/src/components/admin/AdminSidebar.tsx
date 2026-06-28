import React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Store,
} from "lucide-react"

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/customers", icon: Users, label: "Customers" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
]

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onToggle }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen sticky top-0 bg-surface-container-lowest border-r border-outline-variant/20 transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[240px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-outline-variant/20 shrink-0">
        <img
          src="/logo.png"
          alt="KC Wale"
          className="w-9 h-9 object-contain rounded-lg border border-outline-variant/20 bg-white shrink-0"
        />
        {!collapsed && (
          <span className="font-headline text-sm font-light tracking-[0.15em] text-on-background uppercase whitespace-nowrap">
            KC WALE
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-outline-variant/20 space-y-1">
        <button
          onClick={() => navigate("/")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Store className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Back to Store</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error/80 hover:bg-error/10 hover:text-error transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="hidden lg:flex items-center justify-center h-10 border-t border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
      >
        <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
      </button>
    </aside>
  )
}
