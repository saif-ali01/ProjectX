import { BrowserRouter as Router, Routes, Route, Outlet, NavLink, useLocation } from "react-router-dom";
import { FiHome, FiDollarSign, FiPieChart, FiFileText, FiSettings, FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import { useState, useEffect } from "react";
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

const Layout = ({ darkMode, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: FiHome },
    { name: "Bills", href: "/bill-section", icon: FiFileText },
    { name: "Expenses", href: "/expenses", icon: FiDollarSign },
    { name: "Reports", href: "/reports", icon: FiPieChart },
    { name: "Charts", href: "/charts", icon: FiPieChart },
  ];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsOpen(mobile ? false : true); // Close sidebar on mobile by default
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`flex min-h-screen w-full ${darkMode ? "bg-gray-900" : "bg-gray-50"} overflow-x-hidden`}>
      {/* Sidebar */}
      <div
        className={`
          ${isOpen ? "w-64" : "w-16"}
          fixed inset-y-0 z-50 transition-all duration-300
          ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}
          border-r md:block ${isMobile && !isOpen ? "hidden" : "block"}
        `}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8">
            {isOpen && (
              <h1 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Star Printing
              </h1>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isOpen ? (
                <FiX size={24} className={darkMode ? "text-white" : "text-gray-900"} />
              ) : (
                <FiMenu size={24} className={darkMode ? "text-white" : "text-gray-900"} />
              )}
            </button>
          </div>

          <nav className="flex-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center p-3 mb-2 rounded-lg transition-colors 
                  ${isActive ? (darkMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600") :
                    darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"}`
                }
                aria-label={`Navigate to ${item.name}`}
              >
                <item.icon className="flex-shrink-0 w-6 h-6" />
                {isOpen && <span className="ml-3 truncate">{item.name}</span>}
              </NavLink>
            ))}
          </nav>

          <div className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"} pt-4`}>
            <button
              onClick={toggleDarkMode}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <FiSun className="w-6 h-6 text-yellow-400" />
              ) : (
                <FiMoon className="w-6 h-6 text-gray-600" />
              )}
              {isOpen && (
                <span className={`ml-3 ${darkMode ? "text-white" : "text-gray-700"}`}>
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main
        className={`
          flex-1 transition-all duration-300
          ${isMobile ? (isOpen ? "ml-64" : "ml-0") : (isOpen ? "ml-64" : "ml-16")}
          ${darkMode ? "bg-gray-900" : "bg-gray-50"}
          min-w-0 p-4 md:p-6
        `}
      >
        <Outlet />
      </main>

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true" ||
      (!localStorage.getItem("darkMode") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

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

        {/* Main routes with sidebar */}
        <Route element={<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
          <Route path="/" element={<Home darkMode={darkMode} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/create-bill" element={<BillMaker darkMode={darkMode} />} />
          <Route path="/bill-section" element={<BillSection darkMode={darkMode} />} />
          <Route path="/bill-view/:id" element={<ViewBill darkMode={darkMode} />} />
          <Route path="/invoice" element={<InvoiceBill darkMode={darkMode} />} />
          <Route path="/charts" element={<ChartPage darkMode={darkMode} />} />
          <Route path="/expenses" element={<ExpenseDashboard darkMode={darkMode} />} />
          <Route path="/reports" element={<Reports darkMode={darkMode} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;