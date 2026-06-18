import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { registerChatHandlers } from "./chat.ws";

let io: Server | null = null;

// userId -> Set of socketIds (supports multiple tabs/devices)
export const userSocketMap = new Map<string, Set<string>>();

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
      // Add this socket to the user's set (don't overwrite — add to it)
      if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, new Set());
      }
      userSocketMap.get(userId)!.add(socket.id);

      io!.emit("online_users", Array.from(userSocketMap.keys()));
    }

    registerChatHandlers(socket, userId);

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);

      if (userId) {
        const sockets = userSocketMap.get(userId);
        if (sockets) {
          // Only remove THIS socket, not the whole user
          sockets.delete(socket.id);

          // If user has no more open tabs/devices, remove them entirely
          if (sockets.size === 0) {
            userSocketMap.delete(userId);
          }
        }

        io!.emit("online_users", Array.from(userSocketMap.keys()));
      }
    });
  });
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}