import type { Socket } from "socket.io";
import { emitToUser } from "./hub.js";

export const registerAdminSocket = (socket: Socket) => {
  socket.on("admin:watch-user", ({ userId }: { userId: string }) => {
    socket.join(`admin-watch:${userId}`);
  });

  socket.on("admin:emit-audit", (payload: { targetUserId?: string | null; action: string; category: string }) => {
    if (payload.targetUserId) {
      emitToUser(payload.targetUserId, "admin:audit", payload);
    }
  });
};
