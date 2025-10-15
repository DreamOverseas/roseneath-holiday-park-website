import React, { useState, useEffect } from 'react';
import ImportExcelModal from '../Components/Admin/ImportExcelModal';

export default function Dog() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [filterType, setFilterType] = useState('All User');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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
      let allMemberships = [];
      let page = 1;
      let totalPages = 1;
      
      do {
        const response = await fetch(`https://api.do360.com/api/rhp-memberships?pagination[page]=${page}&pagination[pageSize]=100`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
          allMemberships = [...allMemberships, ...data.data];
        }
        
        if (data.meta && data.meta.pagination) {
          totalPages = data.meta.pagination.pageCount || data.meta.pagination.totalPages || 1;
          console.log(`Loaded page ${page} of ${totalPages} (${data.data.length} records)`);
        }
        
        page++;
      } while (page <= totalPages);
      
      setMemberships(allMemberships);
      console.log(`Total loaded: ${allMemberships.length} memberships`);
      
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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedMemberships = (memberships) => {
    if (!sortConfig.key) return memberships;

    return [...memberships].sort((a, b) => {
      let aValue = a[sortConfig.key] || '';
      let bValue = b[sortConfig.key] || '';

      if (sortConfig.key === 'SiteNumber') {
        const aStr = String(aValue);
        const bStr = String(bValue);
        
        const aMatch = aStr.match(/^(\d+)(.*)$/);
        const bMatch = bStr.match(/^(\d+)(.*)$/);
        
        if (aMatch && bMatch) {
          const aNum = parseInt(aMatch[1]);
          const bNum = parseInt(bMatch[1]);
          
          if (aNum !== bNum) {
            return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
          }
          
          const aSuffix = aMatch[2].toLowerCase();
          const bSuffix = bMatch[2].toLowerCase();
          
          if (aSuffix < bSuffix) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aSuffix > bSuffix) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
        
        if (aStr < bStr) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aStr > bStr) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }

      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (sortConfig.direction === 'asc') {
      return (
        <svg className="w-4 h-4 ml-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 ml-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const filteredMemberships = getSortedMemberships(getFilteredMemberships());

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
                    <th 
                      className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
                      onClick={() => handleSort('SiteNumber')}
                    >
                      <div className="flex items-center">
                        Site Number
                        <SortIcon columnKey="SiteNumber" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
                      onClick={() => handleSort('FirstName')}
                    >
                      <div className="flex items-center">
                        First Name
                        <SortIcon columnKey="FirstName" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
                      onClick={() => handleSort('LastName')}
                    >
                      <div className="flex items-center">
                        Last Name
                        <SortIcon columnKey="LastName" />
                      </div>
                    </th>
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
                        <td className="px-6 py-4 text-sm text-gray-900">{
                          member.FirstName || '-'}</td>
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

      {/* Import Excel Modal */}
      <ImportExcelModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImportSuccess={fetchMemberships}
      />
    </div>
  );
}