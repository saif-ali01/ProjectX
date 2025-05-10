import React, { useRef, useEffect, useState, Component } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import {
  BarChart3,
  FileText,
  Settings,
  Users,
  TrendingUp,
  DollarSign,
  CreditCard,
  FilePlus,
  Briefcase,
  LogOut,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import Toast from "../components/common/Toast";
import moment from "moment-timezone";

// Determine base URL for consistency
const isProduction = process.env.NODE_ENV === "production";
const BASE_URL = isProduction ? "https://projectxapi.onrender.com" : "http://localhost:5000";

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error: error.message || "An unexpected error occurred" };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in Home:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      const { darkMode, navigate } = this.props;
      return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700"}`}>
            <h2 className={`text-lg font-semibold mb-3 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Error Loading Homepage</h2>
            <p className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{this.state.error}</p>
            <button
              onClick={() => navigate("/")}
              className={`px-4 py-2 rounded-lg hover:scale-105 transition-colors ${darkMode ? "bg-gray-700 text-gray-100 hover:bg-gray-600" : "bg-gray-200 text-gray-900 hover:bg-gray-300"}`}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Home = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const chartContainerRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 500, height: 300 });
  const [toast, setToast] = useState(null);
  const [budgets, setBudgets] = useState({
    daily: { date: "", totalEarnings: 0, totalExpenses: 0, budget: 0 },
    monthly: { month: "", totalEarnings: 0, totalExpenses: 0, budget: 0 },
    yearly: { year: "", totalEarnings: 0, totalExpenses: 0, budget: 0 },
  });
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Setup Axios interceptors for JWT refresh
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await api.post("/api/refresh-token", {}, { withCredentials: true });
            return api(originalRequest);
          } catch (refreshError) {
            setToast({ message: "Session expired. Please sign in again.", type: "error", autoClose: 5000 });
            navigate("/signup?error=session_expired");
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [navigate]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/api/me", { withCredentials: true });
        setUser(response.data);
      } catch (err) {
        setToast({ message: "Please sign in to access the dashboard.", type: "error", autoClose: 5000 });
        navigate("/signup?error=unauthenticated");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  // Fetch budget and revenue data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);
        const budgetUrl = `/api/budget`;
        const revenueUrl = `/api/dashboard/revenue-trend`;

        const [budgetResponse, revenueResponse] = await Promise.all([
          api.get(budgetUrl, { withCredentials: true }),
          api.get(revenueUrl, { withCredentials: true }),
        ]);

        setBudgets(budgetResponse.data.data);
        setRevenueData(revenueResponse.data || []);
      } catch (err) {
        const errorMessage =
          err.response?.status === 404
            ? "Dashboard data not found."
            : err.response?.data?.message || "Failed to load dashboard data";
        setError(errorMessage);
        setToast({ message: errorMessage, type: "error", autoClose: 5000 });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Update chart dimensions responsively
  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const { offsetWidth } = chartContainerRef.current;
        const width = Math.min(offsetWidth - 40, 600);
        setChartDimensions({ width, height: Math.max(width * 0.6, 300) });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Export chart as PNG
  const handleExport = () => {
    const svg = chartContainerRef.current?.querySelector(".recharts-surface");
    if (!svg) {
      setToast({ message: "Chart not found for export", type: "error", autoClose: 3000 });
      return;
    }
    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "revenue_trend.png";
        link.click();
        setToast({ message: "Chart exported successfully", type: "success", autoClose: 3000 });
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    } catch (err) {
      setToast({ message: "Failed to export chart", type: "error", autoClose: 3000 });
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await api.post("/api/logout", {}, { withCredentials: true });
      setUser(null);
      setToast({ message: "Logged out successfully", type: "success", autoClose: 3000 });
      navigate("/signup");
    } catch (err) {
      setToast({ message: "Failed to log out", type: "error", autoClose: 3000 });
    }
  };

  // Budget cards configuration
  const budgetCards = [
    {
      title: "Daily Budget",
      value: `₹${budgets.daily.budget.toLocaleString("en-IN")}`,
      period: budgets.daily.date || "Today",
      earnings: `₹${budgets.daily.totalEarnings.toLocaleString("en-IN")}`,
      expenses: `₹${budgets.daily.totalExpenses.toLocaleString("en-IN")}`,
      icon: <DollarSign className="w-6 h-6" />,
      onClick: () => navigate("/expenses"),
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Monthly Budget",
      value: `₹${budgets.monthly.budget.toLocaleString("en-IN")}`,
      period: budgets.monthly.month || "This Month",
      earnings: `₹${budgets.monthly.totalEarnings.toLocaleString("en-IN")}`,
      expenses: `₹${budgets.monthly.totalExpenses.toLocaleString("en-IN")}`,
      icon: <TrendingUp className="w-6 h-6" />,
      onClick: () => navigate("/expenses"),
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Yearly Budget",
      value: `₹${budgets.yearly.budget.toLocaleString("en-IN")}`,
      period: budgets.yearly.year || "This Year",
      earnings: `₹${budgets.yearly.totalEarnings.toLocaleString("en-IN")}`,
      expenses: `₹${budgets.yearly.totalExpenses.toLocaleString("en-IN")}`,
      icon: <FileText className="w-6 h-6" />,
      onClick: () => navigate("/expenses"),
      color: "from-yellow-500 to-orange-600",
    },
  ];

  // Quick action cards configuration
  const actionCards = [
    { icon: <BarChart3 className="w-6 h-6" />, title: "Reports", onClick: () => navigate("/reports"), color: "from-blue-500 to-indigo-600" },
    { icon: <FileText className="w-6 h-6" />, title: "Invoices", onClick: () => navigate("/bill-section"), color: "from-green-500 to-emerald-600" },
    { icon: <Users className="w-6 h-6" />, title: "Clients", onClick: () => navigate("/clients"), color: "from-yellow-500 to-orange-600" },
    { icon: <Settings className="w-6 h-6" />, title: "Settings", onClick: () => navigate("/settings"), color: "from-gray-600 to-gray-800" },
    { icon: <CreditCard className="w-6 h-6" />, title: "Expenses", onClick: () => navigate("/expenses"), color: "from-red-600 to-rose-700" },
    { icon: <FilePlus className="w-6 h-6" />, title: "Create Bill", onClick: () => navigate("/create-bill"), color: "from-purple-500 to-violet-600" },
    { icon: <Briefcase className="w-6 h-6" />, title: "Add Today's Work", onClick: () => navigate("/addwork"), color: "from-teal-500 to-cyan-600" },
    { icon: <LogOut className="w-6 h-6" />, title: "Logout", onClick: handleLogout, color: "from-red-500 to-red-700" },
  ];

  return (
    <ErrorBoundary darkMode={darkMode} navigate={navigate}>
      <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {loading && (
            <div className={`p-4 rounded-lg flex items-center animate-pulse ${darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-700"}`}>
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading dashboard...
            </div>
          )}

          {error && (
            <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700"}`}>
              <h2 className={`text-lg font-semibold mb-3 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Error Loading Dashboard</h2>
              <p className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  if (user) {
                    fetchDashboardData();
                  } else {
                    navigate("/signup?error=unauthenticated");
                  }
                }}
                className={`px-4 py-2 rounded-lg hover:scale-105 transition-colors ${darkMode ? "bg-gray-700 text-gray-100 hover:bg-gray-600" : "bg-gray-200 text-gray-900 hover:bg-gray-300"}`}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className={`rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 flex justify-center ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"} mb-8 border transition-colors`}>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-4xl">
                  <div className="text-center sm:text-left">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Welcome to Star Printing Dashboard</h1>
                    <p className={`text-sm sm:text-base lg:text-lg text-center ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Manage budgets, expenses, and business performance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-10">
                {actionCards.map((card, index) => (
                  <Card key={index} {...card} />
                ))}
              </div>

              <div className="mt-12">
                <h2 className="text-xl sm:text-2xl font-semibold mb-6">Budget Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  {budgetCards.map((card, index) => (
                    <BudgetCard key={index} {...card} darkMode={darkMode} />
                  ))}
                </div>
                <div
                  ref={chartContainerRef}
                  className={`rounded-2xl shadow-md p-4 sm:p-6 border hover:scale-[1.02] transition-transform ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"} flex flex-col items-center`}
                >
                  <div className="flex justify-between items-center w-full mb-4">
                    <h3 className="text-base sm:text-lg font-semibold">Revenue Trend</h3>
                    <button
                      onClick={handleExport}
                      className="px-3 py-1 rounded-lg hover:scale-105 transition-colors bg-[#b8966f] text-white hover:bg-[#a7845f]"
                    >
                      Export PNG
                    </button>
                  </div>
                  <div className="overflow-hidden w-full flex justify-center">
                    {revenueData.length ? (
                      <LineChart
                        width={chartDimensions.width}
                        height={chartDimensions.height}
                        data={revenueData}
                        margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                      >
                        <XAxis
                          dataKey="month"
                          stroke={darkMode ? "#E5E7EB" : "#1F2937"}
                          tick={{ fill: darkMode ? "#E5E7EB" : "#1F2937", fontSize: window.innerWidth < 640 ? 10 : 12 }}
                        />
                        <YAxis
                          stroke={darkMode ? "#E5E7EB" : "#1F2937"}
                          tick={{ fill: darkMode ? "#E5E7EB" : "#1F2937", fontSize: window.innerWidth < 640 ? 10 : 12 }}
                          tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: darkMode ? "#1F2937" : "#F9FAFB",
                            color: darkMode ? "#E5E7EB" : "#1F2937",
                            border: darkMode ? "1px solid #4B5563" : "1px solid #9CA3AF",
                            borderRadius: "4px",
                            padding: "8px",
                          }}
                          formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                        />
                        <Legend wrapperStyle={{ color: darkMode ? "#E5E7EB" : "#1F2937", paddingTop: "10px" }} />
                        <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue" strokeWidth={2} dot={false} />
                      </LineChart>
                    ) : (
                      <p className={darkMode ? "text-gray-400" : "text-gray-500"}>No revenue data available</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} darkMode={darkMode} autoClose={toast.autoClose} />}
      </div>
    </ErrorBoundary>
  );
};

// Reusable Card Component for Quick Actions
const Card = ({ icon, title, onClick, color }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer rounded-xl p-3 sm:p-4 md:p-6 shadow-md bg-gradient-to-br ${color} text-white hover:scale-[1.03] transition-transform`}
  >
    <div className="mb-1 sm:mb-2">{React.cloneElement(icon, { className: "w-5 h-5 sm:w-6 sm:h-6" })}</div>
    <h3 className="text-base sm:text-lg md:text-xl font-semibold">{title}</h3>
  </div>
);

// Reusable Budget Card Component
const BudgetCard = ({ title, value, period, earnings, expenses, icon, onClick, color, darkMode }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer rounded-xl p-4 sm:p-6 shadow-md border hover:scale-[1.03] transition-transform flex flex-col ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}
  >
    <div className={`p-3 rounded-full bg-gradient-to-br ${color} text-white mb-4 self-start`}>{icon}</div>
    <h3 className={`text-base sm:text-lg font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>{title}</h3>
    <p className={`text-xl sm:text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>{value}</p>
    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Period: {period}</p>
    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Earnings: {earnings}</p>
    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Expenses: {expenses}</p>
  </div>
);

export default Home;