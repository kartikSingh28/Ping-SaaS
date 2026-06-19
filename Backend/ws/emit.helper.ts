import { prisma } from "../lib/prisma"
import { getIO, userSocketMap } from "./ws.server"

export async function emitToConversationMembers(
  conversationId: string,
  event: string,
  payload: any,
  excludeUserId?: string
): Promise<boolean> {
  const io = getIO()

  const members = await prisma.conversationMember.findMany({
    where: { conversationId }
  })

  let deliveredToAnyone = false

  members.forEach(member => {
    if (excludeUserId && member.userId === excludeUserId) return

    const socketIds = userSocketMap.get(member.userId)

    if (socketIds && socketIds.size > 0) {
      socketIds.forEach(socketId => {
        io.to(socketId).emit(event, payload)
      })
      deliveredToAnyone = true
    }
  })

  return deliveredToAnyone
}