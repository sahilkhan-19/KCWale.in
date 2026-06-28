import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  Users,
  Search,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  Eye,
  Shield,
  Globe,
  Key,
} from "lucide-react"
import { adminService } from "../../services/admin.service"
import { Pagination } from "../../components/admin/Pagination"
import { EmptyState } from "../../components/admin/EmptyState"
import { SearchBar } from "../../components/admin/SearchBar"
import { Button } from "../../components/ui/button"

export const AdminCustomers: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["adminUsers", currentPage, searchQuery],
    queryFn: () =>
      adminService.getAllUsers({
        search: searchQuery || undefined,
        page: currentPage,
        limit: 10,
      }),
  })

  const users = usersData?.users || []
  const totalPages = usersData?.pagination?.pages || 1

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Customer Accounts</h1>
        <p className="text-sm text-on-surface-variant">View and inspect registered users and administrators</p>
      </div>

      {/* Search Bar */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val)
              setCurrentPage(1)
            }}
            placeholder="Search by name, email, or phone number..."
          />
        </div>
        <div className="text-xs text-on-surface-variant flex items-center gap-1.5 font-medium">
          <Users className="w-3.5 h-3.5" />
          Total registered: {usersData?.userCount || 0}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-surface-container rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <EmptyState
              title="No Customers Found"
              description={searchQuery ? `No customer accounts matching "${searchQuery}"` : "No registered accounts yet."}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-outline-variant/10">
                <thead>
                  <tr className="text-left text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Auth Provider</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm text-on-surface">
                  {users.map((user) => {
                    const initials = user.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase() || "U"

                    return (
                      <tr key={user._id} className="hover:bg-surface-container/30 transition-colors align-middle">
                        {/* Name & Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{initials}</span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                                {user.name}
                                {user.isEmailVerified && (
                                  <span className="inline-flex w-3.5 h-3.5 bg-emerald-500/10 text-emerald-400 rounded-full items-center justify-center" title="Email Verified">
                                    <UserCheck className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </h4>
                              <p className="text-[10px] font-mono text-on-surface-variant">ID: {user._id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Contact details */}
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="flex items-center gap-1 text-xs text-on-surface font-semibold">
                            <Mail className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
                            <span className="truncate max-w-[180px]">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1 text-[11px] text-on-surface-variant font-medium">
                              <Phone className="w-3 h-3 text-on-surface-variant shrink-0" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              user.role === "admin"
                                ? "bg-red-500/15 text-red-400 border border-red-500/10"
                                : "bg-blue-500/15 text-blue-400 border border-blue-500/10"
                            }`}
                          >
                            {user.role === "admin" && <Shield className="w-2.5 h-2.5" />}
                            {user.role}
                          </span>
                        </td>

                        {/* Auth Provider */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant capitalize font-medium">
                            {user.authProvider === "google" ? (
                              <>
                                <Globe className="w-3.5 h-3.5 text-blue-400" />
                                Google
                              </>
                            ) : (
                              <>
                                <Key className="w-3.5 h-3.5 text-yellow-400" />
                                Local
                              </>
                            )}
                          </span>
                        </td>

                        {/* Date Joined */}
                        <td className="py-3.5 px-4 text-xs text-on-surface-variant whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(user.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <Link to={`/admin/customers/${user._id}`}>
                            <Button size="sm" variant="outline" className="h-8 border-border hover:bg-surface-container flex items-center gap-1 text-xs">
                              <Eye className="w-3.5 h-3.5" />
                              Inspect
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-outline-variant/10">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
