import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReportGenerator from "./components/ReportGenerator";
import ReportChart from "./components/ReportChart";
import ReportExport from "./components/ReportExport";
import { api } from "../../utils/api";
import Spinner from "../../components/common/Spinner";
import Toast from "../../components/common/Toast";

// Main Reports page component
const Reports = ({ darkMode }) => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [reportParams, setReportParams] = useState({
    startDate: new Date("2023-01-01"),
    endDate: new Date(),
    type: "category",
  });

  // Sync dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Fetch reports based on params
  useEffect(() => {
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
        setReportData(response.data.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Failed to load reports";
        setError(errorMessage);
        setToast({ message: errorMessage, type: "error" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, [reportParams]);

  // Handle report generation
  const handleGenerateReport = (params) => {
    setReportParams(params);
    setToast({ message: "Report generated successfully", type: "success" });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Spinner darkMode={darkMode} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className={`p-4 sm:p-6 rounded-lg shadow-md ${darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700"}`}>
          <h2 className={`text-base sm:text-lg font-semibold mb-3 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Error Loading Reports</h2>
          <p className={`mb-4 text-sm sm:text-base ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{error}</p>
          <button
            onClick={() => navigate("/expenses")}
            className={`px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors hover:scale-105`}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-7xl p-4 sm:p-6 min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <header className={`p-4 sm:p-6 rounded-t-lg shadow-lg flex flex-col sm:flex-row justify-between items-center text-white ${darkMode ? "bg-blue-600" : "bg-blue-500"}`}>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mb-2 sm:mb-0">Star Printing - Reports</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => navigate("/")}
            className={`px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-teal-700 transition-colors hover:scale-105`}
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className={`mt-4 sm:mt-6 rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"} p-4 sm:p-6 shadow-lg dark:border dark:border-gray-700`}>
        <ReportGenerator reportParams={reportParams} onGenerate={handleGenerateReport} darkMode={darkMode} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
          <ReportChart reportData={reportData} reportType={reportParams.type} darkMode={darkMode} />
          <ReportExport reportData={reportData} darkMode={darkMode} reportType={reportParams.type} />
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} darkMode={darkMode} />}
    </div>
  );
};

export default Reports;