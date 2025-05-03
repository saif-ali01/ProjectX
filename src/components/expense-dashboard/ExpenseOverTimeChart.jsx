import React, { useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Toast from "../../components/common/Toast";

const ExpenseOverTimeChart = ({ overTime, timeFrame, darkMode }) => {
  const chartContainerRef = useRef(null);
  const [toast, setToast] = useState(null);

  const handleExport = () => {
    try {
      const chartContainer = chartContainerRef.current;
      if (!chartContainer) {
        setToast({ message: "Chart container not found", type: "error" });
        return;
      }

      const svg = chartContainer.querySelector(".recharts-surface");
      if (!svg) {
        setToast({ message: "Chart SVG not found for export", type: "error" });
        return;
      }

      const clonedSvg = svg.cloneNode(true);
      clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      const svgData = new XMLSerializer().serializeToString(clonedSvg);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        try {
          canvas.width = img.width * 2;
          canvas.height = img.height * 2;
          ctx.scale(2, 2);
          ctx.drawImage(img, 0, 0);

          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = "expense_over_time.png";
          link.click();

          setToast({ message: "Chart exported successfully", type: "success" });
        } catch (err) {
          console.error("Error rendering canvas:", err);
          setToast({ message: "Failed to export chart", type: "error" });
        }
      };

      img.onerror = () => {
        setToast({ message: "Failed to load SVG for export", type: "error" });
      };

      const encodedSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
      img.src = encodedSvg;
    } catch (err) {
      console.error("Export error:", err);
      setToast({ message: "An error occurred while exporting the chart", type: "error" });
    }
  };

  if (!overTime || overTime.length === 0) {
    return (
      <div
        className={`rounded-lg shadow-md p-4 sm:p-6 border transition-colors duration-300 flex flex-col items-center max-w-full ${
          darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <h2 className="text-base sm:text-lg font-semibold mb-4">Expense Over Time</h2>
        <p className="text-sm sm:text-base">No data available for the selected time frame.</p>
      </div>
    );
  }

  return (
    <div
      ref={chartContainerRef}
      className={`rounded-lg shadow-md p-4 sm:p-6 border transition-colors duration-300 max-w-full ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2
          className={`text-base sm:text-lg font-semibold ${
            darkMode ? "text-gray-100" : "text-gray-900"
          }`}
        >
          Expense Over Time
        </h2>
        <button
          onClick={handleExport}
          disabled={!overTime?.length}
          aria-label="Export chart as PNG"
          className={`px-3 py-1 rounded-lg font-medium transition-transform hover:scale-105 text-sm sm:text-base mt-2 sm:mt-0 ${
            darkMode
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } ${!overTime?.length ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Export PNG
        </button>
      </div>
      <div className="w-full h-[300px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={overTime}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
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
              tick={{
                fill: darkMode ? "#E5E7EB" : "#1F2937",
                fontSize: "0.75rem",
              }}
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
              tick={{
                fill: darkMode ? "#E5E7EB" : "#1F2937",
                fontSize: "0.75rem",
              }}
              tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? "#1F2937" : "#F9FAFB",
                color: darkMode ? "#E5E7EB" : "#1F2937",
                border: `1px solid ${darkMode ? "#4B5563" : "#9CA3AF"}`,
                borderRadius: "8px",
                padding: "12px",
                fontSize: "0.9rem",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                zIndex: 1000,
              }}
              formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, ""]}
              itemStyle={{ padding: "4px 0" }}
            />
            <Legend
              wrapperStyle={{
                color: darkMode ? "#E5E7EB" : "#1F2937",
                fontSize: "0.85rem",
                paddingTop: "10px",
              }}
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
            />
            <Line
              type="monotone"
              dataKey="personal"
              stroke={darkMode ? "#60A5FA" : "#3B82F6"}
              name="Personal"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 6,
                fill: darkMode ? "#60A5FA" : "#3B82F6",
                strokeWidth: 2,
              }}
            />
            <Line
              type="monotone"
              dataKey="professional"
              stroke={darkMode ? "#34D399" : "#10B981"}
              name="Professional"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 6,
                fill: darkMode ? "#34D399" : "#10B981",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
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

export default ExpenseOverTimeChart;