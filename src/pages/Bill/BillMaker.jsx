import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../assets/star.png";
import { api } from "../../utils/api";

// BillMaker component for creating, managing, and previewing bills
function BillMaker({ darkMode }) {
  // State management
  const [rows, setRows] = useState([{ id: 1, particulars: "", type: "", size: "", customType: "", customSize: "", quantity: "", rate: "", total: 0 }]);
  const [partyName, setPartyName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [billId, setBillId] = useState(null);
  const [balance, setBalance] = useState(0);
  const [includeBalance, setIncludeBalance] = useState(true);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Constants
  const typeOptions = ["Book", "Pad", "Tag", "Register", "Other"];
  const sizeOptions = ["1/3", "1/4", "1/5", "1/6", "1/8", "1/10", "1/12", "1/16", "Other"];
  const total = rows.reduce((acc, row) => acc + row.total, 0) + (includeBalance ? balance : 0);

  // Auto-focus last input
  useEffect(() => {
    if (inputRefs.current.length > 0) {
      const lastInput = inputRefs.current[inputRefs.current.length - 5];
      lastInput?.focus();
    }
  }, [rows.length]);

  // Row operations
  const addRow = () => setRows([...rows, { id: rows.length + 1, particulars: "", type: "", size: "", customType: "", customSize: "", quantity: "", rate: "", total: 0 }]);
  const removeRow = () => rows.length > 1 && setRows(prev => prev.slice(0, -1));

  const updateRow = (index, field, value) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    if (["quantity", "rate"].includes(field)) {
      const quantity = parseFloat(newRows[index].quantity) || 0;
      const rate = parseFloat(newRows[index].rate) || 0;
      newRows[index].total = quantity * rate;
    }
    setRows(newRows);
  };

  // Fetch bill by serial number
  const fetchBillBySerial = async () => {
    if (!serialNumber.trim()) return alert("Please enter a serial number");
    try {
      const { data } = await api.get(`/bills/serial/${serialNumber}`);
      setPartyName(data.partyName);
      setRows(data.rows.map(row => ({ ...row, quantity: row.quantity.toString(), rate: row.rate.toString() })));
      setBillId(data._id);
      setSerialNumber(data.serialNumber.toString());
      setBalance(data.balance);
      setIncludeBalance(data.includeBalance ?? true);
    } catch (error) {
      alert(`Failed to fetch bill: ${error.response?.data?.message || error.message}`);
    }
  };

  // Fetch party balance
  const fetchPartyBalance = async () => {
    if (!partyName.trim()) return alert("Please enter a party name");
    try {
      const { data } = await api.get(`/bills/party/${encodeURIComponent(partyName)}`);
      data.matchedPartyNames.length > 0 && setPartyName(data.matchedPartyNames[0]);
      setBalance(data.balance);
    } catch (error) {
      alert(`Failed to fetch balance: ${error.response?.data?.message || error.message}`);
    }
  };

  // Generate PDF
  const generatePDF = async () => {
    const fileName = prompt("Enter bill name:") || "Bill";
    try {
      const savedBill = await saveBill();
      const doc = new jsPDF();
      const date = new Date().toLocaleDateString();
      doc.setFillColor(245, 245, 245);
      doc.rect(0, 0, 210, 30, "F");
      doc.addImage(logo, "PNG", 85, 5, 20, 20);
      doc.setFontSize(16).setFont("helvetica", "bold").text("Star Printing", 105, 15, null, "center");
      doc.setFontSize(10).setTextColor(100).text("1F-51, Faridabad", 105, 21, null, "center");
      doc.setFontSize(8).text("Specialist in Book binding, Register binding and offset printing", 105, 27, null, "center");
      doc.setFontSize(10).setTextColor(40).text(`Date: ${date}`, 196, 10, null, "right");
      doc.text(`Serial No: ${savedBill.serialNumber}`, 196, 15, null, "right");
      partyName && doc.setFontSize(15).text(`Name: ${partyName}`, 14, 40);
      const tableData = rows.map(row => [
        row.id,
        [row.particulars, row.type === "Other" ? row.customType : row.type, row.size === "Other" ? row.customSize : row.size].filter(Boolean).join(" "),
        row.quantity,
        `Rs. ${parseFloat(row.rate || 0).toFixed(2)}`,
        `Rs. ${row.total.toFixed(2)}`
      ]);
      if (balance !== 0 && includeBalance) {
        tableData.push(["", "Current Total", "", "", `Rs. ${total.toFixed(2)}`], ["", "Balance", "", "", `Rs. ${balance.toFixed(2)}`], ["", "Total", "", "", `Rs. ${total.toFixed(2)}`]);
      } else {
        tableData.push(["", "Total", "", "", `Rs. ${total.toFixed(2)}`]);
      }
      autoTable(doc, {
        startY: partyName ? 45 : 35,
        head: [["#", "Particulars", "Qty", "Rate", "Amount"]],
        body: tableData,
        styles: { fontSize: 10, textColor: 40, lineColor: 220, lineWidth: 0.2 },
        headStyles: { fillColor: 41, textColor: 255, fontStyle: "bold" },
        columnStyles: { 0: { cellWidth: 18 }, 1: { cellWidth: 75 }, 2: { cellWidth: 20 }, 3: { cellWidth: 25 }, 4: { cellWidth: 35 } }
      });
      doc.save(`${fileName}_${partyName}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      alert(`Failed to generate PDF: ${error.message}`);
    }
  };

  // Save bill and navigate to InvoiceBill with bill data
  const seeInvoice = async () => {
    try {
      const savedBill = await saveBill();
      const invoiceData = {
        partyName,
        serialNumber: savedBill.serialNumber.toString(),
        date: new Date().toLocaleDateString(),
        rows: rows.map(row => ({
          description: [row.particulars, row.type === "Other" ? row.customType : row.type, row.size === "Other" ? row.customSize : row.size].filter(Boolean).join(" "),
          quantity: parseFloat(row.quantity) || 0,
          rate: parseFloat(row.rate) || 0,
          total: row.total
        })),
        currentTotal: rows.reduce((acc, row) => acc + row.total, 0),
        previousBalance: includeBalance ? balance : 0,
        grandTotal: total
      };
      navigate("/invoice", { state: invoiceData });
    } catch (error) {
      alert(`Failed to save bill: ${error.response?.data?.message || error.message}`);
    }
  };

  // Clear form data
  const clearForm = () => {
    setRows([{ id: 1, particulars: "", type: "", size: "", customType: "", customSize: "", quantity: "", rate: "", total: 0 }]);
    setPartyName("");
    setSerialNumber("");
    setBillId(null);
    setBalance(0);
    setIncludeBalance(true);
  };

  // Save bill to backend
  const saveBill = async () => {
    const billData = {
      partyName,
      rows: rows.map(row => ({
        ...row,
        quantity: parseFloat(row.quantity) || 0,
        rate: parseFloat(row.rate) || 0,
        total: row.total || 0
      })),
      total: includeBalance ? total : total - balance,
      includeBalance
    };
    try {
      const { data } = billId ? await api.put(`/bills/id/${billId}`, billData) : await api.post("/bills", billData);
      setBillId(data._id);
      setSerialNumber(data.serialNumber.toString());
      setBalance(data.balance);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to save bill");
    }
  };

  // Responsive styles
  const containerStyles = `min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto ${darkMode ? "bg-gray-900" : "bg-gray-100"}`;
  const cardStyles = `rounded-xl shadow-lg p-4 sm:p-6 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border`;
  const inputStyles = `w-full p-2 sm:p-3 rounded-lg border ${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-gray-50 text-gray-900 border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500 transition`;
  const buttonStyles = (color) => `px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 ${darkMode ? `bg-${color}-500 hover:bg-${color}-600` : `bg-${color}-600 hover:bg-${color}-700`}`;
  const tableStyles = `w-full border-collapse text-sm ${darkMode ? "text-gray-100" : "text-gray-900"}`;

  return (
    <div className={containerStyles}>
      <div className={cardStyles}>
        {/* Header */}
        <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-center ${darkMode ? "bg-blue-500 text-white" : "bg-blue-600 text-white"} p-3 rounded-lg flex items-center justify-center transition-all`}>
          <img src={logo} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 mr-2" />
          Star Printing - Bill Maker
        </h2>

        {/* Search Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Party Name"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                onBlur={fetchPartyBalance}
                className={`${inputStyles} flex-1`}
              />
              <button onClick={fetchPartyBalance} className={buttonStyles("blue")}>
                Get Balance
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Serial Number"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className={`${inputStyles} flex-1`}
              />
              <button onClick={fetchBillBySerial} className={buttonStyles("blue")}>
                Fetch Bill
              </button>
            </div>
          </div>
        </div>

        {/* Bill Table */}
        <div className="overflow-x-auto">
          <table className={tableStyles}>
            <thead className={darkMode ? "bg-gray-700" : "bg-gray-100"}>
              <tr>
                {["S.No", "Particulars", "Type", "Size", "Qty", "Rate", "Amount"].map((header) => (
                  <th key={header} className="border p-2 sm:p-3 font-semibold text-left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className={`border-t ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors`}>
                  <td className="border p-2 sm:p-3 text-center">{row.id}</td>
                  <td className="border p-2 sm:p-3">
                    <input
                      ref={(el) => (inputRefs.current[index * 5] = el)}
                      className={inputStyles}
                      value={row.particulars}
                      onChange={(e) => updateRow(index, "particulars", e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && index === rows.length - 1 && addRow()}
                    />
                  </td>
                  {["type", "size"].map((field) => (
                    <td key={field} className="border p-2 sm:p-3">
                      {row[field] === "Other" ? (
                        <input
                          ref={(el) => (inputRefs.current[index * 5 + (field === "type" ? 1 : 2)] = el)}
                          className={inputStyles}
                          value={row[`custom${field.charAt(0).toUpperCase() + field.slice(1)}`]}
                          onChange={(e) => updateRow(index, `custom${field.charAt(0).toUpperCase() + field.slice(1)}`, e.target.value)}
                          placeholder={`Custom ${field}`}
                        />
                      ) : (
                        <select
                          ref={(el) => (inputRefs.current[index * 5 + (field === "type" ? 1 : 2)] = el)}
                          className={inputStyles}
                          value={row[field]}
                          onChange={(e) => updateRow(index, field, e.target.value)}
                        >
                          <option value="">Select</option>
                          {(field === "type" ? typeOptions : sizeOptions).map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  ))}
                  {["quantity", "rate"].map((field) => (
                    <td key={field} className="border p-2 sm:p-3">
                      <input
                        type="number"
                        ref={(el) => (inputRefs.current[index * 5 + (field === "quantity" ? 3 : 4)] = el)}
                        className={inputStyles}
                        value={row[field]}
                        onChange={(e) => updateRow(index, field, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="border p-2 sm:p-3 text-center">Rs. {row.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Balance and Total Section */}
        <div className="mt-4">
          {balance !== 0 && (
            <label className={`flex items-center gap-2 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              <input
                type="checkbox"
                checked={includeBalance}
                onChange={(e) => setIncludeBalance(e.target.checked)}
                className={`h-4 w-4 rounded border ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
              />
              Include previous balance
            </label>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {["Add Row", "Remove Row", billId ? "Update & PDF" : "Save & PDF", "Clear Form", "See Invoice"].map((btn, idx) => (
              <button
                key={btn}
                onClick={[addRow, removeRow, generatePDF, clearForm, seeInvoice][idx]}
                className={`${buttonStyles(["green", "red", "blue", "gray", "purple"][idx])} flex-1 sm:flex-none text-sm sm:text-base`}
              >
                {btn}
              </button>
            ))}
          </div>
          <div className={`text-right ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
            {balance !== 0 && includeBalance && (
              <>
                <div className="text-sm">Current: Rs.{total.toFixed(2)}</div>
                <div className="text-red-500 text-sm">Balance: Rs.{balance.toFixed(2)}</div>
              </>
            )}
            <div className="text-lg font-bold">Total: Rs.{total.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillMaker;