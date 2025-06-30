import axios from "axios";
import React, { useState, useEffect } from "react";
import { Container, Image } from 'react-bootstrap';
import { useTranslation } from "react-i18next";

const MediaImageDisplay = ({ englishUrl, chineseUrl }) => {
    const { i18n } = useTranslation();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const CMS_endpoint = import.meta.env.VITE_CMS_ENDPOINT;
    const CMS_token = import.meta.env.VITE_CMS_TOKEN;

    // Validate props - at least one URL must be provided
    if (!englishUrl && !chineseUrl) {
        throw new Error("MediaImageDisplay: At least one URL (englishUrl or chineseUrl) must be provided");
    }

    useEffect(() => {
        const fetchImages = async () => {
            // Wait for i18n to be initialized
            if (!i18n.isInitialized) {
                return;
            }

            setLoading(true);
            setError(null);

            try {
                let targetUrl;
                
                // Determine which URL to use based on current language
                if (i18n.language === "zh") {
                    // Use Chinese URL if available, fallback to English URL
                    targetUrl = chineseUrl || englishUrl;
                } else {
                    // Use English URL if available, fallback to Chinese URL
                    targetUrl = englishUrl || chineseUrl;
                }

                const url = `${CMS_endpoint}/api/media-images?filters[PageLocation][$eq]=${targetUrl}&populate=Image`;
                
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${CMS_token}`,
                    },
                });

                // Check the data structure and safely retrieve the images
                const imageData = response.data.data[0]?.Image;
                if (imageData && Array.isArray(imageData)) {
                    setImages(imageData);
                } else {
                    console.warn("No images are available for the specified location.");
                    setImages([]);
                }
            } catch (error) {
                console.error("Error loading images:", error);
                setError("Failed to load images");
                setImages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [i18n.language, i18n.isInitialized, englishUrl, chineseUrl, CMS_endpoint, CMS_token]);

    if (loading) {
        return (
            <Container>
                <div>Loading images...</div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <div>Error: {error}</div>
            </Container>
        );
    }

    return (
        <Container>
            {images.length === 0 ? (
                <div>No images available</div>
            ) : (
                images.map((image, index) => (
                    <Image
                        key={image.id || index}
                        src={`${CMS_endpoint}${image.url}`}
                        alt={image.alternativeText || `Image ${index + 1}`}
                        className="investment-instruction-img"
                        loading="lazy"
                    />
                ))
            )}
        </Container>
    );
};

export default MediaImageDisplay;