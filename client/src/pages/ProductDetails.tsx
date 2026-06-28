import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { menuService } from "../services/menu.service"
import { cartService } from "../services/cart.service"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "sonner"
import { Star, Clock, Heart, Plus, Minus, ArrowLeft, Loader2, Sparkles, Award } from "lucide-react"

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [quantity, setQuantity] = useState(1)
  const [selectedAddon, setSelectedAddon] = useState<{ name: string; price: number } | null>(null)

  // Fetch single product
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => menuService.getSingleProduct(id || ""),
    enabled: !!id,
  })

  // Mutation to add to cart
  const addToCartMutation = useMutation({
    mutationFn: () => cartService.addToCart(id || "", quantity, selectedAddon || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      toast.success(`${product?.name} (${quantity} qty) added to cart!`, {
        action: {
          label: "View Cart",
          onClick: () => navigate("/cart"),
        },
      })
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add items to cart")
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="text-center py-20">
        <p className="text-error font-bold text-sm">Product not found or invalid ID.</p>
        <button onClick={() => navigate("/menu")} className="text-primary font-bold hover:underline text-xs mt-2">
          Back to Menu
        </button>
      </div>
    )
  }

  const isVegProduct = (name: string, category: string) => {
    const lower = `${name} ${category}`.toLowerCase()
    return !(
      lower.includes("chicken") ||
      lower.includes("mutton") ||
      lower.includes("fish") ||
      lower.includes("egg") ||
      lower.includes("non-veg")
    )
  }

  const isVeg = isVegProduct(product.name, product.category)
  const isBestSeller =
    product.name.includes("Paneer") ||
    product.name.includes("Pizza") ||
    product.name.includes("Butter Chicken")

  const allowedAddons = isVeg
    ? [{ name: "Extra Cheese", price: 40 }]
    : [
        { name: "Extra Chicken & Extra Cheese", price: 50 },
        { name: "Extra Chicken", price: 50 },
        { name: "Extra Cheese", price: 40 },
      ]

  const isAddonAllowed =
    product &&
    ["pizza", "burger", "fries", "pasta", "chizza"].includes(product.category.toLowerCase().trim())

  const handleIncrement = () => setQuantity((prev) => Math.min(prev + 1, 10))
  const handleDecrement = () => setQuantity((prev) => Math.max(prev - 1, 1))

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart", {
        action: {
          label: "Login",
          onClick: () => navigate("/login"),
        },
      })
      return
    }
    addToCartMutation.mutate()
  }

  // Mock details matching Stitch design
  const rating = product.name.includes("Pizza") ? 4.8 : product.name.includes("Paneer") ? 4.6 : 4.5
  const reviewsCount = product.name.includes("Pizza") ? "3,120" : product.name.includes("Paneer") ? "1,240" : "860"
  const prepTime = product.name.includes("Pizza") ? "30 min" : "18 min"

  return (
    <div className="pb-32 -mx-gutter max-w-none">
      {/* Hero Header Section */}
      <section className="relative w-full h-[320px] md:h-[420px] overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img
            className={`w-full h-full object-cover ${!product.available ? "opacity-35 filter grayscale-[25%]" : ""}`}
            src={product.images?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&q=80"}
            alt={product.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2.5 bg-background/80 backdrop-blur-md rounded-full text-on-surface hover:bg-surface-container transition-colors shadow-lg border border-outline-variant/30 z-20"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {isBestSeller && product.available && (
          <div className="absolute top-6 right-6 bg-primary text-white px-4 py-1.5 rounded-full font-bold text-xs shadow-lg uppercase tracking-wider z-20">
            Best Seller
          </div>
        )}

        {!product.available && (
          <div className="absolute top-6 right-6 bg-red-600 text-white px-4 py-1.5 rounded-full font-extrabold text-xs shadow-lg uppercase tracking-wider animate-pulse z-20">
            Out of Stock
          </div>
        )}
      </section>

      {/* Content Container */}
      <div className="max-w-container-max mx-auto px-6 -mt-20 relative z-10">
        <div className={`bg-surface-container-low p-6 md:p-10 rounded-3xl border border-outline-variant/30 shadow-2xl flex flex-col md:flex-row gap-8 transition-all ${
          !product.available ? "opacity-70" : ""
        }`}>
          {/* Left Side Details */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mb-2">
                {product.name}
              </h1>

              <div className="flex items-center gap-3">
                <div className="flex items-center text-tertiary font-bold gap-1 text-sm bg-tertiary/10 px-2 py-0.5 rounded">
                  <Star className="w-4 h-4 fill-current text-tertiary" />
                  <span>{rating}</span>
                </div>
                <span className="text-on-surface-variant text-xs border-l border-outline-variant/30 pl-3">
                  ({reviewsCount} reviews)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-y border-outline-variant/20">
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">Prep Time: {prepTime}</span>
              </div>
              <span className="text-primary font-headline text-3xl font-bold">₹{product.price}</span>
            </div>

            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
              {product.description ||
                "Prepared fresh with the finest local ingredients. Slowly slow-cooked to perfection, ensuring authentic textures and flavors in every mouthful."}
            </p>

            {/* Ingredient Highlights */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-widest flex items-center gap-1">
                <Award className="w-4 h-4 text-primary" /> Highlighted Ingredients
              </h3>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline-variant/20 rounded-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span className="text-xs text-on-surface-variant font-medium">A2 Desi Ghee</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline-variant/20 rounded-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span className="text-xs text-on-surface-variant font-medium">Organic Whole Spices</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline-variant/20 rounded-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span className="text-xs text-on-surface-variant font-medium">No Added MSG</span>
                </div>
              </div>
            </div>

            {/* Diet Info */}
            <div
              className={`flex items-center gap-2 p-3 border rounded-xl w-fit text-xs font-bold ${
                isVeg
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${isVeg ? "bg-emerald-400" : "bg-red-400"}`}></span>
              <span>{isVeg ? "100% Vegetarian Delight" : "Non-Vegetarian Selection"}</span>
            </div>

            {/* Customization Add-ons Card */}
            {isAddonAllowed && (
              <div className="bg-surface-container/30 border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-4">
                <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Customize Your Meal
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Enhance your flavor by selecting an optional add-on below.
                </p>
                <div className="space-y-2.5">
                  {/* Option: No Add-on */}
                  <label
                    onClick={() => setSelectedAddon(null)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors text-xs font-bold ${
                      selectedAddon === null
                        ? "bg-primary/5 border-primary text-primary"
                        : "bg-surface-container border-outline-variant/10 hover:border-outline-variant/35 text-on-surface"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="addon"
                        checked={selectedAddon === null}
                        onChange={() => setSelectedAddon(null)}
                        className="accent-primary"
                      />
                      <span>No Add-ons</span>
                    </div>
                  </label>

                  {allowedAddons.map((addon) => (
                    <label
                      key={addon.name}
                      onClick={() => setSelectedAddon(addon)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors text-xs font-bold ${
                        selectedAddon?.name === addon.name
                          ? "bg-primary/5 border-primary text-primary"
                          : "bg-surface-container border-outline-variant/10 hover:border-outline-variant/35 text-on-surface"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="addon"
                          checked={selectedAddon?.name === addon.name}
                          onChange={() => setSelectedAddon(addon)}
                          className="accent-primary"
                        />
                        <span>{addon.name}</span>
                      </div>
                      <span className={selectedAddon?.name === addon.name ? "text-primary" : "text-on-surface-variant"}>
                        +₹{addon.price}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Nutritional Info */}
          <div className="w-full md:w-80 flex flex-col gap-6">
            <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/30 space-y-4">
              <h3 className="font-headline text-lg font-bold text-on-surface">Nutritional Info</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-lowest p-3 rounded-xl flex flex-col items-center border border-outline-variant/20">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Calories</span>
                  <span className="font-headline text-2xl font-bold text-primary mt-1">620</span>
                  <span className="text-[10px] text-on-surface-variant font-semibold">kcal</span>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-xl flex flex-col items-center border border-outline-variant/20">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Protein</span>
                  <span className="font-headline text-2xl font-bold text-tertiary mt-1">{isVeg ? "18g" : "32g"}</span>
                  <span className="text-[10px] text-on-surface-variant font-semibold">{isVeg ? "Source" : "High"}</span>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-xl flex flex-col items-center border border-outline-variant/20">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Carbs</span>
                  <span className="font-headline text-2xl font-bold text-on-surface mt-1">74g</span>
                  <span className="text-[10px] text-on-surface-variant font-semibold">Fiber</span>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-xl flex flex-col items-center border border-outline-variant/20">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Fats</span>
                  <span className="font-headline text-2xl font-bold text-on-surface-variant mt-1">22g</span>
                  <span className="text-[10px] text-on-surface-variant font-semibold">Healthy</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-on-surface-variant/80 italic space-y-1.5 px-1 leading-relaxed">
              <p className="font-semibold text-on-surface">Allergen Information:</p>
              <p>Contains Dairy (Ghee) and Wheat gluten. Nut-free option available upon request.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-surface-container-lowest/90 backdrop-blur-xl border-t border-outline-variant/30 py-4 px-6 md:px-0 shadow-[0_-8px_30px_rgb(0,0,0,0.5)]">
        <div className="max-w-container-max mx-auto flex items-center justify-between gap-6">
          <div className={`flex items-center bg-surface-container-highest rounded-full p-1 border border-outline-variant/40 ${
            !product.available ? "opacity-40 cursor-not-allowed" : ""
          }`}>
            <button
              onClick={handleDecrement}
              disabled={!product.available}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface disabled:pointer-events-none"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-headline text-xl font-bold text-on-surface">
              {product.available ? quantity : 0}
            </span>
            <button
              onClick={handleIncrement}
              disabled={!product.available}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white shadow-md ${
                !product.available
                  ? "bg-outline-variant/30 text-on-surface-variant/40 shadow-none cursor-not-allowed disabled:pointer-events-none"
                  : "bg-primary shadow-primary/20 animate-none"
              }`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.available || addToCartMutation.isPending}
            className={`flex-1 max-w-md py-3.5 px-6 rounded-full font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all text-sm ${
              !product.available
                ? "bg-outline-variant/30 text-on-surface-variant/40 shadow-none cursor-not-allowed"
                : "bg-primary hover:bg-primary/95 text-white shadow-xl shadow-primary/20"
            }`}
          >
            {!product.available ? (
              <span>Out Of Stock</span>
            ) : addToCartMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding to Cart...
              </>
            ) : (
              <>
                 <span>Add to Cart</span>
                 <span className="opacity-40">•</span>
                 <span>₹{(product.price + (selectedAddon?.price || 0)) * quantity}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
