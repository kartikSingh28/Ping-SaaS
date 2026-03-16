import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { registerChatHandlers } from "./chat.ws";

let io: Server | null = null;

export function initWS(server: HTTPServer) {

  io = new Server(server, {
    cors: {
      origin: "http://localhost:3001", // frontend origin
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {

    console.log("WS connected:", socket.id);

    registerChatHandlers(socket);

  });
}

export function getIO(): Server {

  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
}