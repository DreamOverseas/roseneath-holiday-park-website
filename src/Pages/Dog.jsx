import React, { useState, useEffect } from 'react';

export default function Dog() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  const CORRECT_PASSWORD = 'Dreamoverseas171!';

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

  const getTenantTypeLabel = (type) => {
    const labels = {
      'Guest': 'Guest',
      'Annual': 'Annual',
      'Permanent': 'Permanent'
    };
    return labels[type] || type;
  };

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
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition duration-200"
            >
              Logout
            </button>
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

        {!loading && !dataError && memberships.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
            No memberships found.
          </div>
        )}

        {!loading && !dataError && memberships.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">First Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Last Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Phone Number</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Tenant Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {memberships.map((member, index) => (
                    <tr key={member.MembershipNumber || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{member.FirstName || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{member.LastName || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{member.Email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{member.Contact || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          member.TenantType === 'Permanent' ? 'bg-green-100 text-green-800' :
                          member.TenantType === 'Annual' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getTenantTypeLabel(member.TenantType) || 'Guest'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Total Memberships: <span className="font-semibold">{memberships.length}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

