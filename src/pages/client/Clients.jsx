import React, { useState, Component } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Plus, Trash2, Moon, Sun } from "lucide-react";
import Toast from "../../components/common/Toast";

const Clients = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });
  const [clients, setClients] = useState([
    { id: 1, name: "Alice Smith", email: "alice@example.com", phone: "+91 98765 43210" },
    { id: 2, name: "Bob Johnson", email: "bob@example.com", phone: "+91 87654 32109" },
    { id: 3, name: "Charlie Brown", email: "charlie@example.com", phone: "+91 76543 21098" },
  ]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddClient = () => {
    if (!newClient.name || !newClient.email || !newClient.phone) {
      setToast({ message: "Please fill all fields", type: "error" });
      return;
    }
    setClients((prev) => [
      ...prev,
      { id: prev.length + 1, ...newClient },
    ]);
    setNewClient({ name: "", email: "", phone: "" });
    setShowAddForm(false);
    setToast({ message: "Client added successfully", type: "success" });
    // TODO: Replace with actual API call, e.g., api.post("/api/clients", newClient)
  };

  const handleDeleteClient = (id) => {
    setClients((prev) => prev.filter((client) => client.id !== id));
    setToast({ message: "Client deleted successfully", type: "success" });
    // TODO: Replace with actual API call, e.g., api.delete(`/api/clients/${id}`)
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        return (
          <div className="max-w-7xl mx-auto p-6">
            <div className="p-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-3">Error Loading Clients</h2>
              <p className="mb-4">{this.state.error}</p>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors hover:scale-105"
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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="rounded-2xl shadow-lg p-10 bg-white dark:bg-gray-800 mb-8 animate-fade-in border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Clients</h1>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  Manage your client list and contact details.
                </p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors hover:scale-105"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Client List
              </h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors hover:scale-105 flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" /> Add Client
                </button>
              </div>
            </div>
            {filteredClients.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="py-3 px-4 text-gray-900 dark:text-gray-100">Name</th>
                      <th className="py-3 px-4 text-gray-900 dark:text-gray-100">Email</th>
                      <th className="py-3 px-4 text-gray-900 dark:text-gray-100">Phone</th>
                      <th className="py-3 px-4 text-gray-900 dark:text-gray-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{client.name}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{client.email}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{client.phone}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            aria-label={`Delete ${client.name}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No clients found</p>
            )}
          </div>

          {/* Add Client Form */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700 animate-fade-in max-w-lg w-full">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Add New Client
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddClient}
                    className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors hover:scale-105 flex items-center"
                  >
                    <Plus className="w-5 h-5 mr-2" /> Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Clients;