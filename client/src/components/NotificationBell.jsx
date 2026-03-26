import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import { useNotifications } from "../features/notifications/hooks/useNotifications"; // adjust path

/**
 * <NotificationBell />
 *
 * Drop-in bell icon with:
 *   - Live unread badge
 *   - Mini dropdown preview (latest 5)
 *   - "Mark all read" button
 *   - Click navigates to /notifications
 *
 * Use in your desktop Sidebar or header.
 */
export function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const preview = notifications.slice(0, 5);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition text-gray-700"
        aria-label="Notifications"
      >
        <FiBell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
            rounded-full bg-red-500 text-white text-[10px] font-bold
            flex items-center justify-center leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-900 text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium transition"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {preview.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-2xl mb-1">🔔</p>
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              preview.map((n) => (
                <NotificationRow
                  key={n._id}
                  notification={n}
                  onRead={() => markOneRead(n._id)}
                  onNavigate={() => setOpen(false)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <button
            onClick={() => { setOpen(false); navigate("/notifications"); }}
            className="w-full py-3 text-sm text-blue-500 font-semibold hover:bg-gray-50 transition border-t border-gray-100"
          >
            See all notifications
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Single row used inside dropdown ─────────────────────────────────────────
function NotificationRow({ notification: n, onRead, onNavigate }) {
  const navigate = useNavigate();
  const { icon, text } = formatNotification(n);

  const handleClick = () => {
    if (!n.read) onRead();
    onNavigate();
    navigate(notificationUrl(n));
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition
        ${n.read ? "" : "bg-blue-50/50"}`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {n.sender?.profilePic ? (
          <img src={n.sender.profilePic} alt={n.sender.username}
            className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
            flex items-center justify-center text-white text-sm font-semibold">
            {n.sender?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        {/* Type icon badge */}
        <span className="absolute -bottom-0.5 -right-0.5 text-sm leading-none">{icon}</span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-800 leading-snug line-clamp-2">{text}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
      </div>

      {/* Unread dot */}
      {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />}
    </button>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function formatNotification(n) {
  const name = n.sender?.username ?? "Someone";
  const map = {
    follow:        { icon: "👤", text: `${name} started following you` },
    unfollow:      { icon: "👤", text: `${name} unfollowed you` },
    like_post:     { icon: "❤️", text: `${name} liked your post` },
    like_comment:  { icon: "❤️", text: `${name} liked your comment` },
    comment:       { icon: "💬", text: n.text ? `${name} commented: "${n.text}"` : `${name} commented on your post` },
    mention:       { icon: "🏷️", text: `${name} mentioned you in a comment` },
    message:       { icon: "✉️", text: n.text ? `${name}: ${n.text}` : `${name} sent you a message` },
    profile_visit: { icon: "👁️", text: `${name} visited your profile` },
  };
  return map[n.type] ?? { icon: "🔔", text: `${name} interacted with you` };
}

export function notificationUrl(n) {
  if (n.type === "message")       return `/chats?userId=${n.sender?._id}&username=${n.sender?.username}`;
  if (n.type === "follow")        return `/${n.sender?.username}`;
  if (n.type === "profile_visit") return `/${n.sender?.username}`;
  if (n.post?._id || n.post)      return `/posts/${n.post?._id ?? n.post}`;
  return "/notifications";
}

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)   return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)   return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)   return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)    return `${d}d ago`;
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}