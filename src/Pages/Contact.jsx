import React from "react";
import "../Css/Contact.css";
import { useTranslation } from "react-i18next";
import { Container, Col, Row } from 'react-bootstrap';
import ContactForm from "../Components/ContactForm";
import PageTitle from "../Components/PageTitle";

const Contact = () => {

    const { t } = useTranslation();

    return (
        <div>
            <PageTitle pageTitle={t("Contact_title")} /> <br />
            <Container>
                <Row className="align-items-start">
                    <Col md={7}>
                        <h5>{t("Contact_intro_title")}</h5>
                        {t("Contact_intro_text")}
                        <ContactForm />
                    </Col>
                    <Col className="contact-info-col">
                        <Row>
                            <p>
                                <b>{t("contact_individual_title")}</b> &#9978;
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <b>{t("contact_individual_subject")}</b>
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
                        <br />
                        <Row>
                            <p>
                                <b>{t("contact_real_estate_agent_title")}</b> &#128100;
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <b>{t("contact_real_estate_agent_subject")}</b>
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-person"></i> &nbsp;
                                Toni
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-telephone-inbound"></i> &nbsp;
                                +61 (04) 1361 6660
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-mailbox"></i> &nbsp;
                                orbostpm@ctcre.com.au
                            </p>
                        </Row>
                        <br />
                        <Row>
                            <p>
                                <b>{t("contact_lawyer_title")}</b> &#128100;
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <b>{t("contact_lawyer_subject")}</b>
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-pin-angle"></i> &nbsp;
                                {t("contact_lawyer_location")}
                            </p>
                        </Row>
                        <Row>
                            <p>
                                <i class="bi bi-globe2"></i> &nbsp;
                                https://www.rigbycooke.com.au/
                            </p>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Contact;
