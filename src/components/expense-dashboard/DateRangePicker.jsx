import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// DateRangePicker component for selecting date range and time frame
const DateRangePicker = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  timeFrame,
  setTimeFrame,
  setAddModalOpen,
  darkMode,
}) => {
  return (
    <div
      className={`rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6 border transition-colors duration-300 ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <div>
            <label
              className={`block text-sm font-medium mb-1 sm:mb-2 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Start Date:
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className={`w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              }`}
              popperClassName={darkMode ? "dark-datepicker" : "light-datepicker"}
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-1 sm:mb-2 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              End Date:
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className={`w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              }`}
              popperClassName={darkMode ? "dark-datepicker" : "light-datepicker"}
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-1 sm:mb-2 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Time Frame:
            </label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className={`w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              }`}
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-transform hover:scale-105 text-sm sm:text-base ${
            darkMode
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Add Expense
        </button>
      </div>
    </div>
  );
};

export default DateRangePicker;