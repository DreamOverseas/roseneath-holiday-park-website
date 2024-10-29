import React from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import "../Css/Components.css";

const ContactForm = () => {
    return (
        <Container className="my-5" style={{ maxWidth: '1000px' }}>
            <Form>
                <Form.Group controlId="formName" className="mb-3">
                    <Form.Label>Name *</Form.Label>
                    <Form.Control type="text" placeholder="Enter your name" required />
                </Form.Group>

                <Form.Group controlId="formPhoneNumber" className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control type="tel" placeholder="Enter your phone number" />
                </Form.Group>

                <Form.Group controlId="formEmail" className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control type="email" placeholder="Enter your email" required />
                </Form.Group>

                <Form.Group controlId="formCompany" className="mb-3">
                    <Form.Label>Company</Form.Label>
                    <Form.Control type="text" placeholder="Enter your company name" />
                </Form.Group>

                <Form.Group controlId="formSubject" className="mb-3">
                    <Form.Label>Subject *</Form.Label>
                    <Form.Control type="text" placeholder="Enter the subject" required />
                </Form.Group>

                <Form.Group controlId="formQuestion" className="mb-3">
                    <Form.Label>Question *</Form.Label>
                    <Form.Control as="textarea" rows={3} placeholder="Enter your question" required />
                </Form.Group>

                <Button variant="primary" type="submit" className='submit-button'>
                    Submit
                </Button>
            </Form>
        </Container>
    );
};

export default ContactForm;
