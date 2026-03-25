"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/app/store/auth.store"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CheckSquare,
  CircleDot,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  X,
  ChevronDown,
  Calendar,
  FolderOpen,
  Loader2,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: string
  title: string
  description?: string
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH"
  projectId: string
  projectTitle?: string
  assigneeId?: string
  assigneeName?: string
  dueDate?: string
  createdAt: string
}

interface Project {
  id: string
  title: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const statusConfig = {
  TODO: {
    label: "Todo",
    icon: CircleDot,
    iconCls: "text-zinc-400",
    badgeCls: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Clock,
    iconCls: "text-blue-500",
    badgeCls: "bg-blue-50 text-blue-600 border-blue-100",
  },
  IN_REVIEW: {
    label: "In Review",
    icon: AlertCircle,
    iconCls: "text-amber-500",
    badgeCls: "bg-amber-50 text-amber-600 border-amber-100",
  },
  DONE: {
    label: "Done",
    icon: CheckCircle2,
    iconCls: "text-green-500",
    badgeCls: "bg-green-50 text-green-600 border-green-100",
  },
}

const priorityConfig = {
  HIGH: { label: "High", cls: "bg-red-50 text-red-600 border-red-100" },
  MEDIUM: { label: "Medium", cls: "bg-amber-50 text-amber-600 border-amber-100" },
  LOW: { label: "Low", cls: "bg-green-50 text-green-600 border-green-100" },
}

// ─── Add Task Modal ───────────────────────────────────────────────────────────

interface AddTaskModalProps {
  open: boolean
  onClose: () => void
  onCreated: (task: Task) => void
  myProjects: Project[]
  user: { id: string; name: string }
}

function AddTaskModal({ open, onClose, onCreated, myProjects, user }: AddTaskModalProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    projectId: "",
    dueDate: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("Title is required.")
      return
    }
    if (!form.projectId) {
      setError("Please select a project.")
      return
    }
    setError("")
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        projectId: form.projectId,
        assigneeId: user.id,
        assigneeName: user.name,
      }
      if (form.dueDate) payload.dueDate = new Date(form.dueDate).toISOString()

      const res = await api.post("/api/tasks", payload)
      const created: Task = res.data.data?.task || res.data.data
      onCreated(created)
      setForm({ title: "", description: "", priority: "MEDIUM", projectId: "", dueDate: "" })
      onClose()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create task."
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-2xl border border-zinc-100 shadow-xl w-full max-w-md z-10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-zinc-600" />
            <h2 className="text-sm font-semibold text-zinc-900">Add Task</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Build auth UI"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="h-9 text-sm border-zinc-200"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600">Description</label>
            <textarea
              placeholder="What needs to be done?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none resize-none placeholder:text-zinc-400 focus:border-zinc-400 transition-colors"
            />
          </div>

          {/* Project select */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600">
              Project <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.projectId}
                onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
                className="w-full h-9 text-sm border border-zinc-200 rounded-lg px-3 pr-8 outline-none appearance-none bg-white text-zinc-700 focus:border-zinc-400 transition-colors"
              >
                <option value="" disabled>
                  Select a project...
                </option>
                {myProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Priority + Due date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600">Priority</label>
              <div className="relative">
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      priority: e.target.value as "LOW" | "MEDIUM" | "HIGH",
                    }))
                  }
                  className="w-full h-9 text-sm border border-zinc-200 rounded-lg px-3 pr-8 outline-none appearance-none bg-white text-zinc-700 focus:border-zinc-400 transition-colors"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="w-full h-9 text-sm border border-zinc-200 rounded-lg px-3 outline-none bg-white text-zinc-700 focus:border-zinc-400 transition-colors"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-8"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            className="text-xs h-8 bg-zinc-900 hover:bg-zinc-800 gap-1.5"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            Create Task
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Task Row ─────────────────────────────────────────────────────────────────

function TaskRow({
  task,
  onStatusChange,
}: {
  task: Task
  onStatusChange: (id: string, status: string) => void
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const cfg = statusConfig[task.status]
  const StatusIcon = cfg.icon
  const isOverdue =
    task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < new Date()

  return (
    <div className="bg-white rounded-xl border border-zinc-100 px-4 py-3.5 flex items-center gap-4 hover:border-zinc-200 transition-colors group">
      <StatusIcon className={cn("w-4 h-4 shrink-0", cfg.iconCls)} />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-800 truncate">{task.title}</p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {task.projectTitle && (
            <span className="flex items-center gap-1 text-[11px] text-zinc-400">
              <FolderOpen className="w-3 h-3" />
              {task.projectTitle}
            </span>
          )}
          {task.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 text-[11px]",
                isOverdue ? "text-red-500" : "text-zinc-400"
              )}
            >
              <Calendar className="w-3 h-3" />
              {isOverdue ? "Overdue · " : ""}
              {new Date(task.dueDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Priority */}
        <span
          className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded border",
            priorityConfig[task.priority]?.cls
          )}
        >
          {priorityConfig[task.priority]?.label}
        </span>

        {/* Status dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-lg border transition-colors",
              cfg.badgeCls
            )}
          >
            {cfg.label}
            <ChevronDown className="w-3 h-3" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-white border border-zinc-100 rounded-xl shadow-lg py-1 w-38 z-20 min-w-[140px]">
                {Object.entries(statusConfig).map(([key, val]) => {
                  const Icon = val.icon
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        onStatusChange(task.id, key)
                        setDropdownOpen(false)
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-zinc-50 transition-colors",
                        task.status === key
                          ? "font-semibold text-zinc-900"
                          : "text-zinc-600"
                      )}
                    >
                      <Icon className={cn("w-3.5 h-3.5", val.iconCls)} />
                      {val.label}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Go to project */}
        {task.projectId && (
          <Link href={`/projects/${task.projectId}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-300 hover:text-zinc-600 hover:bg-zinc-50 transition-colors opacity-0 group-hover:opacity-100">
              <FolderOpen className="w-3.5 h-3.5" />
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type FilterStatus = "ALL" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"

export default function TasksPage() {
  const router = useRouter()
  const { user, _hasHydrated } = useAuthStore()

  const [tasks, setTasks] = useState<Task[]>([])
  const [myProjects, setMyProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL")

  useEffect(() => {
    if (!_hasHydrated) return
    if (!user) {
      router.push("/login")
      return
    }

    Promise.allSettled([
      api.get("/api/tasks/my"),
      api.get("/api/projects/user/mine"),
    ]).then(([tasksRes, projRes]) => {
      if (tasksRes.status === "fulfilled") {
        setTasks(tasksRes.value.data.data?.tasks || [])
      }
      if (projRes.status === "fulfilled") {
        const projects: Project[] = (projRes.value.data.data?.projects || []).map(
          (p: { id: string; title: string }) => ({ id: p.id, title: p.title })
        )
        setMyProjects(projects)
      }
      setLoading(false)
    })
  }, [user, _hasHydrated, router])

  const handleStatusChange = async (taskId: string, status: string) => {
    await api.patch(`/api/tasks/${taskId}/status`, { status })
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: status as Task["status"] } : t
      )
    )
  }

  if (!_hasHydrated) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
      </div>
    )
  }

  // Filter
  const filtered =
    filterStatus === "ALL" ? tasks : tasks.filter((t) => t.status === filterStatus)

  // Counts per status
  const counts = {
    ALL: tasks.length,
    TODO: tasks.filter((t) => t.status === "TODO").length,
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    IN_REVIEW: tasks.filter((t) => t.status === "IN_REVIEW").length,
    DONE: tasks.filter((t) => t.status === "DONE").length,
  }

  const filterOptions: { key: FilterStatus; label: string }[] = [
    { key: "ALL", label: `All (${counts.ALL})` },
    { key: "TODO", label: `Todo (${counts.TODO})` },
    { key: "IN_PROGRESS", label: `In Progress (${counts.IN_PROGRESS})` },
    { key: "IN_REVIEW", label: `In Review (${counts.IN_REVIEW})` },
    { key: "DONE", label: `Done (${counts.DONE})` },
  ]

  return (
    <>
      <div className="p-6 max-w-[900px] mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckSquare className="w-4 h-4 text-zinc-500" />
              <h1 className="text-xl font-semibold text-zinc-900">My Tasks</h1>
            </div>
            <p className="text-sm text-zinc-400">
              All tasks assigned to you across every project.
            </p>
          </div>
          <Button
            size="sm"
            className="gap-1.5 h-8 text-xs bg-zinc-900 hover:bg-zinc-800"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </Button>
        </div>

        {/* ── Summary cards ── */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Open", value: counts.TODO + counts.IN_PROGRESS + counts.IN_REVIEW, color: "text-zinc-900" },
              { label: "In Progress", value: counts.IN_PROGRESS, color: "text-blue-600" },
              { label: "In Review", value: counts.IN_REVIEW, color: "text-amber-600" },
              { label: "Done", value: counts.DONE, color: "text-green-600" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-xl border border-zinc-100 px-4 py-3"
              >
                <p className="text-xs text-zinc-400 font-medium">{s.label}</p>
                <p className={cn("text-2xl font-semibold mt-0.5", s.color)}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Filter tabs ── */}
        <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1" />
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilterStatus(opt.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                filterStatus === opt.key
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* ── Task list ── */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-xl border border-zinc-100 p-4 h-16"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
              <CheckSquare className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-700 mb-1">
              {filterStatus === "DONE"
                ? "Nothing completed yet"
                : filterStatus === "ALL"
                ? "No tasks assigned to you"
                : `No ${statusConfig[filterStatus as keyof typeof statusConfig]?.label} tasks`}
            </p>
            <p className="text-xs text-zinc-400 max-w-xs">
              {filterStatus === "ALL"
                ? "Create a task or ask a project owner to assign one to you."
                : "Switch to a different filter or create a new task."}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4 text-xs h-8 gap-1.5"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {user && (
        <AddTaskModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={(task) => setTasks((prev) => [task, ...prev])}
          myProjects={myProjects}
          user={{ id: user.id, name: user.name }}
        />
      )}
    </>
  )
}