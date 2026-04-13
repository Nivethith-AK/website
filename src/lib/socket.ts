"use client";

import { io, type Socket } from "socket.io-client";
import { getApiRootUrl } from "@/lib/api";

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (!token) return null;

  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(getApiRootUrl(), {
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
