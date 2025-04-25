import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import leaf from "../../assets/leaf.png";
import { debounce } from "lodash";
import { FiArrowLeft, FiEdit, FiSave, FiX, FiPlus, FiTrash, FiDownload } from "react-icons/fi";

const ViewBill = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [status, setStatus] = useState("pending");
  const [advance, setAdvance] = useState(0);
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [sortField, setSortField] = useState("id");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch bill details by ID
  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/bills/id/${id}`);
        if (!response.data) throw new Error("Empty response from server");

        const billData = response.data;
        const items = (billData.rows || []).map((row, index) => ({
          id: row.id || index + 1,
          particulars: row.particulars || "",
          type: row.type || row.customType || "",
          size: row.size || row.customSize || "",
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
          includeBalance: billData.includeBalance ?? true,
        });

        setAdvance(billData.advance || 0);
        setStatus(billData.status || "pending");
        setNotes(billData.note || "");
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "Failed to load bill details";
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

  // Update bill status
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
          const updatedItem = {
            ...item,
            [field]: field === "qty" || field === "rate" ? Number(value) : value,
          };
          if (field === "qty" || field === "rate") {
            updatedItem.total = (updatedItem.qty || 0) * (updatedItem.rate || 0);
          }
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
          qty: 0,
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
      if (!bill.partyName.trim()) throw new Error("Party name is required");
      if (!bill.items.every((item) => item.particulars && item.qty > 0 && item.rate > 0)) {
        throw new Error("All items must have valid particulars, quantity, and rate");
      }

      const isPaid = status.toLowerCase() === "paid";
      const numericAdvance = isPaid ? 0 : Number(advance);
      const calculatedBalance = isPaid ? 0 : bill.grandTotal - numericAdvance;

      const updatedBill = {
        partyName: bill.partyName,
        rows: bill.items.map((item) => ({
          id: item.id,
          particulars: item.particulars,
          type: item.type,
          size: item.size,
          quantity: item.qty,
          rate: item.rate,
          total: item.total,
        })),
        total: bill.grandTotal,
        advance: numericAdvance,
        balance: calculatedBalance,
        status: status.toLowerCase(),
        note: notes,
        includeBalance: bill.includeBalance,
      };

      const response = await api.put(`/bills/id/${id}`, updatedBill);
      const updatedData = response.data;

      setBill((prev) => ({
        ...prev,
        ...updatedData,
        items: (updatedData.rows || []).map((row, index) => ({
          id: row.id || index + 1,
          particulars: row.particulars || "",
          type: row.type || "",
          size: row.size || "",
          qty: row.quantity || 0,
          rate: row.rate || 0,
          total: row.total || 0,
        })),
        status: updatedData.status,
        note: updatedData.note || "",
        includeBalance: updatedData.includeBalance ?? true,
      }));

      setStatus(updatedData.status);
      setAdvance(updatedData.advance);
      setNotes(updatedData.note || "");
      setIsEditing(false);
      setError("");
      setToast({ message: "Bill updated successfully", type: "success" });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to save changes";
      setError(errorMessage);
      setToast({ message: errorMessage, type: "error" });
      console.error("Save error:", err);
    }
  };

  // Get status color for UI (Tailwind classes)
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return darkMode ? "text-green-400" : "text-green-600";
      case "due":
        return darkMode ? "text-red-400" : "text-red-600";
      case "pending":
        return darkMode ? "text-orange-400" : "text-orange-600";
      default:
        return darkMode ? "text-gray-400" : "text-gray-600";
    }
  };

  // Get balance color for UI (Tailwind classes)
  const getBalanceColor = (balance) => {
    if (balance === 0) return darkMode ? "text-green-400" : "text-green-600";
    if (balance > 0) return darkMode ? "text-red-400" : "text-red-600";
    return darkMode ? "text-orange-400" : "text-orange-600";
  };

  // Get status color for PDF (RGB values, similar to #b8966f)
  const getStatusColorPDF = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return [139, 69, 19]; // SaddleBrown, darker shade
      case "due":
        return [165, 42, 42]; // Brown, reddish shade
      case "pending":
        return [184, 134, 11]; // DarkGoldenRod, warm shade
      default:
        return [100, 100, 100]; // Gray
    }
  };

  // Get balance color for PDF (RGB values, similar to #b8966f)
  const getBalanceColorPDF = (balance) => {
    if (balance === 0) return [139, 69, 19]; // SaddleBrown
    if (balance > 0) return [165, 42, 42]; // Brown
    return [184, 134, 11]; // DarkGoldenRod
  };

  // Export bill to PDF
  const exportToPDF = async () => {
    if (!bill) return;

    try {
      setPdfLoading(true);
      setError("");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const footerHeight = 30; // Increased to accommodate multiple footer lines
      const currentDate = new Date().toLocaleDateString();

      // Header
      doc.setFillColor(184, 150, 111); // #b8966f
      doc.rect(0, 0, pageWidth, 20, "F");
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Star Printing - Bill", pageWidth / 2, 15, { align: "center" });

      // Add leaf image
      const leafWidth = 50;
      const leafHeight = 40;
      const leafX = pageWidth - leafWidth - 10; // Positioned 10mm from right
      const leafY = 25; // Below header
      try {
        doc.addImage(leaf, "PNG", leafX, leafY, leafWidth, leafHeight);
      } catch (imgErr) {
        console.warn("Failed to load leaf image:", imgErr);
      }

      // Bill Info (Party Name, Date, Sr no.)
      let yPos = 30; // Starting position below header
      const partyNameFontSize = 12;
      doc.setFontSize(partyNameFontSize);
      doc.setTextColor(0, 0, 0);

      // Split party name into multiple lines if needed
      const maxPartyNameWidth = pageWidth - 30; // 15mm margin on both sides
      const partyNameLines = doc.splitTextToSize(`To: ${bill.partyName}`, maxPartyNameWidth);

      // Add party name lines
      partyNameLines.forEach((line, index) => {
        doc.text(line, 15, yPos + index * 6); // Reduced line spacing to 6mm
      });

      // Calculate yPos after party name
      yPos += partyNameLines.length * 6;

      // Position Date and Sr no.
      doc.setFontSize(10);
      if (partyNameLines.length <= 1) {
        // Short partyName: Date and Sr no. on right, aligned with party name
        doc.text(`Date: ${bill.date}`, pageWidth - 15, 30, { align: "right" });
        doc.text(`Sr no.: ${bill.serialNumber}`, pageWidth - 15, 35, { align: "right" });
        yPos = Math.max(yPos, 40); // Ensure yPos is below Date/Sr no.
      } else {
        // Long partyName: Date and Sr no. below party name on left
        doc.text(`Date: ${bill.date}`, 15, yPos);
        doc.text(`Sr no.: ${bill.serialNumber}`, 15, yPos + 5);
        yPos += 10; // Move yPos below Date/Sr no.
      }

      // Table
      const tableData = bill.items.map((item) => [
        item.id,
        `${item.particulars} ${item.type} ${item.size}`.trim(),
        item.qty,
        `Rs ${Number(item.rate || 0).toFixed(2)}`,
        `Rs ${Number(item.total || 0).toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: yPos + 5, // Reduced gap to 5mm after bill info
        head: [["#", "Particulars", "Qty", "Rate", "Total"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 2, textColor: [80, 80, 80] },
        headStyles: {
          fillColor: [210, 180, 140], // Lighter shade of #b8966f (Tan)
          textColor: [255, 255, 255],
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 90 }, // Wider particulars column
          2: { cellWidth: 20 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30, halign: "right" },
        },
        margin: { left: 15, right: 15, bottom: footerHeight },
        didParseCell: (data) => {
          if (data.section === "body") {
            data.cell.styles.fillColor = data.row.index % 2 === 0 ? [255, 255, 255] : [245, 245, 220]; // Beige for alternating rows
          }
        },
      });

      // Totals Section
      let finalY = doc.lastAutoTable.finalY + 5; // Reduced gap to 5mm
      const footerY = pageHeight - footerHeight;

      // Check if totals will overlap with footer
      const totalsHeightEstimate = 14 + 15; // Total (1 line) + Notes
      if (finalY + totalsHeightEstimate > footerY - 10) {
        doc.addPage();
        finalY = 20; // Start at top of new page
      }

      doc.setFont("helvetica", "bold");
      doc.setTextColor(184, 150, 111); // #b8966f
      doc.setFontSize(14);
      doc.text(
        `${
          bill.includeBalance && bill.balance !== 0 ? "Grand Total" : "Total"
        }: Rs ${Number(bill.includeBalance ? bill.grandTotal + bill.balance : bill.grandTotal || 0).toFixed(2)}`,
        pageWidth - 15,
        finalY,
        { align: "right" }
      );
      doc.setTextColor(0, 0, 0);

      // Notes
      finalY += 10;
      if (finalY + 15 > footerY - 10) {
        doc.addPage();
        finalY = 20;
      }
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Notes:", 15, finalY);
      doc.text(notes || "No notes", 15, finalY + 5, { maxWidth: pageWidth - 30 });

      // Footer
      doc.setFillColor(184, 150, 111); // #b8966f
      doc.rect(0, footerY, pageWidth, footerHeight, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("Thank you for your business!", pageWidth / 2, footerY + 8, { align: "center" });
      doc.text("Contact: +91 9350432551 | 1F-51, Faridabad", pageWidth / 2, footerY + 14, { align: "center" });
      doc.text(`Generated on: ${currentDate}`, pageWidth / 2, footerY + 20, { align: "center" });

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
        <div className="max-w-6xl mx-auto p-6">
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
        <div className="max-w-6xl mx-auto p-6">
          <div className={`p-4 rounded-lg ${darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700"}`}>
            <h2 className="font-bold mb-2">Error:</h2>
            <p>{error}</p>
            <div className="flex gap-4 mt-4">
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
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${toast.type === "success" ? (darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-700") : (darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700")}`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-lg">
              <FiX />
            </button>
          </div>
        )}

        <div className={`bg-gradient-to-br ${darkMode ? "from-gray-800 to-gray-700" : "from-white to-gray-100"} shadow-2xl rounded-2xl overflow-hidden transition-colors duration-300`}>
          {/* Header */}
          <div className={`p-6 ${darkMode ? "bg-[#b8966f]" : "bg-[#b8966f]"} text-white flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <img src={leaf} alt="Star Printing Logo" className="w-12 h-10" />
              <h1 className="text-2xl font-bold tracking-tight">Star Printing - Bill</h1>
            </div>
            <div className="text-sm space-y-1">
              <p>Serial #: {bill.serialNumber}</p>
              <p>Date: {bill.date}</p>
              <p className={getStatusColor(status)}>
                Status: {status.charAt(0).toUpperCase() + status.slice(1)}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className={`p-6 ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}>
            {/* PDF Loading State */}
            {pdfLoading && (
              <div className={`mb-6 p-4 rounded-lg flex items-center animate-pulse ${darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-700"}`}>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating PDF...
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6 justify-between items-center">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 ${isEditing ? (darkMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-red-500 text-white hover:bg-red-600") : (darkMode ? "bg-[#b8966f] text-white hover:bg-[#a7845f]" : "bg-[#b8966f] text-white hover:bg-[#a7845f]")}`}
                >
                  {isEditing ? <><FiX /> Cancel Edit</> : <><FiEdit /> Edit Bill</>}
                </button>
                {isEditing && (
                  <>
                    <button
                      onClick={saveChanges}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 ${darkMode ? "bg-[#b8966f] text-white hover:bg-[#a7845f]" : "bg-[#b8966f] text-white hover:bg-[#a7845f]"}`}
                    >
                      <FiSave /> Save Changes
                    </button>
                    <button
                      onClick={addRow}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 ${darkMode ? "bg-[#b8966f] text-white hover:bg-[#a7845f]" : "bg-[#b8966f] text-white hover:bg-[#a7845f]"}`}
                    >
                      <FiPlus /> Add Row
                    </button>
                  </>
                )}
                <button
                  onClick={exportToPDF}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 ${darkMode ? "bg-[#b8966f] text-white hover:bg-[#a7845f]" : "bg-[#b8966f] text-white hover:bg-[#a7845f]"} ${pdfLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={pdfLoading}
                >
                  <FiDownload /> Export PDF
                </button>
              </div>
              <button
                onClick={() => navigate(-1)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 ${darkMode ? "bg-gray-600 text-gray-100 hover:bg-gray-700" : "bg-gray-500 text-white hover:bg-gray-600"}`}
              >
                <FiArrowLeft /> Back to List
              </button>
            </div>

            {/* Bill Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-lg shadow-sm ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <h2 className="font-semibold mb-2">Bill To:</h2>
                <p className={`text-lg ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{bill.partyName}</p>
              </div>
              <div className={`p-4 rounded-lg shadow-sm ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Status:</label>
                    <select
                      value={status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={!isEditing}
                      className={`w-full p-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${darkMode ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]" : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="due">Due</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Advance (Rs):</label>
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
                      className={`w-full p-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${darkMode ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]" : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search items..."
                    onChange={(e) => handleSearch(e.target.value)}
                    className={`w-full sm:w-64 p-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${darkMode ? "bg-gray-600 border-gray-500 text-gray-100 placeholder-gray-400 focus:ring-[#b8966f]" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#b8966f]"}`}
                  />
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className={`w-full sm:w-40 p-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${darkMode ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]" : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"}`}
                  >
                    <option value="id">Sort by ID</option>
                    <option value="particulars">Sort by Name</option>
                  </select>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                    Balance: <span className={getBalanceColor(bill.grandTotal - advance)}>Rs {(bill.includeBalance ? bill.grandTotal - advance + bill.balance : bill.grandTotal - advance).toFixed(2)}</span>
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className={`w-full border-collapse border ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                    <tr>
                      <th className="p-3 text-left text-sm font-semibold">S.No</th>
                      <th className="p-3 text-left text-sm font-semibold">Particulars</th>
                      {isEditing && (
                        <>
                          <th className="p-3 text-left text-sm font-semibold">Type</th>
                          <th className="p-3 text-left text-sm font-semibold">Size</th>
                        </>
                      )}
                      <th className="p-3 text-left text-sm font-semibold">Qty</th>
                      <th className="p-3 text-left text-sm font-semibold">Rate</th>
                      <th className="p-3 text-left text-sm font-semibold">Total</th>
                      {isEditing && <th className="p-3 text-left text-sm font-semibold">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items
                      .filter((item) => item.particulars.toLowerCase().includes(searchTerm.toLowerCase()))
                      .sort((a, b) => {
                        if (sortField === "id") return a.id - b.id;
                        return a[sortField].localeCompare(b[sortField]);
                      })
                      .map((item) => (
                        <tr
                          key={item.id}
                          className={`border-t transition-colors ${darkMode ? (item.id % 2 === 0 ? "bg-gray-800" : "bg-gray-700") : (item.id % 2 === 0 ? "bg-white" : "bg-gray-50")} ${darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"}`}
                        >
                          <td className="p-3">{item.id}</td>
                          <td className="p-3">
                            {isEditing ? (
                              <input
                                value={item.particulars}
                                onChange={(e) => handleItemChange(item.id, "particulars", e.target.value)}
                                className={`w-full p-1 rounded-lg focus:outline-none focus:ring-2 ${darkMode ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]" : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"}`}
                              />
                            ) : (
                              item.particulars
                            )}
                          </td>
                          {isEditing && (
                            <>
                              <td className="p-3">
                                <input
                                  value={item.type}
                                  onChange={(e) => handleItemChange(item.id, "type", e.target.value)}
                                  className={`w-full p-1 rounded-lg focus:outline-none focus:ring-2 ${darkMode ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]" : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"}`}
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  value={item.size}
                                  onChange={(e) => handleItemChange(item.id, "size", e.target.value)}
                                  className={`w-full p-1 rounded-lg focus:outline-none focus:ring-2 ${darkMode ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]" : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"}`}
                                />
                              </td>
                            </>
                          )}
                          <td className="p-3">
                            {isEditing ? (
                              <input
                                type="number"
                                value={item.qty}
                                onChange={(e) => handleItemChange(item.id, "qty", e.target.value)}
                                className={`w-full p-1 rounded-lg focus:outline-none focus:ring-2 ${darkMode ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]" : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"}`}
                              />
                            ) : (
                              item.qty
                            )}
                          </td>
                          <td className="p-3">
                            {isEditing ? (
                              <input
                                type="number"
                                value={item.rate}
                                onChange={(e) => handleItemChange(item.id, "rate", e.target.value)}
                                className={`w-full p-1 rounded-lg focus:outline-none focus:ring-2 ${darkMode ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]" : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"}`}
                              />
                            ) : (
                              `Rs ${Number(item.rate || 0).toFixed(2)}`
                            )}
                          </td>
                          <td className="p-3 font-medium">
                            Rs {Number(item.total || 0).toFixed(2)}
                          </td>
                          {isEditing && (
                            <td className="p-3">
                              <button
                                onClick={() => removeRow(item.id)}
                                className={`px-2 py-1 rounded-lg transition-transform hover:scale-105 ${darkMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-red-500 text-white hover:bg-red-600"}`}
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
            <div className="flex justify-end mb-6">
              <div className={`p-4 rounded-lg shadow-sm ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <p className={`text-xl font-bold text-[#b8966f]`}>
                  {bill.includeBalance && bill.balance !== 0 ? "Grand Total" : "Total"}: Rs {Number(bill.includeBalance ? bill.grandTotal + bill.balance : bill.grandTotal || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Notes:</label>
              {isEditing ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full p-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${darkMode ? "bg-gray-600 border-gray-500 text-gray-100 focus:ring-[#b8966f]" : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-[#b8966f]"}`}
                  rows="4"
                />
              ) : (
                <p className={`p-3 rounded-lg ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-800"}`}>{notes || "No notes provided"}</p>
              )}
            </div>

            {/* Footer */}
            <div className={`border-t pt-4 text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              <p className="font-semibold">Thank you for choosing Star Printing!</p>
              <p>Contact: +91 9350432551 | Address: 1F-51, Faridabad</p>
              <p>All prices include GST | Terms: Net 15 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBill;