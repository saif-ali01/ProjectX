import React, { useState } from "react";
import Toast from "../../components/common/Toast";

const AddExpenseForm = ({ onSubmit, onCancel, darkMode }) => {
  const [formData, setFormData] = useState({
    amount: "",
    type: "Personal",
    category: "",
    date: "",
    description: "",
  });
  const [toast, setToast] = useState(null);

  const expenseCategories = ["Food", "Travel", "Equipment", "Other"];
  const types = ["Personal", "Professional"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      amount: "",
      type: "Personal",
      category: "",
      date: "",
      description: "",
    });
    setToast({ message: "Expense added successfully", type: "success" });
  };

  const inputStyles = `w-full p-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300`;
  const lightInput = `bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-blue-600`;
  const darkInput = `bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:ring-blue-500`;

  return (
    <div
      className={`w-full max-w-xl mx-auto p-6 rounded-lg shadow-md border transition-colors duration-300 ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <h2
        className={`text-2xl font-semibold mb-6 text-center ${
          darkMode ? "text-gray-100" : "text-gray-900"
        }`}
      >
        Add New Expense
      </h2>
      <form onSubmit={handleFormSubmit} className="space-y-5">
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
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="e.g. 1500"
            className={`${inputStyles} ${darkMode ? darkInput : lightInput}`}
            aria-required="true"
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-1 ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Type
          </label>
          <div className="flex gap-4">
            {types.map((t) => (
              <label key={t} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value={t}
                  checked={formData.type === t}
                  onChange={handleChange}
                  className={`form-radio ${
                    darkMode
                      ? "text-blue-500 focus:ring-blue-500"
                      : "text-blue-600 focus:ring-blue-600"
                  }`}
                  aria-label={`Select ${t} type`}
                />
                <span className={darkMode ? "text-gray-100" : "text-gray-900"}>
                  {t}
                </span>
              </label>
            ))}
          </div>
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
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className={`${inputStyles} ${darkMode ? darkInput : lightInput}`}
            aria-required="true"
          >
            <option value="">Select category</option>
            {expenseCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

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
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className={`${inputStyles} ${darkMode ? darkInput : lightInput}`}
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
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Add details about the expense"
            className={`${inputStyles} ${darkMode ? darkInput : lightInput}`}
          />
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className={`w-full py-2 rounded-lg font-medium transition-colors hover:scale-105 ${
              darkMode
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            aria-label="Submit expense form"
          >
            Add Expense
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={`w-full py-2 rounded-lg font-medium transition-colors hover:scale-105 ${
              darkMode
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            aria-label="Cancel expense form"
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
  );
};

export default AddExpenseForm;