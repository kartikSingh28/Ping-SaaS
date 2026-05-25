import { Router } from "express";
import { userMiddleware } from "../Middleware/AuthMiddleware";



import {
  createPrivateConversation,
  getMyConversations,
  toggleStealthMode
} from "../controllers/conversation.controller";

const conversationRouter = Router();

conversationRouter.post("/private", userMiddleware, createPrivateConversation);
conversationRouter.get("/", userMiddleware, getMyConversations);

conversationRouter.patch(
  "/:conversationId/toggle-stealth",
  userMiddleware,
  toggleStealthMode
)
export default conversationRouter;
