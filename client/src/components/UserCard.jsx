import {Link,  useNavigate } from "react-router-dom";

const UserCard = ({ user }) => {
    const navigate = useNavigate();
  if (!user) return null;
  const openProfile = () => {
    navigate(`/${user.username}`);
  };

  return (
    <div
      onClick={openProfile}
      className="flex items-center justify-between mt-2 gap-1  bg-white/80 backdrop-blur-sm px-2 sm:px-3 py-2 sm:py-3 rounded-xl sm:rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer max-w-xl mx-auto"
    >
      {/* User Info */}
        <Link
        to={openProfile}
        className="flex items-center gap-2.5 sm:gap-2 min-w-0"
        >
        <img
          src={user.profilePic || "/default-avatar.png"}
          alt="pfp"
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover ring-1 ring-gray-100 shrink-0"
        />

        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
            {user.username}
          </h2>

          <div className="flex gap-2 lg:gap-4">
  {/* ✅ fix 1: font-italic and text-italic don't exist in Tailwind — use italic */}
  <p className="italic text-[11px] sm:text-xs text-gray-500 truncate">
    {user.city || "Unknown location"}
  </p>

  {/* ✅ fix 2: college renders an empty string " " when falsy — hides it entirely instead */}
  {user.college && (
    <p className="italic text-[11px] sm:text-xs text-gray-500 truncate">
      {user.college}
    </p>
  )}
</div>
        </div>
        </Link>


      {/* Follow Button */}

      <button
        onClick={(e) => e.stopPropagation()&& openProfile}
        className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full bg-gray-200  hover:bg-gray-300 transition shrink-0"
      >
        View Profile
      </button>

    </div>
  );
};

export default UserCard;