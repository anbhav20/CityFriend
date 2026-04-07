import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiLogOut,
  FiLock,
  FiBell,
  FiShield,
  FiHelpCircle,
  FiChevronRight,
} from "react-icons/fi";
import MainLayout from "../components/MainLayout";
import { useAuth } from "../features/auth/hooks/useAuth";

const SETTINGS_GROUPS = [
  {
    title: "Account",
    items: [
      { icon: FiUser,   label: "Edit Profile",       to: "/edit-profile" },
      // { icon: FiLock,   label: "Change Password",     to: "/change-password" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: FiBell,   label: "Notifications",       to: "/notifications" },
      { icon: FiShield, label: "Privacy & Security",  to: "/privacy-policy" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: FiHelpCircle, label: "Help & Feedback", to: "/help" },
    ],
  },
];

// ─── Single row item ─────────────────────────────────────────────
const SettingsItem = ({ icon: Icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center justify-between
      px-4 py-3.5 rounded-xl text-sm font-medium
      transition active:scale-[0.98]
      ${danger
        ? "text-red-500 hover:bg-red-50"
        : "text-gray-700 hover:bg-gray-50"
      }
    `}
  >
    <span className="flex items-center gap-3">
      <span className={`p-2 rounded-lg ${danger ? "bg-red-50" : "bg-gray-100"}`}>
        <Icon size={16} className={danger ? "text-red-500" : "text-gray-500"} />
      </span>
      {label}
    </span>
    <FiChevronRight size={15} className="text-gray-300" />
  </button>
);

// ─── Group card ──────────────────────────────────────────────────
const SettingsGroup = ({ title, items, navigate }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 pt-4 pb-2">
      {title}
    </p>
    <div className="divide-y divide-gray-50 px-2 pb-2">
      {items.map(({ icon, label, to }) => (
        <SettingsItem
          key={label}
          icon={icon}
          label={label}
          onClick={() => navigate(to)}
        />
      ))}
    </div>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────
const Settings = () => {
  const navigate    = useNavigate();
  const { user, LogOut } = useAuth();

  const handleLogout = async () => {
    try {
      await LogOut();
      navigate("/");
    } catch {
      // interceptor toast already shown
    }
  };

  return (
    <MainLayout>
      <main className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="max-w-lg mx-auto space-y-4">

          {/* Header */}
          <div className="mb-2">
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage your account and preferences
            </p>
          </div>

          {/* User mini card */}
          {user && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex items-center gap-4">
              <img
                src={user.profilePic || "/default-avatar.png"}
                alt="avatar"
                onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
                className="h-12 w-12 rounded-full object-cover border border-gray-200 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name || user.username}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => navigate(`/${user.username}`)}
                className="ml-auto text-xs font-medium text-blue-500 hover:text-blue-600 transition flex-shrink-0"
              >
                View profile
              </button>
            </div>
          )}

          {/* Settings groups */}
          {SETTINGS_GROUPS.map((group) => (
            <SettingsGroup
              key={group.title}
              title={group.title}
              items={group.items}
              navigate={navigate}
            />
          ))}

          {/* Logout — separate at the bottom */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden px-2 py-2">
            <SettingsItem
              icon={FiLogOut}
              label="Log out"
              onClick={handleLogout}
              danger
            />
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-300 pt-2 pb-6">
            CityFriend • v1.0.0
          </p>

        </div>
      </main>
    </MainLayout>
  );
};

export default Settings;