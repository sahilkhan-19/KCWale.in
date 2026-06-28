import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

interface AdminRouteProps {
  children: React.ReactNode
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-on-surface">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <span className="mt-4 font-medium text-sm text-on-surface-variant">Loading session...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== "admin") {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
