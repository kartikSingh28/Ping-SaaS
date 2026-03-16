import { Socket } from "socket.io";

export function registerChatHandlers(socket: Socket) {

  /* JOIN CONVERSATION ROOM */

  socket.on("join_conversation", (conversationId: string) => {

    if (!conversationId) {
      console.log("join_conversation called with empty conversationId");
      return;
    }

    socket.join(conversationId);

    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  /* LEAVE CONVERSATION ROOM */

  socket.on("leave_conversation", (conversationId: string) => {

    if (!conversationId) {
      console.log("leave_conversation called with empty conversationId");
      return;
    }

    socket.leave(conversationId);

    console.log(`Socket ${socket.id} left conversation ${conversationId}`);
  });

  /* TYPING START */

  socket.on("typing_start", ({ conversationId, userId }) => {

    if (!conversationId) return;

    socket.to(conversationId).emit("user_typing", { userId });

  });

  /* TYPING STOP */

  socket.on("typing_stop", ({ conversationId, userId }) => {

    if (!conversationId) return;

    socket.to(conversationId).emit("user_stop_typing", { userId });

  });

}