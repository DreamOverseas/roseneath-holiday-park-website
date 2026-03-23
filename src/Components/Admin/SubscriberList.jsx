import React, { useState, useEffect, useRef } from 'react';

export default function SubscriberList() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
  const tableContainerRef = useRef(null);

  const [visibleColumns, setVisibleColumns] = useState({
    email: { label: 'Email', visible: true },
    subscriptionDate: { label: 'Subscription Date', visible: true },
    status: { label: 'Status', visible: true },
  });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://mail-service.do360.com/roseneathpark/subscribers');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.subscribers && Array.isArray(data.subscribers)) {
        // Add a unique ID to each subscriber
        const processedSubscribers = data.subscribers.map((subscriber, index) => ({
          ...subscriber,
          _id: subscriber.id || `subscriber-${index}`,
        }));
        setSubscribers(processedSubscribers);
      }
    } catch (err) {
      setError(`Failed to load subscribers: ${err.message}`);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSubscribers = () => {
    if (searchQuery.trim() === '') return subscribers;

    const q = searchQuery.toLowerCase();
    return subscribers.filter(subscriber => {
      return (
        (subscriber.email || '').toLowerCase().includes(q) ||
        (subscriber.subscriptionDate || '').toLowerCase().includes(q) ||
        (subscriber.status || '').toLowerCase().includes(q)
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

  const getSortedSubscribers = (list) => {
    if (!sortConfig.key) return list;

    return [...list].sort((a, b) => {
      let aValue = a[sortConfig.key] || '';
      let bValue = b[sortConfig.key] || '';

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

  const renderCellContent = (subscriber, columnKey) => {
    switch (columnKey) {
      case 'subscriptionDate':
        return subscriber[columnKey] ? new Date(subscriber[columnKey]).toLocaleDateString() : '-';
      case 'status':
        const status = subscriber[columnKey] || 'Active';
        return (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            status === 'Active' ? 'bg-green-100 text-green-800' :
            status === 'Unsubscribed' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {status}
          </span>
        );
      default:
        return subscriber[columnKey] || '-';
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

  const handleDownloadCSV = () => {
    const allSubscribers = subscribers;
    if (allSubscribers.length === 0) {
      alert('No data to export');
      return;
    }

    const columns = Object.entries(visibleColumns).map(([key, config]) => ({
      key,
      label: config.label
    }));

    const csvRows = [];
    csvRows.push(columns.map(col => `"${col.label}"`).join(','));

    allSubscribers.forEach(subscriber => {
      const row = columns.map(col => {
        let val = '';
        if (col.key === 'subscriptionDate') {
          val = subscriber[col.key] ? new Date(subscriber[col.key]).toLocaleDateString() : '-';
        } else {
          val = subscriber[col.key] || '';
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    });

    const csvContent = "\uFEFF" + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const dateStr = now.toLocaleDateString().replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString().replace(/:/g, '-').replace(/\s/g, '');
    const fileName = `Subscribers_${dateStr}_${timeStr}.csv`;

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

  const filteredSubscribers = getSortedSubscribers(getFilteredSubscribers());

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Email Subscribers</h2>
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

          <button
            onClick={handleDownloadCSV}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border border-indigo-200 rounded-lg transition duration-200 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
            title="Download all subscribers as CSV"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>

          <button
            onClick={fetchSubscribers}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200 font-medium text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">Refresh</span>
          </button>
        </div>
      </div>

      {/* Column Selector */}
      {showColumnSelector && (
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Select Columns to Display</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {Object.entries(visibleColumns).map(([key, config]) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded">
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

      {/* Search */}
      <div className="mb-6">
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
            placeholder="Search by email, date, or status..."
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

      {/* Loading */}
      {loading && (
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading subscribers...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 sm:mb-6 text-sm sm:text-base">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredSubscribers.length === 0 && (
        <div className="text-center p-8 text-gray-600 text-sm sm:text-base">
          {searchQuery
            ? `No results found for "${searchQuery}".`
            : 'No subscribers found.'}
        </div>
      )}

      {/* Table */}
      {!loading && !error && filteredSubscribers.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200">
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
                {filteredSubscribers.map((subscriber, index) => (
                  <tr
                    key={subscriber._id || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {getVisibleColumnsArray().map(({ key }) => (
                      <td key={key} className="px-6 py-4 text-sm text-gray-900">
                        {renderCellContent(subscriber, key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredSubscribers.length}</span> of{' '}
              <span className="font-semibold">{subscribers.length}</span> subscribers
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
  );
}
