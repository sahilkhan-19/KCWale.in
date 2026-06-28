import { apiClient } from "../api/client"

export interface Product {
  _id: string
  name: string
  description?: string
  price: number
  category: string
  images: string[]
  available: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductsResponse {
  products: Product[]
  count: number
  pagination: {
    total: number
    page: number
    pages: number
  }
}

export const menuService = {
  getAllProducts: async (params?: {
    search?: string
    available?: string
    page?: number
    limit?: number
    sort?: string
    category?: string
  }) => {
    const response = await apiClient.get<ProductsResponse>("/menu", { params })
    return response.data
  },

  getCategories: async () => {
    const response = await apiClient.get<{ categories: string[] }>("/menu/categories")
    return response.data.categories
  },

  getFeaturedProducts: async () => {
    const response = await apiClient.get<{ products: Product[] }>("/menu/featured")
    return response.data.products
  },

  getSingleProduct: async (id: string) => {
    const response = await apiClient.get<{ product: Product }>(`/menu/${id}`)
    return response.data.product
  },
}
