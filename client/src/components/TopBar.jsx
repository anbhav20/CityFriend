import { useNavigate } from "react-router-dom";
import { FiSettings } from "react-icons/fi";

const TopBar = ({ username, isOwnProfile }) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <span className="text-sm font-semibold text-gray-800 absolute left-1/2 -translate-x-1/2">
        {username}
      </span>
      {isOwnProfile && (
        <button
          onClick={() => navigate("/settings")}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          <FiSettings size={20} />
        </button>
      )}
    </div>
  );
};

export default TopBar;