import { io, Socket } from "socket.io-client";
import { domain } from "@/lib/constant";
import { useAuthStore } from "@/store/auth.store";

let socket: Socket | null = null;

const createSocket = () => {
  const token = useAuthStore.getState().token;

  socket = io(domain, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket"],
    auth: {
      token: token ? `Bearer ${token}` : "",
    },
  });

  return socket;
};

export const getSocket = () => {
  const token = useAuthStore.getState().token;

  if (!token) {
    return null;
  }

  const instance = socket ?? createSocket();
  instance.auth = {
    token: `Bearer ${token}`,
  };

  if (!instance.connected) {
    instance.connect();
  }

  return instance;
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
};
