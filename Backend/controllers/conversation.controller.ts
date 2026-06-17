import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getIO, userSocketMap } from "../ws/ws.server"


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
    const userId = (req as any).user.userId

    const conversations = await prisma.conversation.findMany({
      where: {
        members: { some: { userId } },
        messages: { some: {} }  // ← only conversations with at least 1 message
      },
      include: {
        members: {
          include: {
            user: {
              include: { profile: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    })

    const shaped = conversations.map(conv => {
      const lastMessage = conv.messages[0] || null

      const base = {
        conversationId: conv.id,
        type: conv.type,
        mode: conv.mode,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt,
              isMe: lastMessage.senderId === userId
            }
          : null,
        updatedAt: lastMessage?.createdAt || conv.createdAt
      }

      // ONE TO ONE
      if (conv.type === "ONE_TO_ONE") {
        const otherMember = conv.members.find(m => m.userId !== userId)

        return {
          ...base,
          otherUser: otherMember
            ? {
                id: otherMember.user.id,
                email: otherMember.user.email,
                name: otherMember.user.profile?.displayName
                  || otherMember.user.email?.split("@")[0]
                  || "Unknown",
                avatar: otherMember.user.profile?.avatarUrl || null
              }
            : null
        }
      }

      // GROUP
      return {
        ...base,
        group: {
          id: conv.id,
          name: conv.name || "Unnamed Group",
          avatar: conv.avatarUrl || null
        },
        memberCount: conv.members.length
      }
    })

    shaped.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    )

    return res.json({ success: true, data: shaped })

  } catch (error) {
    console.error("Get conversations error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

/* TOGGLE STEALTH MODE */
export async function toggleStealthMode(
  req: Request,
  res: Response
) {
  try {

    const userId = (req as any).user.userId;

    const conversationId =
      req.params.conversationId as string;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID required"
      });
    }

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

    const io = getIO();

    io.to(conversationId).emit(
      "mode_changed",
      {
        conversationId,
        mode: newMode
      }
    );

    const members =
      await prisma.conversationMember.findMany({
        where: {
          conversationId
        }
      });

    members.forEach((member) => {
      const socketId =
        userSocketMap.get(member.userId);

      if (socketId) {
        io.to(socketId).emit(
          "mode_changed",
          {
            conversationId,
            mode: newMode
          }
        );
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