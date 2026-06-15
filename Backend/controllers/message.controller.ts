import { Request, Response } from "express"
import {
  sendMessageService,
  getConversationMessagesService
} from "../services/message.services"
import { emitToConversationMembers } from "../ws/emit.helper"

/* SEND MESSAGE */
export async function sendMessage(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const { otherUserId, content } = req.body

    if (!otherUserId || !content) {
      return res.status(400).json({
        success: false,
        message: "otherUserId and content required"
      })
    }

    const { message, conversationId } = await sendMessageService(
      userId,
      otherUserId,
      content
    )

    // Deliver to all OTHER members via personal socket
    // Excludes sender — they already have the optimistic message
    await emitToConversationMembers(
      conversationId,
      "new_message",
      message,
      userId
    )

    return res.status(201).json({
      success: true,
      data: { message, conversationId }
    })

  } catch (error: any) {
    console.error("Send message error:", error)
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

/* GET MESSAGES */
export async function getMessages(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId
    const conversationId = req.params.conversationId as string
    const cursor = req.query.cursor as string | undefined

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID required"
      })
    }

    const messages = await getConversationMessagesService(
      userId,
      conversationId,
      cursor
    )

    return res.json({
      success: true,
      data: messages
    })

  } catch (error: any) {
    console.error("Get messages error:", error)
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}