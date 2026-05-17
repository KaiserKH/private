import http from "http";
import { Server } from "socket.io";
import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { initSockets } from "./sockets/index.js";

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    credentials: true
  }
});

initSockets(io);

server.listen(Number(env.PORT), () => {
  console.log(`Server listening on ${env.PORT}`);
});
