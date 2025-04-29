import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FormField from "../../../components/common/FormField";

// Component to generate reports based on user input
const ReportGenerator = ({ reportParams, onGenerate, darkMode }) => {
  const [params, setParams] = useState(reportParams);

  // Handle input changes
  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  // Handle date picker changes
  const handleDateChange = (date, name) => {
    setParams({ ...params, [name]: date });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(params);
  };

  return (
    <div className={`p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6 ${darkMode ? "bg-gray-800" : "bg-gray-100"} transition-colors duration-300`}>
      <h2 className={`text-base sm:text-lg lg:text-xl font-semibold mb-4 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Generate Report</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Start Date</label>
          <DatePicker
            selected={params.startDate}
            onChange={(date) => handleDateChange(date, "startDate")}
            className={`w-full p-1 sm:p-2 text-sm sm:text-base border rounded-lg ${darkMode ? "border-gray-600 bg-gray-700 text-gray-100" : "border-gray-300 bg-gray-50 text-gray-900"}`}
          />
        </div>
        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>End Date</label>
          <DatePicker
            selected={params.endDate}
            onChange={(date) => handleDateChange(date, "endDate")}
            className={`w-full p-1 sm:p-2 text-sm sm:text-base border rounded-lg ${darkMode ? "border-gray-600 bg-gray-700 text-gray-100" : "border-gray-300 bg-gray-50 text-gray-900"}`}
          />
        </div>
        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Report Type</label>
          <FormField
            type="select"
            name="type"
            value={params.type}
            onChange={handleChange}
            className={`w-full p-1 sm:p-2 text-sm sm:text-base border rounded-lg ${darkMode ? "border-gray-600 bg-gray-700 text-gray-100" : "border-gray-300 bg-gray-50 text-gray-900"}`}
          >
            <option value="category">By Category</option>
            <option value="monthly">Monthly Summary</option>
            <option value="yearly">Yearly Summary</option>
          </FormField>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className={`w-full px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base bg-[#b8966f] text-white rounded-lg hover:bg-[#a7845f] transition-colors hover:scale-105`}
          >
            Generate
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportGenerator;