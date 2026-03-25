"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { getSocket } from "@/lib/socket"
import { useAuthStore } from "@/app/store/auth.store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Globe,
  Lock,
  Users,
  MessageSquare,
  LayoutList,
  BarChart2,
  Crown,
  CircleDot,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  Send,
  ChevronDown,
  X,
  UserPlus,
  Calendar,
  AlignLeft,
  Tag,
  Loader2,
  Check,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  rolesNeeded: string[]
  visibility: "PUBLIC" | "PRIVATE"
  ownerId: string
  members: { userId: string; userName: string; role: string }[]
}

interface Task {
  id: string
  title: string
  description?: string
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH"
  assigneeName?: string
  assigneeId?: string
  dueDate?: string
  createdAt: string
}

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
}

interface Progress {
  total: number
  done: number
  inProgress: number
  todo: number
  percentage: number
}

type Tab = "overview" | "tasks" | "chat" | "members"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const priorityConfig = {
  HIGH: { label: "High", className: "bg-red-50 text-red-600 border-red-100" },
  MEDIUM: { label: "Medium", className: "bg-amber-50 text-amber-600 border-amber-100" },
  LOW: { label: "Low", className: "bg-green-50 text-green-600 border-green-100" },
}

const statusConfig = {
  TODO: {
    label: "Todo",
    icon: CircleDot,
    className: "text-zinc-400",
    bg: "bg-zinc-100 text-zinc-600",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Clock,
    className: "text-blue-500",
    bg: "bg-blue-50 text-blue-600",
  },
  IN_REVIEW: {
    label: "In Review",
    icon: AlertCircle,
    className: "text-amber-500",
    bg: "bg-amber-50 text-amber-600",
  },
  DONE: {
    label: "Done",
    icon: CheckCircle2,
    className: "text-green-500",
    bg: "bg-green-50 text-green-600",
  },
}

// ─── Create Task Modal ────────────────────────────────────────────────────────

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  projectId: string
  members: { userId: string; userName: string; role: string }[]
  onCreated: (task: Task) => void
}

function CreateTaskModal({ open, onClose, projectId, members, onCreated }: CreateTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM")
  const [assigneeId, setAssigneeId] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const reset = () => {
    setTitle("")
    setDescription("")
    setPriority("MEDIUM")
    setAssigneeId("")
    setDueDate("")
    setError("")
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Task title is required.")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const assignee = members.find((m) => m.userId === assigneeId)
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        projectId,
        assigneeId: assigneeId || undefined,
        assigneeName: assignee?.userName || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      }
      const res = await api.post("/api/tasks", payload)
      const created: Task = res.data.data?.task || res.data.data
      onCreated(created)
      handleClose()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err?.response?.data?.message || "Failed to create task.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={handleClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-zinc-200/80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900">New Task</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
              <Tag className="w-3 h-3" /> Title <span className="text-red-400">*</span>
            </label>
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build authentication UI"
              className="h-9 text-sm border-zinc-200 focus:border-zinc-400"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
              <AlignLeft className="w-3 h-3" /> Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={2}
              className="w-full text-sm border border-zinc-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-400 transition-colors"
            />
          </div>

          {/* Priority + Assignee row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Priority</label>
              <div className="flex gap-1.5">
                {(["LOW", "MEDIUM", "HIGH"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "flex-1 text-[10px] font-semibold py-1.5 rounded-md border transition-all",
                      priority === p
                        ? priorityConfig[p].className + " shadow-sm"
                        : "border-zinc-200 text-zinc-400 hover:border-zinc-300"
                    )}
                  >
                    {p === "LOW" ? "Low" : p === "MEDIUM" ? "Med" : "High"}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9 text-xs border-zinc-200 focus:border-zinc-400"
              />
            </div>
          </div>

          {/* Assignee */}
          {members.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                <Users className="w-3 h-3" /> Assign to
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full text-sm border border-zinc-200 rounded-md px-3 py-2 focus:outline-none focus:border-zinc-400 bg-white text-zinc-700 transition-colors"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.userName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" /> {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-100 flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 text-xs text-zinc-500"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || !title.trim()}
            className="h-8 text-xs bg-zinc-900 hover:bg-zinc-800 gap-1.5 min-w-[90px]"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Check className="w-3.5 h-3.5" /> Create Task
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Invite User Modal ────────────────────────────────────────────────────────

interface InviteUserModalProps {
  open: boolean
  onClose: () => void
  projectId: string
}

function InviteUserModal({ open, onClose, projectId }: InviteUserModalProps) {
  const [inviteeId, setInviteeId] = useState("")
  const [inviteeName, setInviteeName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleClose = () => {
    setInviteeId("")
    setInviteeName("")
    setError("")
    setSuccess(false)
    onClose()
  }

  const handleInvite = async () => {
    if (!inviteeId.trim()) {
      setError("User ID is required.")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      await api.post(`/api/projects/${projectId}/invite`, {
        inviteeId: inviteeId.trim(),
        inviteeName: inviteeName.trim() || undefined,
      })
      setSuccess(true)
      setTimeout(handleClose, 1500)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err?.response?.data?.message || "Failed to send invite.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={handleClose} />

      <div className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-zinc-200/80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
              <UserPlus className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-900">Invite Collaborator</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {success ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-zinc-800">Invite sent successfully</p>
              <p className="text-xs text-zinc-400">They'll see it in their pending invites.</p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> User ID <span className="text-red-400">*</span>
                </label>
                <Input
                  autoFocus
                  value={inviteeId}
                  onChange={(e) => setInviteeId(e.target.value)}
                  placeholder="Paste user UUID..."
                  className="h-9 text-sm border-zinc-200 focus:border-zinc-400 font-mono text-xs"
                />
                <p className="text-[10px] text-zinc-400">
                  Ask the collaborator to share their User ID from their profile.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500">
                  Their name <span className="text-zinc-300">(optional)</span>
                </label>
                <Input
                  value={inviteeName}
                  onChange={(e) => setInviteeName(e.target.value)}
                  placeholder="e.g. Murali Sudireddy"
                  className="h-9 text-sm border-zinc-200 focus:border-zinc-400"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" /> {error}
                </p>
              )}
            </>
          )}
        </div>

        {!success && (
          <div className="px-5 py-3.5 border-t border-zinc-100 flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 text-xs text-zinc-500"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleInvite}
              disabled={submitting || !inviteeId.trim()}
              className="h-8 text-xs bg-zinc-900 hover:bg-zinc-800 gap-1.5 min-w-[90px]"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" /> Send Invite
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ project, progress }: { project: Project; progress: Progress | null }) {
  const pct = progress?.percentage ?? 0

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
          About
        </h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          {project.description || "No description provided."}
        </p>
      </div>

      {progress && (
        <div>
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            Progress
          </h3>
          <div className="bg-white rounded-xl border border-zinc-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-zinc-700">
                {progress.done} of {progress.total} tasks completed
              </span>
              <span className="text-sm font-semibold text-zinc-900">{pct}%</span>
            </div>
            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-900 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex gap-4 mt-4">
              {[
                { label: "Todo", value: progress.todo, color: "bg-zinc-200" },
                { label: "In Progress", value: progress.inProgress, color: "bg-blue-400" },
                { label: "Done", value: progress.done, color: "bg-green-400" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <div className={cn("w-2 h-2 rounded-full", s.color)} />
                  {s.value} {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {project.techStack?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-xs font-medium text-zinc-700 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {project.rolesNeeded?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
            Roles Needed
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.rolesNeeded.map((role) => (
              <span
                key={role}
                className="text-xs font-medium text-violet-700 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-lg"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Tasks ───────────────────────────────────────────────────────────────

function TasksTab({
  projectId,
  isOwner,
  members,
  onProgressChange,
}: {
  projectId: string
  isOwner: boolean
  members: { userId: string; userName: string; role: string }[]
  onProgressChange: () => void
}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("ALL")
  const [createOpen, setCreateOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchTasks = useCallback(() => {
    api
      .get(`/api/tasks/project/${projectId}`)
      .then((res) => setTasks(res.data.data?.tasks || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const updateStatus = async (taskId: string, status: string) => {
    setOpenDropdown(null)
    await api.patch(`/api/tasks/${taskId}/status`, { status })
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: status as Task["status"] } : t))
    )
    // Notify parent to refresh progress bar
    onProgressChange()
  }

  const handleTaskCreated = (task: Task) => {
    setTasks((prev) => [task, ...prev])
    onProgressChange()
  }

  const filters = ["ALL", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]
  const filtered = filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter)

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white rounded-xl border border-zinc-100 p-4 h-16"
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        projectId={projectId}
        members={members}
        onCreated={handleTaskCreated}
      />

      <div className="p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-0.5 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
                  filter === f
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                {f === "ALL"
                  ? `All (${tasks.length})`
                  : `${statusConfig[f as keyof typeof statusConfig]?.label} (${tasks.filter((t) => t.status === f).length})`}
              </button>
            ))}
          </div>
          {isOwner && (
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="gap-1.5 h-8 text-xs bg-zinc-900 hover:bg-zinc-800 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </Button>
          )}
        </div>

        {/* Task list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
              <LayoutList className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-600">No tasks here</p>
            <p className="text-xs text-zinc-400 mt-1">
              {isOwner ? "Click 'Add Task' to get started." : "No tasks in this category yet."}
            </p>
            {isOwner && filter === "ALL" && (
              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                variant="outline"
                className="mt-4 h-8 text-xs gap-1.5"
              >
                <Plus className="w-3 h-3" /> Create first task
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2" ref={dropdownRef}>
            {filtered.map((task) => {
              const StatusIcon = statusConfig[task.status]?.icon || CircleDot
              const isDropOpen = openDropdown === task.id
              return (
                <div
                  key={task.id}
                  className="bg-white rounded-xl border border-zinc-100 px-4 py-3.5 flex items-center gap-4 hover:border-zinc-200 transition-colors group"
                >
                  <StatusIcon
                    className={cn("w-4 h-4 shrink-0", statusConfig[task.status]?.className)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 truncate">{task.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {task.description && (
                        <p className="text-xs text-zinc-400 truncate">{task.description}</p>
                      )}
                      {task.dueDate && (
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1 shrink-0">
                          <Calendar className="w-2.5 h-2.5" />
                          {new Date(task.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {task.assigneeName && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <div className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-600 text-[10px] font-semibold flex items-center justify-center">
                          {task.assigneeName.charAt(0).toUpperCase()}
                        </div>
                        <span className="hidden sm:inline">{task.assigneeName.split(" ")[0]}</span>
                      </div>
                    )}

                    <span
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                        priorityConfig[task.priority]?.className
                      )}
                    >
                      {priorityConfig[task.priority]?.label}
                    </span>

                    {/* Status dropdown — click-based, not hover */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenDropdown(isDropOpen ? null : task.id)
                        }
                        className={cn(
                          "flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md transition-colors",
                          statusConfig[task.status]?.bg
                        )}
                      >
                        {statusConfig[task.status]?.label}
                        <ChevronDown
                          className={cn(
                            "w-3 h-3 transition-transform",
                            isDropOpen && "rotate-180"
                          )}
                        />
                      </button>

                      {isDropOpen && (
                        <div className="absolute right-0 top-full mt-1.5 bg-white border border-zinc-100 rounded-xl shadow-lg py-1 w-38 z-20 overflow-hidden">
                          {Object.entries(statusConfig).map(([key, val]) => (
                            <button
                              key={key}
                              onClick={() => updateStatus(task.id, key)}
                              className={cn(
                                "w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-zinc-50 transition-colors text-left",
                                task.status === key
                                  ? "font-semibold text-zinc-900 bg-zinc-50/80"
                                  : "text-zinc-600"
                              )}
                            >
                              <val.icon className={cn("w-3.5 h-3.5", val.className)} />
                              {val.label}
                              {task.status === key && (
                                <Check className="w-3 h-3 ml-auto text-zinc-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

// ─── Tab: Chat ────────────────────────────────────────────────────────────────

function ChatTab({
  projectId,
  user,
}: {
  projectId: string
  user: { id: string; name: string }
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const socket = getSocket()
    if (!socket.connected) socket.connect()
    socket.emit("join_room", projectId)

    socket.on("message_history", (history: Message[]) => setMessages(history))
    socket.on("new_message", (msg: Message) =>
      setMessages((prev) => [...prev, msg])
    )
    socket.on("user_joined", ({ userName }: { userName: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          senderId: "system",
          senderName: "system",
          content: `${userName} joined the workspace`,
          createdAt: new Date().toISOString(),
        },
      ])
    })
    socket.on("system_message", (msg: { content: string; createdAt: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          senderId: "system",
          senderName: "system",
          ...msg,
        },
      ])
    })

    return () => {
      socket.emit("leave_room", projectId)
      socket.off("message_history")
      socket.off("new_message")
      socket.off("user_joined")
      socket.off("system_message")
    }
  }, [projectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim()) return
    const socket = getSocket()
    socket.emit("send_message", { roomId: projectId, content: input })
    setInput("")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-600">No messages yet</p>
            <p className="text-xs text-zinc-400 mt-1">Start the conversation</p>
          </div>
        )}
        {messages.map((msg) => {
          const isSystem = msg.senderId === "system"
          const isMe = msg.senderId === user.id
          return (
            <div
              key={msg.id}
              className={cn(
                "flex",
                isSystem ? "justify-center" : isMe ? "justify-end" : "justify-start"
              )}
            >
              {isSystem ? (
                <span className="text-[11px] text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">
                  {msg.content}
                </span>
              ) : (
                <div
                  className={cn(
                    "max-w-[70%] flex flex-col gap-0.5",
                    isMe ? "items-end" : "items-start"
                  )}
                >
                  {!isMe && (
                    <span className="text-[11px] text-zinc-400 px-1 font-medium">
                      {msg.senderName}
                    </span>
                  )}
                  <div
                    className={cn(
                      "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                      isMe
                        ? "bg-zinc-900 text-white rounded-br-sm"
                        : "bg-white border border-zinc-100 text-zinc-800 rounded-bl-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-zinc-300 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-zinc-100 px-6 py-4 flex gap-2.5 shrink-0 bg-white">
        <Input
          placeholder="Send a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          className="flex-1 h-9 text-sm border-zinc-200 bg-zinc-50 focus:bg-white transition-colors"
        />
        <Button
          onClick={sendMessage}
          disabled={!input.trim()}
          size="sm"
          className="h-9 w-9 p-0 bg-zinc-900 hover:bg-zinc-800"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ─── Tab: Members ─────────────────────────────────────────────────────────────

function MembersTab({
  project,
  isOwner,
}: {
  project: Project
  isOwner: boolean
}) {
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <>
      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        projectId={project.id}
      />

      <div className="p-6 max-w-2xl space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            {project.members?.length || 0} Members
          </p>
          {isOwner && (
            <Button
              size="sm"
              onClick={() => setInviteOpen(true)}
              variant="outline"
              className="h-8 text-xs gap-1.5 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
            >
              <UserPlus className="w-3.5 h-3.5" /> Invite
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {project.members?.map((member) => {
            const isOwnerMember = member.userId === project.ownerId
            return (
              <div
                key={member.userId}
                className="bg-white rounded-xl border border-zinc-100 px-4 py-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-zinc-900 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                  {(member.userName || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-zinc-900">{member.userName}</p>
                    {isOwnerMember && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <p className="text-xs text-zinc-400 capitalize">
                    {isOwnerMember ? "Owner" : member.role?.toLowerCase() || "Collaborator"}
                  </p>
                </div>
                {isOwnerMember ? (
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                    Owner
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-zinc-500 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-full">
                    Member
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: BarChart2 },
  { id: "tasks", label: "Tasks", icon: LayoutList },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "members", label: "Members", icon: Users },
]

export default function WorkspacePage() {
  const { id: projectId } = useParams() as { id: string }
  const router = useRouter()
  const { user, _hasHydrated } = useAuthStore()

  const [project, setProject] = useState<Project | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!_hasHydrated) return
    if (!user) {
      router.push("/login")
      return
    }

    Promise.allSettled([
  api.get(`/api/projects/${projectId}`),
  api.get(`/api/tasks/project/${projectId}/progress`),
]).then(([projRes, progRes]) => {

  if (projRes.status === "fulfilled") {
    console.log("project:", projRes.value.data.data?.project);
    setProject(projRes.value.data.data?.project || null);
  } else {
    console.error("Project API failed:", projRes.reason);
  }

  if (progRes.status === "fulfilled") {
    console.log("progress:", progRes.value.data.data);
    setProgress(progRes.value.data.data || null);
  } else {
    console.error("Progress API failed:", progRes.reason);
  }

  setLoading(false);
});
  }, [projectId, user, _hasHydrated, router])

  // Refresh progress after task status changes
  const refreshProgress = useCallback(() => {
    api
      .get(`/api/tasks/project/${projectId}/progress`)
      .then((res) => setProgress(res.data.data || null))
      .catch(() => {})
  }, [projectId])

  if (!_hasHydrated || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-zinc-500">Project not found or you don&apos;t have access.</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    )
  }

  const isOwner = project.ownerId === user?.id

  return (
    <div className="h-full flex flex-col">
      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-100 px-6 py-4 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Link href="/dashboard">
              <button className="mt-0.5 w-7 h-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors">
                <ArrowLeft className="w-4 h-4 text-zinc-500" />
              </button>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-semibold text-zinc-900 text-base">{project.title}</h1>
                {isOwner && <Crown className="w-4 h-4 text-amber-500 shrink-0" />}
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
              <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {project.members?.length || 0} members
                </span>
                {progress && <span>{progress.percentage}% complete</span>}
              </div>
            </div>
          </div>

          {/* Progress pill */}
          {progress && (
            <div className="hidden sm:flex items-center gap-2 bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-1.5 shrink-0">
              <div className="w-24 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-zinc-700">{progress.percentage}%</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white border-b border-zinc-100 px-6 shrink-0">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === "chat" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "overview" && (
          <div className="h-full overflow-y-auto">
            <OverviewTab project={project} progress={progress} />
          </div>
        )}
        {activeTab === "tasks" && (
          <div className="h-full overflow-y-auto">
            <TasksTab
              projectId={projectId}
              isOwner={isOwner}
              members={project.members || []}
              onProgressChange={refreshProgress}
            />
          </div>
        )}
        {activeTab === "chat" && user && (
          <ChatTab projectId={projectId} user={user} />
        )}
        {activeTab === "members" && (
          <div className="h-full overflow-y-auto">
            <MembersTab project={project} isOwner={isOwner} />
          </div>
        )}
      </div>
    </div>
  )
}