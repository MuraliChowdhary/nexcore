"use client"
import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { getSocket } from "@/lib/socket"
import { useAuthStore } from "../../store/auth.store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
}

export default function WorkspacePage() {
  const { id: projectId } = useParams() as { id: string }
  const router = useRouter()
  const { user, _hasHydrated } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [project, setProject] = useState<any>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!_hasHydrated) return
    if (!user) {
      router.push("/login")
      return
    }

    api.get(`/api/projects/${projectId}`).then((res) => {
      setProject(res.data.data.project)
    })


    // connect socket
    const socket = getSocket()
    socket.connect()
    socket.emit("join_room", projectId)

    socket.on("message_history", (history: Message[]) => {
      setMessages(history)
    })

    socket.on("new_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg])
    })

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
        { id: Date.now().toString(), senderId: "system", senderName: "system", ...msg },
      ])
    })

    return () => {
      socket.emit("leave_room", projectId)
      socket.off("message_history")
      socket.off("new_message")
      socket.off("user_joined")
      socket.off("system_message")
    }
  }, [projectId, user, _hasHydrated])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim()) return
    const socket = getSocket()
    socket.emit("send_message", { roomId: projectId, content: input })
    setInput("")
  }


    if (!_hasHydrated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            ← Back
          </Button>
          <div>
            <h1 className="font-semibold">{project?.title || "Loading..."}</h1>
            <p className="text-xs text-muted-foreground">
              {project?.members?.length || 0} members · {project?.techStack?.join(", ")}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {project?.rolesNeeded?.map((role: string) => (
            <Badge key={role} variant="outline" className="text-xs">{role}</Badge>
          ))}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.map((msg) => {
          const isSystem = msg.senderId === "system"
          const isMe = msg.senderId === user?.id
          return (
            <div key={msg.id} className={`flex flex-col ${isSystem ? "items-center" : isMe ? "items-end" : "items-start"}`}>
              {isSystem ? (
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {msg.content}
                </span>
              ) : (
                <div className={`max-w-xs lg:max-w-md ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  {!isMe && (
                    <span className="text-xs text-muted-foreground px-1">{msg.senderName}</span>
                  )}
                  <div className={`px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t px-6 py-4 flex gap-3 shrink-0">
        <Input
          placeholder="Send a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1"
        />
        <Button onClick={sendMessage} disabled={!input.trim()}>
          Send
        </Button>
      </div>
    </div>
  )
}