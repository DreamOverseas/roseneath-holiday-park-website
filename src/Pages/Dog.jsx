import React, { useState, useEffect } from 'react';

export default function Dog() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [filterType, setFilterType] = useState('All User');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [parsedData, setParsedData] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  const CORRECT_PASSWORD = 'Dreamoverseas171!';
  const ADMIN_EMAILS = ['john.du@do360.com', 'hannyanhai@gmail.com', 'xing142857@gmail.com'];

  const handlePasswordSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMemberships();
    }
  }, [isAuthenticated]);

  const fetchMemberships = async () => {
    setLoading(true);
    setDataError('');
    try {
      const response = await fetch('https://api.do360.com/api/rhp-memberships');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMemberships(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setDataError(`Failed to load memberships: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayTenantType = (member) => {
    if (ADMIN_EMAILS.includes(member.Email?.toLowerCase())) {
      return 'Admin';
    }
    return member.TenantType || 'Guest';
  };

  const getTenantTypeLabel = (type) => {
    const labels = {
      'Guest': 'Guest',
      'Annual': 'Annual',
      'Permanent': 'Permanent',
      'Admin': 'Admin'
    };
    return labels[type] || type;
  };

  const getFilteredMemberships = () => {
    if (filterType === 'All User') {
      return memberships;
    }
    
    if (filterType === 'Tenant') {
      return memberships.filter(member => {
        const displayType = getDisplayTenantType(member);
        return displayType === 'Annual' || displayType === 'Permanent';
      });
    }
    
    if (filterType === 'Admin') {
      return memberships.filter(member => 
        ADMIN_EMAILS.includes(member.Email?.toLowerCase())
      );
    }
    
    return memberships.filter(member => getDisplayTenantType(member) === filterType);
  };

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

  // Parse CSV content
  const parseCSV = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length < 2) {
      throw new Error('File must contain at least a header row and one data row');
    }

    const headers = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Check for required headers
    const requiredHeaders = ['Site Number', 'Name 1', 'Name 2', 'Address', 'Phone 1', 'Phone 2', 'Email 1', 'Email 2'];
    const headerMap = {};
    
    requiredHeaders.forEach(reqHeader => {
      const index = headers.findIndex(h => h.toLowerCase() === reqHeader.toLowerCase());
      if (index === -1) {
        throw new Error(`Missing required column: ${reqHeader}`);
      }
      headerMap[reqHeader] = index;
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

        records.push({
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
        });
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
        setShowUploadModal(false);
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

  // Upload data to database
  const handleConfirmUpload = async () => {
    setUploading(true);
    setUploadError('');
    
    try {
      const results = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const record of parsedData) {
        try {
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
        } catch (err) {
          results.failed++;
          results.errors.push(`${record.Email}: ${err.message}`);
        }
      }

      // Show results
      if (results.failed === 0) {
        alert(`Successfully uploaded ${results.success} records!`);
        setShowPreviewModal(false);
        setParsedData([]);
        fetchMemberships(); // Refresh the list
      } else {
        const message = `Upload completed:\n✓ ${results.success} successful\n✗ ${results.failed} failed\n\nErrors:\n${results.errors.join('\n')}`;
        alert(message);
        if (results.success > 0) {
          fetchMemberships(); // Refresh the list
        }
      }
    } catch (err) {
      setUploadError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const filteredMemberships = getFilteredMemberships();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">RHP Admin Portal</h1>
            <p className="text-gray-600">Enter password to access membership data</p>
          </div>
          
          <div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Enter password"
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              onClick={handlePasswordSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Access Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">RHP Memberships</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200 font-medium"
              >
                Import Excel
              </button>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Member Type</label>
          <div className="flex flex-wrap gap-2">
            {['All User', 'Tenant', 'Annual', 'Permanent', 'Admin'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                  filterType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading memberships...</p>
          </div>
        )}

        {dataError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {dataError}
          </div>
        )}

        {!loading && !dataError && filteredMemberships.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
            No memberships found for the selected filter.
          </div>
        )}

        {!loading && !dataError && filteredMemberships.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Site Number</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">First Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Last Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Phone Number</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Member Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMemberships.map((member, index) => {
                    const displayType = getDisplayTenantType(member);
                    return (
                      <tr key={member.documentID || member.MembershipNumber || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{member.SiteNumber || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{member.FirstName || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{member.LastName || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{member.Email || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{member.Contact || '-'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            displayType === 'Admin' ? 'bg-purple-100 text-purple-800' :
                            displayType === 'Permanent' ? 'bg-green-100 text-green-800' :
                            displayType === 'Annual' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getTenantTypeLabel(displayType)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredMemberships.length}</span> of <span className="font-semibold">{memberships.length}</span> memberships
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Import Excel File</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadError('');
                }}
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
                <li>• <strong>Site Number</strong></li>
                <li>• <strong>Name 1</strong></li>
                <li>• <strong>Name 2</strong></li>
                <li>• <strong>Address</strong></li>
                <li>• <strong>Phone 1</strong></li>
                <li>• <strong>Phone 2</strong></li>
                <li>• <strong>Email 1</strong> (required - records without email will be skipped)</li>
                <li>• <strong>Email 2</strong></li>
              </ul>
              <p className="text-xs text-gray-500 italic">
                Note: Save your Excel file as CSV format before uploading.
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
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadError('');
                }}
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
                onClick={() => {
                  setShowPreviewModal(false);
                  setParsedData([]);
                }}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setParsedData([]);
                }}
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
                {uploading ? 'Uploading...' : 'Confirm & Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}