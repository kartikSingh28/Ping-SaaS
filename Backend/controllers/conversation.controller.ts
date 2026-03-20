import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function createPrivateConversation(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;

    //  SAFE EXTRACTION
    const otherUserIdRaw = req.body.otherUserId;

    console.log(" Incoming body:", req.body);
    console.log(" userId:", userId);
    console.log(" otherUserIdRaw:", otherUserIdRaw);

    //  VALIDATION (STRONG)
    if (!otherUserIdRaw || typeof otherUserIdRaw !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing otherUserId"
      });
    }

    const otherUserId = otherUserIdRaw.trim();

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "otherUserId required"
      });
    }

    if (userId === otherUserId) {
      return res.status(400).json({
        success: false,
        message: "Cannot chat with yourself"
      });
    }

    //  CHECK EXISTING
    const existing = await prisma.conversation.findFirst({
      where: {
        type: "ONE_TO_ONE",
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: otherUserId } } }
        ]
      }
    });

    if (existing) {
      console.log(" Existing conversation found:", existing.id);

      return res.json({
        success: true,
        data: {
          conversationId: existing.id,
          isNew: false
        }
      });
    }

    //  CREATE NEW
    const conversation = await prisma.conversation.create({
      data: {
        type: "ONE_TO_ONE",
        createdBy: userId,
        members: {
          create: [
            { userId },
            { userId: otherUserId }
          ]
        }
      }
    });

    console.log("New conversation created:", conversation.id);

    return res.status(201).json({
      success: true,
      data: {
        conversationId: conversation.id,
        isNew: true
      }
    });

  } catch (error) {
    console.error(" Create conversation error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}

export async function getMyConversations(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;

    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        members: true
      }
    });

    return res.json({
      success: true,
      data: conversations
    });

  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}