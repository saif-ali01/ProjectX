import React, { useEffect, useRef } from "react";

const CategoryModal = ({ isOpen, onClose, selectedCategory, categories, darkMode }) => {
  const modalRef = useRef(null);

  // Handle escape key and focus trapping
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleFocusTrap = (e) => {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keydown", handleFocusTrap);
      modalRef.current.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleFocusTrap);
    };
  }, [isOpen, onClose]);

  // Handle click outside to close modal
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const categoryData = categories.find((c) => c.name === selectedCategory);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={handleOutsideClick}
    >
      <div
        ref={modalRef}
        className={`rounded-lg p-6 max-w-md w-full border shadow-md transition-all duration-300 ${
          darkMode
            ? "bg-gray-800 border-gray-700 text-gray-100"
            : "bg-white border-gray-200 text-gray-900"
        } animate-fade-in`}
        role="dialog"
        aria-labelledby="category-modal-title"
        aria-describedby="category-modal-description"
        tabIndex={-1}
      >
        <h2
          id="category-modal-title"
          className="text-xl font-semibold mb-4"
        >
          {selectedCategory} Details
        </h2>
        <p
          id="category-modal-description"
          className={`mb-4 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Total spent on {selectedCategory}: ₹
          {categoryData?.value
            ? categoryData.value.toLocaleString("en-IN")
            : "N/A"}
        </p>
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded-lg font-medium transition-colors hover:scale-105 ${
            darkMode
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          aria-label="Close category details modal"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CategoryModal;