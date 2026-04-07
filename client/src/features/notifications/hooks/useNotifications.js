import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "../../messages/hooks/useSocket"; // adjust path if needed
import { api } from "../../api";

export function useNotifications() {
  const socket = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(1);
  const [hasMore,       setHasMore]       = useState(false);
  const fetchingRef = useRef(false);

  // ── Initial fetch ─────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async (pageNum = 1, replace = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const { data } = await api.get(`/notifications?page=${pageNum}&limit=10`);
      setNotifications((prev) =>
        replace ? data.notifications : [...prev, ...data.notifications]
      );
      setUnreadCount(data.unread);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1, true);
  }, [fetchNotifications]);

  // ── Socket ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNew = (notification) => {
      setNotifications((prev) => {
        const existingIndex = prev.findIndex((n) => n._id === notification._id);
        if (existingIndex !== -1) {
          // Update in place (e.g. idempotent like/follow upsert)
          const updated = [...prev];
          updated[existingIndex] = notification;
          return updated;
        }
        return [notification, ...prev];
      });
    };

    const handleCount = (count) => setUnreadCount(count);

    socket.on("new_notification",   handleNew);
    socket.on("notification_count", handleCount);

    return () => {
      socket.off("new_notification",   handleNew);
      socket.off("notification_count", handleCount);
    };
  }, [socket]);

  // ── Actions ───────────────────────────────────────────────────────────
  const fetchMore = useCallback(() => {
    if (hasMore) fetchNotifications(page + 1, false);
  }, [hasMore, page, fetchNotifications]);

  const markAllRead = useCallback(async () => {
    await api.patch("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const markOneRead = useCallback(async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const deleteOne = useCallback(async (id) => {
    await api.delete(`/notifications/${id}`);
    setNotifications((prev) => {
      const removed = prev.find((n) => n._id === id);
      if (removed && !removed.read) setUnreadCount((c) => Math.max(0, c - 1));
      return prev.filter((n) => n._id !== id);
    });
  }, []);

  const clearAll = useCallback(async () => {
    await api.delete("/notifications");
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    fetchMore,
    markAllRead,
    markOneRead,
    deleteOne,
    clearAll,
  };
}