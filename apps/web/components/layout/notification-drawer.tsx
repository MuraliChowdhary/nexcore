"use client"

import { useEffect, useState, useRef } from "react"
import { X, Bell, Check, Trash2 } from "lucide-react"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

interface NotificationDrawerProps {
  open: boolean
  onClose: () => void
  onRead: () => void
}

export function NotificationDrawer({ open, onClose, onRead }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setLoading(true)
      api
        .get("/api/notifications")
        .then((res) => setNotifications(res.data.data?.notifications || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [open])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, onClose])

  const markAllRead = async () => {
    await api.patch("/api/notifications/read-all")
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    onRead()
  }

  const markOneRead = async (id: string) => {
    await api.patch(`/api/notifications/${id}/read`)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const deleteOne = async (id: string) => {
    await api.delete(`/api/notifications/${id}`)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/10 z-50 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed right-0 top-0 h-full w-[380px] bg-white border-l border-zinc-100 z-50 flex flex-col transition-transform duration-300 ease-out shadow-xl",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="px-5 h-14 flex items-center justify-between border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-zinc-900" />
            <span className="font-semibold text-zinc-900 text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-zinc-900 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 px-2 py-1 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-50 transition-colors"
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-zinc-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-zinc-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center p-8">
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-700">All caught up</p>
              <p className="text-xs text-zinc-400">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "px-5 py-4 flex gap-3 hover:bg-zinc-50 transition-colors group",
                    !n.read && "bg-blue-50/40"
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-1.5 shrink-0",
                      n.read ? "bg-transparent" : "bg-blue-500"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 leading-snug">
                      {n.title}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[11px] text-zinc-400 mt-1.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => markOneRead(n.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors"
                        title="Mark read"
                      >
                        <Check className="w-3.5 h-3.5 text-zinc-500" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteOne(n.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}