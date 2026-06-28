import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cartService } from "../services/cart.service"
import { adminService } from "../services/admin.service"
import { useAuth } from "../contexts/AuthContext"
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Loader2,
  ShoppingBag,
  MapPin,
  CheckCircle,
  Tag,
  AlertTriangle,
  Clock,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import { useCurrentLocation } from "../hooks/useCurrentLocation"
import { Button } from "../components/ui/button"
import { orderService } from "../services/order.service"

export const Cart: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Fetch global settings
  const { data: settings } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: adminService.getSystemSettings,
  })

  const isStoreClosed = settings ? !settings.storeOpen : false

  // Fetch cart data
  const { data: cartData, isLoading } = useQuery({
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

  // Delivery metrics query using captured coordinates
  const { data: deliveryMetrics, isLoading: isDeliveryLoading } = useQuery({
    queryKey: ["deliveryMetrics", coordinates?.latitude, coordinates?.longitude],
    queryFn: () => orderService.calculateDelivery(coordinates!.latitude, coordinates!.longitude),
    enabled: !!coordinates,
    retry: false,
  })

  const isOutsideRadius = deliveryMetrics ? !deliveryMetrics.allowed : false

  // Mutation to update cart item quantity
  const updateQuantityMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartService.updateCartItem(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update quantity")
    },
  })

  // Mutation to remove cart item
  const removeItemMutation = useMutation({
    mutationFn: (productId: string) => cartService.removeCartItem(productId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      toast.success("Item removed from cart")
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to remove item")
    },
  })

  const cart = cartData?.cart
  const items = cart?.items || []
  const subtotal = cartData?.subtotal || 0
  const deliveryFee = deliveryMetrics ? (deliveryMetrics.deliveryCharge !== -1 ? deliveryMetrics.deliveryCharge : 0) : 40
  const taxes = Number((subtotal * 0.05).toFixed(2)) // 5% GST
  const grandTotal = Number((subtotal + deliveryFee + taxes).toFixed(2))

  const handleQuantityChange = (productId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change
    if (newQty < 1) return
    updateQuantityMutation.mutate({ productId, quantity: newQty })
  }

  const handleRemoveItem = (productId: string) => {
    removeItemMutation.mutate(productId)
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 px-4">
        <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center border border-outline-variant/30 text-on-surface-variant">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-headline text-2xl font-bold text-on-background">Your Cart is Empty</h2>
        <p className="text-on-surface-variant text-sm max-w-xs leading-relaxed">
          Looks like you haven't added any items to your cart yet.
        </p>
        <button
          onClick={() => navigate("/menu")}
          className="bg-primary hover:bg-primary/95 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-lg shadow-primary/10 active:scale-95 transition-transform"
        >
          Explore Menu
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="md:hidden p-2 hover:bg-surface-container rounded-full text-on-surface transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-background">Review Your Order</h1>
          <p className="text-on-surface-variant text-xs md:text-sm mt-0.5 font-medium">
            Your order from KCWALE is almost ready.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Address and Order Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Delivery Location section */}
          <section className="border border-outline-variant/30 bg-surface-container-low p-6 rounded-2xl shadow-lg text-left">
            <div className="flex items-center gap-2 text-on-surface font-bold mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="font-headline text-lg md:text-xl">Delivery Details</h2>
            </div>

            <div className="space-y-4">
              {/* Part 1: Structured Manual Address Form */}
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  1. Delivery Address *
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-on-surface-variant mb-1 ml-1">
                      House / Flat No. *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 101, Block A"
                      value={address.house}
                      onChange={(e) => updateAddressField("house", e.target.value)}
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
                      className="px-3 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Part 2: Current GPS Location Section */}
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                    2. Current GPS Location *
                  </h3>
                  {coordinates && (
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Captured
                    </span>
                  )}
                </div>
                
                <p className="text-[10px] text-on-surface-variant/70 leading-relaxed font-medium">
                  Precise GPS coordinates are required to confirm you are within our 10 km kitchen delivery zone and calculate the delivery fee.
                </p>

                {coordinates ? (
                  <div className={`${gpsAccuracy && gpsAccuracy > 500 ? 'bg-red-500/10 border-red-500/20' : gpsAccuracy && gpsAccuracy > 100 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'} border p-3.5 rounded-xl flex flex-col gap-1.5 animate-in fade-in duration-200`}>
                    <div className="flex items-center justify-between">
                      <span className={`${gpsAccuracy && gpsAccuracy > 500 ? 'text-red-600' : gpsAccuracy && gpsAccuracy > 100 ? 'text-amber-600' : 'text-emerald-600'} font-extrabold text-xs flex items-center gap-1.5`}>
                        <Check className={`h-3.5 w-3.5 ${gpsAccuracy && gpsAccuracy > 500 ? 'text-red-500' : gpsAccuracy && gpsAccuracy > 100 ? 'text-amber-500' : 'text-emerald-500'}`} />
                        ✔ Location captured
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
                          <MapPin className="h-3.5 w-3.5" />
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

          {/* List of Items */}
          <section className="border border-outline-variant/30 bg-surface-container-low p-6 rounded-2xl shadow-lg space-y-6">
            <h2 className="font-headline text-lg md:text-xl font-bold text-on-surface border-b border-outline-variant/20 pb-3">
              Order Details
            </h2>

            <div className="space-y-6">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant/20">
                    <img
                      src={
                        item.product?.images?.[0] ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&q=80"
                      }
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-headline text-base font-bold text-on-surface line-clamp-1">
                        {item.product?.name}
                      </h3>
                      <p className="text-sm font-bold text-on-surface">
                        ₹{((item.product?.price || 0) + (item.selectedAddon?.price || 0)) * item.quantity}
                      </p>
                    </div>
                    <p className="text-xs text-on-surface-variant/80 line-clamp-1">
                      {item.product?.description || "Freshly cooked premium meal selection."}
                    </p>
                    {item.selectedAddon && (
                      <p className="text-[10px] text-primary font-bold">
                        Customization: {item.selectedAddon.name} (+₹{item.selectedAddon.price})
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-outline-variant/40 rounded-full px-2 py-0.5 gap-3 bg-surface-container-highest">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                          disabled={updateQuantityMutation.isPending}
                          className="text-primary hover:bg-surface-container rounded-full p-1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold w-5 text-center text-on-surface">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                          disabled={updateQuantityMutation.isPending}
                          className="text-primary hover:bg-surface-container rounded-full p-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        disabled={removeItemMutation.isPending}
                        className="text-on-surface-variant hover:text-error transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-outline-variant/40 pt-4">
              <Link
                to="/menu"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <Plus className="w-4 h-4" /> Add more items from the menu
              </Link>
            </div>
          </section>
        </div>

        {/* Right Column: Billing Summary */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="border border-outline-variant/30 bg-surface-container-low p-6 rounded-2xl shadow-lg space-y-5">
            <h2 className="font-headline text-lg md:text-xl font-bold text-on-surface">Bill Summary</h2>

            {isStoreClosed && (
              <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 text-[11px] leading-relaxed text-left">
                  <p className="font-extrabold text-red-500">Sorry cravers, we are closed today!</p>
                  <p className="text-on-surface-variant/80 mt-0.5">We are currently not accepting new orders. Please check back later!</p>
                </div>
              </div>
            )}

            {isOutsideRadius && (
              <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 text-[11px] leading-relaxed text-left">
                  <p className="font-extrabold text-red-500">Outside Service Area</p>
                  <p className="text-on-surface-variant/80 mt-0.5">
                    KCWALE currently delivers only within 10 km of our kitchen.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-on-surface-variant font-medium">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant font-medium">
                <span>Delivery Fee</span>
                {isDeliveryLoading ? (
                  <span className="text-xs text-muted-foreground animate-pulse">Calculating...</span>
                ) : deliveryFee === 0 ? (
                  <span className="text-tertiary font-bold">FREE</span>
                ) : (
                  <span>₹{deliveryFee}</span>
                )}
              </div>
              <div className="flex justify-between text-on-surface-variant font-medium">
                <span>Taxes & Charges (5% GST)</span>
                <span>₹{taxes}</span>
              </div>
              <div className="border-t border-outline-variant/30 pt-3 flex justify-between text-sm">
                <span className="font-headline font-bold text-on-surface">Grand Total</span>
                <span className="font-headline font-bold text-primary">
                  {isDeliveryLoading ? (
                    <span className="animate-pulse text-muted-foreground">₹...</span>
                  ) : (
                    `₹${grandTotal}`
                  )}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (isStoreClosed) {
                  toast.error("Sorry cravers, we are closed today!")
                  return
                }
                if (!isAddressComplete) {
                  toast.error("Please fill in all required delivery address fields.")
                  return
                }
                if (!coordinates) {
                  toast.error("Please capture your GPS location to proceed.")
                  return
                }
                // DEVELOPMENT ONLY
                // Delivery radius validation is temporarily disabled for local testing.
                // Re-enable this block before production deployment.
                // ORIGINAL CODE (uncomment for production):
                // if (isOutsideRadius) {
                //   toast.error("Delivery location is outside service range.")
                //   return
                // }
                navigate("/checkout")
              }}
              disabled={isStoreClosed || !isAddressComplete || !coordinates || isOutsideRadius || isDeliveryLoading}
              className={`w-full font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider ${
                isStoreClosed || !isAddressComplete || !coordinates || isOutsideRadius || isDeliveryLoading
                  ? "bg-outline-variant/30 text-on-surface-variant/40 shadow-none cursor-not-allowed"
                  : "bg-gradient-to-r from-primary to-orange-600 hover:brightness-110 text-white shadow-primary/10"
              }`}
            >
              {isStoreClosed
                ? "Store Closed"
                : !isAddressComplete
                ? "Fill Address to Proceed"
                : !coordinates
                ? "Capture Location to Proceed"
                : isOutsideRadius
                ? "Outside Service Area"
                : "Proceed to Payment"}
              {!isStoreClosed && isAddressComplete && coordinates && !isOutsideRadius && <ArrowLeft className="w-4 h-4 rotate-180" />}
            </button>

            <p className="text-[10px] text-center text-on-surface-variant/70 leading-relaxed">
              By placing the order, you agree to KCWALE's Terms of Service and Privacy Policy. All prices include applicable taxes.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
