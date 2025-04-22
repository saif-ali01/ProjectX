import React, { useState } from "react";

const AddExpenseForm = ({ onSubmit, onCancel, darkMode }) => {
  const [formData, setFormData] = useState({
    amount: "",
    type: "Personal",
    category: "",
    date: "",
    description: "",
  });

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
  };

  const inputStyles =
    "w-full border p-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-500";
  const lightInput =
    "border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400";
  const darkInput =
    "border-gray-600 bg-gray-800 text-gray-100 placeholder:text-gray-400";

  return (
    <div
      className={`w-full max-w-xl mx-auto p-6 rounded-2xl shadow-lg transition ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      <h2 className="text-3xl font-semibold mb-6 text-center tracking-tight">
        Add New Expense
      </h2>
      <form onSubmit={handleFormSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Amount (₹)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="e.g. 1500"
            className={`${inputStyles} ${darkMode ? darkInput : lightInput}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <div className="flex gap-4">
            {types.map((t) => (
              <label key={t} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value={t}
                  checked={formData.type === t}
                  onChange={handleChange}
                  className="form-radio text-blue-500"
                />
                {t}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className={`${inputStyles} ${darkMode ? darkInput : lightInput}`}
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
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className={`${inputStyles} ${darkMode ? darkInput : lightInput}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
          >
            Add Expense
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={`w-full py-2 rounded-md transition ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpenseForm;