import { Socket } from "socket.io";

export function registerChatHandlers(socket: Socket) {

  /* JOIN CONVERSATION ROOM */

  socket.on("join_conversation", (conversationId: string) => {

    socket.join(conversationId);

    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);

  });

  /* LEAVE CONVERSATION ROOM */

  socket.on("leave_conversation", (conversationId: string) => {

    socket.leave(conversationId);

    console.log(`Socket ${socket.id} left conversation ${conversationId}`);

  });

}