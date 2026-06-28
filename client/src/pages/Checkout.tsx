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
import { useCurrentLocation } from "../hooks/useCurrentLocation"
import { Button } from "../components/ui/button"

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

  // Custom geolocation hook
  const { getCurrentLocation, loading: geoLoading } = useCurrentLocation()

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
  const [address, setAddress] = useState<{
    house: string
    apartment: string
    street: string
    landmark: string
    city: string
    pincode: string
  }>(() => {
    const saved = localStorage.getItem("kcwale_address")
    return saved
      ? JSON.parse(saved)
      : { house: "", apartment: "", street: "", landmark: "", city: "", pincode: "" }
  })

  const updateAddressField = (field: string, value: string) => {
    const updated = { ...address, [field]: value }
    setAddress(updated)
    localStorage.setItem("kcwale_address", JSON.stringify(updated))
  }

  const isAddressComplete =
    address.house.trim().length > 0 &&
    address.street.trim().length > 0 &&
    address.city.trim().length > 0 &&
    address.pincode.trim().length > 0

  // Captured Location Handler
  const handleCaptureLocation = async () => {
    try {
      const result = await getCurrentLocation()
      const coords = { latitude: result.latitude, longitude: result.longitude }
      setCoordinates(coords)
      setGpsAccuracy(result.accuracy)
      localStorage.setItem("kcwale_coords", JSON.stringify(coords))
      localStorage.setItem("kcwale_gps_accuracy", String(result.accuracy))

      if (result.accuracy <= 100) {
        toast.success(`Location captured — accuracy ±${Math.round(result.accuracy)}m`)
      } else if (result.accuracy <= 500) {
        toast.warning(`Location captured with moderate accuracy (±${Math.round(result.accuracy)}m). Consider recapturing outdoors.`)
      } else {
        toast.error(`Low GPS accuracy (±${Math.round(result.accuracy)}m). Recapture outdoors for better results.`)
      }
    } catch (err: any) {
      toast.error(err || "Failed to retrieve current location. Please make sure GPS is enabled.")
    }
  }

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
  const taxes = Number((subtotal * 0.05).toFixed(2))
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

        // 1. Create Razorpay order on backend using coordinates
        const rpOrder = await orderService.createRazorpayOrder({
          deliveryAddress: address,
          deliveryLocation: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          },
        })

        // 2. Simulate user filling Razorpay modal
        setTimeout(() => {
          const simulatedPaymentId = `pay_${Math.random().toString(36).substring(2, 11)}`
          const simulatedSignature = `sig_${Math.random().toString(36).substring(2, 11)}`

          // 3. Call verification endpoint
          verifyPaymentMutation.mutate({
            razorpay_order_id: rpOrder.razorpayOrderId || "order_simulated_id",
            razorpay_payment_id: simulatedPaymentId,
            razorpay_signature: simulatedSignature,
            deliveryAddress: address,
            deliveryLocation: {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            },
          })
        }, 1500)
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
                KCWALE currently delivers only within 10 km of our kitchen. Please choose a different delivery location.
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
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-headline text-lg font-bold text-on-surface">Delivery Details</h2>
          </div>

          <div className="space-y-4">
            {/* Part 1: Structured Manual Address Form */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                1. Delivery Address *
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-on-surface-variant mb-1 ml-1">
                    House / Flat No. *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 101, Block A"
                    value={address.house}
                    onChange={(e) => updateAddressField("house", e.target.value)}
                    required
                    className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-on-surface-variant mb-1 ml-1">
                    Apartment / Building (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunshine Heights"
                    value={address.apartment}
                    onChange={(e) => updateAddressField("apartment", e.target.value)}
                    className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
                  />
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="text-[10px] font-bold text-on-surface-variant mb-1 ml-1">
                    Street / Area *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Market, Sector 15"
                    value={address.street}
                    onChange={(e) => updateAddressField("street", e.target.value)}
                    required
                    className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
                  />
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="text-[10px] font-bold text-on-surface-variant mb-1 ml-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Metro Station"
                    value={address.landmark}
                    onChange={(e) => updateAddressField("landmark", e.target.value)}
                    className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-on-surface-variant mb-1 ml-1">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi"
                    value={address.city}
                    onChange={(e) => updateAddressField("city", e.target.value)}
                    required
                    className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-on-surface-variant mb-1 ml-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 110001"
                    value={address.pincode}
                    onChange={(e) => updateAddressField("pincode", e.target.value)}
                    required
                    className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <hr className="border-outline-variant/10" />

            {/* Part 2: Current GPS Location Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  2. Current GPS Location *
                </h3>
                {coordinates && (
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    Captured
                  </span>
                )}
              </div>

              <p className="text-[10px] text-on-surface-variant/70 leading-relaxed font-medium">
                GPS coordinates are required to verify kitchen delivery zone and estimate fee.
              </p>

              {coordinates ? (
                <div className={`${gpsAccuracy && gpsAccuracy > 500 ? 'bg-red-500/10 border-red-500/20' : gpsAccuracy && gpsAccuracy > 100 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'} border p-3.5 rounded-xl flex flex-col gap-1.5 text-left animate-in fade-in duration-200`}>
                  <div className="flex items-center justify-between">
                    <span className={`${gpsAccuracy && gpsAccuracy > 500 ? 'text-red-600' : gpsAccuracy && gpsAccuracy > 100 ? 'text-amber-600' : 'text-emerald-600'} font-extrabold text-xs flex items-center gap-1.5`}>
                      <Check className={`h-3.5 w-3.5 ${gpsAccuracy && gpsAccuracy > 500 ? 'text-red-500' : gpsAccuracy && gpsAccuracy > 100 ? 'text-amber-500' : 'text-emerald-500'}`} />
                      ✔ Location Captured
                      {gpsAccuracy !== null && (
                        <span className="font-bold text-[10px] opacity-80">
                          (±{Math.round(gpsAccuracy)}m)
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={handleCaptureLocation}
                      disabled={geoLoading}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      Recapture
                    </button>
                  </div>
                  {gpsAccuracy && gpsAccuracy > 500 && (
                    <p className="text-red-500 font-bold text-[10px] flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      Low accuracy — recapture outdoors for a better GPS fix
                    </p>
                  )}
                  {gpsAccuracy && gpsAccuracy > 100 && gpsAccuracy <= 500 && (
                    <p className="text-amber-600 font-bold text-[10px] flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      Moderate accuracy — try recapturing outdoors for better precision
                    </p>
                  )}
                  {isOutsideRadius ? (
                    <p className="text-red-500 font-bold text-[11px] flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Outside delivery range (10 km service limit)
                    </p>
                  ) : (
                    deliveryMetrics && (
                      <div className="flex gap-3 text-[11px] font-bold text-primary mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          {deliveryMetrics.estimatedDuration} - {deliveryMetrics.estimatedDuration + 7} mins
                        </span>
                        <span>•</span>
                        <span>Distance: {deliveryMetrics.distanceInKm.toFixed(1)} km</span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCaptureLocation}
                    disabled={geoLoading}
                    className="w-full py-4 border-dashed border-primary/40 text-primary hover:bg-primary/5 flex items-center justify-center gap-2 font-bold text-xs"
                  >
                    {geoLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Waiting for GPS fix...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-3.5 w-3.5 animate-bounce" />
                        📍 Use My Current Location
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-red-500 font-bold text-center flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    ❌ Location not captured
                  </p>
                </div>
              )}
            </div>
          </div>
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
              ) : deliveryFee === 0 ? (
                <span className="text-tertiary">Free</span>
              ) : (
                <span className="text-on-surface">₹{deliveryFee}</span>
              )}
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Taxes & Charges</span>
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
                isStoreClosed || !isAddressComplete || !coordinates || isOutsideRadius || isDeliveryLoading
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
