import React, { createContext, useContext, useState, useEffect } from "react"
import { apiClient } from "../api/client"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  role: "customer" | "admin"
  avatar?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  sendOtp: (email: string) => Promise<any>
  login: (email: string, password: string, otp?: string) => Promise<any>
  signup: (name: string, email: string, password: string, phone: string, otp: string) => Promise<any>
  googleAuth: (credential: string) => Promise<any>
  logout: () => void
  updateProfile: (name?: string, email?: string, phone?: string, address?: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = async (currentToken: string) => {
    try {
      const response = await apiClient.get("/auth/profile")
      setUser(response.data.user)
    } catch (error) {
      console.error("Failed to fetch profile", error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchProfile(token)
    } else {
      setIsLoading(false)
    }
  }, [token])

  const sendOtp = async (email: string) => {
    try {
      const response = await apiClient.post("/auth/send-otp", { email })
      return response.data
    } catch (error: any) {
      throw error.response?.data?.message || "Failed to send OTP"
    }
  }

  const login = async (email: string, password: string, otp?: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post("/auth/login", { email, password, otp })
      
      // If requiresOtp is true, the backend sent the OTP and is waiting for it.
      if (response.data.requiresOtp) {
        setIsLoading(false)
        return response.data
      }

      const { token: receivedToken, user: receivedUser } = response.data
      
      localStorage.setItem("token", receivedToken)
      setToken(receivedToken)
      setUser(receivedUser)
      return response.data
    } catch (error: any) {
      throw error.response?.data?.message || "Login failed"
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string, phone: string, otp: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post("/auth/signup", { name, email, password, phone, otp })
      const { token: receivedToken, user: receivedUser } = response.data
      
      localStorage.setItem("token", receivedToken)
      setToken(receivedToken)
      setUser(receivedUser)
      return response.data
    } catch (error: any) {
      throw error.response?.data?.message || "Signup failed"
    } finally {
      setIsLoading(false)
    }
  }

  const googleAuth = async (credential: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post("/auth/google-auth", { credential })
      const { token: receivedToken, user: receivedUser } = response.data
      
      localStorage.setItem("token", receivedToken)
      setToken(receivedToken)
      setUser(receivedUser)
      return response.data
    } catch (error: any) {
      throw error.response?.data?.message || "Google auth failed"
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  const updateProfile = async (name?: string, email?: string, phone?: string, address?: string) => {
    try {
      const response = await apiClient.put("/auth/profile", { name, email, phone, address })
      const updatedUser = response.data.user
      setUser(updatedUser)
      return response.data
    } catch (error: any) {
      throw error.response?.data?.message || "Update profile failed"
    }
  }

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    sendOtp,
    login,
    signup,
    googleAuth,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
