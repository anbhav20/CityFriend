import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiSearch, FiMessageCircle, FiBell, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import Navleft from "./Navleft";
import { useAuth } from "../features/auth/hooks/useAuth";

const NAV_LINKS = [
  { to: "/home",          icon: FiHome,          label: "Home"          },
  { to: "/search",        icon: FiSearch,        label: "Explore"       },
  { to: "/chats",         icon: FiMessageCircle, label: "Chats"         },
  { to: "/notifications", icon: FiBell,          label: "Notifications" },
  { to: "/settings",      icon: FiSettings,      label: "Settings"      },
];

const Sidebar = () => {
  const { user, LogOut } = useAuth(); // ✅ user object directly — no async needed
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = async () => {
    try {
      await LogOut();
      navigate("/");
    } catch {
      // interceptor toast already shown
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col px-5 py-7 z-40">

      {/* Logo */}
      <div className="mb-8 px-2">
        <Navleft />
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_LINKS.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`
              flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition
              ${isActive(to)
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
            `}
          >
            <Icon size={18} strokeWidth={isActive(to) ? 2.5 : 1.8} />
            {label}
          </Link>
        ))}

        {/* Profile link — dynamic username */}
        <Link
          to={user ? `/${user.username}` : "#"}
          className={`
            flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition
            ${isActive(`/${user?.username}`)
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
          `}
        >
          <FiUser size={18} strokeWidth={isActive(`/${user?.username}`) ? 2.5 : 1.8} />
          Profile
        </Link>
      </nav>

      {/* User mini-card + logout */}
      <div className="border-t border-gray-100 pt-5 mt-4">
        {user && (
          <div className="flex items-center gap-3 px-2 mb-4">
            <img
              src={user.profilePic || "/default-avatar.png"}
              alt="avatar"
              className="h-8 w-8 rounded-full object-cover border border-gray-200 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                {user.username}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.city || ""}</p>
            </div>
          </div>
        )}

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
};

export default Sidebar;