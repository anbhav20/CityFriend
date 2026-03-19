import { FiGrid, FiBookmark } from "react-icons/fi";

const ProfileTabs = ({ activeTab, setActiveTab, isOwnProfile }) => {
  return (
    <div className="border-t border-gray-200">
      <div className="flex justify-center gap-10">

        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 py-3 text-xs font-semibold tracking-widest uppercase border-t-2 transition ${
            activeTab === "posts"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <FiGrid size={14} />
          Posts
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-2 py-3 text-xs font-semibold tracking-widest uppercase border-t-2 transition ${
              activeTab === "saved"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <FiBookmark size={14} />
            Saved
          </button>
        )}

      </div>
    </div>
  );
};

export default ProfileTabs;