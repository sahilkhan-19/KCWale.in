import React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useQuery } from "@tanstack/react-query"
import { cartService } from "../services/cart.service"
import { ShoppingBag, MapPin, User, LogOut } from "lucide-react"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Query cart to display real-time badge count
  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: cartService.getCart,
    enabled: isAuthenticated,
  })

  const cartItemCount = cartData?.cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  const activeClass = "text-primary font-bold transition-colors"
  const inactiveClass = "text-on-surface-variant hover:text-primary transition-colors font-medium"

  return (
    <header className="bg-background/85 backdrop-blur-md sticky top-0 w-full z-50 border-b border-outline-variant/30">
      <div className="flex justify-between items-center px-6 py-3 max-w-container-max mx-auto h-16 md:h-20">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 select-none">
            <img
              src="/logo.png"
              alt="KC Wale Logo"
              className="w-10 h-10 object-contain rounded-lg shadow-sm shadow-black/10 border border-outline-variant/20 bg-white"
            />
            <span className="font-headline text-xl font-light tracking-[0.2em] text-on-background uppercase select-none">
              KC WALE
            </span>
          </Link>

          {/* Web Navigation */}
          <nav className="hidden md:flex items-center gap-8 ml-8">
            <Link to="/" className={location.pathname === "/" ? activeClass : inactiveClass}>
              Home
            </Link>
            <Link to="/menu" className={location.pathname === "/menu" ? activeClass : inactiveClass}>
              Menu
            </Link>
            <Link to="/orders" className={location.pathname === "/orders" ? activeClass : inactiveClass}>
              Orders
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin" className="text-primary hover:text-primary/80 transition-colors font-bold">
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low text-body-sm border border-outline-variant/20">
            <MapPin className="text-primary w-4 h-4" />
            <span className="text-xs text-on-surface-variant">
              Deliver to <span className="font-bold text-on-surface">Home</span>
            </span>
          </div>

          <div className="w-[1px] h-6 bg-outline-variant/30 hidden sm:block"></div>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant">
                  <User className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-surface-container border-outline-variant/30 text-on-surface">
                <DropdownMenuItem className="font-bold border-b border-outline-variant/20 py-2">
                  Hi, {user?.name}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/orders")} className="cursor-pointer py-2">
                  My Orders
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer py-2 font-bold text-primary border-t border-outline-variant/10">
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-error hover:text-error py-2 flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" className="text-on-surface-variant hover:text-primary" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}

          <Button
            onClick={() => navigate("/cart")}
            className="bg-primary text-white hover:bg-primary/90 px-5 py-2 rounded-full flex items-center gap-2 font-body font-bold text-sm shadow-lg shadow-primary/10 active:scale-95 transition-transform"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartItemCount > 0 && (
              <span className="bg-white text-primary text-[11px] font-extrabold w-5 h-5 flex items-center justify-center rounded-full ml-1">
                {cartItemCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
