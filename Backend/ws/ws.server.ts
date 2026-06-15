import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { registerChatHandlers } from "./chat.ws";

let io: Server | null = null;

// Single source of truth — userId -> socketId
export const userSocketMap = new Map<string, string>();

export function initWS(server: HTTPServer) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3001",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;

    console.log("WS connected:", socket.id, "userId:", userId);

    if (userId) {
      userSocketMap.set(userId, socket.id);
      io!.emit("online_users", Array.from(userSocketMap.keys()));
    }

    registerChatHandlers(socket, userId); // ← pass userId in directly

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
      if (userId) {
        userSocketMap.delete(userId);
        io!.emit("online_users", Array.from(userSocketMap.keys()));
      }
    });
  });
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}