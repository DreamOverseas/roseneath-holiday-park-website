import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AnnualBookingModal from './AnnualBookingModal';

const BookingList = () => {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [hideEmptySites, setHideEmptySites] = useState(true);
    const [isCreatingNewBooking, setIsCreatingNewBooking] = useState(false);
    const [selectedSiteForNew, setSelectedSiteForNew] = useState(null);
    
    // Timeline state
    const [startDate, setStartDate] = useState(() => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        return start;
    });
    const [dayCount, setDayCount] = useState(14);

    const CMSEndpoint = import.meta.env.VITE_CMS_ENDPOINT;
    const CMSApiKey = import.meta.env.VITE_CMS_TOKEN;

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError('');
            try {
                await Promise.all([fetchBookings(), fetchMemberships()]);
            } catch (err) {
                setError(`Failed to load data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const fetchMemberships = async () => {
        try {
            let allMemberships = [];
            let page = 1;
            let totalPages = 1;

            do {
                const response = await fetch(
                    `https://api.do360.com/api/rhp-memberships?pagination[page]=${page}&pagination[pageSize]=100&populate=MemberFiles`
                );

                if (response.ok) {
                    const result = await response.json();
                    console.log(`Memberships page ${page}:`, result);
                    if (result.data && Array.isArray(result.data)) {
                        allMemberships = [...allMemberships, ...result.data];
                    }

                    if (result.meta && result.meta.pagination) {
                        totalPages = result.meta.pagination.pageCount || result.meta.pagination.totalPages || 1;
                    }
                    page++;
                } else {
                    const errData = await response.json();
                    throw new Error(`Failed to fetch memberships: ${response.status} - ${errData.error?.message || 'Unknown'}`);
                }
            } while (page <= totalPages);

            console.log(`Total memberships loaded: ${allMemberships.length}`);
            setMemberships(allMemberships);
        } catch (err) {
            console.error('Error fetching memberships:', err);
            setError(prev => prev ? `${prev}; ${err.message}` : err.message);
        }
    };

    const fetchBookings = async () => {
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
                    console.log(`Bookings page ${page}:`, result);
                    if (result.data && Array.isArray(result.data)) {
                        allBookings = [...allBookings, ...result.data];
                    }
                    
                    if (result.meta && result.meta.pagination) {
                        totalPages = result.meta.pagination.pageCount || 1;
                    }
                    
                    page++;
                } else {
                    const errData = await response.json();
                    throw new Error(`Failed to fetch bookings: ${response.status} - ${errData.error?.message || 'Unknown'}`);
                }
            } while (page <= totalPages);
            
            console.log(`Total bookings loaded: ${allBookings.length}`);
            setBookings(allBookings);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(prev => prev ? `${prev}; ${err.message}` : err.message);
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

    const formatDateRange = (date) => {
        return date.toLocaleDateString('en-AU', { 
            weekday: 'short',
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

    // Get array of annual site numbers from memberships
    const getAnnualSiteNumbers = () => {
        console.log('memberships:', memberships);
        return memberships
            .filter(m => {
                const attrs = m.attributes || m;
                const isAnnual = attrs.TenantType === 'Annual';
                const siteNum = attrs.SiteNumber || attrs.siteNumber;
                console.log('Member:', attrs, 'Is Annual:', isAnnual, 'Site:', siteNum);
                return isAnnual && siteNum;
            })
            .map(m => {
                const attrs = m.attributes || m;
                return attrs.SiteNumber || attrs.siteNumber;
            })
            .filter((site, idx, arr) => arr.indexOf(site) === idx)
            .sort((a, b) => {
                const aNum = parseInt(String(a).match(/\d+/)?.[0] || 0);
                const bNum = parseInt(String(b).match(/\d+/)?.[0] || 0);
                return aNum - bNum;
            });
    };

    // Get bookings for a specific site number
    const getBookingsForSite = (siteNumber) => {
        return bookings.filter(b => {
            const attrs = b.attributes || b;
            const bookingSite = attrs.siteNumber || attrs.SiteNumber;
            return String(bookingSite) === String(siteNumber);
        });
    };

    // Check if booking overlaps with timeline
    const isBookingInRange = (booking, start, end) => {
        const attrs = booking.attributes || booking;
        const checkin = new Date(attrs.checkin);
        const checkout = new Date(attrs.checkout);
        
        return checkin < end && checkout > start;
    };

    // Calculate position and width for booking block
    const getBookingPosition = (booking, timelineStart, dayCount) => {
        const attrs = booking.attributes || booking;
        const checkin = new Date(attrs.checkin);
        const checkout = new Date(attrs.checkout);
        const timelineEnd = new Date(timelineStart);
        timelineEnd.setDate(timelineEnd.getDate() + dayCount);

        const startOffset = Math.max(0, (checkin - timelineStart) / (1000 * 60 * 60 * 24));
        const endOffset = Math.min(dayCount, (checkout - timelineStart) / (1000 * 60 * 60 * 24));
        
        return {
            left: (startOffset / dayCount) * 100,
            width: ((endOffset - startOffset) / dayCount) * 100
        };
    };

    const handleDateChange = (e) => {
        const newDate = new Date(e.target.value);
        setStartDate(newDate);
    };

    const handleDayCountChange = (newCount) => {
        setDayCount(newCount);
    };

    const moveTimelineBack = () => {
        const newDate = new Date(startDate);
        newDate.setDate(newDate.getDate() - 7);
        setStartDate(newDate);
    };

    const moveTimelineForward = () => {
        const newDate = new Date(startDate);
        newDate.setDate(newDate.getDate() + 7);
        setStartDate(newDate);
    };

    const moveToToday = () => {
        const today = new Date();
        const newStart = new Date(today);
        newStart.setDate(today.getDate() - Math.floor(dayCount / 2));
        setStartDate(newStart);
    };

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + dayCount);

    const timelineEnd = new Date(startDate);
    timelineEnd.setDate(timelineEnd.getDate() + dayCount);

    const annualSites = getAnnualSiteNumbers();

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Annual Bookings Timeline</h2>
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                            <button
                                onClick={() => {
                                    setIsCreatingNewBooking(true);
                                    setSelectedSiteForNew(null);
                                }}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200 font-medium flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                New Booking
                            </button>
                            <button
                                onClick={() => {
                                    fetchBookings();
                                    fetchMemberships();
                                }}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition duration-200 font-medium flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Timeline Controls */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                        <div className="flex gap-2">
                            <button
                                onClick={moveTimelineBack}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-medium text-sm"
                            >
                                ← Prev
                            </button>
                            <button
                                onClick={moveToToday}
                                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition font-medium text-sm"
                            >
                                Today
                            </button>
                            <button
                                onClick={moveTimelineForward}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-medium text-sm"
                            >
                                Next →
                            </button>
                        </div>

                        <input
                            type="date"
                            value={startDate.toISOString().split('T')[0]}
                            onChange={handleDateChange}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />

                        <select
                            value={dayCount}
                            onChange={(e) => handleDayCountChange(parseInt(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        >
                            <option value={7}>1 Week</option>
                            <option value={14}>2 Weeks</option>
                            <option value={30}>1 Month</option>
                            <option value={60}>2 Months</option>
                        </select>

                        <span className="text-sm text-gray-600">
                            {formatDate(startDate)} to {formatDate(endDate)}
                        </span>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={hideEmptySites}
                                onChange={(e) => setHideEmptySites(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">Hide empty sites</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600">Loading bookings...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && annualSites.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No annual sites found</h3>
                    <p className="text-gray-500">No annual memberships available to display.</p>
                </div>
            )}

            {/* Timeline View */}
            {!loading && !error && annualSites.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <div className="min-w-full">
                            {/* Timeline Header - Days */}
                            <div className="flex border-b border-gray-200 sticky top-0 z-10 bg-white">
                                <div className="w-24 flex-shrink-0 border-r border-gray-200 bg-gray-50 p-3 font-semibold text-sm text-gray-700">
                                    Site #
                                </div>
                                <div className="flex flex-1">
                                    {Array.from({ length: dayCount }).map((_, idx) => {
                                        const date = new Date(startDate);
                                        date.setDate(date.getDate() + idx);
                                        const isToday = new Date().toDateString() === date.toDateString();
                                        
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex-1 min-w-[80px] border-r border-gray-200 p-2 text-center text-xs font-medium ${
                                                    isToday ? 'bg-blue-50' : 'bg-gray-50'
                                                }`}
                                            >
                                                <div className={isToday ? 'text-blue-700' : 'text-gray-600'}>
                                                    {formatDateRange(date)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Timeline Rows - Sites */}
                            {annualSites.map((siteNumber) => {
                                const siteBookings = getBookingsForSite(siteNumber);
                                const visibleBookings = siteBookings.filter(b => isBookingInRange(b, startDate, timelineEnd));

                                // Skip empty sites if toggle is on
                                if (hideEmptySites && visibleBookings.length === 0) {
                                    return null;
                                }

                                return (
                                    <div key={siteNumber} className="flex border-b border-gray-200 hover:bg-gray-50 transition">
                                        <div className="w-24 flex-shrink-0 border-r border-gray-200 p-3 text-sm font-semibold text-gray-900 flex items-center justify-between">
                                            <span>{siteNumber}</span>
                                            <button
                                                onClick={() => {
                                                    setSelectedSiteForNew(siteNumber);
                                                    setIsCreatingNewBooking(true);
                                                }}
                                                className="hidden sm:inline-flex px-1 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition"
                                                title="Add booking for this site"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="flex flex-1 relative">
                                            {/* Day grid background */}
                                            {Array.from({ length: dayCount }).map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex-1 min-w-[80px] border-r border-gray-200 relative"
                                                />
                                            ))}

                                            {/* Booking blocks */}
                                            {visibleBookings.map((booking, idx) => {
                                                const attrs = booking.attributes || booking;
                                                const position = getBookingPosition(booking, startDate, dayCount);
                                                const nights = calculateNights(attrs.checkin, attrs.checkout);
                                                const adults = attrs.adultNumber || 0;
                                                const children = attrs.childNumber || 0;
                                                const totalPeople = adults + children;
                                                const price = attrs.totalPrice ? attrs.totalPrice.toFixed(0) : '0';
                                                
                                                return (
                                                    <div
                                                        key={booking.id || idx}
                                                        className="absolute top-2 h-10 bg-indigo-500 hover:bg-indigo-600 text-white rounded px-2 py-1 text-xs cursor-pointer transition shadow-md hover:shadow-lg z-20 overflow-hidden flex items-center"
                                                        style={{
                                                            left: `${position.left}%`,
                                                            width: `${position.width}%`,
                                                            marginRight: '2px'
                                                        }}
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setShowDetailModal(true);
                                                        }}
                                                        title={`${nights} night${nights !== 1 ? 's' : ''} • ${adults} adult${adults !== 1 ? 's' : ''} • ${children} child${children !== 1 ? 'ren' : ''} • $${price} - Check-in: ${formatDate(attrs.checkin)}`}
                                                    >
                                                        <div className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{nights} nights • {totalPeople} people • ${price}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{annualSites.length}</span> annual site{annualSites.length !== 1 ? 's' : ''} with <span className="font-semibold">{bookings.length}</span> total booking{bookings.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            <AnnualBookingModal
                booking={selectedBooking}
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedBooking(null);
                }}
                onSaveSuccess={(data) => {
                    // Refresh the bookings list after successful save
                    fetchBookings();
                }}
            />

            {/* Create New Booking Modal */}
            <AnnualBookingModal
                booking={null}
                isOpen={isCreatingNewBooking}
                onClose={() => {
                    setIsCreatingNewBooking(false);
                    setSelectedSiteForNew(null);
                }}
                onSaveSuccess={(data) => {
                    // Refresh the bookings list after successful creation
                    fetchBookings();
                }}
                siteNumber={selectedSiteForNew}
                isNewBooking={true}
            />            </div>        </div>
    );
};

export default BookingList;