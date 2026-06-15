import { prisma } from "../lib/prisma"
import { getIO, userSocketMap } from "./ws.server"

export async function emitToConversationMembers(
  conversationId: string,
  event: string,
  payload: any,
  excludeUserId?: string   // ← pass sender's id to skip them
) {
  const io = getIO()

  const members = await prisma.conversationMember.findMany({
    where: { conversationId }
  })

  members.forEach(member => {
    // Skip sender — they already have the optimistic message
    if (excludeUserId && member.userId === excludeUserId) return

    const socketId = userSocketMap.get(member.userId)
    if (socketId) {
      io.to(socketId).emit(event, payload)
    }
  })
}