import { useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import {
  LayoutDashboard, Users, UserCheck, CreditCard, DollarSign,
  BarChart3, Award, Bell, ChevronLeft, ChevronRight,
  LogOut, GraduationCap, BookOpen, Menu, X, Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/students", icon: Users, label: "Students" },
  { to: "/admin/teachers", icon: UserCheck, label: "Teachers" },
  { to: "/admin/classes", icon: BookOpen, label: "Classes & Subjects" },
  { to: "/admin/fees", icon: CreditCard, label: "Fee Management" },
  { to: "/admin/salary", icon: DollarSign, label: "Salary Management" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/certificates", icon: Award, label: "Certificates" },
  { to: "/admin/notifications", icon: Bell, label: "Notifications" },
  { to: "/admin/promotion", icon: GraduationCap, label: "Promotion" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
]

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 p-6 border-b border-border/50",
        collapsed && "justify-center px-4"
      )}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="text-sm font-bold text-foreground leading-tight">C.N.Mugalkod</p>
            <p className="text-xs text-muted-foreground">Schools ERP</p>
          </div>
        )}
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 pt-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5 text-center">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Admin Panel</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 mt-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn("nav-item", isActive && "active", collapsed && "justify-center px-3")
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border/50">
        <button
          onClick={handleLogout}
          className={cn(
            "nav-item w-full text-red-400 hover:bg-red-500/10 hover:text-red-300",
            collapsed && "justify-center px-3"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-full bg-card border-r border-border/50 transition-all duration-300 flex-shrink-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 bg-card border border-border rounded-full p-1 text-muted-foreground hover:text-foreground hidden md:flex"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-card border-r border-border/50 z-50 transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border/50 bg-card/30 backdrop-blur-sm flex items-center justify-between px-4 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn-icon md:hidden"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-muted-foreground">System Online</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-foreground">Administrator</p>
              <p className="text-xs text-muted-foreground">C.N.Mugalkod Schools</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <span className="text-xs font-bold text-white">A</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background bg-grid">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
