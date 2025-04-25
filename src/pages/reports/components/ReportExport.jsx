import React from "react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ReportExport = ({ reportData, darkMode, reportType }) => {
  const exportCSV = () => {
    const csv = Papa.unparse(reportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerHeight = 20;
    const currentDate = new Date().toLocaleDateString();

    // Header
    doc.setFillColor(184, 150, 111);
    doc.rect(0, 0, pageWidth, 20, "F");
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Star Printing - Financial Report", pageWidth / 2, 15, { align: "center" });

    // Table
    doc.autoTable({
      head: [["Name", "Total"]],
      body: reportData.map((item) => [
        item.category || item.month || item.year || "Unknown",
        `₹${item.total.toLocaleString("en-IN")}`,
      ]),
      startY: 30,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2, textColor: darkMode ? [229, 231, 235] : [80, 80, 80] },
      headStyles: {
        fillColor: darkMode ? [167, 132, 95] : [184, 150, 111],
        textColor: [255, 255, 255],
      },
      columnStyles: {
        1: { halign: "right" },
      },
      margin: { bottom: footerHeight },
      didParseCell: (data) => {
        if (data.section === "body") {
          data.cell.styles.fillColor = data.row.index % 2 === 0
            ? darkMode ? [31, 41, 55] : [255, 255, 255]
            : darkMode ? [55, 65, 81] : [245, 245, 220];
        }
      },
    });

    // Footer
    doc.setFillColor(184, 150, 111);
    doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 15, { align: "center" });
    doc.text("Contact: +91 9350432551 | 1F-51, Faridabad", pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text(`Generated on: ${currentDate}`, pageWidth / 2, pageHeight - 5, { align: "center" });

    doc.save(`report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div
      className={`p-6 rounded-lg shadow-md ${
        darkMode
          ? "bg-gray-800 shadow-lg border border-gray-700"
          : "bg-gray-100"
      } transition-colors duration-300`}
    >
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Export Report
      </h2>
      <div className="flex gap-4">
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-[#b8966f] text-white rounded-lg hover:bg-[#a7845f] transition hover:scale-105"
        >
          Export as CSV
        </button>
        <button
          onClick={exportPDF}
          className="px-4 py-2 bg-[#b8966f] text-white rounded-lg hover:bg-[#a7845f] transition hover:scale-105"
        >
          Export as PDF
        </button>
      </div>
    </div>
  );
};

export default ReportExport;