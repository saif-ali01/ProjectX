import React from "react";

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
  if (!isOpen || !selectedTransaction) return null;

  // Validate categories structure
  if (!Array.isArray(categories)) {
    console.error("Categories must be an array of objects with value and name properties");
    return null;
  }

  const handleInputChange = (field, value) => {
    setSelectedTransaction((prev) => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString) => {
    try {
      return dateString ? new Date(dateString).toISOString().split("T")[0] : "";
    } catch {
      return "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleEditExpense(e);
  };

  return (
    <div
      className={`fixed inset-0 bg-black flex items-center justify-center z-50 ${
        darkMode ? "bg-opacity-75" : "bg-opacity-50"
      }`}
    >
      <div
        className={`p-6 rounded-lg shadow-lg max-w-md w-full mx-4 ${
          darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">Edit Expense</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Description</label>
            <input
              type="text"
              value={selectedTransaction.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`w-full p-2 rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-100 border-gray-300"
              }`}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Amount</label>
            <input
              type="number"
              value={selectedTransaction.amount ?? ""}
              onChange={(e) =>
                handleInputChange("amount", Math.max(0, parseFloat(e.target.value || 0)))
              }
              className={`w-full p-2 rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-100 border-gray-300"
              }`}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Date</label>
            <input
              type="date"
              value={formatDate(selectedTransaction.date)}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className={`w-full p-2 rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-100 border-gray-300"
              }`}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Category</label>
            <select
              value={selectedTransaction.category || ""}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className={`w-full p-2 rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-100 border-gray-300"
              }`}
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Type</label>
            <select
              value={selectedTransaction.type || ""}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className={`w-full p-2 rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-100 border-gray-300"
              }`}
              required
            >
              <option value="" disabled>
                Select a type
              </option>
              <option value="Personal">Personal</option>
              <option value="Professional">Professional</option>
            </select>
          </div>

          <div className="flex justify-between gap-3">
            <button
              type="submit"
              className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleDeleteExpense}
              className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
                darkMode
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
                darkMode
                  ? "bg-gray-600 hover:bg-gray-500"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;