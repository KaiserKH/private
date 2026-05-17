import { verifyAccessToken } from "../utils/token.js";
import { getOrCreateDirectConversation, markConversationSeen, sendMessage } from "../services/message.service.js";
import { emitToConversation, emitToUser } from "./hub.js";
const getToken = (socket) => {
    const authToken = socket.handshake.auth?.token;
    if (typeof authToken === "string" && authToken.length > 0)
        return authToken;
    const cookieHeader = socket.handshake.headers.cookie ?? "";
    const match = cookieHeader.match(/accessToken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
};
export const authenticateSocket = (socket) => {
    const token = getToken(socket);
    if (!token)
        return null;
    const payload = verifyAccessToken(token);
    return {
        userId: payload.sub,
        username: payload.username,
        roles: payload.roles,
        permissions: payload.permissions,
        isAdmin: payload.isAdmin,
        sessionId: payload.sessionId
    };
};
export const registerChatSocket = (socket, context) => {
    socket.data.user = context;
    socket.join(`user:${context.userId}`);
    socket.emit("socket:ready", { userId: context.userId, isAdmin: context.isAdmin });
    socket.on("conversation:join", async ({ targetUserId }) => {
        const conversation = await getOrCreateDirectConversation(context.userId, targetUserId, context.isAdmin);
        socket.join(`conversation:${conversation.id}`);
        socket.emit("conversation:joined", { conversationId: conversation.id });
    });
    socket.on("typing:start", ({ conversationId }) => {
        socket.to(`conversation:${conversationId}`).emit("typing:update", { conversationId, userId: context.userId, typing: true });
    });
    socket.on("typing:stop", ({ conversationId }) => {
        socket.to(`conversation:${conversationId}`).emit("typing:update", { conversationId, userId: context.userId, typing: false });
    });
    socket.on("message:send", async (payload) => {
        const record = await sendMessage({
            senderId: context.userId,
            targetUserId: payload.targetUserId,
            content: payload.content,
            type: payload.type,
            replyToId: payload.replyToId ?? null,
            actorIsAdmin: context.isAdmin
        });
        socket.join(`conversation:${record.conversation.id}`);
        emitToConversation(record.conversation.id, "message:new", record.message);
        emitToUser(payload.targetUserId, "notification:new", { type: "MESSAGE", conversationId: record.conversation.id, messageId: record.message.id });
        socket.emit("message:ack", { conversationId: record.conversation.id, messageId: record.message.id });
    });
    socket.on("message:seen", async ({ conversationId }) => {
        const participant = await markConversationSeen(conversationId, context.userId);
        emitToConversation(conversationId, "message:seen", { conversationId, userId: context.userId, at: participant.lastReadAt });
    });
    socket.on("call:signal", (payload) => {
        emitToUser(payload.toUserId, "call:signal", { fromUserId: context.userId, ...payload });
    });
    socket.on("disconnect", () => {
        emitToUser(context.userId, "presence:update", { userId: context.userId, online: false });
    });
};
