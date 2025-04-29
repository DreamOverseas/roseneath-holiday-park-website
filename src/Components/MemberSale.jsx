import React, { useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";
import { useTranslation } from "react-i18next";

const MembershipSale = () => {
  const { t } = useTranslation();
  const endpoint = import.meta.env.VITE_CMS_ENDPOINT;
  const apiKey = import.meta.env.VITE_CMS_TOKEN;
  const paypalId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  // UI states
  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email] = useState(JSON.parse(Cookies.get('user')).email || '');
  const [contact, setContact] = useState('');
  const [detailsError, setDetailsError] = useState('');
  const [detailsConfirmed, setDetailsConfirmed] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Open the modal
  const handleJoinClick = () => {
    setShowModal(true);
    // reset any previous state
    setFirstName('');
    setLastName('');
    setContact('');
    setDetailsError('');
    setPaymentError('');
    setDetailsConfirmed(false);
    setIsUpdating(false);
    setIsSuccess(false);
  };

  // Validate & lock form fields
  const handleConfirmDetails = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setDetailsError('Please fill in First Name, Last Name and Email.');
      return;
    }
    setDetailsError('');
    setDetailsConfirmed(true);
  };

  // After PayPal approves payment, update Strapi
  const handlePaymentSuccess = async (details, data) => {
    setPaymentError('');
    setIsUpdating(true);
    try {
      // 5.1) Find membership by email
      const searchRes = await axios.get(
        `${endpoint}/api/rhp-memberships?filters[email][$eq]=${encodeURIComponent(email)}`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      const items = searchRes.data.data;
      if (!items || items.length === 0) {
        console.error('Email not registered.');
        setPaymentError('Email not registered.');
        setIsUpdating(false);
        return;
      }
      const documentId = items[0].id;

      // Compute expiry date = today + 2 years, format YYYY-MM-DD
      const now = new Date();
      const expiry = new Date(now);
      expiry.setFullYear(now.getFullYear() + 2);
      const expiryDate = expiry.toISOString().split('T')[0];

      // Update the Strapi entry
      await axios.put(
        `${endpoint}/api/rhp-memberships/${documentId}`,
        {
          data: {
            MembershipNumber: "Issuing...",
            FirstName: firstName.trim(),
            LastName: lastName.trim(),
            Contact: contact.trim(),
            ExpiryDate: expiryDate,
            Point: 500,
            DiscountPoint: 500,
            IsMember: true
          }
        },
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );

      // Success!
      setIsSuccess(true);
      setIsUpdating(false);

      // Wait a moment to show message, then reload
      setTimeout(() => window.location.reload(), 3000);
    } catch (err) {
      console.error(err);
      setPaymentError('Something went wrong. Please try again.');
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-4">
        {t("membership_promotion_title")}
      </h2>

      <div className="flex flex-col md:flex-row items-center mb-6 gap-4">
        <p className="md:w-1/2 text-gray-700">
          {t("membership_promotion")}
        </p>
        <div className="md:w-1/2 h-auto bg-gray-100 flex items-center justify-center">
          <img src='/memberships/prom_f.jpg'
            alt='This image have departed to go to the RHP.'
            className="h-60 w-auto justify-center"
          />
        </div>
      </div>

      <div className="text-center mb-8">
        <button
          onClick={handleJoinClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded w-1/2"
        >
          {t("membership_join_btn")}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>

            {isUpdating ? (
              <div className="flex flex-col items-center">
                <div className="border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin mb-4" />
                <p>处理中... / Processing...</p>
              </div>
            ) : isSuccess ? (
              <p className="text-green-600 text-center">
                {t("membership_join_success")}
              </p>
            ) : (
              <>
                {/* Form */}
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block font-medium">{t("fname")}*</label>
                    <input
                      type="text"
                      className={`w-full border rounded px-3 py-2 ${detailsConfirmed ? 'bg-gray-100' : ''}`}
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      disabled={detailsConfirmed}
                    />
                  </div>

                  <div>
                    <label className="block font-medium">{t("lname")}*</label>
                    <input
                      type="text"
                      className={`w-full border rounded px-3 py-2 ${detailsConfirmed ? 'bg-gray-100' : ''}`}
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      disabled={detailsConfirmed}
                    />
                  </div>

                  <div>
                    <label className="block font-medium">{t("email")}*</label>
                    <input
                      type="email"
                      className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700"
                      value={email}
                      readOnly
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block font-medium">{t("membership_contact")}</label>
                    <input
                      type="tel"
                      className={`w-full border rounded px-3 py-2 ${detailsConfirmed ? 'bg-gray-100' : ''}`}
                      value={contact}
                      onChange={e => setContact(e.target.value)}
                      disabled={detailsConfirmed}
                    />
                  </div>

                  <p className="text-sm text-gray-500">
                    * These details can be changed later. / 个人信息随时可以调整
                  </p>
                </div>

                {detailsError && (
                  <p className="text-red-600 mb-2">{detailsError}</p>
                )}
                {paymentError && (
                  <p className="text-red-600 mb-2">{paymentError}</p>
                )}

                {/* Confirm or Pay */}
                {!detailsConfirmed ? (
                  <button
                    onClick={handleConfirmDetails}
                    className="w-full bg-blue-800 hover:bg-blue-700 text-white py-2 rounded-full"
                  >
                    {t("membership_comfirm")}
                  </button>
                ) : (
                  <>
                    <PayPalScriptProvider
                      options={{
                        "client-id": paypalId,
                        currency: "AUD",
                      }}
                    >
                      <PayPalButtons
                        style={{ layout: 'vertical' }}
                        createOrder={(data, actions) =>
                          actions.order.create({
                            purchase_units: [{
                              amount: { value: '500.00' }
                            }]
                          })
                        }
                        onApprove={(data, actions) =>
                          actions.order.capture().then(details => {
                            handlePaymentSuccess(details, data);
                          })
                        }
                        onError={(err) => {
                          console.error(err);
                          setPaymentError('Payment failed. Please try again.');
                        }}
                      />
                    </PayPalScriptProvider>

                    <div className='h-10'></div>
                    <button
                      onClick={handleConfirmDetails}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                    >
                      I assuming payment is successful.
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipSale;
