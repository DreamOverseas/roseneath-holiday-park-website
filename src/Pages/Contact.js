import React from "react";
import { Helmet } from "react-helmet";
import "../Css/Contact.css";
import { useTranslation } from "react-i18next";
import { Container, Col, Row } from 'react-bootstrap';
import ContactForm from "../Components/ContactForm";
import PageTitle from "../Components/PageTitle";

const Contact = () => {

    const { t } = useTranslation();

    return (
        <div>
            <Helmet>
            <title>Contact Us - Roseneath Holiday Park</title>
            <meta name="description" content="Contact Roseneath Holiday Park now and book your journey!" />
            <meta name="keywords" content="Holiday, Roseneath, Camp, Caravan, Wild, Nature, Exploration, Wellington, Lake, Beach, Accomadation, Food, Service, Course, Facility, Storage, Landscape" />
            </Helmet>
  
            <PageTitle pageTitle={t("Contact_title")} /> <br />
            <Container>
                <Row>
                    <Col md={8}>
                        <h5>{t("Contact_intro_title")}</h5>
                        {t("Contact_intro_text")}
                        <ContactForm />
                    </Col>
                    <Col className="contact-info-col">
                        <Row className="contact-info-row">
                            <p>
                                <b>Roseneath Holiday Park</b> &#9978;
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-pin-angle"></i> &nbsp;
                                422 Woodpile Rd, Meerlieu VIC 3862
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-person"></i> &nbsp;
                                Katrina Crossthwaite (English Only)
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-telephone-inbound"></i> &nbsp;
                                +61 (03) 5157-8298
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-mailbox"></i> &nbsp;
                                info@roseneathholidaypark.au
                            </p>
                        </Row>
                        <br />
                        <Row className="contact-info-row">
                            <p>
                                <b>Melbourne Office</b> &#128188;
                            </p>
                        </Row>
                        <Row className="contact-info-row">
                            <p>
                                <b>For Group Booking, Cooperation & Investment:</b>
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-pin-angle"></i> &nbsp;
                                Level 2, 171 La Trobe Street, Melbourne VIC 3000
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-person"></i> &nbsp;
                                John Du (English & Chinese)
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-telephone-inbound"></i> &nbsp;
                                +61 (04)13 168 533
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-mailbox"></i> &nbsp;
                                Corp@roseneathholidaypark.au
                            </p>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Contact;
