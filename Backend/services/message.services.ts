import prisma from "../lib/prisma";

/* SEND MESSAGE SERVICE */

export async function sendMessageService(
  userId: string,
  conversationId: string,
  content: string
) {

  // check membership
  const member = await prisma.conversationMember.findFirst({
    where: {
      conversationId,
      userId
    }
  });

  if (!member) {
    throw new Error("Not a member of this conversation");
  }

  // create message
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      content
    }
  });

  return message;
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

    where: {
      conversationId
    },

    // newest messages first
    orderBy: {
      createdAt: "desc"
    },

    // pagination limit
    take: 20,

    // cursor pagination
    ...(cursor && {
      cursor: {
        id: cursor
      },
      skip: 1
    })

  });

  return messages;
}