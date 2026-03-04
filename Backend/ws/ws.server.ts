import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { registerChatHandlers } from "./chat.ws";

let io: Server;

export function initWS(server: HTTPServer) {
  io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("WS connected:", socket.id);

    registerChatHandlers(socket); // ← must be inside this block
  });
}

export function getIO(): Server {
  return io;
}