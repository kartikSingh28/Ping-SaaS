import express from "express";
import userRouter from "./routes/userRoute";
import conversationRouter from "./routes/conversation.routes";
import messageRouter from "./routes/message.route";
import cors from "cors";



const app = express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3001"
}));

app.use("/user", userRouter);
app.use("/conversations", conversationRouter);
app.use("/messages", messageRouter);

export default app;