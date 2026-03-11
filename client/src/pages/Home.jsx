import axios from "axios";
import MainLayout from "../components/MainLayout";
import SkeletonPost from "../components/SkeletonPost";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const Home = () => {

  const [posts, setPosts] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const getPosts = async () => {

    try {

      const res = await axios.get(
        "https://cityfriend.onrender.com/api/posts/feed",
        { withCredentials: true }
      );

      setPosts(res.data.posts || []);

    } catch (error) {

      toast.error(
        error.response?.data?.message || "Failed to load posts"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  const uploadPost = async () => {

    if (!file) {
      return toast.warning("Please select an image");
    }

    const toastId = toast.loading("Uploading post...");

    try {

      setUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      await axios.post(
        "https://cityfriend.onrender.com/api/posts/upload",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      toast.update(toastId, {
        render: "Post uploaded successfully 🚀",
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      setFile(null);
      getPosts();

    } catch (error) {

      toast.update(toastId, {
        render:
          error.response?.data?.message ||
          "Upload failed. Try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000
      });

    } finally {
      setUploading(false);
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
              disabled={uploading}
              className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition cursor-pointer disabled:opacity-60"
            >
              {uploading ? "Posting..." : "Post"}
            </button>

          </div>

        </div>


        {/* Posts Feed */}

        <div className="max-w-2xl space-y-8">

          {loading ? (
            <>
              <SkeletonPost />
              <SkeletonPost />
              <SkeletonPost />
              <SkeletonPost />
              <SkeletonPost />
              <SkeletonPost />
            </>
          ) : posts.length === 0 ? (

            <div className="text-center py-10 bg-white rounded-2xl border border-gray-200">
              <p className="text-gray-500 text-sm">
                No posts yet. Be the first to post something.
              </p>
            </div>

          ) : (
             posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))

          )}

        </div>

      </main>

    </MainLayout>

  );
};

export default Home;