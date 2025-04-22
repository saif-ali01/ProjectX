import React, { Component } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import leaf from "../../assets/leaf.png";

const InvoiceBill = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Use state data or fallback to defaults
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

  const handleDownloadPdf = async () => {
    try {
      const leafBlob = await fetch(leaf).then((res) => res.blob());
      const leafBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(leafBlob);
      });

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const leafWidth = 70;
      const leafHeight = 55;
      const verticalOffset = 5;
      doc.addImage(leafBase64, "PNG", pageWidth - 90, 10 - verticalOffset, leafWidth, leafHeight);

      doc.setFillColor(210, 174, 141);
      doc.circle(50, 40, 10, "F");
      doc.setFontSize(40);
      doc.setTextColor(255, 255, 255);
      doc.text("★", 50 - 6, 45);

      doc.setFontSize(30);
      doc.setFont("times", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("INVOICE", 50, 60, { align: "center", charSpace: 2 });

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date: ${date}`, pageWidth - 40, 65, { align: "right" });
      doc.text(`Invoice No: ${serialNumber}`, pageWidth - 40, 70, { align: "right" });

      doc.setFillColor(240, 210, 181);
      doc.rect(20, 75, pageWidth - 40, 5, "F");

      autoTable(doc, {
        startY: 100,
        head: [["Description", "Qty", "Price", "Total"]],
        body: rows.map((row) => [
          row.description,
          row.quantity.toString(),
          row.rate.toFixed(2),
          row.total.toFixed(2),
        ]),
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 2, textColor: [80, 80, 80] },
        headStyles: { fillColor: [240, 240, 240], textColor: [80, 80, 80] },
        columnStyles: {
          0: { halign: "left" },
          1: { halign: "right" },
          2: { halign: "right" },
          3: { halign: "right" },
        },
      });

      const finalY = doc.lastAutoTable.finalY || 80;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Sub Total: ${currentTotal.toFixed(2)}`, pageWidth - 20, finalY + 10, { align: "right" });
      if (previousBalance > 0) {
        doc.text(`Previous Balance: ${previousBalance.toFixed(2)}`, pageWidth - 20, finalY + 15, { align: "right" });
        doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, pageWidth - 20, finalY + 20, { align: "right" });
      } else {
        doc.text(`Total: ${currentTotal.toFixed(2)}`, pageWidth - 20, finalY + 15, { align: "right" });
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Payment Method", 20, finalY + 25);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Bank Name: Liceria & Co.", 20, finalY + 30);
      doc.text("Account No: 123-456-7890", 20, finalY + 35);

      const footerY = pageHeight - 40;
      doc.setFillColor(210, 174, 141);
      doc.rect(20, footerY, pageWidth - 40, 30, "F");

      doc.setFontSize(16);
      doc.setFont("times", "normal");
      doc.setTextColor(255, 255, 255);
      doc.text("Star Printing", 25, footerY + 8);
      doc.setFontSize(10);
      doc.text(`Invoice No: ${serialNumber}`, 25, footerY + 13);

      doc.text("Invoice For:", pageWidth - 60, footerY + 5);
      doc.setFontSize(12);
      doc.text(partyName, pageWidth - 60, footerY + 10);

      doc.setFontSize(9);
      doc.text("Phone: +91 93-5043-2551", pageWidth / 2, footerY + 20, { align: "center" });
      doc.text("Address: 1F-51 Faridabad, Haryana, India", pageWidth / 2, footerY + 25, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text("Thank you for Purchase", pageWidth / 2, footerY - 5, { align: "center" });

      doc.save(`invoice_${serialNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Check the console for details.");
    }
  };

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
          <div className="max-w-7xl mx-auto p-6">
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
      <div className="min-h-screen bg-white text-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <div className="rounded-2xl shadow-lg p-10 bg-white mb-8 animate-fade-in border border-gray-200">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Invoice Preview</h1>
              <p className="text-lg text-gray-700">
                View and download your invoice for {partyName}.
              </p>
            </div>
          </div>
          <div className="mb-4 text-center">
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-[#d2ae8d] text-white rounded hover:bg-[#b8966f] hover:scale-105 transition-transform"
            >
              Download PDF
            </button>
          </div>
          <div className="max-w-3xl mx-auto p-6 text-gray-800 bg-white shadow-md rounded-2xl relative overflow-hidden animate-fade-in border border-gray-200">
            <div className="absolute top-0 left-0">
              <img
                src={leaf}
                alt="leaf"
                className="h-60 w-44 transform relative bottom-14 scale-x-200 -translate-y-4 -translate-x-4 rotate-45"
              />
            </div>
            <div className="absolute top-0 right-0">
              <img
                src={leaf}
                alt="leaf"
                className="h-60 w-44 relative bottom-20 translate-y-4 translate-x-4 scale-x-200"
              />
            </div>
            <div className="flex items-center mb-6">
              <h5 className="ml-auto text-gray-800">Date: {date}</h5>
            </div>
            <div className="flex justify-center mx-auto items-center">
              <div className="h-14 w-14 bg-[#d2ae8d] rounded-full flex items-center justify-center mb-4 mr-3 text-white text-5xl">
                ★
              </div>
              <h2 className="text-center text-4xl font-serif font-normal mb-4 tracking-[10px] text-gray-800">
                INVOICE
              </h2>
            </div>
            <div className="w-full bg-[rgb(240,210,181)] h-5"></div>
            <div className="mt-5 mb-6 px-3">
              <table className="w-full text-sm border border-gray-300 border-collapse">
                <thead className="bg-gray-50 text-left">
                  <tr className="border-b border-gray-300">
                    <th className="py-2 px-3 border-r border-gray-300 text-gray-800">Description</th>
                    <th className="py-2 px-3 text-right border-r border-gray-300 text-gray-800">Qty</th>
                    <th className="py-2 px-3 text-right border-r border-gray-300 text-gray-800">Price</th>
                    <th className="py-2 px-3 text-right text-gray-800">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-2 px-3 border-r border-gray-200 text-gray-800">{row.description}</td>
                      <td className="py-2 px-3 text-right border-r border-gray-200 text-gray-800">{row.quantity}</td>
                      <td className="py-2 px-3 text-right border-r border-gray-200 text-gray-800">{row.rate.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-gray-800">{row.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-right space-y-1 text-sm mb-8 text-gray-800">
              <p>
                Sub Total: <span className="ml-4 font-semibold">{currentTotal.toFixed(2)}</span>
              </p>
              {previousBalance > 0 && (
                <p>
                  Previous Balance: <span className="ml-4 font-semibold">{previousBalance.toFixed(2)}</span>
                </p>
              )}
              <p>
                {previousBalance > 0 ? "Grand Total" : "Total"}: <span className="ml-4 font-semibold">{grandTotal.toFixed(2)}</span>
              </p>
            </div>
            <div className="text-sm mb-6 text-gray-800">
              <h3 className="font-semibold mb-1">Payment Method</h3>
              <p>Bank Name: Liceria & Co.</p>
              <p>Account No: 123-456-7890</p>
            </div>
            <div className="text-white px-5 py-2 mb-6 bg-[#d2ae8d]">
              <div className="flex justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-serif mb-1">Star Printing</h1>
                  <p>Invoice No: {serialNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-left">
                    <span className="font-semibold text-xl">Invoice For:</span> <br />
                    {partyName}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                <p>Phone: +91 93-5043-2551</p>
                <p>Address: 1F-51 Faridabad, Haryana, India</p>
              </div>
            </div>
            <div className="text-sm">
              <p className="text-center text-gray-500 mb-8">Thank you for Purchase</p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default InvoiceBill;