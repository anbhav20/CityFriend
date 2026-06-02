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
  const { userProfile, follow, unFollow } = useUser();

  const [profileUser,     setProfileUser]     = useState(null);
  const [activeTab,       setActiveTab]       = useState("posts");
  const [isFollowing,     setIsFollowing]     = useState(false);
  const [followersCount,  setFollowersCount]  = useState(0);
  const [followingCount,  setFollowingCount]  = useState(0); // ← alag state
  const [error,           setError]           = useState(null);
  const [isFetching,      setIsFetching]      = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const res = await userProfile(username);
        if (cancelled) return;
        const userData = res?.user ?? res;
        setProfileUser(userData);
        setFollowersCount(userData?.followersCount ?? 0);
        setFollowingCount(userData?.followingCount ?? 0); // ← initialize
        setIsFollowing(res?.isFollowing ?? false);
      } catch {
        if (!cancelled) setError("Profile not found.");
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [username]);

  const isOwnProfile = loggedInUser?.username === username;

  const handleFollow = async () => {
    if (!profileUser?._id) return;
    try {
      await follow(profileUser._id);
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
    } catch {}
  };

  const handleUnfollow = async () => {
    if (!profileUser?._id) return;
    try {
      await unFollow(profileUser._id);
      setIsFollowing(false);
      setFollowersCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  if (isFetching) {
    return <MainLayout><UserProfile className="mt-10" /></MainLayout>;
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
          {error}
        </div>
      </MainLayout>
    );
  }

  if (!profileUser) return null;

  const posts = profileUser?.posts ?? [];

  return (
    <MainLayout>
      <main className="min-h-screen">
        <TopBar username={profileUser.username} isOwnProfile={isOwnProfile} />
        <div className="w-full px-2 sm:px-2">
          <ProfileInfo
            user={profileUser}
            isOwnProfile={isOwnProfile}
            isFollowing={isFollowing}
            followersCount={followersCount}
            followingCount={followingCount}
            setFollowersCount={setFollowersCount}
            setFollowingCount={setFollowingCount}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
          />
          <ProfileTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOwnProfile={isOwnProfile}
          />
          <div className="py-6 pb-10">
            <PostsGrid posts={posts} isOwnProfile={isOwnProfile} />
          </div>
        </div>
      </main>
    </MainLayout>
  );
};

export default Profile;