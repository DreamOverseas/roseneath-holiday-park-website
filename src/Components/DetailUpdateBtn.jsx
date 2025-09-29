import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import '../Css/Tailwind.css';

// Environment variables for Strapi CMS
const CMS_endpoint = import.meta.env.VITE_CMS_ENDPOINT;
const CMS_token = import.meta.env.VITE_CMS_TOKEN;

const DetailUpdateBtn = () => {
  const [showModal, setShowModal] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [documentID, setDocumentID] = useState(null);

  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');

  const { t, i18n } = useTranslation();

  const [error, setError] = useState('');

  /**
   * Opens the modal: fetches user data by email, sets isMember, documentID, then shows modal
   */
  const handleOpen = async () => {
    console.log("Starting a update detail session.");
    try {
      // Read user cookie and parse JSON
      const userCookie = Cookies.get('user');
      if (!userCookie) {
        console.error('No user cookie found');
        return;
      }
      const { email } = JSON.parse(userCookie);

      // Fetch user record from Strapi by filtering Email
      const res = await fetch(
        `${CMS_endpoint}/api/rhp-memberships?filters[Email][$eq]=${email}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${CMS_token}`
          }
        }
      );
      if (!res.ok) {
        console.error('Failed to fetch user details');
        return;
      }
      const user_data = await res.json();
      if (user_data.data && user_data.data.length > 0) {
        const record = user_data.data[0];
        setIsMember(record.IsMember);
        setDocumentID(record.documentId);
        setShowModal(true);
      } else {
        console.error(`Such user ${email} is not found or missing in backend.`);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  };

  /**
   * Resets form fields and closes modal
   */
  const handleClose = () => {
    setShowModal(false);
    setError('');
    setUserName('');
    setFirstName('');
    setLastName('');
    setContact('');
  };

  /**
   * Submits updated fields to Strapi: checks at least one change, builds payload,
   * sends PUT request, and on success reloads the page
   */
  const handleSubmit = async () => {
    setError('');
    // Ensure at least one field has been changed
    if (!userName && !firstName && !lastName && !contact) {
      setError('Please update at least one field.');
      return;
    }

    // Build update payload with only changed fields
    const payload = {};
    if (userName) payload.UserName = userName;
    if (firstName) payload.FirstName = firstName;
    if (lastName) payload.LastName = lastName;
    if (contact) payload.Contact = contact;

    try {
      const res = await fetch(
        `${CMS_endpoint}/api/rhp-memberships/${documentID}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${CMS_token}`
          },
          body: JSON.stringify({ data: payload })
        }
      );
      if (res.ok) {
        const existing = Cookies.get('user');
        const userData = existing ? JSON.parse(existing) : {};

        const updatedData = { // Update the updated fields only
          ...userData,
          ...(userName ? { name: userName } : {}),
          ...(firstName ? { fname: firstName } : {}),
          ...(lastName ? { lname: lastName } : {}),
          ...(contact ? { contact: contact } : {}),
        };

        Cookies.set('user', JSON.stringify(updatedData), { expires: 7, path: '/' });

        // On success, reset and close modal, update cookie, then refresh page
        handleClose();
        window.location.reload();
      } else {
        setError('Update failed. Please try again.');
      }
    } catch (err) {
      console.error('Error updating details:', err);
      setError('Error updating details. Please try again later.');
    }
  };

  return (
    <>
      {/* Small button to trigger the update modal */}
      <button
        onClick={handleOpen}
        className="text-sm text-blue-600 hover:underline"
      >
        {t("update_detail")} &gt;
      </button>

      {/* Modal overlay and content */}
      {showModal && (
        <div className="!fixed inset-0 bg-black/50 flex !items-center !justify-center !z-50">
          <div className="!bg-white !rounded-lg shadow-lg !w-full max-w-md !mx-4">
            {/* Title */}
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{t("update_detail")}</h2>
            </div>
            {/* Body */}
            <div className="px-6 py-4">
              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

              {/* Always show User Name field */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">{t("update_detail.userName")}</label>
                <input
                  type="text"
                  placeholder={t("update_detail.placeholder")}
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">{t("update_detail.contact")}</label>
                <input
                  type="text"
                  placeholder={t("update_detail.placeholder")}
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              {/* If the user is a member, show additional fields */}
              {isMember && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">{t("update_detail.fistName")}</label>
                    <input
                      type="text"
                      placeholder={t("update_detail.placeholder")}
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">{t("update_detail.lastName")}</label>
                    <input
                      type="text"
                      placeholder={t("update_detail.placeholder")}
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </>
              )}
            </div>
            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button
                onClick={handleClose}
                className="mr-2 px-4 py-2 border border-gray-300 rounded text-gray-700"
              >
                {t("update_detail.cancel")}
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {t("update_detail.submit")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DetailUpdateBtn;
