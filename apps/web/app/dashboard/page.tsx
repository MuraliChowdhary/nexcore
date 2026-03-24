"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useAuthStore } from "../store/auth.store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CreateProjectModal from "@/components/projects/CreateProjectModal"

interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  rolesNeeded: string[]
  ownerId: string
  members: { userId: string; role: string }[]
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, clearAuth,_hasHydrated } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [joining, setJoining] = useState<string | null>(null)

  
useEffect(() => {
  if (!_hasHydrated) return
  if (!isAuthenticated()) router.push("/login")
}, [_hasHydrated])

if (!_hasHydrated) {
  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  )
}

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

  useEffect(() => { fetchProjects() }, [])

  const handleJoin = async (projectId: string) => {
    setJoining(projectId)
    try {
      await api.post(`/api/projects/${projectId}/join`)
      await fetchProjects()
      router.push(`/projects/${projectId}`)
    } catch (err: any) {
      alert(err.response?.data?.error || "Could not join project")
    } finally {
      setJoining(null)
    }
  }

  const isMember = (project: Project) =>
    project.members.some((m) => m.userId === user?.id)

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">NexCore</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.name}</span>
          <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
            New project
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { clearAuth(); router.push("/login") }}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Discover projects</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Find projects to collaborate on
          </p>
        </div>

        {loading ? (
          <div className="text-muted-foreground text-sm">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>No projects yet.</p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              Create the first one
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-xl p-5 space-y-3 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium">{project.title}</h3>
                  <Badge variant="secondary">{project.members.length} members</Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {project.techStack.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">
                    {project.rolesNeeded.length > 0
                      ? `Needs: ${project.rolesNeeded.join(", ")}`
                      : "No roles listed"}
                  </span>

                  {isMember(project) ? (
                    <Button size="sm" onClick={() => router.push(`/projects/${project.id}`)}>
                      Open workspace
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={joining === project.id}
                      onClick={() => handleJoin(project.id)}
                    >
                      {joining === project.id ? "Joining..." : "Join"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateProjectModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); fetchProjects() }}
      />
    </div>
  )
}