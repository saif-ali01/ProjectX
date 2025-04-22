import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../assets/star.png";

function BillMaker() {
  const navigate = useNavigate();
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
  const [previousBalance, setPreviousBalance] = useState(0);
  const inputRefs = useRef([]);

  const typeOptions = ["Book", "Pad", "Tag", "Register", "Other"];
  const sizeOptions = ["1/3", "1/4", "1/5", "1/6", "1/8", "1/10", "1/12", "1/16", "Other"];

  useEffect(() => {
    const fetchLatestBillByParty = async () => {
      if (!partyName.trim()) {
        setPreviousBalance(0);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/bills/party/${encodeURIComponent(partyName)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            setPreviousBalance(0);
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch latest bill");
        }

        const bill = await response.json();
        setPreviousBalance(bill.balance || 0);
      } catch (error) {
        console.error("Fetch latest bill error:", error);
        setPreviousBalance(0);
      }
    };

    fetchLatestBillByParty();
  }, [partyName]);

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
      const response = await fetch(
        `http://localhost:5000/api/bills/serial/${serialNumber}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Bill not found");
      }

      const bill = await response.json();
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
      setPreviousBalance(bill.balance || 0);
    } catch (error) {
      console.error("Fetch error:", error);
      alert(`Failed to fetch bill: ${error.message}`);
    }
  };

  const saveBill = async () => {
    if (!partyName.trim()) {
      throw new Error("Party name is required");
    }

    const currentTotal = rows.reduce((acc, row) => acc + (parseFloat(row.total) || 0), 0);
    const balance = currentTotal + previousBalance;

    const billData = {
      partyName,
      rows: rows.map((row) => ({
        id: Number(row.id),
        particulars: row.particulars || "",
        type: row.type || "",
        size: row.size || "",
        customType: row.customType || "",
        customSize: row.customSize || "",
        quantity: parseFloat(row.quantity) || 0,
        rate: parseFloat(row.rate) || 0,
        total: parseFloat(row.total) || 0,
      })),
      total: currentTotal,
      advance: 0,
      previousBalance,
      balance,
    };

    try {
      const url = billId
        ? `http://localhost:5000/api/bills/id/${billId}`
        : "http://localhost:5000/api/bills";
      const method = billId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save bill");
      }

      const savedBill = await response.json();
      setBillId(savedBill._id);
      setSerialNumber(savedBill.serialNumber.toString());
      return savedBill;
    } catch (error) {
      console.error("Save error:", error);
      throw error;
    }
  };

  const handleSeeInvoice = async () => {
    if (!partyName.trim()) {
      alert("Party name is required");
      return;
    }

    try {
      const savedBill = await saveBill();
      const currentTotal = rows.reduce((acc, row) => acc + (parseFloat(row.total) || 0), 0);
      const billData = {
        partyName,
        serialNumber: savedBill.serialNumber.toString(),
        date: new Date().toLocaleDateString(),
        rows: rows.map((row) => ({
          description: [
            row.particulars || "",
            row.type === "Other" ? row.customType || "" : row.type || "",
            row.size === "Other" ? row.customSize || "" : row.size || "",
          ].filter(Boolean).join(" "),
          quantity: parseFloat(row.quantity) || 0,
          rate: parseFloat(row.rate) || 0,
          total: parseFloat(row.total) || 0,
        })),
        currentTotal,
        previousBalance,
        grandTotal: currentTotal + previousBalance,
      };
      navigate("/invoices", { state: billData });
    } catch (error) {
      console.error("See invoice error:", error);
      alert(`Failed to view invoice: ${error.message}`);
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
      const currentSerialNumber = savedBill.serialNumber.toString();

      const doc = new jsPDF();
      const date = new Date().toLocaleDateString();
      const fileDate = new Date().toISOString().slice(0, 10);
      const currentTotal = rows.reduce((acc, row) => acc + row.total, 0);
      const grandTotal = currentTotal + previousBalance;
      const pageWidth = 210;

      doc.setFillColor(245, 245, 245);
      doc.rect(0, 0, pageWidth, 30, "F");

      const logoWidth = 20;
      const companyName = "Star Printing";
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      const textWidth = doc.getTextWidth(companyName);
      const totalWidth = logoWidth + textWidth;
      const startX = (pageWidth - totalWidth) / 2;

      try {
        doc.addImage(logo, "PNG", startX, 5, logoWidth, 20);
        doc.text(companyName, startX + logoWidth, 15);
      } catch (error) {
        console.error("Logo error:", error);
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

      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.line(14, 30, 196, 30);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.text(`Date: ${date}`, 196, 10, { align: "right" });
      doc.text(`Serial No: ${currentSerialNumber}`, 196, 15, { align: "right" });
      if (partyName) {
        doc.setFontSize(15);
        doc.text(`Name: ${partyName}`, 14, 40);
      }

      const columns = ["#", "Particulars", "Qty", "Rate", "Amount"];
      const data = rows.map((row) => {
        const particularsCombined = [
          row.particulars || "",
          row.type === "Other" ? row.customType || "" : row.type || "",
          row.size === "Other" ? row.customSize || "" : row.size || "",
        ]
          .filter(Boolean)
          .join(" ");
        return [
          row.id,
          particularsCombined || "",
          row.quantity || "",
          `Rs. ${parseFloat(row.rate || 0).toFixed(2)}`,
          `Rs. ${row.total.toFixed(2)}`,
        ];
      });

      autoTable(doc, {
        startY: partyName ? 45 : 35,
        head: [columns],
        body: data,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 2, halign: "center" },
        headStyles: {
          fillColor: [41, 41, 41],
          textColor: 255,
          fontStyle: "bold",
        },
        bodyStyles: { textColor: [40, 40, 40] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { halign: "left" },
          2: { cellWidth: 15 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 },
        },
      });

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Current Total: Rs.${currentTotal.toFixed(2)}`,
        190,
        doc.lastAutoTable.finalY + 10,
        { align: "right" }
      );

      if (previousBalance > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Previous Balance: Rs.${previousBalance.toFixed(2)}`,
          190,
          doc.lastAutoTable.finalY + 20,
          { align: "right" }
        );
      }

      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Grand Total: Rs.${grandTotal.toFixed(2)}`,
        190,
        doc.lastAutoTable.finalY + (previousBalance > 0 ? 30 : 20),
        { align: "right" }
      );

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for choosing Star Printing!", 105, 285, { align: "center" });
      doc.text("For any queries, contact us at +91 9350432551", 105, 290, { align: "center" });

      const finalFileName = `${fileName}_${currentSerialNumber}_${fileDate}`;
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
    setPreviousBalance(0);
  };

  const currentTotal = rows.reduce((acc, row) => acc + row.total, 0);
  const grandTotal = currentTotal + previousBalance;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow-xl rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-white bg-blue-600 p-2 rounded flex items-center justify-center">
        <img src={logo} alt="Logo" className="w-16 h-12 mr-2" />
        Star Printing - Bill Maker
      </h2>

      <div className="mb-4 flex gap-4 justify-center">
        <input
          type="text"
          placeholder="Enter Party Name"
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
          className="px-4 py-2 border rounded-lg text-center w-64"
        />
        <input
          type="text"
          placeholder="Serial Number"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          className="px-4 py-2 border rounded-lg text-center w-32"
        />
        <button
          onClick={fetchBillBySerial}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded hover:scale-105 transition-transform"
        >
          Fetch Bill
        </button>
      </div>

      {previousBalance > 0 && (
        <div className="mb-4 text-lg font-semibold text-red-600 text-center">
          Previous Balance: Rs.{previousBalance.toFixed(2)}
        </div>
      )}

      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 w-12">#</th>
            <th className="border p-2">Particulars</th>
            <th className="border p-2 w-24">Type</th>
            <th className="border p-2 w-24">Size</th>
            <th className="border p-2 w-16">Qty</th>
            <th className="border p-2 w-16">Rate</th>
            <th className="border p-2 w-24">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id}>
              <td className="border p-2 text-center">{row.id}</td>
              <td className="border p-2">
                <input
                  ref={(el) => {
                    if (el) inputRefs.current[index * 5] = el;
                  }}
                  className="w-full p-1 bg-transparent focus:outline-none text-center"
                  value={row.particulars}
                  onChange={(e) => updateRow(index, "particulars", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, "particulars")}
                />
              </td>
              <td className="border p-2 text-center">
                {row.type === "Other" ? (
                  <input
                    ref={(el) => {
                      if (el) inputRefs.current[index * 5 + 1] = el;
                    }}
                    className="p-1 bg-transparent border-none focus:outline-none text-center w-full"
                    value={row.customType}
                    onChange={(e) => updateRow(index, "customType", e.target.value)}
                    placeholder="Custom type"
                    onKeyDown={(e) => handleKeyDown(e, index, "customType")}
                  />
                ) : (
                  <select
                    ref={(el) => {
                      if (el) inputRefs.current[index * 5 + 1] = el;
                    }}
                    className="p-1 bg-transparent border-none focus:outline-none w-full text-center"
                    value={row.type}
                    onChange={(e) => updateRow(index, "type", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, "type")}
                  >
                    <option value="">Select</option>
                    {typeOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                )}
              </td>
              <td className="border p-2 text-center">
                {row.size === "Other" ? (
                  <input
                    ref={(el) => {
                      if (el) inputRefs.current[index * 5 + 2] = el;
                    }}
                    className="p-1 bg-transparent border-none focus:outline-none text-center w-full"
                    value={row.customSize}
                    onChange={(e) => updateRow(index, "customSize", e.target.value)}
                    placeholder="Custom size"
                    onKeyDown={(e) => handleKeyDown(e, index, "customSize")}
                  />
                ) : (
                  <select
                    ref={(el) => {
                      if (el) inputRefs.current[index * 5 + 2] = el;
                    }}
                    className="p-1 bg-transparent border-none focus:outline-none w-full text-center"
                    value={row.size}
                    onChange={(e) => updateRow(index, "size", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, "size")}
                  >
                    <option value="">Select</option>
                    {sizeOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                )}
              </td>
              <td className="border p-2 text-center">
                <input
                  ref={(el) => {
                    if (el) inputRefs.current[index * 5 + 3] = el;
                  }}
                  type="number"
                  className="p-1 bg-transparent border-none focus:outline-none text-center w-full"
                  value={row.quantity}
                  onChange={(e) => updateRow(index, "quantity", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, "quantity")}
                />
              </td>
              <td className="border p-2 text-center">
                <input
                  ref={(el) => {
                    if (el) inputRefs.current[index * 5 + 4] = el;
                  }}
                  type="number"
                  className="p-1 bg-transparent border-none focus:outline-none text-center w-full"
                  value={row.rate}
                  onChange={(e) => updateRow(index, "rate", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, "rate")}
                />
              </td>
              <td className="border p-2 text-center">Rs. {row.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-4">
          <button
            onClick={addRow}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded hover:scale-105 transition-transform"
          >
            Add Row
          </button>
          <button
            onClick={removeRow}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded hover:scale-105 transition-transform"
          >
            Remove Row
          </button>
          <button
            onClick={generatePDF}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded hover:scale-105 transition-transform"
          >
            {billId ? "Update & Generate PDF" : "Save & Generate PDF"}
          </button>
          <button
            onClick={clearForm}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded hover:scale-105 transition-transform"
          >
            Clear Form
          </button>
          <button
            onClick={handleSeeInvoice}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded hover:scale-105 transition-transform"
          >
            See Invoice
          </button>
        </div>
        <div className="text-lg font-bold">
          <div>Current Total: Rs.{currentTotal.toFixed(2)}</div>
          {previousBalance > 0 && (
            <div>Previous Balance: Rs.{previousBalance.toFixed(2)}</div>
          )}
          <div>Grand Total: Rs.{grandTotal.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}

export default BillMaker;