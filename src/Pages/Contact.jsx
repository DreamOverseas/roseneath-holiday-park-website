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
                            <div>
                                <p><b>{t("contact_individual_title")}</b> &#9978;</p>
                                <p><b>{t("contact_individual_subject")}</b></p>
                                
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
                                <p><b>{t("contact_group_title")}</b> &#128188;</p>
                                <p><b>{t("contact_group_subject")}</b></p>
                                
                                <p><i className="bi bi-pin-angle"></i> &nbsp; {t("contact_group_location")}</p>
                                <p><i className="bi bi-person"></i> &nbsp; {t("contact_group_name")}</p>
                                <p><i className="bi bi-telephone-inbound"></i> &nbsp; {t("contact_group_phone")}</p>
                                <p><i className="bi bi-mailbox"></i> &nbsp; {t("contact_group_email")}</p>
                            </div>
                        </Row>
                        <br />
                        <Row>
                            <div>
                                <p><b>{t("contact_real_estate_agent_title")}</b> &#128100;</p>
                                <p><b>{t("contact_real_estate_agent_subject")}</b></p>
                                
                                <p><i className="bi bi-person"></i> &nbsp; Jacinta</p>
                                <p><i className="bi bi-telephone-inbound"></i> &nbsp; +61 (04) 1361 6660</p>
                                <p><i className="bi bi-mailbox"></i> &nbsp; pm1@ctcre.com.au</p>
                            </div>
                        </Row>
                        <br />
                        <Row>
                            <div>
                                <p><b>{t("contact_lawyer_title")}</b> &#128100;</p>
                                <p><b>{t("contact_lawyer_subject")}</b></p>
                                
                                <p><i className="bi bi-pin-angle"></i> &nbsp; {t("contact_lawyer_location")}</p>
                                <p><i className="bi bi-globe2"></i> &nbsp; https://www.rigbycooke.com.au/</p>                          
                            </div>
                        </Row>
                        <br />
                        <Row>
                            <div>
                                <p><b>{t("contact_member_trust")}</b> &#127793;</p>
                                <p><i className="bi bi-telephone-inbound"></i> &nbsp; 1800 999 933</p>
                                <p><i className="bi bi-globe2"></i> &nbsp; https://www.trustfornature.org.au/</p>
                            </div>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Contact;
