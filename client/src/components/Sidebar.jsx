import { memo, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiSearch, FiMessageCircle, FiBell, FiSettings, FiLogOut } from "react-icons/fi";
import Navleft from "./Navleft";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useChatCounts } from "../features/messages/hooks/useChatCounts";
import { useNotifications } from "../features/notifications/hooks/useNotifications";
import UserMiniCard from "./UserMiniCard";

const NAV_LINKS = [
  { to: "/home",          icon: FiHome,          label: "Home"          },
  { to: "/search",        icon: FiSearch,        label: "Explore"       },
  { to: "/chats",         icon: FiMessageCircle, label: "Chats"         },
  { to: "/notifications", icon: FiBell,          label: "Notifications" },
  { to: "/settings",      icon: FiSettings,      label: "Settings"      },
];

const Sidebar = memo(() => {
  const { user, LogOut } = useAuth();
  const { totalUnread } = useChatCounts();        // ✅ chats count
  const { unreadCount } = useNotifications();     // ✅ notifications count

  const navigate = useNavigate();
  const location = useLocation();

  const profileTo     = useMemo(() => user ? `/${user.username}` : "#", [user?.username]);
  const profilePic    = useMemo(() => user?.profilePic || "/default-avatar.png", [user?.profilePic]);
  const profileActive = location.pathname === profileTo;

  const handleLogout = useCallback(async () => {
    try {
      await LogOut();
      navigate("/");
    } catch {}
  }, [LogOut, navigate]);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col px-5 py-7 z-40">

      <div className="mb-8 px-2">
        <Navleft />
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_LINKS.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;

          // 🎯 decide badge
          let badge = 0;
          if (to === "/chats") badge = totalUnread;
          if (to === "/notifications") badge = unreadCount;

          return (
            <Link
              key={to}
              to={to}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition
                ${active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
              `}
            >
              <div className="relative">
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />

                {badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-0.5
                    rounded-full bg-red-500 text-white text-[9px] font-bold
                    flex items-center justify-center leading-none">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </div>

              {label}
            </Link>
          );
        })}

        {user && (
          <UserMiniCard
            variant="sidebar"
            profilePic={profilePic}
            username={user.username}
            city={user.city || ""}
            to={profileTo}
            active={profileActive}
          />
        )}
      </nav>

      <div className="border-t border-gray-100 pt-5 mt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          <FiLogOut size={18} />
          Logout
        </button>
      </div>

    </aside>
  );
});

export default Sidebar;