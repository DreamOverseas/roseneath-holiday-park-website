import React, { useState, useEffect } from 'react';
import AnnualBookingModal from './AnnualBookingModal';

export default function MemberDetailModal({ 
  member, 
  isOpen, 
  onClose, 
  onUpdateSuccess,
  adminEmails = []
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState(member);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = React.useRef(null);
  const [renameTargetFile, setRenameTargetFile] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // 新增：用于存储该成员的 Annual Bookings
  const [memberBookings, setMemberBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCreatingNewBooking, setIsCreatingNewBooking] = useState(false);

  const CMSEndpoint = import.meta.env.VITE_CMS_ENDPOINT || 'https://api.do360.com';
  const CMSApiKey = import.meta.env.VITE_CMS_TOKEN;

  // Reset state when member changes
  useEffect(() => {
    if (member) {
      setEditedMember(member);
      setIsEditing(false);
      setError('');
      
      // 如果是 Annual 成员，则获取其预订信息
      if (getDisplayTenantType(member) === 'Annual' && member.SiteNumber) {
        fetchMemberBookings(member.SiteNumber);
      } else {
        setMemberBookings([]);
      }
    }
  }, [member, isOpen]);

  // 获取该 Site Number 对应的预订记录
  const fetchMemberBookings = async (siteNumber) => {
    setBookingsLoading(true);
    try {
      const response = await fetch(
        `${CMSEndpoint}/api/annual-bookings?filters[siteNumber][$eq]=${siteNumber}&sort=checkin:desc`,
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
        setMemberBookings(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  // 计算晚数 (逻辑参考 BookingList.jsx)
  const calculateNights = (checkin, checkout) => {
    if (!checkin || !checkout) return 0;
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (!isOpen || !member) return null;

  const getDisplayTenantType = (memberData) => {
    if (adminEmails.includes(memberData.Email?.toLowerCase())) {
      return 'Admin';
    }
    return memberData.TenantType || 'Guest';
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

  const displayType = getDisplayTenantType(isEditing ? editedMember : member);

  const handleInputChange = (field, value) => {
    setEditedMember(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const updateData = {};
      let hasChanges = false;

      Object.keys(editedMember).forEach(key => {
        if (['documentId', 'id', 'createdAt', 'updatedAt', 'publishedAt', 'locale'].includes(key)) {
          return;
        }

        if (key === 'MemberFiles') {
          const oldIds = memberFilesToIds(member.MemberFiles);
          const newIds = memberFilesToIds(editedMember.MemberFiles);
          if (JSON.stringify(oldIds) !== JSON.stringify(newIds)) {
            updateData.MemberFiles = newIds; 
            hasChanges = true;
          }
          return; 
        }

        if (editedMember[key] !== member[key]) {
          updateData[key] = editedMember[key];
          hasChanges = true;
        }
      });

      if (!hasChanges) {
        setIsEditing(false);
        return;
      }

      const documentId = member.documentId;
      if (!documentId) throw new Error('No documentId found');

      const response = await fetch(`${CMSEndpoint}/api/rhp-memberships/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CMSApiKey}`
        },
        body: JSON.stringify({ data: updateData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update member');
      }

      const result = await response.json();
      alert('Member information updated successfully!');
      setIsEditing(false);
      if (onUpdateSuccess) onUpdateSuccess(result.data);
      onClose();
    } catch (err) {
      setError(`Failed to update: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getMemberFilesArray = (raw) => {
    if (!raw) return [];
    if (typeof raw === 'object' && Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw)) return raw;
    return typeof raw === 'object' ? [raw] : [];
  };

  const memberFilesToIds = (raw) => {
    return getMemberFilesArray(raw)
      .map((f) => (typeof f === 'number' ? f : f?.id))
      .filter((id) => id != null);
  };

  const buildFileUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    return `${CMSEndpoint}${url}`;
  };

  const handleDownloadFile = async (file) => {
    try {
      const attrs = file?.attributes || file;
      if (!attrs?.url) return;
      const res = await fetch(buildFileUrl(attrs.url));
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = attrs.name || 'file';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert('Failed to download file');
    }
  };

  const detailSections = [
    {
      title: 'Basic Information',
      fields: [
        { label: 'Site Number', key: 'SiteNumber', editable: true },
        { label: 'Member Type', key: 'TenantType', editable: true, type: 'select', options: ['Guest', 'Annual', 'Permanent'] },
        { label: 'Username', key: 'UserName', editable: true },
      ]
    },
    {
      title: 'Primary Contact',
      fields: [
        { label: 'First Name', key: 'FirstName', editable: true },
        { label: 'Last Name', key: 'LastName', editable: true },
        { label: 'Email', key: 'Email', editable: true, type: 'email' },
        { label: 'Phone', key: 'Contact', editable: true, type: 'tel' },
      ]
    },
    {
      title: 'Member Files',
      fields: [
        { label: 'Attachments', key: 'MemberFiles', editable: true, type: 'fileList', fullWidth: true },
      ]
    },
    {
      title: 'Notes',
      fields: [
        { label: 'Note', key: 'Note', editable: true, fullWidth: true, textarea: true },
      ]
    }
  ];

  const renderField = (field) => {
    const currentMember = isEditing ? editedMember : member;
    const value = currentMember[field.key];

    if (!isEditing) {
      if (field.key === 'TenantType') {
        return (
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            displayType === 'Admin' ? 'bg-purple-100 text-purple-800' :
            displayType === 'Permanent' ? 'bg-green-100 text-green-800' :
            displayType === 'Annual' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {getTenantTypeLabel(displayType)}
          </span>
        );
      }
      if (field.key === 'MemberFiles') {
        const files = getMemberFilesArray(value);
        if (!files.length) return <div className="text-sm text-gray-500">(No file)</div>;
        return (
          <div className="space-y-1">
            {files.map((file, idx) => {
              const attrs = file?.attributes || file;
              return (
                <div key={idx} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-indigo-600 truncate">{attrs.name}</span>
                  <button onClick={() => handleDownloadFile(file)} className="text-xs text-gray-600 border px-2 py-1 rounded hover:bg-gray-50">Download</button>
                </div>
              );
            })}
          </div>
        );
      }
      return <div className="text-sm text-gray-900">{value || '-'}</div>;
    }

    // Editing mode...
    if (field.type === 'select') {
      return (
        <select 
          value={value || ''} 
          onChange={(e) => handleInputChange(field.key, e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        >
          {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    return (
      <input 
        type={field.type || 'text'}
        value={value || ''}
        onChange={(e) => handleInputChange(field.key, e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-sm"
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Member Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {detailSections.map((section, idx) => (
              <div key={idx} className={`${section.fields.some(f => f.fullWidth) ? 'md:col-span-2' : ''} bg-white p-4 rounded-lg border border-gray-100 shadow-sm`}>
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">{section.title}</h3>
                <div className="grid grid-cols-1 gap-4">
                  {section.fields.map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 新增：Annual Bookings 区块 */}
          {displayType === 'Annual' && (
            <div className="mt-8 bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Annual Bookings (Site: {member.SiteNumber})
              </h3>
              
              {bookingsLoading ? (
                <div className="text-center py-4 text-sm text-gray-500">Loading bookings...</div>
              ) : memberBookings.length > 0 ? (
                <div className="space-y-2">
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Check-in</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Check-out</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nights</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total Price</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {memberBookings.map((booking) => {
                          const attrs = booking.attributes || booking;
                          return (
                            <tr key={booking.id}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{new Date(attrs.checkin).toLocaleDateString('en-AU')}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{new Date(attrs.checkout).toLocaleDateString('en-AU')}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{calculateNights(attrs.checkin, attrs.checkout)}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-green-600">${attrs.totalPrice?.toFixed(2)}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-center">
                                <button
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowBookingModal(true);
                                  }}
                                  className="text-xs px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded transition"
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={() => {
                      setIsCreatingNewBooking(true);
                      setShowBookingModal(true);
                    }}
                    className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition text-sm font-medium"
                  >
                    + Add New Booking
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 italic">No annual bookings found for this site.</p>
                  <button
                    onClick={() => {
                      setIsCreatingNewBooking(true);
                      setShowBookingModal(true);
                    }}
                    className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition text-sm font-medium"
                  >
                    + Add Booking
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          {error && <div className="text-red-500 text-sm mr-auto self-center">{error}</div>}
          {!isEditing ? (
            <>
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Edit Member</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>

        {/* Annual Booking Detail/Edit Modal */}
        <AnnualBookingModal
          booking={selectedBooking}
          isOpen={showBookingModal && !isCreatingNewBooking}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedBooking(null);
            setIsCreatingNewBooking(false);
            // Refresh bookings after closing
            if (member && member.SiteNumber) {
              fetchMemberBookings(member.SiteNumber);
            }
          }}
          onSaveSuccess={() => {
            // Refresh bookings after successful save
            if (member && member.SiteNumber) {
              fetchMemberBookings(member.SiteNumber);
            }
          }}
        />

        {/* Create New Annual Booking Modal */}
        <AnnualBookingModal
          booking={null}
          isOpen={showBookingModal && isCreatingNewBooking}
          onClose={() => {
            setShowBookingModal(false);
            setIsCreatingNewBooking(false);
            setSelectedBooking(null);
            // Refresh bookings after closing
            if (member && member.SiteNumber) {
              fetchMemberBookings(member.SiteNumber);
            }
          }}
          onSaveSuccess={() => {
            // Refresh bookings after successful creation
            if (member && member.SiteNumber) {
              fetchMemberBookings(member.SiteNumber);
            }
          }}
          siteNumber={member?.SiteNumber}
          isNewBooking={true}
        />
      </div>
    </div>
  );
}