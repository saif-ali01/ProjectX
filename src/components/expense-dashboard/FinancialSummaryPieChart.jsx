import React, { useRef, useEffect, useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import Toast from "../../components/common/Toast";

// Define COLORS with light/dark mode variants
const COLORS = [
  { light: "#3B82F6", dark: "#60A5FA" },
  { light: "#10B981", dark: "#34D399" },
  { light: "#EF4444", dark: "#F87171" },
  { light: "#F59E0B", dark: "#FBBF24" },
  { light: "#8B5CF6", dark: "#A78BFA" },
];

// FinancialSummaryPieChart component for visualizing financial summary as a pie chart
const FinancialSummaryPieChart = ({ financialSummary, darkMode }) => {
  const chartContainerRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 400, height: 250 });
  const [toast, setToast] = useState(null);

  // Dynamically set chart dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const { offsetWidth } = chartContainerRef.current;
        const width = Math.min(offsetWidth, 600); // Cap max width
        const height = Math.max(width * 0.75, 250); // Adjusted for pie chart
        setChartDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Export chart as PNG
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
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
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
        className={`rounded-lg shadow-md p-4 sm:p-6 border transition-colors duration-300 flex flex-col items-center max-w-full ${
          darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <h2 className="text-base sm:text-lg font-semibold mb-4">Financial Summary (Pie)</h2>
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
          Financial Summary (Pie)
        </h2>
        <button
          onClick={handleExport}
          aria-label="Export pie chart as PNG"
          className={`px-3 py-1 rounded-lg font-medium transition-transform hover:scale-105 text-sm sm:text-base mt-2 sm:mt-0 ${
            darkMode
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Export PNG
        </button>
      </div>
      <div className="overflow-hidden w-full flex justify-center">
      <PieChart 
          width={chartDimensions.width}
          height={chartDimensions.height}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <Pie
            data={financialSummary.pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={chartDimensions.width * 0.35}
            innerRadius={chartDimensions.width * 0.2}
            paddingAngle={2}
            cornerRadius={6}
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
                stroke={darkMode ? "#1F2937" : "#F9FAFB"}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Legend
            formatter={(value) => (
              <span className={darkMode ? "text-gray-200" : "text-gray-900"} 
                style={{ fontSize: '0.85rem' }}>
                {value}
              </span>
            )}
            wrapperStyle={{ 
              paddingTop: "20px",
              fontSize: '0.85rem',
              maxWidth: chartDimensions.width - 60
            }}
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? "#1F2937" : "#F9FAFB",
              border: `1px solid ${darkMode ? "#4B5563" : "#9CA3AF"}`,
              borderRadius: "8px",
              padding: "12px",
              fontSize: "0.9rem",
            }}
            itemStyle={{
              color: darkMode ? "#FFFFFF" : "#1F2937",
              fontSize: "0.9rem",
              padding: "2px 0",
            }}
            formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
          />
        </PieChart>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} darkMode={darkMode} />}
    </div>
  );
};

export default FinancialSummaryPieChart;