import { useNavigate } from "react-router-dom";

const FollowButton = ({ isFollowing, onFollow, onUnfollow, userId,username }) => {
  const navigate = useNavigate();

  if (isFollowing) {
    return (
      <div className="mt-2 flex gap-2 w-full">
        <button
          onClick={onUnfollow}
          className="flex-1 whitespace-nowrap px-4 py-1 sm:py-1.5 rounded-lg text-xs lg:text-sm font-semibold bg-gray-200 hover:bg-gray-300 transition"
        >
          Following
        </button>
        <button
          onClick={() => navigate(`/chats?userId=${userId}&username=${username}`)}
          className="flex-1 whitespace-nowrap px-4 py-1 sm:py-1.5 rounded-lg text-xs lg:text-sm font-semibold bg-gray-200 hover:bg-gray-300 transition"
        >
          Message
        </button>
      </div>
    );
  }

  return  (
  <div className="flex justify-center w-full">
    <button
      onClick={onFollow}
      className="whitespace-nowrap w-md px-6 py-1 sm:py-1.5 rounded-lg text-xs lg:text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 transition"
    >
      Follow
    </button>
  </div>
);
};

export default FollowButton;