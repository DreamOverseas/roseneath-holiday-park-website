import React from "react";
import {Button, Col, Container, Image, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../Css/Footer.css";
import DoTermsAndConditions from "./DoTermsAndConditions";

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
              <Image src='logo192.png' className='footer-logo'/>
            </Row>
            <Row>
              <div className="flex justify-center items-center gap-2 mb-3">
                <a
                    href="https://space.bilibili.com/3546823025232653"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 text-gray-300"
                  >
                    <img src="/Icons/bilibili.png" alt="B站" className="w-6 h-6" />
                  </a>
                  <a
                    href="https://www.youtube.com/channel/UC3GSuPpt3tClvoFp0l_nkCg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 text-gray-300"
                  >
                    <img src="/Icons/youtube.png" alt="Youtube" className="w-6 h-6" />
                  </a>
                </div>
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
              <div>
                  <p><b>{t("contact_individual_title")}</b> &#9978;</p>
                  <p><b>{t("contact_individual_subject")}</b></p>
                  
                  <p><i className="bi bi-pin-angle"></i> &nbsp; {t("contact_individual_location")}</p>
                  {/* <p><i className="bi bi-telephone-inbound"></i> &nbsp; {t("contact_individual_land")}</p>
                  <p><i className="bi bi-person"></i> &nbsp; {t("contact_individual_name")}</p>
                  <p><i className="bi bi-telephone-inbound"></i> &nbsp; {t("contact_individual_phone")}</p> */}
                  <p><i className="bi bi-person"></i> &nbsp; {t("contact_group_name")}</p>
                  <p><i className="bi bi-telephone-inbound"></i> &nbsp; {t("contact_group_phone")}</p>
                  <p><i className="bi bi-mailbox"></i> &nbsp; {t("contact_individual_email")}</p>
              </div>
            </Row>
          </Col>
          <Col xs={12}
            md={3}
            className='footer-aboutus-info text-center text-md-left mb-3 mb-md-0'>
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
