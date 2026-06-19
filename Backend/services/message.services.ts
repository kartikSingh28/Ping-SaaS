import { prisma } from "../lib/prisma";
import redis from "../lib/redis";

/* SEND MESSAGE SERVICE */

const STEALTH_TTL = 60;

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

  //  STEALTH MODE
  // Don't hit PostgreSQL
  // Store message in Redis only
  if (conversation.mode === "STEALTH") {

    // build message object manually
    const stealthMessage = {
      id: `stealth-${Date.now()}`,
      conversationId: conversation.id,
      senderId: userId,
      content,
      createdAt: new Date().toISOString(),
      isEphemeral: true // for frontend
    };

    // Store in Redis as JSON string
    // Key format: stealth:{conversationId}:{messageId}
    const key = `stealth:${conversation.id}:${stealthMessage.id}`;

    await redis.set(
      key,
      JSON.stringify(stealthMessage),
      { EX: STEALTH_TTL }
    );

    return {
      message: stealthMessage,
      conversationId: conversation.id
    };
  }

  // NORMAL MODE
  // hit PostgreSQL
  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: userId,
      content,
      status: "SENT"   // explicit — also the schema default, but stated here for clarity
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

  //  check conversation mode
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId
    }
  });

  // STEALTH MODE
  // fetch messages from Redis
  if (conversation?.mode === "STEALTH") {

    // get all keys for this conversation
    const keys = await redis.keys(`stealth:${conversationId}:*`);

    if (keys.length === 0) {
      return [];
    }

    // fetch all values at once
    const values = await redis.mGet(keys);

    // parse JSON strings back into objects
    const messages = values
      .filter(Boolean)
      .map((v) => JSON.parse(v!))
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );

    return messages;
  }

  // NORMAL MODE
  // fetch from PostgreSQL
  const messages = await prisma.message.findMany({
    where: { conversationId },

    orderBy: {
      createdAt: "desc"
    },

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