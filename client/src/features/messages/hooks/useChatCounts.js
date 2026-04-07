import { useState, useEffect, useCallback } from "react";
import { useSocket } from "../../messages/hooks/useSocket"; // adjust path if needed
import { api } from "../../api"; // your existing axios instance

/**
 * useChatCounts()
 *
 * totalUnread    — total unread message count across ALL chats (for BottomNav / Sidebar badge)
 * unreadPerChat  — { [chatId]: count } map for per-chat badges in the chat list
 * clearChatCount — call this when the user OPENS a specific chat conversation
 */
export function useChatCounts() {
  const socket = useSocket();

  const [totalUnread,   setTotalUnread]   = useState(0);
  const [unreadPerChat, setUnreadPerChat] = useState({});

  // ── Fetch initial total on mount ──────────────────────────────────────
  // This is a fallback for when the socket hasn't delivered message_count yet.
  // After the useSocket fix (join is now emitted on connect), the socket will
  // also send the correct count immediately, which will overwrite this value.
  useEffect(() => {
    api
      .get("/message/unread-count")
      .then(({ data }) => setTotalUnread(data.count ?? 0))
      .catch(() => {});
  }, []);

  // ── Socket: server pushes updated total after send / read ─────────────
  useEffect(() => {
    if (!socket) return;

    // Overall total — emitted by socket.js on join + after send_message
    const handleTotal = (count) => setTotalUnread(count);

    // Per-chat count — emitted from socket send_message handler
    // Shape: { chatId, count }
    const handlePerChat = ({ chatId, count }) => {
      setUnreadPerChat((prev) => ({ ...prev, [chatId]: count }));
    };

    socket.on("message_count",          handleTotal);
    socket.on("message_count_per_chat", handlePerChat);

    return () => {
      socket.off("message_count",          handleTotal);
      socket.off("message_count_per_chat", handlePerChat);
    };
  }, [socket]);

  /**
   * clearChatCount(chatId)
   *
   * Call this when the user actually OPENS a chat conversation.
   * - Optimistically zeroes the badge immediately
   * - Emits "messages_read" to the server so it marks messages as seen
   *   and re-emits the accurate total via "message_count"
   */
  const clearChatCount = useCallback(
    (chatId) => {
      if (!chatId) return;

      // Optimistic: zero the badge right away
      setUnreadPerChat((prev) => ({ ...prev, [chatId]: 0 }));
      setTotalUnread((prev) => {
        const chatUnread = unreadPerChat[chatId] ?? 0;
        return Math.max(0, prev - chatUnread);
      });

      // Tell socket so server marks seen + re-emits accurate total
      if (socket) {
        socket.emit("messages_read", { chatId });
      }
    },
    [socket, unreadPerChat]
  );

  return { totalUnread, unreadPerChat, clearChatCount };
}