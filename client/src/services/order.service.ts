import { apiClient } from "../api/client"
import type { Product } from "./menu.service"

export interface OrderItem {
  product: Product
  name: string
  quantity: number
  price: number
  selectedAddon?: {
    name: string
    price: number
  }
  _id: string
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"

export interface DeliveryAddress {
  house: string
  apartment?: string
  street: string
  landmark?: string
  city: string
  pincode: string
}

export interface DeliveryLocation {
  latitude: number
  longitude: number
}

export interface Order {
  _id: string
  user: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  deliveryAddress: DeliveryAddress
  paymentMethod: "COD" | "ONLINE"
  paymentStatus: "pending" | "confirmed" | "failed" | "paid"
  razorpayOrderId?: string
  razorpayPaymentId?: string
  deliveryLocation?: DeliveryLocation
  distanceInKm?: number
  estimatedDuration?: number
  deliveryCharge?: number
  createdAt: string
  updatedAt: string
}

export interface OrdersResponse {
  message: string
  orderCount: number
  orders: Order[]
  pagination: {
    total: number
    page: number
    pages: number
  }
}

export const orderService = {
  placeOrder: async (payload: {
    deliveryAddress: DeliveryAddress
    deliveryLocation: DeliveryLocation
    paymentMethod: "COD" | "ONLINE"
  }) => {
    const response = await apiClient.post<{ message: string; order: Order }>("/orders/checkout", payload)
    return response.data.order
  },

  getOrders: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get<OrdersResponse>("/orders", { params })
    return response.data
  },

  getSingleOrder: async (id: string) => {
    const response = await apiClient.get<{ order: Order }>(`/orders/${id}`)
    return response.data.order
  },

  cancelOrder: async (id: string) => {
    const response = await apiClient.put<{ message: string; order: Order }>(`/orders/cancel/${id}`)
    return response.data.order
  },

  calculateDelivery: async (latitude: number, longitude: number) => {
    const response = await apiClient.post<{
      distanceInKm: number
      estimatedDuration: number
      deliveryCharge: number
      allowed: boolean
      isFallback: boolean
    }>("/orders/calculate-delivery", { latitude, longitude })
    return response.data
  },

  // Razorpay payment integration helpers
  createRazorpayOrder: async (payload: {
    deliveryAddress: DeliveryAddress
    deliveryLocation: DeliveryLocation
  }) => {
    const response = await apiClient.post<{
      message: string
      amount: number
      currency: string
      razorpayOrderId: string
      key: string
    }>("/payments/create-order", payload)
    return response.data
  },

  verifyPayment: async (data: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
    deliveryAddress: DeliveryAddress
    deliveryLocation: DeliveryLocation
  }) => {
    const response = await apiClient.post<{ message: string; order: Order }>("/payments/verify", data)
    return response.data.order
  },
}
