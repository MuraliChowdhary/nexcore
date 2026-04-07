"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { SuggestedCollaborators } from "@/components/suggested-collaborators"
import { SmartInviteModal } from "@/components/smart-invite-modal"
import { Button } from "@/components/ui/button"
import { Crown, UserPlus, Sparkles, Check } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  userId: string
  userName: string
  role: string
}

interface Project {
  id: string
  title: string
  createdBy: string
  members: Member[]
  techStack: string[]
  rolesNeeded: string[]
  visibility: "PUBLIC" | "PRIVATE"
}

interface Props {
  project: Project
  isOwner: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MembersTabs({ project, isOwner }: Props) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [recentlyInvited, setRecentlyInvited] = useState<{ id: string; name: string }[]>([])
  const [showSuggested, setShowSuggested] = useState(true)

  const existingMemberIds = project.members.map((m) => m.userId)

  const handleInvited = (userId: string, name: string) => {
    setRecentlyInvited((prev) => [...prev, { id: userId, name }])
  }

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      {/* ── Header row ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500">
          {project.members.length} member{project.members.length !== 1 ? "s" : ""}
        </p>
        {isOwner && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSuggested((v) => !v)}
              className="h-7 text-xs gap-1.5 border-violet-200 text-violet-600 hover:bg-violet-50"
            >
              <Sparkles className="w-3 h-3" />
              {showSuggested ? "Hide" : "Show"} suggestions
            </Button>
            <Button
              size="sm"
              onClick={() => setInviteModalOpen(true)}
              className="h-7 text-xs gap-1.5 bg-zinc-900 hover:bg-zinc-800"
            >
              <UserPlus className="w-3 h-3" />
              Invite member
            </Button>
          </div>
        )}
      </div>

      {/* ── Current members list ── */}
      <div className="space-y-2">
        {project.members.map((member) => {
          const isProjectOwner = member.userId === project.createdBy
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
                  {isProjectOwner && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <p className="text-xs text-zinc-400 capitalize mt-0.5">
                  {isProjectOwner ? "Owner" : member.role?.toLowerCase() || "Collaborator"}
                </p>
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                  isProjectOwner
                    ? "text-amber-600 bg-amber-50 border-amber-100"
                    : "text-zinc-500 bg-zinc-50 border-zinc-100"
                )}
              >
                {isProjectOwner ? "Owner" : "Member"}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── Recently invited (this session) ── */}
      {recentlyInvited.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest">
            Invited this session
          </p>
          {recentlyInvited.map((inv) => (
            <div
              key={inv.id}
              className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 text-sm font-semibold flex items-center justify-center shrink-0">
                {inv.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-medium text-green-800 flex-1">{inv.name}</p>
              <span className="flex items-center gap-1 text-[10px] font-medium text-green-700">
                <Check className="w-3 h-3" /> Invite sent
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── AI-suggested collaborators (owner only, private projects) ── */}
      {isOwner && showSuggested && (
        <SuggestedCollaborators
          projectId={project.id}
          techStack={project.techStack}
          rolesNeeded={project.rolesNeeded}
          existingMemberIds={[
            ...existingMemberIds,
            ...recentlyInvited.map((i) => i.id),
          ]}
          onInvited={(userId : string) => {
            const match = recentlyInvited.find((i) => i.id === userId)
            if (!match) {
              // name will come from the SuggestedCollaborators component
            }
          }}
        />
      )}

      {/* ── Smart invite modal ── */}
      {inviteModalOpen && (
        <SmartInviteModal
          projectId={project.id}
          projectTitle={project.title}
          techStack={project.techStack}
          rolesNeeded={project.rolesNeeded}
          existingMemberIds={[
            ...existingMemberIds,
            ...recentlyInvited.map((i) => i.id),
          ]}
          onClose={() => setInviteModalOpen(false)}
          onInvited={handleInvited}
        />
      )}
    </div>
  )
}