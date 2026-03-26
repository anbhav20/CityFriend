import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket = null;

export const useSocket = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // ⚠️ change this URL to your backend
    const SOCKET_URL = import.meta.env.VITE_API_URL||"http://localhost:5000";

    if (!socket) {
      socket = io(SOCKET_URL, {
        withCredentials: true,
      });
    }

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return socket;
};