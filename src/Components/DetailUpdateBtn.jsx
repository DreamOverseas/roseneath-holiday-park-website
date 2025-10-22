import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import '../Css/Tailwind.css';

// Environment variables for Strapi CMS
const CMS_endpoint = import.meta.env.VITE_CMS_ENDPOINT;
const CMS_token = import.meta.env.VITE_CMS_TOKEN;

const DetailUpdateBtn = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [documentID, setDocumentID] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdUpdating, setPwdUpdating] = useState(false);

  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [firstName2, setFirstName2] = useState('');
  const [lastName2, setLastName2] = useState('');
  const [email2, setEmail2] = useState('');
  const [contact2, setContact2] = useState('');

  const { t } = useTranslation();

  const [error, setError] = useState('');

  /**
   * Opens the modal: fetches user data by email, sets isMember, documentID, then shows modal
   */
  const handleOpen = async () => {
    console.log("Starting a update detail session.");
    if (showPwdModal) setShowPwdModal(false);
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

  const handlePwdOpen = async () => {
    console.log("Starting a Password updating session");
    if (showModal) setShowModal(false);
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
        setShowPwdModal(true);
        setPwdUpdating(false);
      } else {
        console.error(`Such user ${email} is not found or missing in backend.`);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  }

  // Password change submission handler
  const handleSubmitPwd = async () => {
    setError('');
    if (pwdUpdating) return;
    setPwdUpdating(true);

    // Read user cookie and parse JSON
    const userCookie = Cookies.get('user');
    if (!userCookie) {
      console.error('No user cookie found');
      setPwdUpdating(false);
      return;
    }
    const { email } = JSON.parse(userCookie);

    // Validate password match
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      setPwdUpdating(false);
      return;
    }

    // Validate old password with backend
    try {
      const userCookie = Cookies.get('user');
      if (!userCookie) {
        setError('User not authenticated.');
        return;
      }

      const verifyRes = await fetch(`${CMS_endpoint}/api/rhp-memberships/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${CMS_token}`
        },
        body: JSON.stringify({
          email: email,
          password: oldPassword
        })
      });

      if (!verifyRes.ok) {
        setError('Old password is incorrect.');
        return;
      }

      // Submit new password
      const updateRes = await fetch(`${CMS_endpoint}/api/rhp-memberships/${documentID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${CMS_token}`
        },
        body: JSON.stringify({
          data: {
            Password: newPassword
          }
        })
      });

      if (updateRes.ok) {
        handleClose(); // close modal and reset fields
        alert('Password updated successfully!');
      } else {
        setError('Failed to update password. Please try again.');
      }
    } catch (err) {
      console.error('Password update error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setPwdUpdating(false);
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
    setEmail('');
    setContact('');
    setAddress('');
    setFirstName2('');
    setLastName2('');
    setEmail2('');
    setContact2('');
  };

  /**
   * Submits updated fields to Strapi: checks at least one change, builds payload,
   * sends PUT request, and on success reloads the page
   */
  const handleSubmit = async () => {
    setError('');
    // Ensure at least one field has been changed
    if (!userName && !firstName && !lastName && !email && !contact && !address && 
        !firstName2 && !lastName2 && !email2 && !contact2) {
      setError('Please update at least one field.');
      return;
    }

    // Build update payload with only changed fields
    const payload = {};
    if (userName) payload.UserName = userName;
    if (firstName) payload.FirstName = firstName;
    if (lastName) payload.LastName = lastName;
    if (email) payload.Email = email;
    if (contact) payload.Contact = contact;
    if (address) payload.Address = address;
    if (firstName2) payload.FirstName2 = firstName2;
    if (lastName2) payload.LastName2 = lastName2;
    if (email2) payload.Email2 = email2;
    if (contact2) payload.Contact2 = contact2;

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
          ...(email ? { email: email } : {}),
          ...(contact ? { contact: contact } : {}),
          ...(address ? { address: address } : {}),
          ...(firstName2 ? { fname2: firstName2 } : {}),
          ...(lastName2 ? { lname2: lastName2 } : {}),
          ...(email2 ? { email2: email2 } : {}),
          ...(contact2 ? { contact2: contact2 } : {}),
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
        className="text-2xl text-white bg-blue-500 hover:bg-blue-700 !rounded-l-md px-2 py-1 w-1/2"
      >
        {t("update_detail")} &gt;
      </button>
      <button
        onClick={handlePwdOpen}
        className="text-2xl text-white bg-fuchsia-600 hover:bg-fuchsia-700 !rounded-r-md px-2 py-1 w-1/2"
      >
        {t("update_pwd")} &gt;
      </button>

      {/* Modal overlay and content */}
      {showModal && (
        <div className="!fixed inset-0 bg-black/50 flex !items-center !justify-center !z-50">
          <div className="!bg-white !rounded-lg shadow-lg !w-full max-w-2xl !mx-4 max-h-[90vh] overflow-y-auto">
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
                <label className="block text-sm font-medium mb-1">{t("update_detail.email")}</label>
                <input
                  type="email"
                  placeholder={t("update_detail.placeholder")}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">{t("update_detail.address")}</label>
                    <textarea
                      placeholder={t("update_detail.placeholder")}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      rows="3"
                    />
                  </div>

                  {/* Second Person Information */}
                  <hr className="my-4" />
                  <h5 className="text-md font-semibold mb-3">{t("update_detail.second_person")}</h5>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">{t("update_detail.firstName2")}</label>
                    <input
                      type="text"
                      placeholder={t("update_detail.placeholder")}
                      value={firstName2}
                      onChange={e => setFirstName2(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">{t("update_detail.lastName2")}</label>
                    <input
                      type="text"
                      placeholder={t("update_detail.placeholder")}
                      value={lastName2}
                      onChange={e => setLastName2(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">{t("update_detail.email2")}</label>
                    <input
                      type="email"
                      placeholder={t("update_detail.placeholder")}
                      value={email2}
                      onChange={e => setEmail2(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">{t("update_detail.contact2")}</label>
                    <input
                      type="text"
                      placeholder={t("update_detail.placeholder")}
                      value={contact2}
                      onChange={e => setContact2(e.target.value)}
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
      {showPwdModal && (
        <div className="!fixed inset-0 bg-black/50 flex !items-center !justify-center !z-50">
          <div className="!bg-white !rounded-lg shadow-lg !w-full max-w-md !mx-4">
            {/* Title */}
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{t("update_pwd")}</h2>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

              {/* Old Password */}
              <div className="mb-4 relative">
                <label className="block text-sm font-medium mb-1">{t("update_pwd.old")}</label>
                <input
                  type={showOld ? "text" : "password"}
                  placeholder={t("update_detail.placeholder")}
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-500"
                  onClick={() => setShowOld(!showOld)}
                >
                  <i className={`bi ${showOld ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>

              {/* New Password */}
              <div className="mb-4 relative">
                <label className="block text-sm font-medium mb-1">{t("update_pwd.new")}</label>
                <input
                  type={showNew ? "text" : "password"}
                  placeholder={t("update_detail.placeholder")}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-500"
                  onClick={() => setShowNew(!showNew)}
                >
                  <i className={`bi ${showNew ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>

              {/* Confirm Password */}
              <div className="mb-4 relative">
                <label className="block text-sm font-medium mb-1">{t("update_pwd.confirm")}</label>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder={t("update_detail.placeholder")}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-500"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPwdModal(false);
                  setError('');
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="mr-2 px-4 py-2 border border-gray-300 rounded text-gray-700"
              >
                {t("update_detail.cancel")}
              </button>
              <button
                onClick={handleSubmitPwd}
                className="px-4 py-2 bg-fuchsia-600 text-white rounded"
              >
                {pwdUpdating ? t("loading") : t("update_detail.submit")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DetailUpdateBtn;