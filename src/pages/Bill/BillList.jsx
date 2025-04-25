import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Highest Amount", value: "highest-amount" },
  { label: "Lowest Amount", value: "lowest-amount" },
];

const BillList = ({ darkMode }) => {
  const [bills, setBills] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const billsPerPage = 10;
  const navigate = useNavigate();

  // Fetch bills from API
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/bills", {
          params: {
            page: currentPage,
            limit: billsPerPage,
            sortBy,
            search: searchTerm,
          },
        });

        // Validate response data
        setBills(response.data.bills || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        setError("Failed to fetch bills. Please try again.");
        console.error("Error fetching bills:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [sortBy, searchTerm, currentPage]);

  // Format status badge colors
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return darkMode
          ? "bg-green-900 text-green-200"
          : "bg-green-100 text-green-800";
      case "due":
        return darkMode
          ? "bg-red-900 text-red-200"
          : "bg-red-100 text-red-800";
      case "pending":
        return darkMode
          ? "bg-orange-900 text-orange-200"
          : "bg-orange-100 text-orange-800";
      default:
        return darkMode
          ? "bg-blue-900 text-blue-200"
          : "bg-blue-100 text-blue-800";
    }
  };

  // Format balance badge colors
  const getBalanceColor = (balance) => {
    const numericBalance = Number(balance) || 0;
    if (numericBalance === 0)
      return darkMode
        ? "bg-green-900 text-green-200"
        : "bg-green-100 text-green-800";
    if (numericBalance > 0)
      return darkMode
        ? "bg-red-900 text-red-200"
        : "bg-red-100 text-red-800";
    return darkMode
      ? "bg-orange-900 text-orange-200"
      : "bg-orange-100 text-orange-800";
  };

  // Export bills to CSV
  const exportToCSV = () => {
    if (!bills.length) {
      setError("No bills to export.");
      return;
    }
    const csvContent = [
      ["Serial #", "Party Name", "Date", "Total", "Status", "Advance", "Balance"],
      ...bills.map((bill) => [
        bill.serialNumber || "N/A",
        `"${bill.partyName || "Unknown"}"`,
        bill.date ? new Date(bill.date).toLocaleDateString() : "N/A",
        Number(bill.total) || 0,
        bill.status || "pending",
        Number(bill.advance) || 0,
        Number(bill.balance) || 0,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bills_export.csv";
    link.click();
  };

  // Navigate to bill view
  const handleBillClick = (billId) => {
    navigate(`/bill-view/${billId}`);
  };

  // Retry fetching bills on error
  const handleRetry = () => {
    setCurrentPage(1);
    setError("");
    setSortBy("newest");
    setSearchTerm("");
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1
            className={`text-2xl sm:text-3xl font-bold ${
              darkMode ? "text-gray-100" : "text-gray-900"
            } mb-4 sm:mb-0`}
          >
            Bill Management
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full sm:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-600"
              }`}
              aria-label="Search bills by party name"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full sm:w-48 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-600"
              }`}
              aria-label="Sort bills"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={exportToCSV}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors hover:scale-105 shadow-md ${
                darkMode
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              aria-label="Export bills to CSV"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            className={`mb-4 p-4 rounded-lg animate-pulse ${
              darkMode
                ? "bg-blue-900 text-blue-200"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            Loading bills...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700"
            }`}
          >
            {error}
            <button
              onClick={handleRetry}
              className={`ml-4 px-3 py-1 rounded-lg transition-colors ${
                darkMode
                  ? "bg-blue-700 text-blue-100 hover:bg-blue-800"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
              aria-label="Retry fetching bills"
            >
              Retry
            </button>
          </div>
        )}

        {/* Bills Table */}
        <div
          className={`overflow-x-auto rounded-lg shadow-lg border ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } animate-fade-in`}
        >
          <table className="min-w-full text-sm">
            <thead>
              <tr
                className={`${
                  darkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                <th className="px-4 sm:px-6 py-3 text-left font-semibold rounded-tl-lg">
                  Serial #
                </th>
                <th className="px-4 sm:px-6 py-3 text-left font-semibold">
                  Party Name
                </th>
                <th className="px-4 sm:px-6 py-3 text-left font-semibold">
                  Date
                </th>
                <th className="px-4 sm:px-6 py-3 text-left font-semibold">
                  Total
                </th>
                <th className="px-4 sm:px-6 py-3 text-left font-semibold">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-left font-semibold">
                  Advance
                </th>
                <th className="px-4 sm:px-6 py-3 text-left font-semibold rounded-tr-lg">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill, index) => (
                <tr
                  key={bill._id}
                  onClick={() => handleBillClick(bill._id)}
                  className={`border-t transition-colors cursor-pointer ${
                    darkMode
                      ? "border-gray-700 text-gray-100 hover:bg-gray-700"
                      : "border-gray-200 text-gray-900 hover:bg-gray-50"
                  } ${index % 2 === 0 ? "" : darkMode ? "bg-gray-800" : "bg-gray-50"}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleBillClick(bill._id)
                  }
                  aria-label={`View bill ${bill.serialNumber || "N/A"}`}
                >
                  <td className="px-4 sm:px-6 py-4 font-medium">
                    #{bill.serialNumber || "N/A"}
                  </td>
                  <td className="px-4 sm:px-6 py-4 font-medium">
                    {bill.partyName || "Unknown"}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-gray-600 dark:text-gray-400">
                    {bill.date
                      ? new Date(bill.date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    ₹{(Number(bill.total) || 0).toFixed(2)}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}
                    >
                      {(bill.status || "pending").charAt(0).toUpperCase() +
                        (bill.status || "pending").slice(1)}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    ₹{(Number(bill.advance) || 0).toFixed(2)}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBalanceColor(bill.balance)}`}
                    >
                      ₹{(Number(bill.balance) || 0).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && !loading && (
                <tr
                  className={`${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <td
                    colSpan="7"
                    className="px-4 sm:px-6 py-4 text-center"
                  >
                    No bills found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className={`flex justify-between items-center mt-6 ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors hover:scale-105 disabled:opacity-50 ${
                darkMode
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-medium transition-colors hover:scale-105 disabled:opacity-50 ${
                darkMode
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillList;