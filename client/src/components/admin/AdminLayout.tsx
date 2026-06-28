import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { AdminSidebar } from "./AdminSidebar"
import { AdminTopbar } from "./AdminTopbar"

export const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background text-on-background font-body antialiased flex">
      {/* Sidebar (desktop only) */}
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
