import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { AuthProvider } from "./contexts/AuthContext"
import { Header } from "./components/Header"
import { BottomNav } from "./components/BottomNav"
import { Footer } from "./components/Footer"
import { GetInTouch } from "./components/GetInTouch"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { AdminRoute } from "./components/AdminRoute"
import { AdminLayout } from "./components/admin/AdminLayout"
import { Home } from "./pages/Home"
import { Menu } from "./pages/Menu"
import { ProductDetails } from "./pages/ProductDetails"
import { Cart } from "./pages/Cart"
import { Checkout } from "./pages/Checkout"
import { OrderSuccess } from "./pages/OrderSuccess"
import { OrderHistory } from "./pages/OrderHistory"
import { OrderTracking } from "./pages/OrderTracking"
import { Login } from "./pages/Login"
import { Signup } from "./pages/Signup"
import { Unauthorized } from "./pages/Unauthorized"
import { NotFound } from "./pages/NotFound"
import { Profile } from "./pages/Profile"

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { AdminOrders } from "./pages/admin/AdminOrders"
import { AdminOrderDetail } from "./pages/admin/AdminOrderDetail"
import { AdminProducts } from "./pages/admin/AdminProducts"
import { AdminProductForm } from "./pages/admin/AdminProductForm"
import { AdminCustomers } from "./pages/admin/AdminCustomers"
import { AdminCustomerDetail } from "./pages/admin/AdminCustomerDetail"
import { AdminAnalytics } from "./pages/admin/AdminAnalytics"
import { AdminSettings } from "./pages/admin/AdminSettings"

import { Toaster } from "./components/ui/sonner"

// Initialize TanStack React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function AppContent() {
  const location = useLocation()
  const isAuthPage = ["/login", "/signup"].includes(location.pathname)
  const isAdminPage = location.pathname.startsWith("/admin")
  const hideFooterAndGetInTouch = [
    "/login",
    "/signup",
    "/menu",
    "/cart",
    "/orders",
    "/checkout",
    "/order-success",
    "/unauthorized",
    "/profile"
  ].includes(location.pathname) || 
  location.pathname.startsWith("/order-tracking/") || 
  location.pathname.startsWith("/product/") || 
  isAdminPage

  // Isolated layout shell for Admin console
  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-background text-on-background flex flex-col font-body antialiased">
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers/:id" element={<AdminCustomerDetail />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          {/* Fallback for admin namespace */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
        <Toaster richColors position="top-center" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-body antialiased">
      {/* Header top bar */}
      {!isAuthPage && <Header />}

      {/* Main view container */}
      <main className={isAuthPage ? "flex-grow" : "flex-grow max-w-container-max w-full mx-auto px-6 py-6 md:py-10"}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Customer Routes */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success"
            element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-tracking/:id"
            element={
              <ProtectedRoute>
                <OrderTracking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Fallback redirect */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Get In Touch */}
      {!hideFooterAndGetInTouch && <GetInTouch />}

      {/* Footer */}
      {!hideFooterAndGetInTouch && <Footer />}

      {/* Bottom Nav Bar (Mobile only) */}
      {!isAuthPage && <BottomNav />}

      {/* Toast system notifications */}
      <Toaster richColors position="top-center" />
    </div>
  )
}

// Helper component to scroll window to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()

  React.useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    throw new Error("VITE_GOOGLE_CLIENT_ID is not configured in the environment variables.");
  }
  
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}

export default App


