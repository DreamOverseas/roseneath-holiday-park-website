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
                    console.warn('Failed to fetch images:', imageResult.error);
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
                    console.warn('Failed to fetch PDF:', pdfResult.error);
                    setPdfUrl(null);
                    setPdfName(null);
                } else {
                    const pdfData = pdfResult.data?.data?.[0]?.Pdf;
                    if (pdfData?.url) {
                        const fullPdfUrl = `${CMS_endpoint}${pdfData.url}`;
                        
                        setPdfUrl(fullPdfUrl);
                        setPdfName(pdfData.name)
                    } else {
                        console.warn('No PDF available for the specified location.');
                        setPdfUrl(null);
                        setPdfName(null);
                    }
                }
            } catch (error) {
                console.warn('Failed to load media:', error);
                setImages([]);
                setPdfUrl(null);
                setPdfName(null);
            } finally {
                setLoading(false);
            }

        };

        fetchImages();
    }, [i18n.language, i18n.isInitialized, englishUrl, chineseUrl, CMS_endpoint, CMS_token]);

    if (loading) {
        return (
            <Container>
                <div className="flex justify-center items-center py-20">
                    <div className="text-center">
                        <div className="mb-4 text-gray-400">
                            <svg className="w-16 h-16 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <p className="text-lg text-gray-600">{i18n.t('loading')}</p>
                    </div>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <div className="flex justify-center items-center py-20">
                    <div className="text-center">
                        <div className="mb-4 text-red-400">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-lg text-red-600 font-medium">{i18n.t('Error')}</p>
                        <p className="text-sm text-gray-500 mt-2">{error}</p>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            {images.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                    <div className="text-center">
                        <div className="mb-4 text-gray-300">
                            <svg className="w-20 h-20 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-xl font-semibold text-gray-400 mb-2">{i18n.t('coming_soon')}</p>
                        <p className="text-sm text-gray-500">{i18n.t('no_content_yet')}</p>
                    </div>
                </div>
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
            {pdfUrl && (
                <div className="flex justify-center my-10">
                    <DownloadPdf pdfUrl={pdfUrl} pdfName={pdfName} />
                </div>
            )}
        </Container>
    );
};

export default MediaImageDisplay;