import React from "react";

const CategoryModal = ({ isOpen, onClose, selectedCategory, categories, darkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {selectedCategory} Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Total spent on {selectedCategory}: ₹
          {categories
            .find((c) => c.name === selectedCategory)
            ?.value.toLocaleString("en-IN")}
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CategoryModal;
