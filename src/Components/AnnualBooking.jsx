import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const AnnualBooking = ({ cookies }) => {
    const { t } = useTranslation();
    const [checkin, setCheckin] = useState('');
    const [checkout, setCheckout] = useState('');
    const [siteNumber, setSiteNumber] = useState('');
    const [showBankDetails, setShowBankDetails] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const CMSEndpoint = import.meta.env.VITE_CMS_ENDPOINT;
    const CMSApiKey = import.meta.env.VITE_CMS_TOKEN;

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

        setError('');
        setShowBankDetails(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
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
                        siteNumber: siteNumber
                    }
                })
            });

            if (response.ok) {
                setSuccess(t('annual_booking_success'));
                setCheckin('');
                setCheckout('');
                setSiteNumber('');
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

                    {!showBankDetails && (
                        <div className="flex justify-end">
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

                        <div className="flex justify-end mt-3 gap-2">
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
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default AnnualBooking;