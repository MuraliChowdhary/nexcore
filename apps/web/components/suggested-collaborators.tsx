"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useMatching, buildProjectQuery, similarityLabel, MatchedUser } from "@/hooks/use-matching"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  UserPlus,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  projectId: string
  techStack: string[]
  rolesNeeded: string[]
  existingMemberIds: string[]   // hide people already in the project
  onInvited?: (userId: string) => void
}

// ─── Match row ────────────────────────────────────────────────────────────────

function MatchRow({
  match,
  projectId,
  onInvited,
}: {
  match: MatchedUser
  projectId: string
  onInvited?: (userId: string) => void
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle")
  const { label, color, barWidth } = similarityLabel(match.similarity)
  const pct = Math.round(parseFloat(match.similarity) * 100)

  const initials = match.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleInvite = async () => {
    setStatus("loading")
    try {
      await api.post(`/api/projects/${projectId}/invite`, {
        inviteeId: match.userId,
        inviteeName: match.userName,
      })
      setStatus("sent")
      onInvited?.(match.userId)
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 2500)
    }
  }

  return (
    <div className="flex items-center gap-3 py-3 group">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-zinc-900 text-white text-xs font-semibold flex items-center justify-center shrink-0 select-none">
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">{match.userName}</p>

        {/* Skill tags */}
        <div className="flex flex-wrap gap-1 mt-0.5">
          {match.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-[10px] font-medium text-zinc-500 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded-md"
            >
              {skill}
            </span>
          ))}
          {match.skills.length > 3 && (
            <span className="text-[10px] text-zinc-400">+{match.skills.length - 3}</span>
          )}
        </div>

        {/* Similarity bar */}
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden max-w-[80px]">
            <div className={cn("h-full rounded-full transition-all", color, barWidth)} />
          </div>
          <span className="text-[10px] text-zinc-400 shrink-0">{pct}% · {label}</span>
        </div>
      </div>

      {/* Invite button */}
      <div className="shrink-0">
        {status === "sent" ? (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <Check className="w-3.5 h-3.5" /> Invited
          </span>
        ) : status === "error" ? (
          <span className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="w-3.5 h-3.5" /> Failed
          </span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleInvite}
            disabled={status === "loading"}
            className="h-7 text-xs gap-1.5 border-zinc-200 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
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

// ─── Main component ───────────────────────────────────────────────────────────

export function SuggestedCollaborators({
  projectId,
  techStack,
  rolesNeeded,
  existingMemberIds,
  onInvited,
}: Props) {
  const { matches, loading, error, search } = useMatching()
  const [expanded, setExpanded] = useState(true)
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const query = buildProjectQuery(techStack, rolesNeeded)
    if (query) search(query, 8)
  }, [techStack, rolesNeeded])

  const handleInvited = (userId: string) => {
    setInvitedIds((prev) => new Set([...prev, userId]))
    onInvited?.(userId)
  }

  // Filter out people already in the project or already invited this session
  const visible = matches.filter(
    (m) => !existingMemberIds.includes(m.userId) && !invitedIds.has(m.userId)
  )

  // Don't render anything if no query possible
  const query = buildProjectQuery(techStack, rolesNeeded)
  if (!query) return null

  return (
    <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-50 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-zinc-900">Suggested collaborators</p>
            <p className="text-[11px] text-zinc-400">
              Matched by skill · {techStack.slice(0, 2).join(", ")}
              {techStack.length > 2 ? ` +${techStack.length - 2}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!loading && visible.length > 0 && (
            <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-full">
              {visible.length} match{visible.length !== 1 ? "es" : ""}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </div>
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-4 pb-3 border-t border-zinc-50">
          {loading ? (
            <div className="py-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-100 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-zinc-100 rounded w-1/3" />
                    <div className="h-2.5 bg-zinc-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-4 flex items-center gap-2 text-xs text-zinc-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          ) : visible.length === 0 ? (
            <div className="py-4 text-xs text-zinc-400 text-center">
              No matches found for this skill set yet.
              <br />More users will appear as the platform grows.
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {visible.map((match) => (
                <MatchRow
                  key={match.userId}
                  match={match}
                  projectId={projectId}
                  onInvited={handleInvited}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}