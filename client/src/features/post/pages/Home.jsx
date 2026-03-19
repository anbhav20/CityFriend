import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { FiImage, FiX } from "react-icons/fi";
import MainLayout from "../../../components/MainLayout";
import SkeletonPost from "../../../components/SkeletonPost";
import PostCard from "../../../components/PostCard";
import { usePost } from "../hooks/usePost";

const Home = () => {
  const [posts,   setPosts]   = useState([]);
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");

  const fileInputRef = useRef(null);
  const { feed, loading, upload, uploading } = usePost();

  // ✅ fetch feed on mount with cleanup to prevent stale setState
  useEffect(() => {
    let cancelled = false;

    const fetchFeed = async () => {
      try {
        const res = await feed();
        if (!cancelled) setPosts(res?.posts ?? []);
      } catch {
        // interceptor toast already shown
      }
    };

    fetchFeed();
    return () => { cancelled = true; };
  }, []); // ✅ no deps needed — runs once on mount

  // ✅ revoke object URL on unmount / file change to prevent memory leak
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (preview) URL.revokeObjectURL(preview); // ✅ revoke previous before creating new
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setCaption("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadPost = async () => {
    // ✅ toast instead of alert
    if (!file && !caption.trim()) {
      toast.error("Add a photo or write something first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("caption", caption.trim());

      const res = await upload(formData);

      // ✅ optimistic prepend — no need to refetch entire feed
      if (res?.post) setPosts((prev) => [res.post, ...prev]);

      resetForm();
    } catch {
      // interceptor toast already shown
    }
  };

  return (
    <MainLayout>
      <main className="min-h-screen bg-gray-50 px-2 py-3">
        <div className="max-w-xl mx-auto space-y-2">

          {/* ── Create Post ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 sm:p-3">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">Create Post</h2>

            <textarea
              value={caption}
              placeholder="What's on your mind?"
              onChange={(e) => setCaption(e.target.value)}
              maxLength={500} // ✅ cap caption length
              rows={3}
              className="
                w-full resize-none rounded-xl border border-gray-200
                px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                transition
              "
            />

            {/* ✅ caption counter */}
            <p className={`text-xs text-right mt-0.5 transition ${
              caption.length >= 500 ? "text-red-400" : "text-gray-300"
            }`}>
              {caption.length} / 500
            </p>

            {/* Image preview */}
            {preview && (
              <div className="relative mt-3 rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full max-h-60 object-cover"
                />
                <button
                  onClick={clearFile}
                  type="button"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}

            {/* Actions row */}
            <div className="flex items-center justify-between mt-3 gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                  text-gray-500 hover:text-blue-600 hover:bg-blue-50
                  border border-gray-200 hover:border-blue-200 transition
                "
              >
                <FiImage size={16} />
                <span className="hidden sm:inline">
                  {file ? file.name.slice(0, 20) + "…" : "Add photo"}
                </span>
                <span className="sm:hidden">Photo</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={uploadPost}
                disabled={uploading || (!file && !caption.trim())} // ✅ disable when nothing to post
                className="
                  px-5 py-2 rounded-xl text-sm font-medium text-white
                  bg-gradient-to-r from-blue-600 to-sky-400
                  hover:scale-105 transition shadow-sm shadow-blue-100
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                "
              >
                {uploading ? "Posting…" : "Post"}
              </button>
            </div>
          </div>

          {/* ── Feed ── */}
          {loading ? (
            Array.from({ length: 3 }, (_, i) => <SkeletonPost key={i} />) // ✅ no repeated JSX
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center">
              <p className="text-2xl mb-2">🏙️</p>
              <p className="text-sm font-medium text-gray-700">No posts yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Be the first to share something in your city.
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