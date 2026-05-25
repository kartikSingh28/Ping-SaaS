import { Request, Response } from "express";
import { prisma } from "../lib/prisma";


/* CREATE PRIVATE CONVERSATION */

export async function createPrivateConversation(
  req: Request,
  res: Response
) {
  try {

    const userId = (req as any).user.userId;
    const otherUserIdRaw = req.body.otherUserId;

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

    // CHECK EXISTING
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
      return res.json({
        success: true,
        data: {
          conversationId: existing.id,
          isNew: false,
          mode: existing.mode
        }
      });
    }

    // CREATE NEW
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

    return res.status(201).json({
      success: true,
      data: {
        conversationId: conversation.id,
        isNew: true,
        mode: conversation.mode
      }
    });

  } catch (error) {

    console.error(
      "Create conversation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}


/* GET MY CONVERSATIONS */

export async function getMyConversations(
  req: Request,
  res: Response
) {
  try {

    const userId = (req as any).user.userId;

    const conversations =
      await prisma.conversation.findMany({
        where: {
          members: {
            some: { userId }
          }
        },

        include: {
          members: {
            include: {
              user: {
                include: {
                  profile: true
                }
              }
            }
          }
        }
      });

    return res.json({
      success: true,
      data: conversations
    });

  } catch (error) {

    console.error(
      "Get conversations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}


/* TOGGLE STEALTH MODE */

export async function toggleStealthMode(
  req: Request,
  res: Response
) {
  try {

    const userId =
      (req as any).user.userId;

    const { conversationId } =
      req.params;

    // verify member
    const member =
      await prisma.conversationMember.findFirst({
        where: {
          conversationId,
          userId
        }
      });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    // get conversation
    const conversation =
      await prisma.conversation.findUnique({
        where: {
          id: conversationId
        }
      });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    // toggle
    const newMode =
      conversation.mode === "NORMAL"
        ? "STEALTH"
        : "NORMAL";

    const updated =
      await prisma.conversation.update({
        where: {
          id: conversationId
        },
        data: {
          mode: newMode
        }
      });

    return res.json({
      success: true,
      data: {
        conversationId: updated.id,
        mode: updated.mode
      }
    });

  } catch (error) {

    console.error(
      "Toggle stealth mode error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}