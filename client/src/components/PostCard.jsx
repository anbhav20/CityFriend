import { Heart, MessageCircle } from "lucide-react";

const PostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-lg mx-auto">

      {/* Header */}

      <div className="flex items-center justify-between px-4 py-3">

        <div className="flex items-center gap-3">

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

        {/* Follow button */}

        <button className="text-sm font-medium text-blue-500 hover:text-blue-600">
          Follow
        </button>

      </div>


      {/* Post Image */}

      <img
        src={post.image}
        alt="post"
        className="w-full object-cover max-h-[450px]"
      />


      {/* Actions */}

      <div className="flex items-center gap-4 px-4 py-3">

        <button className="hover:scale-110 transition">
          <Heart size={22} />
        </button>

        <button className="hover:scale-110 transition">
          <MessageCircle size={22} />
        </button>

      </div>


      {/* Caption */}

      <div className="px-4 pb-4 text-sm text-gray-800">

        <span className="font-semibold mr-2">
          {post.user?.username}
        </span>

        {post.caption}

      </div>

    </div>
  );
};

export default PostCard;