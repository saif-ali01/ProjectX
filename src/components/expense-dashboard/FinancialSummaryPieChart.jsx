import React, { useRef, useEffect, useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { COLORS } from "../../utils/constants";

const FinancialSummaryPieChart = ({ financialSummary, darkMode }) => {
  const chartContainerRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 500, height: 300 });

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
      link.download = "financial_summary_pie_chart.png";
      link.click();
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
          Financial Summary (Pie)
        </h2>
        <button
          onClick={handleExport}
          className="px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors hover:scale-105"
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
                fill={COLORS[index % COLORS.length]}
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
              border: darkMode ? "1px solid #4B5563" : "1px solid #9CA3AF",
              borderRadius: "4px",
              padding: "8px",
            }}
            formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
          />
        </PieChart>
      </div>
    </div>
  );
};

export default FinancialSummaryPieChart;