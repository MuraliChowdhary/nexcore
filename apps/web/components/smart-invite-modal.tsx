"use client"

import { useState, useEffect, useRef } from "react"
import { api } from "@/lib/api"
import { useMatching, buildProjectQuery, similarityLabel, MatchedUser } from "@/hooks/use-matching"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  X,
  Search,
  Sparkles,
  UserPlus,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  projectId: string
  projectTitle: string
  techStack: string[]
  rolesNeeded: string[]
  existingMemberIds: string[]
  onClose: () => void
  onInvited?: (userId: string, name: string) => void
}

// ─── Result row ───────────────────────────────────────────────────────────────

function InviteRow({
  match,
  projectId,
  onInvited,
}: {
  match: MatchedUser
  projectId: string
  onInvited?: (userId: string, name: string) => void
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle")
  const { label, color, barWidth } = similarityLabel(match.similarity)
  const pct = Math.round(parseFloat(match.similarity) * 100)

  const initials = match.userName
    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const handleInvite = async () => {
    setStatus("loading")
    try {
      await api.post(`/api/projects/${projectId}/invite`, {
        inviteeId: match.userId,
        inviteeName: match.userName,
      })
      setStatus("sent")
      onInvited?.(match.userId, match.userName)
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 2500)
    }
  }

  return (
    <div className={cn(
      "flex items-center gap-3 px-5 py-3.5 transition-colors",
      status !== "sent" && "hover:bg-zinc-50"
    )}>
      <div className="w-9 h-9 rounded-full bg-zinc-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">{match.userName}</p>
        <div className="flex flex-wrap gap-1 mt-0.5">
          {match.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="text-[10px] font-medium text-zinc-500 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded-md">
              {skill}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="w-20 h-1 bg-zinc-100 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full", color, barWidth)} />
          </div>
          <span className="text-[10px] text-zinc-400">{pct}% match · {label}</span>
        </div>
      </div>
      <div className="shrink-0">
        {status === "sent" ? (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <Check className="w-3.5 h-3.5" /> Invited
          </span>
        ) : status === "error" ? (
          <span className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Failed
          </span>
        ) : (
          <Button
            size="sm"
            onClick={handleInvite}
            disabled={status === "loading"}
            className="h-7 text-xs gap-1.5 bg-zinc-900 hover:bg-zinc-800"
          >
            {status === "loading" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <UserPlus className="w-3 h-3" />
            )}
            Invite
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function SmartInviteModal({
  projectId,
  projectTitle,
  techStack,
  rolesNeeded,
  existingMemberIds,
  onClose,
  onInvited,
}: Props) {
  const { matches, loading, search } = useMatching()
  const [query, setQuery] = useState("")
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set())
  const [mode, setMode] = useState<"suggested" | "search">("suggested")
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Load suggested matches on open (project context)
  useEffect(() => {
    const defaultQuery = buildProjectQuery(techStack, rolesNeeded)
    if (defaultQuery) search(defaultQuery, 10)
  }, [])

  // Debounced search as user types
  useEffect(() => {
    if (!query.trim()) {
      setMode("suggested")
      const defaultQuery = buildProjectQuery(techStack, rolesNeeded)
      if (defaultQuery) search(defaultQuery, 10)
      return
    }
    setMode("search")
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      search(query, 10)
    }, 350)
  }, [query])

  const handleInvited = (userId: string, name: string) => {
    setInvitedIds((prev) => new Set([...prev, userId]))
    onInvited?.(userId, name)
  }

  const visible = matches.filter(
    (m) => !existingMemberIds.includes(m.userId) && !invitedIds.has(m.userId)
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-zinc-100 shadow-xl w-full max-w-[480px] z-10 flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Invite to project</h2>
            <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[340px]">
              {projectTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-50 transition-colors mt-0.5"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 focus-within:border-zinc-400 focus-within:bg-white transition-all">
            <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <input
              placeholder="Search by skill, role, or name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-sm text-zinc-700 placeholder:text-zinc-400 bg-transparent outline-none flex-1"
              autoFocus
            />
            {loading && <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin shrink-0" />}
            {query && !loading && (
              <button onClick={() => setQuery("")} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mode label */}
        <div className="px-5 pt-3 pb-1 shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <p className="text-[11px] font-medium text-violet-600">
              {mode === "suggested"
                ? `Suggested for ${techStack.slice(0, 2).join(", ")}${techStack.length > 2 ? ` +${techStack.length - 2}` : ""}`
                : `Semantic search results for "${query}"`}
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-50">
          {loading && visible.length === 0 ? (
            <div className="px-5 py-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-100 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-zinc-100 rounded w-1/3" />
                    <div className="h-2.5 bg-zinc-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-5">
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mb-2">
                <Sparkles className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-600">No matches found</p>
              <p className="text-xs text-zinc-400 mt-1">
                Try a different skill or role name.
              </p>
            </div>
          ) : (
            visible.map((match) => (
              <InviteRow
                key={match.userId}
                match={match}
                projectId={projectId}
                onInvited={handleInvited}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {invitedIds.size > 0 && (
          <div className="px-5 py-3 border-t border-zinc-100 bg-green-50 shrink-0">
            <p className="text-xs text-green-700 font-medium flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              {invitedIds.size} invite{invitedIds.size > 1 ? "s" : ""} sent this session
            </p>
          </div>
        )}
      </div>
    </div>
  )
}