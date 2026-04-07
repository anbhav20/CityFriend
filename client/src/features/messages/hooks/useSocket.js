import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../../auth/hooks/useAuth"; 

let socket = null;

/**
 * disconnectSocket()
 * Call this on logout so the next user gets a fresh socket
 * with no leftover identity from the previous session.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * useSocket()
 * Returns the singleton socket instance.
 * Automatically emits "join" with the logged-in user's ID on connect
 * and on every reconnect so the server always knows who is online.
 */
export const useSocket = () => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false); // eslint-disable-line no-unused-vars

  useEffect(() => {
    const SOCKET_URL =
      import.meta.env.VITE_API_URL || "http://localhost:5000";

    // Create socket once — reuse across all hook instances
    if (!socket) {
      socket = io(SOCKET_URL, {
        withCredentials: true,
      });
    }

    const handleConnect = () => {
      console.log("✅ Socket connected:", socket.id);
      setConnected(true);
      // ✅ FIX: Tell the server who this user is so it sends correct counts
      if (user?._id) {
        socket.emit("join", user._id);
      }
    };

    const handleDisconnect = () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // ✅ If socket is already connected when this hook mounts (e.g. page
    //    navigation), emit join immediately — don't wait for next connect event
    if (socket.connected && user?._id) {
      socket.emit("join", user._id);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [user?._id]); // re-run whenever the logged-in user changes

  return socket;
};