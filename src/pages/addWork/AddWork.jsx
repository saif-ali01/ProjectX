import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Edit2, X } from "lucide-react";
import { api } from "../../utils/api";
import { format, parseISO } from "date-fns";
import Toast from "../../components/common/Toast";

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const typeColors = {
  Book: { light: "bg-blue-500 text-white", dark: "bg-blue-700 text-white" },
  Pad: { light: "bg-purple-500 text-white", dark: "bg-purple-700 text-white" },
  Tag: { light: "bg-pink-500 text-white", dark: "bg-pink-700 text-white" },
  Tog: { light: "bg-cyan-500 text-white", dark: "bg-cyan-700 text-white" },
};

const sizeColors = {
  "1/2": { light: "bg-sky-500 text-white", dark: "bg-sky-700 text-white" },
  "1/3": { light: "bg-emerald-500 text-white", dark: "bg-emerald-700 text-white" },
  "1/4": { light: "bg-teal-500 text-white", dark: "bg-teal-700 text-white" },
  "1/5": { light: "bg-amber-500 text-white", dark: "bg-amber-700 text-white" },
  "1/6": { light: "bg-lime-500 text-white", dark: "bg-lime-700 text-white" },
  "1/8": { light: "bg-green-500 text-white", dark: "bg-green-700 text-white" },
  "1/10": { light: "bg-yellow-500 text-white", dark: "bg-yellow-700 text-white" },
  "1/12": { light: "bg-orange-500 text-white", dark: "bg-orange-700 text-white" },
  "1/16": { light: "bg-red-500 text-white", dark: "bg-red-700 text-white" },
  A4: { light: "bg-indigo-500 text-white", dark: "bg-indigo-700 text-white" },
  Custom: { light: "bg-gray-500 text-white", dark: "bg-gray-700 text-white" },
};

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

const Modal = React.memo(({ isOpen, onClose, title, work, setWork, onSubmit, darkMode, clients, loading }) => {
  if (!isOpen) return null;

  const sizeOptions = [
    "1/2",
    "1/3",
    "1/4",
    "1/5",
    "1/6",
    "1/8",
    "1/10",
    "1/12",
    "1/16",
    "A4",
    "Custom",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        className={`${darkMode ? "dark" : ""} bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-[95vw] md:max-w-md shadow-2xl animate-fade-in`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Particulars"
              value={work.particulars}
              onChange={(e) => setWork({ ...work, particulars: e.target.value })}
              className="w-full p-2.5 text-sm border rounded-lg dark:bg-gray-700/90 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={work.type}
              onChange={(e) => setWork({ ...work, type: e.target.value })}
              className="w-full p-2.5 text-sm border rounded-lg dark:bg-gray-700/90 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(typeColors).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {work.sizeType === "custom" ? (
              <input
                type="text"
                placeholder="Custom Size (e.g., 5x7cm)"
                value={work.size}
                onChange={(e) => setWork({ ...work, size: e.target.value })}
                className="w-full p-2.5 text-sm border rounded-lg dark:bg-gray-700/90 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <select
                value={work.size}
                onChange={(e) => {
                  const value = e.target.value;
                  setWork({
                    ...work,
                    size: value,
                    sizeType: value === "Custom" ? "custom" : "predefined",
                  });
                }}
                className="w-full p-2.5 text-sm border rounded-lg dark:bg-gray-700/90 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sizeOptions.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            )}
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
              className="w-full p-2.5 text-sm border rounded-lg dark:bg-gray-700/90 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Party</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={work.dateAndTime ? format(parseISO(work.dateAndTime), "yyyy-MM-dd'T'HH:mm") : ""}
              onChange={(e) => setWork({ ...work, dateAndTime: new Date(e.target.value).toISOString() })}
              className="w-full p-2.5 text-sm border rounded-lg dark:bg-gray-700/90 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={work.quantity}
              onChange={(e) => setWork({ ...work, quantity: e.target.value })}
              className="w-full p-2.5 text-sm border rounded-lg dark:bg-gray-700/90 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Rate (INR)"
              value={work.rate}
              onChange={(e) => setWork({ ...work, rate: e.target.value })}
              className="w-full p-2.5 text-sm border rounded-lg dark:bg-gray-700/90 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value="INR"
              disabled
              className="w-full p-2.5 text-sm border rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-400 focus:outline-none"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={work.paid}
                onChange={(e) => setWork({ ...work, paid: e.target.checked })}
                className={`paid-checkbox ${work.paid ? "paid" : "unpaid"}`}
                disabled={loading}
              />
              <span className="text-sm text-gray-900 dark:text-gray-200">Paid</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors duration-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : title === "Add Work" ? (
              <Plus className="w-5 h-5" />
            ) : (
              <Edit2 className="w-5 h-5" />
            )}
            {title === "Add Work" ? "Add" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
});

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
  const debouncedSearch = useDebounce(search, 500);
  const [filterType, setFilterType] = useState("All");
  const [filterPaid, setFilterPaid] = useState("All");
  const [sortBy, setSortBy] = useState("-dateAndTime");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newWork, setNewWork] = useState({
    particulars: "",
    type: "Book",
    size: "1/4",
    sizeType: "predefined",
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
  const searchInputRef = useRef(null);

  const fetchWorks = useCallback(async () => {
    try {
      setLoading(true);
      const paidParam = filterPaid === "Paid" ? true : filterPaid === "Unpaid" ? false : undefined;
      const response = await api.get("/api/works", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch,
          type: filterType === "All" ? undefined : filterType,
          paid: paidParam,
          sort: sortBy || undefined,
        },
      });
      setPagination(response.data.data);
    } catch (error) {
      console.error("Fetch works error:", error.response?.data);
      setToast({
        message: error.response?.data?.message || "Failed to fetch works. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, filterType, filterPaid, sortBy]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/clients");
        setClients(response.data.data.clients || []);
      } catch (error) {
        console.error("Fetch clients error:", error.response?.data);
        setToast({
          message: error.response?.data?.message || "Failed to fetch clients. Please try again.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  useEffect(() => {
    const handlePopState = () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const calculateSrNo = (index) => {
    return (pagination.page - 1) * pagination.limit + index + 1;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
  }, []);

  const validateWork = useCallback(
    (work) => {
      const requiredFields = ["particulars", "partyId", "quantity", "rate", "dateAndTime"];
      const missingFields = requiredFields.filter((field) => !work[field]);
      if (missingFields.length > 0) {
        showToast("Please fill all required fields", "error");
        return false;
      }
      if (!work.size || (work.sizeType === "custom" && work.size.trim() === "")) {
        showToast("Size must be specified", "error");
        return false;
      }
      if (isNaN(work.quantity) || work.quantity <= 0) {
        showToast("Quantity must be a valid number greater than 0", "error");
        return false;
      }
      if (isNaN(work.rate) || work.rate <= 0) {
        showToast("Rate must be a valid number greater than 0", "error");
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
          sizeType: "predefined",
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
        showToast(error.response?.data?.message || "Failed to add work. Please try again.", "error");
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
          .table-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            border-radius: 0.75rem;
            border: 1px solid ${darkMode ? "#374151" : "#e5e7eb"};
            width: 100%;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: auto;
          }
          th, td {
            padding: 0.5rem 0.75rem;
            text-align: left;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          th {
            font-weight: 600;
            font-size: 0.875rem;
            background-color: ${darkMode ? "#1f2937" : "#f9fafb"};
          }
          td {
            font-size: 0.875rem;
          }
          /* Responsive adjustments */
          @media (max-width: 1024px) {
            th, td {
              padding: 0.5rem;
              font-size: 0.75rem;
            }
          }
          @media (max-width: 640px) {
            .table-container {
              display: block;
            }
            table {
              display: block;
              overflow-x: auto;
            }
            thead {
              display: none;
            }
            tbody, tr, td {
              display: block;
              width: 100%;
            }
            tr {
              border-bottom: 1px solid ${darkMode ? "#374151" : "#e5e7eb"};
              margin-bottom: 1rem;
              padding: 0.5rem 0;
            }
            td {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.5rem 1rem;
              font-size: 0.875rem;
              text-align: right;
              position: relative;
              border-bottom: 1px solid ${darkMode ? "#374151" : "#e5e7eb"};
            }
            td::before {
              content: attr(data-label);
              font-weight: 600;
              text-align: left;
              flex: 1;
              color: ${darkMode ? "#d1d5db" : "#374151"};
            }
            td:last-child {
              border-bottom: none;
            }
            .actions-cell {
              display: flex;
              justify-content: flex-end;
              gap: 0.5rem;
            }
            .actions-cell::before {
              content: none;
            }
          }
        `}
      </style>
      <div
        className={`absolute inset-0 h-1/3 sm:h-1/4 bg-gradient-to-r ${
          darkMode ? "from-blue-900 to-blue-950" : "from-blue-500 to-blue-700"
        }`}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className={`${darkMode ? "bg-gray-800/95" : "bg-white"} backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Work Management
              </h1>
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm mt-1`}>
                {pagination.totalDocs} entries • Page {pagination.page} of {pagination.totalPages}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
              disabled={loading}
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Work</span>
            </button>
          </div>

          <div className="flex flex-col gap-4 mb-6">
            <input
              key="search-input"
              ref={searchInputRef}
              type="text"
              placeholder="Search by party or particulars..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm ${
                darkMode ? "border-gray-700 bg-gray-700/50 text-gray-100" : "border-gray-200 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={loading}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  darkMode ? "border-gray-700 bg-gray-700/50 text-gray-100" : "border-gray-200 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="All">All Types</option>
                {Object.keys(typeColors).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={filterPaid}
                onChange={(e) => setFilterPaid(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  darkMode ? "border-gray-700 bg-gray-700/50 text-gray-100" : "border-gray-200 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="All">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  darkMode ? "border-gray-700 bg-gray-700/50 text-gray-100" : "border-gray-200 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="-dateAndTime">Newest First</option>
                <option value="dateAndTime">Oldest First</option>
                <option value="quantity">Quantity ↑</option>
                <option value="-quantity">Quantity ↓</option>
                <option value="rate">Rate ↑</option>
                <option value="-rate">Rate ↓</option>
                <option value="total">Total ↑</option>
                <option value="-total">Total ↓</option>
              </select>

              <select
                value={pagination.limit}
                onChange={(e) => setPagination((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  darkMode ? "border-gray-700 bg-gray-700/50 text-gray-100" : "border-gray-200 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value={10}>10/page</option>
                <option value={25}>25/page</option>
                <option value={50}>50/page</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {["Sr No.", "Particulars", "Type", "Size", "Party", "Date & Time", "Quantity", "Rate", "Total", "Paid", "Actions"].map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagination.docs.map((row, index) => (
                  <tr key={row.id}>
                    <td data-label="Sr No." className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {calculateSrNo(index)}
                    </td>
                    <td data-label="Particulars" className={`${darkMode ? "text-gray-200" : "text-gray-900"} font-medium`}>
                      {row.particulars}
                    </td>
                    <td data-label="Type">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          darkMode ? typeColors[row.type].dark : typeColors[row.type].light
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td data-label="Size">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          sizeColors[row.size]
                            ? darkMode
                              ? sizeColors[row.size].dark
                              : sizeColors[row.size].light
                            : darkMode
                            ? sizeColors["Custom"].dark
                            : sizeColors["Custom"].light
                        }`}
                      >
                        {row.size}
                      </span>
                    </td>
                    <td data-label="Party" className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>{row.party}</td>
                    <td data-label="Date & Time" className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {format(parseISO(row.dateAndTime), "dd MMM yyyy, hh:mm a")}
                    </td>
                    <td data-label="Quantity" className={`${darkMode ? "text-gray-200" : "text-gray-900"}`}>{row.quantity}</td>
                    <td data-label="Rate" className={`${darkMode ? "text-gray-200" : "text-gray-900"}`}>
                      {inrFormatter.format(row.rate)}
                    </td>
                    <td data-label="Total" className={`font-semibold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                      {inrFormatter.format(row.quantity * row.rate)}
                    </td>
                    <td data-label="Paid">
                      <span
                        className={`px-3 py-1 rounded-full text-xs cursor-pointer ${
                          row.paid ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        }`}
                        onClick={() => handleTogglePaid(row.id, row.paid)}
                      >
                        {row.paid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td data-label="Actions" className="actions-cell">
                      <button
                        onClick={() => {
                          setUpdateWork({
                            ...row,
                            sizeType: sizeColors[row.size] ? "predefined" : "custom",
                          });
                          setShowUpdateModal(true);
                        }}
                        className={`p-1.5 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 rounded-lg ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                        disabled={loading}
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteWork(row.id)}
                        className={`p-1.5 hover:bg-red-100/50 dark:hover:bg-red-900/20 rounded-lg ${
                          darkMode ? "text-red-400" : "text-red-600"
                        }`}
                        disabled={loading}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {pagination.docs.length === 0 && (
                  <tr>
                    <td colSpan="11" className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {loading ? "Loading..." : "No records found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center sm:justify-between items-center mt-6 gap-4">
            <div className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.totalDocs)} of {pagination.totalDocs} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className={`px-4 py-2 text-sm rounded-lg ${
                  pagination.hasPrevPage
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className={`px-4 py-2 text-sm rounded-lg ${
                  pagination.hasNextPage
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
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
          work={updateWork || newWork}
          setWork={setUpdateWork}
          onSubmit={handleUpdateWork}
          darkMode={darkMode}
          clients={clients}
          loading={loading}
        />

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

export default AddWork;