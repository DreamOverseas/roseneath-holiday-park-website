import React, { useState } from "react";
import Papa from "papaparse";

export default function PhoneFormatter() {
  const [rows, setRows] = useState([]);
  const [formattedRows, setFormattedRows] = useState([]);
  const [errors, setErrors] = useState([]);

  // Upload CSV and parse it
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setRows(result.data);
        setFormattedRows([]);
        setErrors([]);
      },
    });
  };

  // -----------------------------
  // EMAIL VALIDATION + AUTO-FIX
  // -----------------------------
  const isValidEmail = (email) => {
    if (!email) return false;

    const trimmed = email.trim().toLowerCase();

    // Basic format check
    const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicRegex.test(trimmed)) return false;

    // Common typo domains
    const badDomains = [
      "gamil.com",
      "gnail.com",
      "hotmial.com",
      "hotnail.com",
      "outlok.com",
      "yaho.com",
      "icloud.co",
    ];

    const domain = trimmed.split("@")[1];
    if (badDomains.includes(domain)) return false;

    return true;
  };

  const autoFixEmail = (email) => {
    if (!email) return email;

    let fixed = email.trim().toLowerCase();

    const corrections = {
      "gamil.com": "gmail.com",
      "gnail.com": "gmail.com",
      "hotmial.com": "hotmail.com",
      "hotnail.com": "hotmail.com",
      "outlok.com": "outlook.com",
      "yaho.com": "yahoo.com",
      "icloud.co": "icloud.com",
    };

    const [local, domain] = fixed.split("@");
    if (corrections[domain]) {
      fixed = `${local}@${corrections[domain]}`;
    }

    return fixed;
  };

  // -----------------------------
  // PHONE CLEANING
  // -----------------------------
  const cleanPhoneNumber = (raw) => {
    if (!raw) return "";

    raw = String(raw);

    // Remove non-digits
    let num = raw.replace(/\D/g, "");

    // Fix scientific notation
    if (raw.toLowerCase().includes("e")) {
      num = Number(raw).toFixed(0);
    }

    // Mobile (4xxxxxxxx)
    if (num.length === 9 && num.startsWith("4")) {
      return "+61" + num;
    }

    // Mobile starting with 0
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

  // -----------------------------
  // MAIN FORMATTER
  // -----------------------------
  const formatAll = () => {
    const newErrors = [];

    const updated = rows.map((row, index) => {
      const newRow = { ...row };

      // ---- EMAIL FIX + VALIDATION ----
      if (newRow["Email"]) {
        newRow["Email"] = autoFixEmail(newRow["Email"]);
        if (!isValidEmail(newRow["Email"])) {
          newErrors.push({
            row: index + 1,
            field: "Email",
            value: newRow["Email"],
            message: "Invalid Email",
          });
        }
      }

      if (newRow["Email 2"]) {
        newRow["Email 2"] = autoFixEmail(newRow["Email 2"]);
        if (!isValidEmail(newRow["Email 2"])) {
          newErrors.push({
            row: index + 1,
            field: "Email 2",
            value: newRow["Email 2"],
            message: "Invalid Email 2",
          });
        }
      }

      // ---- PHONE CLEANING ----
      const phoneKeys = Object.keys(row).filter((key) =>
        key.toLowerCase().includes("phone")
      );

      phoneKeys.forEach((key) => {
        newRow[key] = cleanPhoneNumber(row[key]);
      });

      return newRow;
    });

    setErrors(newErrors);
    setFormattedRows(updated);
  };

  // -----------------------------
  // DOWNLOAD CSV
  // -----------------------------
  const downloadCSV = () => {
    const csv = Papa.unparse(formattedRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "formatted.csv";
    link.click();
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Phone & Email Formatter</h1>

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
          Format Data
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

      {/* ERROR DISPLAY */}
      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Invalid Emails Found:</strong>
          <ul className="list-disc ml-6">
            {errors.map((e, i) => (
              <li key={i}>
                Row {e.row}: {e.field} "{e.value}" → {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* PREVIEW */}
      {rows.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Preview</h2>
          <pre className="bg-gray-100 p-4 rounded max-h-96 overflow-auto">
            {JSON.stringify(
              formattedRows.length > 0 ? formattedRows : rows,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
