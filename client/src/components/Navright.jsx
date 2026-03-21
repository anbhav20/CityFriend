import { Link } from "react-router-dom";
import { FiExternalLink, FiGrid, FiUsers, FiLogIn } from "react-icons/fi";

const Navright = ({ mobile = false }) => {
  return (
    <div
      className={`flex flex-col lg:flex-row gap-4 lg:gap-8 text-sm font-semibold ${
        mobile ? "items-start" : "items-center"
      }`}
    >

      {/* FEATURES */}
      <Link
        to="/features"
        className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition"
      >
        <FiGrid className="w-4 h-4" />
        Features
      </Link>

      {/* PORTFOLIO */}
      <a
        href="https://portfolio-1-a01n.onrender.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
      >
        <FiExternalLink className="w-4 h-4" />
        Portfolio
      </a>

      {/* COMMUNITY */}
      <Link
        to="/community"
        className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition"
      >
        <FiUsers className="w-4 h-4" />
        Community
      </Link>

      {/* SIGN IN */}
      <Link
        to="/login"
        className="flex items-center gap-2 bg-gray-200 rounded-full px-4 py-1 hover:bg-gray-300 transition text-gray-700"
      >
        <FiLogIn className="w-4 h-4" />
        Sign-in
      </Link>

    </div>
  );
};

export default Navright;