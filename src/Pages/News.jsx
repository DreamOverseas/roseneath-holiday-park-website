import axios from "axios";
import React, { useState, useEffect } from "react";
import "../Css/Investment.css";
import { Container, Image } from 'react-bootstrap'

const News = () => {
    // const { t } = useTranslation();
    const [NewsImages, setNewsImages] = useState([]);

    const CMS_endpoint = import.meta.env.VITE_CMS_ENDPOINT;
    const CMS_token = import.meta.env.VITE_CMS_TOKEN;

    useEffect(() => {
        const fetchNewsImgs = async () => {
            try {
                const response = await axios.get(`${CMS_endpoint}/api/media-images?filters[PageLocation][$eq]=news-slider&populate=Image`, {
                    headers: {
                        Authorization: `Bearer ${CMS_token}`,
                    },
                });

                // Check the data structure and safely retrieve the images
                const images = response.data.data[0].Image;
                if (images) {
                    setNewsImages(images);
                } else {
                    console.warn("No enough images are available.");
                }
            } catch (error) {
                console.error("Error loading:", error);
            }
        };

        fetchNewsImgs();
    }, [CMS_endpoint, CMS_token]);

    return (
        <Container>
  
            {NewsImages.map((image) => (
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

export default News;