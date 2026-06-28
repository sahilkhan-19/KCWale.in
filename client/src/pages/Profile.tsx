import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../contexts/AuthContext"
import { orderService } from "../services/order.service"
import { apiClient } from "../api/client"
import {
  User as UserIcon,
  MapPin,
  Receipt,
  Lock,
  LogOut,
  HelpCircle,
  ShieldCheck,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Smartphone,
  Mail,
  ChevronRight,
  ShieldAlert,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../components/ui/dialog"
import { LocationPicker } from "../components/LocationPicker"
import type { DeliveryAddress, Coordinates } from "../components/LocationPicker"
import { toast } from "sonner"

export const Profile: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, logout, updateProfile } = useAuth()

  // Modal / Dialog states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  // Edit Profile Inputs
  const [editName, setEditName] = useState(user?.name || "")
  const [editPhone, setEditPhone] = useState(user?.phone || "")

  // Address Inputs (stored in temp state for LocationPicker inside Dialog)
  const [tempAddress, setTempAddress] = useState<DeliveryAddress>(() => {
    const saved = localStorage.getItem("kcwale_address")
    const defaultAddress = {
      house: "",
      floor: "",
      building: "",
      street: "",
      area: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      apartment: "",
    }
    if (saved) {
      try {
        return { ...defaultAddress, ...JSON.parse(saved) }
      } catch (e) {
        return defaultAddress
      }
    }
    return defaultAddress
  })

  const [tempCoords, setTempCoords] = useState<Coordinates | null>(() => {
    const saved = localStorage.getItem("kcwale_coords")
    return saved ? JSON.parse(saved) : null
  })

  const [tempGpsAccuracy, setTempGpsAccuracy] = useState<number | null>(() => {
    const saved = localStorage.getItem("kcwale_gps_accuracy")
    return saved ? parseFloat(saved) : null
  })

  // Change Password Inputs
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Sync edits if user context updates
  useEffect(() => {
    if (user) {
      setEditName(user.name)
      setEditPhone(user.phone || "")
    }
  }, [user])

  // Get orders to compute counts
  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["profileOrders"],
    queryFn: () => orderService.getOrders({ limit: 1000 }),
    retry: 1,
  })

  const orders = ordersData?.orders || []

  // Count helper
  const totalOrders = orders.length
  const ordersDelivered = orders.filter((o) => o.status === "delivered").length
  const ordersInProgress = orders.filter((o) =>
    ["pending", "confirmed", "preparing", "out_for_delivery"].includes(o.status)
  ).length
  const ordersCancelled = orders.filter((o) => o.status === "cancelled").length

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      return await updateProfile(data.name, user?.email, data.phone, user?.address)
    },
    onSuccess: () => {
      toast.success("Profile details updated successfully")
      setIsEditProfileOpen(false)
      queryClient.invalidateQueries({ queryKey: ["userProfile"] })
    },
    onError: (err: any) => {
      toast.error(err || "Failed to update profile details")
    },
  })

  const handleEditProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) {
      toast.error("Name is required")
      return
    }
    if (!editPhone.trim()) {
      toast.error("Phone number is required")
      return
    }
    updateProfileMutation.mutate({ name: editName, phone: editPhone })
  }

  // Address Dialog actions
  const handleSaveAddress = async () => {
    const isComplete =
      tempAddress.house.trim().length > 0 &&
      tempAddress.street.trim().length > 0 &&
      tempAddress.area.trim().length > 0 &&
      tempAddress.city.trim().length > 0 &&
      tempAddress.state.trim().length > 0 &&
      tempAddress.pincode.trim().length > 0

    if (!isComplete) {
      toast.error("Please fill in all required address fields.")
      return
    }

    // Save to local storage
    localStorage.setItem("kcwale_address", JSON.stringify(tempAddress))
    if (tempCoords) {
      localStorage.setItem("kcwale_coords", JSON.stringify(tempCoords))
    } else {
      localStorage.removeItem("kcwale_coords")
    }
    if (tempGpsAccuracy !== null) {
      localStorage.setItem("kcwale_gps_accuracy", String(tempGpsAccuracy))
    } else {
      localStorage.removeItem("kcwale_gps_accuracy")
    }

    // Sync to user profile on backend
    try {
      const formatted = `${tempAddress.house}, ${tempAddress.street}, ${tempAddress.area}, ${tempAddress.city} - ${tempAddress.pincode}`
      await updateProfile(user?.name, user?.email, user?.phone, formatted)
      toast.success("Delivery address saved successfully")
      setIsEditAddressOpen(false)
    } catch (err: any) {
      toast.error(err || "Failed to sync address to profile")
    }
  }

  // Password Dialog actions
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      toast.error("Current password is required")
      return
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsChangingPassword(true)
    try {
      await apiClient.put("/auth/change-password", {
        currentPassword,
        newPassword,
      })
      toast.success("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setIsChangePasswordOpen(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Member Since formatting
  const getMemberSinceDate = () => {
    if (!user) return ""
    // Load profile manually if timestamps aren't directly inside Auth user context
    const profileDate = (user as any).createdAt
    if (!profileDate) return "Recent Craver"
    const date = new Date(profileDate)
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  // Initial generation helper
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Profile Header */}
      <section className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
          {/* Avatar */}
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-headline text-3xl font-extrabold shadow-md border-4 border-background select-none">
            {user?.name ? getInitials(user.name) : <UserIcon className="w-10 h-10" />}
          </div>
          <div className="space-y-1.5">
            <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-on-background">
              {user?.name}
            </h1>
            <p className="text-on-surface-variant text-xs md:text-sm font-medium flex items-center justify-center md:justify-start gap-1">
              <Mail className="w-3.5 h-3.5 text-primary" /> {user?.email}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 pt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3" /> Verified Account
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[10px] font-bold">
                Customer
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end justify-between gap-4 self-stretch md:self-auto">
          <div className="text-xs text-on-surface-variant flex items-center gap-1 font-medium bg-surface-container/45 px-3 py-1.5 rounded-full border border-outline-variant/20">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Craver Since: <span className="font-extrabold text-on-surface">{getMemberSinceDate()}</span></span>
          </div>

          <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-full md:w-auto h-9 text-xs border-outline-variant/40 hover:bg-surface-container font-extrabold">
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-surface-container border-outline-variant/30 text-on-surface">
              <DialogHeader>
                <DialogTitle className="font-headline text-lg font-extrabold">Edit Profile Details</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditProfileSubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">Full Name</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-surface-container-high border-outline-variant/40 text-sm font-semibold rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">Mobile Number</label>
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Enter mobile number"
                    className="bg-surface-container-high border-outline-variant/40 text-sm font-semibold rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant/40 uppercase">Email (Read Only)</label>
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="bg-surface-container-high/40 border-outline-variant/20 text-sm font-semibold rounded-xl opacity-60 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-on-surface-variant/65">
                    Email address is verified and cannot be changed.
                  </p>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="ghost" size="sm" className="font-extrabold text-xs">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-primary text-white hover:bg-primary/95 font-extrabold text-xs px-5 rounded-xl shadow-lg shadow-primary/10"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Order Summary Statistics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {isOrdersLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 shadow-md space-y-2.5 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-surface-container-high"></div>
              <div className="h-4 bg-surface-container-high rounded w-2/3"></div>
              <div className="h-6 bg-surface-container-high rounded w-1/3 pt-1"></div>
            </div>
          ))
        ) : (
          <>
            <Card className="bg-surface-container-low border-outline-variant/20 shadow-md hover:-translate-y-1 transition-transform">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-bold text-on-surface-variant uppercase">Total Orders</span>
                <Receipt className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-on-background font-headline">{totalOrders}</div>
                <p className="text-[10px] text-on-surface-variant mt-1">Orders placed so far</p>
              </CardContent>
            </Card>

            <Card className="bg-surface-container-low border-outline-variant/20 shadow-md hover:-translate-y-1 transition-transform">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-bold text-on-surface-variant uppercase">Delivered</span>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-on-background font-headline">{ordersDelivered}</div>
                <p className="text-[10px] text-on-surface-variant mt-1">Meals successfully savored</p>
              </CardContent>
            </Card>

            <Card className="bg-surface-container-low border-outline-variant/20 shadow-md hover:-translate-y-1 transition-transform">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-bold text-on-surface-variant uppercase">Active</span>
                <Clock className="w-5 h-5 text-orange-500 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-on-background font-headline">{ordersInProgress}</div>
                <p className="text-[10px] text-on-surface-variant mt-1">Piping hot on the way</p>
              </CardContent>
            </Card>

            <Card className="bg-surface-container-low border-outline-variant/20 shadow-md hover:-translate-y-1 transition-transform">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-bold text-on-surface-variant uppercase">Cancelled</span>
                <XCircle className="w-5 h-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-on-background font-headline">{ordersCancelled}</div>
                <p className="text-[10px] text-on-surface-variant mt-1">Orders cancelled</p>
              </CardContent>
            </Card>
          </>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Left Columns: Info & Address */}
        <div className="md:col-span-2 space-y-6 md:space-y-8 text-left">
          {/* Personal Info */}
          <Card className="bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-lg p-6 space-y-4">
            <h2 className="text-lg font-extrabold text-on-surface border-b border-outline-variant/10 pb-3 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-on-surface">
              <div className="space-y-1">
                <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider">Full Name</span>
                <p className="text-sm font-extrabold text-on-surface">{user?.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider">Mobile Number</span>
                <p className="text-sm font-extrabold text-on-surface">{user?.phone || "Not Configured"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider">Email Address</span>
                <p className="text-sm font-extrabold text-on-surface">{user?.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-wider">Account Status</span>
                <p className="text-sm font-extrabold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Active
                </p>
              </div>
            </div>
          </Card>

          {/* Delivery Address */}
          <Card className="bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
              <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Saved Delivery Address
              </h2>

              <Dialog open={isEditAddressOpen} onOpenChange={setIsEditAddressOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-8 text-xs font-extrabold text-primary hover:bg-primary/10">
                    Edit Address
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-surface-container border-outline-variant/30 text-on-surface max-w-xl md:max-w-2xl overflow-y-auto max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle className="font-headline text-lg font-extrabold">Edit Delivery Location</DialogTitle>
                  </DialogHeader>
                  <div className="pt-2">
                    <LocationPicker
                      address={tempAddress}
                      setAddress={setTempAddress}
                      coordinates={tempCoords}
                      setCoordinates={setTempCoords}
                      gpsAccuracy={tempGpsAccuracy}
                      setGpsAccuracy={setTempGpsAccuracy}
                    />
                    <div className="flex gap-3 justify-end pt-6 border-t border-outline-variant/10 mt-6">
                      <DialogClose asChild>
                        <Button type="button" variant="ghost" size="sm" className="font-extrabold text-xs">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        type="button"
                        onClick={handleSaveAddress}
                        size="sm"
                        className="bg-primary text-white hover:bg-primary/95 font-extrabold text-xs px-5 rounded-xl shadow-lg shadow-primary/10"
                      >
                        Save Address
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-2 text-xs">
                {tempAddress.house ? (
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold text-on-surface">
                      {tempAddress.house}
                      {tempAddress.building ? `, ${tempAddress.building}` : ""}
                      {tempAddress.floor ? `, ${tempAddress.floor}` : ""}
                    </p>
                    <p className="font-semibold text-on-surface-variant">
                      {tempAddress.street}, {tempAddress.area}
                    </p>
                    {tempAddress.landmark && (
                      <p className="font-semibold text-on-surface-variant">
                        <span className="font-bold text-primary">Landmark:</span> {tempAddress.landmark}
                      </p>
                    )}
                    <p className="font-extrabold text-on-surface">
                      {tempAddress.city}, {tempAddress.state} - {tempAddress.pincode}
                    </p>
                    {tempCoords && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold text-[10px] mt-2 select-none border border-emerald-500/20">
                        <span>📍 Verified Delivery Location</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-bold text-on-surface text-sm">No Saved Address</p>
                    <p className="text-on-surface-variant font-medium">
                      Configure a delivery location to experience swift orders and checkout.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Actions & Settings */}
        <div className="space-y-6 text-left">
          {/* Quick Actions */}
          <Card className="bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-lg p-5 space-y-4">
            <h2 className="text-base font-extrabold text-on-surface border-b border-outline-variant/10 pb-3">
              Quick Actions
            </h2>
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/orders")}
                className="w-full h-11 justify-between text-xs font-bold hover:bg-surface-container text-on-surface rounded-xl px-3"
              >
                <span className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-primary" /> My Order History
                </span>
                <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              </Button>

              <Button
                variant="ghost"
                onClick={() => setIsEditAddressOpen(true)}
                className="w-full h-11 justify-between text-xs font-bold hover:bg-surface-container text-on-surface rounded-xl px-3"
              >
                <span className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-primary" /> Delivery Address
                </span>
                <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              </Button>

              <Button
                variant="ghost"
                onClick={() =>
                  toast.info("Help & Support", {
                    description: "Reach us at craves@kcwale.in or call +91 98765 43210 (10 AM - 11 PM)",
                  })
                }
                className="w-full h-11 justify-between text-xs font-bold hover:bg-surface-container text-on-surface rounded-xl px-3"
              >
                <span className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-primary" /> Help & Support
                </span>
                <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              </Button>

              <Button
                variant="ghost"
                onClick={() =>
                  toast.info("Privacy Policy", {
                    description: "Your credential details and delivery location coordinates are securely stored on our servers and never shared with third parties.",
                  })
                }
                className="w-full h-11 justify-between text-xs font-bold hover:bg-surface-container text-on-surface rounded-xl px-3"
              >
                <span className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-primary" /> Privacy Policy
                </span>
                <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              </Button>
            </div>
          </Card>

          {/* Account Actions */}
          <Card className="bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-lg p-5 space-y-4">
            <h2 className="text-base font-extrabold text-on-surface border-b border-outline-variant/10 pb-3">
              Account Actions
            </h2>
            <div className="flex flex-col gap-2.5">
              <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-10 border-outline-variant/40 hover:bg-surface-container text-xs font-extrabold text-on-surface flex items-center justify-center gap-1.5 rounded-xl"
                  >
                    <Lock className="w-4 h-4" /> Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-surface-container border-outline-variant/30 text-on-surface">
                  <DialogHeader>
                    <DialogTitle className="font-headline text-lg font-extrabold">Change Password</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleChangePasswordSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-on-surface-variant uppercase">Current Password</label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-surface-container-high border-outline-variant/40 text-sm font-semibold rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-on-surface-variant uppercase">New Password</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="•••••••• (Min 6 characters)"
                        className="bg-surface-container-high border-outline-variant/40 text-sm font-semibold rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-on-surface-variant uppercase">Confirm New Password</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-surface-container-high border-outline-variant/40 text-sm font-semibold rounded-xl"
                      />
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                      <DialogClose asChild>
                        <Button type="button" variant="ghost" size="sm" className="font-extrabold text-xs">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-primary text-white hover:bg-primary/95 font-extrabold text-xs px-5 rounded-xl shadow-lg shadow-primary/10"
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? "Updating..." : "Update Password"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                onClick={() => {
                  const confirmLogout = window.confirm("Are you sure you want to log out of your account?")
                  if (confirmLogout) {
                    logout()
                    navigate("/")
                    toast.success("Successfully logged out.")
                  }
                }}
                className="w-full h-10 border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-xs font-extrabold text-red-500 flex items-center justify-center gap-1.5 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
