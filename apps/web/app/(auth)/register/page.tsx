"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useAuthStore } from "../../store/auth.store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({
    name: "", email: "", password: "", bio: "", skills: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await api.post("/api/auth/register", {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      })
      const { user, token } = res.data.data
      setAuth(user, token)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 border rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-muted-foreground text-sm mt-1">Join NexCore</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Full name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input type="password" placeholder="Password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Input placeholder="Bio (optional)" value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <Input placeholder="Skills (comma separated: React, Node.js)" value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}