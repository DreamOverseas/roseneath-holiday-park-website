import React, { useState } from 'react';
import { Form, Button, Container, Alert, Row, Col, Image } from 'react-bootstrap';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import "../Css/Components.css";

const RegisterForm = () => {  
    const { t } = useTranslation();

    // Read Env from file
    const CMS_endpoint = process.env.REACT_APP_CMS_ENDPOINT;
    const CMS_token = process.env.REACT_APP_CMS_TOKEN;

    // State to hold form values
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        phone: '',
        email: '',
        stayType: '',
        campsite: '',
        vin: '',
        orderNum: '',
        comments: ''
    });

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Validate Form Data
    const validateForm = () => {
        const newErrors = {};
        if (!formData.fname.trim()) newErrors.fname = 'First Name is required.';
        if (!formData.phone.trim()) newErrors.phone = 'Phone Number is required.';
        if (!formData.stayType) newErrors.stayType = 'Stay Type is required.';
        if (formData.stayType === 'Campsite' && !formData.vin.trim()) {
            newErrors.vin = 'VIN is required for Campsite stay type.';
        }
        if (!formData.orderNum.trim()) newErrors.phone = 'Order Number is required.';
        return newErrors;
    };

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length === 0) {
            try {
                const payload = {
                    data: {
                        FirstName: formData.fname,
                        LastName: formData.lname,
                        Email: formData.email,
                        PhoneNumber: formData.phone,
                        StayType: formData.stayType,
                        Campsite: formData.campsite,
                        VIN: formData.vin,
                        OrderNumber: formData.orderNum,
                        Comments: formData.comments.slice(0, 500),
                    },
                };

                const response = await axios.post(
                    `${CMS_endpoint}/api/rhp-register-infos`,
                    payload,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${CMS_token}`,
                        },
                    }
                );

                if (response.status === 200 || response.status === 201) {
                    setSuccess(true);
                    setFormData({
                        fname: '',
                        lname: '',
                        phone: '',
                        email: '',
                        stayType: '',
                        campsite: '',
                        vin: '',
                        orderNum: '',
                        comments: ''
                    });
                }
            } catch (error) {
                console.error('Error during submission:', error.response?.data || error.message);
            }
        } else {
            setErrors(validationErrors);
        }
        setIsSubmitting(false);
    };

    return (
        <Container className="my-5">
            <h1 className="mb-4">{t("regForm-title")}</h1>
            {success && <Alert variant="success">Registration successful!</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="formFirstName">
                                <Form.Label>{t("regForm-fname")}*</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fname"
                                    value={formData.fname}
                                    onChange={handleChange}
                                    isInvalid={!!errors.fname}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.fname}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="formLastName">
                                <Form.Label>{t("regForm-lname")}</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lname"
                                    value={formData.lname}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form.Group>

                <Row>
                    <Col>
                <Form.Group className="mb-3">
                    <Form.Label>{t("contactForm_phone")}*</Form.Label>
                    <Form.Control
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        isInvalid={!!errors.phone}
                    />
                    <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                </Form.Group>
                </Col>
                <Col>
                <Form.Group className="mb-3">
                    <Form.Label>{t("contactForm_email")}</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </Form.Group>
                </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label>{t("regForm-staytype")}*</Form.Label>
                    <Form.Control
                        as="select"
                        name="stayType"
                        value={formData.stayType}
                        onChange={handleChange}
                        isInvalid={!!errors.stayType}
                    >
                        <option value="">Select Stay Type...</option>
                        <option value="Campsite">Campsite (Camping Area)</option>
                        <option value="Big House">Big House</option>
                        <option value="Tent">Summer Tent</option>
                        <option value="Caravan">Caravan</option>
                        <option value="Cabin 2 Bedroom">2 Bedrooms' Cabin</option>
                        <option value="Cabin 3 Bedroom">3 Bedrooms' Cabin</option>
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">{errors.stayType}</Form.Control.Feedback>
                </Form.Group>

                {formData.stayType === 'Campsite' && (
                    <>
                        <Row>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t("regForm-campsite")}</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="campsite"
                                        value={formData.campsite}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Campsite...</option>
                                        <option value="Dear park">Dear park</option>
                                        <option value="Emu park">Emu park</option>
                                        <option value="Alpaca park">Alpaca park</option>
                                        <option value="Kangaroo park">Kangaroo park</option>
                                        <option value="Wombat park">Wombat park</option>
                                        <option value="Bush park">Bush park</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <div className="mb-4 text-center">
                                    <Image
                                        src={`/form_img/CampLoc-${formData.campsite}.png`}
                                        alt={`Selected: ${formData.campsite}`}
                                        fluid
                                    />
                                </div>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>{t("regForm-vin")}*</Form.Label>
                            <Form.Control
                                type="text"
                                name="vin"
                                value={formData.vin}
                                onChange={handleChange}
                                isInvalid={!!errors.vin}
                            />
                            <Form.Control.Feedback type="invalid">{errors.vin}</Form.Control.Feedback>
                        </Form.Group>
                    </>
                )}

                <Form.Group className="mb-3">
                    <Form.Label>{t("regForm-ordernum")}*</Form.Label>
                    <Form.Control
                        type="text"
                        name="orderNum"
                        value={formData.orderNum}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>{t("regForm-comments")}</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        name="comments"
                        maxLength={500}
                        value={formData.comments}
                        onChange={handleChange}
                    />
                    <div className="d-flex justify-content-end">
                    <Form.Text className="text-muted">
                      Maximum. 500 words
                    </Form.Text>
                  </div>
                </Form.Group>
                <p className='text-center'>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? t("submitting") : t("contactForm_submit")}
                    </Button>
                </p>
            </Form>
        </Container>
    );
};

export default RegisterForm;
