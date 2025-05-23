import { BrowserRouter as Router, Routes, Route, Outlet, NavLink, useLocation, Navigate, useNavigate } from "react-router-dom";
import { FiHome, FiDollarSign, FiPieChart, FiFileText, FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import { useState, useEffect } from "react";
import { api } from "./utils/api";
import BillMaker from "./pages/Bill/BillMaker";
import BillSection from "./pages/Bill/BillList";
import Home from "./pages/Home";
import ViewBill from "./pages/Bill/ViewBill";
import InvoiceBill from "./pages/Bill/InvoiceBill";
import ChartPage from "./pages/chart/ChartPage";
import ExpenseDashboard from "./pages/expense/ExpenseDashboard";
import Reports from "./pages/reports/Reports";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ResetPassword from "./pages/auth/ResetPassword";
import Settings from "./pages/setting/Settings";
import Clients from "./pages/client/Clients";
import NotFound from "./pages/notfound/NotFound";
import Toast from "./components/common/Toast";
import AddWork from "./pages/addWork/AddWork";

// ProtectedRoute component to check authentication
const ProtectedRoute = ({ children, darkMode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/api/me");
        if (response.data.id) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        setIsAuthenticated(false);
        // Clear invalid cookies
        await api.post("/api/logout");
        setToast({
          message: "Session expired. Please login again.",
          type: "error",
          autoClose: 5000,
        });
      }
    };
    checkAuth();
  }, [location]);

  if (isAuthenticated === null) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} flex items-center justify-center`}>
        <div className={`p-4 rounded-lg animate-pulse ${darkMode ? "bg-blue-800 text-blue-100" : "bg-blue-100 text-blue-800"}`}>
          Checking authentication...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navigate to="/login" state={{ from: location, toast }} replace />
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
            darkMode={darkMode}
            autoClose={toast.autoClose}
          />
        )}
      </>
    );
  }

  return children;
};

// Layout component with responsive sidebar, mobile bottom navigation, and dark mode toggle
const Layout = ({ darkMode, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Navigation items
  const navigation = [
    { name: "Home", href: "/", icon: FiHome },
    { name: "Bills", href: "/bill-section", icon: FiFileText },
    { name: "Expenses", href: "/expenses", icon: FiDollarSign },
    { name: "Reports", href: "/reports", icon: FiPieChart },
    { name: "Charts", href: "/charts", icon: FiPieChart },
    { name: "Add Work", href: "/addwork", icon: FiFileText }, // Added Add Work
  ];

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsOpen(mobile ? false : true); // Close sidebar on mobile
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`flex min-h-screen w-full ${darkMode ? "bg-gray-900" : "bg-gray-50"} overflow-x-hidden`}>
      {/* Sidebar for tablet and larger screens */}
      {!isMobile && (
        <div
          className={`
            ${isOpen ? "w-64" : "w-16"}
            fixed inset-y-0 z-50 transition-all duration-300
            ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}
            border-r
          `}
        >
          <div className="flex flex-col h-full p-3 sm:p-4">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              {isOpen && (
                <h1 className={`text-lg sm:text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Star Printing
                </h1>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
              >
                {isOpen ? (
                  <FiX size={20} className={darkMode ? "text-white" : "text-gray-900"} />
                ) : (
                  <FiMenu size={20} className={darkMode ? "text-white" : "text-gray-900"} />
                )}
              </button>
            </div>

            <nav className="flex-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center p-2 sm:p-3 mb-1 sm:mb-2 rounded-lg transition-colors text-sm sm:text-base
                    ${isActive ? (darkMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600") :
                      darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"}`
                  }
                  aria-label={`Navigate to ${item.name}`}
                >
                  <item.icon className="flex-shrink-0 w-5 sm:w-6 h-5 sm:h-6" />
                  {isOpen && <span className="ml-2 sm:ml-3 truncate">{item.name}</span>}
                </NavLink>
              ))}
            </nav>

            <div className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"} pt-3 sm:pt-4`}>
              <button
                onClick={toggleDarkMode}
                className={`w-full flex items-center p-2 sm:p-3 rounded-lg text-sm sm:text-base transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <FiSun className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-400" />
                ) : (
                  <FiMoon className="w-5 sm:w-6 h-5 sm:h-6 text-gray-600" />
                )}
                {isOpen && (
                  <span className={`ml-2 sm:ml-3 ${darkMode ? "text-white" : "text-gray-700"}`}>
                    {darkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main
        className={`
          flex-1 transition-all duration-300
          ${isMobile ? "pb-16 pt-12" : (isOpen ? "ml-64" : "ml-16")}
          ${darkMode ? "bg-gray-900" : "bg-gray-50"}
          min-w-0 
        `}
      >
        <Outlet />
      </main>

      {/* Top-Right Dark Mode Toggle for Mobile */}
      {isMobile && (
        <button
          onClick={toggleDarkMode}
          className={`
            fixed top-4 right-4 z-50 p-2 rounded-full
            bg-gradient-to-r from-blue-500 to-indigo-600
            text-white shadow-md hover:from-blue-600 hover:to-indigo-700
            transition-colors duration-300
          `}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <FiSun className="w-5 h-5 text-yellow-400" />
          ) : (
            <FiMoon className="w-5 h-5 text-gray-200" />
          )}
        </button>
      )}

      {/* Bottom Navigation Bar for Mobile with Glassmorphism */}
      {isMobile && (
        <nav
          className={`
            fixed bottom-0 left-0 right-0 z-50
            ${darkMode ? "bg-gray-800/70 border-gray-700/50" : "bg-white/70 border-gray-200/50"}
            border-t backdrop-blur-md
            flex justify-around items-center py-2
          `}
          style={{ boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)" }}
        >
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex flex-col items-center p-2 rounded-lg transition-colors text-xs
                ${isActive ? (darkMode ? "text-blue-400" : "text-blue-600") :
                  darkMode ? "text-gray-300" : "text-gray-700"}`
              }
              aria-label={`Navigate to ${item.name}`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
};

// Main App component with routing and dark mode
function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true" ||
      (!localStorage.getItem("darkMode") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  // Sync dark mode with local storage
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <Router>
      <Routes>
        {/* Auth routes without sidebar */}
        <Route path="/login" element={<Login darkMode={darkMode} />} />
        <Route path="/signup" element={<Signup darkMode={darkMode} />} />
        <Route path="/reset-password" element={<ResetPassword darkMode={darkMode} />} />

        {/* Main routes with sidebar/bottom nav and authentication */}
        <Route element={<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
          <Route
            path="/"
            element={
              <ProtectedRoute darkMode={darkMode}>
                <Home darkMode={darkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute darkMode={darkMode}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute darkMode={darkMode}>
                <Clients darkMode={darkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/work"
            element={
              <ProtectedRoute darkMode={darkMode}>
                <AddWork darkMode={darkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-bill"
            element={
              <ProtectedRoute darkMode={darkMode}>
                <BillMaker darkMode={darkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bill-section"
            element={
              <ProtectedRoute darkMode={darkMode}>
                <BillSection darkMode={darkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bill-view/:id"
            element={
              <ProtectedRoute darkMode={darkMode}>
                <ViewBill darkMode={darkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoice"
            element={
              <ProtectedRoute darkMode={darkMode}>
                <InvoiceBill darkMode={darkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/charts"
            element={
              <ProtectedRoute darkMode={darkMode}>
                <ChartPage darkMode={darkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute darkMode={darkMode}>
                <ExpenseDashboard darkMode={darkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute darkMode={darkMode}>
                <Reports darkMode={darkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addwork"
            element={
              <ProtectedRoute darkMode={darkMode}>
                <AddWork darkMode={darkMode} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;