import React, { useState, useEffect } from "react";
import Papa from "papaparse";

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

  // Debounce search input to avoid frequent updates
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [localSearchQuery, setSearchQuery]);

  const exportCSV = () => {
    const csv = Papa.unparse(transactions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transactions.csv";
    link.click();
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Recent Transactions
        </h2>
        <button
          onClick={exportCSV}
          className="px-3 py-1 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition"
        >
          Export CSV
        </button>
      </div>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by description..."
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">All Types</option>
          <option value="Personal">Personal</option>
          <option value="Professional">Professional</option>
        </select>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-700 dark:text-gray-400">
            <th className="p-3 cursor-pointer" onClick={() => handleSort("date")}>
              Date {sortBy === "date" && (sortOrder === "desc" ? "↓" : "↑")}
            </th>
            <th
              className="p-3 cursor-pointer"
              onClick={() => handleSort("description")}
            >
              Description{" "}
              {sortBy === "description" && (sortOrder === "desc" ? "↓" : "↑")}
            </th>
            <th
              className="p-3 cursor-pointer"
              onClick={() => handleSort("category")}
            >
              Category{" "}
              {sortBy === "category" && (sortOrder === "desc" ? "↓" : "↑")}
            </th>
            <th
              className="p-3 cursor-pointer"
              onClick={() => handleSort("amount")}
            >
              Amount {sortBy === "amount" && (sortOrder === "desc" ? "↓" : "↑")}
            </th>
            <th className="p-3">Type</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, idx) => (
            <tr
              key={idx}
              className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 transition cursor-pointer"
              onClick={() => handleTransactionClick(tx)}
            >
              <td className="p-3 text-gray-900 dark:text-gray-100">{tx.date}</td>
              <td className="p-3 text-gray-900 dark:text-gray-100">
                {tx.description}
              </td>
              <td className="p-3 text-gray-900 dark:text-gray-100">
                {tx.category}
              </td>
              <td className="p-3 text-gray-900 dark:text-gray-100">{tx.amount}</td>
              <td className="p-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    tx.type === "Personal"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {tx.type}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition"
        >
          Previous
        </button>
        <span className="text-gray-700 dark:text-gray-200">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TransactionsTable;
