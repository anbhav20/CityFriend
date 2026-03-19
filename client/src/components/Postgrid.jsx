import { FiGrid } from "react-icons/fi";

const PostsGrid = ({ posts = [], isOwnProfile }) => {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center mb-4">
          <FiGrid size={24} className="text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-800">No posts yet</p>
        {isOwnProfile && (
          <p className="text-xs text-gray-400 mt-1">Share your first photo.</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
      {posts.map((post) => (
        <div key={post._id} className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={post.image}
            alt="post"
            className="w-full h-full object-cover hover:opacity-90 cursor-pointer transition"
          />
        </div>
      ))}
    </div>
  );
};

export default PostsGrid;