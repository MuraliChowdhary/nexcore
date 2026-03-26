"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/app/store/auth.store"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Users, Search, UserPlus, UserCheck, UserMinus,
  MessageSquare, Clock, Check, X, Bell, Loader2, Send,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

type ConnectionStatus = "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED"

interface Person {
  id: string
  name: string
  bio?: string
  skills: string[]
  avatarUrl?: string
  createdAt: string
  isFollowing: boolean
  connectionStatus: ConnectionStatus
  connectionId: string | null
  _count: { followers: number; following: number }
}

interface PendingRequest {
  connectionId: string
  message?: string
  createdAt: string
  sender: { id: string; name: string; bio?: string; skills: string[] }
}

// ─── Connect Modal ────────────────────────────────────────────────────────────

function ConnectModal({ person, onClose, onSent }: {
  person: Person
  onClose: () => void
  onSent: (id: string) => void
}) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const send = async () => {
    setLoading(true)
    try {
      await api.post(`/api/auth/social/${person.id}/connect`, { message })
      onSent(person.id)
      onClose()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-zinc-100 shadow-xl w-full max-w-sm z-10">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Connect with {person.name}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Add an optional message</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-50">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <textarea
            placeholder="Hi, I'd love to connect and collaborate..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={200}
            className="w-full text-sm border border-zinc-200 rounded-xl px-3 py-2.5 outline-none resize-none placeholder:text-zinc-400 focus:border-zinc-400"
          />
          <p className="text-[11px] text-zinc-300 text-right">{message.length}/200</p>
        </div>
        <div className="px-5 py-4 border-t border-zinc-100 flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-8">Cancel</Button>
          <Button size="sm" onClick={send} disabled={loading} className="text-xs h-8 bg-zinc-900 hover:bg-zinc-800 gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Send invite
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Pending Panel ────────────────────────────────────────────────────────────

function PendingPanel({ requests, onRespond }: {
  requests: PendingRequest[]
  onRespond: (connectionId: string, action: "ACCEPT" | "DECLINE") => void
}) {
  if (requests.length === 0) return null
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4 text-amber-600" />
        <p className="text-sm font-semibold text-amber-900">
          {requests.length} pending connection request{requests.length > 1 ? "s" : ""}
        </p>
      </div>
      <div className="space-y-2">
        {requests.map((r) => (
          <div key={r.connectionId} className="bg-white rounded-xl border border-amber-100 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-900 text-white text-sm font-semibold flex items-center justify-center shrink-0">
              {r.sender.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900">{r.sender.name}</p>
              {r.message
                ? <p className="text-xs text-zinc-500 truncate">"{r.message}"</p>
                : <p className="text-xs text-zinc-400">{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</p>
              }
            </div>
            <div className="flex gap-1.5 shrink-0">
              <Button size="sm" onClick={() => onRespond(r.connectionId, "ACCEPT")} className="h-7 text-xs gap-1 bg-zinc-900 hover:bg-zinc-800">
                <Check className="w-3 h-3" /> Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => onRespond(r.connectionId, "DECLINE")} className="h-7 text-xs gap-1 border-zinc-200 text-zinc-600">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Person Card ──────────────────────────────────────────────────────────────

function PersonCard({ person, onFollow, onUnfollow, onConnect, onMessage, loadingIds }: {
  person: Person
  onFollow: (id: string) => void
  onUnfollow: (id: string) => void
  onConnect: (person: Person) => void
  onMessage: (person: Person) => void
  loadingIds: Set<string>
}) {
  const isLoading = loadingIds.has(person.id)
  const initials = person.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const ConnectButton = () => {
    if (person.connectionStatus === "ACCEPTED") return (
      <Button size="sm" onClick={() => onMessage(person)} className="h-7 text-xs gap-1.5 bg-zinc-900 hover:bg-zinc-800">
        <MessageSquare className="w-3 h-3" /> Message
      </Button>
    )
    if (person.connectionStatus === "PENDING_SENT") return (
      <Button size="sm" variant="outline" disabled className="h-7 text-xs gap-1.5 border-zinc-200 text-zinc-400">
        <Clock className="w-3 h-3" /> Pending
      </Button>
    )
    if (person.connectionStatus === "PENDING_RECEIVED") return (
      <Button size="sm" variant="outline" disabled className="h-7 text-xs gap-1.5 border-amber-200 text-amber-600">
        <Bell className="w-3 h-3" /> Respond
      </Button>
    )
    return (
      <Button size="sm" variant="outline" onClick={() => onConnect(person)} disabled={isLoading}
        className="h-7 text-xs gap-1.5 border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900">
        <UserPlus className="w-3 h-3" /> Connect
      </Button>
    )
  }

  const FollowButton = () => person.isFollowing ? (
    <Button size="sm" variant="outline" onClick={() => onUnfollow(person.id)} disabled={isLoading}
      className="h-7 text-xs gap-1.5 border-zinc-200 text-zinc-600 hover:border-red-200 hover:text-red-600 hover:bg-red-50 group">
      {isLoading
        ? <Loader2 className="w-3 h-3 animate-spin" />
        : <><UserCheck className="w-3 h-3 group-hover:hidden" /><UserMinus className="w-3 h-3 hidden group-hover:block" /></>
      }
      <span className="group-hover:hidden">Following</span>
      <span className="hidden group-hover:inline">Unfollow</span>
    </Button>
  ) : (
    <Button size="sm" onClick={() => onFollow(person.id)} disabled={isLoading} className="h-7 text-xs gap-1.5 bg-zinc-900 hover:bg-zinc-800">
      {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
      Follow
    </Button>
  )

  return (
    <div className="bg-white rounded-xl border border-zinc-100 p-5 hover:border-zinc-200 transition-all duration-150 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-zinc-900 text-white text-sm font-semibold flex items-center justify-center shrink-0 select-none">
          {initials}
        </div>
        {person.connectionStatus === "ACCEPTED" && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-full shrink-0">
            <Check className="w-2.5 h-2.5" /> Connected
          </span>
        )}
      </div>
      {person.bio && <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{person.bio}</p>}
      {person.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {person.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="text-[10px] font-medium text-zinc-600 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded-md">
              {skill}
            </span>
          ))}
          {person.skills.length > 4 && <span className="text-[10px] text-zinc-400 self-center">+{person.skills.length - 4}</span>}
        </div>
      )}
      <div className="flex items-center gap-2 pt-1 border-t border-zinc-50">
        <FollowButton />
        <ConnectButton />
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 p-5 animate-pulse space-y-3 h-[190px]">
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-full bg-zinc-100 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 bg-zinc-100 rounded w-1/2" />
          <div className="h-3 bg-zinc-100 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-zinc-100 rounded w-full" />
        <div className="h-3 bg-zinc-100 rounded w-3/4" />
      </div>
      <div className="flex gap-1">
        <div className="h-5 w-14 bg-zinc-100 rounded-md" />
        <div className="h-5 w-16 bg-zinc-100 rounded-md" />
        <div className="h-5 w-12 bg-zinc-100 rounded-md" />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabType = "all" | "following" | "connected"

export default function PeoplePage() {
  const router = useRouter()
  const { user, _hasHydrated } = useAuthStore()

  const [people, setPeople] = useState<Person[]>([])
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [skillFilter, setSkillFilter] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [connectTarget, setConnectTarget] = useState<Person | null>(null)

  // ── Debug: remove after fix confirmed ──────────────────────────────────────
  useEffect(() => {
    console.log("[PeoplePage] auth state:", { _hasHydrated, userId: user?.id ?? null })
  }, [_hasHydrated, user?.id])

  // ── Auth + fetch ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!_hasHydrated) return
    if (!user) {
      router.push("/login")
      return
    }

    let cancelled = false

   Promise.allSettled([
  api.get("/api/auth/users"),
  api.get("http://localhost:3001/social/connections/pending", {
    headers: {
      "x-user-id": user?.id  // passing directly, bypassing gateway
    }
  }),
]).then(([usersRes, pendingRes]) => {
  if (cancelled) return
  if (usersRes.status === "fulfilled") setPeople(usersRes.value.data.data?.users || [])
  if (pendingRes.status === "fulfilled") setPendingRequests(pendingRes.value.data.data?.requests || [])
  setLoading(false)
})

    return () => { cancelled = true }
  }, [_hasHydrated, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ────────────────────────────────────────────────────────────────

  const setLoaderFor = (id: string, on: boolean) => {
    setLoadingIds((prev) => { const s = new Set(prev); on ? s.add(id) : s.delete(id); return s })
  }

  const handleFollow = async (id: string) => {
    setLoaderFor(id, true)
    try {
      await api.post(`/api/auth/social/${id}/follow`)
      setPeople((prev) => prev.map((p) => p.id === id ? { ...p, isFollowing: true, _count: { ...p._count, followers: p._count.followers + 1 } } : p))
    } finally { setLoaderFor(id, false) }
  }

  const handleUnfollow = async (id: string) => {
    setLoaderFor(id, true)
    try {
      await api.delete(`/api/auth/social/${id}/follow`)
      setPeople((prev) => prev.map((p) => p.id === id ? { ...p, isFollowing: false, _count: { ...p._count, followers: Math.max(0, p._count.followers - 1) } } : p))
    } finally { setLoaderFor(id, false) }
  }

  const handleConnectSent = (targetId: string) => {
    setPeople((prev) => prev.map((p) => p.id === targetId ? { ...p, connectionStatus: "PENDING_SENT" as ConnectionStatus } : p))
  }

  const handleMessage = (person: Person) => {
    alert(`Messaging ${person.name} — coming soon!`)
  }

  const handleRespond = async (connectionId: string, action: "ACCEPT" | "DECLINE") => {
    try {
      await api.patch(`/api/auth/social/connections/${connectionId}/respond`, { action })
      setPendingRequests((prev) => prev.filter((r) => r.connectionId !== connectionId))
      if (action === "ACCEPT") {
        const req = pendingRequests.find((r) => r.connectionId === connectionId)
        if (req) setPeople((prev) => prev.map((p) => p.id === req.sender.id ? { ...p, connectionStatus: "ACCEPTED" as ConnectionStatus } : p))
      }
    } catch (err) { console.error(err) }
  }

  // ── Gate: show spinner until hydration resolves ────────────────────────────
  // This is the key fix — don't render ANYTHING (not even redirect logic)
  // until the store has rehydrated from localStorage
  if (!_hasHydrated) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
      </div>
    )
  }

  // ── Filters ────────────────────────────────────────────────────────────────

  const allSkills = Array.from(new Set(people.flatMap((p) => p.skills || []))).sort()

  const tabFiltered = people.filter((p) => {
    if (activeTab === "following") return p.isFollowing
    if (activeTab === "connected") return p.connectionStatus === "ACCEPTED"
    return true
  })

  const filtered = tabFiltered.filter((p) => {
    const matchesSearch = !search
      || p.name.toLowerCase().includes(search.toLowerCase())
      || p.bio?.toLowerCase().includes(search.toLowerCase())
      || p.skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    const matchesSkill = !skillFilter || p.skills?.includes(skillFilter)
    return matchesSearch && matchesSkill
  })

  const counts = {
    all: people.length,
    following: people.filter((p) => p.isFollowing).length,
    connected: people.filter((p) => p.connectionStatus === "ACCEPTED").length,
  }

  return (
    <>
      <div className="p-6 max-w-[1100px] mx-auto space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-zinc-500" />
            <h1 className="text-xl font-semibold text-zinc-900">People</h1>
          </div>
          <p className="text-sm text-zinc-400">Discover developers and collaborators on NexCore.</p>
        </div>

        {!loading && <PendingPanel requests={pendingRequests} onRespond={handleRespond} />}

        <div className="space-y-3">
          <div className="flex items-center gap-2.5 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 max-w-md focus-within:border-zinc-400 transition-colors">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              placeholder="Search by name, skill, or bio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm text-zinc-700 placeholder:text-zinc-400 bg-transparent outline-none flex-1"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-zinc-400 hover:text-zinc-600 text-xs">Clear</button>
            )}
          </div>

          {allSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSkillFilter(null)}
                className={cn("text-xs font-medium px-2.5 py-1 rounded-lg border transition-all",
                  !skillFilter ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"
                )}
              >
                All skills
              </button>
              {allSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSkillFilter(skillFilter === skill ? null : skill)}
                  className={cn("text-xs font-medium px-2.5 py-1 rounded-lg border transition-all",
                    skillFilter === skill ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1 w-fit">
          {(["all", "following", "connected"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                activeTab === tab ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {tab === "following" && <UserCheck className="w-3 h-3" />}
              {tab === "connected" && <Check className="w-3 h-3" />}
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>

        {!loading && (
          <p className="text-xs text-zinc-400">
            {filtered.length} {filtered.length === 1 ? "person" : "people"} found
            {skillFilter ? ` with skill "${skillFilter}"` : ""}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-700 mb-1">
              {activeTab === "following" ? "Not following anyone yet"
                : activeTab === "connected" ? "No connections yet"
                : "No people found"}
            </p>
            <p className="text-xs text-zinc-400 max-w-xs">
              {activeTab === "all" ? "Try adjusting your search or skill filter."
                : "Switch to All tab to find people to follow or connect with."}
            </p>
            {(search || skillFilter) && (
              <Button size="sm" variant="outline" className="mt-4 text-xs h-8"
                onClick={() => { setSearch(""); setSkillFilter(null) }}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
                onConnect={setConnectTarget}
                onMessage={handleMessage}
                loadingIds={loadingIds}
              />
            ))}
          </div>
        )}
      </div>

      {connectTarget && (
        <ConnectModal
          person={connectTarget}
          onClose={() => setConnectTarget(null)}
          onSent={handleConnectSent}
        />
      )}
    </>
  )
}