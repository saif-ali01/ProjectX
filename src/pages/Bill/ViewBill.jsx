import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import leaf from "../../assets/leaf.png";
import starlogo from "../../assets/starlogo.png";
import { debounce } from "lodash";
import { FiArrowLeft, FiEdit, FiSave, FiX, FiPlus, FiTrash, FiDownload } from "react-icons/fi";

// ViewBill component for viewing, editing, and exporting bills
const ViewBill = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [status, setStatus] = useState("pending");
  const [advance, setAdvance] = useState();
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [sortField, setSortField] = useState("id");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Enum values for bill items
  const typeOptions = ["Book", "Pad", "Tag", "Register", "Other", ""];
  const sizeOptions = ["1/3", "1/4", "1/5", "1/6", "1/8", "1/10", "1/12", "1/16", "Other", ""];

  // Fetch bill details by ID
  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/api/bills/id/${id}`);
        if (!response.data) throw new Error("Empty response from server");

        const billData = response.data;
        const items = (billData.rows || []).map((row, index) => ({
          id: row.id || index + 1,
          particulars: row.particulars || "",
          type: row.type || "",
          size: row.size || "",
          customType: row.customType || "",
          customSize: row.customSize || "",
          qty: Number(row.quantity) || 0,
          rate: Number(row.rate) || 0,
          total: Number(row.total) || 0,
        }));

        setBill({
          _id: billData._id,
          date: billData.date
            ? new Date(billData.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
              })
            : "N/A",
          partyName: billData.partyName || "Unknown",
          items,
          grandTotal: billData.total || 0,
          serialNumber: billData.serialNumber || 0,
          advance: billData.advance || 0,
          balance: billData.balance || 0,
          status: billData.status || "pending",
          note: billData.note || "",
        });

        setAdvance(billData.advance || 0);
        setStatus(billData.status || "pending");
        setNotes(billData.note || "");
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to load bill details";
        setError(errorMessage);
        setToast({ message: errorMessage, type: "error" });
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [id]);

  // Debounced search handler
  const handleSearch = debounce((value) => {
    setSearchTerm(value);
  }, 300);

  // Handle status change
  const handleStatusChange = (newStatus) => {
    const lowerStatus = newStatus.toLowerCase();
    setStatus(lowerStatus);

    if (lowerStatus === "paid") {
      setAdvance(0);
      setBill((prev) => ({
        ...prev,
        advance: 0,
        balance: 0,
        status: lowerStatus,
      }));
    } else {
      setBill((prev) => ({
        ...prev,
        status: lowerStatus,
        balance: prev.grandTotal - advance,
      }));
    }
  };

  // Update item fields
  const handleItemChange = (id, field, value) => {
    setBill((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item };
          if (field === "qty" || field === "rate") {
            const numericValue = Number(value) || 0;
            updatedItem[field] = Math.max(0, numericValue);
          } else {
            updatedItem[field] = value;
          }
          updatedItem.total = (updatedItem.qty || 0) * (updatedItem.rate || 0);
          return updatedItem;
        }
        return item;
      });

      const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
      return {
        ...prev,
        items: updatedItems,
        grandTotal: newTotal,
        balance: newTotal - (status === "paid" ? 0 : advance),
      };
    });
  };

  // Add a new row
  const addRow = () => {
    setBill((prev) => {
      const newItems = [
        ...prev.items,
        {
          id: prev.items.length + 1,
          particulars: "",
          type: "",
          size: "",
          customType: "",
          customSize: "",
          qty: 1,
          rate: 0,
          total: 0,
        },
      ];
      const newTotal = newItems.reduce((sum, item) => sum + item.total, 0);
      return {
        ...prev,
        items: newItems,
        grandTotal: newTotal,
        balance: newTotal - (status === "paid" ? 0 : advance),
      };
    });
  };

  // Remove a row
  const removeRow = (id) => {
    setBill((prev) => {
      const filteredItems = prev.items.filter((item) => item.id !== id);
      const newItems = filteredItems.map((item, index) => ({
        ...item,
        id: index + 1,
      }));
      const newTotal = newItems.reduce((sum, item) => sum + item.total, 0);
      return {
        ...prev,
        items: newItems,
        grandTotal: newTotal,
        balance: newTotal - (status === "paid" ? 0 : advance),
      };
    });
  };

  // Save changes to the bill
  const saveChanges = async () => {
    try {
      if (!bill.partyName?.trim()) throw new Error("Party name is required");
      if (!bill.items?.length) throw new Error("At least one item is required");

      const invalidItem = bill.items.find(
        (item) =>
          !item.id ||
          isNaN(item.id) ||
          item.id <= 0 ||
          !item.particulars?.trim() ||
          isNaN(item.qty) ||
          item.qty <= 0 ||
          isNaN(item.rate) ||
          item.rate <= 0 ||
          isNaN(item.total) ||
          item.total <= 0 ||
          (item.type && !typeOptions.includes(item.type)) ||
          (item.size && !sizeOptions.includes(item.size))
      );

      if (invalidItem)
        throw new Error(
          `Invalid item (ID: ${invalidItem.id}): Ensure ID, particulars, quantity (>0), rate (>0), and total (>0) are valid`
        );

      const isPaid = status.toLowerCase() === "paid";
      const numericAdvance = isPaid ? 0 : Number(advance) || 0;
      if (isNaN(numericAdvance) || numericAdvance < 0)
        throw new Error("Advance must be a non-negative number");

      const calculatedBalance = isPaid ? 0 : bill.grandTotal - numericAdvance;
      if (isNaN(calculatedBalance) || calculatedBalance < 0)
        throw new Error("Balance cannot be negative");

      const updatedBill = {
        partyName: bill.partyName.trim(),
        rows: bill.items.map((item) => ({
          id: Number(item.id),
          particulars: item.particulars.trim(),
          type: item.type || "",
          size: item.size || "",
          customType: item.type === "Other" ? item.customType?.trim() || "" : "",
          customSize: item.size === "Other" ? item.customSize?.trim() || "" : "",
          quantity: Number(item.qty) || 0,
          rate: Number(item.rate) || 0,
          total: Number(item.total) || 0,
        })),
        total: Number(bill.grandTotal) || 0,
        advance: numericAdvance,
        balance: calculatedBalance,
        status: status.toLowerCase(),
        note: notes?.trim() || "",
        due: calculatedBalance,
        previousBalance: Math.max(0, bill.balance - (bill.grandTotal - numericAdvance)),
      };

      if (isNaN(updatedBill.total) || updatedBill.total <= 0)
        throw new Error("Total must be positive");

      const response = await api.put(`/api/bills/id/${id}`, updatedBill);
      const updatedData = response.data;

      setToast({
        message: status.toLowerCase() === "paid"
          ? `Bill marked as paid! ₹${updatedData.total.toLocaleString("en-IN")} added to earnings`
          : "Bill updated successfully",
        type: "success",
        autoClose: status.toLowerCase() === "paid" ? 5000 : 3000,
      });

      setBill((prev) => ({
        ...prev,
        ...updatedData,
        items: (updatedData.rows || []).map((row, index) => ({
          id: row.id || index + 1,
          particulars: row.particulars || "",
          type: row.type || "",
          size: row.size || "",
          customType: row.customType || "",
          customSize: row.customSize || "",
          qty: row.quantity || 0,
          rate: row.rate || 0,
          total: row.total || 0,
        })),
        grandTotal: updatedData.total || 0,
        balance: updatedData.balance || 0,
        status: updatedData.status,
        note: updatedData.note || "",
      }));

      setStatus(updatedData.status);
      setAdvance(updatedData.advance);
      setNotes(updatedData.note || "");
      setIsEditing(false);
      setError("");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to save changes";
      setToast({
        message: `Error: ${errorMessage}${err.response?.data?.errors ? ' - ' + err.response.data.errors.join(', ') : ''}`,
        type: "error",
        autoClose: 5000,
      });
    }
  };

  // Get status color for UI
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid": return darkMode ? "text-green-400" : "text-green-600";
      case "due": return darkMode ? "text-red-400" : "text-red-600";
      case "pending": return darkMode ? "text-orange-400" : "text-orange-600";
      default: return darkMode ? "text-gray-400" : "text-gray-600";
    }
  };

  // Get balance color for UI
  const getBalanceColor = (balance) => {
    if (balance === 0) return darkMode ? "text-green-400" : "text-green-600";
    if (balance > 0) return darkMode ? "text-red-400" : "text-red-600";
    return darkMode ? "text-orange-400" : "text-orange-600";
  };

  // Get status color for PDF
  const getStatusColorPDF = (status) => {
    switch (status.toLowerCase()) {
      case "paid": return [22, 160, 133];
      case "due": return [192, 57, 43];
      case "pending": return [243, 156, 18];
      default: return [100, 100, 100];
    }
  };

  // Get balance color for PDF
  const getBalanceColorPDF = (balance) => {
    if (balance === 0) return [22, 160, 133];
    if (balance > 0) return [192, 57, 43];
    return [243, 156, 18];
  };

  // Export bill to PDF with star logo
  const exportToPDF = async () => {
    if (!bill) return;

    try {
      setPdfLoading(true);
      setError("");

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const footerHeight = 30;

      // Load images
      const leafResponse = await fetch(leaf);
      const leafBlob = await leafResponse.blob();
      const leafBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(leafBlob);
      });

      const starResponse = await fetch(starlogo);
      const starBlob = await starResponse.blob();
      const starBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(starBlob);
      });

      // Table data
      const tableData = bill.items.map((item) => [
        item.id,
        `${item.particulars} ${item.type}${item.type === "Other" && item.customType ? ` (${item.customType})` : ""} ${item.size}${item.size === "Other" && item.customSize ? ` (${item.customSize})` : ""}`.trim(),
        item.qty,
        `Rs ${Number(item.rate || 0).toFixed(2)}`,
        `Rs ${Number(item.total || 0).toFixed(2)}`,
      ]);

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

      // Main table with centered headers for Qty, Rate, Total
      autoTable(doc, {
        startY: 55,
        head: [["#", "Particulars", "Qty", "Rate", "Total"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 2, textColor: [80, 80, 80] },
        headStyles: { fillColor: [210, 180, 140], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 15, halign: "center" },
          1: { cellWidth: 85 },
          2: { cellWidth: 20, halign: "right" },
          3: { cellWidth: 30, halign: "right" },
          4: { cellWidth: 30, halign: "right" },
        },
        margin: { left: 15, right: 15, bottom: footerHeight },
        didParseCell: (data) => {
          if (data.section === "head") {
            if (["Qty", "Rate", "Total"].includes(data.cell.text[0])) {
              data.cell.styles.halign = "center";
            } else {
              data.cell.styles.halign = "left";
            }
          }
        },
      });

      // Totals Section
      let finalY = doc.lastAutoTable.finalY + 5;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(184, 150, 111);
      doc.setFontSize(14);
      doc.text(`Total: Rs ${Number(bill.grandTotal || 0).toFixed(2)}`, pageWidth - 15, finalY, { align: "right" });
     
      // Payment Method
      finalY += 15;
      if (finalY + 15 > doc.internal.pageSize.getHeight() - footerHeight - 10) {
        doc.addPage();
        finalY = 20;
      }
      doc.setTextColor(184, 150, 111);
      doc.setFont("helvetica", "bold");
      doc.text("Payment Method", 15, finalY);
      doc.setFont("helvetica", "normal");
      doc.text("Bank Name: Liceria & Co.", 15, finalY + 5);
      doc.text("Account No: 123-456-7890", 15, finalY + 10);

    // Footer section
    const footerY = pageHeight - 40;
    doc.setFillColor(210, 174, 141);
    doc.rect(20, footerY, pageWidth - 40, 30, "F");
    doc.setFontSize(16);
    doc.setFont("times", "normal");
    doc.setTextColor(255, 255, 255);
    doc.text("Star Printing", 25, footerY + 8);
    doc.setFontSize(10);
    doc.text(`Invoice No: ${bill.serialNumber}`, 25, footerY + 13);
    doc.text(`Date: ${bill.date}`, 25, footerY + 18);
    doc.text("Invoice For:", pageWidth - 60, footerY + 5);
    doc.setFontSize(15);
    doc.text(bill.partyName, pageWidth - 60, footerY + 10);
    doc.setFontSize(9);
    doc.text("Phone: +91 93-5043-2551", pageWidth / 2, footerY + 20, { align: "center" });
    doc.text("Address: 1F-51 Faridabad, Haryana, India", pageWidth / 2, footerY + 25, { align: "center" });

    // Thank you message
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for Purchase", pageWidth / 2, footerY + 35, { align: "center" });

      doc.save(`Bill_${bill.serialNumber}_${bill.partyName}.pdf`);
      setToast({ message: "PDF generated successfully", type: "success" });
    } catch (err) {
      setError("Failed to generate PDF: " + err.message);
      setToast({ message: "Failed to generate PDF: " + err.message, type: "error" });
      console.error("PDF generation error:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className={`p-4 rounded-lg flex items-center animate-pulse ${darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-700"}`}>
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading bill details...
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className={`p-4 rounded-lg ${darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700"}`}>
            <h2 className="font-bold mb-2">Error:</h2>
            <p>{error}</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <button
                onClick={() => navigate(-1)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 ${darkMode ? "bg-[#b8966f] text-white hover:bg-[#a7845f]" : "bg-[#b8966f] text-white hover:bg-[#a7845f]"}`}
              >
                <FiArrowLeft /> Back to List
              </button>
              <button
                onClick={() => {
                  setError("");
                  setLoading(true);
                  fetchBill();
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 ${darkMode ? "bg-[#b8966f] text-white hover:bg-[#a7845f]" : "bg-[#b8966f] text-white hover:bg-[#a7845f]"}`}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in z-50 ${
              toast.type === "success"
                ? darkMode
                  ? "bg-green-900 text-green-200"
                  : "bg-green-100 text-green-700"
                : darkMode
                ? "bg-red-900 text-red-200"
                : "bg-red-100 text-red-700"
            }`}
          >
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-lg">
              <FiX />
            </button>
          </div>
        )}

        <div
          className={`bg-gradient-to-br ${
            darkMode ? "from-gray-800 to-gray-700" : "from-white to-gray-100"
          } shadow-2xl rounded-2xl overflow-hidden transition-colors duration-300`}
        >
          {/* Header */}
          <div
            className={`p-4 sm:p-6 ${
              darkMode ? "bg-[#b8966f]" : "bg-[#b8966f]"
            } text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
          >
            <div className="flex items-center gap-3">
              <img src={starlogo} alt="Star Printing Logo" className="w-10 h-10 object-contain" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Star Printing - Bill
              </h1>
            </div>
            <div className="text-xs sm:text-sm space-y-1">
              <p>Serial #: {bill.serialNumber}</p>
              <p>Date: {bill.date}</p>
              <p className={getStatusColor(status)}>
                Status: {status.charAt(0).toUpperCase() + status.slice(1)}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div
            className={`p-4 sm:p-6 ${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
            }`}
          >
            {/* PDF Loading State */}
            {pdfLoading && (
              <div
                className={`mb-4 sm:mb-6 p-4 rounded-lg flex items-center animate-pulse ${
                  darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-700"
                }`}
              >
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating PDF...
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-4 sm:mb-6 justify-between items-center">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 text-sm sm:text-base ${
                    isEditing
                      ? darkMode
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-red-500 text-white hover:bg-red-600"
                      : darkMode
                      ? "bg-[#b8966f] text-white hover:bg-[#a7845f]"
                      : "bg-[#b8966f] text-white hover:bg-[#a7845f]"
                  }`}
                >
                  {isEditing ? (
                    <>
                      <FiX /> Cancel Edit
                    </>
                  ) : (
                    <>
                      <FiEdit /> Edit Bill
                    </>
                  )}
                </button>
                {isEditing && (
                  <>
                    <button
                      onClick={saveChanges}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 text-sm sm:text-base ${
                        darkMode
                          ? "bg-[#b8966f] text-white hover:bg-[#a7845f]"
                          : "bg-[#b8966f] text-white hover:bg-[#a7845f]"
                      }`}
                    >
                      <FiSave /> Save Changes
                    </button>
                    <button
                      onClick={addRow}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 text-sm sm:text-base ${
                        darkMode
                          ? "bg-[#b8966f] text-white hover:bg-[#a7845f]"
                          : "bg-[#b8966f] text-white hover:bg-[#a7845f]"
                      }`}
                    >
                      <FiPlus /> Add Row
                    </button>
                  </>
                )}
                <button
                  onClick={exportToPDF}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 text-sm sm:text-base ${
                    darkMode
                      ? "bg-[#b8966f] text-white hover:bg-[#a7845f]"
                      : "bg-[#b8966f] text-white hover:bg-[#a7845f]"
                  } ${pdfLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={pdfLoading}
                >
                  <FiDownload /> Export PDF
                </button>
              </div>
              <button
                onClick={() => navigate(-1)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 text-sm sm:text-base ${
                  darkMode
                    ? "bg-gray-600 text-gray-100 hover:bg-gray-700"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
              >
                <FiArrowLeft /> Back to List
              </button>
            </div>

            {/* Bill Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
              <div
                className={`p-4 rounded-lg shadow-sm ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <h2 className="font-semibold mb-2 text-sm sm:text-base">Bill To:</h2>
                {isEditing ? (
                  <input
                    value={bill.partyName}
                    onChange={(e) =>
                      setBill((prev) => ({ ...prev, partyName: e.target.value }))
                    }
                    className={`w-full p-2 rounded-lg focus:outline-none focus:ring-2 text-sm sm:text-base ${
                      darkMode
                        ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"
                    }`}
                    required
                  />
                ) : (
                  <p
                    className={`text-base sm:text-lg ${
                      darkMode ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    {bill.partyName}
                  </p>
                )}
              </div>
              <div
                className={`p-4 rounded-lg shadow-sm ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Status:
                    </label>
                    <select
                      value={status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={!isEditing}
                      className={`w-full p-2 rounded-lg focus:outline-none focus:ring-2 text-sm sm:text-base ${
                        darkMode
                          ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]"
                          : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="due">Due</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Advance (Rs):
                    </label>
                    <input
                      type="number"
                      value={status === "paid" ? 0 : advance}
                      onChange={(e) => {
                        if (status !== "paid") {
                          const newAdvance = Math.max(0, Number(e.target.value));
                          setAdvance(newAdvance);
                          setBill((prev) => ({
                            ...prev,
                            advance: newAdvance,
                            balance: prev.grandTotal - newAdvance,
                          }));
                        }
                      }}
                      disabled={!isEditing || status === "paid"}
                      min="0"
                      className={`w-full p-2 rounded-lg focus:outline-none focus:ring-2 text-sm sm:text-base ${
                        darkMode
                          ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]"
                          : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search items..."
                    onChange={(e) => handleSearch(e.target.value)}
                    className={`w-full sm:w-64 p-2 rounded-lg focus:outline-none focus:ring-2 text-sm sm:text-base ${
                      darkMode
                        ? "bg-gray-600 border-gray-500 text-gray-100 placeholder-gray-400 focus:ring-[#b8966f]"
                        : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#b8966f]"
                    }`}
                  />
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className={`w-full sm:w-40 p-2 rounded-lg focus:outline-none focus:ring-2 text-sm sm:text-base ${
                      darkMode
                        ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"
                    }`}
                  >
                    <option value="id">Sort by ID</option>
                    <option value="particulars">Sort by Name</option>
                  </select>
                </div>
                <div className="text-left sm:text-right">
                  <p
                    className={`text-base sm:text-lg font-semibold ${
                      darkMode ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    Balance:{" "}
                    <span className={getBalanceColor(bill.balance)}>
                      Rs {Number(bill.balance).toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table
                  className={`w-full border-collapse border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <thead
                    className={`${darkMode ? "bg-gray-700" : "bg-gray-100"} text-xs sm:text-sm`}
                  >
                    <tr>
                      <th className="p-2 sm:p-3 text-left font-semibold">S.No</th>
                      <th className="p-2 sm:p-3 text-left font-semibold">Particulars</th>
                      {isEditing && (
                        <>
                          <th className="p-2 sm:p-3 text-left font-semibold">Type</th>
                          <th className="p-2 sm:p-3 text-left font-semibold">Size</th>
                        </>
                      )}
                      <th className="p-2 sm:p-3 text-left font-semibold">Qty</th>
                      <th className="p-2 sm:p-3 text-left font-semibold">Rate</th>
                      <th className="p-2 sm:p-3 text-left font-semibold">Total</th>
                      {isEditing && (
                        <th className="p-2 sm:p-3 text-left font-semibold">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items
                      .filter((item) =>
                        item.particulars
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      )
                      .sort((a, b) => {
                        if (sortField === "id") return a.id - b.id;
                        return a[sortField].localeCompare(b[sortField]);
                      })
                      .map((item) => (
                        <tr
                          key={item.id}
                          className={`border-t transition-colors text-xs sm:text-sm ${
                            darkMode
                              ? item.id % 2 === 0
                                ? "bg-gray-800"
                                : "bg-gray-700"
                              : item.id % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50"
                          } ${darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"}`}
                        >
                          <td className="p-2 sm:p-3">{item.id}</td>
                          <td className="p-2 sm:p-3">
                            {isEditing ? (
                              <input
                                value={item.particulars}
                                onChange={(e) =>
                                  handleItemChange(
                                    item.id,
                                    "particulars",
                                    e.target.value
                                  )
                                }
                                className={`w-full p-1 rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                                  darkMode
                                    ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]"
                                    : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"
                                }`}
                                required
                              />
                            ) : (
                              item.particulars
                            )}
                          </td>
                          {isEditing && (
                            <>
                              <td className="p-2 sm:p-3">
                                <select
                                  value={item.type}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "type",
                                      e.target.value
                                    )
                                  }
                                  className={`w-full p-1 rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                                    darkMode
                                      ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]"
                                      : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"
                                  }`}
                                >
                                  {typeOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option || "None"}
                                    </option>
                                  ))}
                                </select>
                                {item.type === "Other" && (
                                  <input
                                    value={item.customType}
                                    onChange={(e) =>
                                      handleItemChange(
                                        item.id,
                                        "customType",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Custom Type"
                                    className={`w-full p-1 mt-1 rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                                      darkMode
                                        ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]"
                                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"
                                    }`}
                                  />
                                )}
                              </td>
                              <td className="p-2 sm:p-3">
                                <select
                                  value={item.size}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "size",
                                      e.target.value
                                    )
                                  }
                                  className={`w-full p-1 rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                                    darkMode
                                      ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]"
                                      : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"
                                  }`}
                                >
                                  {sizeOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option || "None"}
                                    </option>
                                  ))}
                                </select>
                                {item.size === "Other" && (
                                  <input
                                    value={item.customSize}
                                    onChange={(e) =>
                                      handleItemChange(
                                        item.id,
                                        "customSize",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Custom Size"
                                    className={`w-full p-1 mt-1 rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                                      darkMode
                                        ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]"
                                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"
                                    }`}
                                  />
                                )}
                              </td>
                            </>
                          )}
                          <td className="p-2 sm:p-3">
                            {isEditing ? (
                              <input
                                type="number"
                                value={item.qty}
                                onChange={(e) =>
                                  handleItemChange(item.id, "qty", e.target.value)
                                }
                                min="1"
                                step="1"
                                className={`w-full p-1 rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                                  darkMode
                                    ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]"
                                    : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"
                                }`}
                                required
                              />
                            ) : (
                              item.qty
                            )}
                          </td>
                          <td className="p-2 sm:p-3">
                            {isEditing ? (
                              <input
                                type="number"
                                value={item.rate}
                                onChange={(e) =>
                                  handleItemChange(
                                    item.id,
                                    "rate",
                                    e.target.value
                                  )
                                }
                                min="1"
                                step="0.01"
                                className={`w-full p-1 rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                                  darkMode
                                    ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]"
                                    : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"
                                }`}
                                required
                              />
                            ) : (
                              `Rs ${Number(item.rate || 0).toFixed(2)}`
                            )}
                          </td>
                          <td className="p-2 sm:p-3 font-medium">
                            Rs {Number(item.total || 0).toFixed(2)}
                          </td>
                          {isEditing && (
                            <td className="p-2 sm:p-3">
                              <button
                                onClick={() => removeRow(item.id)}
                                className={`px-2 py-1 rounded-lg transition-transform hover:scale-105 ${
                                  darkMode
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "bg-red-500 text-white hover:bg-red-600"
                                }`}
                              >
                                <FiTrash />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex justify-end mb-4 sm:mb-6">
              <div
                className={`p-4 rounded-lg shadow-sm ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <p className={`text-lg sm:text-xl font-bold text-[#b8966f]`}>
                  Total: Rs {Number(bill.grandTotal || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4 sm:mb-6">
              <label
                className={`block text-xs sm:text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Notes:
              </label>
              {isEditing ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full p-2 rounded-lg focus:outline-none focus:ring-2 text-sm sm:text-base ${
                    darkMode
                      ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]"
                      : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"
                  }`}
                  rows="4"
                />
              ) : (
                <p
                  className={`p-3 rounded-lg text-sm sm:text-base ${
                    darkMode
                      ? "bg-gray-700 text-gray-100"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {notes || "No notes provided"}
                </p>
              )}
            </div>

            {/* Footer */}
            <div
              className={`border-t pt-4 text-center text-xs sm:text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <p className="font-semibold">
                Thank you for choosing Star Printing!
              </p>
              <p>Contact: +91 9350432551 | Address: 1F-51, Faridabad</p>
              <p> Terms:pay before 10th of month </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBill;