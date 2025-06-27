import axios from "axios";
import React, { useState, useEffect } from "react";
import { Container, Image } from 'react-bootstrap';
import { useTranslation } from "react-i18next";
import DownloadPdf from "./DownloadPdf";

const MediaImageDisplay = ({ englishUrl, chineseUrl }) => {
    const { i18n } = useTranslation();
    const [images, setImages] = useState([]);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfName, setPdfName] = useState(null);
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
                // Determine URL based on current language, fallback if necessary
                const targetUrl =
                    i18n.language === 'zh' ? (chineseUrl || englishUrl) : (englishUrl || chineseUrl);

                const image_url = `${CMS_endpoint}/api/media-images?filters[PageLocation][$eq]=${targetUrl}&populate=Image`;
                const pdf_url = `${CMS_endpoint}/api/media-images?filters[PageLocation][$eq]=${targetUrl}&populate=Pdf`;

                // Concurrent requests with individual error capture
                const [imageResult, pdfResult] = await Promise.all([
                    axios
                    .get(image_url, {
                        headers: { Authorization: `Bearer ${CMS_token}` },
                    })
                    .catch((error) => ({ error, source: 'image' })),

                    axios
                    .get(pdf_url, {
                        headers: { Authorization: `Bearer ${CMS_token}` },
                    })
                    .catch((error) => ({ error, source: 'pdf' })),
                ]);

                // Handle image result
                if (imageResult?.error) {
                    console.error('Failed to fetch images:', imageResult.error);
                    setImages([]);
                } else {
                    const imageData = imageResult.data?.data?.[0]?.Image;
                    if (Array.isArray(imageData)) {
                        setImages(imageData);
                    } else {
                        console.warn('No images available for the specified location.');
                        setImages([]);
                    }
                }

                // Handle PDF result
                if (pdfResult?.error) {
                    console.error('Failed to fetch PDF:', pdfResult.error);
                    setPdf(null);
                } else {
                    const pdfData = pdfResult.data?.data?.[0]?.Pdf;
                    if (pdfData?.url) {
                        const fullPdfUrl = `${CMS_endpoint}${pdfData.url}`;
                        
                        setPdfUrl(fullPdfUrl);
                        setPdfName(pdfData.name)
                    } else {
                        console.warn('No PDF available for the specified location.');
                        setPdf(null);
                    }
                }
            } catch (error) {
                console.error('Unexpected error:', error);
                setError('Failed to load media');
                setImages([]);
                setPdf(null);
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
            <br/>
            <DownloadPdf pdfUrl={pdfUrl} pdfName={pdfName} />
        </Container>
    );
};

export default MediaImageDisplay;