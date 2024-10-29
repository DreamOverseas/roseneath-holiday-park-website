import React from "react";
import "../Css/Contact.css";
import { Container, Col, Row } from 'react-bootstrap';
import ContactForm from "../Components/ContactForm";

const Contact = () => {

    // TODO

    return (
        <div>
            <h5>Contact us about anything related to our company or services.</h5>
            <p>We'll do our best to get back to you as soon as possible.</p>
            <ContactForm />
        </div>
    );
};

export default Contact;
