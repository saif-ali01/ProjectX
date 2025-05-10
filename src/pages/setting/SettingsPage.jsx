import React, { useState, useCallback } from "react";
import { Settings, Palette, List, User, LogOut, Check, X } from "lucide-react";
import { api } from "../../utils/api";

const Toast = ({ message, type, darkMode }) => {
  if (!message) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 px-5 py-3 rounded-lg shadow-xl text-white flex items-center gap-2 animate-slide-in ${
        type === "success"
          ? `${darkMode ? "bg-green-600/95" : "bg-green-500/95"}`
          : `${darkMode ? "bg-red-600/95" : "bg-red-500/95"}`
      }`}
    >
      {type === "success" ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {message}
    </div>
  );
};

const SettingsPage = ({ darkMode, setDarkMode }) => {
  const [settings, setSettings] = useState({
    reverseDataOrder: true,
    defaultPaginationLimit: 10,
    defaultWorkCategory: "Printing",
    defaultBillType: "Invoice",
    notificationsEnabled: true,
    notificationDuration: 3000,
  });
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), settings.notificationDuration);
  }, [settings.notificationDuration]);

  const handleSaveSettings = useCallback(async () => {
    try {
      setLoading(true);
      await api.post("/api/settings", settings);
      showToast("Settings saved successfully", "success");
    } catch (error) {
      console.error("Save settings error:", error.response?.data);
      showToast(error.response?.data?.message || "Failed to save settings", "error");
    } finally {
      setLoading(false);
    }
  }, [settings, showToast]);

  const handleUpdateProfile = useCallback(async () => {
    try {
      setLoading(true);
      await api.patch("/api/user/profile", userProfile);
      showToast("Profile updated successfully", "success");
    } catch (error) {
      console.error("Update profile error:", error.response?.data);
      showToast(error.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  }, [userProfile, showToast]);

  const handleLogout = useCallback(() => {
    showToast("Logged out successfully", "success");
    // Implement logout logic (e.g., clear auth token, redirect to login)
  }, [showToast]);

  return (
    <div className={`min-h-screen relative ${darkMode ? "dark" : ""}`}>
      <div
        className={`absolute inset-0 h-1/4 bg-gradient-to-r ${
          darkMode ? "from-gray-800 to-gray-900" : "from-blue-400 to-cyan-300"
        }`}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`${darkMode ? "bg-gray-800/95" : "bg-white"} backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>
                Customize your ProjectX experience
              </p>
            </div>
            <button
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              disabled={loading}
            >
              <Check className="w-5 h-5" />
              Save Settings
            </button>
          </div>

          {/* Appearance Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Palette className="w-5 h-5" /> Appearance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-700 dark:text-gray-300">Dark Mode</label>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2.5 rounded-xl ${darkMode ? "bg-gray-700" : "bg-gray-100"} hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
                >
                  {darkMode ? "🌞" : "🌙"}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-gray-700 dark:text-gray-300">Primary Color</label>
                <select
                  value={settings.primaryColor || "blue"}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className={`px-4 py-2.5 rounded-lg border ${
                    darkMode ? "border-gray-700 bg-gray-700/50 text-gray-100" : "border-gray-200 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={loading}
                >
                  <option value="blue">Blue</option>
                  <option value="purple">Purple</option>
                  <option value="green">Green</option>
                </select>
              </div>
            </div>
          </div>

          {/* Work Preferences Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <List className="w-5 h-5" /> Work Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-700 dark:text-gray-300">Reverse Data Order</label>
                <input
                  type="checkbox"
                  checked={settings.reverseDataOrder}
                  onChange={(e) => setSettings({ ...settings, reverseDataOrder: e.target.checked })}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-gray-700 dark:text-gray-300">Default Pagination Limit</label>
                <select
                  value={settings.defaultPaginationLimit}
                  onChange={(e) => setSettings({ ...settings, defaultPaginationLimit: Number(e.target.value) })}
                  className={`px-4 py-2.5 rounded-lg border ${
                    darkMode ? "border-gray-700 bg-gray-700/50 text-gray-100" : "border-gray-200 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={loading}
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-gray-700 dark:text-gray-300">Default Work Category</label>
                <select
                  value={settings.defaultWorkCategory}
                  onChange={(e) => setSettings({ ...settings, defaultWorkCategory: e.target.value })}
                  className={`px-4 py-2.5 rounded-lg border ${
                    darkMode ? "border-gray-700 bg-gray-700/50 text-gray-100" : "border-gray-200 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={loading}
                >
                  <option value="Printing">Printing</option>
                  <option value="Binding">Binding</option>
                  <option value="Paper">Paper</option>
                  <option value="Labor">Labor</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-gray-700 dark:text-gray-300">Default Bill Type</label>
                <select
                  value={settings.defaultBillType}
                  onChange={(e) => setSettings({ ...settings, defaultBillType: e.target.value })}
                  className={`px-4 py-2.5 rounded-lg border ${
                    darkMode ? "border-gray-700 bg-gray-700/50 text-gray-100" : "border-gray-200 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={loading}
                >
                  <option value="Invoice">Invoice</option>
                  <option value="Receipt">Receipt</option>
                  <option value="Estimate">Estimate</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <User className="w-5 h-5" /> Account
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                  className={`px-4 py-2.5 rounded-lg border ${
                    darkMode ? "border-gray-700 bg-gray-700/50 text-gray-100" : "border-gray-200 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                  className={`px-4 py-2.5 rounded-lg border ${
                    darkMode ? "border-gray-700 bg-gray-700/50 text-gray-100" : "border-gray-200 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={loading}
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleUpdateProfile}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
                  disabled={loading}
                >
                  <Check className="w-5 h-5" />
                  Update Profile
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
                  disabled={loading}
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </div>
            </div>
          </div>

          <Toast message={toast?.message} type={toast?.type} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;