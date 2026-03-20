import { memo } from "react";
import { Link } from "react-router-dom";

const UserMiniCard = memo(({ profilePic, username, city, to, active, variant = "sidebar" }) => {

  if (variant === "bottomnav") {
    return (
      <Link
        to={to}
        className={`
          flex flex-col items-center justify-center gap-0.5 flex-1 h-full
          text-xs font-medium transition
          ${active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}
        `}
      >
        <img
          src={profilePic}
          alt="avatar"
          className={`
            h-6 w-6 rounded-full object-cover shrink-0
            ${active ? "ring-2 ring-blue-500 ring-offset-1" : "ring-1 ring-gray-200"}
          `}
        />
        <span className="text-[10px]">Profile</span>
      </Link>
    );
  }

  // sidebar — single nav link row only
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition
        ${active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
      `}
    >
      <img
        src={profilePic}
        alt="avatar"
        className="h-6 w-6 rounded-full object-cover border border-gray-200 shrink-0"
      />
      <span className="truncate">{username}</span>
    </Link>
  );
});

export default UserMiniCard;