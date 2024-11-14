import React from "react";
import { Button, Col, Container, Image, Row } from "react-bootstrap";
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
            md={2}
            className='footer-logo-section d-flex flex-column align-items-center mb-3 mb-md-0'
          >
            <Image src='logo192.png' className='footer-logo' />
            <span className='footer-slogan-text'>
              In the Bush - By the Beach
            </span>
          </Col>
          <Col
            xs={12}
            md={4}
            className='footer-contact-info text-center text-md-left mb-3 mb-md-0'
          >
            <h5 className='footer-section-title'>Contact Us</h5>
            <p>Telephone: +61 (03) 5157-8298</p>
            <p>Email: info@roseneathholidaypark.au</p>
            <p>Address: 422 Woodpile Rd, Meerlieu VIC 3862, Australia</p>
          </Col>          
          <Col
            xs={12}
            md={4}
            className='footer-aboutus-info text-center text-md-left mb-3 mb-md-0'
          >
            <h5 className='footer-aboutus-title'>Roseneath Holiday Park Management Pty Ltd</h5>
            <p>ACN: 679 085 477 </p>
            <p>ABN: 52 679 085 477 </p>
            <p>Bank name: CBA </p>
            <p>BSB: 0630182 </p>
            <p>Account Number: 1177 8453 </p>
          </Col>
          <Col
            xs={12}
            md={2}
            className='footer-button-section d-flex justify-content-center justify-content-md-end align-items-center'
          >
            <Button className='footer-button' onClick={jumpToContact}>
              {t("get_in_touch")}
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Footer;
