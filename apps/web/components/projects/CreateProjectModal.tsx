"use client"
import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export default function CreateProjectModal({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    title: "", description: "", techStack: "", rolesNeeded: "", visibility: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await api.post("/api/projects", {
        title: form.title,
        description: form.description,
        techStack: form.techStack.split(",").map((s) => s.trim()).filter(Boolean),
        rolesNeeded: form.rolesNeeded.split(",").map((s) => s.trim()).filter(Boolean),
        visibility: "PUBLIC"
      })
      setForm({ title: "", description: "", techStack: "", rolesNeeded: "", visibility: "" })
      onCreated()
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create project")
    } finally {
      setLoading(false)
    }
  }

  const items = [
  { label: "Public", value: "PUBLIC" },
  { label: "Private", value: "PRIVATE" },
]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create a project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Input placeholder="Project title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea
            className="w-full border rounded-md p-3 text-sm resize-none h-24 bg-background"
            placeholder="What are you building?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <Input placeholder="Tech stack (React, Node.js, PostgreSQL)" value={form.techStack}
            onChange={(e) => setForm({ ...form, techStack: e.target.value })} required />
          <Input placeholder="Roles needed (Frontend Dev, ML Engineer)" value={form.rolesNeeded}
            onChange={(e) => setForm({ ...form, rolesNeeded: e.target.value })} />
          <Select items={items}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Visibility" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      {items.map((item) => (
        <SelectItem key={item.value} value={item.value}>
          {item.label}
        </SelectItem>
      ))}
    </SelectGroup>
  </SelectContent>
</Select>
           
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}