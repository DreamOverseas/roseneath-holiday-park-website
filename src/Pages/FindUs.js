import React from "react";
import "../Css/FindUs.css";
import {Container,Row,Col,Image} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock} from '@fortawesome/free-solid-svg-icons';
import PageTitle from "../Components/PageTitle";

const FindUs = () => {
    const { t } = useTranslation();
    // TODO

    return (
        <div>
            <PageTitle pageTitle={t("Find us")} /> <br />
            <section className="find-us-map">
                <iframe
                    title="Roseneath Holiday Park Location Map"
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d474013.57073654904!2d150.801209!3d-37.457687!3m2!1i1024!2i768!4f13.5!3m3!1m2!1s0x6b2f12fa55ba106b%3A0x97796bb5b7b2aa37!2sRoseneath%20Holiday%20Park!5e1!3m2!1sen!2sus!4v1730163420007!5m2!1sen!2sus"
                    width="100%"
                    height="700"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </section>
            <section>
                <Container className="find-us-info-container">
                    <Row className="find-us-info">
                        <Col>
                            <Image className="find-us-picture" src="/find_us/map.webp" fluid/>
                        </Col>
                        <Col className="d-flex align-items-center">
                            <div>
                                <p>The quickest way to get to us from Melbourne is to travel along Princes Hwy A1 till you get to Sale.  Turn left at the roundabout and stay on Princes Hwy (York St) till you get to Bengworden Road C106, where you turn right. follow Bengworden Rd all the way to the end and turn right. You then turn right onto Hollands Landing Road. Continue till you get to 422 Woodpile Road Meerlieu.</p>
                                <Row>
                                    <p>
                                    <FontAwesomeIcon icon={faClock} />{' '}
                                    <strong>{t("time")}:</strong>&nbsp;{"Monday - Friday 8:30 a.m. - 4:00 p.m."}
                                    </p>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default FindUs;
