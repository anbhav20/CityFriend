import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiCheck } from "react-icons/fi";
import { useNotifications } from "../hooks/useNotifications";     
import { formatNotification, notificationUrl, timeAgo } from "../../../components/NotificationBell"
import MainLayout from "../../../components/MainLayout";           

const NotificationsPage = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    fetchMore,
    markAllRead,
    markOneRead,
    deleteOne,
    clearAll,
  } = useNotifications();

  // ── Infinite scroll sentinel ──────────────────────────────────────────
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) fetchMore(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, fetchMore]);

  const handleClick = (n) => {
    if (!n.read) markOneRead(n._id);
    navigate(notificationUrl(n));
  };

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto">
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                    font-semibold text-blue-500 hover:bg-blue-50 transition"
                >
                  <FiCheck size={13} />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                    font-semibold text-red-400 hover:bg-red-50 transition"
                >
                  <FiTrash2 size={13} />
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-5xl">🔔</p>
            <p className="font-semibold text-gray-900">No notifications</p>
            <p className="text-sm text-gray-400">You're all caught up!</p>
          </div>
        )}

        {/* ── Notification list ── */}
        {!loading && notifications.length > 0 && (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => {
              const { icon, text } = formatNotification(n);
              return (
                <div
                  key={n._id}
                  className={`flex items-start gap-3 px-4 py-3.5 transition
                    ${n.read ? "bg-white" : "bg-blue-50/40"}`}
                >
                  {/* Avatar + icon badge */}
                  <button
                    onClick={() => handleClick(n)}
                    className="relative shrink-0 mt-0.5"
                  >
                    {n.sender?.profilePic ? (
                      <img src={n.sender.profilePic} alt={n.sender.username}
                        className="w-11 h-11 rounded-full object-cover" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                        flex items-center justify-center text-white font-semibold">
                        {n.sender?.username?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 text-base leading-none">{icon}</span>
                  </button>

                  {/* Content */}
                  <button
                    onClick={() => handleClick(n)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="text-sm text-gray-800 leading-snug">
                      <span className="font-semibold">{n.sender?.username}</span>
                      {" "}
                      {text.replace(n.sender?.username ?? "", "").trim()}
                    </p>
                    {n.text && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">"{n.text}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </button>

                  {/* Post thumbnail if available */}
                  {n.post?.image && (
                    <button onClick={() => handleClick(n)} className="shrink-0">
                      <img src={n.post.image} alt="post"
                        className="w-11 h-11 rounded-lg object-cover" />
                    </button>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    {!n.read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    )}
                    <button
                      onClick={() => deleteOne(n._id)}
                      className="p-1.5 rounded-full text-gray-300 hover:text-red-400
                        hover:bg-red-50 transition"
                      aria-label="Delete notification"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-4">
                <div className="flex gap-1.5">
                  {[0,1,2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-gray-300 rounded-full"
                      style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;