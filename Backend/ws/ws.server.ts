import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { registerChatHandlers } from "./chat.ws";

let io: Server | null = null;

//  userI
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

    const userId = socket.handshake.query.userId as string;

    console.log("HANDSHAKE:", socket.handshake.query);

    if (userId) {
      userSocketMap.set(userId, socket.id);

      console.log(" User mapped:", userId, "->", socket.id);

    
      io!.emit("online_users", Array.from(userSocketMap.keys()));
    } else {
      console.log(" No userId received on socket connection");
    }

    
    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);

      if (userId) {
        userSocketMap.delete(userId);
        console.log(" User removed:", userId);

        io!.emit("online_users", Array.from(userSocketMap.keys()));
      }
    });

    // =====================
    // CHAT HANDLERS
    // =====================
    registerChatHandlers(socket);
  });
}

// EXPORT
export { userSocketMap };

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}