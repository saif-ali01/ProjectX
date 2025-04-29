import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Component to render a bar chart for report data
const ReportChart = ({ reportData, reportType, darkMode }) => {
  // Transform reportData into chart-compatible format
  const data = (reportData ?? []).map((item) => ({
    name: item.category || item.month || item.year || "Unknown",
    value: item.total,
  }));

  // Format Y-axis ticks as currency
  const formatYAxis = (value) => `₹${value.toLocaleString("en-IN")}`;

  return (
    <div className={`p-0 sm:p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800 border-gray-600" : "bg-gray-100 border-gray-200"} transition-colors duration-300`}>
      <h2 className={`text-base sm:text-lg lg:text-xl font-semibold mb-4 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
        {reportType === "category" && "Expenses by Category"}
        {reportType === "monthly" && "Monthly Expenses"}
        {reportType === "yearly" && "Yearly Expenses"}
      </h2>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <XAxis
            dataKey="name"
            stroke={darkMode ? "#e5e7eb" : "#1f2937"}
            tick={{ fill: darkMode ? "#e5e7eb" : "#1f2937", fontSize: window.innerWidth < 640 ? 10 : 12 }}
          />
          <YAxis
            stroke={darkMode ? "#e5e7eb" : "#1f2937"}
            tick={{ fill: darkMode ? "#e5e7eb" : "#1f2937", fontSize: window.innerWidth < 640 ? 10 : 12 }}
            tickFormatter={formatYAxis}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? "#1f2937" : "#ffffff",
              borderColor: darkMode ? "#4b5563" : "#d1d5db",
              borderRadius: "8px",
              color: darkMode ? "#f3f4f6" : "#111827",
              fontSize: window.innerWidth < 640 ? "12px" : "14px",
            }}
            itemStyle={{ color: darkMode ? "#e5e7eb" : "#1f2937" }}
            formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Total"]}
          />
          <Legend wrapperStyle={{ paddingTop: "10px", color: darkMode ? "#e5e7eb" : "#1f2937", fontSize: window.innerWidth < 640 ? 12 : 14 }} />
          <Bar dataKey="value" name="Total Amount" fill={darkMode ? "#a7845f" : "#b8966f"} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {data.length === 0 && (
        <p className={`text-center mt-4 text-sm sm:text-base ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          No data available for selected parameters
        </p>
      )}
    </div>
  );
};

export default ReportChart;