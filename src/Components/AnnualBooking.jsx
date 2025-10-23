import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Alert, Table, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const AnnualBooking = ({ userType }) => {
    const { t } = useTranslation();
    const [checkin, setCheckin] = useState('');
    const [checkout, setCheckout] = useState('');
    const [siteNumber, setSiteNumber] = useState('');
    const [adultNumber, setAdultNumber] = useState(0);
    const [childNumber, setChildNumber] = useState(0);
    const [registrationNumbers, setRegistrationNumbers] = useState(['']); // New state for vehicle registrations
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [showBankDetails, setShowBankDetails] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const CMSEndpoint = import.meta.env.VITE_CMS_ENDPOINT;
    const CMSApiKey = import.meta.env.VITE_CMS_TOKEN;

    const ADULT_PRICE_PER_NIGHT = userType == "Permanent" ? 0 : 14;
    const CHILD_PRICE_PER_NIGHT = userType == "Permanent" ? 0 : 7;

    const extraItems = [
        { name: 'extra_horse', price: 20, basis: 'Per night' },
        { name: 'extra_motorbike', price: 20, basis: 'Per night' },
        { name: 'extra_firewood', price: 25, basis: 'Per book' },
    ];

    // Handler to add a new registration number field
    const handleAddRegistration = () => {
        setRegistrationNumbers([...registrationNumbers, '']);
    };

    // Handler to remove a registration number field
    const handleRemoveRegistration = (index) => {
        if (registrationNumbers.length > 1) {
            const newRegistrations = registrationNumbers.filter((_, i) => i !== index);
            setRegistrationNumbers(newRegistrations);
        }
    };

    // Handler to update a specific registration number
    const handleRegistrationChange = (index, value) => {
        const newRegistrations = [...registrationNumbers];
        newRegistrations[index] = value.toUpperCase(); // Convert to uppercase for consistency
        setRegistrationNumbers(newRegistrations);
    };

    const calculateNights = () => {
        if (!checkin || !checkout) return 0;
        const start = new Date(checkin);
        const end = new Date(checkout);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const calculateAccommodationPrice = () => {
        const nights = calculateNights();
        const adults = parseInt(adultNumber) || 0;
        const children = parseInt(childNumber) || 0;
        return (adults * ADULT_PRICE_PER_NIGHT + children * CHILD_PRICE_PER_NIGHT) * nights;
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
        return calculateAccommodationPrice() + calculateTotalExtrasPrice();
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
            setError(t('annual_booking_invalid_numbers'));
            return;
        }

        if (parseInt(adultNumber) === 0 && parseInt(childNumber) === 0) {
            setError(t('annual_booking_need_guests'));
            return;
        }

        // Check if at least one registration number is provided
        const hasValidRegistration = registrationNumbers.some(reg => reg.trim() !== '');
        if (!hasValidRegistration) {
            setError(t('annual_booking_need_registration') || 'Please enter at least one vehicle registration number');
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
                    Name: t(extra.name),
                    Number: extra.quantity,
                    Price: calculateExtraPrice(item, extra.quantity)
                };
            });

            // Filter out empty registration numbers
            const validRegistrations = registrationNumbers
                .filter(reg => reg.trim() !== '')
                .map(reg => ({ RegistrationNumber: reg.trim() }));

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
                        extra: extrasWithPrice,
                        RegistrationNumber: validRegistrations // Add registration numbers
                    }
                })
            });

            if (response.ok) {
                setSuccess(t('annual_booking_success'));
                setShowBankDetails(false);
                setShowSuccessModal(true);
                setCheckin('');
                setCheckout('');
                setSiteNumber('');
                setAdultNumber(0);
                setChildNumber(0);
                setRegistrationNumbers(['']); // Reset registration numbers
                setSelectedExtras([]);
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

    const nights = calculateNights();

    return (
        <Card className="shadow mb-4">
            <Card.Body>
                <h3 className="mb-4">{t('annual_booking_title')}</h3>
                
                {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

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

                    {/* Vehicle Registration Numbers Section */}
                    <div className="mb-3">
                        <Form.Label className="fw-bold">
                            {t('annual_booking_registration_numbers') || 'Vehicle Registration Number(s)'}
                        </Form.Label>
                        {registrationNumbers.map((registration, index) => (
                            <Row key={index} className="mb-2 align-items-center">
                                <Col md={10}>
                                    <Form.Control
                                        type="text"
                                        placeholder={t('annual_booking_registration_placeholder') || 'Enter registration number (e.g., ABC123)'}
                                        value={registration}
                                        onChange={(e) => handleRegistrationChange(index, e.target.value)}
                                        required={index === 0}
                                    />
                                </Col>
                                <Col md={2} className="d-flex gap-2">
                                    {index === registrationNumbers.length - 1 && (
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={handleAddRegistration}
                                            title={t('annual_booking_add_registration') || 'Add another vehicle'}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                            </svg>
                                        </Button>
                                    )}
                                    {registrationNumbers.length > 1 && (
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleRemoveRegistration(index)}
                                            title={t('annual_booking_remove_registration') || 'Remove vehicle'}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                                            </svg>
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                        ))}
                        <Form.Text className="text-muted">
                            {t('annual_booking_registration_help') || 'Add all vehicle registration numbers that will be parked at your site'}
                        </Form.Text>
                    </div>

                    {nights > 0 && (
                        <Alert variant="info" className="mb-3">
                            <strong>{t('annual_booking_duration')}:</strong> {nights} {nights === 1 ? t('annual_booking_night') : t('annual_booking_nights')}
                        </Alert>
                    )}

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>
                                    {t('annual_booking_adult_number')} (${ADULT_PRICE_PER_NIGHT} {t('annual_booking_per_night')})
                                </Form.Label>
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
                                <Form.Label>
                                    {t('annual_booking_child_number')} (${CHILD_PRICE_PER_NIGHT} {t('annual_booking_per_night')})
                                </Form.Label>
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

                    {(parseInt(adultNumber) > 0 || parseInt(childNumber) > 0) && nights > 0 && (
                        <Alert variant="success" className="mb-3">
                            <strong>{t('annual_booking_accommodation_cost')}:</strong> ${calculateAccommodationPrice().toFixed(2)}
                            <div className="mt-1 small">
                                {parseInt(adultNumber) > 0 && (
                                    <div>{adultNumber} {parseInt(adultNumber) === 1 ? t('annual_booking_adult') : t('annual_booking_adults')} × ${ADULT_PRICE_PER_NIGHT} × {nights} {nights === 1 ? t('annual_booking_night') : t('annual_booking_nights')} = ${(parseInt(adultNumber) * ADULT_PRICE_PER_NIGHT * nights).toFixed(2)}</div>
                                )}
                                {parseInt(childNumber) > 0 && (
                                    <div>{childNumber} {parseInt(childNumber) === 1 ? t('annual_booking_child') : t('annual_booking_children')} × ${CHILD_PRICE_PER_NIGHT} × {nights} {nights === 1 ? t('annual_booking_night') : t('annual_booking_nights')} = ${(parseInt(childNumber) * CHILD_PRICE_PER_NIGHT * nights).toFixed(2)}</div>
                                )}
                            </div>
                        </Alert>
                    )}

                    <div className="mb-4">
                        <h5 className="mb-3">{t('annual_booking_extra_items')}</h5>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>{t('annual_booking_item')}</th>
                                    <th>{t('annual_booking_price')}</th>
                                    <th>{t('annual_booking_pricing_basis')}</th>
                                    <th>{t('annual_booking_quantity')}</th>
                                    <th>{t('annual_booking_subtotal')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {extraItems.map((item, index) => (
                                    <tr key={index}>
                                        <td>{t(item.name)}</td>
                                        <td>${item.price}</td>
                                        <td>{t(`annual_booking_basis_${item.basis.toLowerCase().replace(/ /g, '_')}`)}</td>
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
                            <h5>{t('annual_booking_total_extras')}: ${calculateTotalExtrasPrice().toFixed(2)}</h5>
                            <h4 className="text-primary">{t('annual_booking_total_price')}: ${calculateTotalPrice().toFixed(2)}</h4>
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

                {/* Bank Details Modal */}
                <Modal show={showBankDetails} onHide={() => setShowBankDetails(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>{t('annual_booking_bank_details_title')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Alert variant="info" className="mb-3">
                            <Alert.Heading>{t('annual_booking_booking_recorded')}</Alert.Heading>
                            <p className="mb-2">{t('annual_booking_record_message')}</p>
                            <p className="mb-0">
                                <strong>{t('annual_booking_payment_verification')}:</strong> {t('annual_booking_verification_message')}
                            </p>
                        </Alert>

                        <Alert variant="warning" className="mb-3">
                            <Alert.Heading>{t('annual_booking_important_notice')}</Alert.Heading>
                            <p className="mb-0">
                                {t('annual_booking_payment_reminder')} <strong>{siteNumber}</strong>
                            </p>
                        </Alert>

                        <Card className="bg-light mb-3">
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
                                <Row className="mt-3">
                                    <Col>
                                        <Alert variant="warning" className="mb-0">
                                            <strong>{t('annual_booking_total_amount_due')}:</strong> ${calculateTotalPrice().toFixed(2)}
                                        </Alert>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowBankDetails(false)}
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
                    </Modal.Footer>
                </Modal>

                {/* Success Modal */}
                <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
                    <Modal.Header closeButton className="bg-success text-white">
                        <Modal.Title>{t('annual_booking_success_title')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="text-center py-3">
                            <div className="mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-check-circle text-success" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                                </svg>
                            </div>
                            <h5 className="mb-3">{t('annual_booking_success')}</h5>
                            <p className="text-muted">{t('annual_booking_success_message')}</p>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
                            {t('annual_booking_close')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Card.Body>
        </Card>
    );
};

export default AnnualBooking;