    "use client"

    import { useState, useCallback } from "react"
    import { api } from "@/lib/api"

    export interface MatchedUser {
    userId: string
    userName: string
    skills: string[]
    similarity: string // "0.487" from the service
    }

    interface UseMatchingReturn {
    matches: MatchedUser[]
    loading: boolean
    error: string | null
    search: (query: string, limit?: number) => Promise<void>
    clear: () => void
    }

    export function useMatching(): UseMatchingReturn {
    const [matches, setMatches] = useState<MatchedUser[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const search = useCallback(async (query: string, limit = 5) => {
        if (!query.trim()) return
        setLoading(true)
        setError(null)
        try {
        const res = await api.get(
            `/api/matching/match?q=${encodeURIComponent(query)}&limit=${limit}`
        )
        setMatches(res.data.data?.matches || [])
        } catch {
        setError("Could not load recommendations.")
        } finally {
        setLoading(false)
        }
    }, [])

    const clear = useCallback(() => {
        setMatches([])
        setError(null)
    }, [])

    return { matches, loading, error, search, clear }
    }

    // ─── Helper: build a query string from a project ──────────────────────────────

    export function buildProjectQuery(
    techStack: string[],
    rolesNeeded: string[]
    ): string {
    return [...rolesNeeded, ...techStack].join(" ").trim()
    }

    // ─── Helper: similarity score → human label ───────────────────────────────────

    export function similarityLabel(score: string): {
    label: string
    color: string
    barWidth: string
    } {
    const n = parseFloat(score)
    if (n >= 0.75) return { label: "Excellent match", color: "bg-green-500",  barWidth: "w-full" }
    if (n >= 0.55) return { label: "Strong match",    color: "bg-green-400",  barWidth: "w-4/5"  }
    if (n >= 0.40) return { label: "Good match",      color: "bg-amber-400",  barWidth: "w-3/5"  }
    if (n >= 0.25) return { label: "Partial match",   color: "bg-zinc-300",   barWidth: "w-2/5"  }
    return              { label: "Weak match",        color: "bg-zinc-200",   barWidth: "w-1/5"  }
    }