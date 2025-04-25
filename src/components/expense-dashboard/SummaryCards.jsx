import React from "react";

const SummaryCards = ({ summary, darkMode }) => {
  // Handle empty summary data
  if (!summary || summary.length === 0) {
    return (
      <div
        className={`rounded-lg shadow-md p-6 border transition-colors duration-300 ${
          darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <p>No summary data available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {summary.map((item, idx) => (
        <div
          key={idx}
          className={`rounded-lg shadow-md p-6 flex items-center gap-4 border transition-all duration-300 hover:shadow-lg ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700"
              : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50"
          }`}
        >
          <div className="text-3xl">{item.icon}</div>
          <div>
            <div
              className={`text-sm font-medium ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {item.title}
            </div>
            <div className="font-bold text-xl">
              {item.value}
            </div>
            {item.title.includes("Total") && idx % 2 === 0 ? (
              <div
                className={`text-sm ${
                  darkMode ? "text-green-400" : "text-green-600"
                }`}
              >
                ↑ 5% from last period
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;