import React from "react";

const UndoDeleteToast = ({ showUndo, handleUndoDelete, darkMode }) => {
  if (!showUndo) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-600 dark:bg-green-500 text-white dark:text-gray-100 p-4 rounded-lg shadow-lg flex items-center gap-4 z-50">
      <span>Expense deleted</span>
      <button
        onClick={handleUndoDelete}
        className="px-3 py-1 bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
      >
        Undo
      </button>
    </div>
  );
};

export default UndoDeleteToast;
