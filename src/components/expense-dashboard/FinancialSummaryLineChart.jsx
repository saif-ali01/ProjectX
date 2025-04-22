import React, { useRef, useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
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
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "financial_summary_line.png";
      link.click();
      setToast({ message: "Chart exported successfully", type: "success" });
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div
      ref={chartContainerRef}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border ${
        darkMode ? "border-gray-700" : "border-gray-200"
      } flex flex-col items-center animate-fade-in`}
    >
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Financial Summary (Over Time)
        </h2>
        <button
          onClick={handleExport}
          className="px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors hover:scale-105"
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
            dataKey="expenses"
            stroke="#EF4444"
            name="Expenses"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="earnings"
            stroke="#10B981"
            name="Earnings"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="profitLoss"
            stroke="#3B82F6"
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
        />
      )}
    </div>
  );
};

export default FinancialSummaryLineChart;