"use client";

import { io, type Socket } from "socket.io-client";
import { getApiRootUrl } from "@/lib/api";

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (!token) return null;

  if (!process.env.NEXT_PUBLIC_API_URL) {
    return null;
  }

  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  const root = getApiRootUrl();
  if (!root) {
    return null;
  }

  socket = io(root, {
    transports: ["websocket"],
    auth: { token },
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
