import React, { useRef, useEffect, useState, Component } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, FileText, Settings, User, TrendingUp, DollarSign, FileText as FileTextIcon, Users, Moon, Sun, CreditCard, FilePlus, Briefcase } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import Toast from "../components/common/Toast";

const Home = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const chartContainerRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 500, height: 300 });
  const [toast, setToast] = useState(null);

  // Mock data for summary metrics
  const summaryData = [
    {
      title: "Total Revenue",
      value: "₹5,00,000",
      icon: <DollarSign className="w-6 h-6" />,
      onClick: () => navigate("/reports"),
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Total Expenses",
      value: "₹3,20,000",
      icon: <TrendingUp className="w-6 h-6" />,
      onClick: () => navigate("/expenses"),
      color: "from-red-500 to-pink-600",
    },
    {
      title: "Pending Invoices",
      value: "12",
      icon: <FileTextIcon className="w-6 h-6" />,
      onClick: () => navigate("/bill-section"),
      color: "from-yellow-500 to-orange-600",
    },
    {
      title: "Active Clients",
      value: "45",
      icon: <Users className="w-6 h-6" />,
      onClick: () => navigate("/clients"),
      color: "from-green-500 to-emerald-600",
    },
  ];

  // Mock data for revenue trend chart
  const revenueData = [
    { month: "Jan", revenue: 50000 },
    { month: "Feb", revenue: 60000 },
    { month: "Mar", revenue: 45000 },
    { month: "Apr", revenue: 70000 },
    { month: "May", revenue: 80000 },
    { month: "Jun", revenue: 65000 },
  ];

  // Dynamically set chart dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const { offsetWidth } = chartContainerRef.current;
        const width = Math.min(offsetWidth - 40, 600);
        const height = Math.max(width * 0.6, 300);
        setChartDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleExport = () => {
    const svg = chartContainerRef.current.querySelector(".recharts-surface");
    if (!svg) {
      setToast({ message: "Chart not found for export", type: "error" });
      return;
    }
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
      setToast({ message: "Chart exported successfully", type: "success" });
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // Error Boundary Class Component
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
        return (
          <div className="max-w-7xl mx-auto p-6">
            <div
              className={`p-6 rounded-lg shadow-md ${
                darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700"
              }`}
            >
              <h2
                className={`text-lg font-semibold mb-3 ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Error Loading Homepage
              </h2>
              <p
                className={`mb-4 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {this.state.error}
              </p>
              <button
                onClick={() => navigate("/")}
                className={`px-4 py-2 rounded-lg hover:scale-105 transition-colors ${
                  darkMode
                    ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                }`}
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

  return (
    <ErrorBoundary>
      <div
        className={`min-h-screen text-gray-900 ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        } transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto p-6">
          {/* Hero Section */}
          <div
            className={`rounded-2xl shadow-lg p-10 ${
              darkMode
                ? "bg-gray-800 border-gray-600"
                : "bg-white border-gray-200"
            } mb-8 animate-fade-in border transition-colors duration-300`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h1
                  className={`text-3xl md:text-4xl font-bold mb-4 ${
                    darkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  Welcome to Star Printing Dashboard
                </h1>
                <p
                  className={`text-lg ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Generate insightful reports, manage expenses, and visualize your business performance.
                </p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full hover:scale-105 transition-colors ${
                  darkMode
                    ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                }`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            <Card
              icon={<BarChart3 className="w-6 h-6" />}
              title="Reports"
              onClick={() => navigate("/reports")}
              color="from-blue-500 to-indigo-600"
            />
            <Card
              icon={<FileText className="w-6 h-6" />}
              title="Invoices"
              onClick={() => navigate("/bill-section")}
              color="from-green-500 to-emerald-600"
            />
            <Card
              icon={<Users className="w-6 h-6" />}
              title="Clients"
              onClick={() => navigate("/clients")}
              color="from-yellow-500 to-orange-600"
            />
            <Card
              icon={<Settings className="w-6 h-6" />}
              title="Settings"
              onClick={() => navigate("/settings")}
              color="from-gray-600 to-gray-800"
            />
            <Card
              icon={<CreditCard className="w-6 h-6" />}
              title="Expenses"
              onClick={() => navigate("/expenses")}
              color="from-red-600 to-rose-700"
            />
            <Card
              icon={<FilePlus className="w-6 h-6" />}
              title="Create Bill"
              onClick={() => navigate("/create-bill")}
              color="from-purple-500 to-violet-600"
            />
            <Card
              icon={<Briefcase className="w-6 h-6" />}
              title="Add Today's Work"
              onClick={() => navigate("/add-work")}
              color="from-teal-500 to-cyan-600"
            />
          </div>

          {/* Summary Section */}
          <div className="mt-12">
            <h2
              className={`text-2xl font-semibold mb-6 ${
                darkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Business Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {summaryData.map((item, index) => (
                <SummaryCard
                  key={index}
                  title={item.title}
                  value={item.value}
                  icon={item.icon}
                  onClick={item.onClick}
                  color={item.color}
                  darkMode={darkMode}
                />
              ))}
            </div>
            <div
              ref={chartContainerRef}
              className={`rounded-2xl shadow-md p-6 border hover:scale-[1.02] transition-transform duration-300 animate-fade-in ${
                darkMode
                  ? "bg-gray-800 border-gray-600"
                  : "bg-white border-gray-200"
              } flex flex-col items-center`}
            >
              <div className="flex justify-between items-center w-full mb-4">
                <h3
                  className={`text-lg font-semibold ${
                    darkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  Revenue Trend
                </h3>
                <button
                  onClick={handleExport}
                  className={`px-3 py-1 rounded-lg hover:scale-105 transition-colors ${
                    darkMode
                      ? "bg-[#b8966f] text-white hover:bg-[#a7845f]"
                      : "bg-[#b8966f] text-white hover:bg-[#a7845f]"
                  }`}
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
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    isAnimationActive={true}
                    animationDuration={600}
                  >
                    <XAxis
                      dataKey="month"
                      stroke={darkMode ? "#E5E7EB" : "#1F2937"}
                      tick={{ fill: darkMode ? "#E5E7EB" : "#1F2937" }}
                    />
                    <YAxis
                      stroke={darkMode ? "#E5E7EB" : "#1F2937"}
                      tick={{ fill: darkMode ? "#E5E7EB" : "#1F2937" }}
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
                    <Legend
                      wrapperStyle={{
                        color: darkMode ? "#E5E7EB" : "#1F2937",
                        paddingTop: "10px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      name="Revenue"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                ) : (
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    No revenue data available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
            darkMode={darkMode}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

// Reusable Card Component for Quick Actions
const Card = ({ icon, title, onClick, color }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer rounded-xl p-6 shadow-md bg-gradient-to-br ${color} text-white hover:scale-[1.03] transition-transform duration-300 animate-fade-in`}
  >
    <div className="mb-2">{icon}</div>
    <h3 className="text-xl font-semibold">{title}</h3>
  </div>
);

// Reusable Summary Card Component
const SummaryCard = ({ title, value, icon, onClick, color, darkMode }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer rounded-xl p-6 shadow-md border hover:scale-[1.03] transition-transform duration-300 animate-fade-in flex items-center ${
      darkMode
        ? "bg-gray-800 border-gray-600"
        : "bg-white border-gray-200"
    }`}
  >
    <div className={`p-3 rounded-full bg-gradient-to-br ${color} text-white mr-4`}>
      {icon}
    </div>
    <div>
      <h3
        className={`text-lg font-semibold ${
          darkMode ? "text-gray-100" : "text-gray-900"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-2xl font-bold ${
          darkMode ? "text-gray-100" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

export default Home;