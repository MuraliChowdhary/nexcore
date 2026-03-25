"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/app/store/auth.store"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Settings,
  User,
  Mail,
  FileText,
  Tag,
  Link as LinkIcon,
  Loader2,
  Check,
  X,
  Plus,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileForm {
  name: string
  bio: string
  avatarUrl: string
  skills: string[]
}

// ─── Skill Tag Input ──────────────────────────────────────────────────────────

function SkillTagInput({
  skills,
  onChange,
}: {
  skills: string[]
  onChange: (skills: string[]) => void
}) {
  const [input, setInput] = useState("")

  const addSkill = () => {
    const trimmed = input.trim()
    if (!trimmed || skills.includes(trimmed)) {
      setInput("")
      return
    }
    onChange([...skills, trimmed])
    setInput("")
  }

  const removeSkill = (skill: string) => {
    onChange(skills.filter((s) => s !== skill))
  }

  return (
    <div className="space-y-2">
      {/* Existing tags */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-lg"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a skill (e.g. React, Python...)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault()
              addSkill()
            }
          }}
          className="h-9 text-sm border-zinc-200 flex-1"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addSkill}
          disabled={!input.trim()}
          className="h-9 px-3 text-xs border-zinc-200"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
      <p className="text-[11px] text-zinc-400">Press Enter or comma to add a skill.</p>
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-50">
        <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        {description && (
          <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

// ─── Field Row ────────────────────────────────────────────────────────────────

function FieldRow({
  label,
  hint,
  icon: Icon,
  children,
}: {
  label: string
  hint?: string
  icon?: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 sm:gap-6 py-4 border-b border-zinc-50 last:border-0">
      <div className="flex items-start gap-2 pt-0.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />}
        <div>
          <p className="text-xs font-medium text-zinc-700">{label}</p>
          {hint && <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{hint}</p>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({
  type,
  message,
}: {
  type: "success" | "error"
  message: string
}) {
  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-in slide-in-from-bottom-2 duration-300",
        type === "success"
          ? "bg-white border-green-100 text-green-700"
          : "bg-white border-red-100 text-red-600"
      )}
    >
      {type === "success" ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <AlertCircle className="w-4 h-4 text-red-500" />
      )}
      {message}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter()
  const { user, token, _hasHydrated, setAuth } = useAuthStore()

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    bio: "",
    avatarUrl: "",
    skills: [],
  })
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [originalForm, setOriginalForm] = useState<ProfileForm | null>(null)

  // ── Load profile ──
  useEffect(() => {
    if (!_hasHydrated) return
    if (!user) {
      router.push("/login")
      return
    }

    api
      .get("/api/auth/profile")
      .then((res) => {
        const u = res.data.data?.user || res.data.data || res.data
        const loaded: ProfileForm = {
          name: u.name || "",
          bio: u.bio || "",
          avatarUrl: u.avatarUrl || "",
          skills: u.skills || [],
        }
        setForm(loaded)
        setOriginalForm(loaded)
      })
      .catch(() => {
        // fallback to store data
        const loaded: ProfileForm = {
          name: user.name || "",
          bio: user.bio || "",
          avatarUrl: user.avatarUrl || "",
          skills: user.skills || [],
        }
        setForm(loaded)
        setOriginalForm(loaded)
      })
      .finally(() => setLoadingProfile(false))
  }, [user, _hasHydrated, router])

  // ── Track dirty state ──
  useEffect(() => {
    if (!originalForm) return
    const dirty =
      form.name !== originalForm.name ||
      form.bio !== originalForm.bio ||
      form.avatarUrl !== originalForm.avatarUrl ||
      JSON.stringify(form.skills) !== JSON.stringify(originalForm.skills)
    setIsDirty(dirty)
  }, [form, originalForm])

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast("error", "Name cannot be empty.")
      return
    }
    setSaving(true)
    try {
      const res = await api.put("/api/auth/profile", {
        name: form.name.trim(),
        bio: form.bio.trim() || null,
        avatarUrl: form.avatarUrl.trim() || null,
        skills: form.skills,
      })

      const updated = res.data.data?.user || res.data.data
      // Update the auth store so the sidebar name refreshes
      if (token) {
        setAuth(
          {
            ...user!,
            name: updated.name ?? form.name,
            bio: updated.bio ?? form.bio,
            avatarUrl: updated.avatarUrl ?? form.avatarUrl,
            skills: updated.skills ?? form.skills,
          },
          token
        )
      }

      const newForm: ProfileForm = {
        name: updated.name || form.name,
        bio: updated.bio || form.bio,
        avatarUrl: updated.avatarUrl || form.avatarUrl,
        skills: updated.skills || form.skills,
      }
      setOriginalForm(newForm)
      setForm(newForm)
      showToast("success", "Profile updated successfully.")
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save changes."
      showToast("error", msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    if (originalForm) setForm(originalForm)
  }

  if (!_hasHydrated || loadingProfile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
      </div>
    )
  }

  const initials = form.name
    ? form.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  return (
    <>
      <div className="p-6 max-w-[720px] mx-auto space-y-6">
        {/* ── Header ── */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-zinc-500" />
            <h1 className="text-xl font-semibold text-zinc-900">Settings</h1>
          </div>
          <p className="text-sm text-zinc-400">
            Manage your profile and account preferences.
          </p>
        </div>

        {/* ── Avatar preview ── */}
        <div className="bg-white rounded-xl border border-zinc-100 px-6 py-5 flex items-center gap-5">
          <div className="relative shrink-0">
            {form.avatarUrl ? (
              <img
                src={form.avatarUrl}
                alt={form.name}
                className="w-14 h-14 rounded-full object-cover border border-zinc-100"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-zinc-900 text-white text-lg font-semibold flex items-center justify-center select-none">
                {initials}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">{form.name || "Your Name"}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{user?.email}</p>
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.skills.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="text-[10px] font-medium text-zinc-500 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded-md"
                  >
                    {s}
                  </span>
                ))}
                {form.skills.length > 4 && (
                  <span className="text-[10px] text-zinc-400 self-center">
                    +{form.skills.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Profile section ── */}
        <Section
          title="Profile Information"
          description="This is how others will see you on NexCore."
        >
          <FieldRow label="Full Name" icon={User} hint="Your display name across the platform.">
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Murali Sudireddy"
              className="h-9 text-sm border-zinc-200"
            />
          </FieldRow>

          <FieldRow label="Email" icon={Mail} hint="Your account email. Cannot be changed.">
            <div className="flex items-center gap-2">
              <Input
                value={user?.email || ""}
                disabled
                className="h-9 text-sm border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed"
              />
              <span className="text-[10px] font-medium text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-1 rounded-md whitespace-nowrap">
                Read only
              </span>
            </div>
          </FieldRow>

          <FieldRow label="Bio" icon={FileText} hint="A short description about yourself.">
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Tell others about yourself, your background, what you're working on..."
              rows={3}
              maxLength={300}
              className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none resize-none placeholder:text-zinc-400 focus:border-zinc-400 transition-colors"
            />
            <p className="text-[11px] text-zinc-400 mt-1 text-right">
              {form.bio.length}/300
            </p>
          </FieldRow>

          <FieldRow
            label="Avatar URL"
            icon={LinkIcon}
            hint="Link to your profile picture."
          >
            <Input
              value={form.avatarUrl}
              onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
              placeholder="https://example.com/avatar.png"
              className="h-9 text-sm border-zinc-200"
            />
          </FieldRow>
        </Section>

        {/* ── Skills section ── */}
        <Section
          title="Skills"
          description="Add skills so others can find you for the right projects."
        >
          <FieldRow label="Your Skills" icon={Tag}>
            <SkillTagInput
              skills={form.skills}
              onChange={(skills) => setForm((f) => ({ ...f, skills }))}
            />
          </FieldRow>
        </Section>

        {/* ── Danger zone ── */}
        <Section title="Account">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-zinc-700">Sign out</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                You will be redirected to the login page.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8 text-red-600 border-red-100 hover:bg-red-50"
              onClick={() => {
                useAuthStore.getState().clearAuth()
                router.push("/login")
              }}
            >
              Sign out
            </Button>
          </div>
        </Section>

        {/* ── Save bar ── */}
        <div
          className={cn(
            "fixed bottom-0 left-[220px] right-0 bg-white border-t border-zinc-100 px-6 py-4 flex items-center justify-between transition-all duration-300",
            isDirty ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
          )}
        >
          <p className="text-sm text-zinc-500">You have unsaved changes.</p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8 border-zinc-200"
              onClick={handleDiscard}
              disabled={saving}
            >
              Discard
            </Button>
            <Button
              size="sm"
              className="text-xs h-8 bg-zinc-900 hover:bg-zinc-800 gap-1.5"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Save changes
            </Button>
          </div>
        </div>

        {/* Bottom padding so save bar doesn't cover content */}
        {isDirty && <div className="h-20" />}
      </div>

      {/* ── Toast ── */}
      {toast && <Toast type={toast.type} message={toast.message} />}
    </>
  )
}