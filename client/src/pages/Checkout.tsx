import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cartService } from "../services/cart.service"
import { orderService } from "../services/order.service"
import { adminService } from "../services/admin.service"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "sonner"
import {
  ArrowLeft,
  MapPin,
  User,
  ShieldCheck,
  CreditCard,
  Landmark,
  Check,
  Loader2,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { Button } from "../components/ui/button"
import type { DeliveryAddress } from "../components/LocationPicker"

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true)
      return
    }
    // Check if script tag is already in DOM to prevent duplicate scripts
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if ((window as any).Razorpay) {
          clearInterval(checkInterval)
          resolve(true)
        }
      }, 100)
      setTimeout(() => {
        clearInterval(checkInterval)
        resolve(!!(window as any).Razorpay)
      }, 10000)
      return
    }
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, updateProfile } = useAuth()

  // Fetch global settings
  const { data: settings } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: adminService.getSystemSettings,
  })

  const isStoreClosed = settings ? !settings.storeOpen : false

  const [fullName, setFullName] = useState(user?.name || "Alex Johnson")
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "9876543210")
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("ONLINE")
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  // Fetch cart to display billing summary
  const { data: cartData, isLoading: isCartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: cartService.getCart,
  })

  // Captured Coordinates state stored in localStorage for persistence
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(() => {
    const saved = localStorage.getItem("kcwale_coords")
    return saved ? JSON.parse(saved) : null
  })

  // GPS accuracy in meters (from browser Geolocation API)
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(() => {
    const saved = localStorage.getItem("kcwale_gps_accuracy")
    return saved ? parseFloat(saved) : null
  })

  // Structured delivery address fields from localStorage
  const [address, setAddress] = useState<DeliveryAddress>(() => {
    const saved = localStorage.getItem("kcwale_address")
    const defaultAddress = {
      house: "",
      floor: "",
      building: "",
      street: "",
      area: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      apartment: "",
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return { ...defaultAddress, ...parsed }
      } catch (e) {
        return defaultAddress
      }
    }
    return defaultAddress
  })

  const isAddressComplete =
    address.house.trim().length > 0 &&
    address.street.trim().length > 0 &&
    address.area.trim().length > 0 &&
    address.city.trim().length > 0 &&
    address.state.trim().length > 0 &&
    address.pincode.trim().length > 0

  // Delivery calculations query using captured coordinates
  const { data: deliveryMetrics, isLoading: isDeliveryLoading } = useQuery({
    queryKey: ["deliveryMetrics", coordinates?.latitude, coordinates?.longitude],
    queryFn: () => orderService.calculateDelivery(coordinates!.latitude, coordinates!.longitude),
    enabled: !!coordinates,
    retry: false,
  })

  const isOutsideRadius = deliveryMetrics ? !deliveryMetrics.allowed : false

  const subtotal = cartData?.subtotal || 0
  const deliveryFee = deliveryMetrics ? (deliveryMetrics.deliveryCharge !== -1 ? deliveryMetrics.deliveryCharge : 0) : 40
  const taxRatePercent = settings?.taxRate ?? 5
  const taxes = Number((subtotal * (taxRatePercent / 100)).toFixed(2))
  const grandTotal = Number((subtotal + deliveryFee + taxes).toFixed(2))

  // Mutation to place COD order
  const placeOrderMutation = useMutation({
    mutationFn: () =>
      orderService.placeOrder({
        deliveryAddress: address,
        deliveryLocation: {
          latitude: coordinates!.latitude,
          longitude: coordinates!.longitude,
        },
        paymentMethod: "COD",
      }),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Order placed successfully via Cash on Delivery!")
      navigate(`/order-success?orderId=${order._id}`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to place order")
      setIsPlacingOrder(false)
    },
  })

  // Simulated Online Payment verification mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: (data: {
      razorpay_order_id: string
      razorpay_payment_id: string
      razorpay_signature: string
      deliveryAddress: any
      deliveryLocation: any
    }) => orderService.verifyPayment(data),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Payment verified and order placed successfully!")
      navigate(`/order-success?orderId=${order._id}`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to verify online payment")
      setIsPlacingOrder(false)
    },
  })

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isPlacingOrder) return
    if (isStoreClosed) {
      toast.error("Sorry cravers, we are closed today!")
      return
    }
    if (!isAddressComplete) {
      toast.error("Please fill in all required delivery address fields.")
      return
    }
    if (!coordinates) {
      toast.error("Please capture your GPS delivery location first.")
      return
    }
    // DEVELOPMENT ONLY
    // Delivery radius validation is temporarily disabled for local testing.
    // Re-enable this block before production deployment.
    // ORIGINAL CODE (uncomment for production):
    // if (isOutsideRadius) {
    //   toast.error("Sorry! We cannot deliver to this address as it is outside our service radius.")
    //   return
    // }

    setIsPlacingOrder(true)

    // Save profile updates if different or new
    if (fullName !== user?.name || phoneNumber !== user?.phone) {
      try {
        await updateProfile(fullName, user?.email, phoneNumber, user?.address || "")
      } catch (err) {
        console.error("Failed to save profile updates", err)
      }
    }

    if (paymentMethod === "COD") {
      placeOrderMutation.mutate()
    } else {
      try {
        toast.info("Initializing secure online payment...", { duration: 1500 })

        // 1. Load Razorpay script dynamically
        const scriptLoaded = await loadRazorpayScript()
        if (!scriptLoaded) {
          toast.error("Razorpay SDK failed to load. Please check your internet connection.")
          setIsPlacingOrder(false)
          return
        }

        // 2. Create Razorpay order on backend using coordinates
        const rpOrder = await orderService.createRazorpayOrder({
          deliveryAddress: address,
          deliveryLocation: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          },
        })

        // 3. Open official Razorpay Checkout modal
        const options = {
          key: rpOrder.key,
          amount: rpOrder.amount,
          currency: rpOrder.currency,
          name: "KC WALE",
          description: "Delicious Food Order",
          image: "/logo.png",
          order_id: rpOrder.razorpayOrderId,
          handler: async (response: any) => {
            setIsPlacingOrder(true)
            verifyPaymentMutation.mutate({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              deliveryAddress: address,
              deliveryLocation: {
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
              },
            })
          },
          prefill: {
            name: fullName,
            contact: phoneNumber,
            email: user?.email || "",
          },
          theme: {
            color: "#ff5722",
          },
          modal: {
            ondismiss: () => {
              setIsPlacingOrder(false)
              toast.error("Payment cancelled by user")
            },
          },
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || "Failed to initialize payment gateway")
        setIsPlacingOrder(false)
      }
    }
  }

  if (isCartLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto pb-32">
      {/* Top App Bar Mobile style */}
      <header className="flex items-center gap-4 py-4 border-b border-outline-variant/30 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface-container rounded-full text-on-surface transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-headline text-xl font-bold text-on-background">Checkout</h1>
      </header>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-md shadow-primary/20">
            1
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Details</span>
        </div>
        <div className="h-px bg-primary flex-1 mx-2 mb-4"></div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-md shadow-primary/20">
            2
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Payment</span>
        </div>
        <div className="h-px bg-outline-variant/30 flex-1 mx-2 mb-4"></div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-xs">
            3
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Confirm</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="space-y-6">
        {isStoreClosed && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-grow text-xs leading-relaxed text-left">
              <p className="font-extrabold text-red-500">Sorry cravers, we are closed today!</p>
              <p className="text-on-surface-variant/80 mt-0.5 font-medium">
                We are currently not accepting new orders. Please check back later!
              </p>
            </div>
          </div>
        )}

        {isOutsideRadius && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-grow text-xs leading-relaxed text-left">
              <p className="font-extrabold text-red-500">Sorry!</p>
              <p className="text-on-surface-variant/80 mt-0.5 font-medium">
                KCWALE currently delivers only within 15 km of our kitchen. Please choose a different delivery location.
              </p>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-headline text-lg font-bold text-on-surface">Contact Information</h2>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-on-surface-variant mb-1 ml-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-on-surface-variant mb-1 ml-1">Phone Number</label>
              <div className="flex items-center bg-surface-container-low border border-outline-variant/40 rounded-xl focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                <span className="pl-4 text-sm text-on-surface-variant font-medium">+91</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-2 py-3 bg-transparent border-none text-on-surface focus:ring-0 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Details Section */}
        <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-lg text-left">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="font-headline text-lg font-bold text-on-surface">Delivery Address</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="text-xs text-primary font-bold hover:underline"
            >
              Edit in Cart
            </button>
          </div>

          {isAddressComplete && coordinates ? (
            <div className="space-y-3">
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface space-y-1.5">
                <p className="text-sm font-bold text-primary">
                  {address.house}
                  {address.floor && `, Floor ${address.floor}`}
                  {address.building && `, ${address.building}`}
                </p>
                <p className="text-on-surface-variant">
                  {address.street}, {address.area}
                </p>
                {address.landmark && (
                  <p className="text-on-surface-variant/80 italic">
                    Landmark: {address.landmark}
                  </p>
                )}
                <p className="text-on-surface-variant">
                  {address.city}, {address.state} - {address.pincode}
                </p>
              </div>

              {deliveryMetrics && (
                <div className="flex items-center gap-3 text-on-surface-variant text-[11px] font-bold bg-primary/5 border border-primary/20 px-3.5 py-2.5 rounded-xl">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                    ₹{deliveryMetrics.deliveryCharge} delivery fee
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-red-500/30 bg-red-500/5 text-center space-y-2">
              <p className="text-xs text-red-500 font-bold">
                No delivery address selected or captured yet.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate("/cart")}
                className="mx-auto font-bold text-xs"
              >
                Go to Cart to Set Address
              </Button>
            </div>
          )}
        </section>

        {/* Payment Method */}
        <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Landmark className="w-5 h-5 text-primary" />
            <h2 className="font-headline text-lg font-bold text-on-surface">Payment Method</h2>
          </div>
          <div className="space-y-3">
            <label
              className={`flex items-center justify-between p-4 bg-surface rounded-xl border cursor-pointer transition-all hover:bg-surface-container-low group ${
                paymentMethod === "ONLINE" ? "border-primary bg-primary/5" : "border-outline-variant/40"
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                <CreditCard
                  className={`w-5 h-5 ${paymentMethod === "ONLINE" ? "text-primary" : "text-on-surface-variant"}`}
                />
                <span className="text-sm font-semibold text-on-surface">Online Payment</span>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "ONLINE"}
                onChange={() => setPaymentMethod("ONLINE")}
                className="w-4 h-4 text-primary focus:ring-primary border-outline-variant/40"
              />
            </label>
            <label
              className={`flex items-center justify-between p-4 bg-surface rounded-xl border cursor-pointer transition-all hover:bg-surface-container-low group ${
                paymentMethod === "COD" ? "border-primary bg-primary/5" : "border-outline-variant/40"
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                <Landmark
                  className={`w-5 h-5 ${paymentMethod === "COD" ? "text-primary" : "text-on-surface-variant"}`}
                />
                <span className="text-sm font-semibold text-on-surface">Cash on Delivery (COD)</span>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
                className="w-4 h-4 text-primary focus:ring-primary border-outline-variant/40"
              />
            </label>
          </div>
        </section>

        {/* Order Summary */}
        <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="font-headline text-lg font-bold text-on-surface">Order Summary</h2>
          </div>
          <div className="space-y-2 border-b border-outline-variant/20 pb-3 mb-3 text-xs font-semibold">
            <div className="flex justify-between text-on-surface-variant">
              <span>Items Total</span>
              <span className="text-on-surface">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Delivery Fee</span>
              {isDeliveryLoading ? (
                <span className="text-xs text-muted-foreground animate-pulse">Calculating...</span>
              ) : (
                <span className="text-on-surface">₹{deliveryFee}</span>
              )}
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Taxes & Charges ({taxRatePercent}% GST)</span>
              <span className="text-on-surface">₹{taxes}</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="font-headline text-on-surface">Grand Total</span>
            <span className="font-headline text-lg text-on-surface">
              {isDeliveryLoading ? (
                <span className="animate-pulse text-muted-foreground">₹...</span>
              ) : (
                `₹${grandTotal}`
              )}
            </span>
          </div>
        </section>

        {/* Fixed Footer Action */}
        <footer className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant/30 p-4 z-40">
          <div className="max-w-md mx-auto flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">To Pay</p>
                <p className="font-headline text-lg font-bold text-primary">
                  {isDeliveryLoading ? (
                    <span className="animate-pulse text-muted-foreground">₹...</span>
                  ) : (
                    `₹${grandTotal}`
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-on-surface-variant font-bold flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-tertiary" />
                  100% Secure Payments
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={isStoreClosed || isPlacingOrder || !isAddressComplete || !coordinates || isOutsideRadius || isDeliveryLoading}
              className={`w-full py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 text-sm uppercase tracking-wider ${
                isStoreClosed || isPlacingOrder || !isAddressComplete || !coordinates || isOutsideRadius || isDeliveryLoading
                  ? "bg-outline-variant/30 text-on-surface-variant/40 shadow-none cursor-not-allowed"
                  : "bg-primary hover:bg-primary/95 text-white shadow-primary/20"
              }`}
            >
              {isStoreClosed ? (
                "Store Closed"
              ) : !isAddressComplete ? (
                "Fill Address to Order"
              ) : !coordinates ? (
                "Capture Location to Order"
              ) : isOutsideRadius ? (
                "Outside Delivery Area"
              ) : isPlacingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Order...
                </>
              ) : (
                <>
                  Place Order
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </footer>
      </form>

      {/* Location picker modal is completely removed. Native geolocation is used instead. */}
    </div>
  )
}
