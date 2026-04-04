"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useAuthStore } from "../app/store/auth.store"
import Link from "next/link"

import { GalleryVerticalEnd } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const [form, setForm] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
     const buttonDivRef = useRef<HTMLDivElement | null>(null)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await api.post("/api/auth/login", form)
      const { user, token } = res.data.data

      setAuth(user, token)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {/* Header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>

            <h1 className="text-xl font-bold">Welcome to NexCore</h1>

            <FieldDescription>
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline">
                Sign up
              </Link>
            </FieldDescription>
          </div>

          {/* Email */}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              className="shadow rounded-lg h-9.5"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </Field>

          {/* Password */}
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="shadow rounded-lg h-9.5"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />
          </Field>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive text-center">
              {error}
            </p>
          )}

          {/* Submit */}
          <Field>
            <Button type="submit" disabled={loading} className="w-full mt-1">
              {loading ? "Signing in..." : "Login"}
            </Button>
          </Field>

          {/* Divider */}
         <FieldSeparator className="my-4">Or</FieldSeparator>


          {/* Social Buttons */}
            <Field className="grid gap-2 sm:grid-cols-1">
              {/* 🟢 REPLACED: custom button with hidden GSI overlay (exactly like signup) */}
              <div className="relative w-full">
                {/* ── Visual button (decorative, no click events) ── */}
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    flex items-center justify-center gap-2
                    w-full h-9.5
                    border border-input bg-background shadow-sm rounded-md
                    px-4 py-2
                    text-sm font-medium
                    select-none
                  "
                >
                  <svg viewBox="0 0 533.5 544.3" className="h-5 w-5">
                    <path
                      fill="#4285F4"
                      d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.4h146.9c-6.3 34-25 62.8-53.4 82l86.3 67.1c50.4-46.5 81.7-115 81.7-194.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M272 544.3c72.6 0 133.5-24.1 178-65.3l-86.3-67.1c-24 16.1-54.7 25.6-91.7 25.6-70.5 0-130.3-47.6-151.7-111.5H30.1v69.9C74.5 482.9 166.4 544.3 272 544.3z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M120.3 326c-10.5-31.4-10.5-65.3 0-96.7V159.4H30.1c-36.7 72.9-36.7 159.7 0 232.6l90.2-66z"
                    />
                    <path
                      fill="#EA4335"
                      d="M272 107.7c39.5-.6 77.5 14.3 106.5 41.9l79.4-79.4C408.8 24.6 342.6-.1 272 0 166.4 0 74.5 61.4 30.1 159.4l90.2 69.9C141.7 155.4 201.5 107.7 272 107.7z"
                    />
                  </svg>


                  <span>Continue with Google</span>
                </div>

                {/* ── Hidden GSI button overlay – receives all clicks ── */}
                <div
                  ref={buttonDivRef}
                  className="
                    absolute inset-0
                    overflow-hidden rounded-full
                    opacity-0
                    [&>div]:!w-full [&>div]:!h-full
                    [&_iframe]:!w-full [&_iframe]:!h-full
                  "
                />
              </div>
            </Field>
        </FieldGroup>
      </form>

      {/* Footer */}
      <FieldDescription className="px-6 text-center text-sm">
        By clicking continue, you agree to our{" "}
        <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}