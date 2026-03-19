import { Link, useLocation } from "react-router-dom";
import { FiHome, FiSearch, FiMessageCircle, FiBell, FiUser } from "react-icons/fi";
import { useAuth } from "../features/auth/hooks/useAuth";

const BottomNav = () => {
  const { user } = useAuth(); // ✅ just the object — no useState, no useEffect, no async call
  const location = useLocation();

  const NAV = [
    { to: "/home",          icon: FiHome,          label: "Home"    },
    { to: "/search",        icon: FiSearch,        label: "Explore" },
    { to: "/chats",         icon: FiMessageCircle, label: "Chats"   },
    { to: "/notifications", icon: FiBell,          label: "Alerts"  },
    { to: user ? `/${user.username}` : "#", icon: FiUser, label: "Profile" },
  ];

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
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;