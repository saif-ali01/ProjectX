import React, { useRef, useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import Toast from "../../components/common/Toast";

// FinancialSummaryLineChart component for visualizing financial summary over time
const FinancialSummaryLineChart = ({ financialSummary, timeFrame, darkMode }) => {
  const chartContainerRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 400, height: 250 });
  const [toast, setToast] = useState(null);

  // Dynamically set chart dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const { offsetWidth } = chartContainerRef.current;
        const width = Math.min(offsetWidth, 600); // Cap max width
        const height = Math.max(width * 0.6, 250); // Maintain aspect ratio
        setChartDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Export chart as PNG
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
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "financial_summary_line.png";
      link.click();
      setToast({ message: "Chart exported successfully", type: "success" });
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // Handle empty data
  if (!financialSummary?.timeSeries || financialSummary.timeSeries.length === 0) {
    return (
      <div
        className={`rounded-lg shadow-md p-4 sm:p-6 border transition-colors duration-300 flex flex-col items-center max-w-full ${
          darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <h2 className="text-base sm:text-lg font-semibold mb-4">Financial Summary (Over Time)</h2>
        <p className="text-sm sm:text-base">No data available for the selected time frame.</p>
      </div>
    );
  }

  return (
    <div
      ref={chartContainerRef}
      className={`rounded-lg shadow-md p-4 sm:p-6 border transition-colors duration-300 flex flex-col items-center max-w-full ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-4">
        <h2
          className={`text-base sm:text-lg font-semibold ${
            darkMode ? "text-gray-100" : "text-gray-900"
          }`}
        >
          Financial Summary (Over Time)
        </h2>
        <button
          onClick={handleExport}
          aria-label="Export chart as PNG"
          className={`px-3 py-1 rounded-lg font-medium transition-transform hover:scale-105 text-sm sm:text-base mt-2 sm:mt-0 ${
            darkMode
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Export PNG
        </button>
      </div>
      <div className="w-full relative right-5 flex justify-center">
        <LineChart
          width={chartDimensions.width}
          height={chartDimensions.height}
          data={financialSummary.timeSeries}
          margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
          isAnimationActive={true}
          animationDuration={600}
        >
          <CartesianGrid
            stroke={darkMode ? "#374151" : "#E5E7EB"}
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey={
              timeFrame === "daily"
                ? "date"
                : timeFrame === "monthly"
                ? "month"
                : "year"
            }
            stroke={darkMode ? "#E5E7EB" : "#1F2937"}
            tick={{ fill: darkMode ? "#E5E7EB" : "#1F2937", fontSize: '0.75rem' }}
            tickFormatter={(value) =>
              timeFrame === "daily"
                ? new Date(value).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })
                : value
            }
          />
          <YAxis
            stroke={darkMode ? "#E5E7EB" : "#1F2937"}
            tick={{ fill: darkMode ? "#E5E7EB" : "#1F2937", fontSize: '0.75rem' }}
            tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? "#1F2937" : "#F9FAFB",
              color: darkMode ? "#E5E7EB" : "#1F2937",
              border: `1px solid ${darkMode ? "#4B5563" : "#9CA3AF"}`,
              borderRadius: "4px",
              padding: "8px",
              fontSize: "0.85rem",
            }}
            formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
          />
          <Legend
            wrapperStyle={{
              color: darkMode ? "#E5E7EB" : "#1F2937",
              paddingTop: "10px",
              fontSize: '0.85rem',
            }}
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke={darkMode ? "#F87171" : "#EF4444"}
            name="Expenses"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="earnings"
            stroke={darkMode ? "#34D399" : "#10B981"}
            name="Earnings"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="profitLoss"
            stroke={darkMode ? "#60A5FA" : "#3B82F6"}
            name="Profit/Loss"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
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
  );
};

export default FinancialSummaryLineChart;