import { Router } from "express";
import { userMiddleware } from "../Middleware/AuthMiddleware";

import {
  createPrivateConversation,
  getMyConversations
} from "../controllers/conversation.controller";

const conversationRouter = Router();

conversationRouter.post("/private", userMiddleware, createPrivateConversation);
conversationRouter.get("/", userMiddleware, getMyConversations);

export default conversationRouter;
