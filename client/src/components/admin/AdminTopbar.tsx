import React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Menu, User, LogOut, Store } from "lucide-react"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet"

const mobileNavItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/customers", icon: Users, label: "Customers" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
]

interface AdminTopbarProps {
  onMobileMenuToggle?: () => void
}

export const AdminTopbar: React.FC<AdminTopbarProps> = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="h-14 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/20 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      {/* Left: Mobile Hamburger + Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="lg:hidden p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-surface-container-lowest border-outline-variant/20 w-[260px] p-0">
            <SheetHeader className="px-4 h-14 flex flex-row items-center gap-3 border-b border-outline-variant/20">
              <img
                src="/logo.png"
                alt="KC Wale"
                className="w-8 h-8 object-contain rounded-lg border border-outline-variant/20 bg-white"
              />
              <SheetTitle className="font-headline text-sm font-light tracking-[0.15em] text-on-background uppercase">
                KC WALE
              </SheetTitle>
            </SheetHeader>
            <nav className="py-4 px-2 space-y-1">
              {mobileNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-outline-variant/20 space-y-1">
              <button
                onClick={() => { setMobileOpen(false); navigate("/") }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <Store className="w-5 h-5" />
                <span>Back to Store</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error/80 hover:bg-error/10 hover:text-error transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="font-headline text-base font-bold text-on-background">Admin Panel</h1>
      </div>

      {/* Right: Profile */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-surface-container transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-extrabold">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-surface-container border-outline-variant/30 text-on-surface w-48">
            <DropdownMenuItem className="font-bold border-b border-outline-variant/20 py-2">
              {user?.name}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/")} className="cursor-pointer py-2 flex items-center gap-2">
              <Store className="w-4 h-4" />
              Back to Store
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/admin/settings")} className="cursor-pointer py-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-error hover:text-error py-2 flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
