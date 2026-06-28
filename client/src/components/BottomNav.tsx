import React from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, Search, ReceiptText, User } from "lucide-react"

export const BottomNav: React.FC = () => {
  const location = useLocation()

  const activeColor = "text-primary font-bold"
  const inactiveColor = "text-on-surface-variant hover:text-on-surface"

  const isLinkActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-surface-container-lowest border-t border-outline-variant/20 shadow-[0_-8px_30px_rgb(0,0,0,0.4)] h-16 pb-safe flex justify-around items-center rounded-t-xl">
      <Link
        to="/"
        className={`flex flex-col items-center justify-center flex-1 py-2 transition-transform active:scale-95 ${
          isLinkActive("/") ? activeColor : inactiveColor
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-1">Home</span>
      </Link>

      <Link
        to="/menu"
        className={`flex flex-col items-center justify-center flex-1 py-2 transition-transform active:scale-95 ${
          isLinkActive("/menu") ? activeColor : inactiveColor
        }`}
      >
        <Search className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-1">Menu</span>
      </Link>

      <Link
        to="/orders"
        className={`flex flex-col items-center justify-center flex-1 py-2 transition-transform active:scale-95 ${
          isLinkActive("/orders") ? activeColor : inactiveColor
        }`}
      >
        <ReceiptText className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-1">Orders</span>
      </Link>

      <Link
        to="/login"
        className={`flex flex-col items-center justify-center flex-1 py-2 transition-transform active:scale-95 ${
          isLinkActive("/login") || isLinkActive("/profile") ? activeColor : inactiveColor
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-1">Profile</span>
      </Link>
    </nav>
  )
}
