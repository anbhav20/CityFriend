import React from "react";
import Backbtn from "../components/Backbtn";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">

      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>

        <h2 className="text-2xl font-semibold text-gray-700">
          Page Not Found
        </h2>

        <p className="text-gray-500 max-w-md">
          The page you are looking for doesn’t exist or has been moved.
        </p>

        <a
          href="/"
          className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-400 text-white rounded-xl hover:bg-gray-800 transition"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
