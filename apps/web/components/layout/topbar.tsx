"use client"

import { Bell, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/app/store/auth.store"
import { NotificationDrawer } from "./notification-drawer"
import { api } from "@/lib/api"

export function Topbar() {
  const { user } = useAuthStore()
  const [unreadCount, setUnreadCount] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  useEffect(() => {
    api
      .get("/api/notifications/unread/count")
      .then((res) => setUnreadCount(res.data.data?.count || 0))
      .catch(() => {})
  }, [])

  return (
    <>
      <header className="h-14 border-b border-zinc-100 bg-white px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            placeholder="Search projects, tasks..."
            className="text-sm text-zinc-600 placeholder:text-zinc-400 bg-transparent outline-none flex-1 w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <Bell className="w-4 h-4 text-zinc-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-zinc-900 text-white text-[11px] font-semibold flex items-center justify-center select-none cursor-pointer">
            {initials}
          </div>
        </div>
      </header>

      <NotificationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onRead={() => setUnreadCount(0)}
      />
    </>
  )
}