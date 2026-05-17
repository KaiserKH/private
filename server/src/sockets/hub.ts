import type { Server } from "socket.io";

let ioInstance: Server | null = null;

export const setSocketServer = (io: Server) => {
  ioInstance = io;
};

export const getSocketServer = () => ioInstance;

export const emitToUser = (userId: string, event: string, payload: unknown) => {
  ioInstance?.to(`user:${userId}`).emit(event, payload);
};

export const emitToConversation = (conversationId: string, event: string, payload: unknown) => {
  ioInstance?.to(`conversation:${conversationId}`).emit(event, payload);
};
