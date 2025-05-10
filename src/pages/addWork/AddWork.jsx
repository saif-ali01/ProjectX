import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit2, X } from "lucide-react";
import { api } from "../../utils/api";
import { format, parseISO } from "date-fns";

const typeColors = {
  Book: { light: "bg-blue-100 text-blue-800", dark: "bg-blue-800/80 text-blue-100" },
  Pad: { light: "bg-purple-100 text-purple-800", dark: "bg-purple-800/80 text-purple-100" },
  Tag: { light: "bg-pink-100 text-pink-800", dark: "bg-pink-800/80 text-pink-100" },
  Tog: { light: "bg-cyan-100 text-cyan-800", dark: "bg-cyan-800/80 text-cyan-100" },
};

const sizeColors = {
  "1/4": { light: "bg-teal-100 text-teal-800", dark: "bg-teal-800/80 text-teal-100" },
  "1/3": { light: "bg-emerald-100 text-emerald-800", dark: "bg-emerald-800/80 text-emerald-100" },
  "1/5": { light: "bg-amber-100 text-amber-800", dark: "bg-amber-800/80 text-amber-100" },
  "1/2": { light: "bg-sky-100 text-sky-800", dark: "bg-sky-800/80 text-sky-100" },
};

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

const Modal = React.memo(({ isOpen, onClose, title, work, setWork, onSubmit, darkMode, clients, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        className={`${darkMode ? "dark" : ""} bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-[90vw] sm:max-w-md shadow-2xl animate-fade-in`}
      >
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 sm:w-6 h-5 sm:h-6" />
          </button>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Particulars"
              value={work.particulars}
              onChange={(e) => setWork({ ...work, particulars: e.target.value })}
              className="w-full p-2 sm:p-2.5 text-sm sm:text-base border rounded-lg dark:bg-gray-700/90 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={work.type}
              onChange={(e) => setWork({ ...work, type: e.target.value })}
              className="w-full p-2 sm:p-2.5 text-sm sm:text-base border rounded-lg dark:bg-gray-700/90 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(typeColors).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={work.size}
              onChange={(e) => setWork({ ...work, size: e.target.value })}
              className="w-full p-2 sm:p-2.5 text-sm sm:text-base border rounded-lg dark:bg-gray-700/90 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(sizeColors).map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <select
              value={work.partyId}
              onChange={(e) => {
                const selectedClient = clients.find((client) => client.id === e.target.value);
                setWork({
                  ...work,
                  partyId: e.target.value,
                  party: selectedClient ? selectedClient.name : "",
                });
              }}
              className="w-full p-2 sm:p-2.5 text-sm sm:text-base border rounded-lg dark:bg-gray-700/90 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Party</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={work.dateAndTime ? format(parseISO(work.dateAndTime), "yyyy-MM-dd'T'HH:mm") : ""}
              onChange={(e) => setWork({ ...work, dateAndTime: new Date(e.target.value).toISOString() })}
              className="w-full p-2 sm:p-2.5 text-sm sm:text-base border rounded-lg dark:bg-gray-700/90 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={work.quantity}
              onChange={(e) => setWork({ ...work, quantity: e.target.value })}
              className="w-full p-2 sm:p-2.5 text-sm sm:text-base border rounded-lg dark:bg-gray-700/90 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Rate (INR)"
              value={work.rate}
              onChange={(e) => setWork({ ...work, rate: e.target.value })}
              className="w-full p-2 sm:p-2.5 text-sm sm:text-base border rounded-lg dark:bg-gray-700/90 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value="INR"
              disabled
              className="w-full p-2 sm:p-2.5 text-sm sm:text-base border rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-400 focus:outline-none"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={work.paid}
                onChange={(e) => setWork({ ...work, paid: e.target.checked })}
                className={`paid-checkbox ${work.paid ? "paid" : "unpaid"}`}
                disabled={loading}
              />
              <span className="text-sm sm:text-base text-gray-900 dark:text-gray-200">Paid</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
          <button
            onClick={onClose}
            className="px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors duration-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <svg className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : title === "Add Work" ? (
              <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
            ) : (
              <Edit2 className="w-4 sm:w-5 h-4 sm:h-5" />
            )}
            {title === "Add Work" ? "Add" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
});

const Toast = ({ message, type, darkMode }) => {
  if (!message) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 sm:px-5 sm:py-3 rounded-lg shadow-xl text-white flex items-center gap-2 animate-slide-in text-sm sm:text-base ${
        type === "success"
          ? `${darkMode ? "bg-green-600/95" : "bg-green-500/95"}`
          : `${darkMode ? "bg-red-600/95" : "bg-red-500/95"}`
      }`}
    >
      {type === "success" ? (
        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {message}
    </div>
  );
};

const AddWork = ({ darkMode }) => {
  const [pagination, setPagination] = useState({
    docs: [],
    totalDocs: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasPrevPage: false,
    hasNextPage: false,
  });
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [sortBy, setSortBy] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newWork, setNewWork] = useState({
    particulars: "",
    type: "Book",
    size: "1/4",
    party: "",
    partyId: "",
    dateAndTime: new Date().toISOString(),
    quantity: "",
    rate: "",
    currency: "INR",
    paid: false,
  });
  const [updateWork, setUpdateWork] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWorks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/works", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search,
          type: filterType === "All" ? undefined : filterType,
          sort: sortBy || undefined,
        },
      });
      setPagination(response.data.data);
    } catch (error) {
      console.error("Fetch works error:", error.response?.data);
      showToast(error.response?.data?.message || "Failed to fetch works. Please try again.", "error");
      setPagination((prev) => ({ ...prev, docs: [] }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filterType, sortBy]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/clients");
        setClients(response.data.data.clients || []);
      } catch (error) {
        console.error("Fetch clients error:", error.response?.data);
        showToast(error.response?.data?.message || "Failed to fetch clients. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const calculateSrNo = (index) => {
    return (pagination.page - 1) * pagination.limit + (pagination.docs.length - index);
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const validateWork = useCallback(
    (work) => {
      if (!work.particulars || !work.partyId || !work.quantity || !work.rate || !work.dateAndTime) {
        showToast("Please fill all required fields", "error");
        return false;
      }
      if (isNaN(work.quantity) || work.quantity <= 0) {
        showToast("Quantity must be a positive number", "error");
        return false;
      }
      if (isNaN(work.rate) || work.rate <= 0) {
        showToast("Rate must be a positive number", "error");
        return false;
      }
      if (work.currency !== "INR") {
        showToast("Currency must be INR", "error");
        return false;
      }
      return true;
    },
    [showToast]
  );

  const handleAddWork = useCallback(
    async () => {
      if (!validateWork(newWork)) return;
      try {
        setLoading(true);
        await api.post("/api/works", {
          ...newWork,
          quantity: parseInt(newWork.quantity),
          rate: parseFloat(newWork.rate),
          paid: newWork.paid,
        });
        setPagination((prev) => ({ ...prev, page: 1 }));
        await fetchWorks();
        showToast("Work added successfully", "success");
        setShowAddModal(false);
        setNewWork({
          particulars: "",
          type: "Book",
          size: "1/4",
          party: "",
          partyId: "",
          dateAndTime: new Date().toISOString(),
          quantity: "",
          rate: "",
          currency: "INR",
          paid: false,
        });
      } catch (error) {
        console.error("Add work error:", error.response?.data);
        const message = error.response?.data?.message || "Failed to add work. Please try again.";
        if (message.includes("Party not found")) {
          showToast("Party not found. Please create the party first.", "error");
        } else {
          showToast(message, "error");
        }
      } finally {
        setLoading(false);
      }
    },
    [newWork, validateWork, showToast, fetchWorks]
  );

  const handleUpdateWork = useCallback(
    async () => {
      if (!validateWork(updateWork)) return;
      try {
        setLoading(true);
        await api.patch(`/api/works/${updateWork.id}`, {
          ...updateWork,
          quantity: parseInt(updateWork.quantity),
          rate: parseFloat(updateWork.rate),
          paid: updateWork.paid,
        });
        await fetchWorks();
        showToast("Work updated successfully", "success");
        setShowUpdateModal(false);
        setUpdateWork(null);
      } catch (error) {
        console.error("Update work error:", error.response?.data);
        showToast(error.response?.data?.message || "Failed to update work. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    },
    [updateWork, validateWork, showToast, fetchWorks]
  );

  const handleDeleteWork = useCallback(
    async (id) => {
      if (window.confirm("Are you sure you want to delete this work?")) {
        try {
          setLoading(true);
          await api.delete(`/api/works/${id}`);
          await fetchWorks();
          showToast("Work deleted successfully", "success");
        } catch (error) {
          console.error("Delete work error:", error.response?.data);
          showToast(error.response?.data?.message || "Failed to delete work. Please try again.", "error");
        } finally {
          setLoading(false);
        }
      }
    },
    [showToast, fetchWorks]
  );

  const handleTogglePaid = useCallback(
    async (id, currentPaid) => {
      try {
        setLoading(true);
        await api.patch(`/api/works/${id}`, { paid: !currentPaid });
        await fetchWorks();
        showToast(`Work marked as ${!currentPaid ? "paid" : "unpaid"}`, "success");
      } catch (error) {
        console.error("Toggle paid error:", error.response?.data);
        showToast(error.response?.data?.message || "Failed to update paid status. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast, fetchWorks]
  );

  return (
    <div className={`min-h-screen relative ${darkMode ? "dark" : ""}`}>
      <style>
        {`
          .paid-checkbox {
            appearance: none;
            width: 1.1rem;
            height: 1.1rem;
            position: relative;
            display: inline-block;
            vertical-align: middle;
            cursor: pointer;
          }
          .paid-checkbox.unpaid {
            border: 2px solid red;
            border-radius: 4px;
            background-color: transparent;
          }
          .paid-checkbox.paid {
            border: none;
            background: none;
          }
          .paid-checkbox.paid::after {
            content: "✔";
            color: green;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 1rem;
          }
          .paid-checkbox:disabled {
            cursor: not-allowed;
            opacity: 0.5;
          }
          .sticky-column {
            position: sticky;
            z-index: 1;
            background: inherit;
          }
          .sticky-column.sr-no {
            left: 0;
            min-width: 60px;
            width: 60px;
          }
          .sticky-column.particulars {
            left: 60px;
            min-width: 120px;
            width: 120px;
          }
          @media (min-width: 640px) {
            .sticky-column.sr-no {
              min-width: 80px;
              width: 80px;
            }
            .sticky-column.particulars {
              left: 80px;
              min-width: 150px;
              width: 150px;
            }
          }
          .table-container {
            position: relative;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        `}
      </style>
      <div
        className={`absolute inset-0 h-1/3 sm:h-1/4 bg-gradient-to-r ${
          darkMode ? "from-gray-800 to-gray-900" : "from-blue-400 to-cyan-300"
        }`}
      ></div>

      <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className={`${darkMode ? "bg-gray-800/95" : "bg-white"} backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Work Management
              </h1>
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs sm:text-sm`}>
                {pagination.totalDocs} entries found • Page {pagination.page} of {pagination.totalPages}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                disabled={loading}
              >
                <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="hidden sm:inline">Add Work</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <input
              type="text"
              placeholder="Search by party or particulars..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-sm sm:text-base ${
                darkMode ? "border-gray-700 bg-gray-700/50 text-gray-100" : "border-gray-200 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
              disabled={loading}
            />

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`flex-1 min-w-[120px] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-sm sm:text-base ${
                  darkMode ? "border-gray-700 bg-gray-700/50 text-gray-100" : "border-gray-200 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
                disabled={loading}
              >
                <option value="All">All Types</option>
                {Object.keys(typeColors).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`flex-1 min-w-[120px] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-sm sm:text-base ${
                  darkMode ? "border-gray-700 bg-gray-700/50 text-gray-100" : "border-gray-200 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
                disabled={loading}
              >
                <option value="">Sort By</option>
                <option value="quantity">Quantity</option>
                <option value="rate">Rate</option>
                <option value="total">Total</option>
              </select>
              <select
                value={pagination.limit}
                onChange={(e) => setPagination((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                className={`flex-1 min-w-[120px] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-sm sm:text-base ${
                  darkMode ? "border-gray-700 bg-gray-700/50 text-gray-100" : "border-gray-200 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>

          <div className={`table-container rounded-xl shadow border ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
            <table className="w-full text-xs sm:text-sm border-collapse">
              <thead className={`${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                <tr>
                  {[
                    { label: "Sr No.", className: "sticky-column sr-no" },
                    { label: "Particulars", className: "sticky-column particulars" },
                    { label: "Type", className: "" },
                    { label: "Size", className: "" },
                    { label: "Party", className: "" },
                    { label: "Date & Time", className: "" },
                    { label: "Quantity", className: "" },
                    { label: "Rate", className: "" },
                    { label: "Total", className: "" },
                    { label: "Paid", className: "" },
                    { label: "Actions", className: "" },
                  ].map((header) => (
                    <th
                      key={header.label}
                      className={`p-2 sm:pfes-3 text-left font-semibold border-b ${
                        darkMode ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-700"
                      } ${header.className}`}
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {pagination.docs.slice().reverse().map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b ${darkMode ? "border-gray-700 hover:bg-gray-700/30" : "border-gray-200 hover:bg-gray-100"}`}
                  >
                    <td
                      className={`p-2 sm:p-3 sticky-column sr-no ${darkMode ? "text-gray-400 bg-gray-800/95" : "text-gray-600 bg-white"}`}
                    >
                      {calculateSrNo(index)}
                    </td>
                    <td
                      className={`p-2 sm:p-3 sticky-column particulars font-medium ${
                        darkMode ? "text-gray-200 bg-gray-800/95" : "text-gray-900 bg-white"
                      }`}
                    >
                      {row.particulars}
                    </td>
                    <td className="p-2 sm:p-3">
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                          darkMode ? typeColors[row.type].dark : typeColors[row.type].light
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3">
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                          darkMode ? sizeColors[row.size].dark : sizeColors[row.size].light
                        }`}
                      >
                        {row.size}
                      </span>
                    </td>
                    <td className={`p-2 sm:p-3 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{row.party}</td>
                    <td className={`p-2 sm:p-3 ${darkMode ? "text-gray-400" : "text-gray-600"} whitespace-nowrap`}>
                      {format(parseISO(row.dateAndTime), "dd MMM yyyy, hh:mm a")}
                    </td>
                    <td className={`p-2 sm:p-3 ${darkMode ? "text-gray-200" : "text-gray-900"}`}>{row.quantity}</td>
                    <td className={`p-2 sm:p-3 ${darkMode ? "text-gray-200" : "text-gray-900"}`}>
                      {inrFormatter.format(row.rate)}
                    </td>
                    <td
                      className={`p-2 sm:p-3 font-semibold ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                    >
                      {inrFormatter.format(row.quantity * row.rate)}
                    </td>
                    <td className="p-2 sm:p-3 text-center">
                      <input
                        type="checkbox"
                        checked={row.paid}
                        onChange={() => handleTogglePaid(row.id, row.paid)}
                        className={`paid-checkbox ${row.paid ? "paid" : "unpaid"}`}
                        disabled={loading}
                      />
                    </td>
                    <td className="p-2 sm:p-3 flex gap-1 sm:gap-2">
                      <button
                        onClick={() => {
                          setUpdateWork(row);
                          setShowUpdateModal(true);
                        }}
                        className={`p-1 sm:p-1.5 rounded-lg hover:bg-blue-100/50 ${
                          darkMode
                            ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                            : "text-blue-600 hover:text-blue-700"
                        }`}
                        disabled={loading}
                      >
                        <Edit2 className="w-4 sm:w-5 h-4 sm:h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteWork(row.id)}
                        className={`p-1 sm:p-1.5 rounded-lg hover:bg-red-100/50 ${
                          darkMode
                            ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            : "text-red-600 hover:text-red-700"
                        }`}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 sm:w-5 h-4 sm:h-5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {pagination.docs.length === 0 && (
                  <tr>
                    <td
                      colSpan="11"
                      className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {loading ? "Loading..." : "No matching records found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6 gap-3">
            <button
              onClick={handlePrevPage}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                pagination.hasPrevPage
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!pagination.hasPrevPage || loading}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                pagination.hasNextPage
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!pagination.hasNextPage || loading}
            >
              Next
            </button>
          </div>
        </div>

        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Work"
          work={newWork}
          setWork={setNewWork}
          onSubmit={handleAddWork}
          darkMode={darkMode}
          clients={clients}
          loading={loading}
        />
        <Modal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setUpdateWork(null);
          }}
          title="Update Work"
          work={
            updateWork || {
              particulars: "",
              type: "Book",
              size: "1/4",
              party: "",
              partyId: "",
              dateAndTime: new Date().toISOString(),
              quantity: "",
              rate: "",
              currency: "INR",
              paid: false,
            }
          }
          setWork={setUpdateWork}
          onSubmit={handleUpdateWork}
          darkMode={darkMode}
          clients={clients}
          loading={loading}
        />

        <Toast message={toast?.message} type={toast?.type} darkMode={darkMode} />
      </div>
    </div>
  );
};

export default AddWork;