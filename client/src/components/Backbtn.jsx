import { useNavigate } from "react-router-dom";

const Backbtn = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="
        absolute top-3 left-3
        flex items-center justify-center
        w-8 h-8 sm:w-10 sm:h-10
        rounded-full
        bg-white/80 backdrop-blur
        shadow-sm border border-gray-200
        hover:bg-gray-100
        transition
      "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
};

export default Backbtn;