import { Link } from "react-router-dom";

const UserCard = ({ user }) => {
  if (!user) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/80 backdrop-blur-sm px-4 py-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-[1px] transition-all duration-200">

      <Link
        to={`/${user.username}`}
        className="flex items-center gap-3 min-w-0 group"
      >
        <img
          src={user.profilePic || "/default-avatar.png"}
          alt="pfp"
          className="h-11 w-11 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-blue-400 transition flex-shrink-0"
        />

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">
            {user.username}
          </h2>

          <p className="text-xs text-gray-500 truncate">
            {user.city || "Unknown location"}
          </p>
        </div>
      </Link>

      <button
        className="self-start sm:self-auto px-4 py-1.5 text-sm font-medium rounded-full bg-blue-500 text-white hover:bg-blue-600 transition shadow-sm flex-shrink-0"
      >
        Follow
      </button>

    </div>
  );
};

export default UserCard;