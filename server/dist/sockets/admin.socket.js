import { emitToUser } from "./hub.js";
export const registerAdminSocket = (socket) => {
    socket.on("admin:watch-user", ({ userId }) => {
        socket.join(`admin-watch:${userId}`);
    });
    socket.on("admin:emit-audit", (payload) => {
        if (payload.targetUserId) {
            emitToUser(payload.targetUserId, "admin:audit", payload);
        }
    });
};
