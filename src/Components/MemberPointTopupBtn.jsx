import React, { useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
    PayPalScriptProvider,
    PayPalButtons,
} from "@paypal/react-paypal-js";
import { Fireworks } from '@fireworks-js/react'

const MemberPointTopupBtn = () => {
    const paypalId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    const endpoint = import.meta.env.VITE_CMS_ENDPOINT;
    const apiKey = import.meta.env.VITE_CMS_TOKEN;

    const [showModal, setShowModal] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(100);
    const [selectedBonus, setSelectedBonus] = useState(100);
    const [customAmount, setCustomAmount] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');
    const fireworksRef = useRef(null);

    const handleTopUpClick = () => {
        setShowModal(true);
        setSelectedAmount(100);
        setSelectedBonus(100);
        setCustomAmount('');
        setError('');
    };

    const handleSelect = (type) => {
        if (type === 'more') {
            setSelectedAmount(100);
            setSelectedBonus(100);
        } else if (type === 'jumbo') {
            setSelectedAmount(500);
            setSelectedBonus(500);
        } else if (type === 'custom') {
            if (/^\d{1,4}$/.test(customAmount)) {
                setSelectedAmount(Number(customAmount));
                setSelectedBonus(Number(customAmount));         // Assume the same bonus
            }
        }
    };
    const isCustomValid = /^\d{1,4}$/.test(customAmount) && Number(customAmount) > 0;

    const handleApprove = async () => {
        setError('');
        setShowModal(false);
        setIsUpdating(true);
        try {
            const searchRes = await axios.get(
                `${endpoint}/api/rhp-memberships?filters[Email][$eq]=${JSON.parse(Cookies.get('user')).email}`,
                { headers: { Authorization: `Bearer ${apiKey}` } }
            );
            const items = searchRes.data.data;
            if (!items || items.length === 0) {
                console.error('Email not registered.');
                setError('Email not registered.');
                setIsUpdating(false);
                return;
            }
            const userData = items[0];

            const NewPoint = userData.Point + selectedAmount;
            const NewDiscountPoint = userData.DiscountPoint + selectedBonus;

            //   // Uncomment if wish to refresh the exp date
            //   const now = new Date();
            //   const expiry = new Date(now);
            //   expiry.setFullYear(now.getFullYear() + 2);
            //   const expiryDate = expiry.toISOString().split('T')[0];

            // Update the Strapi entry
            await axios.put(
                `${endpoint}/api/rhp-memberships/${userData.documentId}`,
                {
                    data: {
                        Point: NewPoint,
                        DiscountPoint: NewDiscountPoint,
                        // ExpiryDate: expiryDate,   // Uncomment if wish to refresh the exp date
                    }
                },
                { headers: { Authorization: `Bearer ${apiKey}` } }
            );
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please try again.');
            setShowModal(true);
            setIsUpdating(false);
            return;
        }
        setShowSuccess(true);
        setTimeout(() => closeSuccess(), 3000);
        setIsUpdating(false);
    };

    const handleError = (err) => {
        console.error(err);
        setError('Payment failed. Please try again.');
    };

    // Close success modal then refresh page to let member center load new data
    const closeSuccess = () => {
        setShowSuccess(false);
        window.location.reload();
    };

    return (
        <>
            <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                onClick={handleTopUpClick}
            >
                Top Up &gt;&gt;
            </button>

            {isUpdating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
                        <p className='text-center'>处理中... / Processing...</p>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowModal(false)}
                        >
                            &times;
                        </button>

                        {/* Amount selection buttons */}
                        <div className="flex justify-between mb-4 space-x-4">
                            <button
                                className={`flex-1 h-24 border rounded-lg flex flex-col items-center justify-center ${selectedAmount === 100 ? '!border-blue-600' : ''
                                    }`}
                                onClick={() => handleSelect('more')}
                            >
                                <span>More</span>
                                <span className="font-bold">100 AUD</span>
                            </button>

                            <button
                                className={`flex-1 h-24 border rounded-lg flex flex-col items-center justify-center ${selectedAmount === 500 ? '!border-blue-600' : ''
                                    }`}
                                onClick={() => handleSelect('jumbo')}
                            >
                                <span>Jumbo</span>
                                <span className="font-bold">500 AUD</span>
                            </button>

                            <button
                                className={`flex-1 h-24 border rounded-lg flex flex-col items-center justify-center ${selectedAmount !== 100 && selectedAmount !== 500 ? '!border-blue-600' : ''
                                    } ${!isCustomValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!isCustomValid}
                                onClick={() => handleSelect('custom')}
                            >
                                <span>Custom</span>
                                <span>
                                    <input
                                        type="text"
                                        value={customAmount}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            if (/^\d{0,4}$/.test(v)) setCustomAmount(v);
                                        }}
                                        placeholder="___"
                                        className="w-1/4 text-center border-b border-gray-300 focus:outline-none"
                                    />
                                    <b> AUD</b>
                                </span>
                            </button>
                        </div>

                        <p className="text-center mb-4">
                            Current Selected Value:
                            <span className="font-semibold"> {selectedAmount}</span> AUD <b className='text-green-800'>+ {selectedBonus} Discount Points</b>
                        </p>

                        {/* Error messages */}
                        {error && <p className="text-red-600 mb-2">{error}</p>}

                        {/* PayPal buttons */}
                        <PayPalScriptProvider options={{ "client-id": paypalId, currency: "AUD" }}>
                            <PayPalButtons
                                style={{ layout: 'vertical' }}
                                createOrder={(data, actions) =>
                                    actions.order.create({
                                        purchase_units: [{
                                            amount: { value: selectedAmount.toFixed(2) }
                                        }]
                                    })
                                }
                                onApprove={(data, actions) =>
                                    actions.order.capture().then(handleApprove)
                                }
                                onError={handleError}
                            />
                        </PayPalScriptProvider>

                        {/* 
                        <button className='w-full' onClick={handleApprove} >
                            <b className='text-blue-600'>Assume that my payment is done</b>
                        </button> */}
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
                        <h3 className='!text-amber-600'> <i class="bi bi-stars"></i> Yay! <i class="bi bi-stars"></i> </h3>
                        <p className="mb-4">Your top-up is successful! Thank you.</p>
                    </div>
                    <Fireworks
                        className='!z-10'
                        ref={fireworksRef}
                        options={{ opacity: 0.5 }}
                        style={{
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            position: 'fixed',
                        }}
                    />
                </div>
            )}
        </>
    );
};

export default MemberPointTopupBtn;
