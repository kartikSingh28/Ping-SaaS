// chat.ws.ts
import { Socket } from "socket.io"
import { getIO, userSocketMap } from "./ws.server"

export function registerChatHandlers(socket: Socket, userId: string) {

  socket.on("join_conversation", (conversationId: string) => {
    if (!conversationId) return
    socket.join(conversationId)
    console.log(`User ${userId} joined room ${conversationId}`)
  })

  socket.on("leave_conversation", (conversationId: string) => {
    if (!conversationId) return
    socket.leave(conversationId)
  })

  socket.on("typing_start", ({ conversationId, name }: any) => {
    if (!conversationId) return
    // broadcast to room EXCEPT sender — name comes from server not client
    socket.to(conversationId).emit("user_typing", {
      conversationId,
      userId,        // ← from socket handshake, not payload
      name           // ← still from payload, but fixed on frontend
    })
  })

  socket.on("typing_stop", ({ conversationId }: any) => {
    if (!conversationId) return
    socket.to(conversationId).emit("user_stop_typing", {
      conversationId,
      userId         // ← from socket handshake
    })
  })
}