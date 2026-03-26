import { useNavigate } from "react-router-dom";
import FollowButton from "./FollowButton";
import ProfileStats from "./ProfileStats";

const ProfileInfo = ({
  user,
  isOwnProfile,
  isFollowing,
  followersCount,
  onFollow,
  onUnfollow,
}) => {
  const navigate = useNavigate();

  // ✅ fix 1: extracted to async function with proper if/else
  // ?? doesn't work here — navigator.share?.() returns a Promise (truthy), not null
  // so the clipboard branch never ran
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: user.username, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      // user cancelled — no action needed
    }
  };

  return (
    <div className="py-4 sm:py-2">

      <div className="flex mt-2 gap-2 sm:gap-12">

        <div className="">
          <img
            src={user.profilePic || "/default-avatar.png"}
            alt="profile"
            onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }} // ✅ fix 2: broken imagekit URL crashed img
            className="h-16 w-16 sm:h-40 sm:w-40 rounded-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0"> {/* ✅ fix 3: min-w-0 prevents long username breaking flex layout */}
          <div className="flex flex-col gap-2 lg:mt-2">

            <h1 className="hidden sm:block text-xl font-semibold text-gray-900 truncate">
              {user.username}
            </h1>

            {user.name && (
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.name}
              </p>
            )}

            <ProfileStats
              postCount={user.postCount ?? 0}
              followersCount={followersCount}
              followingCount={user.followingCount ?? 0}
            />

            {/* ✅ college shown only when it exists — was always rendering even if undefined */}
            {user.bio && (
              <div className="hidden sm:block max-w-sm">
                <p className="text-sm leading-relaxed">{user.bio}</p>
                {user.college && (
                  <p className="text-sm leading-relaxed">{user.college}</p>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ✅ same college guard on mobile */}
      {user.bio && (
        <div className="sm:hidden mt-3 max-w-sm">
          <p className="text-sm leading-relaxed">{user.bio}</p>
          {user.college && (
            <p className="text-sm leading-relaxed">{user.college}</p>
          )}
        </div>
      )}

      <div className="w-full mt-4 flex gap-2">
        {isOwnProfile ? (
          <>
            <button
              onClick={() => navigate("/edit-profile")}
              className="w-full whitespace-nowrap flex-1 px-4 py-1 sm:py-1.5 rounded-lg text-xs lg:text-sm font-semibold bg-gray-200 hover:bg-gray-300 transition"
            >
              Edit profile
            </button>
            <button
              onClick={handleShare} // ✅ fixed
              className="w-full whitespace-nowrap flex-1 px-4 py-1 rounded-lg text-xs lg:text-sm font-semibold bg-gray-200 hover:bg-gray-300 transition"
            >
              Share profile
            </button>
          </>
        ) : (
          <FollowButton // ✅ removed unnecessary <> wrapper
            isFollowing={isFollowing}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            userId={user._id}
            username={user.username}
          />
        )}
      </div>

    </div>
  );
};

export default ProfileInfo;