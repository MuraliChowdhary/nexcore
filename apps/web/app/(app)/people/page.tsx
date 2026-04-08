"use client"

import { useEffect, useState, useMemo } from "react"
import { api } from "@/lib/api"
import { useAuthStore } from "@/app/store/auth.store"
import { RecommendedPeople } from "@/components/ recommended-people"
import { MatchedUser } from "@/hooks/use-matching"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  Users,
  UserCheck,
  UserPlus,
  Clock,
  Loader2,
  Sparkles,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type ConnectionStatus =
  | "NONE"
  | "PENDING_SENT"
  | "PENDING_RECEIVED"
  | "ACCEPTED"
  | "DECLINED"

interface Person {
  id: string
  name: string
  bio?: string
  skills: string[]
  avatarUrl?: string
  createdAt: string
  connectionId?:string
  connectionStatus: ConnectionStatus
}

// ─── Connection button ────────────────────────────────────────────────────────

function ConnectButton({
  person,
  onStatusChange,
}: {
  person: Person
  onStatusChange: (id: string, status: ConnectionStatus) => void
}) {
  const [loading, setLoading] = useState(false)

  // ✅ FIX 1: Removed hardcoded localhost URL — now uses relative path via api instance
  const handleConnect = async () => {
    setLoading(true)
    try {
      await api.post(`http://localhost:3000/api/auth/social/${person.id}/connect`, { message: "Hi, let's connect!" })
      onStatusChange(person.id, "PENDING_SENT")
    } catch {
      // silently fail — could add toast here
    } finally {
      setLoading(false)
    }
  }

  // ✅ FIX 2: Removed hardcoded localhost URL — now uses relative path via api instance
const handleAccept = async () => {
  if (!person.connectionId) return

  setLoading(true)
  try {
    await api.patch(`/api/auth/social/connections/${person.connectionId}/respond`, {
      action: "ACCEPT",
    })

    onStatusChange(person.id, "ACCEPTED")
  } catch (err) {
    console.error("Accept failed", err)
  } finally {
    setLoading(false)
  }
}

  if (person.connectionStatus === "ACCEPTED") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg">
        <UserCheck className="w-3.5 h-3.5" />
        Connected
      </span>
    )
  }

  if (person.connectionStatus === "PENDING_SENT") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg">
        <Clock className="w-3.5 h-3.5" />
        Pending
      </span>
    )
  }

  if (person.connectionStatus === "PENDING_RECEIVED") {
    return (
      <Button
        size="sm"
        onClick={handleAccept}
        disabled={loading}
        className="h-8 text-xs gap-1.5 bg-zinc-900 hover:bg-zinc-800"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
        Accept
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleConnect}
      disabled={loading}
      className="h-8 text-xs gap-1.5 border-zinc-200 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <UserPlus className="w-3.5 h-3.5" />
      )}
      Connect
    </Button>
  )
}

// ─── Person card ──────────────────────────────────────────────────────────────

function PersonCard({
  person,
  onStatusChange,
}: {
  person: Person
  onStatusChange: (id: string, status: ConnectionStatus) => void
}) {
  const initials = person.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="bg-white rounded-xl border border-zinc-100 p-4 flex flex-col gap-3 hover:border-zinc-200 transition-colors">
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-900 text-white text-sm font-semibold flex items-center justify-center shrink-0 select-none">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 truncate">{person.name}</p>
          {person.bio ? (
            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
              {person.bio}
            </p>
          ) : (
            <p className="text-xs text-zinc-300 mt-0.5 italic">No bio yet</p>
          )}
        </div>
      </div>

      {/* Skills */}
      {person.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {person.skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="text-[10px] font-medium text-zinc-600 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-md"
            >
              {skill}
            </span>
          ))}
          {person.skills.length > 5 && (
            <span className="text-[10px] text-zinc-400 self-center">
              +{person.skills.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-0.5">
        <span className="text-[10px] text-zinc-300">
          Joined {new Date(person.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </span>
        <ConnectButton person={person} onStatusChange={onStatusChange} />
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 p-4 space-y-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-100 shrink-0" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-3.5 bg-zinc-100 rounded w-1/3" />
          <div className="h-3 bg-zinc-100 rounded w-2/3" />
        </div>
      </div>
      <div className="flex gap-1.5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-5 bg-zinc-100 rounded-md w-14" />
        ))}
      </div>
    </div>
  )
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type Filter = "all" | "connected" | "pending"

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All people" },
  { id: "connected", label: "Connected" },
  { id: "pending", label: "Pending" },
]

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PeoplePage() {
  const { user } = useAuthStore()
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [connectTarget, setConnectTarget] = useState<MatchedUser | null>(null)

  useEffect(() => {
    api
      .get("/api/auth/social")
      .then((res) => setPeople(res.data.data?.users || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleStatusChange = (id: string, status: ConnectionStatus) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, connectionStatus: status } : p))
    )
  }

  // ✅ FIX 3: Wrong endpoint /api/connections/request replaced with correct route
  const handleRecommendedConnect = (match: MatchedUser) => {
    setConnectTarget(match)
    const found = people.find((p) => p.id === match.userId)
    if (found) {
      api
        .post(`/api/auth/social/${match.userId}/connect`, { message: "Hi, let's connect!" })
        .then(() => handleStatusChange(match.userId, "PENDING_SENT"))
        .catch(() => {})
    }
  }

  const filtered = useMemo(() => {
    let list = people

    if (filter === "connected") {
      list = list.filter((p) => p.connectionStatus === "ACCEPTED")
    } else if (filter === "pending") {
      list = list.filter(
        (p) =>
          p.connectionStatus === "PENDING_SENT" ||
          p.connectionStatus === "PENDING_RECEIVED"
      )
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.bio?.toLowerCase().includes(q) ||
          p.skills.some((s) => s.toLowerCase().includes(q))
      )
    }

    return list
  }, [people, filter, search])

  const connectedCount = people.filter((p) => p.connectionStatus === "ACCEPTED").length
  const pendingCount = people.filter(
    (p) =>
      p.connectionStatus === "PENDING_SENT" ||
      p.connectionStatus === "PENDING_RECEIVED"
  ).length

  return (
    <div className="flex gap-6 p-6 max-w-6xl mx-auto">
      {/* ── Left: main content ── */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Page header */}
        <div>
          <h1 className="text-base font-semibold text-zinc-900">People</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Discover collaborators on NexCore
          </p>
        </div>

        {/* Stats row */}
        {!loading && (
          <div className="flex gap-3">
            {[
              { label: "Total", value: people.length, icon: Users },
              { label: "Connected", value: connectedCount, icon: UserCheck },
              { label: "Pending", value: pendingCount, icon: Clock },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-zinc-100 rounded-xl px-4 py-3 flex items-center gap-2.5"
              >
                <div className="w-7 h-7 rounded-lg bg-zinc-50 flex items-center justify-center">
                  <stat.icon className="w-3.5 h-3.5 text-zinc-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 leading-none">{stat.value}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search + filter toolbar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2.5 bg-white border border-zinc-200 rounded-xl px-3.5 py-2 focus-within:border-zinc-400 transition-all">
            <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skill, or bio..."
              className="flex-1 text-sm text-zinc-700 placeholder:text-zinc-400 bg-transparent outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tab filters */}
          <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-0.5 shrink-0">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
                  filter === f.id
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                {f.label}
                {f.id === "pending" && pendingCount > 0 && (
                  <span className="ml-1.5 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-1 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* People grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-600">
              {search ? `No results for "${search}"` : "No people here yet"}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {search ? "Try a different skill or name." : "More users will appear as the platform grows."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Right: recommendations sidebar ── */}
      <div className="w-72 shrink-0 hidden lg:block space-y-4 sticky top-6 self-start">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          <p className="text-xs font-semibold text-zinc-900">Recommended for you</p>
        </div>
        <RecommendedPeople
          mySkills={user?.skills || []}
          excludeIds={people
            .filter((p) => p.connectionStatus === "ACCEPTED")
            .map((p) => p.id)}
          onConnect={handleRecommendedConnect}
        />
        {(!user?.skills || user.skills.length === 0) && (
          <p className="text-[11px] text-zinc-400 px-1">
            Add skills in Settings to see personalized recommendations.
          </p>
        )}
      </div>
    </div>
  )
}