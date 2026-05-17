import type { Server } from "socket.io";
import { authenticateSocket, registerChatSocket } from "./chat.socket.js";
import { registerAdminSocket } from "./admin.socket.js";
import { setSocketServer } from "./hub.js";

export const initSockets = (io: Server) => {
  setSocketServer(io);

  io.use((socket, next) => {
    const context = authenticateSocket(socket);
    if (!context) return next(new Error("Unauthorized socket"));
    socket.data.user = context;
    next();
  });

  io.on("connection", (socket) => {
    const context = socket.data.user as ReturnType<typeof authenticateSocket>;
    if (!context) {
      socket.disconnect(true);
      return;
    }

    registerChatSocket(socket, context);
    if (context.isAdmin) registerAdminSocket(socket);
  });
};
