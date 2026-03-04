import { Request, Response } from "express";
import {
  sendMessageService,
  getConversationMessagesService
} from "../services/message.services";

import { getIO } from "../ws/ws.server";

/* SEND MESSAGE CONTROLLER */

export async function sendMessage(req: Request, res: Response) {
  try {

    const userId = (req as any).user.userId;  

    const { conversationId, content } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({
        message: "conversationId and content required"
      });
    }

    const message = await sendMessageService(
      userId,
      conversationId,
      content
    );

    // emit realtime event
    const io = getIO();

    console.log("Broadcasting message to room:", conversationId);

    io.to(conversationId).emit("new_message", message);

    res.status(201).json(message);

  } catch (error: any) {

    console.error("Send message error:", error);

    res.status(400).json({
      message: error.message
    });

  }
}


/* GET MESSAGES CONTROLLER */

export async function getMessages(req: Request, res: Response) {
  try {

    const userId = (req as any).user.id;   // FIXED

    const { conversationId } = req.params;

    const { cursor } = req.query;

    const messages = await getConversationMessagesService(
      userId,
      conversationId,
      cursor as string | undefined
    );

    res.json(messages);

  } catch (error: any) {

    console.error("Get messages error:", error);

    res.status(400).json({
      message: error.message
    });

  }
}