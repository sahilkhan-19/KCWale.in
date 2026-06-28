import React from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { cartService } from "../services/cart.service"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Star, Clock, FileText, Plus, Check } from "lucide-react"
import type { Product } from "../services/menu.service"

interface FoodCardProps {
  product: Product
}

export const FoodCard: React.FC<FoodCardProps> = ({ product }) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  // Helper to determine Veg/Non-Veg
  const isVegProduct = (name: string, category: string) => {
    const lower = `${name} ${category}`.toLowerCase()
    return !(
      lower.includes("chicken") ||
      lower.includes("mutton") ||
      lower.includes("fish") ||
      lower.includes("egg") ||
      lower.includes("non-veg") ||
      lower.includes("beef") ||
      lower.includes("pork")
    )
  }

  // Mutation to add item to cart
  const addToCartMutation = useMutation({
    mutationFn: () => cartService.addToCart(product._id, 1),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      toast.success(`${product.name} added to cart!`, {
        duration: 2000,
        position: "top-center",
        action: {
          label: "View Cart",
          onClick: () => navigate("/cart"),
        },
      })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add item to cart")
    },
  })

  const isVeg = isVegProduct(product.name, product.category)
  const isBestSeller =
    product.name.includes("Paneer") ||
    product.name.includes("Pizza") ||
    product.name.includes("Butter Chicken")

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
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

  // Mock data to match Stitch UI elements
  const ratings = product.name.includes("Pizza") ? 4.8 : product.name.includes("Paneer") ? 4.6 : 4.5
  const prepTime = product.name.includes("Pizza") ? "30 min" : product.name.includes("Roll") ? "18 min" : "15 min"
  const reviewsCount = product.name.includes("Pizza") ? "3.1k" : product.name.includes("Roll") ? "1.2k" : "860"

  return (
    <div
      onClick={() => {
        window.scrollTo(0, 0)
        navigate(`/product/${product._id}`)
      }}
      className={`group bg-surface-container-low rounded-[24px] border border-outline-variant overflow-hidden hover:bg-surface-container transition-all duration-300 flex flex-col h-full shadow-lg cursor-pointer ${
        !product.available ? "opacity-65" : ""
      }`}
    >
      <div className="relative overflow-hidden h-40">
        <img
          src={product.images?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            !product.available ? "filter grayscale-[20%]" : ""
          }`}
        />
        {!product.available && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-red-500/90 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border border-red-400/20">
              Out of Stock
            </span>
          </div>
        )}
        {isBestSeller && product.available && (
          <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
            Best Seller
          </div>
        )}
        <div className="absolute top-4 right-4 w-6 h-6 bg-surface-container-highest rounded-full flex items-center justify-center border border-outline-variant shadow-sm backdrop-blur-sm bg-opacity-70">
          <span
            className={`w-2.5 h-2.5 rounded-sm ${isVeg ? "bg-emerald-500" : "bg-red-500"}`}
          ></span>
        </div>
      </div>

      <div className="flex flex-col flex-grow p-4 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-headline text-lg font-bold text-on-surface line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-1 text-tertiary font-bold text-xs mt-0.5">
            <Star className="w-3.5 h-3.5 fill-current text-tertiary" />
            <span>{ratings}</span>
          </div>
        </div>

        <p className="text-on-surface-variant text-xs line-clamp-2 leading-relaxed">
          {product.description || "Freshly cooked premium meal prepared with select ingredients."}
        </p>

        <div className="flex items-center gap-4 text-[11px] text-on-surface-variant/80 pt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {prepTime}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> {reviewsCount}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-outline-variant/20">
          <span className="text-lg font-extrabold text-on-background">₹{product.price}</span>
          <button
            onClick={handleAdd}
            disabled={!product.available || addToCartMutation.isPending}
            className={`font-bold px-4 py-2 rounded-xl flex items-center gap-1 transition-all active:scale-95 text-xs ${
              !product.available
                ? "bg-outline-variant/30 text-on-surface-variant/40 cursor-not-allowed"
                : "bg-primary/20 text-primary hover:bg-primary hover:text-white"
            }`}
          >
            {!product.available ? (
              <span className="px-1 font-bold text-[10px] uppercase tracking-wider">Out of Stock</span>
            ) : (
              <>
                {addToCartMutation.isPending ? (
                  <Check className="w-3.5 h-3.5 animate-pulse" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
