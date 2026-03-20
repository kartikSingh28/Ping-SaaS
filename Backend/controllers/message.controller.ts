import { Request, Response } from "express";
import {
  sendMessageService,
  getConversationMessagesService
} from "../services/message.services";

import { getIO } from "../ws/ws.server";

/* SEND MESSAGE */

export async function sendMessage(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { otherUserId, content } = req.body;

    if (!otherUserId || !content) {
      return res.status(400).json({
        success: false,
        message: "otherUserId and content required"
      });
    }

    const { message, conversationId } = await sendMessageService(
      userId,
      otherUserId,
      content
    );

    const io = getIO();

    console.log("Broadcasting message to room:", conversationId);

    io.to(conversationId).emit("new_message", message);

    return res.status(201).json({
      success: true,
      data: {
        message,
        conversationId
      }
    });

  } catch (error: any) {
    console.error("Send message error:", error);

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


/* GET MESSAGES */

export async function getMessages(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { conversationId } = req.params;
    const { cursor } = req.query;

    const messages = await getConversationMessagesService(
      userId,
      conversationId,
      cursor as string | undefined
    );

    return res.json({
      success: true,
      data: messages
    });

  } catch (error: any) {
    console.error("Get messages error:", error);

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}