import React, { useEffect, useRef, useState } from "react";
import Toast from "../../components/common/Toast";

// EditExpenseModal component for editing or deleting expenses
const EditExpenseModal = ({
  isOpen,
  onClose,
  selectedTransaction,
  setSelectedTransaction,
  categories,
  handleEditExpense,
  handleDeleteExpense,
  darkMode,
}) => {
  const modalRef = useRef(null);
  const [toast, setToast] = useState(null);

  // Handle escape key and focus trapping
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
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
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  // Handle form submission
  const onSubmit = (e) => {
    e.preventDefault();
    if (parseFloat(selectedTransaction.amount) <= 0) {
      setToast({ message: "Amount must be positive", type: "error" });
      return;
    }
    handleEditExpense(selectedTransaction);
    setToast({ message: "Expense updated successfully", type: "success" });
    onClose();
  };

  // Handle delete with toast feedback
  const onDelete = () => {
    handleDeleteExpense();
    setToast({ message: "Expense deleted", type: "success" });
    onClose();
  };

  if (!isOpen || !selectedTransaction) return null;

  // Normalize date format (e.g., "Sep 01" to "2023-09-01")
  const normalizeDate = (dateStr) => {
    if (!dateStr) return "";
    const [month, day] = dateStr.split(" ");
    const year = new Date().getFullYear();
    const monthIndex = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].indexOf(month);
    if (monthIndex === -1) return dateStr;
    return `${year}-${(monthIndex + 1).toString().padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const inputStyles = `w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300 text-sm sm:text-base`;
  const lightInput = `bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-600`;
  const darkInput = `bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500`;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={handleOutsideClick}
    >
      <div
        ref={modalRef}
        className={`rounded-lg p-4 sm:p-6 max-w-sm sm:max-w-md w-full border shadow-md transition-all duration-300 animate-fade-in ${
          darkMode
            ? "bg-gray-800 border-gray-700 text-gray-100"
            : "bg-white border-gray-200 text-gray-900"
        }`}
        role="dialog"
        aria-labelledby="edit-expense-modal-title"
        aria-describedby="edit-expense-modal-description"
        tabIndex={-1}
      >
        <h2
          id="edit-expense-modal-title"
          className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4"
        >
          Edit Expense
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="date"
              className={`block text-sm font-medium mb-1 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              value={normalizeDate(selectedTransaction.date)}
              onChange={(e) =>
                setSelectedTransaction({
                  ...selectedTransaction,
                  date: e.target.value,
                })
              }
              className={`${inputStyles} ${darkMode ? darkInput : lightInput}`}
              required
              aria-required="true"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className={`block text-sm font-medium mb-1 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Description
            </label>
            <input
              id="description"
              type="text"
              value={selectedTransaction.description}
              onChange={(e) =>
                setSelectedTransaction({
                  ...selectedTransaction,
                  description: e.target.value,
                })
              }
              className={`${inputStyles} ${darkMode ? darkInput : lightInput}`}
              required
              aria-required="true"
            />
          </div>
          <div>
            <label
              htmlFor="category"
              className={`block text-sm font-medium mb-1 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Category
            </label>
            <select
              id="category"
              value={selectedTransaction.category}
              onChange={(e) =>
                setSelectedTransaction({
                  ...selectedTransaction,
                  category: e.target.value,
                })
              }
              className={`${inputStyles} ${darkMode ? darkInput : lightInput}`}
              required
              aria-required="true"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="amount"
              className={`block text-sm font-medium mb-1 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Amount (₹)
            </label>
            <input
              id="amount"
              type="number"
              value={selectedTransaction.amount.replace(/[^0-9.]/g, "")}
              onChange={(e) =>
                setSelectedTransaction({
                  ...selectedTransaction,
                  amount: e.target.value,
                })
              }
              className={`${inputStyles} ${darkMode ? darkInput : lightInput}`}
              required
              min="0"
              step="0.01"
              aria-required="true"
            />
          </div>
          <div>
            <label
              htmlFor="type"
              className={`block text-sm font-medium mb-1 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Type
            </label>
            <select
              id="type"
              value={selectedTransaction.type}
              onChange={(e) =>
                setSelectedTransaction({
                  ...selectedTransaction,
                  type: e.target.value,
                })
              }
              className={`${inputStyles} ${darkMode ? darkInput : lightInput}`}
              required
              aria-required="true"
            >
              <option value="Personal">Personal</option>
              <option value="Professional">Professional</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
            <button
              type="submit"
              className={`w-full py-2 rounded-lg font-medium transition-transform hover:scale-105 text-sm sm:text-base ${
                darkMode
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              aria-label="Update expense"
            >
              Update Expense
            </button>
            <button
              type="button"
              onClick={onDelete}
              className={`w-full py-2 rounded-lg font-medium transition-transform hover:scale-105 text-sm sm:text-base ${
                darkMode
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
              aria-label="Delete expense"
            >
              Delete Expense
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`w-full py-2 rounded-lg font-medium transition-transform hover:scale-105 text-sm sm:text-base ${
                darkMode
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              aria-label="Cancel edit expense"
            >
              Cancel
            </button>
          </div>
        </form>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
};

export default EditExpenseModal;