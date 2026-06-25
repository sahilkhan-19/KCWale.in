import { NavLink, useLocation } from "react-router-dom";
import { Home, UtensilsCrossed, ShoppingCart, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/orders", label: "Orders", icon: ClipboardList },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <>
      {/* Desktop Navbar */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 z-50"
      >
        <nav className="glass-strong rounded-2xl px-2 py-2 flex items-center gap-1">
          {/* Brand Logo */}
          <NavLink to="/" className="flex items-center gap-2 px-4 mr-2">
            <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center">
              <span className="text-white font-bold text-sm">KC</span>
            </div>
            <span className="text-lg font-bold gradient-text">KCWALE</span>
          </NavLink>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                    isActive
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="desktop-active-pill"
                      className="absolute inset-0 gradient-orange rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <item.icon size={16} />
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      </motion.header>

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        className="md:hidden fixed bottom-4 left-4 right-4 z-50 glass-strong rounded-2xl px-2 py-2"
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-300",
                  isActive
                    ? "text-white"
                    : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-pill"
                    className="absolute inset-0 gradient-orange rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon size={20} className="relative z-10" />
                <span className="relative z-10 text-[10px] font-medium">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </motion.nav>
    </>
  );
}
