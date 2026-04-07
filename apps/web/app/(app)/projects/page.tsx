"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/app/store/auth.store"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  FolderOpen,
  Globe,
  Lock,
  Users,
  Plus,
  Crown,
  Search,
  LayoutGrid,
  LayoutList,
  Calendar,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import CreateProjectModal from "@/components/projects/CreateProjectModal"
 
// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  userId: string
  userName: string
  role: string
}

interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  rolesNeeded: string[]
  visibility: "PUBLIC" | "PRIVATE"
  createdBy: string
  members: Member[]
  createdAt: string
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 p-5 animate-pulse h-[190px]">
      <div className="flex justify-between mb-3">
        <div className="h-4 bg-zinc-100 rounded w-1/2" />
        <div className="h-4 bg-zinc-100 rounded w-14" />
      </div>
      <div className="space-y-1.5 mb-4">
        <div className="h-3 bg-zinc-100 rounded w-full" />
        <div className="h-3 bg-zinc-100 rounded w-2/3" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 bg-zinc-100 rounded w-12" />
        <div className="h-5 bg-zinc-100 rounded w-16" />
      </div>
    </div>
  )
}


function ListSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 px-5 py-4 animate-pulse flex items-center gap-4">
      <div className="h-4 bg-zinc-100 rounded w-1/3" />
      <div className="h-3 bg-zinc-100 rounded w-1/4 flex-1" />
      <div className="h-4 bg-zinc-100 rounded w-14" />
    </div>
  )
}

// ─── Grid Card ────────────────────────────────────────────────────────────────

function ProjectGridCard({ project }: { project: Project }) {
  const isPrivate = project.visibility === "PRIVATE"

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white rounded-xl border border-zinc-100 p-5 hover:border-zinc-300 hover:shadow-sm transition-all duration-200 cursor-pointer group flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-700 truncate leading-snug">
              {project.title}
            </h3>
          </div>
          {isPrivate ? (
            <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-500 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded-md shrink-0">
              <Lock className="w-2.5 h-2.5" /> Private
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-md shrink-0">
              <Globe className="w-2.5 h-2.5" /> Public
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3 flex-1">
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
                +{project.techStack.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <Users className="w-3 h-3" />
            <span>
              {project.members?.length || 0} member
              {project.members?.length !== 1 ? "s" : ""}
            </span>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-zinc-400 group-hover:text-zinc-600 transition-colors">
            Open <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── List Row ─────────────────────────────────────────────────────────────────

function ProjectListRow({ project }: { project: Project }) {
  const isPrivate = project.visibility === "PRIVATE"

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white rounded-xl border border-zinc-100 px-5 py-3.5 flex items-center gap-4 hover:border-zinc-200 hover:shadow-sm transition-all duration-150 cursor-pointer group">
        {/* Icon */}
        <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
          {isPrivate ? (
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <Globe className="w-3.5 h-3.5 text-green-500" />
          )}
        </div>

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Crown className="w-3 h-3 text-amber-500 shrink-0" />
            <p className="text-sm font-semibold text-zinc-900 truncate group-hover:text-zinc-700">
              {project.title}
            </p>
          </div>
          <p className="text-xs text-zinc-400 truncate mt-0.5">
            {project.description || "No description"}
          </p>
        </div>

        {/* Tech stack */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          {project.techStack?.slice(0, 2).map((tech) => (
            <span
              key={tech}
              className="text-[10px] font-medium text-zinc-500 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded-md"
            >
              {tech}
            </span>
          ))}
          {(project.techStack?.length || 0) > 2 && (
            <span className="text-[10px] text-zinc-400">
              +{project.techStack.length - 2}
            </span>
          )}
        </div>

        {/* Members */}
        <div className="hidden sm:flex items-center gap-1 text-xs text-zinc-400 shrink-0 w-20 justify-end">
          <Users className="w-3 h-3" />
          {project.members?.length || 0}
        </div>

        {/* Created */}
        <div className="hidden lg:flex items-center gap-1 text-xs text-zinc-400 shrink-0 w-28 justify-end">
          <Calendar className="w-3 h-3" />
          {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
        </div>

        {/* Visibility badge */}
        <div className="shrink-0">
          {isPrivate ? (
            <span className="text-[10px] font-medium text-zinc-500 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded-md">
              Private
            </span>
          ) : (
            <span className="text-[10px] font-medium text-green-600 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-md">
              Public
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
        <FolderOpen className="w-6 h-6 text-zinc-400" />
      </div>
      <p className="text-sm font-medium text-zinc-700 mb-1">
        {filtered ? "No matching projects" : "No projects yet"}
      </p>
      <p className="text-xs text-zinc-400 max-w-xs">
        {filtered
          ? "Try a different search or filter."
          : "Create your first project and start collaborating with others."}
      </p>
      {!filtered && (
        <Link href="/projects/new">
          <Button size="sm" className="mt-4 text-xs h-8 gap-1.5 bg-zinc-900 hover:bg-zinc-800">
            <Plus className="w-3.5 h-3.5" />
            Create Project
          </Button>
        </Link>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type VisibilityFilter = "ALL" | "PUBLIC" | "PRIVATE"
type ViewMode = "grid" | "list"

export default function ProjectsPage() {
  const router = useRouter()
  const { user, _hasHydrated } = useAuthStore()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("ALL")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
 const [showCreate, setShowCreate] = useState(false)
  useEffect(() => {
    if (!_hasHydrated) return
    if (!user) {
      router.push("/login")
      return
    }

    api
      .get("/api/projects/user/mine")
      .then((res) => setProjects(res.data.data?.projects || []))
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

  const publicCount = projects.filter((p) => p.visibility === "PUBLIC").length
  const privateCount = projects.filter((p) => p.visibility === "PRIVATE").length

  const filtered = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.techStack?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchesVisibility =
      visibilityFilter === "ALL" || p.visibility === visibilityFilter
    return matchesSearch && matchesVisibility
  })

  const isFiltered = !!search || visibilityFilter !== "ALL"


    const fetchProjects = async () => {
      try {
        const res = await api.get("/api/projects")
        setProjects(res.data.data.projects)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderOpen className="w-4 h-4 text-zinc-500" />
            <h1 className="text-xl font-semibold text-zinc-900">My Projects</h1>
          </div>
          <p className="text-sm text-zinc-400">
            Projects you own — both public and private.
          </p>
        </div>
       
          <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
            New project
          </Button>
       
      </div>


      
           <CreateProjectModal
                      open={showCreate}
                      onClose={() => setShowCreate(false)}
                      onCreated={() => { setShowCreate(false); fetchProjects() }}
            />
      

      {/* ── Stat pills ── */}
      {!loading && projects.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white border border-zinc-100 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600">
            <FolderOpen className="w-3.5 h-3.5 text-zinc-400" />
            {projects.length} total
          </div>
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5 text-xs font-medium text-green-700">
            <Globe className="w-3.5 h-3.5" />
            {publicCount} public
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600">
            <Lock className="w-3.5 h-3.5" />
            {privateCount} private
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3.5 py-2 flex-1 min-w-[200px] max-w-sm focus-within:border-zinc-400 transition-colors">
          <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm text-zinc-700 placeholder:text-zinc-400 bg-transparent outline-none flex-1"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-zinc-400 hover:text-zinc-600 text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Visibility filter */}
        <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
          {(["ALL", "PUBLIC", "PRIVATE"] as VisibilityFilter[]).map((v) => (
            <button
              key={v}
              onClick={() => setVisibilityFilter(v)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                visibilityFilter === v
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {v === "PUBLIC" && <Globe className="w-3 h-3" />}
              {v === "PRIVATE" && <Lock className="w-3 h-3" />}
              {v === "ALL" ? `All (${projects.length})` : v === "PUBLIC" ? `Public (${publicCount})` : `Private (${privateCount})`}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1 ml-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-lg transition-all",
              viewMode === "grid"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-400 hover:text-zinc-700"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-lg transition-all",
              viewMode === "list"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-400 hover:text-zinc-700"
            )}
          >
            <LayoutList className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Results count ── */}
      {!loading && isFiltered && (
        <p className="text-xs text-zinc-400">
          {filtered.length} project{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* ── Content ── */}
      {loading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <GridSkeleton key={i} />)}
          </div>
        ) : (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <ListSkeleton key={i} />)}
          </div>
        )
      ) : filtered.length === 0 ? (
        <EmptyState filtered={isFiltered} />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProjectGridCard key={p.id} project={p} />
          ))}
          {/* New project card */}
           
            <div className="border-2 border-dashed border-zinc-100 rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer min-h-[120px]">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                <Plus className="w-4 h-4 text-zinc-400" />
              </div>
              <p className="text-xs font-medium text-zinc-400" onClick={() => setShowCreate(true)}>New project</p>
            </div>
      
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <ProjectListRow key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>

  )
}