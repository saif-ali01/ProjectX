import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReportGenerator from "./components/ReportGenerator";
import ReportChart from "./components/ReportChart";
import ReportExport from "./components/ReportExport";
import { api } from "../../utils/api";
import Spinner from "../../components/common/Spinner";
import Toast from "../../components/common/Toast";

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

  // Sync dark class with darkMode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

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
      setReportData(response.data.data);
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

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Spinner darkMode={darkMode} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="p-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg shadow-md dark:shadow-lg dark:border dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-3">Error Loading Reports</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => navigate("/expenses")}
            className="px-4 py-2 bg-[#b8966f] text-white rounded-lg hover:bg-[#a7845f] dark:bg-[#b8966f] dark:hover:bg-[#a7845f] transition-colors hover:scale-105"
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
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <header
        className={`p-6 rounded-t-lg shadow-lg flex justify-between items-center text-white ${
          darkMode
            ? "bg-blue-600"
            : "bg-blue-500"
        }`}
      >
        <h1 className="text-2xl font-bold tracking-tight">Star Printing - Reports</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors hover:scale-105"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          <button
            onClick={() => navigate("/expenses")}
            className="px-4 py-2 bg-[#b8966f] text-white rounded-lg hover:bg-[#a7845f] dark:bg-[#b8966f] dark:hover:bg-[#a7845f] transition-colors hover:scale-105"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className={`mt-6 rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"} p-6 shadow-lg dark:shadow-lg dark:border dark:border-gray-700`}>
        <ReportGenerator
          reportParams={reportParams}
          onGenerate={handleGenerateReport}
          darkMode={darkMode}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-fade-in">
          <ReportChart
            reportData={reportData}
            reportType={reportParams.type}
            darkMode={darkMode}
          />
          <ReportExport
            reportData={reportData}
            darkMode={darkMode}
            reportType={reportParams.type}
          />
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default Reports;