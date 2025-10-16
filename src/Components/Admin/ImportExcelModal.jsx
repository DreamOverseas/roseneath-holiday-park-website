import React, { useState } from 'react';

export default function ImportExcelModal({ 
  isOpen, 
  onClose, 
  onImportSuccess 
}) {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [parsedData, setParsedData] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Generate random 8-digit password
  const generatePassword = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  // Parse name into first and last name
  const parseName = (fullName) => {
    if (!fullName || fullName.trim() === '') {
      return { firstName: '', lastName: '' };
    }
    
    const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 0);
    
    if (nameParts.length === 0) {
      return { firstName: '', lastName: '' };
    } else if (nameParts.length === 1) {
      return { firstName: nameParts[0], lastName: '' };
    } else {
      return {
        firstName: nameParts[0],
        lastName: nameParts[nameParts.length - 1]
      };
    }
  };

  // Parse date in various formats
  const parseDate = (dateString) => {
    if (!dateString || dateString.trim() === '') return null;
    
    const date = new Date(dateString.trim());
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    return null;
  };

  // Parse Power field
  const parsePower = (powerString) => {
    if (!powerString || powerString.trim() === '') return null;
    
    const normalized = powerString.trim().toLowerCase();
    if (normalized === 'powered') return 'Powered';
    if (normalized === 'unpowered') return 'Unpowered';
    return null;
  };

  // Parse CSV content
  const parseCSV = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length < 2) {
      throw new Error('File must contain at least a header row and one data row');
    }

    const headers = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Check for required headers
    const requiredHeaders = ['Site Number', 'Name 1', 'Name 2', 'Address', 'Phone 1', 'Phone 2', 'Email 1', 'Email 2'];
    const optionalHeaders = ['Start date', 'CR', 'End date', 'Note', 'Powered or not'];
    
    const headerMap = {};
    
    requiredHeaders.forEach(reqHeader => {
      const index = headers.findIndex(h => h.toLowerCase() === reqHeader.toLowerCase());
      if (index === -1) {
        throw new Error(`Missing required column: ${reqHeader}`);
      }
      headerMap[reqHeader] = index;
    });

    // Map optional headers
    optionalHeaders.forEach(optHeader => {
      const index = headers.findIndex(h => h.toLowerCase() === optHeader.toLowerCase());
      if (index !== -1) {
        headerMap[optHeader] = index;
      }
    });

    const records = [];
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 10);

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
      
      const email1 = values[headerMap['Email 1']] || '';
      
      // Only import if Email 1 is not empty
      if (email1 && email1.trim() !== '') {
        const name1 = parseName(values[headerMap['Name 1']] || '');
        const name2 = parseName(values[headerMap['Name 2']] || '');
        const phone1 = values[headerMap['Phone 1']] || '';
        const phone2 = values[headerMap['Phone 2']] || '';

        const record = {
          SiteNumber: values[headerMap['Site Number']] || '',
          FirstName: name1.firstName,
          LastName: name1.lastName,
          Email: email1.trim(),
          Contact: phone1 ? parseInt(phone1.replace(/\D/g, '')) : null,
          FirstName2: name2.firstName,
          LastName2: name2.lastName,
          Email2: values[headerMap['Email 2']] || '',
          Contact2: phone2 ? parseInt(phone2.replace(/\D/g, '')) : null,
          Address: values[headerMap['Address']] || '',
          IsMember: true,
          ExpiryDate: expiryDate.toISOString().split('T')[0],
          Password: generatePassword(),
          UserName: email1.trim(),
          TenantType: 'Guest',
          Point: 0,
          DiscountPoint: 0
        };

        // Add optional fields if present
        if (headerMap['Start date'] !== undefined) {
          const startDate = parseDate(values[headerMap['Start date']]);
          if (startDate) record.StartDate = startDate;
        }

        if (headerMap['End date'] !== undefined) {
          const endDate = parseDate(values[headerMap['End date']]);
          if (endDate) record.EndDate = endDate;
        }

        if (headerMap['CR'] !== undefined) {
          const cr = values[headerMap['CR']] || '';
          if (cr && cr.trim() !== '') {
            const crNumber = parseFloat(cr.trim());
            if (!isNaN(crNumber)) record.CR = crNumber;
          }
        }

        if (headerMap['Note'] !== undefined) {
          const note = values[headerMap['Note']] || '';
          if (note && note.trim() !== '') {
            record.Note = note.trim();
          }
        }

        if (headerMap['Powered or not'] !== undefined) {
          const power = parsePower(values[headerMap['Powered or not']]);
          if (power) record.Power = power;
        }

        records.push(record);
      }
    }

    return records;
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const records = parseCSV(text);
        
        if (records.length === 0) {
          setUploadError('No valid records found. Make sure Email 1 is filled for records you want to import.');
          return;
        }

        setParsedData(records);
        setShowPreviewModal(true);
      } catch (err) {
        setUploadError(err.message);
      }
    };

    reader.onerror = () => {
      setUploadError('Failed to read file');
    };

    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Check if user exists by email
  const checkUserExists = async (email) => {
    try {
      const response = await fetch(`https://api.do360.com/api/rhp-memberships?filters[Email][$eq]=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        return data.data && data.data.length > 0 ? data.data[0] : null;
      }
      return null;
    } catch (err) {
      console.error('Error checking user existence:', err);
      return null;
    }
  };

  // Upload data to database
  const handleConfirmUpload = async () => {
    setUploading(true);
    setUploadError('');
    
    try {
      const results = {
        success: 0,
        updated: 0,
        failed: 0,
        errors: []
      };

      for (const record of parsedData) {
        try {
          // Check if user exists
          const existingUser = await checkUserExists(record.Email);
          
          if (existingUser) {
            // User exists - update only changed fields
            const updateData = {};
            let hasChanges = false;

            // Get existing data - Strapi returns data directly in the object
            const existingData = existingUser;

            // Compare each field and only include if different
            Object.keys(record).forEach(key => {
              // Skip Password and UserName for existing users
              if (key === 'Password' || key === 'UserName') return;
              
              if (record[key] !== undefined && record[key] !== null && record[key] !== '') {
                // Handle null/undefined in existing data
                const existingValue = existingData[key];
                
                if (existingValue !== record[key]) {
                  updateData[key] = record[key];
                  hasChanges = true;
                }
              }
            });

            if (hasChanges) {
              // Use documentId for Strapi updates
              const documentId = existingUser.documentId;
              
              if (!documentId) {
                results.failed++;
                results.errors.push(`${record.Email}: No documentId found for existing user`);
                continue;
              }

              const response = await fetch(`https://api.do360.com/api/rhp-memberships/${documentId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: updateData })
              });

              if (!response.ok) {
                const errorData = await response.json();
                results.failed++;
                results.errors.push(`${record.Email}: ${errorData.error?.message || 'Update failed'}`);
              } else {
                results.updated++;
              }
            } else {
              results.success++; // No changes needed
            }
          } else {
            // User doesn't exist - create new
            const response = await fetch('https://api.do360.com/api/rhp-memberships', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ data: record })
            });

            if (!response.ok) {
              const errorData = await response.json();
              results.failed++;
              results.errors.push(`${record.Email}: ${errorData.error?.message || 'Upload failed'}`);
            } else {
              results.success++;
            }
          }
        } catch (err) {
          results.failed++;
          results.errors.push(`${record.Email}: ${err.message}`);
        }
      }

      // Show results
      if (results.failed === 0) {
        let message = `Successfully processed ${parsedData.length} records!\n`;
        if (results.success > 0) message += `✓ ${results.success} created\n`;
        if (results.updated > 0) message += `✓ ${results.updated} updated`;
        alert(message);
        handleCloseAll();
        onImportSuccess();
      } else {
        const message = `Upload completed:\n✓ ${results.success} created\n✓ ${results.updated} updated\n✗ ${results.failed} failed\n\nErrors:\n${results.errors.join('\n')}`;
        alert(message);
        if (results.success > 0 || results.updated > 0) {
          onImportSuccess();
        }
      }
    } catch (err) {
      setUploadError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCloseAll = () => {
    setShowPreviewModal(false);
    setParsedData([]);
    setUploadError('');
    onClose();
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setParsedData([]);
  };

  if (!isOpen && !showPreviewModal) return null;

  return (
    <>
      {/* Upload Modal */}
      {isOpen && !showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Import Excel File</h2>
              <button
                onClick={handleCloseAll}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Please upload a CSV file (Excel saved as CSV) with the following columns:
              </p>
              <ul className="text-sm text-gray-700 space-y-1 mb-4 bg-gray-50 p-3 rounded">
                <li>• <strong>Required columns:</strong></li>
                <li className="ml-4">• <strong>Site Number</strong></li>
                <li className="ml-4">• <strong>Name 1</strong></li>
                <li className="ml-4">• <strong>Name 2</strong></li>
                <li className="ml-4">• <strong>Address</strong></li>
                <li className="ml-4">• <strong>Phone 1</strong></li>
                <li className="ml-4">• <strong>Phone 2</strong></li>
                <li className="ml-4">• <strong>Email 1</strong> (required - used to check for existing users)</li>
                <li className="ml-4">• <strong>Email 2</strong></li>
                <li className="mt-2">• <strong>Optional columns:</strong></li>
                <li className="ml-4">• <strong>Start date</strong> (date format)</li>
                <li className="ml-4">• <strong>End date</strong> (date format)</li>
                <li className="ml-4">• <strong>CR</strong> (number)</li>
                <li className="ml-4">• <strong>Note</strong> (text)</li>
                <li className="ml-4">• <strong>Powered or not</strong> (Powered/Unpowered)</li>
              </ul>
              <p className="text-xs text-gray-500 italic">
                Note: If Email 1 already exists, the record will be updated with any changed information. New users will have a password generated automatically.
              </p>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {uploadError}
              </div>
            )}

            <div className="mb-4">
              <label className="block w-full">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100
                    cursor-pointer"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseAll}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Preview Import Data</h2>
              <button
                onClick={handleClosePreview}
                className="text-gray-500 hover:text-gray-700"
                disabled={uploading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Review the data below before uploading to the database. <strong>{parsedData.length}</strong> records will be imported.
              Existing users (matched by Email 1) will be updated, new users will be created.
            </p>

            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {uploadError}
              </div>
            )}

            <div className="overflow-x-auto mb-4 max-h-96 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold">#</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Site Number</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">First Name</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Last Name</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Phone</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">First Name 2</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Last Name 2</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Email 2</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Phone 2</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Address</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Start Date</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">End Date</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">CR</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Power</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parsedData.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs">{index + 1}</td>
                      <td className="px-3 py-2 text-xs">{record.SiteNumber || '-'}</td>
                      <td className="px-3 py-2 text-xs">{record.FirstName || '-'}</td>
                      <td className="px-3 py-2 text-xs">{record.LastName || '-'}</td>
                      <td className="px-3 py-2 text-xs">{record.Email}</td>
                      <td className="px-3 py-2 text-xs">{record.Contact || '-'}</td>
                      <td className="px-3 py-2 text-xs">{record.FirstName2 || '-'}</td>
                      <td className="px-3 py-2 text-xs">{record.LastName2 || '-'}</td>
                      <td className="px-3 py-2 text-xs">{record.Email2 || '-'}</td>
                      <td className="px-3 py-2 text-xs">{record.Contact2 || '-'}</td>
                      <td className="px-3 py-2 text-xs">{record.Address || '-'}</td>
                      <td className="px-3 py-2 text-xs">{record.StartDate || '-'}</td>
                      <td className="px-3 py-2 text-xs">{record.EndDate || '-'}</td>
                      <td className="px-3 py-2 text-xs">{record.CR || '-'}</td>
                      <td className="px-3 py-2 text-xs">{record.Power || '-'}</td>
                      <td className="px-3 py-2 text-xs max-w-xs truncate" title={record.Note}>{record.Note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleClosePreview}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition duration-200"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpload}
                disabled={uploading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {uploading ? 'Processing...' : 'Confirm & Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}