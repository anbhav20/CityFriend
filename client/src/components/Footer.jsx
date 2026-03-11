import { Link } from "react-router-dom";
import Navleft from "./Navleft";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">

        {/* TOP GRID */}
        <div
          className="
            grid grid-cols-1
            gap-8
            sm:grid-cols-2
            lg:grid-cols-4
            lg:gap-12
          "
        >

          {/* BRAND */}
            <div className="text-center sm:text-left">
              <Navleft />
              <p className="mt-3 text-sm text-gray-500 max-w-xs mx-auto sm:mx-0">
                Connect with people nearby and build meaningful conversations.
              </p>

              {/* SOCIAL ICONS */}
              <div className="flex mt-6 justify-center  items-center gap-5 ">
                
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/axl.sql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition"
                  aria-label="Instagram"
                >
                  <img
                    className="h-5 w-5"
                    src="/instagram.png"
                    alt="Instagram"
                  />
                </a>

                {/* Email */}
                <a
                  href="mailto:spidey.9449@gmail.com"
                  className="hover:scale-110 transition"
                  aria-label="Email"
                >
                  <img
                    className="h-5 w-5"
                    src="/gmail.png"
                    alt="Email"
                  />
                </a>

              </div>
            </div>


          {/* PRODUCT */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-gray-800 mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link to="/" className="hover:text-blue-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-600 transition">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-blue-600 transition">
                  Join
                </Link>
              </li>
            </ul>
          </div>

          {/* COMPANY */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-gray-800 mb-3">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link to="/about" className="hover:text-blue-600 transition">
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-blue-600 transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-blue-600 transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-gray-800 mb-3">
              Get Started
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              Join today and start chatting with people near you.
            </p>
            <Link
              to="/signup"
              className="
                inline-block px-6 py-2
                rounded-full text-white text-sm
                bg-gradient-to-r from-blue-600 to-sky-400
                hover:scale-105 transition
              "
            >
              Join Now
            </Link>
          </div>

        </div>

        {/* BOTTOM */}
        <div
          className="
            mt-10 pt-6
            border-t border-gray-100
            text-center text-xs text-gray-400
          "
        >
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
