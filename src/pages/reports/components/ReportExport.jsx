import React from "react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ReportExport = ({ reportData, darkMode }) => {
  const exportCSV = () => {
    const csv = Papa.unparse(reportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "report.csv";
    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Financial Report", 14, 20);
    doc.autoTable({
      head: [["Name", "Total"]],
      body: reportData.map((item) => [
        item.category || item.month || item.year,
        `₹${item.total.toLocaleString("en-IN")}`,
      ]),
      startY: 30,
    });
    doc.save("report.pdf");
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Export Report
      </h2>
      <div className="flex gap-4">
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition"
        >
          Export as CSV
        </button>
        <button
          onClick={exportPDF}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
        >
          Export as PDF
        </button>
      </div>
    </div>
  );
};

export default ReportExport;