import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../assets/star.png";
import { api } from "../../utils/api";

function BillMaker({ darkMode }) {
  const [rows, setRows] = useState([
    {
      id: 1,
      particulars: "",
      type: "",
      size: "",
      customType: "",
      customSize: "",
      quantity: "",
      rate: "",
      total: 0,
    },
  ]);
  const [partyName, setPartyName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [billId, setBillId] = useState(null);
  const [balance, setBalance] = useState(0);
  const [includeBalance, setIncludeBalance] = useState(true);
  const inputRefs = useRef([]);

  const typeOptions = ["Book", "Pad", "Tag", "Register", "Other"];
  const sizeOptions = [
    "1/3",
    "1/4",
    "1/5",
    "1/6",
    "1/8",
    "1/10",
    "1/12",
    "1/16",
    "Other",
  ];

  useEffect(() => {
    if (inputRefs.current.length > 0) {
      const lastInput = inputRefs.current[inputRefs.current.length - 5];
      if (lastInput) lastInput.focus();
    }
  }, [rows.length]);

  const addRow = () => {
    const newRow = {
      id: rows.length + 1,
      particulars: "",
      type: "",
      size: "",
      customType: "",
      customSize: "",
      quantity: "",
      rate: "",
      total: 0,
    };
    setRows([...rows, newRow]);
  };

  const removeRow = () => {
    if (rows.length > 1) setRows((prev) => prev.slice(0, -1));
  };

  const updateRow = (index, field, value) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };

    if (field === "quantity" || field === "rate") {
      const quantity = parseFloat(newRows[index].quantity) || 0;
      const rate = parseFloat(newRows[index].rate) || 0;
      newRows[index].total = quantity * rate;
    }

    setRows(newRows);
  };

  const handleKeyDown = (e, index, field) => {
    if (e.key === "Enter" && index === rows.length - 1 && field === "rate") {
      addRow();
    }
  };

  const fetchBillBySerial = async () => {
    if (!serialNumber.trim()) {
      alert("Please enter a serial number");
      return;
    }

    try {
      const response = await api.get(`/bills/serial/${serialNumber}`);
      const bill = response.data;

      setPartyName(bill.partyName);
      setRows(
        bill.rows.map((row) => ({
          ...row,
          quantity: row.quantity.toString(),
          rate: row.rate.toString(),
          total: row.total || 0,
        }))
      );
      setBillId(bill._id);
      setSerialNumber(bill.serialNumber.toString());
      setBalance(bill.balance);
      setIncludeBalance(bill.includeBalance ?? true);
    } catch (error) {
      console.error("Fetch error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Bill not found";
      alert(`Failed to fetch bill: ${errorMessage}`);
    }
  };

  const fetchPartyBalance = async () => {
    if (!partyName.trim()) {
      alert("Please enter a party name");
      return;
    }

    try {
      const response = await api.get(
        `/bills/party/${encodeURIComponent(partyName)}`
      );
      const { balance, matchedPartyNames } = response.data;

      if (matchedPartyNames.length > 0) {
        setPartyName(matchedPartyNames[0]);
        setBalance(balance);
      }
    } catch (error) {
      console.error("Balance fetch error:", error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Failed to fetch balance: ${errorMessage}`);
    }
  };

  const saveBill = async () => {
    if (!partyName.trim()) {
      throw new Error("Party name is required");
    }

    const currentTotal = rows.reduce((acc, row) => acc + row.total, 0);
    const billData = {
      partyName,
      rows: rows.map((row) => ({
        id: row.id,
        particulars: row.particulars || "",
        type: row.type || "",
        size: row.size || "",
        customType: row.customType || "",
        customSize: row.customSize || "",
        quantity: parseFloat(row.quantity) || 0,
        rate: parseFloat(row.rate) || 0,
        total: row.total || 0,
      })),
      total: includeBalance ? currentTotal + balance : currentTotal,
      includeBalance,
    };

    try {
      let response;
      if (billId) {
        response = await api.put(`/bills/id/${billId}`, billData);
      } else {
        response = await api.post("/bills", billData);
      }

      const savedBill = response.data;
      setBillId(savedBill._id);
      setSerialNumber(savedBill.serialNumber.toString());
      setBalance(savedBill.balance);
      setIncludeBalance(savedBill.includeBalance ?? true);
      return savedBill;
    } catch (error) {
      console.error("Save error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to save bill";
      throw new Error(errorMessage);
    }
  };

  const generatePDF = async () => {
    const fileName = prompt("Enter bill name:");
    if (!fileName) {
      alert("Bill name is required");
      return;
    }
  
    try {
      const savedBill = await saveBill();
  
      const doc = new jsPDF();
      const date = new Date().toLocaleDateString();
      const fileDate = new Date().toISOString().slice(0, 10);
      const currentTotal = rows.reduce((acc, row) => acc + row.total, 0);
      const total = includeBalance ? currentTotal + balance : currentTotal;
      const pageWidth = 210;
  
      // Header Section
      doc.setFillColor(245, 245, 245);
      doc.rect(0, 0, pageWidth, 30, "F");
  
      const logoWidth = 20;
      const companyName = "Star Printing";
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      const textWidth = doc.getTextWidth(companyName);
      const totalWidth = logoWidth + textWidth;
      const startX = (pageWidth - totalWidth) / 2;
  
      try {
        doc.addImage(logo, "PNG", startX, 5, logoWidth, 20);
        doc.text(companyName, startX + logoWidth + 2, 15);
      } catch (error) {
        doc.text(companyName, (pageWidth - textWidth) / 2, 15);
      }
  
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "bold");
      doc.text("1F-51, Faridabad", pageWidth / 2 + 7, 21, { align: "center" });
      doc.setFontSize(8);
      doc.text(
        "Specialist in Book binding, Register binding and offset printing, digital printing and screen printing etc",
        pageWidth / 2,
        27,
        { align: "center" }
      );
  
      // Divider
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.line(14, 30, 196, 30);
  
      // Metadata
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.text(`Date: ${date}`, 196, 10, { align: "right" });
      doc.text(`Serial No: ${savedBill.serialNumber}`, 196, 15, { align: "right" });
  
      if (partyName) {
        doc.setFontSize(15);
        doc.text(`Name: ${partyName}`, 14, 40);
      }
  
      // Table Columns & Data
      const columns = ["#", "Particulars", "Qty", "Rate", "Amount"];
      const data = rows.map((row) => [
        row.id,
        [
          row.particulars,
          row.type === "Other" ? row.customType : row.type,
          row.size === "Other" ? row.customSize : row.size,
        ]
          .filter(Boolean)
          .join(" "),
        row.quantity,
        `Rs. ${parseFloat(row.rate || 0).toFixed(2)}`,
        `Rs. ${row.total.toFixed(2)}`,
      ]);
  
      // Add totals
      if (balance !== 0 && includeBalance) {
        data.push(["", "Current Total", "", "", `Rs. ${currentTotal.toFixed(2)}`]);
        data.push(["", "Balance", "", "", `Rs. ${balance.toFixed(2)}`]);
        data.push(["", "Total", "", "", `Rs. ${total.toFixed(2)}`]);
      } else {
        data.push(["", "Total", "", "", `Rs. ${total.toFixed(2)}`]);
      }
  
      // Pretty Table
      autoTable(doc, {
        startY: partyName ? 45 : 35,
        head: [columns],
        body: data,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: { top: 2, right: 4, bottom: 2, left: 4 },
          textColor: [40, 40, 40],
          lineColor: [220, 220, 220],
          lineWidth: 0.2,
          valign: "middle",
        },
        headStyles: {
          fillColor: [41, 41, 41],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
          lineWidth: 0.5,
          lineColor: [100, 100, 100],
        },
        columnStyles: {
          0: { cellWidth: 18, halign: "center" }, // #
          1: { cellWidth: 75, halign: "left" },   // Particulars (reduced)
          2: { cellWidth: 20, halign: "center" }, // Qty
          3: { cellWidth: 25, halign: "right" },  // Rate
          4: { cellWidth: 35, halign: "right" },  // Amount (increased)
        },
        didParseCell: (data) => {
          const rowIndex = data.row.index;
          const isTotalRow = rowIndex >= rows.length;
      
          // Alternate background
          if (!isTotalRow && data.row.section === "body") {
            data.cell.styles.fillColor = rowIndex % 2 === 0 ? [255, 255, 255] : [245, 245, 245];
          }
      
          // Styling for total rows
          if (isTotalRow && data.row.section === "body") {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [240, 240, 255];
            if (data.column.index === 4) data.cell.styles.halign = "right";
            if (data.column.index === 1) data.cell.styles.halign = "left";
          }
        },
      });
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for choosing Star Printing!", 105, 285, { align: "center" });
      doc.text("For any queries, contact us at +91 9350432551", 105, 290, { align: "center" });
  
      // Save
      const finalFileName = `${fileName}_${partyName || "Bill"}_${fileDate}`;
      doc.save(finalFileName + ".pdf");
    } catch (error) {
      console.error("PDF generation error:", error);
      alert(`Failed to generate PDF: ${error.message}`);
    }
  };
  

  const clearForm = () => {
    setRows([
      {
        id: 1,
        particulars: "",
        type: "",
        size: "",
        customType: "",
        customSize: "",
        quantity: "",
        rate: "",
        total: 0,
      },
    ]);
    setPartyName("");
    setSerialNumber("");
    setBillId(null);
    setBalance(0);
    setIncludeBalance(true);
  };

  const currentTotal = rows.reduce((acc, row) => acc + row.total, 0);
  const total = includeBalance ? currentTotal + balance : currentTotal;

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 max-w-5xl mx-auto ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
    >
      <div
        className={`rounded-lg shadow-lg p-6 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } border`}
      >
        <h2
          className={`text-xl sm:text-2xl font-bold mb-6 text-center text-white ${darkMode ? "bg-blue-500" : "bg-blue-600"
            } p-3 rounded-lg flex items-center justify-center`}
        >
          <img src={logo} alt="Star Printing Logo" className="w-12 h-12 mr-2" />
          Star Printing - Bill Maker
        </h2>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Enter Party Name"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              onBlur={fetchPartyBalance}
              className={`w-full sm:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300 ${darkMode
                ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500"
                : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-600"
                }`}
              aria-label="Enter party name"
            />
            <button
              onClick={fetchPartyBalance}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors hover:scale-105 ${darkMode
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              aria-label="Fetch party balance"
            >
              Get Balance
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Serial Number"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className={`w-full sm:w-40 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300 ${darkMode
                ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500"
                : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-600"
                }`}
              aria-label="Enter serial number"
            />
            <button
              onClick={fetchBillBySerial}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors hover:scale-105 ${darkMode
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              aria-label="Fetch bill by serial number"
            >
              Fetch Bill
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table
            className={`w-full border-collapse border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
          >
            <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <tr>
                <th className="border p-2 w-12 font-semibold">S.No</th>
                <th className="border p-2 text-left font-semibold">
                  Particulars
                </th>
                <th className="border p-2 w-24 font-semibold">Type</th>
                <th className="border p-2 w-24 font-semibold">Size</th>
                <th className="border p-2 w-16 font-semibold">Qty</th>
                <th className="border p-2 w-16 font-semibold">Rate</th>
                <th className="border p-2 w-24 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-t transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                >
                  <td
                    className={`border p-2 text-center ${darkMode ? "text-gray-100" : "text-gray-900"
                      }`}
                  >
                    {row.id}
                  </td>
                  <td className="border p-2">
                    <input
                      ref={(el) => (inputRefs.current[index * 5] = el)}
                      className={`w-full p-1 ${darkMode
                        ? "bg-gray-700 text-gray-100"
                        : "bg-gray-50 text-gray-900"
                        } focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 rounded`}
                      value={row.particulars}
                      onChange={(e) =>
                        updateRow(index, "particulars", e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, index, "particulars")}
                      placeholder="Enter particulars"
                      aria-label={`Particulars for row ${row.id}`}
                    />
                  </td>
                  <td className="border p-2">
                    {row.type === "Other" ? (
                      <input
                        ref={(el) => (inputRefs.current[index * 5 + 1] = el)}
                        className={`w-full p-1 ${darkMode
                          ? "bg-gray-700 text-gray-100"
                          : "bg-gray-50 text-gray-900"
                          } focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 rounded`}
                        value={row.customType}
                        onChange={(e) =>
                          updateRow(index, "customType", e.target.value)
                        }
                        placeholder="Custom type"
                        onKeyDown={(e) => handleKeyDown(e, index, "customType")}
                        aria-label={`Custom type for row ${row.id}`}
                      />
                    ) : (
                      <select
                        ref={(el) => (inputRefs.current[index * 5 + 1] = el)}
                        className={`w-full p-1 ${darkMode
                          ? "bg-gray-700 text-gray-100"
                          : "bg-gray-50 text-gray-900"
                          } focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 rounded`}
                        value={row.type}
                        onChange={(e) =>
                          updateRow(index, "type", e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, index, "type")}
                        aria-label={`Type for row ${row.id}`}
                      >
                        <option value="">Select</option>
                        {typeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="border p-2">
                    {row.size === "Other" ? (
                      <input
                        ref={(el) => (inputRefs.current[index * 5 + 2] = el)}
                        className={`w-full p-1 ${darkMode
                          ? "bg-gray-700 text-gray-100"
                          : "bg-gray-50 text-gray-900"
                          } focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 rounded`}
                        value={row.customSize}
                        onChange={(e) =>
                          updateRow(index, "customSize", e.target.value)
                        }
                        placeholder="Custom size"
                        onKeyDown={(e) => handleKeyDown(e, index, "customSize")}
                        aria-label={`Custom size for row ${row.id}`}
                      />
                    ) : (
                      <select
                        ref={(el) => (inputRefs.current[index * 5 + 2] = el)}
                        className={`w-full p-1 ${darkMode
                          ? "bg-gray-700 text-gray-100"
                          : "bg-gray-50 text-gray-900"
                          } focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 rounded`}
                        value={row.size}
                        onChange={(e) =>
                          updateRow(index, "size", e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, index, "size")}
                        aria-label={`Size for row ${row.id}`}
                      >
                        <option value="">Select</option>
                        {sizeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="border p-2">
                    <input
                      ref={(el) => (inputRefs.current[index * 5 + 3] = el)}
                      type="number"
                      className={`w-full p-1 ${darkMode
                        ? "bg-gray-700 text-gray-100"
                        : "bg-gray-50 text-gray-900"
                        } focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 rounded`}
                      value={row.quantity}
                      onChange={(e) =>
                        updateRow(index, "quantity", e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, index, "quantity")}
                      placeholder="Qty"
                      aria-label={`Quantity for row ${row.id}`}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      ref={(el) => (inputRefs.current[index * 5 + 4] = el)}
                      type="number"
                      className={`w-full p-1 ${darkMode
                        ? "bg-gray-700 text-gray-100"
                        : "bg-gray-50 text-gray-900"
                        } focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 rounded`}
                      value={row.rate}
                      onChange={(e) =>
                        updateRow(index, "rate", e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, index, "rate")}
                      placeholder="Rate"
                      aria-label={`Rate for row ${row.id}`}
                    />
                  </td>
                  <td
                    className={`border p-2 text-center font-medium ${darkMode ? "text-gray-100" : "text-gray-900"
                      }`}
                  >
                    Rs. {row.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          {balance !== 0 && (
            <label
              className={`flex items-center gap-2 ${darkMode ? "text-gray-100" : "text-gray-900"
                }`}
            >
              <input
                type="checkbox"
                checked={includeBalance}
                onChange={(e) => setIncludeBalance(e.target.checked)}
                className={`h-4 w-4 rounded border focus:ring-2 ${darkMode
                  ? "bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                  : "bg-gray-50 border-gray-300 text-blue-600 focus:ring-blue-600"
                  }`}
                aria-label="Include previous balance in total"
              />
              Include previous balance in total
            </label>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={addRow}
              className={`px-4 py-2 rounded-lg font-medium transition-colors hover:scale-105 ${darkMode
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-green-600 text-white hover:bg-green-700"
                }`}
              aria-label="Add new row"
            >
              Add Row
            </button>
            <button
              onClick={removeRow}
              className={`px-4 py-2 rounded-lg font-medium transition-colors hover:scale-105 ${darkMode
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-red-600 text-white hover:bg-red-700"
                }`}
              aria-label="Remove last row"
            >
              Remove Row
            </button>
            <button
              onClick={generatePDF}
              className={`px-4 py-2 rounded-lg font-medium transition-colors hover:scale-105 ${darkMode
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              aria-label={
                billId ? "Update and generate PDF" : "Save and generate PDF"
              }
            >
              {billId ? "Update & Generate PDF" : "Save & Generate PDF"}
            </button>
            <button
              onClick={clearForm}
              className={`px-4 py-2 rounded-lg font-medium transition-colors hover:scale-105 ${darkMode
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              aria-label="Clear form"
            >
              Clear Form
            </button>
          </div>

          <div className="flex flex-col items-end">
            {balance !== 0 && includeBalance && (
              <>
                <div
                  className={`text-lg font-bold ${darkMode ? "text-gray-100" : "text-gray-800"
                    }`}
                >
                  Current Total: Rs.{currentTotal.toFixed(2)}
                </div>
                <div
                  className={`text-sm font-medium ${darkMode ? "text-red-400" : "text-red-600"
                    }`}
                >
                  Balance: Rs.{balance.toFixed(2)}
                </div>
              </>
            )}
            <div
              className={`text-lg font-bold ${darkMode ? "text-gray-100" : "text-gray-800"
                }`}
            >
              Total: Rs.{total.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillMaker;