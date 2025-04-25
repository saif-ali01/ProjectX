import React, { useRef, useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import Toast from "../../components/common/Toast";

const FinancialSummaryLineChart = ({ financialSummary, timeFrame, darkMode }) => {
  const chartContainerRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 500, height: 300 });
  const [toast, setToast] = useState(null);

  // Dynamically set chart dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const { offsetWidth } = chartContainerRef.current;
        const width = Math.min(offsetWidth - 40, 600); // Account for padding
        const height = Math.max(width * 0.6, 300); // Maintain aspect ratio
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
      canvas.width = img.width * 2; // Double resolution for sharper export
      canvas.height = img.height * 2;
      ctx.scale(2, 2); // Adjust for high DPI
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
        className={`rounded-lg shadow-md p-6 border transition-colors duration-300 flex flex-col items-center ${
          darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <h2 className="text-lg font-semibold mb-4">Financial Summary (Over Time)</h2>
        <p>No data available for the selected time frame.</p>
      </div>
    );
  }

  return (
    <div
      ref={chartContainerRef}
      className={`rounded-lg shadow-md p-6 border transition-colors duration-300 flex flex-col items-center ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex justify-between items-center w-full mb-4">
        <h2
          className={`text-lg font-semibold ${
            darkMode ? "text-gray-100" : "text-gray-900"
          }`}
        >
          Financial Summary (Over Time)
        </h2>
        <button
          onClick={handleExport}
          aria-label="Export chart as PNG"
          className={`px-3 py-1 rounded-lg font-medium transition-colors hover:scale-105 ${
            darkMode
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Export PNG
        </button>
      </div>
      <div className="overflow-hidden w-full flex justify-center">
        <LineChart
          width={chartDimensions.width}
          height={chartDimensions.height}
          data={financialSummary.timeSeries}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          style={{ transition: "transform 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
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
            tick={{ fill: darkMode ? "#E5E7EB" : "#1F2937" }}
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
            tick={{ fill: darkMode ? "#E5E7EB" : "#1F2937" }}
            tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? "#1F2937" : "#F9FAFB",
              color: darkMode ? "#E5E7EB" : "#1F2937",
              border: `1px solid ${darkMode ? "#4B5563" : "#9CA3AF"}`,
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
            dataKey="expenses"
            stroke={darkMode ? "#F87171" : "#EF4444"} // Lighter red in dark mode
            name="Expenses"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="earnings"
            stroke={darkMode ? "#34D399" : "#10B981"} // Lighter green in dark mode
            name="Earnings"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="profitLoss"
            stroke={darkMode ? "#60A5FA" : "#3B82F6"} // Lighter blue in dark mode
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
          darkMode={darkMode} // Pass darkMode to Toast
        />
      )}
    </div>
  );
};

export default FinancialSummaryLineChart;