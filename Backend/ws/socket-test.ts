import { io } from "socket.io-client";


const socket = io("http://localhost:3000");

const conversationId = "d3915357-74f7-45b7-94d7-e80eb3cdd38c";

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("join_conversation", conversationId);
  console.log("Joined room:", conversationId);
});

socket.on("new_message", (msg) => {
  console.log("REALTIME MESSAGE:", msg);
});