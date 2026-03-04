import { Server } from "socket.io";
import { Server as HTTPServer } from "http";

let io: Server;

export function initWS(server: HTTPServer) {

  io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {
    console.log("WS connected:", socket.id);
  });

}

export function getIO(): Server {
  return io;
}