import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ReportChart = ({ reportData, reportType, darkMode }) => {
  // Add debug console log
  console.log("Chart Data:", reportData);

  // Safely handle reportData
  const data = (reportData ?? []).map((item) => ({
    name: item.category || item.month || item.year || "Unknown",
    value: item.total,
  }));

  // Custom tick formatter for currency
  const formatYAxis = (value) => `₹${value.toLocaleString("en-IN")}`;

  return (
    <div
      className={`p-6 rounded-lg shadow-md ${
        darkMode ? "bg-gray-800 border-gray-600" : "bg-gray-100 border-gray-200"
      } transition-colors duration-300`}
    >
      <h2
        className={`text-lg font-semibold mb-4 ${
          darkMode ? "text-gray-100" : "text-gray-900"
        }`}
      >
        {reportType === "category" && "Expenses by Category"}
        {reportType === "monthly" && "Monthly Expenses"}
        {reportType === "yearly" && "Yearly Expenses"}
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis
            dataKey="name"
            stroke={darkMode ? "#e5e7eb" : "#1f2937"}
            tick={{ fill: darkMode ? "#e5e7eb" : "#1f2937" }}
          />
          <YAxis
            stroke={darkMode ? "#e5e7eb" : "#1f2937"}
            tickFormatter={formatYAxis}
            tick={{ fill: darkMode ? "#e5e7eb" : "#1f2937" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? "#1f2937" : "#ffffff",
              borderColor: darkMode ? "#4b5563" : "#d1d5db",
              borderRadius: "8px",
              color: darkMode ? "#f3f4f6" : "#111827",
              fontSize: "14px",
            }}
            itemStyle={{
              color: darkMode ? "#e5e7eb" : "#1f2937",
            }}
            formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Total"]}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              color: darkMode ? "#e5e7eb" : "#1f2937",
            }}
          />
          <Bar
            dataKey="value"
            name="Total Amount"
            fill={darkMode ? "#a7845f" : "#b8966f"}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {data.length === 0 && (
        <p
          className={`text-center mt-4 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          No data available for selected parameters
        </p>
      )}
    </div>
  );
};

export default ReportChart;
