import { apiClient } from "../api/client"
import type { Product } from "./menu.service"

export interface CartItem {
  product: Product
  quantity: number
  selectedAddon?: {
    name: string
    price: number
  }
  _id: string
}

export interface Cart {
  _id: string
  user: string
  items: CartItem[]
  createdAt: string
  updatedAt: string
}

export interface CartResponse {
  message: string
  itemCount: number
  subtotal: number
  cart: Cart
}

export const cartService = {
  getCart: async () => {
    const response = await apiClient.get<CartResponse>("/cart")
    return response.data
  },

  addToCart: async (productId: string, quantity: number = 1, selectedAddon?: { name: string; price: number }) => {
    const response = await apiClient.post<{ message: string; cart: Cart }>("/cart/add", {
      productId,
      quantity,
      selectedAddon,
    })
    return response.data
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    const response = await apiClient.patch<{ message: string; cart: Cart }>(
      `/cart/update-item/${itemId}`,
      { quantity }
    )
    return response.data
  },

  removeCartItem: async (itemId: string) => {
    const response = await apiClient.delete<{ message: string; cart: Cart }>(
      `/cart/remove-item/${itemId}`
    )
    return response.data
  },

  clearCart: async () => {
    const response = await apiClient.delete<{ message: string; cart: Cart }>("/cart/clear")
    return response.data
  },
}
