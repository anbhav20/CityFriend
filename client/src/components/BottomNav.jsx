import { memo, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiSearch, FiMessageCircle, FiBell } from "react-icons/fi";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useNotifications } from "../features/notifications/hooks/useNotifications";
import { useChatCounts } from "../features/messages/hooks/useChatCounts";
import UserMiniCard from "./UserMiniCard";

const BottomNav = memo(() => {
  const { user }        = useAuth();
  const { unreadCount } = useNotifications();
  const { totalUnread } = useChatCounts();

  const location      = useLocation();
  const profileTo     = useMemo(() => user ? `/${user.username}` : "#", [user?.username]);
  const profilePic    = useMemo(() => user?.profilePic || "/default-avatar.png", [user?.profilePic]);
  const profileActive = location.pathname === profileTo;

  const NAV = [
    { to: "/home",          icon: FiHome,          badge: 0           },
    { to: "/search",        icon: FiSearch,        badge: 0           },
    { to: "/chats",         icon: FiMessageCircle, badge: totalUnread },
    { to: "/notifications", icon: FiBell,          badge: unreadCount },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-pb">
      <div className="flex justify-around items-center h-14 px-2">
        {NAV.map(({ to, icon: Icon, badge }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`
                relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full
                text-xs font-medium transition
                ${active ? "text-blue-600" : "text-gray-700 hover:text-gray-900"}
              `}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={active ? 1.5 : 1.8} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-0.5
                    rounded-full bg-red-500 text-white text-[9px] font-bold
                    flex items-center justify-center leading-none">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        <UserMiniCard
          variant="bottomnav"
          profilePic={profilePic}
          username={user?.username}
          to={profileTo}
          active={profileActive}
        />
      </div>
    </nav>
  );
});

export default BottomNav;