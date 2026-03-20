import React, { useState, useEffect } from 'react';

export default function AnnualBookingModal({
  booking,
  isOpen,
  onClose,
  onSaveSuccess,
  siteNumber,
  isNewBooking = false
}) {
  const [isEditing, setIsEditing] = useState(isNewBooking);
  const [editedBooking, setEditedBooking] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const CMSEndpoint = import.meta.env.VITE_CMS_ENDPOINT || 'https://api.do360.com';
  const CMSApiKey = import.meta.env.VITE_CMS_TOKEN;

  useEffect(() => {
    if (isOpen) {
      if (isNewBooking) {
        setEditedBooking({
          siteNumber: siteNumber || '',
          checkin: '',
          checkout: '',
          adultNumber: 0,
          childNumber: 0,
          totalPrice: 0,
          RegistrationNumber: [],
          extra: []
        });
        setIsEditing(true);
      } else if (booking) {
        const attrs = booking.attributes || booking;
        setEditedBooking({
          siteNumber: attrs.siteNumber || '',
          checkin: attrs.checkin || '',
          checkout: attrs.checkout || '',
          adultNumber: parseInt(attrs.adultNumber) || 0,
          childNumber: parseInt(attrs.childNumber) || 0,
          totalPrice: parseFloat(attrs.totalPrice) || 0,
          RegistrationNumber: attrs.RegistrationNumber || [],
          extra: attrs.extra || [],
          id: booking.id,
          documentId: booking.documentId
        });
        setIsEditing(false);
      }
      setError('');
    }
  }, [isOpen, booking, isNewBooking, siteNumber]);

  const calculateNights = (checkin, checkout) => {
    if (!checkin || !checkout) return 0;
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleInputChange = (field, value) => {
    // Convert numeric fields to proper types
    let processedValue = value;
    if (['adultNumber', 'childNumber', 'totalPrice'].includes(field)) {
      processedValue = field === 'totalPrice' ? parseFloat(value) || 0 : parseInt(value) || 0;
    }
    setEditedBooking(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const handleRegistrationChange = (index, value) => {
    const newReg = [...(editedBooking.RegistrationNumber || [])];
    if (!newReg[index]) {
      newReg[index] = {};
    }
    newReg[index].RegistrationNumber = value;
    setEditedBooking(prev => ({
      ...prev,
      RegistrationNumber: newReg
    }));
  };

  const addRegistration = () => {
    setEditedBooking(prev => ({
      ...prev,
      RegistrationNumber: [...(prev.RegistrationNumber || []), { RegistrationNumber: '' }]
    }));
  };

  const removeRegistration = (index) => {
    setEditedBooking(prev => ({
      ...prev,
      RegistrationNumber: (prev.RegistrationNumber || []).filter((_, i) => i !== index)
    }));
  };

  const handleExtraItemChange = (index, field, value) => {
    const newExtra = [...(editedBooking.extra || [])];
    if (!newExtra[index]) {
      newExtra[index] = {};
    }
    newExtra[index][field] = field === 'Number' || field === 'Price' ? parseFloat(value) || 0 : value;
    setEditedBooking(prev => ({
      ...prev,
      extra: newExtra
    }));
  };

  const addExtraItem = () => {
    setEditedBooking(prev => ({
      ...prev,
      extra: [...(prev.extra || []), { Name: '', Number: 1, Price: 0 }]
    }));
  };

  const removeExtraItem = (index) => {
    setEditedBooking(prev => ({
      ...prev,
      extra: (prev.extra || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      if (!editedBooking.siteNumber) {
        throw new Error('Site number is required');
      }
      if (!editedBooking.checkin || !editedBooking.checkout) {
        throw new Error('Check-in and check-out dates are required');
      }

      // Core fields that definitely exist in the database
      const coreData = {
        siteNumber: editedBooking.siteNumber,
        checkin: editedBooking.checkin,
        checkout: editedBooking.checkout,
        adultNumber: parseInt(editedBooking.adultNumber) || 0,
        childNumber: parseInt(editedBooking.childNumber) || 0,
        totalPrice: parseFloat(editedBooking.totalPrice) || 0
      };

      // Optional fields - only include if they have data
      const optionalFields = {};
      if (editedBooking.RegistrationNumber && editedBooking.RegistrationNumber.length > 0) {
        optionalFields.RegistrationNumber = editedBooking.RegistrationNumber;
      }
      if (editedBooking.extra && editedBooking.extra.length > 0) {
        optionalFields.extra = editedBooking.extra;
      }

      const saveData = { ...coreData, ...optionalFields };

      let response, result;

      if (isNewBooking) {
        // Create new booking
        response = await fetch(`${CMSEndpoint}/api/annual-bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CMSApiKey}`
          },
          body: JSON.stringify({ data: saveData })
        });
      } else {
        // Update existing booking
        const documentId = editedBooking.documentId;
        if (!documentId) throw new Error('No documentId found');

        // For PUT request, only send core fields to avoid validation issues
        response = await fetch(`${CMSEndpoint}/api/annual-bookings/${documentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CMSApiKey}`
          },
          body: JSON.stringify({ data: coreData })
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Failed to ${isNewBooking ? 'create' : 'update'} booking`);
      }

      result = await response.json();
      alert(`Booking ${isNewBooking ? 'created' : 'updated'} successfully!`);
      setIsEditing(false);
      if (onSaveSuccess) onSaveSuccess(result.data);
      onClose();
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    setSaving(true);
    setError('');

    try {
      const documentId = editedBooking.documentId;
      if (!documentId) throw new Error('No documentId found');

      const response = await fetch(`${CMSEndpoint}/api/annual-bookings/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${CMSApiKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete booking');
      }

      alert('Booking deleted successfully!');
      if (onSaveSuccess) onSaveSuccess(null);
      onClose();
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !editedBooking) return null;

  const nights = calculateNights(editedBooking.checkin, editedBooking.checkout);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            {isNewBooking ? 'Create Annual Booking' : 'Annual Booking Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Booking Information */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">Booking Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Site Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedBooking.siteNumber || ''}
                      onChange={(e) => handleInputChange('siteNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{editedBooking.siteNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Duration (Nights)</label>
                  <p className="text-sm font-medium text-gray-900">{nights || '-'}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Check-in Date *</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedBooking.checkin || ''}
                      onChange={(e) => handleInputChange('checkin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{formatDate(editedBooking.checkin)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Check-out Date *</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedBooking.checkout || ''}
                      onChange={(e) => handleInputChange('checkout', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{formatDate(editedBooking.checkout)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-4">Guest Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Number of Adults</label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      value={editedBooking.adultNumber || 0}
                      onChange={(e) => handleInputChange('adultNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{editedBooking.adultNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Number of Children</label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      value={editedBooking.childNumber || 0}
                      onChange={(e) => handleInputChange('childNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{editedBooking.childNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Registration Numbers */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-4">Vehicle Registration Numbers</h3>
              <div className="space-y-2">
                {(editedBooking.RegistrationNumber || []).map((reg, index) => (
                  <div key={index} className="flex gap-2">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={reg.RegistrationNumber || ''}
                          onChange={(e) => handleRegistrationChange(index, e.target.value)}
                          placeholder="e.g., ABC123"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                        <button
                          onClick={() => removeRegistration(index)}
                          className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition text-sm font-medium"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-purple-200 text-purple-800 rounded-md text-sm font-medium">
                        {reg.RegistrationNumber}
                      </span>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    onClick={addRegistration}
                    className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition text-sm font-medium"
                  >
                    + Add Registration Number
                  </button>
                )}
              </div>
            </div>

            {/* Extra Items */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h3 className="text-sm font-bold text-yellow-600 uppercase tracking-wider mb-4">Extra Items</h3>
              <div className="space-y-3">
                {(editedBooking.extra || []).map((item, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-yellow-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={item.Name || ''}
                            onChange={(e) => handleExtraItemChange(index, 'Name', e.target.value)}
                            placeholder="Item name"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                          <input
                            type="number"
                            min="1"
                            value={item.Number || 1}
                            onChange={(e) => handleExtraItemChange(index, 'Number', e.target.value)}
                            placeholder="Quantity"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.Price || 0}
                            onChange={(e) => handleExtraItemChange(index, 'Price', e.target.value)}
                            placeholder="Price"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                        </>
                      ) : (
                        <div className="sm:col-span-3 flex justify-between items-center">
                          <span className="text-sm text-gray-700">{item.Name} x {item.Number}</span>
                          <span className="text-sm font-medium text-gray-900">${item.Price?.toFixed(2) || '0.00'}</span>
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeExtraItem(index)}
                        className="w-full px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition text-xs font-medium"
                      >
                        Remove Item
                      </button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    onClick={addExtraItem}
                    className="w-full px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition text-sm font-medium"
                  >
                    + Add Extra Item
                  </button>
                )}
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-600">Total Price</label>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editedBooking.totalPrice || 0}
                    onChange={(e) => handleInputChange('totalPrice', e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-right"
                  />
                ) : (
                  <span className="text-2xl font-bold text-green-600">
                    ${editedBooking.totalPrice?.toFixed(2) || '0.00'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            {!isNewBooking && !isEditing && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium text-sm"
              >
                Delete Booking
              </button>
            )}
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                >
                  Edit Booking
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (isNewBooking) {
                      onClose();
                    } else {
                      setIsEditing(false);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : isNewBooking ? 'Create Booking' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
