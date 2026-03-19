const ProfileStats = ({ postCount, followersCount, followingCount }) => {
  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:flex gap-6 text-sm">
        <div>
          <span className="font-semibold text-gray-900">{postCount}</span>
          <span className="text-gray-500 ml-1">posts</span>
        </div>
        <div>
          <span className="font-semibold text-gray-900">{followersCount}</span>
          <span className="text-gray-500 ml-1">followers</span>
        </div>
        <div>
          <span className="font-semibold text-gray-900">{followingCount}</span>
          <span className="text-gray-500 ml-1">following</span>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex sm:hidden justify-around  ">
        <div>
          <p className="text-base font-bold text-gray-900">{postCount}</p>
          <p className="text-xs text-gray-500">Posts</p>
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">{followersCount}</p>
          <p className="text-xs text-gray-500">Followers</p>
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">{followingCount}</p>
          <p className="text-xs text-gray-500">Following</p>
        </div>
      </div>
    </>
  );
};

export default ProfileStats;