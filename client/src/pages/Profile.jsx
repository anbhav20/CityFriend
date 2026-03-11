import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import MainLayout from "../components/MainLayout";

const Profile = () => {

  const { username } = useParams();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const getProfile = async () => {

    try {

      const res = await axios.get(
        `https://cityfriend.onrender.com/api/${username}`,
        { withCredentials: true }
      );

      setUser(res.data.user);
      setPosts(res.data.posts || []);

    } catch (error) {
      console.log(error);
    }

  };

  useEffect(() => {
    getProfile();
  }, [username]);

  if (!user) {
    return (
      <MainLayout>
        <div className="ml-64 p-10">Loading profile...</div>
      </MainLayout>
    );
  }

  return (

    <MainLayout>

      <main className="ml-64 px-6 py-10 bg-gray-50 min-h-screen">

        {/* Profile Header */}

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">

          {/* Avatar */}

          <img
            src={user.profilePic || "/default-avatar.png"}
            alt="profile"
            className="h-32 w-32 rounded-full object-cover border"
          />

          {/* User Info */}

          <div className="flex-1">

            <div className="flex items-center gap-4 flex-wrap">

              <h1 className="text-xl font-semibold">
                {user.username}
              </h1>

              <button className="px-4 py-1 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition">
                Follow
              </button>

            </div>

            {/* Stats */}

            <div className="flex gap-6 mt-4 text-sm">

              <span>
                <strong>{posts.length}</strong> posts
              </span>

              <span>
                <strong>{user.followers?.length || 0}</strong> followers
              </span>

              <span>
                <strong>{user.following?.length || 0}</strong> following
              </span>

            </div>

            {/* Bio */}

            <p className="mt-3 text-sm text-gray-700">
              {user.bio || "No bio yet"}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {user.city}
            </p>

          </div>

        </div>

        {/* Divider */}

        <div className="max-w-4xl mx-auto mt-10 border-t pt-6">

          {/* Posts Grid */}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

            {posts.length === 0 ? (

              <p className="text-sm text-gray-500">
                No posts yet.
              </p>

            ) : (

              posts.map((post) => (

                <img
                  key={post._id}
                  src={post.image}
                  alt="post"
                  className="w-full aspect-square object-cover rounded-md hover:opacity-90 cursor-pointer"
                />

              ))

            )}

          </div>

        </div>

      </main>

    </MainLayout>
  );
};

export default Profile;