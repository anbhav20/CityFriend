import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";

const FollowListModal = ({
  type,
  list,
  loading,
  onClose,
  loggedInUser,
  myFollowingIds = new Set(),
  onFollow,
  onUnfollow,
}) => {
  const navigate = useNavigate();
  const overlayRef = useRef(null);
  const [followMap, setFollowMap] = useState({});

  useEffect(() => {
    const initial = {};
    list.forEach((item) => {
      const user = item.follower ?? item.following ?? item;
      if (user?._id) {
        initial[user._id] = myFollowingIds.has(String(user._id));
      }
    });
    setFollowMap(initial);
  }, [list, myFollowingIds]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleUserClick = (username) => {
    onClose();
    navigate(`/${username}`);
  };

  const handleFollow = async (e, userId) => {
    e.stopPropagation();
    try {
      await onFollow(userId);
      setFollowMap((prev) => ({ ...prev, [userId]: true }));
    } catch {}
  };

  const handleUnfollow = async (e, userId) => {
    e.stopPropagation();
    try {
      await onUnfollow(userId);
      setFollowMap((prev) => ({ ...prev, [userId]: false }));
    } catch {}
  };

  const loggedInId = String(loggedInUser?._id || loggedInUser?.id || "");
  const title = type === "followers" ? "Followers" : "Following";

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="bg-white w-full sm:max-w-sm sm:mx-4 sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <span className="text-sm font-bold text-gray-900">{title}</span>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition text-gray-600"
          >
            <IoClose size={16} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                <div className="h-11 w-11 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1">
                  <div className="h-3 w-28 bg-gray-100 rounded mb-2" />
                  <div className="h-2.5 w-16 bg-gray-100 rounded" />
                </div>
                <div className="h-8 w-20 bg-gray-100 rounded-lg" />
              </div>
            ))
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-1">
              <p className="text-sm font-semibold text-gray-700">No {title.toLowerCase()} yet</p>
              <p className="text-xs text-gray-400 text-center px-6">
                {type === "followers"
                  ? "When someone follows you, they'll appear here."
                  : "People you follow will appear here."}
              </p>
            </div>
          ) : (
            list.map((item, idx) => {
              // Backend populates: { _id: followDocId, follower/following: { _id, username, profilePic } }
              const user = item.follower ?? item.following ?? item;

              // Skip if user data is missing/malformed
              if (!user?.username) return null;

              const userId = String(user._id);
              const isSelf = loggedInId && loggedInId === userId;
              const isFollowing = followMap[userId] ?? false;

              return (
                <div
                  key={userId || idx}
                  onClick={() => handleUserClick(user.username)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition cursor-pointer"
                >
                  <img
                    src={user.profilePic || "/default-avatar.png"}
                    alt={user.username}
                    onError={(e) => { e.target.src = "/default-avatar.png"; }}
                    className="h-11 w-11 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
                    {user.name && (
                      <p className="text-xs text-gray-400 truncate">{user.name}</p>
                    )}
                  </div>

                  {!isSelf && (
                    isFollowing ? (
                      <button
                        onClick={(e) => handleUnfollow(e, userId)}
                        className="shrink-0 text-xs font-semibold px-4 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                      >
                        Following
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleFollow(e, userId)}
                        className="shrink-0 text-xs font-semibold px-4 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                      >
                        Follow
                      </button>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;