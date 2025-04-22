import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

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

const API = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000/api/bills",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

const ChartPage = () => {
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

        // Fetch data from the /stats endpoint with timeFrame
        const response = await API.get(`/stats?timeFrame=${timeFrame}`);
        if (!response.data) throw new Error("Empty response from server");

        const stats = response.data;

        // Calculate growth/loss (difference between consecutive periods)
        const calculatedData = stats.map((stat, index) => {
          if (index === 0) return { ...stat, change: 0 };
          const prevRevenue = stats[index - 1].totalRevenue;
          const change = stat.totalRevenue - prevRevenue;
          return { ...stat, change };
        });

        setRevenueData(calculatedData);

        // Prepare chart data
        const labels = calculatedData.map(stat => stat.date);
        const data = calculatedData.map(stat => stat.totalRevenue);
        const backgroundColors = calculatedData.map(stat =>
          stat.change > 0 ? "rgba(34, 197, 94, 0.6)" : // Green for growth
          stat.change < 0 ? "rgba(239, 68, 68, 0.6)" : // Red for loss
          "rgba(156, 163, 175, 0.6)" // Gray for no change
        );
        const borderColors = calculatedData.map(stat =>
          stat.change > 0 ? "rgba(34, 197, 94, 1)" :
          stat.change < 0 ? "rgba(239, 68, 68, 1)" :
          "rgba(156, 163, 175, 1)"
        );

        setChartData({
          labels,
          datasets: [
            {
              label: `Revenue (₹) - ${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}`,
              data,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
              fill: false
            }
          ]
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message ||
          err.message ||
          "Failed to load chart data";
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
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: `Business Revenue Trend (${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)})`,
        font: {
          size: 18
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const revenue = context.parsed.y;
            const change = revenueData[index].change;
            return [
              `Revenue: ₹${revenue.toFixed(2)}`,
              `Change: ₹${change.toFixed(2)}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: timeFrame === "daily" ? "Date" : timeFrame === "monthly" ? "Month" : "Year"
        },
        grid: {
          display: false
        }
      },
      y: {
        title: {
          display: true,
          text: "Revenue (₹)"
        },
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)"
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="p-4 bg-blue-100 text-blue-700 rounded-lg flex items-center">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading chart data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          <h2 className="font-bold mb-2">Error Loading Chart:</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/bills")}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Bills
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-lg shadow-lg">
        <h1 className="text-2xl font-bold">Star Printing - Revenue Chart</h1>
      </div>
      <div className="bg-white p-6 rounded-b-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <label className="text-sm font-medium text-gray-700">Time Frame:</label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="p-2 border rounded-lg bg-gray-50 text-gray-700"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <button
            onClick={() => navigate("/bills")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Bills
          </button>
        </div>
        <div className="mb-6">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <p>Data represents {timeFrame} revenue from paid bills</p>
            <p>Green: Growth | Red: Loss | Gray: No Change</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPage;