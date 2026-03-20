import { prisma } from "../lib/prisma";
/* SEND MESSAGE SERVICE */

import { prisma } from "../lib/prisma";

/* SEND MESSAGE SERVICE */

export async function sendMessageService(
  userId: string,
  otherUserId: string,
  content: string
) {

  // find conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      type: "ONE_TO_ONE",
      AND: [
        { members: { some: { userId } } },
        { members: { some: { userId: otherUserId } } }
      ]
    }
  });

  // create conversation if not exists
  if (!conversation) {
    conversation = await prisma.conversation.create({
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
  }

  // create message
 const message = await prisma.message.create({
  data: {
    conversationId: conversation.id,
    senderId: userId,
    content
  },
  include: {
    sender: {
      include: {
        profile: true
      }
    }
  }
});

  return {
    message,
    conversationId: conversation.id
  };
}


/* GET MESSAGES SERVICE (WITH CURSOR PAGINATION) */

export async function getConversationMessagesService(
  userId: string,
  conversationId: string,
  cursor?: string
) {

  // verify user belongs to conversation
  const member = await prisma.conversationMember.findFirst({
    where: {
      conversationId,
      userId
    }
  });

  if (!member) {
    throw new Error("Not authorized");
  }

  const messages = await prisma.message.findMany({
  where: { conversationId },
  orderBy: { createdAt: "desc" },
  take: 20,

  ...(cursor && {
    cursor: { id: cursor },
    skip: 1
  }),

  include: {
    sender: {
      include: {
        profile: true
      }
    }
  }
});

  return messages;
}