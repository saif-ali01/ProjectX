// src/pages/NotFound.jsx

import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go to previous page
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mt-4">Page not found</h2>
      <p className="text-gray-500 mt-2">The page you are looking for doesn’t exist.</p>
      <button
        onClick={handleBack}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go back
      </button>
    </div>
  );
};

export default NotFound;
