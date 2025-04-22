import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000/api/bills",
});

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Highest Amount", value: "highest-amount" },
  { label: "Lowest Amount", value: "lowest-amount" }
];

const BillList = () => {
  const [bills, setBills] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const billsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        const response = await API.get("/", {
          params: {
            page: currentPage,
            limit: billsPerPage,
            sortBy,
            search: searchTerm
          }
        });

        setBills(response.data.bills);
        setTotalPages(response.data.totalPages);
        setError("");
      } catch (err) {
        setError("Failed to fetch bills");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [sortBy, searchTerm, currentPage]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "due":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBalanceColor = (balance) => {
    const numericBalance = Number(balance || 0);
    if (numericBalance === 0) return "bg-green-100 text-green-800";
    if (numericBalance > 0) return "bg-red-100 text-red-800";
    return "bg-orange-100 text-orange-800";
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Serial #", "Party Name", "Date", "Total", "Status", "Advance", "Balance"],
      ...bills.map(bill => [
        bill.serialNumber,
        `"${bill.partyName}"`,
        bill.date,
        Number(bill.total || 0),
        bill.status || "pending",
        Number(bill.advance || 0),
        Number(bill.balance || 0)
      ])
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bills_export.csv";
    link.click();
  };

  const handleBillClick = (billId) => {
    navigate(`/bill-view/${billId}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Bill Management</h1>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={exportToCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            Export CSV
          </button>
        </div>
      </div>

      {loading && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
          Loading bills...
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-200">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm">
              <th className="px-6 py-3 text-left font-semibold">Serial #</th>
              <th className="px-6 py-3 text-left font-semibold">Party Name</th>
              <th className="px-6 py-3 text-left font-semibold">Date</th>
              <th className="px-6 py-3 text-left font-semibold">Total</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Advance</th>
              <th className="px-6 py-3 text-left font-semibold">Balance</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill, index) => (
              <tr
                key={bill._id}
                onClick={() => handleBillClick(bill._id)}
                className={`border-t hover:bg-gray-100 transition-colors cursor-pointer ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="px-6 py-4 text-gray-800 font-medium">#{bill.serialNumber || "N/A"}</td>
                <td className="px-6 py-4 text-gray-800 font-medium">{bill.partyName || "Unknown"}</td>
                <td className="px-6 py-4 text-gray-600">{bill.date || "N/A"}</td>
                <td className="px-6 py-4 text-gray-800">
                  ₹{(Number(bill.total) || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(bill.status)}`}
                  >
                    {(bill.status || "pending").charAt(0).toUpperCase() + (bill.status || "pending").slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-800">
                  ₹{(Number(bill.advance) || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getBalanceColor(bill.balance)}`}
                  >
                    ₹{(Number(bill.balance) || 0).toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
            {bills.length === 0 && !loading && (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No bills found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BillList;