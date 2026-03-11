import { Link, useLocation, useNavigate } from "react-router-dom";
import Navleft from "./Navleft";
import axios from "axios";
// import { toast } from "react-toastify";

// Icons
import {
  FiHome,
  FiSearch,
  FiMessageCircle,
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut
} from "react-icons/fi";

const HomeLeftNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/logout");
      // toast.success(res.data.message || "Logged out");
      alert(res.data.message || "Logged out");
      navigate("/");
    } catch (error) {
      // toast.error("Logout failed");
      console.log(error);
      alert("Logout failed");
    }
  };

  const navItem =
    "flex items-center gap-4 px-4 py-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition";

  const activeNav = "bg-blue-50 text-blue-600 font-medium";

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r px-6 py-8 flex flex-col">


      <div className="mb-10">
        <Navleft />
      </div>

      
      <nav className="flex flex-col gap-5 text-[15px]">

        <Link
          to="/home"
          className={`${navItem} ${
            location.pathname === "/home" && activeNav
          }`}
        >
          <FiHome size={18} />
          Home
        </Link>

        <Link
          to="/search"
          className={`${navItem} ${
            location.pathname === "/search" && activeNav
          }`}
        >
          <FiSearch size={18} />
          Search
        </Link>

        <Link
          to="/chats"
          className={`${navItem} ${
            location.pathname === "/chats" && activeNav
          }`}
        >
          <FiMessageCircle size={18} />
          Chats
        </Link>

        <Link
          to="/notifications"
          className={`${navItem} ${
            location.pathname === "/notifications" && activeNav
          }`}
        >
          <FiBell size={18} />
          Notifications
        </Link>

        <Link
          to="/profile"
          className={`${navItem} ${
            location.pathname === "/profile" && activeNav
          }`}
        >
          <FiUser size={18} />
          Profile
        </Link>

        <Link
          to="/settings"
          className={`${navItem} ${
            location.pathname === "/settings" && activeNav
          }`}
        >
          <FiSettings size={18} />
          Settings
        </Link>

      </nav>


      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-4 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 transition"
      >
        <FiLogOut size={18} />
        Logout
      </button>

    </div>
  );
};

export default HomeLeftNav;
