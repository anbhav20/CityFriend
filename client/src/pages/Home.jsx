import axios from "axios";
import MainLayout from "../components/MainLayout";
import { useState, useEffect } from "react";

const Home = () => {

  const [posts, setPosts] = useState([]);
  const [file, setFile] = useState(null);

  const getPosts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/posts/feed",
        { withCredentials: true }
      );

      setPosts(res.data.posts);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  const uploadPost = async () => {

    if (!file) return alert("Select an image");

    try {

      const formData = new FormData();
      formData.append("image", file);

      await axios.post(
        "http://localhost:5000/api/posts/upload",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setFile(null);
      getPosts();

    } catch (error) {
      console.error(error);
    }

  };

  return (

    <MainLayout>

      <main className="ml-64 px-10 py-10 bg-gray-100 min-h-screen">

        {/* Create Post */}

        <div className="max-w-2xl mb-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-5">

          <h2 className="text-lg font-semibold text-gray-800">
            Create Post
          </h2>

          <div className="flex items-center gap-4 mt-4">

            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm border border-gray-300 rounded-lg p-2 file:mr-3 file:py-1 file:px-3 file:border-0 file:text-sm file:rounded-lg file:bg-gray-200 file:cursor-pointer"
            />

            <button
              onClick={uploadPost}
              className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition cursor-pointer"
            >
              Post
            </button>

          </div>

        </div>


        {/* Posts Feed */}

        <div className="max-w-2xl space-y-8">

          {posts.map((post) => (

            <div
              key={post._id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >

              {/* User Header */}

              <div className="flex items-center gap-3 p-4">

                <img
                  src={post.user?.profilePic || "/default-avatar.png"}
                  alt="pfp"
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {post.user?.username}
                  </h3>

                  <p className="text-xs text-gray-500">
                    {post.user?.city || "Unknown"}
                  </p>
                </div>

              </div>

              {/* Post Image */}

              <img
                src={post.image}
                alt="post"
                className="w-full object-cover max-h-[500px]"
              />

              {/* Caption */}

              <div className="p-4">
                <p className="text-sm text-gray-700">
                  {post.caption || ""}
                </p>
              </div>

            </div>

          ))}

          {posts.length === 0 && (

            <div className="text-center py-10 bg-white rounded-2xl border border-gray-200">

              <p className="text-gray-500 text-sm">
                No posts yet. Be the first to post something 🚀
              </p>

            </div>

          )}

        </div>

      </main>

    </MainLayout>

  );
};

export default Home;