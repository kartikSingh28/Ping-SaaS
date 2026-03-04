// two apis sendMessage and getMessages

import { Request, Response } from "express";
import prisma from "../lib/prisma";

/* ---------------- SEND MESSAGE ---------------- */

export async function sendMessage(req: Request, res: Response) {
  try {

    // user id comes from auth middleware
    const userId = (req as any).user.id;

    // data sent by client
    const { conversationId, content } = req.body;

    // validation
    if (!conversationId || !content) {
      return res.status(400).json({
        message: "conversationId and content are required"
      });
    }

    // check if user is a member of the conversation
    const member = await prisma.conversationMember.findUnique({
      where: {
        // composite unique key lookup
        // because schema has @@unique([conversationId,userId])
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    });

    // database internally has something like:
    // CREATE UNIQUE INDEX conversation_member_unique
    // ON "ConversationMember" ("conversationId","userId");

    if (!member) {
      return res.status(403).json({
        message: "You are not a member of this conversation"
      });
    }

    // create message in database
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content
      }
    });

    res.status(201).json(message);

  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
  //get api

export async function getMessages(req: Request, res: Response) {
  try {

    const userId = (req as any).user.id;

    const { conversationId } = req.params;

    // cursor comes from query parameter
    // example:
    // GET /messages/conv1?cursor=msg123
    const { cursor } = req.query;
    //mEmberShp check

    const member = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    });

    if (!member) {
      return res.status(403).json({
        message: "Not allowed"
      });
    }

    /* ---- CURSOR PAGINATION IMPLEMENTATION ---- */

    const messages = await prisma.message.findMany({

      where: {
        conversationId
      },

      // newest messages first
      orderBy: {
        createdAt: "desc"
      },

      // return only 20 messages at a time
      take: 20,

      // cursor pagination
      // if cursor exists, fetch messages BEFORE that message
      ...(cursor && {
        cursor: {
          id: cursor as string
        },
        skip: 1
      })

    });
    res.json(messages);

  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
}

//notes
    /*
    Pagination used: CURSOR PAGINATION

    First request:
    GET /messages/conv1

    returns latest 20 messages

    Next request:
    GET /messages/conv1?cursor=msg81

    meaning:
    fetch messages BEFORE msg81*/
