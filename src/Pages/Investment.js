import axios from "axios";
import React, { useState, useEffect } from "react";
import "../Css/Investment.css";
import { Container, Image } from 'react-bootstrap'
// import PageTitle from "../Components/PageTitle";
// import { useTranslation } from 'react-i18next';

const Investment = () => {
    // const { t } = useTranslation();
    const [investmentImages, setInvestmentImages] = useState([]);

    const CMS_endpoint = process.env.REACT_APP_CMS_ENDPOINT;
    const CMS_token = process.env.REACT_APP_CMS_TOKEN;

    useEffect(() => {
        const fetchInvestmentImgs = async () => {
            try {
                const response = await axios.get(`${CMS_endpoint}/api/media-images?filters[PageLocation][$eq]=investment&populate=Image`, {
                    headers: {
                        Authorization: `Bearer ${CMS_token}`,
                    },
                });

                // Check the data structure and safely retrieve the images
                const images = response.data.data[0].Image;
                if (images) {
                    setInvestmentImages(images);
                } else {
                    console.warn("No enough images are available.");
                }
            } catch (error) {
                console.error("Error loading:", error);
            }
        };

        fetchInvestmentImgs();
    }, [CMS_endpoint, CMS_token]);

    return (
        <Container>
            { /* ========= Commented for OLD version of this page ==========
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
             */ }
            {investmentImages.map((image) => (
                        <Image
                            src={`${CMS_endpoint}${image.url}`}
                            alt={`${image.url}`}
                            className="investment-instruction-img"
                            loading="lazy"
                        />
            ))}

        </Container>
    );
};

export default Investment;
