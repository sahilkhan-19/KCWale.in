import React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { CheckCircle2, ChevronRight, ShoppingBag } from "lucide-react"

export const OrderSuccess: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get("orderId") || "ORD_SUCCESS"

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-12 space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-125 animate-pulse"></div>
        <CheckCircle2 className="w-20 h-20 text-tertiary fill-current text-background relative z-10" />
      </div>

      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-background">
          Order Placed Successfully!
        </h1>
        <p className="text-on-surface-variant text-sm max-w-sm mx-auto leading-relaxed">
          Your payment has been cleared and our chefs are ready to slow-cook your meal.
        </p>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/30 px-6 py-4 rounded-2xl w-full max-w-sm font-body text-xs space-y-1.5 shadow-lg">
        <div className="flex justify-between font-semibold text-on-surface-variant">
          <span>Order Reference</span>
          <span className="text-on-surface select-all">{orderId}</span>
        </div>
        <div className="flex justify-between font-semibold text-on-surface-variant">
          <span>Estimated Prep & Delivery</span>
          <span className="text-tertiary">25 - 35 mins</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs pt-4">
        <button
          onClick={() => navigate(`/order-tracking/${orderId}`)}
          className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
        >
          Track Order
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface font-bold py-3.5 rounded-xl active:scale-95 transition-transform text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
        >
          Back to Home
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
