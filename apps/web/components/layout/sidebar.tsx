"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  FolderOpen,
  Compass,
  CheckSquare,
  Settings,
  LogOut,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/app/store/auth.store"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Projects", href: "/projects", icon: FolderOpen },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "My Tasks", href: "/tasks", icon: CheckSquare },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  const handleSignOut = () => {
    clearAuth()
    router.push("/login")
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  return (
    <aside className="w-[220px] h-screen border-r border-zinc-100 bg-white flex flex-col shrink-0 fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-5 h-14 flex items-center border-b border-zinc-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-zinc-900 tracking-tight text-sm">NexCore</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest px-3 py-2">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== "/projects" && pathname.startsWith(item.href + "/")) ||
            (item.href === "/projects" && pathname.startsWith("/projects/"))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                isActive
                  ? "bg-zinc-900 text-white font-medium"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-100 px-3 pt-3 pb-4 space-y-0.5 shrink-0">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>

        {/* User chip */}
        <div className="mt-2 px-2 py-2.5 flex items-center gap-2.5 rounded-lg bg-zinc-50">
          <div className="w-7 h-7 rounded-full bg-zinc-900 text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-900 truncate leading-tight">
              {user?.name || "User"}
            </p>
            <p className="text-[11px] text-zinc-400 truncate leading-tight">
              {user?.email || ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}