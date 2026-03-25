"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/app/store/auth.store"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Compass,
  Globe,
  Users,
  Search,
  Loader2,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  userId: string
  role: string
}

interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  rolesNeeded: string[]
  visibility: "PUBLIC"
  createdBy: string
  members: Member[]
  createdAt: string
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, isMember }: { project: Project; isMember: boolean }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white rounded-xl border border-zinc-100 p-5 hover:border-zinc-300 hover:shadow-sm transition-all duration-200 cursor-pointer group flex flex-col h-full">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-700 leading-snug flex-1 min-w-0">
            {project.title}
          </h3>
          <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-md shrink-0 mt-0.5">
            <Globe className="w-2.5 h-2.5" />
            Public
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-3 flex-1">
          {project.description || "No description provided."}
        </p>

        {/* Tech stack */}
        {project.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="text-[10px] font-medium text-zinc-500 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded-md"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="text-[10px] text-zinc-400 self-center">
                +{project.techStack.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Roles needed */}
        {project.rolesNeeded?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.rolesNeeded.slice(0, 2).map((role) => (
              <span
                key={role}
                className="text-[10px] font-medium text-violet-600 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-md"
              >
                {role}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <Users className="w-3 h-3" />
            <span>{project.members?.length || 0} member{project.members?.length !== 1 ? "s" : ""}</span>
          </div>
          {isMember ? (
            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
              Joined
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 group-hover:text-zinc-700 transition-colors">
              View <ArrowRight className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProjectSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 p-5 h-[180px] animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-4 bg-zinc-100 rounded w-1/2" />
        <div className="h-4 bg-zinc-100 rounded w-14" />
      </div>
      <div className="space-y-1.5 mb-3">
        <div className="h-3 bg-zinc-100 rounded w-full" />
        <div className="h-3 bg-zinc-100 rounded w-3/4" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 bg-zinc-100 rounded w-12" />
        <div className="h-5 bg-zinc-100 rounded w-16" />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const router = useRouter()
  const { user, _hasHydrated } = useAuthStore()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [techFilter, setTechFilter] = useState<string | null>(null)

  useEffect(() => {
    if (!_hasHydrated) return
    if (!user) {
      router.push("/login")
      return
    }

    api
      .get("/api/projects")
      .then((res) => {
        const all: Project[] = res.data.data?.projects || []
        // only public ones (backend already filters, but guard here too)
        setProjects(all.filter((p) => p.visibility === "PUBLIC"))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, _hasHydrated, router])

  if (!_hasHydrated) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
      </div>
    )
  }

  // Derive all unique tech tags for filter pills
  const allTech = Array.from(
    new Set(projects.flatMap((p) => p.techStack || []))
  ).sort()

  // Filtered set
  const filtered = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.techStack?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchesTech =
      !techFilter || p.techStack?.includes(techFilter)
    return matchesSearch && matchesTech
  })

  const myProjectIds = new Set(
    projects
      .filter((p) => p.members?.some((m) => m.userId === user?.id))
      .map((p) => p.id)
  )

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-4 h-4 text-zinc-500" />
          <h1 className="text-xl font-semibold text-zinc-900">Discover Projects</h1>
        </div>
        <p className="text-sm text-zinc-400">
          Browse public projects and find ones to collaborate on.
        </p>
      </div>

      {/* ── Search + filters ── */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="flex items-center gap-2.5 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 max-w-md focus-within:border-zinc-400 transition-colors">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            placeholder="Search by title, tech, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm text-zinc-700 placeholder:text-zinc-400 bg-transparent outline-none flex-1"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-zinc-400 hover:text-zinc-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Tech filter pills */}
        {allTech.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setTechFilter(null)}
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-lg border transition-all",
                !techFilter
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"
              )}
            >
              All
            </button>
            {allTech.map((tech) => (
              <button
                key={tech}
                onClick={() => setTechFilter(techFilter === tech ? null : tech)}
                className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-lg border transition-all",
                  techFilter === tech
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"
                )}
              >
                {tech}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Results count ── */}
      {!loading && (
        <p className="text-xs text-zinc-400">
          {filtered.length} project{filtered.length !== 1 ? "s" : ""} found
          {techFilter ? ` using ${techFilter}` : ""}
          {search ? ` matching "${search}"` : ""}
        </p>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <ProjectSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
            <Compass className="w-6 h-6 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-700 mb-1">No projects found</p>
          <p className="text-xs text-zinc-400 max-w-xs">
            {search || techFilter
              ? "Try adjusting your search or filters."
              : "No public projects exist yet. Create one and others can join!"}
          </p>
          {(search || techFilter) && (
            <Button
              size="sm"
              variant="outline"
              className="mt-4 text-xs h-8"
              onClick={() => {
                setSearch("")
                setTechFilter(null)
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isMember={myProjectIds.has(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}