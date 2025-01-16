import React from "react";
import {Button, Col, Container, Image, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../Css/Footer.css";

const Footer = () => {

  const navigate = useNavigate();
  const { t } = useTranslation();

  const jumpToContact = () => {
    navigate("/contact-us");
  };

  return (
    <div className='footer-body'>
      <Container>
        <Row className='footer-content'>
          <Col
            xs={12}
            md={3}
            className='footer-logo-section d-flex flex-column align-items-center mb-3 mb-md-0'
          >
            <Row>
              <Image src='logo192.png' className='footer-logo' style={{ width: "150px", height: "auto" }}/>
            </Row>
            <Row>
              <span className='footer-slogan-text'>
                {t("footer_slogan")}
              </span>
            </Row>
            <Row
              className='footer-button-section d-flex justify-content-center justify-content-md-end align-items-center'
            >
              <div><b>A member of 1club,</b> <a href="https://1club.world/">https://1club.world/</a></div>
            </Row>
            <Row>
              <Button className='footer-button' onClick={jumpToContact}>
                {t("get_in_touch")}
              </Button>
            </Row>
          </Col>
          <Col xs={12}
            md={3}
            className='footer-aboutus-info text-center text-md-left mb-3 mb-md-0'>
            <Row className="contact-info-row">
                <p>
                    <b>{t("contact_individual_title")}</b> &#9978;
                </p>
            </Row>
            <Row className="contact-info-row">
                <p>
                    <i class="bi bi-pin-angle"></i> &nbsp;
                    {t("contact_individual_location")}
                </p>
            </Row>
            <Row className="contact-info-row">
                <p>
                    <i class="bi bi-person"></i> &nbsp;
                    {t("contact_individual_name")}
                </p>
            </Row>
            <Row className="contact-info-row">
                <p>
                    <i class="bi bi-telephone-inbound"></i> &nbsp;
                    {t("contact_individual_phone")}
                </p>
            </Row>
            <Row className="contact-info-row">
                <p>
                    <i class="bi bi-mailbox"></i> &nbsp;
                    {t("contact_individual_email")}
                </p>
            </Row>
          </Col>
          <Col xs={12}
            md={3}
            className='footer-aboutus-info text-center text-md-left mb-3 mb-md-0'>
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
            <Row className="contact-info-row">
                <p>
                    <i class="bi bi-pin-angle"></i> &nbsp;
                    {t("contact_group_location")}
                </p>
            </Row>
            <Row className="contact-info-row">
                <p>
                    <i class="bi bi-person"></i> &nbsp;
                    {t("contact_group_name")}
                </p>
            </Row>
            <Row className="contact-info-row">
                <p>
                    <i class="bi bi-telephone-inbound"></i> &nbsp;
                    {t("contact_group_phone")}
                </p>
            </Row>
            <Row className="contact-info-row">
                <p>
                    <i class="bi bi-mailbox"></i> &nbsp;
                    {t("contact_group_email")}
                </p>
            </Row>
          </Col>        
          <Col
            xs={12}
            md={3}
            className='footer-aboutus-info text-center text-md-left mb-3 mb-md-0'
          >
            <h5 className='footer-aboutus-title'>Roseneath Holiday Park Management Pty Ltd</h5>
            <p>ACN: 679 085 477 </p>
            <p>ABN: 52 679 085 477 </p>
            <p>Bank name: CBA </p>
            <p>BSB: 063 182 </p>
            <p>Account Number: 1177 8453 </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Footer;
