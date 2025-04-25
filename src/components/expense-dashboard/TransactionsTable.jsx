import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Toast from "../../components/common/Toast";

const TransactionsTable = ({
  transactions,
  categories,
  sortBy,
  sortOrder,
  handleSort,
  filterCategory,
  setFilterCategory,
  filterType,
  setFilterType,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  totalPages,
  handleTransactionClick,
  darkMode,
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [toast, setToast] = useState(null);

  // Debounce search input to avoid frequent updates
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [localSearchQuery, setSearchQuery]);

  const exportCSV = () => {
    if (!transactions || transactions.length === 0) {
      setToast({ message: "No transactions to export", type: "error" });
      return;
    }
    const csv = Papa.unparse(transactions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transactions.csv";
    link.click();
    setToast({ message: "Transactions exported successfully", type: "success" });
  };

  return (
    <div
      className={`rounded-lg shadow-md p-6 border transition-colors duration-300 ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2
          className={`text-lg font-semibold ${
            darkMode ? "text-gray-100" : "text-gray-900"
          }`}
        >
          Recent Transactions
        </h2>
        <button
          onClick={exportCSV}
          aria-label="Export transactions as CSV"
          className={`px-3 py-1 rounded-lg font-medium transition-colors hover:scale-105 ${
            darkMode
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Export CSV
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by description..."
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          className={`p-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:ring-blue-500"
              : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-blue-600"
          }`}
          aria-label="Search transactions by description"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={`p-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500"
              : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-600"
          }`}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`p-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500"
              : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-600"
          }`}
          aria-label="Filter by type"
        >
          <option value="">All Types</option>
          <option value="Personal">Personal</option>
          <option value="Professional">Professional</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className={`text-left ${
                darkMode ? "text-gray-400" : "text-gray-700"
              }`}
            >
              <th
                className="p-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => handleSort("date")}
                aria-sort={sortBy === "date" ? (sortOrder === "desc" ? "descending" : "ascending") : "none"}
              >
                Date {sortBy === "date" && (sortOrder === "desc" ? "↓" : "↑")}
              </th>
              <th
                className="p-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => handleSort("description")}
                aria-sort={sortBy === "description" ? (sortOrder === "desc" ? "descending" : "ascending") : "none"}
              >
                Description{" "}
                {sortBy === "description" && (sortOrder === "desc" ? "↓" : "↑")}
              </th>
              <th
                className="p-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => handleSort("category")}
                aria-sort={sortBy === "category" ? (sortOrder === "desc" ? "descending" : "ascending") : "none"}
              >
                Category{" "}
                {sortBy === "category" && (sortOrder === "desc" ? "↓" : "↑")}
              </th>
              <th
                className="p-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => handleSort("amount")}
                aria-sort={sortBy === "amount" ? (sortOrder === "desc" ? "descending" : "ascending") : "none"}
              >
                Amount {sortBy === "amount" && (sortOrder === "desc" ? "↓" : "↑")}
              </th>
              <th className="p-3">Type</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr
                className={`${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                <td colSpan="5" className="p-3 text-center">
                  No transactions match the selected filters.
                </td>
              </tr>
            ) : (
              transactions.map((tx, idx) => (
                <tr
                  key={tx.id || idx}
                  className={`border-t transition-colors duration-300 cursor-pointer ${
                    darkMode
                      ? "border-gray-700 text-gray-100 hover:bg-gray-700"
                      : "border-gray-200 text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => handleTransactionClick(tx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleTransactionClick(tx)}
                  aria-label={`Select transaction: ${tx.description}`}
                >
                  <td className="p-3">{tx.date}</td>
                  <td className="p-3">{tx.description}</td>
                  <td className="p-3">{tx.category}</td>
                  <td className="p-3">{tx.amount}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        tx.type === "Personal"
                          ? darkMode
                            ? "bg-blue-900 text-blue-200"
                            : "bg-blue-100 text-blue-800"
                          : darkMode
                          ? "bg-green-900 text-green-200"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className={`px-4 py-2 rounded-lg font-medium transition-colors hover:scale-105 disabled:opacity-50 ${
            darkMode
              ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Previous
        </button>
        <span className={`${darkMode ? "text-gray-200" : "text-gray-700"}`}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className={`px-4 py-2 rounded-lg font-medium transition-colors hover:scale-105 disabled:opacity-50 ${
            darkMode
              ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Next
        </button>
      </div>
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

export default TransactionsTable;