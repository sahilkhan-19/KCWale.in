import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Attach JWT token from localStorage to every request if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercept responses to handle auth errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect if session expired or user is unauthorized
      localStorage.removeItem("token")
      // We can also trigger a window event or let contexts handle it
    }
    return Promise.reject(error)
  }
)
