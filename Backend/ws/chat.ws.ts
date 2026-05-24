// chat.ws.ts

import { Socket } from "socket.io"

//  GLOBAL MAP
const onlineUsers = new Map<string, string>() // userId -> socketId

export function registerChatHandlers(socket: Socket) {

  const userId = socket.handshake.query.userId as string

  //  USER CONNECT
  if (userId) {
    onlineUsers.set(userId, socket.id)

    // broadcast to everyone
    socket.server.emit("online_users", Array.from(onlineUsers.keys()))

    console.log("User online:", userId)
  }

  /* JOIN CONVERSATION ROOM */
  socket.on("join_conversation", (conversationId: string) => {
    if (!conversationId) return
    socket.join(conversationId)
  })

  /* LEAVE CONVERSATION ROOM */
  socket.on("leave_conversation", (conversationId: string) => {
    if (!conversationId) return
    socket.leave(conversationId)
  })

  /* TYPING START */
  socket.on("typing_start", ({ conversationId, userId, name }) => {
    if (!conversationId) return

    socket.to(conversationId).emit("user_typing", {
      conversationId,
      userId,
      name
    })
  })

  /* TYPING STOP */
  socket.on("typing_stop", ({ conversationId, userId }) => {
    if (!conversationId) return

    socket.to(conversationId).emit("user_stop_typing", {
      conversationId,
      userId
    })
  })

  //  USER DISCONNECT
  socket.on("disconnect", () => {
    if (userId) {
      onlineUsers.delete(userId)

      socket.server.emit("online_users", Array.from(onlineUsers.keys()))

      console.log("User offline:", userId)
    }
  })
}