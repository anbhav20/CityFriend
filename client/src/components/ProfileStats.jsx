const ProfileStats = ({ postCount, followersCount, followingCount, onFollowersClick, onFollowingClick }) => {
  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:flex gap-6 text-sm">
        <div>
          <span className="font-semibold text-gray-800">{postCount}</span>
          <span className="text-gray-500 ml-1">posts</span>
        </div>
        <button
          onClick={onFollowersClick}
          className="hover:opacity-70 transition text-left"
        >
          <span className="font-semibold text-gray-800">{followersCount}</span>
          <span className="text-gray-500 ml-1">followers</span>
        </button>
        <button
          onClick={onFollowingClick}
          className="hover:opacity-70 transition text-left"
        >
          <span className="font-semibold text-gray-800">{followingCount}</span>
          <span className="text-gray-500 ml-1">following</span>
        </button>
      </div>

      {/* Mobile */}
      <div className="flex sm:hidden justify-around">
        <div>
          <p className="text-base font-semibold text-gray-800">{postCount}</p>
          <p className="text-xs text-gray-500">Posts</p>
        </div>
        <button
          onClick={onFollowersClick}
          className="text-center hover:opacity-70 transition"
        >
          <p className="text-base font-semibold text-gray-800">{followersCount}</p>
          <p className="text-xs text-gray-500">Followers</p>
        </button>
        <button
          onClick={onFollowingClick}
          className="text-center hover:opacity-70 transition"
        >
          <p className="text-base font-semibold text-gray-800">{followingCount}</p>
          <p className="text-xs text-gray-500">Following</p>
        </button>
      </div>
    </>
  );
};

export default ProfileStats;