import axios from "axios";
import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
import { Image } from 'react-bootstrap';

const CheckIn = () => {

    const { t } = useTranslation();

    const CMS_endpoint = process.env.REACT_APP_CMS_ENDPOINT;
    const CMS_token = process.env.REACT_APP_CMS_TOKEN;

    const [checkInImages, setCheckInImages] = useState([]);

    useEffect(() => {
        const fetchCheckInImage = async () => {
            try {
                const response = await axios.get(`${CMS_endpoint}/api/media-images?filters[Name][$eq]=CheckIn&populate=Image`, {
                    headers: {
                        Authorization: `Bearer ${CMS_token}`,
                    },
                });

                // Check the data structure and safely retrieve the images
                const images = response.data.data[0].Image;
                if (images) {
                    setCheckInImages(images);
                } else {
                    console.warn("No enough images are available.");
                }
            } catch (error) {
                console.error("Error loading:", error);
            }
        };

        fetchCheckInImage();
    }, [CMS_endpoint, CMS_token]);

    return (
        <Container>
            <div>
                <br />
                <div dangerouslySetInnerHTML={{ __html: t('checkIn.paragraph1') }}></div>
                {checkInImages.length > 0 && checkInImages[0]?.url ? (
                    <Image
                        className="checkInImage"
                        src={`${CMS_endpoint}${checkInImages[0].url}`}
                        thumbnail
                    />
                ) : (
                    <p>Loading image...</p>
                )}
                <div dangerouslySetInnerHTML={{ __html: t('checkIn.paragraph2') }}></div>
            </div>
        </Container>
    );
};

export default CheckIn;