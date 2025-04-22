import React from "react";

const SummaryCards = ({ summary, darkMode }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {summary.map((item, idx) => (
        <div
          key={idx}
          className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-md p-6 flex items-center gap-4 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="text-3xl">{item.icon}</div>
          <div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              {item.title}
            </div>
            <div className="font-bold text-xl text-gray-900 dark:text-gray-100">
              {item.value}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              {item.title.includes("Total") && idx % 2 === 0
                ? "↑ 5% from last period"
                : ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
