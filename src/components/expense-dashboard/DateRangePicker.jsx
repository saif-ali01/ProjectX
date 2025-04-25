import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
      className={`rounded-lg shadow-md p-6 mb-6 ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border transition-colors duration-300`}
    >
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Start Date:
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className={`p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
              className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              End Date:
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className={`p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
              className={`block text-sm font-medium mb2 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Time Frame:
            </label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className={`p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
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