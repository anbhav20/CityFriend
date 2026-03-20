import { memo, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiSearch, FiMessageCircle, FiBell } from "react-icons/fi";
import { useAuth } from "../features/auth/hooks/useAuth";
import UserMiniCard from "./UserMiniCard";

const NAV = [
  { to: "/home",          icon: FiHome,          label: "Home"    },
  { to: "/search",        icon: FiSearch,        label: "Explore" },
  { to: "/chats",         icon: FiMessageCircle, label: "Chats"   },
  { to: "/notifications", icon: FiBell,          label: "Alerts"  },
];

const BottomNav = memo(() => {
  const { user } = useAuth();
  const location = useLocation();

  const profileTo     = useMemo(() => user ? `/${user.username}` : "#", [user?.username]);
  const profilePic    = useMemo(() => user?.profilePic || "/default-avatar.png", [user?.profilePic]);
  const profileActive = location.pathname === profileTo;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-pb">
      <div className="flex justify-around items-center h-14 px-2">

        {NAV.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={label}
              to={to}
              className={`
                flex flex-col items-center justify-center gap-0.5 flex-1 h-full
                text-xs font-medium transition
                ${active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}
              `}
            >
              <Icon size={20} strokeWidth={active ? 1.5 : 1.8} />
              <span className="text-[10px]">{label}</span>
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