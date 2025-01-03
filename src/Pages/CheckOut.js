import axios from "axios";
import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
import {Image} from 'react-bootstrap';

const CheckOut = () => {

    const { t } = useTranslation();

    const CMS_endpoint = process.env.REACT_APP_CMS_ENDPOINT;
    const CMS_token = process.env.REACT_APP_CMS_TOKEN;

    const [checkOutImages, setCheckOutImages] = useState([]);

    useEffect(() => {
        const fetchCheckOutImage = async () => {
            try {
                const response = await axios.get(`${CMS_endpoint}/api/media-images?filters[Name][$eq]=CheckIn&populate=Image`, {
                    headers: {
                        Authorization: `Bearer ${CMS_token}`,
                    },
                });

                // Check the data structure and safely retrieve the images
                const images = response.data.data[0].Image;
                if (images) {
                    setCheckOutImages(images);
                } else {
                    console.warn("No enough images are available.");
                }
            } catch (error) {
                console.error("Error loading:", error);
            }
        };

        fetchCheckOutImage();
    }, [CMS_endpoint, CMS_token]);

    return (
        <Container>
            <div dangerouslySetInnerHTML={{ __html: t('checkOut') }}></div>
        </Container>
    );
};

export default CheckOut;