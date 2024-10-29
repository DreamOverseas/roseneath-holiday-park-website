import React from "react";
import "../Css/Contact.css";
import { Container, Col, Row } from 'react-bootstrap';
import ContactForm from "../Components/ContactForm";
import PageTitle from "../Components/PageTitle";

const Contact = () => {

    return (
        <div>
            <PageTitle page_title="Contact Us" />
            <Container>
                <Row>
                    <Col md={8}>
                        <h5>Contact us about anything related to our company or services.</h5>
                        We'll do our best to get back to you as soon as possible.
                        <ContactForm />
                    </Col>
                    <Col>
                        <Row>
                            <b>Roseneath Caravan Park</b>
                        </Row>
                        <Row>
                            <i class="bi bi-pin-angle"></i>
                            422 Woodpile Rd, Meerlieu VIC 3862
                        </Row>
                        <Row>
                            <i class="bi bi-telephone-inbound"></i>
                            +61 (03) 5157-8298
                        </Row>
                        <Row>
                            <i class="bi bi-mailbox"></i>
                            kinzhuo0212@gmail.com
                        </Row>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Contact;
