import { Link } from "react-router-dom";
import Navleft from "./Navleft";
import {
  FiInstagram,
  FiMail,
  FiExternalLink,
  FiHome,
  FiUsers,
  FiUserPlus,
  FiInfo,
  FiFileText
} from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">

        {/* TOP GRID */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">

          {/* BRAND */}
          <div data-aos="fade-up" data-aos-delay="0" className="text-center sm:text-left">
            <Navleft />
            <p className="mt-3 text-sm text-gray-500 max-w-xs mx-auto sm:mx-0">
              Connect with people nearby and build meaningful conversations.
            </p>

            {/* SOCIAL ICONS */}
            <div className="flex mt-6 justify-center sm:justify-start items-center gap-4">

              <a
                href="https://www.instagram.com/axl.sql"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-pink-50 text-gray-600 hover:text-pink-500 transition"
              >
                <FiInstagram />
              </a>

              <a
                href="mailto:spidey.9449@gmail.com"
                target="_blank"
                className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-500 transition"
              >
                <FiMail />
              </a>

              <a
                href="https://portfolio-1-a01n.onrender.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition text-sm font-medium"
              >
                <FiExternalLink className="w-4 h-4" />
                Portfolio
              </a>

            </div>
          </div>

          {/* PRODUCT */}
          <div data-aos="fade-up" data-aos-delay="100" className="text-center sm:text-left">
            <h3 className="font-semibold text-gray-800 mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-gray-500">

              <li>
                <Link to="/" className="flex items-center gap-2 hover:text-blue-600 transition">
                  <FiHome className="w-4 h-4" />
                  Home
                </Link>
              </li>

              <li>
                <Link to="/about" className="flex items-center gap-2 hover:text-blue-600 transition">
                  <FiUsers className="w-4 h-4" />
                  Community
                </Link>
              </li>

              <li>
                <Link to="/signup" className="flex items-center gap-2 hover:text-blue-600 transition">
                  <FiUserPlus className="w-4 h-4" />
                  Join
                </Link>
              </li>

            </ul>
          </div>

          {/* COMPANY */}
          <div data-aos="fade-up" data-aos-delay="200" className="text-center sm:text-left">
            <h4 className="font-semibold text-gray-800 mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">

              <li>
                <Link to="/about" className="flex items-center gap-2 hover:text-blue-600 transition">
                  <FiInfo className="w-4 h-4" />
                  About
                </Link>
              </li>

              <li>
                <Link to="/privacy-policy" className="flex items-center gap-2 hover:text-blue-600 transition">
                  <FiFileText className="w-4 h-4" />
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link to="/terms" className="flex items-center gap-2 hover:text-blue-600 transition">
                  <FiFileText className="w-4 h-4" />
                  Terms & Conditions
                </Link>
              </li>

            </ul>
          </div>

          {/* CTA */}
          <div data-aos="fade-up" data-aos-delay="300" className="text-center sm:text-left">
            <h4 className="font-semibold text-gray-800 mb-3">Get Started</h4>
            <p className="text-sm text-gray-500 mb-4">
              Join today and start chatting with people near you.
            </p>

            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-white text-sm bg-gradient-to-r from-blue-600 to-sky-400 hover:scale-105 transition"
            >
              <FiUserPlus className="w-4 h-4" />
              Join Now
            </Link>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="mt-10 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} CityFriend. All rights reserved.
          <span className="block sm:inline">
            {" "}Made with ❤️ by Anbhav.
          </span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;