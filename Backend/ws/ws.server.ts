import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { registerChatHandlers } from "./chat.ws";

let io: Server | null = null;

//  userId -> socketId
const userSocketMap = new Map<string, string>();

export function initWS(server: HTTPServer) {

  io = new Server(server, {
    cors: {
      origin: "http://localhost:3001",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {

    console.log("WS connected:", socket.id);

    //  GET USER ID FROM FRONTEND
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(" User mapped:", userId, "->", socket.id);
    } else {
      console.log(" No userId received on socket connection");
    }

    //  HANDLE DISCONNECT
    socket.on("disconnect", () => {
      if (userId) {
        userSocketMap.delete(userId);
        console.log(" User removed:", userId);
      }
    });

    registerChatHandlers(socket);
  });
}

//  EXPORT THIS
export { userSocketMap };

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}