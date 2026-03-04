import http from "http";
import app from "./index";
import { initWS } from "./ws/ws.server";

const server = http.createServer(app);

initWS(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});