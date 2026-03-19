import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../../components/MainLayout";
import UserProfile from "../../../components/UserProfile";
import TopBar from "../../../components/TopBar";
import ProfileInfo from "../../../components/ProfileInfo";
import ProfileTabs from "../../../components/Profiletabs";
import PostsGrid from "../../../components/Postgrid";
import { useAuth } from "../../auth/hooks/useAuth";
import { useUser } from "../hooks/useUser";

const Profile = () => {
  const { username } = useParams();
  const { user: loggedInUser } = useAuth();
  const { userProfile, follow, unFollow } = useUser(); // ✅ removed loading from context

  const [profileUser,    setProfileUser]    = useState(null);
  const [activeTab,      setActiveTab]      = useState("posts");
  const [isFollowing,    setIsFollowing]    = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [error,          setError]          = useState(null);
  const [isFetching,     setIsFetching]     = useState(false); // ✅ local fetch state

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      setIsFetching(true);   // ✅ set BEFORE clearing — skeleton shows immediately
      setError(null);
      // ✅ don't setProfileUser(null) here — keep old profile visible while loading
      //    avoids the flash: skeleton → "not found" → profile
      try {
        const res = await userProfile(username);
        if (cancelled) return;
        const userData = res?.user ?? res;
        setProfileUser(userData);
        setFollowersCount(userData?.followersCount ?? 0);
        setIsFollowing(res?.isFollowing ?? false);
      } catch {
        if (!cancelled) setError("Profile not found.");
      } finally {
        if (!cancelled) setIsFetching(false); // ✅ only stop after data is in state
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [username]); // ✅ removed userProfile from deps — stable context fn, caused re-fetches

  const isOwnProfile = loggedInUser?.username === username;

  const handleFollow = async () => {
    if (!profileUser?._id) return;
    try {
      await follow(profileUser._id);
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
    } catch {
      // interceptor toast already shown
    }
  };

  const handleUnfollow = async () => {
    if (!profileUser?._id) return;
    try {
      await unFollow(profileUser._id);
      setIsFollowing(false);
      setFollowersCount((prev) => Math.max(0, prev - 1));
    } catch {
      // interceptor toast already shown
    }
  };

  // ——— Loading state — show skeleton ———
  if (isFetching) { // ✅ only isFetching — not "loading || !profileUser"
    return (
      <MainLayout>
        <UserProfile className="mt-10" />
      </MainLayout>
    );
  }

  // ——— Error state ———
  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
          {error}
        </div>
      </MainLayout>
    );
  }

  // ——— Not found (fetch done but no data) ———
  if (!profileUser) return null;

  const posts = profileUser?.posts ?? [];

  return (
    <MainLayout>
      <main className="min-h-screen bg-gray-50">

        <TopBar
          username={profileUser.username}
          isOwnProfile={isOwnProfile}
        />

        <div className="max-w-3xl mx-auto px-2 sm:px-10">
          <ProfileInfo
            user={profileUser}
            isOwnProfile={isOwnProfile}
            isFollowing={isFollowing}
            followersCount={followersCount}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
          />

          <ProfileTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOwnProfile={isOwnProfile}
          />

          <div className="py-6 pb-10">
            <PostsGrid
              posts={posts}
              isOwnProfile={isOwnProfile}
            />
          </div>
        </div>

      </main>
    </MainLayout>
  );
};

export default Profile;