import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReportGenerator from "./components/ReportGenerator";
import ReportChart from "./components/ReportChart";
import ReportExport from "./components/ReportExport";
import { api } from "../../utils/api";
import Spinner from "../../components/common/Spinner";
import Toast from "../../components/common/Toast";

const Reports = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [reportParams, setReportParams] = useState({
    startDate: new Date("2023-01-01"),
    endDate: new Date(),
    type: "category", // Options: category, monthly, yearly
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [reportParams]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await api.get("/reports", {
        params: {
          startDate: reportParams.startDate.toISOString(),
          endDate: reportParams.endDate.toISOString(),
          type: reportParams.type,
        },
      });
      setReportData(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to load reports";
      setError(errorMessage);
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = (params) => {
    setReportParams(params);
    setToast({ message: "Report generated successfully", type: "success" });
  };

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-3">Error Loading Reports</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => navigate("/expense")}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors hover:scale-105"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto max-w-7xl p-6 min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <header
        className={`p-6 rounded-t-lg shadow-lg flex justify-between items-center text-white ${
          isDarkMode
            ? "bg-gradient-to-r from-blue-600 to-indigo-700"
            : "bg-gradient-to-r from-blue-500 to-indigo-600"
        }`}
      >
        <h1 className="text-2xl font-bold tracking-tight">Star Printing - Reports</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors hover:scale-105"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          <button
            onClick={() => navigate("/expense")}
            className="px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hover:scale-105"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="mt-6">
        <ReportGenerator
          reportParams={reportParams}
          onGenerate={handleGenerateReport}
          isDarkMode={isDarkMode}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-fade-in">
          <ReportChart
            reportData={reportData}
            reportType={reportParams.type}
            isDarkMode={isDarkMode}
          />
          <ReportExport reportData={reportData} isDarkMode={isDarkMode} />
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Reports;