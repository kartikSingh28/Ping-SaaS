import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const conversationId = "d3915357-74f7-45b7-94d7-e80eb3cdd38c";
const userId = "11039499-19c4-4652-927b-12ff2883c49f"; // your user id

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("join_conversation", conversationId);
  console.log("Joined room:", conversationId);

  /* simulate typing after connect */

  setTimeout(() => {
    console.log("Sending typing_start...");
    socket.emit("typing_start", {
      conversationId,
      userId
    });
  }, 3000);

  setTimeout(() => {
    console.log("Sending typing_stop...");
    socket.emit("typing_stop", {
      conversationId,
      userId
    });
  }, 6000);
});

socket.on("new_message", (msg) => {
  console.log(" REALTIME MESSAGE:", msg);
});

socket.on("user_typing", (data) => {
  console.log(" USER TYPING:", data);
});


socket.on("user_stop_typing", (data) => {
  console.log(" USER STOPPED TYPING:", data);
});


socket.on("disconnect", () => {
  console.log("Disconnected from server");
});