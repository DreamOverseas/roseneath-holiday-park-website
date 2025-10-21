import React, { useState } from 'react';

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

  // Reset state when member changes
  React.useEffect(() => {
    if (member) {
      setEditedMember(member);
      setIsEditing(false);
      setError('');
    }
  }, [member]);

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
      // Prepare update data - only include changed fields
      const updateData = {};
      let hasChanges = false;

      Object.keys(editedMember).forEach(key => {
        // Skip system fields and documentId
        if (['documentId', 'id', 'createdAt', 'updatedAt', 'publishedAt', 'locale'].includes(key)) {
          return;
        }

        // Compare values
        if (editedMember[key] !== member[key]) {
          updateData[key] = editedMember[key];
          hasChanges = true;
        }
      });

      if (!hasChanges) {
        setIsEditing(false);
        return;
      }

      // Use documentId for Strapi 5 update
      const documentId = member.documentId;
      
      if (!documentId) {
        throw new Error('No documentId found for this member');
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
        throw new Error(errorData.error?.message || 'Failed to update member');
      }

      const result = await response.json();
      
      // Success
      alert('Member information updated successfully!');
      setIsEditing(false);
      
      // Notify parent to refresh data
      if (onUpdateSuccess) {
        onUpdateSuccess(result.data);
      }
      
      onClose();
    } catch (err) {
      setError(`Failed to update: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedMember(member);
    setIsEditing(false);
    setError('');
  };

  const detailSections = [
    {
      title: 'Basic Information',
      fields: [
        { label: 'Site Number', key: 'SiteNumber', editable: true },
        { label: 'Member Type', key: 'TenantType', editable: true, type: 'select', 
          options: ['Guest', 'Annual', 'Permanent'] },
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
      title: 'Secondary Contact',
      fields: [
        { label: 'First Name 2', key: 'FirstName2', editable: true },
        { label: 'Last Name 2', key: 'LastName2', editable: true },
        { label: 'Email 2', key: 'Email2', editable: true, type: 'email' },
        { label: 'Phone 2', key: 'Contact2', editable: true, type: 'tel' },
      ]
    },
    {
      title: 'Address & Location',
      fields: [
        { label: 'Address', key: 'Address', editable: true, fullWidth: true, textarea: true },
      ]
    },
    {
      title: 'Membership Details',
      fields: [
        { label: 'Start Date', key: 'StartDate', editable: true, type: 'date' },
        { label: 'End Date', key: 'EndDate', editable: true, type: 'date' },
        { label: 'CR', key: 'CR', editable: true, type: 'number' },
        { label: 'Power', key: 'Power', editable: true, type: 'select',
          options: ['', 'Powered', 'Unpowered'] },
      ]
    },
    {
      title: 'Points & Rewards',
      fields: [
        { label: 'Points', key: 'Point', editable: true, type: 'number' },
        { label: 'Discount Points', key: 'DiscountPoint', editable: true, type: 'number' },
      ]
    },
    {
      title: 'Notes',
      fields: [
        { label: 'Note', key: 'Note', editable: true, fullWidth: true, textarea: true },
      ]
    }
  ];

  const renderFieldValue = (field) => {
    const currentMember = isEditing ? editedMember : member;
    const value = currentMember[field.key];
    
    // Format dates for display
    if (field.type === 'date' && value) {
      return new Date(value).toLocaleDateString();
    }
    
    return value || '-';
  };

  const renderField = (field) => {
    const currentMember = isEditing ? editedMember : member;
    const value = currentMember[field.key];
    const hasValue = value && value !== '-';

    if (!isEditing) {
      // View mode
      if (field.key === 'TenantType') {
        return (
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            displayType === 'Admin' ? 'bg-purple-100 text-purple-800' :
            displayType === 'Permanent' ? 'bg-green-100 text-green-800' :
            displayType === 'Annual' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {getTenantTypeLabel(displayType)}
          </span>
        );
      }
      
      if (field.textarea) {
        return (
          <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-wrap min-h-[60px]">
            {renderFieldValue(field)}
          </div>
        );
      }
      
      return (
        <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
          {renderFieldValue(field)}
        </div>
      );
    }

    // Edit mode
    if (!field.editable) {
      return (
        <div className="text-sm text-gray-900 bg-gray-100 p-2 rounded border border-gray-200">
          {renderFieldValue(field)}
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <select
          value={value || ''}
          onChange={(e) => handleInputChange(field.key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
        >
          {field.options.map(option => (
            <option key={option} value={option}>
              {option || '(None)'}
            </option>
          ))}
        </select>
      );
    }

    if (field.textarea) {
      return (
        <textarea
          value={value || ''}
          onChange={(e) => handleInputChange(field.key, e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm resize-vertical"
        />
      );
    }

    if (field.type === 'date') {
      // Convert date to YYYY-MM-DD format for input
      const dateValue = value ? new Date(value).toISOString().split('T')[0] : '';
      return (
        <input
          type="date"
          value={dateValue}
          onChange={(e) => handleInputChange(field.key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
        />
      );
    }

    if (field.type === 'number') {
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => handleInputChange(field.key, e.target.value ? parseFloat(e.target.value) : '')}
          step={field.key === 'CR' ? '0.01' : '1'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
        />
      );
    }

    if (field.type === 'tel') {
      return (
        <input
          type="tel"
          value={value || ''}
          onChange={(e) => handleInputChange(field.key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
        />
      );
    }

    return (
      <input
        type={field.type || 'text'}
        value={value || ''}
        onChange={(e) => handleInputChange(field.key, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[100vh] overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              {isEditing ? 'Edit Member' : 'Member Details'}
            </h2>
            <p className="text-indigo-100 mt-1">
              {member.FirstName} {member.LastName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-indigo-700 rounded-full p-2 transition-colors"
            disabled={saving}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {detailSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="mb-6 last:mb-0">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                {section.title}
              </h3>
              <div className={`grid ${section.fields.some(f => f.fullWidth) ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                {section.fields.map((field, fieldIdx) => {
                  const currentMember = isEditing ? editedMember : member;
                  const value = currentMember[field.key];
                  const hasValue = value && value !== '-' && value !== '';
                  
                  return (
                    <div 
                      key={fieldIdx} 
                      className={`${field.fullWidth ? 'md:col-span-2' : ''} ${!hasValue && !isEditing ? 'opacity-50' : ''}`}
                    >
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {field.label}
                      </label>
                      {renderField(field)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
          <div>
            {isEditing && (
              <p className="text-sm text-gray-600">
                Make your changes and click Save
              </p>
            )}
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition duration-200 font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition duration-200 font-medium"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition duration-200 font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}