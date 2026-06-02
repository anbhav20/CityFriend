import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FollowButton from "./FollowButton";
import ProfileStats from "./ProfileStats";
import FollowListModal from "./FollowListModal";
import { FiCamera } from "react-icons/fi";
import { useUser } from "../features/user/hooks/useUser";
import { useAuth } from "../features/auth/hooks/useAuth";

const ProfileInfo = ({
  user,
  isOwnProfile,
  isFollowing,
  followersCount,
  followingCount,
  setFollowersCount,
  setFollowingCount,
  onFollow,
  onUnfollow,
}) => {
  const navigate = useNavigate();
  const { followers, followings, follow, unFollow } = useUser();
  const { user: loggedInUser } = useAuth();

  const [modal, setModal]                   = useState(null);
  const [list, setList]                     = useState([]);
  const [listLoading, setListLoading]       = useState(false);
  const [myFollowingIds, setMyFollowingIds] = useState(new Set());

  const openModal = async (type) => {
    setModal(type);
    setList([]);
    setListLoading(true);
    try {
      const myId = loggedInUser?._id || loggedInUser?.id;
      const myFollowingsData = await followings(myId);
      const ids = new Set(
        (myFollowingsData?.followings ?? []).map((f) => String((f.following ?? f)._id))
      );
      setMyFollowingIds(ids);

      let data;
      if (type === "followers") {
        data = await followers(user._id);
        setList(data?.followers ?? []);
      } else {
        data = await followings(user._id);
        setList(data?.followings ?? []);
      }
    } catch {
      setList([]);
    } finally {
      setListLoading(false);
    }
  };

  // Follow someone from modal
  const handleModalFollow = async (userId) => {
    await follow(userId);
    setMyFollowingIds((prev) => new Set([...prev, userId]));

    // Agar is profile user ko follow kiya → unke followers +1
    if (userId === user._id) {
      setFollowersCount?.((prev) => prev + 1);
    }
    // Agar isOwnProfile → apna followingCount +1
    if (isOwnProfile) {
      setFollowingCount?.((prev) => prev + 1);
    }
  };

  // Unfollow someone from modal
  const handleModalUnfollow = async (userId) => {
    await unFollow(userId);
    setMyFollowingIds((prev) => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });

    // Agar is profile user ko unfollow kiya → unke followers -1
    if (userId === user._id) {
      setFollowersCount?.((prev) => Math.max(0, prev - 1));
    }
    // Agar isOwnProfile → apna followingCount -1
    if (isOwnProfile) {
      setFollowingCount?.((prev) => Math.max(0, prev - 1));
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: user.username, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {}
  };

  return (
    <>
      <div className="py-4 sm:py-2">
        <div className="flex mt-2 gap-2 sm:gap-12">
          <div
            className={`relative ${isOwnProfile ? "cursor-pointer group" : ""}`}
            onClick={() => { if (isOwnProfile) navigate("/edit-profile"); }}
          >
            <img
              src={user.profilePic || "/default-avatar.png"}
              alt="profile"
              onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
              className="h-16 w-16 sm:h-40 sm:w-40 rounded-full object-cover"
            />
            {isOwnProfile && (
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <FiCamera size={20} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2 lg:mt-2">
              <h1 className="hidden sm:block text-xl font-semibold text-gray-900 truncate">
                {user.username}
              </h1>
              {user.name && (
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              )}
              <ProfileStats
                postCount={user.postCount ?? 0}
                followersCount={followersCount}
                followingCount={followingCount}
                onFollowersClick={() => openModal("followers")}
                onFollowingClick={() => openModal("followings")}
              />
              {user.bio && (
                <div className="hidden sm:block max-w-sm">
                  <p className="text-sm mb-1 leading-relaxed">{user.bio}</p>
                  {user.college && (
                    <span className="text-xs lg:text-sm bg-gray-200 py-1 px-2 rounded-2xl">
                      {user.college}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {user.bio && (
          <div className="sm:hidden mt-3 max-w-sm">
            <p className="text-sm mb-1 leading-relaxed">{user.bio}</p>
            {user.college && (
              <span className="text-xs bg-gray-200 py-1 px-2 rounded-2xl">{user.college}</span>
            )}
          </div>
        )}

        <div className="w-full mt-4 flex gap-2">
          {isOwnProfile ? (
            <>
              <button
                onClick={() => navigate("/edit-profile")}
                className="w-full flex-1 px-4 py-2 sm:py-1.5 rounded-lg text-xs lg:text-sm font-semibold bg-gray-200 hover:bg-gray-300 transition"
              >
                Edit profile
              </button>
              <button
                onClick={handleShare}
                className="w-full flex-1 px-4 py-2 rounded-lg text-xs lg:text-sm font-semibold bg-gray-200 hover:bg-gray-300 transition"
              >
                Share profile
              </button>
            </>
          ) : (
            <FollowButton
              isFollowing={isFollowing}
              onFollow={onFollow}
              onUnfollow={onUnfollow}
              userId={user._id}
              username={user.username}
            />
          )}
        </div>
      </div>

      {modal && (
        <FollowListModal
          type={modal}
          list={list}
          loading={listLoading}
          onClose={() => setModal(null)}
          loggedInUser={loggedInUser}
          myFollowingIds={myFollowingIds}
          onFollow={handleModalFollow}
          onUnfollow={handleModalUnfollow}
        />
      )}
    </>
  );
};

export default ProfileInfo;