import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000/api/bills",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

const ViewBill = () => {
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

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/id/${id}`);
        if (!response.data) throw new Error("Empty response from server");

        const billData = response.data;
        const items = (billData.rows || []).map((row, index) => ({
          id: row.id || index + 1,
          particulars: row.particulars || "",
          type: row.type || row.customType || "",
          size: row.size || row.customSize || "",
          qty: Number(row.quantity) || 0,
          rate: Number(row.rate) || 0,
          total: Number(row.total) || 0
        }));

        setBill({
          _id: billData._id,
          date: billData.date
            ? new Date(billData.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "numeric",
              day: "numeric"
            })
            : "N/A",
          partyName: billData.partyName || "Unknown",
          items,
          grandTotal: billData.total || 0,
          serialNumber: billData.serialNumber || 0,
          advance: billData.advance || 0,
          balance: billData.balance || 0,
          status: billData.status || "pending",
          note: billData.note || ""
        });

        setAdvance(billData.advance || 0);
        setStatus(billData.status || "pending");
        setNotes(billData.note || "");
      } catch (err) {
        const errorMessage = err.response?.data?.message ||
          err.message ||
          "Failed to load bill details";
        setError(errorMessage);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [id]);

  const handleStatusChange = (newStatus) => {
    const lowerStatus = newStatus.toLowerCase();
    setStatus(lowerStatus);

    if (lowerStatus === "paid") {
      setAdvance(0);
      setBill(prev => ({
        ...prev,
        advance: 0,
        balance: 0,
        status: lowerStatus
      }));
    } else {
      setBill(prev => ({
        ...prev,
        status: lowerStatus,
        balance: prev.grandTotal - advance
      }));
    }
  };

  const handleItemChange = (id, field, value) => {
    setBill((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          const updatedItem = {
            ...item,
            [field]: field === "qty" || field === "rate" ? Number(value) : value
          };

          if (field === "qty" || field === "rate") {
            updatedItem.total = (updatedItem.qty || 0) * (updatedItem.rate || 0);
          }

          return updatedItem;
        }
        return item;
      }),
      grandTotal: prev.items.reduce((sum, item) => sum + (item.id === id ?
        (field === "qty" || field === "rate" ?
          (Number(value) || 0) * (field === "rate" ? item.qty : item.rate) || 0
          : item.total)
        : item.total), 0)
    }));
  };

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
          total: 0
        }
      ];
      const newTotal = newItems.reduce((sum, item) => sum + item.total, 0);
      return {
        ...prev,
        items: newItems,
        grandTotal: newTotal
      };
    });
  };

  const removeRow = (id) => {
    setBill((prev) => {
      const filteredItems = prev.items.filter((item) => item.id !== id);
      const newItems = filteredItems.map((item, index) => ({
        ...item,
        id: index + 1
      }));
      const newTotal = newItems.reduce((sum, item) => sum + item.total, 0);
      return {
        ...prev,
        items: newItems,
        grandTotal: newTotal
      };
    });
  };

  const saveChanges = async () => {
    try {
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
          total: item.total
        })),
        total: bill.grandTotal,
        advance: numericAdvance,
        balance: calculatedBalance,
        status: status.toLowerCase(),
        note: notes
      };

      const response = await API.put(`/id/${id}`, updatedBill);
      const updatedData = response.data;

      setBill(prev => ({
        ...prev,
        ...updatedData,
        items: (updatedData.rows || []).map((row, index) => ({
          id: row.id || index + 1,
          particulars: row.particulars || "",
          type: row.type || "",
          size: row.size || "",
          qty: row.quantity || 0,
          rate: row.rate || 0,
          total: row.total || 0
        })),
        status: updatedData.status,
        note: updatedData.note || ""
      }));

      setStatus(updatedData.status);
      setAdvance(updatedData.advance);
      setNotes(updatedData.note || "");
      setIsEditing(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save changes");
      console.error("Save error:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "text-green-600";
      case "due":
        return "text-red-600";
      case "pending":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getBalanceColor = (balance) => {
    if (balance === 0) return "text-green-600";
    if (balance > 0) return "text-red-600";
    return "text-orange-600";
  };

  const exportToPDF = () => {
    if (!bill) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const currentDate = new Date().toLocaleDateString();

    // Header
    doc.setFillColor(173, 216, 230);
    doc.rect(0, 0, pageWidth, 20, "F");
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Star Printing - Bill", pageWidth / 2, 15, { align: "center" });

    // Bill Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${bill.date}`, 15, 30);
    doc.text(`To: ${bill.partyName}`, 15, 35);
    doc.text(`Bill #: ${bill.serialNumber}`, 15, 40);
    if (status.toLowerCase() === "paid") doc.setTextColor(0, 128, 0); // Green
    else if (status.toLowerCase() === "due") doc.setTextColor(255, 0, 0); // Red
    else doc.setTextColor(255, 165, 0); // Orange
    doc.text(`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`, pageWidth - 15, 30, { align: "right" });
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.text(`Advance: ₹${Number(advance || 0).toFixed(2)}`, pageWidth - 15, 35, { align: "right" });
    const balance = bill.grandTotal - advance;
    if (balance === 0) doc.setTextColor(0, 128, 0); // Green
    else if (balance > 0) doc.setTextColor(255, 0, 0); // Red
    else doc.setTextColor(255, 165, 0); // Orange
    doc.text(`Balance: ₹${Number(balance || 0).toFixed(2)}`, pageWidth - 15, 40, { align: "right" });
    doc.setTextColor(0, 0, 0); // Reset to black

    // Table
    const tableData = bill.items.map((item) => [
      item.id,
      `${item.particulars} ${item.type} ${item.size}`.trim(),
      item.qty,
      `₹${Number(item.rate || 0).toFixed(2)}`,
      `₹${Number(item.total || 0).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 50,
      head: [["#", "Particulars", "Qty", "Rate", "Total"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 10 },
        4: { halign: "right" }
      }
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: ₹${Number(bill.grandTotal || 0).toFixed(2)}`, pageWidth - 15, finalY, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Notes:", 15, finalY + 10);
    doc.text(notes || "No notes", 15, finalY + 15, { maxWidth: pageWidth - 30 });

    doc.text("Thank you for your business!", pageWidth / 2, finalY + 30, { align: "center" });
    doc.text("Contact: +91 9350432551 | 1F-51, Faridabad", pageWidth / 2, finalY + 35, { align: "center" });
    doc.text(`Generated on: ${currentDate}`, pageWidth / 2, finalY + 40, { align: "center" });

    doc.save(`Bill_${bill.serialNumber}_${bill.partyName}.pdf`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="p-4 bg-blue-100 text-blue-700 rounded-lg flex items-center">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading bill details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          <h2 className="font-bold mb-2">Error Loading Bill:</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-lg shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Star Printing - Bill</h1>
          <div className="text-sm">
            <p>Serial #: {bill.serialNumber}</p>
            <p>Date: {bill.date}</p>
            <p className={getStatusColor(status)}>
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-b-lg shadow-lg">
        <div className="flex flex-wrap gap-4 mb-6 justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg text-white ${isEditing ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
            >
              {isEditing ? "Cancel Edit" : "Edit Bill"}
            </button>
            {isEditing && (
              <>
                <button
                  onClick={saveChanges}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={addRow}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Row
                </button>
              </>
            )}
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Export PDF
            </button>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to List
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="font-bold mb-2">Bill To:</h2>
            <p className="text-gray-800">{bill.partyName}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Status:</label>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={!isEditing}
                  className="w-full p-2 border rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="due">Due</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Advance (₹):</label>
                <input
                  type="number"
                  value={status === "paid" ? 0 : advance}
                  onChange={(e) => {
                    if (status !== "paid") {
                      setAdvance(Math.max(0, Number(e.target.value)));
                      setBill(prev => ({
                        ...prev,
                        advance: Math.max(0, Number(e.target.value)),
                        balance: prev.grandTotal - Math.max(0, Number(e.target.value))
                      }));
                    }
                  }}
                  disabled={!isEditing || status === "paid"}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border rounded-lg"
              />
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="p-2 border rounded-lg"
              >
                <option value="id">Sort by ID</option>
                <option value="particulars">Sort by Name</option>
              </select>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">
                Balance: <span className={getBalanceColor(bill.grandTotal - advance)}>
                  ₹{(bill.grandTotal - advance).toFixed(2)}
                </span>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Particulars</th>
                  {isEditing && (
                    <>
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-left">Size</th>
                    </>
                  )}
                  <th className="p-2 text-left">Qty</th>
                  <th className="p-2 text-left">Rate</th>
                  <th className="p-2 text-left">Total</th>
                  {isEditing && <th className="p-2 text-left">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {bill.items
                  .filter(item =>
                    item.particulars.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .sort((a, b) => {
                    if (sortField === "id") return a.id - b.id;
                    return a[sortField].localeCompare(b[sortField]);
                  })
                  .map((item) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="p-2">{item.id}</td>
                      <td className="p-2">
                        {isEditing ? (
                          <input
                            value={item.particulars}
                            onChange={(e) => handleItemChange(item.id, "particulars", e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          item.particulars
                        )}
                      </td>
                      {isEditing && (
                        <>
                          <td className="p-2">
                            <input
                              value={item.type}
                              onChange={(e) => handleItemChange(item.id, "type", e.target.value)}
                              className="w-full p-1 border rounded"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              value={item.size}
                              onChange={(e) => handleItemChange(item.id, "size", e.target.value)}
                              className="w-full p-1 border rounded"
                            />
                          </td>
                        </>
                      )}
                      <td className="p-2">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleItemChange(item.id, "qty", e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          item.qty
                        )}
                      </td>
                      <td className="p-2">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(item.id, "rate", e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          `₹${Number(item.rate || 0).toFixed(2)}`
                        )}
                      </td>
                      <td className="p-2 font-medium">₹{Number(item.total || 0).toFixed(2)}</td>
                      {isEditing && (
                        <td className="p-2">
                          <button
                            onClick={() => removeRow(item.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-xl font-bold text-blue-600">
              Grand Total: ₹{Number(bill.grandTotal || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Notes:</label>
          {isEditing ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded-lg"
              rows="3"
            />
          ) : (
            <p className="p-2 bg-gray-50 rounded-lg">{notes || "No notes provided"}</p>
          )}
        </div>

        <div className="border-t pt-4 text-center text-sm text-gray-600">
          <p>Thank you for choosing Star Printing!</p>
          <p>Contact: +91 9350432551 | Address: 1F-51, Faridabad</p>
          <p>All prices include GST | Terms: Net 15 days</p>
        </div>
      </div>
    </div>
  );
};

export default ViewBill;