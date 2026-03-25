"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/app/store/auth.store"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  FolderOpen,
  CheckSquare,
  Mail,
  Bell,
  Plus,
  ArrowRight,
  Crown,
  Users,
  Lock,
  Globe,
  AlertCircle,
  Clock,
  CircleDot,
  CheckCircle2,
  Compass,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import CreateProjectModal from "@/components/projects/CreateProjectModal"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  rolesNeeded: string[]
  visibility: "PUBLIC" | "PRIVATE"
  createdBy: string
  members: { userId: string; role: string }[]
  createdAt: string
}

interface Task {
  id: string
  title: string
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH"
  projectId: string
  projectTitle?: string
  dueDate?: string
}

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

interface PendingInvite {
  id: string
  projectTitle: string
  inviterName: string
  createdAt: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting(name: string) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const firstName = name.split(" ")[0]
  return `${greeting}, ${firstName}`
}

const priorityConfig = {
  HIGH: { label: "High", className: "bg-red-50 text-red-600 border-red-100" },
  MEDIUM: { label: "Medium", className: "bg-amber-50 text-amber-600 border-amber-100" },
  LOW: { label: "Low", className: "bg-green-50 text-green-600 border-green-100" },
}

const statusConfig = {
  TODO: { label: "Todo", icon: CircleDot, className: "text-zinc-400" },
  IN_PROGRESS: { label: "In Progress", icon: Clock, className: "text-blue-500" },
  IN_REVIEW: { label: "In Review", icon: AlertCircle, className: "text-amber-500" },
  DONE: { label: "Done", icon: CheckCircle2, className: "text-green-500" },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string
  value: number
  icon: React.ElementType
  loading: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 px-5 py-4 flex items-center gap-4">
      <div className="w-9 h-9 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-zinc-600" />
      </div>
      <div>
        <p className="text-xs text-zinc-400 font-medium">{label}</p>
        {loading ? (
          <div className="h-6 w-8 bg-zinc-100 rounded animate-pulse mt-0.5" />
        ) : (
          <p className="text-xl font-semibold text-zinc-900 leading-tight">{value}</p>
        )}
      </div>
    </div>
  )
}

function TaskRow({ task }: { task: Task }) {
  const StatusIcon = statusConfig[task.status]?.icon || CircleDot
  const statusCls = statusConfig[task.status]?.className || "text-zinc-400"

  return (
    <div className="flex items-start gap-3 py-2.5 group">
      <StatusIcon className={cn("w-4 h-4 mt-0.5 shrink-0", statusCls)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-800 font-medium truncate leading-snug">{task.title}</p>
        {task.projectTitle && (
          <p className="text-xs text-zinc-400 mt-0.5 truncate">{task.projectTitle}</p>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded border",
            priorityConfig[task.priority]?.className
          )}
        >
          {priorityConfig[task.priority]?.label}
        </span>
        {task.dueDate && (
          <span className="text-[11px] text-zinc-400">
            {new Date(task.dueDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
          </span>
        )}
      </div>
    </div>
  )
}

function ProjectCard({
  project,
  isOwner,
}: {
  project: Project
  isOwner: boolean
}) {
    
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white rounded-xl border border-zinc-100 p-5 hover:border-zinc-200 hover:shadow-sm transition-all duration-200 cursor-pointer group h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isOwner && (
                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <h3 className="text-sm font-semibold text-zinc-900 truncate group-hover:text-zinc-700">
                {project.title}
              </h3>
            </div>
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          </div>
          <div className="shrink-0">
            {project.visibility === "PRIVATE" ? (
              <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-500 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded-md">
                <Lock className="w-2.5 h-2.5" /> Private
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-md">
                <Globe className="w-2.5 h-2.5" /> Public
              </span>
            )}
          </div>
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1 mb-3">
          {project.techStack?.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="text-[10px] font-medium text-zinc-500 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded-md"
            >
              {tech}
            </span>
          ))}
          {(project.techStack?.length || 0) > 3 && (
            <span className="text-[10px] text-zinc-400">
              +{project.techStack.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <Users className="w-3 h-3" />
            <span>{project.members?.length || 0} members</span>
          </div>
          {!isOwner && (
            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
              Collaborator
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-zinc-400" />
      </div>
      <p className="text-sm font-medium text-zinc-700 mb-1">{title}</p>
      <p className="text-xs text-zinc-400 max-w-xs">{description}</p>
      {action && (
        <Link href={action.href}>
          <Button size="sm" variant="outline" className="mt-4 text-xs h-8">
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const { user, _hasHydrated } = useAuthStore()

  const [myProjects, setMyProjects] = useState<Project[]>([])
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
   const [projects, setProjects] = useState<Project[]>([])
   const [showCreate, setShowCreate] = useState(false)
  const [activeProjectTab, setActiveProjectTab] = useState<"owned" | "joined">("owned")

  useEffect(() => {
    if (!_hasHydrated) return
    if (!user) {
      router.push("/login")
      return
    }

    const fetchAll = async () => {
      setLoading(true)
      try {
        const [projectsRes, allProjectsRes, tasksRes, notifRes, unreadRes, invitesRes] =
          await Promise.allSettled([
            api.get("/api/projects/user/mine"),
            api.get("/api/projects"),
            api.get("/api/tasks/my"),
            api.get("/api/notifications?limit=8"),
            api.get("/api/notifications/unread/count"),
            api.get("/api/projects/invites/pending"),
          ])

        if (projectsRes.status === "fulfilled")
          setMyProjects(projectsRes.value.data.data?.projects || [])
        if (allProjectsRes.status === "fulfilled")
          setAllProjects(allProjectsRes.value.data.data?.projects || [])
        if (tasksRes.status === "fulfilled")
          setMyTasks(tasksRes.value.data.data?.tasks || [])
        if (notifRes.status === "fulfilled")
          setNotifications(notifRes.value.data.data?.notifications || [])
        if (unreadRes.status === "fulfilled")
          setUnreadCount(unreadRes.value.data.data?.count || 0)
        if (invitesRes.status === "fulfilled")
          setPendingInvites(invitesRes.value.data.data?.invites || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [user, _hasHydrated, router])

  if (!_hasHydrated) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
      </div>
    )
  }

  // Joined projects = user is a member but not the creator
  const joinedProjects = allProjects.filter(
    (p) =>
      p.createdBy !== user?.id &&
      p.members?.some((m) => m.userId === user?.id)
  )

  // Open tasks = not DONE
  const openTasks = myTasks.filter((t) => t.status !== "DONE")
  const displayTasks = openTasks.slice(0, 6)

  

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
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      {/* ── Greeting + actions ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            {user ? getGreeting(user.name) : "Dashboard"} 👋
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Here's what's happening across your projects.
          </p>
        </div>
        {/* <Link href="/projects/new"> */}
           <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
            New project
          </Button>
        {/* </Link> */}
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="My Projects"
          value={myProjects.length}
          icon={FolderOpen}
          loading={loading}
        />
        <StatCard
          label="Open Tasks"
          value={openTasks.length}
          icon={CheckSquare}
          loading={loading}
        />
        <StatCard
          label="Pending Invites"
          value={pendingInvites.length}
          icon={Mail}
          loading={loading}
        />
        <StatCard
          label="Unread"
          value={unreadCount}
          icon={Bell}
          loading={loading}
        />
      </div>

      {/* ── Pending invites banner ── */}
      {pendingInvites.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 font-medium">
              You have {pendingInvites.length} pending project invite
              {pendingInvites.length > 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/invites">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 border-amber-200 text-amber-700 hover:bg-amber-100"
            >
              Review
            </Button>
          </Link>
        </div>
      )}

            <CreateProjectModal
              open={showCreate}
              onClose={() => setShowCreate(false)}
              onCreated={() => { setShowCreate(false); fetchProjects() }}
            />

      {/* ── Middle columns: Tasks + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My tasks */}
        <div className="bg-white rounded-xl border border-zinc-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-900">My Tasks</h2>
              {openTasks.length > 0 && (
                <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-full">
                  {openTasks.length}
                </span>
              )}
            </div>
            <Link
              href="/tasks"
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="w-4 h-4 bg-zinc-100 rounded-full mt-0.5 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-zinc-100 rounded w-3/4" />
                    <div className="h-2.5 bg-zinc-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayTasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No open tasks"
              description="You're all caught up! No tasks assigned to you."
            />
          ) : (
            <div className="divide-y divide-zinc-50">
              {displayTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-zinc-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-900">Recent Activity</h2>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="w-2 h-2 bg-zinc-100 rounded-full mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-zinc-100 rounded w-2/3" />
                    <div className="h-2.5 bg-zinc-100 rounded w-full" />
                    <div className="h-2 bg-zinc-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No activity yet"
              description="Notifications from your projects will appear here."
            />
          ) : (
            <div className="space-y-4">
              {notifications.slice(0, 6).map((n) => (
                <div key={n.id} className="flex gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-1.5 shrink-0",
                      n.read ? "bg-zinc-200" : "bg-blue-500"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 leading-snug">
                      {n.title}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-zinc-300 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Projects grid ── */}
      <div className="bg-white rounded-xl border border-zinc-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-0.5">
            <button
              onClick={() => setActiveProjectTab("owned")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeProjectTab === "owned"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <Crown className="w-3 h-3" /> My Projects
              <span
                className={cn(
                  "ml-0.5 text-[10px] px-1 rounded-full",
                  activeProjectTab === "owned"
                    ? "bg-zinc-100 text-zinc-500"
                    : "bg-zinc-200 text-zinc-400"
                )}
              >
                {myProjects.length}
              </span>
            </button>
            <button
              onClick={() => setActiveProjectTab("joined")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeProjectTab === "joined"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <Users className="w-3 h-3" /> Joined
              <span
                className={cn(
                  "ml-0.5 text-[10px] px-1 rounded-full",
                  activeProjectTab === "joined"
                    ? "bg-zinc-100 text-zinc-500"
                    : "bg-zinc-200 text-zinc-400"
                )}
              >
                {joinedProjects.length}
              </span>
            </button>
          </div>

          <Link
            href="/discover"
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <Compass className="w-3 h-3" /> Discover projects
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse border border-zinc-100 rounded-xl p-5 space-y-3 h-40"
              >
                <div className="h-4 bg-zinc-100 rounded w-2/3" />
                <div className="h-3 bg-zinc-100 rounded w-full" />
                <div className="h-3 bg-zinc-100 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : activeProjectTab === "owned" ? (
          myProjects.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No projects yet"
              description="Create your first project and start collaborating with others."
              action={{ label: "Create project", href: "/projects/new" }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myProjects.map((project) => (
                <ProjectCard key={project.id} project={project} isOwner={true} />
              ))}
              {/* Create new card */}
              <Link href="/projects/new">
                <div className="border-2 border-dashed border-zinc-100 rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-center hover:border-zinc-200 hover:bg-zinc-50 transition-all cursor-pointer h-full min-h-[120px]">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-zinc-400" />
                  </div>
                  <p className="text-xs font-medium text-zinc-400">New project</p>
                </div>
              </Link>
            </div>
          )
        ) : joinedProjects.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Not joined any projects"
            description="Browse public projects and join one to start collaborating."
            action={{ label: "Browse projects", href: "/discover" }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {joinedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} isOwner={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}