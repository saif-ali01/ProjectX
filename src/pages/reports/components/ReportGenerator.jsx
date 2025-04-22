import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FormField from "../../../components/common/FormField";

const ReportGenerator = ({ reportParams, onGenerate, darkMode }) => {
  const [params, setParams] = useState(reportParams);

  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date, name) => {
    setParams({ ...params, [name]: date });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(params);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Generate Report
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            Start Date
          </label>
          <DatePicker
            selected={params.startDate}
            onChange={(date) => handleDateChange(date, "startDate")}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            End Date
          </label>
          <DatePicker
            selected={params.endDate}
            onChange={(date) => handleDateChange(date, "endDate")}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <FormField
          type="select"
          name="type"
          value={params.type}
          onChange={handleChange}
          label="Report Type"
        >
          <option value="category">By Category</option>
          <option value="monthly">Monthly Summary</option>
          <option value="yearly">Yearly Summary</option>
        </FormField>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
          >
            Generate
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportGenerator;
