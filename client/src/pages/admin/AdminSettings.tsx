import React, { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminService } from "../../services/admin.service"
import type { SystemSettings } from "../../services/admin.service"
import { apiClient } from "../../api/client"
import {
  Settings,
  Store,
  Percent,
  Truck,
  Shield,
  User,
  Save,
  Lock,
  Mail,
  Loader2,
  Key,
  Users,
  ShieldAlert,
  Globe,
  Search,
  CheckCircle,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { toast } from "sonner"

export const AdminSettings: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Tab state
  const [activeTab, setActiveTab] = useState<"store" | "security" | "integrations">("store")

  // Form states for Store settings
  const [storeOpen, setStoreOpen] = useState(true)
  const [taxRate, setTaxRate] = useState("5")
  const [deliveryFee, setDeliveryFee] = useState("40")
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState("499")

  // Form states for Password Change
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Roles roster states
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch settings from server
  const { data: serverSettings, isLoading } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: adminService.getSystemSettings,
  })

  // Fetch users for role management
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["adminSettingsUsers", currentPage, searchQuery],
    queryFn: () =>
      adminService.getAllUsers({
        search: searchQuery || undefined,
        page: currentPage,
        limit: 5,
      }),
    enabled: activeTab === "security",
  })

  const users = usersData?.users || []
  const totalPages = usersData?.pagination?.pages || 1

  // Set state when data is loaded
  useEffect(() => {
    if (serverSettings) {
      setStoreOpen(serverSettings.storeOpen)
      setTaxRate(String(serverSettings.taxRate))
      setDeliveryFee(String(serverSettings.deliveryFee))
      setFreeDeliveryThreshold(String(serverSettings.freeDeliveryThreshold))
      // Backwards compatibility for local storage fallback
      localStorage.setItem("admin_store_open", String(serverSettings.storeOpen))
      localStorage.setItem("admin_tax_rate", String(serverSettings.taxRate))
      localStorage.setItem("admin_delivery_fee", String(serverSettings.deliveryFee))
      localStorage.setItem("admin_free_delivery_threshold", String(serverSettings.freeDeliveryThreshold))
    }
  }, [serverSettings])

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: (data: SystemSettings) => adminService.updateSystemSettings(data),
    onSuccess: (updatedSettings) => {
      toast.success("Store settings saved globally!")
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] })
      // Sync local storage as fallback
      localStorage.setItem("admin_store_open", String(updatedSettings.storeOpen))
      localStorage.setItem("admin_tax_rate", String(updatedSettings.taxRate))
      localStorage.setItem("admin_delivery_fee", String(updatedSettings.deliveryFee))
      localStorage.setItem("admin_free_delivery_threshold", String(updatedSettings.freeDeliveryThreshold))
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save settings to server")
    },
  })

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "customer" | "admin" }) =>
      adminService.updateUserRole(userId, role),
    onSuccess: (updatedUser) => {
      toast.success(`Role for ${updatedUser.name} updated to ${updatedUser.role.toUpperCase()}`)
      queryClient.invalidateQueries({ queryKey: ["adminSettingsUsers"] })
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] })
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update user role")
    },
  })

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate({
      storeOpen,
      taxRate: Number(taxRate),
      deliveryFee: Number(deliveryFee),
      freeDeliveryThreshold: Number(freeDeliveryThreshold),
    })
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }

    setIsChangingPassword(true)
    try {
      await apiClient.put("/auth/change-password", {
        currentPassword: currentPassword || undefined,
        newPassword,
      })
      toast.success("Password updated successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleRoleChange = (userId: string, userName: string, targetRole: "customer" | "admin") => {
    const isCurrentAdmin = userId === user?.id || userId === (user as any)?._id
    if (isCurrentAdmin) {
      toast.error("You cannot change your own role to prevent lockout.")
      return
    }

    const confirmAction = window.confirm(
      `Are you sure you want to change ${userName}'s role to ${targetRole.toUpperCase()}?`
    )

    if (confirmAction) {
      updateRoleMutation.mutate({ userId, role: targetRole })
    }
  }

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Admin Settings</h1>
        <p className="text-sm text-on-surface-variant">Configure shop parameters, taxes, and system settings</p>
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs text-on-surface-variant font-medium">Fetching settings from server...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Settings categories navigation sidebar */}
          <div className="md:col-span-1 bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 space-y-1 self-start">
            <button
              type="button"
              onClick={() => setActiveTab("store")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors ${
                activeTab === "store" ? "bg-primary/10 text-primary" : "hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Store className="w-4 h-4" />
              Store Operations
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors ${
                activeTab === "security" ? "bg-primary/10 text-primary" : "hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Shield className="w-4 h-4" />
              Security & Roles
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("integrations")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors ${
                activeTab === "integrations" ? "bg-primary/10 text-primary" : "hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Settings className="w-4 h-4" />
              System Integrations
            </button>
          </div>

          {/* Main Settings Panel */}
          <div className="md:col-span-2 space-y-6">
            {activeTab === "store" && (
              <>
                {/* Card: Store config */}
                <form onSubmit={handleSaveStoreSettings} className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-6">
                  <h2 className="text-md font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/10 pb-3">
                    <Store className="w-4.5 h-4.5 text-primary" />
                    Store Configurations
                  </h2>

                  <div className="space-y-4">
                    {/* Store Open Status */}
                    <div className="flex items-center justify-between p-3.5 bg-surface-container rounded-2xl border border-outline-variant/10">
                      <div className="space-y-0.5 pr-4">
                        <h4 className="text-xs font-bold text-on-surface">Store Status</h4>
                        <p className="text-[10px] text-on-surface-variant leading-relaxed">
                          Set whether the store is open and taking orders. Customers cannot place orders when closed.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStoreOpen(!storeOpen)}
                        disabled={saveMutation.isPending}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          storeOpen ? "bg-primary" : "bg-outline-variant"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface-container-low shadow ring-0 transition duration-200 ease-in-out ${
                            storeOpen ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Grid fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Tax rate */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5" /> Tax Rate (%)
                        </label>
                        <Input
                          type="number"
                          value={taxRate}
                          onChange={(e) => setTaxRate(e.target.value)}
                          disabled={saveMutation.isPending}
                          className="bg-surface-container border-outline-variant/30 text-on-surface focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
                        />
                      </div>

                      {/* Delivery Fee */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" /> Base Delivery Fee (₹)
                        </label>
                        <Input
                          type="number"
                          value={deliveryFee}
                          onChange={(e) => setDeliveryFee(e.target.value)}
                          disabled={saveMutation.isPending}
                          className="bg-surface-container border-outline-variant/30 text-on-surface focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
                        />
                      </div>
                     </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={saveMutation.isPending}
                      className="bg-primary hover:bg-primary/95 text-primary-foreground flex items-center gap-2 rounded-xl text-xs font-bold px-6 py-2.5"
                    >
                      {saveMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Save Store Settings
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Card: Admin session info */}
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-4">
                  <h2 className="text-md font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/10 pb-3">
                    <User className="w-4.5 h-4.5 text-primary" />
                    Administrator Account
                  </h2>

                  <div className="space-y-3.5 text-xs text-on-surface">
                    <div className="flex items-start gap-3">
                      <User className="w-4.5 h-4.5 text-on-surface-variant mt-0.5" />
                      <div>
                        <p className="font-semibold text-on-surface-variant">Name</p>
                        <p className="font-bold">{user?.name || "Administrator"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="w-4.5 h-4.5 text-on-surface-variant mt-0.5" />
                      <div>
                        <p className="font-semibold text-on-surface-variant">Email</p>
                        <p className="font-bold">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Shield className="w-4.5 h-4.5 text-on-surface-variant mt-0.5" />
                      <div>
                        <p className="font-semibold text-on-surface-variant">Permissions</p>
                        <p className="font-bold capitalize">{user?.role} Access (Read, Write, Update, Delete)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "security" && (
              <>
                {/* Card: Change Password */}
                <form onSubmit={handleChangePassword} className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-6">
                  <h2 className="text-md font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/10 pb-3">
                    <Key className="w-4.5 h-4.5 text-primary" />
                    Change Admin Password
                  </h2>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-bold text-on-surface-variant">Current Password</label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-surface-container border-outline-variant/30 text-on-surface focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
                      />
                      <p className="text-[10px] text-on-surface-variant/70">
                        Leave blank if your account was created with Google and you don't have a password yet.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-bold text-on-surface-variant">New Password</label>
                        <Input
                          type="password"
                          placeholder="Min 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="bg-surface-container border-outline-variant/30 text-on-surface focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-on-surface-variant">Confirm New Password</label>
                        <Input
                          type="password"
                          placeholder="Must match exactly"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="bg-surface-container border-outline-variant/30 text-on-surface focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isChangingPassword}
                      className="bg-primary hover:bg-primary/95 text-primary-foreground flex items-center gap-2 rounded-xl text-xs font-bold px-6 py-2.5"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" /> Update Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Card: Team Roles & Management */}
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-6">
                  <div className="border-b border-outline-variant/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="text-md font-bold text-on-surface flex items-center gap-2">
                      <Users className="w-4.5 h-4.5 text-primary" />
                      Security & Team Roles
                    </h2>
                    <p className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                      Access Control console
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          setCurrentPage(1)
                        }}
                        placeholder="Search users to update roles..."
                        className="w-full text-xs bg-surface-container border border-outline-variant/30 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary text-on-surface"
                      />
                    </div>

                    {/* Users list */}
                    {isLoadingUsers ? (
                      <div className="space-y-2 py-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-14 bg-surface-container rounded-xl animate-pulse"></div>
                        ))}
                      </div>
                    ) : users.length === 0 ? (
                      <div className="p-6 text-center text-xs text-on-surface-variant bg-surface-container rounded-xl border border-outline-variant/5">
                        No users found.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {users.map((item: any) => {
                          const initials = item.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase() || "U"

                          const loggedInUserId = user?.id || (user as any)?._id
                          const isSelf = !!loggedInUserId && (item._id === loggedInUserId || item.id === loggedInUserId)

                          return (
                            <div
                              key={item._id}
                              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl border transition-colors ${
                                isSelf
                                  ? "bg-primary/5 border-primary/20"
                                  : "bg-surface-container border-outline-variant/10 hover:border-outline-variant/35"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-[10px] font-extrabold text-primary">
                                  {initials}
                                </span>
                                <div>
                                  <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                                    {item.name}
                                    {isSelf && (
                                      <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-full font-bold">
                                        You (Self)
                                      </span>
                                    )}
                                  </h4>
                                  <p className="text-[10px] text-on-surface-variant">{item.email}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                <select
                                  value={item.role}
                                  disabled={isSelf || updateRoleMutation.isPending}
                                  onChange={(e) =>
                                    handleRoleChange(item._id, item.name, e.target.value as "customer" | "admin")
                                  }
                                  className="text-[11px] font-bold border border-outline-variant/30 bg-surface-container-high rounded-lg px-2.5 py-1.5 focus:outline-none text-on-surface disabled:opacity-50"
                                >
                                  <option value="customer">Customer</option>
                                  <option value="admin">Administrator</option>
                                </select>
                              </div>
                            </div>
                          )
                        })}

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex justify-end gap-2 pt-2">
                            <Button
                              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              variant="outline"
                              className="text-[10px] px-3 py-1.5 h-auto rounded-lg"
                            >
                              Previous
                            </Button>
                            <span className="text-[10px] text-on-surface-variant flex items-center px-1 font-semibold">
                              Page {currentPage} of {totalPages}
                            </span>
                            <Button
                              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              variant="outline"
                              className="text-[10px] px-3 py-1.5 h-auto rounded-lg"
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === "integrations" && (
              <div className="space-y-6">
                {/* Razorpay gateway status */}
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4 border-b border-outline-variant/10 pb-3">
                    <div>
                      <h2 className="text-md font-bold text-on-surface flex items-center gap-2">
                        <Globe className="w-4.5 h-4.5 text-primary" />
                        Razorpay Payment Gateway
                      </h2>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">
                        Manage Razorpay API keys and checkout integrations.
                      </p>
                    </div>
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5" /> Configured
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-on-surface">
                    <div className="p-3 bg-surface-container rounded-xl space-y-1">
                      <p className="font-semibold text-on-surface-variant text-[10px]">Integration Mode</p>
                      <p className="font-bold text-primary">Test Mode</p>
                    </div>
                    <div className="p-3 bg-surface-container rounded-xl space-y-1">
                      <p className="font-semibold text-on-surface-variant text-[10px]">Webhook Web Status</p>
                      <p className="font-bold text-emerald-400">Listening (OK)</p>
                    </div>
                  </div>
                </div>

                {/* Resend Server status */}
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4 border-b border-outline-variant/10 pb-3">
                    <div>
                      <h2 className="text-md font-bold text-on-surface flex items-center gap-2">
                        <Mail className="w-4.5 h-4.5 text-primary" />
                        Resend Mail Server
                      </h2>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">
                        Notification routing via Resend API.
                      </p>
                    </div>
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5" /> API Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-on-surface">
                    <div className="p-3 bg-surface-container rounded-xl space-y-1">
                      <p className="font-semibold text-on-surface-variant text-[10px]">Email Provider</p>
                      <p className="font-bold font-mono">Resend</p>
                    </div>
                    <div className="p-3 bg-surface-container rounded-xl space-y-1">
                      <p className="font-semibold text-on-surface-variant text-[10px]">Integration Type</p>
                      <p className="font-bold">REST SDK</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
