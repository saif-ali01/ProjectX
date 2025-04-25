import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ReportChart = ({ reportData, reportType, darkMode }) => {
  // Transform data based on reportType
  const data = reportData.map((item) => ({
    name: item.category || item.month || item.year,
    amount: item.total,
  }));

  return (
    <div
      className={`p-6 rounded-lg shadow-md ${
        darkMode
          ? "bg-gray-800 border border-gray-600 shadow-lg"
          : "bg-gray-100 border-gray-200"
      } transition-colors duration-300`}
    >
      <h2
        className={`text-lg font-semibold mb-4 ${
          darkMode ? "text-gray-100" : "text-gray-900"
        }`}
      >
        {reportType === "category"
          ? "Expenses by Category"
          : reportType === "monthly"
          ? "Monthly Expenses"
          : "Yearly Expenses"}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke={darkMode ? "#fff" : "#000"} />
          <YAxis stroke={darkMode ? "#fff" : "#000"} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? "#1F2937" : "#fff",
              color: darkMode ? "#fff" : "#000",
              border: darkMode ? "1px solid #4B5563" : "1px solid #D1D5DB",
              borderRadius: "4px",
            }}
          />
          <Legend
            wrapperStyle={{ color: darkMode ? "#e5e7eb" : "#111827" }}
          />
          <Bar
            dataKey="amount"
            fill={darkMode ? "#a7845f" : "#b8966f"}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReportChart;