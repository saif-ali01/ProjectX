import React, { Component } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import leaf from "../../assets/leaf.png";
import starlogo from "../../assets/starlogo.png";

// InvoiceBill component for previewing and downloading invoices
const InvoiceBill = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Fallback data for invoice
  const {
    partyName = "Shree Printo Graphics",
    serialNumber = "123",
    date = new Date().toLocaleDateString(),
    rows = [
      { description: "Book 1/3", quantity: 1, rate: 30, total: 30 },
      { description: "Business Card Design", quantity: 2, rate: 60, total: 120 },
      { description: "Pad 1/4", quantity: 3, rate: 7, total: 21 },
      { description: "Book 1/4", quantity: 100, rate: 25, total: 2500 },
      { description: "Pad 1/6", quantity: 71, rate: 6, total: 426 },
    ],
    currentTotal = 3097,
    previousBalance = 0,
    grandTotal = 3097,
  } = state || {};

  // Generate and download PDF invoice
  const handleDownloadPdf = async () => {
    try {
      // Load leaf image
      const leafBlob = await fetch(leaf).then((res) => res.blob());
      const leafBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(leafBlob);
      });

      // Load star logo image
      const starBlob = await fetch(starlogo).then((res) => res.blob());
      const starBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(starBlob);
      });

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Add leaf images to corners
      const leafWidth = 70;
      const leafHeight = 55;
      const verticalOffset = 5;
      doc.addImage(leafBase64, "PNG", -20, -10 - verticalOffset, leafWidth + 20, leafHeight + 10);
      doc.addImage(leafBase64, "PNG", pageWidth - 70, -10 - verticalOffset, leafWidth + 20, leafHeight + 10);

      // Add circle and star logo
      doc.setFillColor(210, 174, 141);
      doc.circle(pageWidth / 2 - 33, 20, 10, "F");
      doc.addImage(starBase64, "PNG", pageWidth / 2 - 40, 13, 15, 15); // Star logo centered in circle
      doc.setFontSize(30);
      doc.setFont("times", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("INVOICE", pageWidth / 2, 27, { align: "center", charSpace: 2 });

      // Add separator line
      doc.setFillColor(240, 210, 181);
      doc.rect(60, 34, pageWidth - 125, 5, "F");

      // Main table with centered headers for Qty, Price, Total
      autoTable(doc, {
        startY: 50,
        head: [["Sr No.", "Description", "Qty", "Price", "Total"]],
        body: rows.map((row, index) => [
          (index + 1).toString(),
          row.description,
          row.quantity.toString(),
          row.rate.toFixed(2),
          row.total.toFixed(2),
        ]),
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 2, textColor: [80, 80, 80] },
        headStyles: { fillColor: [240, 240, 240], textColor: [80, 80, 80] },
        columnStyles: {
          0: { halign: "center", cellWidth: 20 },
          1: { halign: "left" },
          2: { halign: "right", cellWidth: 20 },
          3: { halign: "right", cellWidth: 30 },
          4: { halign: "right", cellWidth: 30 },
        },
        didParseCell: (data) => {
          if (data.section === "head") {
            if (["Qty", "Price", "Total"].includes(data.cell.text[0])) {
              data.cell.styles.halign = "center";
            } else {
              data.cell.styles.halign = "left";
            }
          }
        },
      });

      // Totals table
      const finalY = doc.lastAutoTable.finalY || 80;
      const totalsData = previousBalance <= 0
        ? [["Total", `RS${currentTotal.toFixed(2)}`]]
        : [
            ["Total", `RS ${currentTotal.toFixed(2)}`],
            ["Previous Balance", `RS ${previousBalance.toFixed(2)}`],
            ["Grand Total", `RS ${grandTotal.toFixed(2)}`],
          ];

      autoTable(doc, {
        startY: finalY,
        body: totalsData,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 2, textColor: [80, 80, 80], fontStyle: "bold" },
        columnStyles: {
          0: { halign: "center", cellWidth: 137 },
          1: { halign: "right" },
        },
        headStyles: { fillColor: [240, 240, 240], textColor: [80, 80, 80] },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 0) {
            data.cell.styles.fontStyle = "bold";
          }
        },
      });

      // Payment method details
      const totalsTableFinalY = doc.lastAutoTable.finalY || finalY + 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Payment Method", 20, totalsTableFinalY + 10);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Bank Name: Liceria & Co.", 20, totalsTableFinalY + 15);
      doc.text("Account No: 123-1213-768776", 20, totalsTableFinalY + 20);

      // Footer section
      const footerY = pageHeight - 40;
      doc.setFillColor(210, 174, 141);
      doc.rect(20, footerY, pageWidth - 40, 30, "F");
      doc.setFontSize(16);
      doc.setFont("times", "normal");
      doc.setTextColor(255, 255, 255);
      doc.text("Star Printing", 25, footerY + 8);
      doc.setFontSize(10);
      doc.text(`Invoice No: ${serialNumber}`, 25, footerY + 13);
      doc.text(`Date: ${date}`, 25, footerY + 18);
      doc.setFontSize(15);
      doc.text("Invoice For:", pageWidth - 60, footerY + 5);
      doc.setFontSize(12);
      doc.text(partyName, pageWidth - 60, footerY + 10);
      doc.setFontSize(9);
      doc.text("Phone: +91 93-5043-2551", pageWidth / 2, footerY + 20, { align: "center" });
      doc.text("Address: 1F-51 Faridabad, Haryana, India", pageWidth / 2, footerY + 25, { align: "center" });

      // Thank you message
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text("Thank you for Purchase", pageWidth / 2, footerY + 35, { align: "center" });

      doc.save(`invoice_${serialNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Check the console for details.");
    }
  };

  // Error boundary for render error handling
  class ErrorBoundary extends Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
      return { error: error.message || "An unexpected error occurred" };
    }

    componentDidCatch(error, errorInfo) {
      console.error("Error in InvoiceBill:", error, errorInfo);
    }

    render() {
      if (this.state.error) {
        return (
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <div className="p-6 bg-red-100 text-red-700 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-3">Error Loading Invoice</h2>
              <p className="mb-4">{this.state.error}</p>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors hover:scale-105"
              >
                Go to Home
              </button>
            </div>
          </div>
        );
      }
      return this.props.children;
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 text-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-5 md:p-6 lg:p-8">
          {/* Header */}
          <div className="rounded-xl xs:rounded-2xl shadow-lg p-4 xs:p-5 sm:p-6 md:p-8 bg-white mb-6 xs:mb-7 sm:mb-8 md:mb-10 animate-fade-in border border-gray-200">
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold mb-1 xs:mb-2 sm:mb-3 md:mb-4">
              Invoice Preview
            </h1>
            <p className="text-xs xs:text-sm sm:text-base text-gray-700 leading-tight xs:leading-normal">
              View and download your invoice for {partyName}.
            </p>
          </div>

          {/* Download Button */}
          <div className="mb-5 xs:mb-6 sm:mb-7 md:mb-8 text-center">
            <button
              onClick={handleDownloadPdf}
              className="px-3 xs:px-4 sm:px-5 py-1.5 xs:py-2 sm:py-3 bg-[#d2ae8d] text-white rounded-lg hover:bg-[#b8966f] hover:scale-105 transition-transform duration-200 text-sm xs:text-base sm:text-lg"
            >
              Download PDF
            </button>
          </div>

          {/* Invoice Card */}
          <div className="max-w-4xl mx-auto p-3 xs:p-4 sm:p-5 md:p-6 bg-white shadow-md rounded-xl xs:rounded-2xl relative border border-gray-200 overflow-hidden">
            {/* Leaf Images */}
            <div className="absolute top-0 left-0 pointer-events-none">
              <img
                src={leaf}
                alt="leaf"
                className="h-36 xs:h-40 sm:h-48 md:h-56 w-28 xs:w-32 sm:w-36 md:w-40 transform -translate-y-3 xs:-translate-y-4 -translate-x-3 xs:-translate-x-4 rotate-45 scale-x-200 opacity-80"
              />
            </div>
            <div className="absolute -top-6 xs:-top-7 right-0 pointer-events-none">
              <img
                src={leaf}
                alt="leaf"
                className="h-36 xs:h-40 sm:h-48 md:h-56 w-28 xs:w-32 sm:w-36 md:w-40 translate-y-3 xs:translate-y-4 translate-x-3 xs:translate-x-4 scale-x-200 opacity-80"
              />
            </div>

            {/* Header with Star and INVOICE */}
            <div className="flex justify-center items-center mb-3 xs:mb-4 sm:mb-5 md:mb-6 mt-4 xs:mt-5 sm:mt-6">
              <div className="h-10 xs:h-12 sm:h-14 w-10 xs:w-12 sm:w-14 bg-[#d2ae8d] rounded-full flex items-center justify-center mr-2 xs:mr-3 text-white text-2xl xs:text-3xl sm:text-4xl">
                ★
              </div>
              <h2 className="text-2xl xs:text-3xl sm:text-4xl font-serif font-normal tracking-[6px] xs:tracking-[8px] sm:tracking-[10px] text-gray-800">
                INVOICE
              </h2>
            </div>

            {/* Separator Line */}
            <div className="w-[70%] xs:w-[65%] sm:w-[60%] mx-auto bg-[rgb(240,210,181)] h-3 xs:h-4 sm:h-5 mb-3 xs:mb-4 sm:mb-5"></div>

            {/* Main Table */}
            <div className="mb-3 xs:mb-4 sm:mb-5 md:mb-6 px-1 xs:px-2 sm:px-3 overflow-x-auto">
              <table className="w-full text-xxs xs:text-xs sm:text-sm md:text-base border border-gray-300 border-collapse">
                <thead className="bg-gray-50 text-left">
                  <tr className="border-b border-gray-300">
                    <th className="py-1.5 xs:py-2 px-1.5 xs:px-2 sm:px-3 border-r border-gray-300 text-gray-800 min-w-[40px] xs:min-w-[50px]">
                      Sr No.
                    </th>
                    <th className="py-1.5 xs:py-2 px-1.5 xs:px-2 sm:px-3 border-r border-gray-300 text-gray-800">
                      Description
                    </th>
                    <th className="py-1.5 xs:py-2 px-1.5 xs:px-2 sm:px-3 text-right border-r border-gray-300 text-gray-800 min-w-[50px] xs:min-w-[60px]">
                      Qty
                    </th>
                    <th className="py-1.5 xs:py-2 px-1.5 xs:px-2 sm:px-3 text-right border-r border-gray-300 text-gray-800 min-w-[70px] xs:min-w-[80px]">
                      Price
                    </th>
                    <th className="py-1.5 xs:py-2 px-1.5 xs:px-2 sm:px-3 text-right text-gray-800 min-w-[70px] xs:min-w-[80px]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-1.5 xs:py-2 px-1.5 xs:px-2 sm:px-3 border-r border-gray-200 text-gray-800 text-center">
                        {index + 1}
                      </td>
                      <td className="py-1.5 xs:py-2 px-1.5 xs:px-2 sm:kpx-3 border-r border-gray-200 text-gray-800">
                        {row.description}
                      </td>
                      <td className="py-1.5 xs:py-2 px-1.5 xs:px-2 sm:px-3 text-right border-r border-gray-200 text-gray-800">
                        {row.quantity}
                      </td>
                      <td className="py-1.5 xs:py-2 px-1.5 xs:px-2 sm:px-3 text-right border-r border-gray-200 text-gray-800">
                        {row.rate.toFixed(2)}
                      </td>
                      <td className="py-1.5 xs:py-2 px-1.5 xs:px-2 sm:px-3 text-right text-gray-800">
                        {row.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Table */}
            <div className="mb-3 xs:mb-4 sm:mb-5 md:mb-6 px-1 xs:px-2 sm:px-3 overflow-x-auto">
              <table className="w-full text-xxs xs:text-xs sm:text-sm md:text-base border border-gray-300 border-collapse">
                <tbody>
                  {(() => {
                    const totals = [];
                    if (previousBalance === undefined || previousBalance === null || previousBalance <= 0) {
                      totals.push(["Total", `RS${currentTotal.toFixed(2)}`]);
                    } else {
                      totals.push(
                        ["Total", `RS ${currentTotal.toFixed(2)}`],
                        ["Previous Balance", `RS ${previousBalance.toFixed(2)}`],
                        ["Grand Total", `RS ${grandTotal.toFixed(2)}`]
                      );
                    }
                    return totals.map((row, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-1.5 xs:py-2 px-1.5 xs:px-2 sm:px-3 border-r border-gray-300 text-gray-800 text-center font-semibold w-1/2">
                          {row[0]}
                        </td>
                        <td className="py-1.5 xs:py-2 px-1.5 xs:px-2 sm:px-3 text-right text-gray-800">
                          {row[1]}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            {/* Payment Method */}
            <div className="text-xxs xs:text-xs sm:text-sm ml-4 md:text-base mb-3 xs:mb-4 sm:mb-5 md:mb-6 text-gray-800">
              <h3 className="font-semibold mb-0.5 xs:mb-1 text-xs xs:text-sm sm:text-base md:text-lg">
                Payment Method
              </h3>
              <p>Bank Name: Liceria & Co.</p>
              <p>Account No: 123-456-7890</p>
            </div>

            {/* Footer */}
            <div className="text-white px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3 mb-3 xs:mb-4 sm:mb-5 md:mb-6 bg-[#d2ae8d] rounded-lg">
              <div className="flex flex-col xs:flex-row justify-between gap-2 xs:gap-4">
                <div>
                  <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-serif mb-0.5 xs:mb-1">
                    Star Printing
                  </h1>
                  <p className="text-xxs xs:text-xs sm:text-sm">Invoice No: {serialNumber}</p>
                  <p className="text-xxs xs:text-xs sm:text-sm md:text-base">Date: {date}</p>
                </div>
                <div className="relative flex items-center justify-end -top-14">
                  <p className="text-sm xs:text-lg sm:text-xl">
                    <span className="font-semibold text-sm xs:text-base sm:text-lg md:text-xl">Invoice For:</span>{" "}
                    <br className="hidden xs:inline" />
                    {partyName}
                  </p>
                </div>
              </div>
              <div className="mt-2 xs:mt-2.5 sm:mt-3 md:mt-4 text-center text-xxs xs:text-xs sm:text-sm">
                <p>Phone: +91 93-5043-2551</p>
                <p>Address: 1F-51 Faridabad, Haryana, India</p>
              </div>
            </div>

            {/* Thank You */}
            <div className="text-xxs xs:text-xs sm:text-sm md:text-base">
              <p className="text-center text-gray-500 mb-4 xs:mb-5 sm:mb-6 md:mb-8">Thank you for Purchase</p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default InvoiceBill;