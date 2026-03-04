import {Server} from "socket.io";

import {Server as HTTPServer} from "http";

let io:"Server";

export function initWS(server: HTTPServer) {

  io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {

    console.log("WS client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("WS client disconnected:", socket.id);
    });

  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket server not initialized");
  }
  return io;
}