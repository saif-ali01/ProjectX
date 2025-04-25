import React, { useRef, useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

const ExpenseOverTimeChart = ({ overTime, timeFrame, darkMode }) => {
  const chartContainerRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 500, height: 300 });

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
    const svg = document.querySelector(".recharts-surface");
    if (!svg) {
      alert("Chart not found for export");
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
      link.download = "expense_over_time.png";
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div
      ref={chartContainerRef}
      className={`rounded-lg shadow-md p-6 border transition-colors duration-300 ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2
          className={`text-lg font-semibold ${
            darkMode ? "text-gray-100" : "text-gray-900"
          }`}
        >
          Expense Over Time
        </h2>
        <button
          onClick={handleExport}
          className={`px-3 py-1 rounded-lg font-medium transition-colors hover:scale-105 ${
            darkMode
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Export PNG
        </button>
      </div>
      <div className="overflow-hidden">
        <LineChart
          width={chartDimensions.width}
          height={chartDimensions.height}
          data={overTime}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
              border: `1px solid ${darkMode ? "#4B5563" : "#9CA3AF"}`,
              borderRadius: "4px",
            }}
            formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
          />
          <Legend
            wrapperStyle={{ color: darkMode ? "#E5E7EB" : "#1F2937" }}
          />
          <Line
            type="monotone"
            dataKey="personal"
            stroke={darkMode ? "#60A5FA" : "#3B82F6"} // Lighter blue in dark mode
            name="Personal"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="professional"
            stroke={darkMode ? "#34D399" : "#10B981"} // Lighter green in dark mode
            name="Professional"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </div>
    </div>
  );
};

export default ExpenseOverTimeChart;