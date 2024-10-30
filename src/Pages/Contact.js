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
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Contact;
