import { useState } from "react";
import { Heart, MessageCircle, Bookmark, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [saved, setSaved] = useState(false);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  // Friendly timestamp
  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3">

        <Link
          to={`/${post.user?.username}`}
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            <img
              src={post.user?.profilePic || "/default-avatar.png"}
              alt="pfp"
              className="w-9 h-9 rounded-full object-cover border border-gray-200"
            />
            {/* Online dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white" />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition leading-tight">
              {post.user?.username}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1 leading-tight">
              <span>📍</span>
              {post.user?.city || "Unknown"}
              {post.createdAt && (
                <>
                  <span className="mx-1 text-gray-200">·</span>
                  {timeAgo(post.createdAt)}
                </>
              )}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button className="text-xs font-semibold text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition">
            Follow
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
            <MoreHorizontal size={16} />
          </button>
        </div>

      </div>

      {/* ── Image ── */}
      {post.image && (
        <div className="w-full bg-gray-50">
          <img
            src={post.image}
            alt="post"
            className="w-full object-cover max-h-125"
          />
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-4">

          {/* Like */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 group transition"
          >
            <Heart
              size={20}
              className={`transition-transform group-hover:scale-110 ${
                liked
                  ? "fill-red-500 stroke-red-500"
                  : "stroke-gray-500 group-hover:stroke-red-400"
              }`}
            />
            {likeCount > 0 && (
              <span className={`text-xs font-medium ${liked ? "text-red-500" : "text-gray-500"}`}>
                {likeCount}
              </span>
            )}
          </button>

          {/* Comment */}
          <button className="flex items-center gap-1.5 group transition">
            <MessageCircle
              size={20}
              className="stroke-gray-500 group-hover:stroke-blue-500 group-hover:scale-110 transition-transform"
            />
            {post.comments?.length > 0 && (
              <span className="text-xs font-medium text-gray-500">
                {post.comments.length}
              </span>
            )}
          </button>

        </div>

        {/* Save */}
        <button
          onClick={() => setSaved((p) => !p)}
          className="group transition"
        >
          <Bookmark
            size={20}
            className={`transition-transform group-hover:scale-110 ${
              saved
                ? "fill-gray-800 stroke-gray-800"
                : "stroke-gray-400 group-hover:stroke-gray-700"
            }`}
          />
        </button>
      </div>

      {/* ── Caption ── */}
      {post.caption && (
        <div className="px-4 pb-4 pt-2 text-sm text-gray-800 leading-relaxed">
          <Link
            to={`/${post.user?.username}`}
            className="font-semibold text-gray-900 hover:text-blue-600 transition mr-1.5"
          >
            {post.user?.username}
          </Link>
          {post.caption}
        </div>
      )}

    </div>
  );
};

export default PostCard;