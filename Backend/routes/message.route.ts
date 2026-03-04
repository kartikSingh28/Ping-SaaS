import { Router } from "express";
import { userMiddleware } from "../Middleware/AuthMiddleware";
import { sendMessage, getMessages } from "../controllers/message.controller";

const messageRouter = Router();

/* Send message */
messageRouter.post("/", userMiddleware, sendMessage);

/* Get messages of conversation */
messageRouter.get("/:conversationId", userMiddleware, getMessages);

export default messageRouter;