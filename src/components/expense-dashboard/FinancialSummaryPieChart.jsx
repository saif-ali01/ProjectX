import React, { useRef, useEffect, useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import Toast from "../../components/common/Toast";

// Define COLORS with light/dark mode variants
const COLORS = [
  { light: "#3B82F6", dark: "#60A5FA" }, // Blue
  { light: "#10B981", dark: "#34D399" }, // Green
  { light: "#EF4444", dark: "#F87171" }, // Red
  { light: "#F59E0B", dark: "#FBBF24" }, // Yellow
  { light: "#8B5CF6", dark: "#A78BFA" }, // Purple
];

const FinancialSummaryPieChart = ({ financialSummary, darkMode }) => {
  const chartContainerRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 500, height: 300 });
  const [toast, setToast] = useState(null);

  // Dynamically set chart dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const { offsetWidth } = chartContainerRef.current;
        const width = Math.min(offsetWidth - 40, 600); // Account for padding
        const height = Math.max(width * 0.7, 300); // Adjusted for pie chart aspect ratio
        setChartDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleExport = () => {
    const svg = chartContainerRef.current.querySelector("svg");
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
      link.download = "financial_summary_pie_chart.png";
      link.click();
      setToast({ message: "Chart exported successfully", type: "success" });
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // Handle empty data
  if (!financialSummary?.pieData || financialSummary.pieData.length === 0) {
    return (
      <div
        className={`rounded-lg shadow-md p-6 border transition-colors duration-300 flex flex-col items-center ${
          darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <h2 className="text-lg font-semibold mb-4">Financial Summary (Pie)</h2>
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
          Financial Summary (Pie)
        </h2>
        <button
          onClick={handleExport}
          aria-label="Export pie chart as PNG"
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
        <PieChart width={chartDimensions.width} height={chartDimensions.height}>
          <Pie
            data={financialSummary.pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={Math.min(chartDimensions.width, chartDimensions.height) * 0.3}
            style={{ cursor: "pointer" }}
            isAnimationActive={true}
            animationDuration={600}
          >
            {financialSummary.pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  darkMode
                    ? COLORS[index % COLORS.length].dark
                    : COLORS[index % COLORS.length].light
                }
                style={{ transition: "transform 0.2s", cursor: "pointer" }}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              />
            ))}
          </Pie>
          <Legend
            formatter={(value) => (
              <span style={{ color: darkMode ? "#E5E7EB" : "#1F2937" }}>
                {value}
              </span>
            )}
            wrapperStyle={{ paddingTop: "10px" }}
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
        </PieChart>
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

export default FinancialSummaryPieChart;