import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { api } from "../../utils/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Moon, Sun } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// ChartPage component for displaying revenue trend chart
const ChartPage = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeFrame, setTimeFrame] = useState("daily");
  const [revenueData, setRevenueData] = useState([]);

  // Fetch revenue stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/api/bills/stats?timeFrame=${timeFrame}`);
        let stats = response.data || [
          { date: "2025-04-01", totalRevenue: 1000 },
          { date: "2025-04-02", totalRevenue: 1200 },
        ];

        // Calculate growth/loss
        const calculatedData = stats.map((stat, index) => {
          if (index === 0) return { ...stat, change: 0 };
          const prevRevenue = stats[index - 1].totalRevenue;
          const change = stat.totalRevenue - prevRevenue;
          return { ...stat, change };
        });

        setRevenueData(calculatedData);

        // Prepare chart data
        const labels = calculatedData.map((stat) => stat.date);
        const data = calculatedData.map((stat) => stat.totalRevenue);

        setChartData({
          labels,
          datasets: [
            {
              label: `Revenue (₹) - ${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}`,
              data,
              borderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
              fill: false,
              segment: {
                borderColor: (ctx) => {
                  const index = ctx.p1DataIndex;
                  if (index === 0 || calculatedData[index].change === 0) return "#9CA3AF"; // Gray for no change
                  return calculatedData[index].change > 0 ? "#22C55E" : "#EF4444";
                },
                backgroundColor: (ctx) => {
                  const index = ctx.p1DataIndex;
                  if (index === 0 || calculatedData[index].change === 0) return "#9CA3AF"; // Gray for no change
                  return calculatedData[index].change > 0 ? "#22C55E" : "#EF4444";
                },
              },
              pointBackgroundColor: calculatedData.map((stat) =>
                stat.change === 0 ? "#9CA3AF" : stat.change > 0 ? "#22C55E" : "#EF4444"
              ),
              pointBorderColor: calculatedData.map((stat) =>
                stat.change === 0 ? "#9CA3AF" : stat.change > 0 ? "#22C55E" : "#EF4444"
              ),
            },
          ],
        });
      } catch (err) {
        const errorMessage =
          err.response?.status === 404
            ? `API endpoint /stats?timeFrame=${timeFrame} not found.`
            : err.response?.data?.message || "Failed to load chart data";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeFrame]);

  // Chart options for responsive display
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 12 },
          color: darkMode ? "#E5E7EB" : "#1F2937",
        },
      },
      title: {
        display: true,
        text: `Business Revenue Trend (${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)})`,
        font: { size: 16 },
        padding: { top: 10, bottom: 20 },
        color: darkMode ? "#E5E7EB" : "#1F2937",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const revenue = context.parsed.y;
            const change = revenueData[index].change;
            return [
              `Revenue: ₹${revenue.toFixed(2)}`,
              `Change: ₹${change.toFixed(2)}`,
            ];
          },
        },
        backgroundColor: darkMode ? "#1F2937" : "#F9FAFB",
        titleColor: darkMode ? "#E5E7EB" : "#1F2937",
        bodyColor: darkMode ? "#E5E7EB" : "#1F2937",
        borderColor: darkMode ? "#4B5563" : "#9CA3AF",
        borderWidth: 1,
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text:
            timeFrame === "daily"
              ? "Date"
              : timeFrame === "monthly"
              ? "Month"
              : "Year",
          color: darkMode ? "#E5E7EB" : "#1F2937",
          font: { size: 12 },
        },
        grid: { display: false },
        ticks: { color: darkMode ? "#E5E7EB" : "#1F2937", font: { size: 10 } },
      },
      y: {
        title: {
          display: true,
          text: "Revenue (₹)",
          color: darkMode ? "#E5E7EB" : "#1F2937",
          font: { size: 12 },
        },
        beginAtZero: true,
        grid: {
          color: darkMode ? "rgba(229, 231, 235, 0.2)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: { color: darkMode ? "#E5E7EB" : "#1F2937", font: { size: 10 } },
      },
    },
  };

  // Loading state
  if (loading) {
    return (
      <div
        className={`max-w-full mx-auto p-4 sm:p-6 min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        } transition-colors duration-300`}
      >
        <div
          className={`p-3 sm:p-4 rounded-lg flex items-center text-sm sm:text-base ${
            darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-700"
          }`}
        >
          <svg className="animate-spin h-4 sm:h-5 w-4 sm:w-5 mr-2 sm:mr-3" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading chart data...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`max-w-full mx-auto p-4 sm:p-6 min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        } transition-colors duration-300`}
      >
        <div
          className={`p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
            darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700"
          }`}
        >
          <h2
            className={`font-bold mb-2 text-base sm:text-lg ${
              darkMode ? "text-gray-100" : "text-gray-900"
            }`}
          >
            Error Loading Chart:
          </h2>
          <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{error}</p>
          <button
            onClick={() => navigate("/bills")}
            className={`mt-3 sm:mt-4 px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-medium transition-transform hover:scale-105 text-sm sm:text-base text-white bg-gradient-to-r from-cyan-500 to-teal-600`}
          >
            Back to Bills
          </button>
        </div>
      </div>
    );
  }

  // Main chart view
  return (
    <div
      className={`max-w-full mx-auto p-4 sm:p-6 min-h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      } transition-colors duration-300`}
    >
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 sm:p-6 rounded-t-lg shadow-lg flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
        <h1 className="text-lg sm:text-2xl font-bold">Star Printing - Revenue Chart</h1>

      </div>
      <div
        className={`p-4 sm:p-6 rounded-b-lg shadow-lg border max-w-full ${
          darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"
        } transition-colors duration-300`}
      >
        {/* Controls frame for Time Frame dropdown and Back to Bills button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6 w-full sm:w-auto">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label
              className={`text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Time Frame:
            </label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className={`w-full sm:w-auto p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 text-sm sm:text-base ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500"
                  : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-600"
              }`}
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <button
            onClick={() => navigate("/bill-section")}
            className={`w-full sm:w-auto px-3 sm:px-4 py-3 sm:py-2 rounded-lg font-medium transition-transform hover:scale-105 text-sm sm:text-base text-white bg-gradient-to-r from-cyan-500 to-teal-600`}
          >
            Back to Bills
          </button>
        </div>
        <div className="h-64 sm:h-80 lg:h-96 mb-4 sm:mb-6">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="text-xs sm:text-sm text-center sm:text-left">
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Data represents {timeFrame} revenue from paid bills
          </p>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Green: Growth | Red: Loss | Gray: No Change
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChartPage;