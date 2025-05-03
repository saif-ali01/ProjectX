import React, { useState, useEffect, Component } from "react";
import { Users, Search, Plus, Trash2 } from "lucide-react";
import Toast from "../../components/common/Toast";
import { api } from "../../utils/api";
import { useNavigate } from "react-router-dom";

// Error Boundary Class Component
class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error: error.message || "An unexpected error occurred" };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in Clients:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      const { darkMode } = this.props;
      return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700"}`}>
            <h2 className={`text-lg font-semibold mb-3 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Error Loading Clients</h2>
            <p className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{this.state.error}</p>
            <button
              onClick={() => window.location.href = "/"}
              className={`px-4 py-2 rounded-lg hover:scale-105 transition-colors ${darkMode ? "bg-gray-700 text-gray-100 hover:bg-gray-600" : "bg-gray-200 text-gray-900 hover:bg-gray-300"}`}
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Clients = ({ darkMode }) => {
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setToast(null);
        const response = await api.get("/api/clients", {
          params: { search: searchTerm },
          withCredentials: true,
        });
        const { clients = [] } = response.data.data || {};
        setClients(Array.isArray(clients) ? clients : []);
      } catch (err) {
        if (err.response?.status === 401) {
          setToast({
            message: "Please sign in to view clients.",
            type: "error",
            autoClose: 5000,
          });
          navigate("/signup?error=unauthenticated");
        } else {
          const errorMessage = err.response?.data?.message || "Failed to fetch clients. Please try again.";
          setToast({
            message: errorMessage,
            type: "error",
            autoClose: 5000,
          });
          console.error("Error fetching clients:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [searchTerm, navigate]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email || !newClient.phone) {
      setToast({ message: "Please fill all fields", type: "error", autoClose: 3000 });
      return;
    }
    try {
      const response = await api.post("/api/clients", newClient, { withCredentials: true });
      setClients((prev) => [...prev, response.data.data]);
      setNewClient({ name: "", email: "", phone: "" });
      setShowAddForm(false);
      setToast({ message: "Client added successfully", type: "success", autoClose: 3000 });
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to add client. Please try again.";
      setToast({ message: errorMessage, type: "error", autoClose: 3000 });
      console.error("Error adding client:", err);
    }
  };

  const handleDeleteClient = async (id) => {
    try {
      await api.delete(`/api/clients/${id}`, { withCredentials: true });
      setClients((prev) => prev.filter((client) => client.id !== id));
      setToast({ message: "Client deleted successfully", type: "success", autoClose: 3000 });
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to delete client. Please try again.";
      setToast({ message: errorMessage, type: "error", autoClose: 3000 });
      console.error("Error deleting client:", err);
    }
  };

  return (
    <ErrorBoundary darkMode={darkMode}>
      <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
            <h1
              className={`text-xl sm:text-2xl lg:text-3xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"} mb-4 sm:mb-0`}
            >
              Client Management
            </h1>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full sm:w-auto">
              <div className="relative w-full sm:w-56 lg:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className={`w-full pl-9 sm:pl-10 p-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300 ${
                    darkMode
                      ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-600"
                  }`}
                  aria-label="Search clients by name or email"
                />
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors hover:scale-105 shadow-md flex items-center`}
                aria-label="Add new client"
              >
                <Plus className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" /> Add Client
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div
              className={`mb-6 p-4 rounded-lg animate-pulse ${
                darkMode ? "bg-blue-800 text-blue-100" : "bg-blue-100 text-blue-800"
              }`}
            >
              Loading clients...
            </div>
          )}

          {/* Clients Table */}
          <div
            className={`overflow-x-auto rounded-lg shadow-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
          >
            <table className="min-w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-left font-semibold rounded-tl-lg">Name</th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-left font-semibold">Email</th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-left font-semibold">Phone</th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-left font-semibold rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client, index) => (
                  <tr
                    key={client.id}
                    className={`border-t transition-colors ${darkMode ? "border-gray-700 text-gray-100 hover:bg-gray-700/50" : "border-gray-200 text-gray-900 hover:bg-gray-50"} ${index % 2 === 0 ? "" : darkMode ? "bg-gray-800/50" : "bg-gray-50/50"}`}
                  >
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-medium">{client.name}</td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 dark:text-gray-400">{client.email}</td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 dark:text-gray-400">{client.phone}</td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client.id);
                        }}
                        className={`text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300`}
                        aria-label={`Delete ${client.name}`}
                      >
                        <Trash2 className="w-4 sm:w-5 h-4 sm:h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && !loading && (
                  <tr className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    <td colSpan="4" className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-sm sm:text-base">
                      No clients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add Client Form */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto">
              <div
                className={`rounded-2xl shadow-md p-4 sm:p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} animate-fade-in w-full max-w-md sm:max-w-lg`}
              >
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Add New Client</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className={`w-full p-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300 ${
                      darkMode
                        ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-600"
                    }`}
                    placeholder="Enter name"
                    aria-label="Client name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className={`w-full p-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300 ${
                      darkMode
                        ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-600"
                    }`}
                    placeholder="Enter email"
                    aria-label="Client email"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className={`w-full p-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300 ${
                      darkMode
                        ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-600"
                    }`}
                    placeholder="Enter phone"
                    aria-label="Client phone"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={`px-4 py-2 text-sm sm:text-base rounded-lg hover:scale-105 transition-colors ${
                      darkMode ? "bg-gray-700 text-gray-100 hover:bg-gray-600" : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddClient}
                    className={`px-4 py-2 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors hover:scale-105 flex items-center`}
                  >
                    <Plus className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" /> Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notifications */}
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
              darkMode={darkMode}
              autoClose={toast.autoClose}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Clients;