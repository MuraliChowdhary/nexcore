"use client"

import { useEffect } from "react"
import { useMatching, similarityLabel, MatchedUser } from "@/hooks/use-matching"
import { Button } from "@/components/ui/button"
import { Sparkles, UserPlus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  mySkills: string[]                         // from auth store user.skills
  excludeIds: string[]                       // already connected/following
  onConnect: (match: MatchedUser) => void
}

// ─── Match pill ───────────────────────────────────────────────────────────────

function MatchPill({ match, onConnect }: { match: MatchedUser; onConnect: () => void }) {
  const { label, color } = similarityLabel(match.similarity)
  const pct = Math.round(parseFloat(match.similarity) * 100)
  const initials = match.userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-8 h-8 rounded-full bg-zinc-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-zinc-900 truncate">{match.userName}</p>
          <span className={cn(
            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
            parseFloat(match.similarity) >= 0.55
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-zinc-50 text-zinc-500 border border-zinc-100"
          )}>
            {pct}%
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mt-0.5">
          {match.skills.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] text-zinc-400 bg-zinc-50 border border-zinc-100 px-1 py-0.5 rounded">
              {s}
            </span>
          ))}
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onConnect}
        className="h-7 text-xs gap-1 border-zinc-200 hover:border-zinc-400 shrink-0"
      >
        <UserPlus className="w-3 h-3" />
        Connect
      </Button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RecommendedPeople({ mySkills, excludeIds, onConnect }: Props) {
  const { matches, loading, search } = useMatching()

  useEffect(() => {
    if (mySkills.length === 0) return
    // Query is YOUR skills — find people who complement them
    search(mySkills.join(" "), 6)
  }, [mySkills.join(",")])

  const visible = matches.filter((m) => !excludeIds.includes(m.userId))

  if (mySkills.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-50 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-violet-50 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-900">Recommended for you</p>
          <p className="text-[10px] text-zinc-400">
            Based on your skills · {mySkills.slice(0, 2).join(", ")}
            {mySkills.length > 2 ? ` +${mySkills.length - 2}` : ""}
          </p>
        </div>
      </div>
      <div className="px-4 divide-y divide-zinc-50">
        {loading ? (
          <div className="py-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-zinc-100 rounded w-1/3" />
                  <div className="h-2.5 bg-zinc-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="text-xs text-zinc-400 py-4 text-center">
            No recommendations yet. Add more skills in Settings.
          </p>
        ) : (
          visible.map((match) => (
            <MatchPill key={match.userId} match={match} onConnect={() => onConnect(match)} />
          ))
        )}
      </div>
    </div>
  )
}