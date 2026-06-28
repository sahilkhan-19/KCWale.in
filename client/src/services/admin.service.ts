import { apiClient } from "../api/client"
import type { Product } from "./menu.service"

// ==================== Types ====================

export interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pending: number
  confirmed: number
  preparing: number
  out_for_delivery: number
  delivered: number
  cancelled: number
}

export interface DashboardResponse {
  message: string
  stats: DashboardStats
  recentOrders: AdminOrder[]
}

export interface AdminOrderUser {
  _id: string
  name: string
  email: string
  phone?: string
}

export interface AdminOrderItem {
  product: {
    _id: string
    name: string
    images?: string[]
    price?: number
  }
  name: string
  quantity: number
  price: number
  selectedAddon?: {
    name: string
    price: number
  }
  _id: string
}

import type { DeliveryAddress, DeliveryLocation } from "./order.service"

export interface AdminOrder {
  _id: string
  user: AdminOrderUser
  items: AdminOrderItem[]
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

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"

export interface AdminOrdersResponse {
  message: string
  orderCount: number
  orders: AdminOrder[]
  pagination: {
    total: number
    page: number
    pages: number
  }
}

export interface AdminUser {
  _id: string
  name: string
  email: string
  phone?: string
  address?: string
  role: "customer" | "admin"
  googleId?: string
  authProvider: "local" | "google" | "both"
  avatar?: string
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminUsersResponse {
  message: string
  userCount: number
  users: AdminUser[]
  pagination: {
    total: number
    page: number
    pages: number
  }
}

export interface CreateProductData {
  name: string
  description?: string
  price: number
  category: string
  images?: string[]
  available?: boolean
}

export interface UpdateProductData {
  name?: string
  description?: string
  price?: number
  category?: string
  images?: string[]
  available?: boolean
}

// ==================== Service ====================

export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await apiClient.get<DashboardResponse>("/admin/dashboard")
    return response.data
  },

  // Orders
  getAllOrders: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get<AdminOrdersResponse>("/admin/orders", { params })
    return response.data
  },

  getOrderById: async (id: string) => {
    const response = await apiClient.get<{ message: string; order: AdminOrder }>(`/admin/orders/${id}`)
    return response.data.order
  },

  updateOrderStatus: async (id: string, status: OrderStatus) => {
    const response = await apiClient.patch<{ message: string; order: AdminOrder }>(
      `/admin/orders/${id}/status`,
      { status }
    )
    return response.data.order
  },

  updateOrderPaymentStatus: async (id: string, paymentStatus: "pending" | "confirmed" | "failed" | "paid") => {
    const response = await apiClient.patch<{ message: string; order: AdminOrder }>(
      `/admin/orders/${id}/payment-status`,
      { paymentStatus }
    )
    return response.data.order
  },

  // Products (admin)
  createProduct: async (data: CreateProductData) => {
    const response = await apiClient.post<{ message: string; product: Product }>(
      "/admin/products",
      data
    )
    return response.data.product
  },

  updateProduct: async (id: string, data: UpdateProductData) => {
    const response = await apiClient.put<{ message: string; product: Product }>(
      `/admin/products/${id}`,
      data
    )
    return response.data.product
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(`/admin/products/${id}`)
    return response.data
  },

  toggleAvailability: async (id: string) => {
    const response = await apiClient.patch<{ message: string; product: Product }>(
      `/menu/${id}/toggle-availability`
    )
    return response.data.product
  },

  // Products (list — uses public menu endpoint with admin token)
  getAllProducts: async (params?: {
    search?: string
    category?: string
    available?: string
    page?: number
    limit?: number
    sort?: string
  }) => {
    const response = await apiClient.get<{
      message: string
      count: number
      products: Product[]
      pagination: { total: number; page: number; pages: number }
    }>("/menu", { params })
    return response.data
  },

  getCategories: async () => {
    const response = await apiClient.get<{ categories: string[] }>("/menu/categories")
    return response.data.categories
  },

  // Users
  getAllUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get<AdminUsersResponse>("/admin/users", { params })
    return response.data
  },

  getSingleUser: async (id: string) => {
    const response = await apiClient.get<{ message: string; user: AdminUser }>(`/admin/users/${id}`)
    return response.data.user
  },

  updateUserRole: async (id: string, role: "customer" | "admin") => {
    const response = await apiClient.patch<{ message: string; user: AdminUser }>(
      `/admin/users/${id}/role`,
      { role }
    )
    return response.data.user
  },

  // Global Settings
  getSystemSettings: async () => {
    const response = await apiClient.get<SystemSettings>("/menu/settings")
    return response.data
  },

  updateSystemSettings: async (data: SystemSettings) => {
    const response = await apiClient.put<{ message: string; settings: SystemSettings }>(
      "/admin/settings",
      data
    )
    return response.data.settings
  },
}

export interface SystemSettings {
  storeOpen: boolean
  taxRate: number
  deliveryFee: number
  freeDeliveryThreshold: number
}
