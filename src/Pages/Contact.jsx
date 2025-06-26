import React from "react";
import "../Css/Contact.css";
import "../Css/HtmlBeautify.css";
import { useTranslation } from "react-i18next";
import { Container, Col, Row } from 'react-bootstrap';
import ContactForm from "../Components/ContactForm";
import PageTitle from "../Components/PageTitle";

const Contact = () => {

    const { t } = useTranslation();

    return (
        <div>
            <PageTitle pageTitle={t("Contact_title")} />
            <Container style={{ padding: '3rem' }}>
                <div className="html-content">
                    <Row className="align-items-start">
                        <Col md={7}>
                            <h5>{t("Contact_intro_title")}</h5>
                            <p>{t("Contact_intro_text")}</p>
                            <ContactForm />
                        </Col>
                        <Col className="contact-info-col">
                            <Row>
                                <div>
                                    <p><strong>{t("contact_individual_title")} &#9978;</strong></p>
                                    <p><strong>{t("contact_individual_subject")}</strong></p>
                                    
                                    <p><i className="bi bi-pin-angle"></i> &nbsp; {t("contact_individual_location")}</p>
                                    <p><i className="bi bi-telephone-inbound"></i> &nbsp; {t("contact_individual_land")}</p>
                                    <p><i className="bi bi-person"></i> &nbsp; {t("contact_individual_name")}</p>
                                    <p><i className="bi bi-telephone-inbound"></i> &nbsp; {t("contact_individual_phone")}</p>
                                    <p><i className="bi bi-person"></i> &nbsp; {t("contact_group_name")}</p>
                                    <p><i className="bi bi-telephone-inbound"></i> &nbsp; {t("contact_group_phone")}</p>
                                    <p><i className="bi bi-mailbox"></i> &nbsp; {t("contact_individual_email")}</p>
                                </div>
                            </Row>
                            <br />
                            <Row className="contact-info-row">
                                <div>
                                    <p><strong>{t("contact_group_title")} &#128188;</strong></p>
                                    <p><strong>{t("contact_group_subject")}</strong></p>
                                    
                                    <p><i className="bi bi-pin-angle"></i> &nbsp; {t("contact_group_location")}</p>
                                    <p><i className="bi bi-person"></i> &nbsp; {t("contact_group_name")}</p>
                                    <p><i className="bi bi-telephone-inbound"></i> &nbsp; {t("contact_group_phone")}</p>
                                    <p><i className="bi bi-mailbox"></i> &nbsp; {t("contact_group_email")}</p>
                                </div>
                            </Row>
                            <br />
                            <Row>
                                <div>
                                    <p><strong>{t("contact_real_estate_agent_title")} &#128100;</strong></p>
                                    <p><strong>{t("contact_real_estate_agent_subject")}</strong></p>
                                    
                                    <p><i className="bi bi-person"></i> &nbsp; Jacinta</p>
                                    <p><i className="bi bi-telephone-inbound"></i> &nbsp; +61 (04) 1361 6660</p>
                                    <p><i className="bi bi-mailbox"></i> &nbsp; pm1@ctcre.com.au</p>
                                </div>
                            </Row>
                            <br />
                            <Row>
                                <div>
                                    <p><strong>{t("contact_lawyer_title")} &#128100;</strong></p>
                                    <p><strong>{t("contact_lawyer_subject")}</strong></p>
                                    
                                    <p><i className="bi bi-pin-angle"></i> &nbsp; {t("contact_lawyer_location")}</p>
                                    <p><i className="bi bi-globe2"></i> &nbsp; https://www.rigbycooke.com.au/</p>                          
                                </div>
                            </Row>
                            <br />
                            <Row>
                                <div>
                                    <p><strong>{t("contact_member_trust")} &#127793;</strong></p>
                                    <p><i className="bi bi-telephone-inbound"></i> &nbsp; 1800 999 933</p>
                                    <p><i className="bi bi-globe2"></i> &nbsp; https://www.trustfornature.org.au/</p>
                                </div>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    );
};

export default Contact;