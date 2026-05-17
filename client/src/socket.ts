import { io, type Socket } from "socket.io-client";

const socketURL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(socketURL, {
      withCredentials: true,
      transports: ["websocket"]
    });
  }

  return socket;
};

export const closeSocket = () => {
  socket?.disconnect();
  socket = null;
};
