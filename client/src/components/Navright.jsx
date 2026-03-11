import { Link } from "react-router-dom";

const Navright = ({ mobile = false }) => {
  return (
    <div
      className={`flex flex-col lg:flex-row gap-4 lg:gap-8 text-sm font-semibold ${
        mobile ? "items-start" : "items-center"
      }`}
    >
      <Link
        to="/features"
        className="hover:text-blue-500 transition"
      >
        Features
      </Link>

      <Link
        to="/community"
        className="hover:text-blue-500 transition"
      >
        Community
      </Link>

      <Link
        to="/login"
        className="bg-gray-200 rounded-full px-4 py-1 hover:bg-gray-300 transition"
      >
        Sign-in
      </Link>
    </div>
  );
};

export default Navright;