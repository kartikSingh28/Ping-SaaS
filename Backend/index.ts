import express from "express";
import userRouter from "./routes/userRoute";
import conversationRouter from "./routes/conversation.routes";
import messageRouter from "./routes/message.route";

const app = express();

app.use(express.json());

app.use("/user", userRouter);
app.use("/conversations", conversationRouter);
app.use("/messages", messageRouter);

export default app;