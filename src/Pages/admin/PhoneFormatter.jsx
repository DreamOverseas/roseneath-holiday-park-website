import React, { useState } from "react";
import Papa from "papaparse";

export default function PhoneFormatter() {
  const [rows, setRows] = useState([]);
  const [formattedRows, setFormattedRows] = useState([]);

  // Upload CSV and parse it
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setRows(result.data);
        setFormattedRows([]); // reset formatted data
      },
    });
  };

  // Clean + format phone numbers
  const cleanPhoneNumber = (raw) => {
  if (!raw) return "";

  // Convert scientific notation to string
  raw = String(raw);

  // Remove all non-digits
  let num = raw.replace(/\D/g, "");

  // Fix Excel scientific notation (e.g., 4.47825E+11)
  if (raw.toLowerCase().includes("e")) {
    num = Number(raw).toFixed(0);
  }

  // Mobile numbers (start with 4, length 9)
  if (num.length === 9 && num.startsWith("4")) {
    return "+61" + num;
  }

  // Mobile numbers starting with 0
  if (num.length === 10 && num.startsWith("0")) {
    return "+61" + num.substring(1);
  }

  // Already has 61
  if (num.startsWith("61")) {
    return "+" + num;
  }

  // Landline (8 digits)
  if (num.length === 8) {
    return "+613" + num; // VIC default
  }

  return "+61" + num;
};

  // Apply formatting to all rows
  const formatAll = () => {
    const updated = rows.map((row) => {
      const newRow = { ...row };

      // Try to detect phone column
      const phoneKey = Object.keys(row).find((key) =>
        key.toLowerCase().includes("phone")
      );

      if (phoneKey) {
        newRow[phoneKey] = cleanPhoneNumber(row[phoneKey]);
      }

      return newRow;
    });

    setFormattedRows(updated);
  };

  // Download cleaned CSV
  const downloadCSV = () => {
    const csv = Papa.unparse(formattedRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "formatted.csv";
    link.click();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Phone Number Formatter</h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleUpload}
        className="mb-4"
      />

      {rows.length > 0 && (
        <button
          onClick={formatAll}
          className="px-4 py-2 bg-blue-600 text-white rounded mr-3"
        >
          Format Phone Numbers
        </button>
      )}

      {formattedRows.length > 0 && (
        <button
          onClick={downloadCSV}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Download Cleaned CSV
        </button>
      )}

      {/* Preview */}
      {rows.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Preview</h2>
          <pre className="bg-gray-100 p-4 rounded max-h-96 overflow-auto">
            {JSON.stringify(formattedRows.length > 0 ? formattedRows : rows, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
