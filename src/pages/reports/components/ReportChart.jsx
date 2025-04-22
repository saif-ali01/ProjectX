import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ReportChart = ({ reportData, reportType, darkMode }) => {
  // Transform data based on reportType
  const data = reportData.map((item) => ({
    name: item.category || item.month || item.year,
    amount: item.total,
  }));

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        {reportType === "category" ? "Expenses by Category" : reportType === "monthly" ? "Monthly Expenses" : "Yearly Expenses"}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke={darkMode ? "#fff" : "#000"} />
          <YAxis stroke={darkMode ? "#fff" : "#000"} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? "#1F2937" : "#fff",
              color: darkMode ? "#fff" : "#000",
            }}
          />
          <Legend />
          <Bar dataKey="amount" fill={darkMode ? "#60A5FA" : "#3B82F6"} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReportChart;