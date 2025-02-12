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
                                <b>{t("contact_individual_title")}</b> &#9978;
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-pin-angle"></i> &nbsp;
                                {t("contact_individual_location")}
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-person"></i> &nbsp;
                                {t("contact_individual_name")}
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-telephone-inbound"></i> &nbsp;
                                {t("contact_individual_phone")}
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-mailbox"></i> &nbsp;
                                {t("contact_individual_email")}
                            </p>
                        </Row>
                        <br />
                        <Row className="contact-info-row">
                            <p>
                                <b>{t("contact_group_title")}</b> &#128188;
                            </p>
                        </Row>
                        <Row className="contact-info-row">
                            <p>
                                <b>{t("contact_group_subject")}</b>
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-pin-angle"></i> &nbsp;
                                {t("contact_group_location")}
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-person"></i> &nbsp;
                                {t("contact_group_name")}
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-telephone-inbound"></i> &nbsp;
                                {t("contact_group_phone")}
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-mailbox"></i> &nbsp;
                                {t("contact_group_email")}
                            </p>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Contact;
