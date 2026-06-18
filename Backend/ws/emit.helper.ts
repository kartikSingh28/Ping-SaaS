import { prisma } from "../lib/prisma"
import { getIO, userSocketMap } from "./ws.server"

export async function emitToConversationMembers(
  conversationId: string,
  event: string,
  payload: any,
  excludeUserId?: string
) {
  const io = getIO()

  const members = await prisma.conversationMember.findMany({
    where: { conversationId }
  })

  members.forEach(member => {
    if (excludeUserId && member.userId === excludeUserId) return

    // CHANGED: get the SET of sockets for this user
    const socketIds = userSocketMap.get(member.userId)

    if (socketIds) {
      // Emit to every tab/device this user has open
      socketIds.forEach(socketId => {
        io.to(socketId).emit(event, payload)
      })
    }
  })
}