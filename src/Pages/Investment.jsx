import axios from "axios";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import "../Css/Investment.css";
import { Container, Image } from 'react-bootstrap'
// import PageTitle from "../Components/PageTitle";
// import { useTranslation } from 'react-i18next';

const Investment = () => {
    // const { t } = useTranslation();
    const [investmentImages, setInvestmentImages] = useState([]);

    const CMS_endpoint = import.meta.env.VITE_CMS_ENDPOINT;
    const CMS_token = import.meta.env.VITE_CMS_TOKEN;

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
            <Helmet>
            <title>Investing - Roseneath Holiday Park</title>
            <meta name="description" content="Interest in investing the Roseneath Holiday Park near Lake Wellington? This is the right place for you to know more about our business!" />
            <meta name="keywords" content="Investment, Business, Holiday, Roseneath, Camp, Caravan, Nature, Wellington, Lake, Beach, Accomadation, Food, Service, Course, Facility, Storage, Landscape" />
            </Helmet>
  
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
