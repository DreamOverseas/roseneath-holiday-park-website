import React from 'react';
import "../Css/Investment.css";
import { Container, Row, Col, Image, Button } from 'react-bootstrap'
import PageTitle from "../Components/PageTitle";
import { useTranslation } from 'react-i18next';

const Investment = () => {
    const { t } = useTranslation();
    return (
        <div>
            <PageTitle pageTitle={t("Investment")} /> <br />
            <section className="investment-list">
                <Container>
                    <Row className="smart-house">
                        <Col>
                            <Image className="smart-house-picture" src="/home/home_landscape.webp" />
                        </Col>
                        <Col className="smart-house-short-description">
                            <h2>小白营地半岛度假村</h2>
                            <p>Escape to a world of breathtaking landscapes where nature's beauty unfolds before your eyes. From serene mountain peaks to tranquil seaside sunsets, immerse yourself in the stunning vistas that refresh your soul and inspire your spirit. Experience the allure of nature like never before with Beautiful Scenery, where every view is a masterpiece.</p>
                            <div className="More-Details-btn"><Button>{t("More_Details")}</Button></div>
                        </Col>
                    </Row>
                </Container>
            </section>
            
        </div>
    );
};

export default Investment;