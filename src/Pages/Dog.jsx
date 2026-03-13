import React, { useState, useEffect, useRef } from 'react';
import ImportExcelModal from '../Components/Admin/ImportExcelModal';
import MemberDetailModal from '../Components/Admin/MemberDetailModal';
import BookingList from '../Components/Admin/BookingList';
import BusinessFunnel from '../Components/Admin/BusinessFunnel';
import ReservationTable from '../Components/Admin/ReservationTable';
import AnalysisGraph from '../Components/Admin/AnalysisGraph';
import PlatformManager from '../Components/Admin/PlatformManager';

export default function Dog() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [memberships, setMemberships] = useState([]);
  const [guestMembers, setGuestMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [filterType, setFilterType] = useState('All User');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
  const tableContainerRef = useRef(null);

  const [visibleColumns, setVisibleColumns] = useState({
    SiteNumber: { label: 'Site Number', visible: true },
    FirstName: { label: 'First Name', visible: true },
    LastName: { label: 'Last Name', visible: true },
    Email: { label: 'Email', visible: true },
    ContactString: { label: 'Phone Number', visible: true },
    TenantType: { label: 'Member Type', visible: true },
    FirstName2: { label: 'First Name 2', visible: false },
    LastName2: { label: 'Last Name 2', visible: false },
    Email2: { label: 'Email 2', visible: false },
    ContactString2: { label: 'Phone 2', visible: false },
    Address: { label: 'Address', visible: false },
    UserName: { label: 'Username', visible: false },
    StartDate: { label: 'Start Date', visible: false },
    EndDate: { label: 'End Date', visible: false },
    CR: { label: 'CR', visible: false },
    Power: { label: 'Power', visible: false },
    Note: { label: 'Note', visible: false },
    Point: { label: 'Points', visible: false },
    DiscountPoint: { label: 'Discount Points', visible: false },
  });

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
      fetchGuestCSV();
    }
  }, [isAuthenticated]);

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map((line, idx) => {
      // Handle quoted fields
      const values = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += line[i];
        }
      }
      values.push(current.trim());

      const row = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });

      return {
        _id: `guest-csv-${idx}`,
        _isGuestCSV: true,
        FirstName: row['First Name'] || '',
        LastName: row['Last Name'] || '',
        Email: row['Email'] || '',
        ContactString: row['Phone Number'] || '',
        TenantType: 'Guest',
      };
    });
  };

  const fetchGuestCSV = async () => {
    try {
      const response = await fetch('/guest.csv');
      if (!response.ok) throw new Error('Could not load guest.csv');
      const text = await response.text();
      const guests = parseCSV(text);
      setGuestMembers(guests);
    } catch (err) {
      console.warn('Guest CSV load failed:', err.message);
    }
  };

  const fetchMemberships = async () => {
    setLoading(true);
    setDataError('');
    try {
      let allMemberships = [];
      let page = 1;
      let totalPages = 1;

      do {
        const response = await fetch(
          `https://api.do360.com/api/rhp-memberships?pagination[page]=${page}&pagination[pageSize]=100&populate=MemberFiles`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        if (data.data && Array.isArray(data.data)) {
          allMemberships = [...allMemberships, ...data.data];
        }

        if (data.meta && data.meta.pagination) {
          totalPages = data.meta.pagination.pageCount || data.meta.pagination.totalPages || 1;
        }

        page++;
      } while (page <= totalPages);

      setMemberships(allMemberships);
    } catch (err) {
      setDataError(`Failed to load memberships: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayTenantType = (member) => {
    if (member._isGuestCSV) return 'Guest';
    if (ADMIN_EMAILS.includes(member.Email?.toLowerCase())) return 'Admin';
    return member.TenantType || 'Guest';
  };

  const getTenantTypeLabel = (type) => {
    const labels = { Guest: 'Guest', Annual: 'Annual', Permanent: 'Permanent', Admin: 'Admin' };
    return labels[type] || type;
  };

  const getAllMembers = () => [...memberships, ...guestMembers];

  const getFilteredMemberships = () => {
    const all = getAllMembers();

    let filtered;
    if (filterType === 'All User') {
      filtered = all;
    } else if (filterType === 'Tenant') {
      filtered = all.filter(m => {
        const t = getDisplayTenantType(m);
        return t === 'Annual' || t === 'Permanent';
      });
    } else if (filterType === 'Guest') {
      filtered = all.filter(m => getDisplayTenantType(m) === 'Guest');
    } else if (filterType === 'Admin') {
      filtered = all.filter(m => ADMIN_EMAILS.includes(m.Email?.toLowerCase()));
    } else {
      filtered = all.filter(m => getDisplayTenantType(m) === filterType);
    }

    if (searchQuery.trim() === '') return filtered;

    const q = searchQuery.toLowerCase();
    return filtered.filter(m => {
      return (
        (m.FirstName || '').toLowerCase().includes(q) ||
        (m.LastName || '').toLowerCase().includes(q) ||
        (m.Email || '').toLowerCase().includes(q) ||
        (m.Contact || '').toLowerCase().includes(q) ||
        (m.SiteNumber != null && String(m.SiteNumber).toLowerCase().includes(q)) ||
        (m.UserName || '').toLowerCase().includes(q) ||
        (m.Address || '').toLowerCase().includes(q)
      );
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedMemberships = (list) => {
    if (!sortConfig.key) return list;

    return [...list].sort((a, b) => {
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
          if (aNum !== bNum) return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
          const aSuffix = aMatch[2].toLowerCase();
          const bSuffix = bMatch[2].toLowerCase();
          if (aSuffix < bSuffix) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aSuffix > bSuffix) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }

        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }

      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: { ...prev[columnKey], visible: !prev[columnKey].visible },
    }));
  };

  const getVisibleColumnsArray = () => {
    return Object.entries(visibleColumns)
      .filter(([_, config]) => config.visible)
      .map(([key, config]) => ({ key, label: config.label }));
  };

  const renderCellContent = (member, columnKey) => {
    const displayType = getDisplayTenantType(member);

    switch (columnKey) {
      case 'TenantType':
        return (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            displayType === 'Admin' ? 'bg-purple-100 text-purple-800' :
            displayType === 'Permanent' ? 'bg-green-100 text-green-800' :
            displayType === 'Annual' ? 'bg-blue-100 text-blue-800' :
            displayType === 'Guest' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {getTenantTypeLabel(displayType)}
          </span>
        );
      case 'StartDate':
      case 'EndDate':
        return member[columnKey] ? new Date(member[columnKey]).toLocaleDateString() : '-';
      case 'Power':
        return member[columnKey] || '-';
      case 'Note':
        return (
          <span className="max-w-xs truncate inline-block" title={member[columnKey]}>
            {member[columnKey] || '-'}
          </span>
        );
      default:
        return member[columnKey] || '-';
    }
  };

  const handleMouseDown = (e) => {
    if (!tableContainerRef.current) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setScrollStart({
      x: tableContainerRef.current.scrollLeft,
      y: tableContainerRef.current.scrollTop,
    });
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !tableContainerRef.current) return;
    tableContainerRef.current.scrollLeft = scrollStart.x - (e.clientX - dragStart.x);
    tableContainerRef.current.scrollTop = scrollStart.y - (e.clientY - dragStart.y);
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleRowClick = (member, e) => {
    const deltaX = Math.abs(e.clientX - dragStart.x);
    const deltaY = Math.abs(e.clientY - dragStart.y);
    if (deltaX < 5 && deltaY < 5) {
      setSelectedMember(member);
      setShowDetailModal(true);
    }
  };

  const handleMemberUpdate = () => fetchMemberships();

  // 新增：CSV 导出功能
  const handleDownloadCSV = () => {
    const allMembers = getAllMembers();
    if (allMembers.length === 0) {
      alert('没有可供导出的数据');
      return;
    }

    // 定义 CSV 的列（导出所有在 visibleColumns 中定义的字段）
    const columns = Object.entries(visibleColumns).map(([key, config]) => ({
      key,
      label: config.label
    }));

    const csvRows = [];
    // 写入表头
    csvRows.push(columns.map(col => `"${col.label}"`).join(','));

    // 写入数据行
    allMembers.forEach(member => {
      const row = columns.map(col => {
        let val = '';
        if (col.key === 'TenantType') {
          val = getDisplayTenantType(member);
        } else if (col.key === 'StartDate' || col.key === 'EndDate') {
          val = member[col.key] ? new Date(member[col.key]).toLocaleDateString() : '-';
        } else {
          val = member[col.key] || '';
        }
        // 转义双引号并处理换行
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    });

    // 组合 CSV 内容并添加 BOM 确保 Excel 正确识别 UTF-8（中文不乱码）
    const csvContent = "\uFEFF" + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 生成文件名：RHP用户数据 + 当前日期时间
    const now = new Date();
    const dateStr = now.toLocaleDateString().replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString().replace(/:/g, '-').replace(/\s/g, '');
    const fileName = `RHP用户数据_${dateStr}_${timeStr}.csv`;

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, scrollStart]);

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
  const totalAll = getAllMembers().length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">RHP Admin Portal</h1>
            <p className="text-sm sm:text-base text-gray-600">Enter password to access membership data</p>
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

    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      
      
      <PlatformManager/>

      
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">RHP Memberships</h1>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <span className="hidden sm:inline">Columns</span>
              </button>
              
              {/* 新增：导出 CSV 按钮 */}
              <button
                onClick={handleDownloadCSV}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border border-indigo-200 rounded-lg transition duration-200 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                title="Download all memberships as CSV"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200 font-medium text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Import Excel</span>
                <span className="sm:hidden">Import</span>
              </button>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition duration-200 text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Column Selector */}
        {showColumnSelector && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Select Columns to Display</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {Object.entries(visibleColumns).map(([key, config]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={config.visible}
                    onChange={() => toggleColumnVisibility(key)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{config.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Filter + Search */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Member Type</label>
            <div className="flex flex-wrap gap-2">
              {['All User', 'Tenant', 'Permanent', 'Annual', 'Guest', 'Admin'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition duration-200 text-sm sm:text-base ${
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone, site number..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm sm:text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading memberships...</p>
          </div>
        )}

        {/* Error */}
        {dataError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 sm:mb-6 text-sm sm:text-base">
            {dataError}
          </div>
        )}

        {/* Empty */}
        {!loading && !dataError && filteredMemberships.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600 text-sm sm:text-base">
            {searchQuery
              ? `No results found for "${searchQuery}".`
              : 'No memberships found for the selected filter.'}
          </div>
        )}

        {/* Table */}
        {!loading && !dataError && filteredMemberships.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div
              ref={tableContainerRef}
              className={`overflow-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              style={{ maxHeight: '70vh' }}
            >
              <table className="w-full" style={{ userSelect: isDragging ? 'none' : 'auto' }}>
                <thead className="bg-indigo-600 text-white sticky top-0 z-0">
                  <tr>
                    {getVisibleColumnsArray().map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
                        onClick={() => handleSort(key)}
                      >
                        <div className="flex items-center">
                          {label}
                          <SortIcon columnKey={key} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMemberships.map((member, index) => (
                    <tr
                      key={member._id || member.documentID || member.MembershipNumber || index}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={(e) => handleRowClick(member, e)}
                    >
                      {getVisibleColumnsArray().map(({ key }) => (
                        <td key={key} className="px-6 py-4 text-sm text-gray-900">
                          {renderCellContent(member, key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredMemberships.length}</span> of{' '}
                <span className="font-semibold">{totalAll}</span> members
                {searchQuery && (
                  <span className="ml-1 text-indigo-600">
                    — filtered by "<span className="font-medium">{searchQuery}</span>"
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      <ImportExcelModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImportSuccess={fetchMemberships}
      />

      <MemberDetailModal
        member={selectedMember}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedMember(null);
        }}
        onUpdateSuccess={handleMemberUpdate}
        adminEmails={ADMIN_EMAILS}
      />

      <BookingList />
      {/* <ReservationTable /> */}
      <AnalysisGraph />
      <BusinessFunnel />
    </div>
  );
}