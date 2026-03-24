// test-socket.mjs — run with: bun test-socket.mjs
import { io } from "socket.io-client"

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5YWRhYTcwZS02MjdhLTRkZDQtODY1Yy04Y2MwMWNjNWI1YTUiLCJlbWFpbCI6InRlc3RAbmV4Y29yZS5kZXYiLCJuYW1lIjoiVGVzdCBVc2VyIiwiaWF0IjoxNzc0MjkxNjc4LCJleHAiOjE3NzQ4OTY0Nzh9.8RGN8nv08ClgYGq4gKU2mpeRz4FyBWyIwc5_3HVrVs0"
const PROJECT_ID = "fcad008a-4426-4bb1-ac48-fb1e52b1dcf2"

const socket = io("http://localhost:3000/api/messages", {
  auth: { token: TOKEN },
  transports: ["websocket"],
})

socket.on("connect", () => {
  console.log("connected:", socket.id)
  socket.emit("join_room", PROJECT_ID)
})

socket.on("message_history", (messages) => {
  console.log("history:", messages)
  // send a test message
  socket.emit("send_message", {
    roomId: PROJECT_ID,
    content: "Hello NexCore!",
  })
})

socket.on("new_message", (msg) => {
  console.log("new message:", msg)
})

socket.on("connect_error", (err) => {
  console.error("connection error:", err.message)
})