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

const ChartPage = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeFrame, setTimeFrame] = useState("daily");
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");
        // Log the full URL for debugging
        const url = `/bills/stats?timeFrame=${timeFrame}`;
        console.log("Fetching from:", `${api.defaults.baseURL}${url}`);
        const response = await api.get(url);
        if (!response.data) {
          console.warn("Empty response, using mock data");
          const mockData = [
            { date: "2025-04-01", totalRevenue: 1000 },
            { date: "2025-04-02", totalRevenue: 1200 },
          ];
          response.data = mockData;
        }

        const stats = response.data;

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
        const backgroundColors = calculatedData.map((stat) =>
          stat.change > 0
            ? "rgba(34, 197, 94, 0.6)"
            : stat.change < 0
            ? "rgba(239, 68, 68, 0.6)"
            : "rgba(156, 163, 175, 0.6)"
        );
        const borderColors = calculatedData.map((stat) =>
          stat.change > 0
            ? "rgba(34, 197, 94, 1)"
            : stat.change < 0
            ? "rgba(239, 68, 68, 1)"
            : "rgba(156, 163, 175, 1)"
        );

        setChartData({
          labels,
          datasets: [
            {
              label: `Revenue (₹) - ${
                timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)
              }`,
              data,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
              fill: false,
            },
          ],
        });
      } catch (err) {
        // Improved error handling for 404
        let errorMessage = "Failed to load chart data";
        if (err.response?.status === 404) {
          errorMessage = `The API endpoint /stats?timeFrame=${timeFrame} was not found. Please check the server configuration.`;
        } else {
          errorMessage = err.response?.data?.message || err.message || "Failed to load chart data";
        }
        setError(errorMessage);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeFrame]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 14 },
          color: darkMode ? "#E5E7EB" : "#1F2937",
        },
      },
      title: {
        display: true,
        text: `Business Revenue Trend (${
          timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)
        })`,
        font: { size: 18 },
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
        },
        grid: { display: false },
        ticks: { color: darkMode ? "#E5E7EB" : "#1F2937" },
      },
      y: {
        title: {
          display: true,
          text: "Revenue (₹)",
          color: darkMode ? "#E5E7EB" : "#1F2937",
        },
        beginAtZero: true,
        grid: {
          color: darkMode ? "rgba(229, 231, 235, 0.2)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: { color: darkMode ? "#E5E7EB" : "#1F2937" },
      },
    },
  };

  if (loading) {
    return (
      <div
        className={`max-w-6xl mx-auto p-6 min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        } transition-colors duration-300`}
      >
        <div
          className={`p-4 rounded-lg flex items-center ${
            darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-700"
          }`}
        >
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
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

  if (error) {
    return (
      <div
        className={`max-w-6xl mx-auto p-6 min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        } transition-colors duration-300`}
      >
        <div
          className={`p-4 rounded-lg ${
            darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700"
          }`}
        >
          <h2
            className={`font-bold mb-2 ${
              darkMode ? "text-gray-100" : "text-gray-900"
            }`}
          >
            Error Loading Chart:
          </h2>
          <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            {error}
          </p>
          <button
            onClick={() => navigate("/bills")}
            className={`mt-4 px-4 py-2 rounded-lg hover:scale-105 transition-colors ${
              darkMode
                ? "bg-[#b8966f] text-white hover:bg-[#a7845f]"
                : "bg-[#b8966f] text-white hover:bg-[#a7845f]"
            }`}
          >
            Back to Bills
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`max-w-6xl mx-auto p-6 min-h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      } transition-colors duration-300`}
    >
      <div className="bg-[#b8966f] text-white p-6 rounded-t-lg shadow-lg flex justify-between items-center">
        <h1 className="text-2xl font-bold">Star Printing - Revenue Chart</h1>
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
      <div
        className={`p-6 rounded-b-lg shadow-lg border ${
          darkMode
            ? "bg-gray-800 border-gray-600"
            : "bg-white border-gray-200"
        } transition-colors duration-300`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4 items-center">
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
              className={`p-2 border rounded-lg ${
                darkMode
                  ? "border-gray-600 bg-gray-700 text-gray-100"
                  : "border-gray-300 bg-gray-50 text-gray-900"
              }`}
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <button
            onClick={() => navigate("/bills")}
            className={`px-4 py-2 rounded-lg hover:scale-105 transition-colors ${
              darkMode
                ? "bg-[#b8966f] text-white hover:bg-[#a7845f]"
                : "bg-[#b8966f] text-white hover:bg-[#a7845f]"
            }`}
          >
            Back to Bills
          </button>
        </div>
        <div className="mb-6">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="flex justify-between items-center">
          <div
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <p>Data represents {timeFrame} revenue from paid bills</p>
            <p>Green: Growth | Red: Loss | Gray: No Change</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPage;