import axios from "axios";
import React, { useState, useEffect } from "react";
import "../Css/Investment.css";
import { Container, Image } from 'react-bootstrap';
import { useTranslation } from "react-i18next";
// import PageTitle from "../Components/PageTitle";
// import { useTranslation } from 'react-i18next';

const EcoAndCultureTours = () => {

    const { i18n } = useTranslation();

    const [ecoAndCultureToursImages, setEcoAndCultureToursImages] = useState([]);

    const CMS_endpoint = import.meta.env.VITE_CMS_ENDPOINT;
    const CMS_token = import.meta.env.VITE_CMS_TOKEN;

    useEffect(() => {
        const fetchEcoAndCultureToursImgs = async () => {

            // Wait for i18n to be initialized
            if (!i18n.isInitialized) {
                return;
            }

            try {
                let url;
                i18n.language === "zh" ? url = `${CMS_endpoint}/api/media-images?filters[PageLocation][$eq]=eco-and-culture-tours-chinese&populate=Image`: url = `${CMS_endpoint}/api/media-images?filters[PageLocation][$eq]=eco-and-culture-tours-english&populate=Image`;
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${CMS_token}`,
                    },
                });

                // Check the data structure and safely retrieve the images
                const images = response.data.data[0].Image;
                if (images) {
                    setEcoAndCultureToursImages(images);
                } else {
                    console.warn("No enough images are available.");
                }
            } catch (error) {
                console.error("Error loading:", error);
            }
        };

        fetchEcoAndCultureToursImgs();
    }, [i18n.language, i18n.isInitialized, CMS_endpoint, CMS_token]);

    return (
        <Container>
  
            {ecoAndCultureToursImages.map((image) => (
                        <Image
                            key={image.id || index}
                            src={`${CMS_endpoint}${image.url}`}
                            alt={`${image.url}`}
                            className="investment-instruction-img"
                            loading="lazy"
                        />
            ))}

        </Container>
    );
};

export default EcoAndCultureTours;
