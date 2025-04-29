import React, { useEffect } from "react";

// UndoDeleteToast component for displaying undo option after expense deletion
const UndoDeleteToast = ({ showUndo, handleUndoDelete, onClose, darkMode }) => {
  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (showUndo) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showUndo, onClose]);

  if (!showUndo) return null;

  return (
    <div
      className={`fixed bottom-2 sm:bottom-4 right-2 sm:right-4 p-3 sm:p-4 rounded-lg shadow-lg flex items-center gap-3 sm:gap-4 z-50 transition-colors duration-300 ${
        darkMode
          ? "bg-green-900 text-green-200"
          : "bg-green-100 text-green-700"
      }`}
      role="alert"
      aria-live="assertive"
    >
      <span className="text-xs sm:text-sm">Expense deleted</span>
      <button
        onClick={handleUndoDelete}
        aria-label="Undo expense deletion"
        className={`px-2 sm:px-3 py-1 rounded-lg font-medium transition-transform hover:scale-105 text-xs sm:text-sm ${
          darkMode
            ? "bg-gray-700 text-green-400 hover:bg-gray-600"
            : "bg-white text-green-600 hover:bg-gray-50"
        }`}
      >
        Undo
      </button>
    </div>
  );
};

export default UndoDeleteToast;