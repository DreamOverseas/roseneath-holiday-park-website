import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const BookingList = () => {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [showColumnSelector, setShowColumnSelector] = useState(false);

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
    const tableContainerRef = useRef(null);

    const CMSEndpoint = import.meta.env.VITE_CMS_ENDPOINT;
    const CMSApiKey = import.meta.env.VITE_CMS_TOKEN;

    // Column visibility state
    const [visibleColumns, setVisibleColumns] = useState({
        siteNumber: { label: 'Site Number', visible: true },
        checkin: { label: 'Check-in', visible: true },
        checkout: { label: 'Check-out', visible: true },
        nights: { label: 'Nights', visible: true },
        adultNumber: { label: 'Adults', visible: true },
        childNumber: { label: 'Children', visible: true },
        totalGuests: { label: 'Total Guests', visible: false },
        totalPrice: { label: 'Total Price', visible: true },
        extras: { label: 'Extras', visible: false },
        createdAt: { label: 'Booked Date', visible: false },
    });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        setError('');
        
        try {
            let allBookings = [];
            let page = 1;
            let totalPages = 1;
            
            do {
                const response = await fetch(
                    `${CMSEndpoint}/api/annual-bookings?populate=*&sort=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=100`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${CMSApiKey}`
                        }
                    }
                );

                if (response.ok) {
                    const result = await response.json();
                    if (result.data && Array.isArray(result.data)) {
                        allBookings = [...allBookings, ...result.data];
                    }
                    
                    if (result.meta && result.meta.pagination) {
                        totalPages = result.meta.pagination.pageCount || 1;
                        console.log(`Loaded page ${page} of ${totalPages} (${result.data.length} bookings)`);
                    }
                    
                    page++;
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || 'Unknown error');
                }
            } while (page <= totalPages);
            
            setBookings(allBookings);
            console.log(`Total loaded: ${allBookings.length} bookings`);
            
        } catch (err) {
            setError(`Failed to fetch bookings: ${err.message}`);
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-AU', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const calculateNights = (checkin, checkout) => {
        const start = new Date(checkin);
        const end = new Date(checkout);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedBookings = (bookings) => {
        if (!sortConfig.key) return bookings;

        return [...bookings].sort((a, b) => {
            const aAttrs = a.attributes || a;
            const bAttrs = b.attributes || b;
            
            let aValue, bValue;

            switch (sortConfig.key) {
                case 'nights':
                    aValue = calculateNights(aAttrs.checkin, aAttrs.checkout);
                    bValue = calculateNights(bAttrs.checkin, bAttrs.checkout);
                    break;
                case 'totalGuests':
                    aValue = (aAttrs.adultNumber || 0) + (aAttrs.childNumber || 0);
                    bValue = (bAttrs.adultNumber || 0) + (bAttrs.childNumber || 0);
                    break;
                case 'siteNumber':
                    const aStr = String(aAttrs.siteNumber || '');
                    const bStr = String(bAttrs.siteNumber || '');
                    const aMatch = aStr.match(/^(\d+)(.*)$/);
                    const bMatch = bStr.match(/^(\d+)(.*)$/);
                    
                    if (aMatch && bMatch) {
                        const aNum = parseInt(aMatch[1]);
                        const bNum = parseInt(bMatch[1]);
                        if (aNum !== bNum) {
                            return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
                        }
                        aValue = aMatch[2].toLowerCase();
                        bValue = bMatch[2].toLowerCase();
                    } else {
                        aValue = aStr.toLowerCase();
                        bValue = bStr.toLowerCase();
                    }
                    break;
                default:
                    aValue = aAttrs[sortConfig.key] || '';
                    bValue = bAttrs[sortConfig.key] || '';
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
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
            [columnKey]: {
                ...prev[columnKey],
                visible: !prev[columnKey].visible
            }
        }));
    };

    const getVisibleColumnsArray = () => {
        return Object.entries(visibleColumns)
            .filter(([_, config]) => config.visible)
            .map(([key, config]) => ({ key, label: config.label }));
    };

    const renderCellContent = (booking, columnKey) => {
        const attrs = booking.attributes || booking;
        
        switch(columnKey) {
            case 'siteNumber':
                return attrs.siteNumber || '-';
            case 'checkin':
                return formatDate(attrs.checkin);
            case 'checkout':
                return formatDate(attrs.checkout);
            case 'nights':
                const nights = calculateNights(attrs.checkin, attrs.checkout);
                return (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {nights} {nights === 1 ? 'night' : 'nights'}
                    </span>
                );
            case 'adultNumber':
                return attrs.adultNumber || 0;
            case 'childNumber':
                return attrs.childNumber || 0;
            case 'totalGuests':
                return (attrs.adultNumber || 0) + (attrs.childNumber || 0);
            case 'totalPrice':
                return (
                    <span className="font-semibold text-green-600">
                        ${attrs.totalPrice?.toFixed(2) || '0.00'}
                    </span>
                );
            case 'extras':
                return attrs.extra && attrs.extra.length > 0 ? (
                    <span className="inline-block px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs">
                        {attrs.extra.length} item(s)
                    </span>
                ) : '-';
            case 'createdAt':
                return formatDate(attrs.createdAt);
            default:
                return attrs[columnKey] || '-';
        }
    };

    // Drag handlers
    const handleMouseDown = (e) => {
        if (!tableContainerRef.current) return;
        setIsDragging(true);
        setDragStart({
            x: e.clientX,
            y: e.clientY
        });
        setScrollStart({
            x: tableContainerRef.current.scrollLeft,
            y: tableContainerRef.current.scrollTop
        });
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !tableContainerRef.current) return;
        
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        tableContainerRef.current.scrollLeft = scrollStart.x - deltaX;
        tableContainerRef.current.scrollTop = scrollStart.y - deltaY;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleRowClick = (booking, e) => {
        const deltaX = Math.abs(e.clientX - dragStart.x);
        const deltaY = Math.abs(e.clientY - dragStart.y);
        
        if (deltaX < 5 && deltaY < 5) {
            setSelectedBooking(booking);
            setShowDetailModal(true);
        }
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

    const sortedBookings = getSortedBookings(bookings);

    return (
        <div className="max-w-7xl mx-auto mt-6">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Annual Bookings</h2>
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
                            onClick={fetchBookings}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition duration-200 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="hidden sm:inline">Refresh</span>
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

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading bookings...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 sm:mb-6 text-sm sm:text-base flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && sortedBookings.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600 text-sm sm:text-base">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
                    <p className="text-gray-500">Get started by creating a new booking.</p>
                </div>
            )}

            {/* Table */}
            {!loading && !error && sortedBookings.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div 
                        ref={tableContainerRef}
                        className={`overflow-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        style={{ maxHeight: '70vh' }}
                    >
                        <table className="w-full" style={{ userSelect: isDragging ? 'none' : 'auto' }}>
                            <thead className="bg-indigo-600 text-white sticky top-0 z-10">
                                <tr>
                                    {getVisibleColumnsArray().map(({ key, label }) => (
                                        <th 
                                            key={key}
                                            className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-indigo-700 transition-colors whitespace-nowrap"
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
                                {sortedBookings.map((booking, index) => (
                                    <tr 
                                        key={booking.id || index} 
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={(e) => handleRowClick(booking, e)}
                                    >
                                        {getVisibleColumnsArray().map(({ key }) => (
                                            <td key={key} className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                {renderCellContent(booking, key)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
                        <p className="text-xs sm:text-sm text-gray-600">
                            Showing <span className="font-semibold">{sortedBookings.length}</span> booking{sortedBookings.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedBooking && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowDetailModal(false)}>
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex justify-between items-center pb-3 border-b">
                            <h3 className="text-xl font-semibold text-gray-900">Booking Details</h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="mt-4">
                            {(() => {
                                const attrs = selectedBooking.attributes || selectedBooking;
                                const nights = calculateNights(attrs.checkin, attrs.checkout);
                                
                                return (
                                    <>
                                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                            <h4 className="font-semibold text-gray-800 mb-2">Booking Information</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-sm text-gray-600">Site Number</p>
                                                    <p className="font-medium text-gray-900">{attrs.siteNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Duration</p>
                                                    <p className="font-medium text-gray-900">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Check-in</p>
                                                    <p className="font-medium text-gray-900">{formatDate(attrs.checkin)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Check-out</p>
                                                    <p className="font-medium text-gray-900">{formatDate(attrs.checkout)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-green-50 rounded-lg p-4 mb-4">
                                            <h4 className="font-semibold text-gray-800 mb-2">Guest Information</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-sm text-gray-600">Adults</p>
                                                    <p className="font-medium text-gray-900">{attrs.adultNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Children</p>
                                                    <p className="font-medium text-gray-900">{attrs.childNumber}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {attrs.extra && attrs.extra.length > 0 && (
                                            <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                                                <h4 className="font-semibold text-gray-800 mb-2">Extra Items</h4>
                                                <div className="space-y-2">
                                                    {attrs.extra.map((item, index) => (
                                                        <div key={index} className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-700">
                                                                {item.Name} x {item.Number}
                                                            </span>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                ${item.Price?.toFixed(2) || '0.00'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-semibold text-gray-800">Total Price</span>
                                                <span className="text-2xl font-bold text-green-600">
                                                    ${attrs.totalPrice?.toFixed(2) || '0.00'}
                                                </span>
                                            </div>
                                        </div>

                                        {attrs.createdAt && (
                                            <div className="mt-4 text-xs text-gray-500 text-center">
                                                Booked on {formatDate(attrs.createdAt)}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end mt-6 pt-4 border-t">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingList;