import { useState, useEffect, useCallback } from "react";
import { useSocket } from "../../messages/hooks/useSocket"; // adjust path
import { api } from "../../api"; // your existing axios instance

/**
 * useChatCounts()
 *
 * totalUnread      — total unread msg count across ALL chats (for BottomNav badge)
 * unreadPerChat    — { [chatId]: count } map for per-chat badges in the chat list
 * clearChatCount   — call this when user OPENS a specific chat (not just /chats route)
 */
export function useChatCounts() {
  const socket = useSocket();
  const [totalUnread,   setTotalUnread]   = useState(0);
  const [unreadPerChat, setUnreadPerChat] = useState({}); // { chatId: number }

  // ── Fetch initial total on mount ──────────────────────────────────────
  useEffect(() => {
    api.get("/message/unread-count")
      .then(({ data }) => setTotalUnread(data.count ?? 0))
      .catch(() => {});
  }, []);

  // ── Socket: server pushes updated total after send/read ───────────────
  useEffect(() => {
    if (!socket) return;

    // Overall total (emitted by socket.js on join + after send_message)
    const handleTotal = (count) => setTotalUnread(count);

    // Per-chat increment when a new message arrives in a non-active chat
    // Shape: { chatId, count } — emitted from socket send_message handler
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
   * Call this when the user actually OPENS a specific chat conversation.
   * - Zeroes the per-chat badge instantly (optimistic)
   * - Tells the server to mark messages as seen (which re-emits message_count)
   */
  const clearChatCount = useCallback((chatId) => {
    if (!chatId) return;

    // Optimistic: zero the badge immediately
    setUnreadPerChat((prev) => ({ ...prev, [chatId]: 0 }));
    setTotalUnread((prev) => {
      const chatUnread = unreadPerChat[chatId] ?? 0;
      return Math.max(0, prev - chatUnread);
    });

    // Tell socket so server can mark seen + re-emit accurate total
    if (socket) {
      socket.emit("messages_read", { chatId });
    }
  }, [socket, unreadPerChat]);

  return { totalUnread, unreadPerChat, clearChatCount };
}