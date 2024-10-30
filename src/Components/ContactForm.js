import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import "../Css/Components.css";

const ContactForm = () => {
    const { t } = useTranslation();
    const mail_API_endpoint = 'https://mail-service.sapienplus.co/roseneathpark/contact';

    // State to hold form values
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        email: '',
        company: '',
        subject: '',
        question: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [responseMessage, setResponseMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // Handle form input change
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(mail_API_endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Name: formData.name,
                    PhoneNumber: formData.phoneNumber,
                    Email: formData.email,
                    Company: formData.company,
                    Subject: formData.subject,
                    Question: formData.question,
                }),
            });

            if (response.ok) {
                setResponseMessage('Your enquiry has been submitted successfully!');
                setIsSubmitting(false);
                setErrorMessage(null);
                setFormData({ name: '', phoneNumber: '', email: '', company: '', subject: '', question: '' });
            } else {
                setErrorMessage('There was a problem submitting your enquiry. Please try again later.');
                setIsSubmitting(false);
                setResponseMessage(null);
            }
        } catch (error) {
            setIsSubmitting(false);
            setErrorMessage('An error occurred. Please try again later.');
            setResponseMessage(null);
            console.error('Error:', error);
        }
    };

    return (
        <Container className="my-5" style={{ maxWidth: '1000px' }}>
            {/* Display success or error message */}
            {responseMessage && <Alert variant="success">{responseMessage}</Alert>}
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="name" className="mb-3">
                    <Form.Label>{t("contactForm_name")} *</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="phoneNumber" className="mb-3">
                    <Form.Label>{t("contactForm_phone")}</Form.Label>
                    <Form.Control
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="email" className="mb-3">
                    <Form.Label>{t("contactForm_email")} *</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="company" className="mb-3">
                    <Form.Label>{t("contactForm_company")}</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter your company name"
                        value={formData.company}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="subject" className="mb-3">
                    <Form.Label>{t("contactForm_subject")} *</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter the subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="question" className="mb-3">
                    <Form.Label>{t("contactForm_question")} *</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Enter your question"
                        value={formData.question}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit" className='submit-button'>
                    {isSubmitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        </>
                    ) : (
                        t("contactForm_submit")
                    )}
                </Button>
            </Form>
        </Container>
    );
};

export default ContactForm;
