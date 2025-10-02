import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Alert, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const AnnualBooking = ({ cookies }) => {
    const { t } = useTranslation();
    const [checkin, setCheckin] = useState('');
    const [checkout, setCheckout] = useState('');
    const [siteNumber, setSiteNumber] = useState('');
    const [adultNumber, setAdultNumber] = useState(0);
    const [childNumber, setChildNumber] = useState(0);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [showBankDetails, setShowBankDetails] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const CMSEndpoint = import.meta.env.VITE_CMS_ENDPOINT;
    const CMSApiKey = import.meta.env.VITE_CMS_TOKEN;

    const extraItems = [
        { name: 'Horse', price: 20, basis: 'Per night' },
        { name: 'Motorbike', price: 20, basis: 'Per night' },
        { name: 'Pet fee (not for camp)', price: 50, basis: 'Per book' },
        { name: 'Leaf per Bag', price: 15, basis: 'Per book' },
        { name: 'Firewood', price: 23, basis: 'Per book' },
        { name: 'Stove Rental', price: 25, basis: 'Per book' },
        { name: 'Laundry', price: 10, basis: 'Per person' },
        { name: 'Dryer', price: 10, basis: 'Per person' },
        { name: 'Shower', price: 10, basis: 'Per person' },
        { name: 'Peking Duck Package', price: 300, basis: 'Per book' },
        { name: 'Roast Sunkling Pig', price: 1200, basis: 'Per book' },
        { name: 'Roast Sunkling Pig Package', price: 1600, basis: 'Per book' },
        { name: 'Whole Roast Lamb', price: 1000, basis: 'Per book' },
        { name: 'Whole Roast Lamb Package', price: 1600, basis: 'Per book' }
    ];

    const calculateNights = () => {
        if (!checkin || !checkout) return 0;
        const start = new Date(checkin);
        const end = new Date(checkout);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const calculateExtraPrice = (item, quantity) => {
        const nights = calculateNights();
        const totalPeople = parseInt(adultNumber) + parseInt(childNumber);
        
        if (item.basis === 'Per night') {
            return item.price * quantity * nights;
        } else if (item.basis === 'Per person') {
            return item.price * quantity * totalPeople;
        } else {
            return item.price * quantity;
        }
    };

    const calculateTotalExtrasPrice = () => {
        return selectedExtras.reduce((total, extra) => {
            return total + calculateExtraPrice(
                extraItems.find(item => item.name === extra.name),
                extra.quantity
            );
        }, 0);
    };

    const calculateTotalPrice = () => {
        return calculateTotalExtrasPrice();
    };

    const handleExtraQuantityChange = (itemName, quantity) => {
        const qty = parseInt(quantity) || 0;
        
        setSelectedExtras(prev => {
            const existing = prev.find(e => e.name === itemName);
            if (existing) {
                if (qty === 0) {
                    return prev.filter(e => e.name !== itemName);
                }
                return prev.map(e => 
                    e.name === itemName ? { ...e, quantity: qty } : e
                );
            } else if (qty > 0) {
                return [...prev, { name: itemName, quantity: qty }];
            }
            return prev;
        });
    };

    const getExtraQuantity = (itemName) => {
        const extra = selectedExtras.find(e => e.name === itemName);
        return extra ? extra.quantity : 0;
    };

    const handleViewBankDetails = (e) => {
        e.preventDefault();
        
        if (!checkin || !checkout || !siteNumber) {
            setError(t('annual_booking_fill_all_fields'));
            return;
        }

        if (new Date(checkout) <= new Date(checkin)) {
            setError(t('annual_booking_checkout_after_checkin'));
            return;
        }

        if (adultNumber < 0 || childNumber < 0) {
            setError('Please enter valid numbers for adults and children');
            return;
        }

        setError('');
        setShowBankDetails(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const extrasWithPrice = selectedExtras.map(extra => {
                const item = extraItems.find(i => i.name === extra.name);
                return {
                    Name: extra.name,
                    Number: extra.quantity,
                    Price: calculateExtraPrice(item, extra.quantity)
                };
            });

            const response = await fetch(`${CMSEndpoint}/api/annual-bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CMSApiKey}`
                },
                body: JSON.stringify({
                    data: {
                        checkin: checkin,
                        checkout: checkout,
                        siteNumber: siteNumber,
                        adultNumber: parseInt(adultNumber) || 0,
                        childNumber: parseInt(childNumber) || 0,
                        totalPrice: calculateTotalPrice(),
                        extra: extrasWithPrice
                    }
                })
            });

            if (response.ok) {
                setSuccess(t('annual_booking_success'));
                setCheckin('');
                setCheckout('');
                setSiteNumber('');
                setAdultNumber(0);
                setChildNumber(0);
                setSelectedExtras([]);
                setShowBankDetails(false);
            } else {
                const errorData = await response.json();
                setError(`${t('annual_booking_failed')}: ${errorData.error?.message || t('annual_booking_unknown_error')}`);
            }
        } catch (err) {
            setError(t('annual_booking_error_submitting'));
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow mb-4">
            <Card.Body>
                <h3 className="mb-4">{t('annual_booking_title')}</h3>
                
                {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

                <Form onSubmit={handleViewBankDetails}>
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>{t('annual_booking_checkin')}</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={checkin}
                                    onChange={(e) => setCheckin(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>{t('annual_booking_checkout')}</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={checkout}
                                    onChange={(e) => setCheckout(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>{t('annual_booking_site_number')}</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={t('annual_booking_site_placeholder')}
                                    value={siteNumber}
                                    onChange={(e) => setSiteNumber(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Number of Adults</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={adultNumber}
                                    onChange={(e) => setAdultNumber(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Number of Children</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={childNumber}
                                    onChange={(e) => setChildNumber(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="mb-4">
                        <h5 className="mb-3">Extra Items (Optional)</h5>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Price</th>
                                    <th>Pricing Basis</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {extraItems.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.name}</td>
                                        <td>${item.price}</td>
                                        <td>{item.basis}</td>
                                        <td style={{ width: '120px' }}>
                                            <Form.Control
                                                type="number"
                                                min="0"
                                                value={getExtraQuantity(item.name)}
                                                onChange={(e) => handleExtraQuantityChange(item.name, e.target.value)}
                                                size="sm"
                                            />
                                        </td>
                                        <td>
                                            ${getExtraQuantity(item.name) > 0 
                                                ? calculateExtraPrice(item, getExtraQuantity(item.name)).toFixed(2)
                                                : '0.00'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        
                        <div className="text-end">
                            <h5>Total Extras: ${calculateTotalExtrasPrice().toFixed(2)}</h5>
                            <h4>Total Price: ${calculateTotalPrice().toFixed(2)}</h4>
                        </div>
                    </div>

                    {!showBankDetails && (
                        <div className="d-flex justify-content-end">
                            <Button variant="primary" type="submit">
                                {t('annual_booking_view_bank_details')}
                            </Button>
                        </div>
                    )}
                </Form>

                {showBankDetails && (
                    <div className="mt-4">
                        <Alert variant="warning" className="mb-3">
                            <Alert.Heading>{t('annual_booking_important_notice')}</Alert.Heading>
                            <p className="mb-0">
                                {t('annual_booking_payment_reminder')} <strong>{siteNumber}</strong>
                            </p>
                        </Alert>

                        <Card className="bg-light">
                            <Card.Body>
                                <h5 className="mb-3">{t('annual_booking_bank_details_title')}</h5>
                                <Row>
                                    <Col md={6}>
                                        <p className="mb-2"><strong>{t('annual_booking_account_name')}:</strong> Roseneath Holiday Park Management Pty Ltd</p>
                                        <p className="mb-2"><strong>ACN:</strong> 679 085 477</p>
                                        <p className="mb-2"><strong>ABN:</strong> 52 679 085 477</p>
                                    </Col>
                                    <Col md={6}>
                                        <p className="mb-2"><strong>{t('annual_booking_bank_name')}:</strong> CBA</p>
                                        <p className="mb-2"><strong>BSB:</strong> 063 182</p>
                                        <p className="mb-2"><strong>{t('annual_booking_account_number')}:</strong> 1177 8453</p>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <div className="d-flex justify-content-end mt-3 gap-2">
                            <Button 
                                variant="secondary" 
                                onClick={() => setShowBankDetails(false)}
                                className="me-2"
                            >
                                {t('annual_booking_back')}
                            </Button>
                            <Button 
                                variant="success" 
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? t('annual_booking_submitting') : t('annual_booking_confirm')}
                            </Button>
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default AnnualBooking;