import axios from "axios";
import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import PageTitle from "../Components/PageTitle";

const Gallery = () => {
    const { t } = useTranslation();

    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [sliderImages, setSliderImages] = useState([]);
    const [galleryImages, setGalleryImages] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const CMS_endpoint = import.meta.env.VITE_CMS_ENDPOINT;
    const CMS_token = import.meta.env.VITE_CMS_TOKEN;

    useEffect(() => {
        const fetchGalleryPreview = async () => {
            try {
                const response = await axios.get(`${CMS_endpoint}/api/media-images?filters[PageLocation][$eq]=gallery&populate=Image`, {
                    headers: {
                        Authorization: `Bearer ${CMS_token}`,
                    },
                });

                const images = response.data.data[0].Image;
                if (images) {
                    setGalleryImages(images);
                } else {
                    console.warn("No enough images are available.");
                }
            } catch (error) {
                console.error("Error loading:", error);
            }
        };

        const fetchGallerySlider = async () => {
            try {
                const response = await axios.get(`${CMS_endpoint}/api/media-images?filters[PageLocation][$eq]=gallery-slider&populate=Image`, {
                    headers: {
                        Authorization: `Bearer ${CMS_token}`,
                    },
                });

                const images = response.data.data[0].Image;
                if (images) {
                    setSliderImages(images);
                } else {
                    console.warn("No enough images are available.");
                }
            } catch (error) {
                console.error("Error loading:", error);
            }
        };

        fetchGallerySlider();
        fetchGalleryPreview();
    }, [CMS_endpoint, CMS_token]);

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-8">
            <div style={{ marginBottom: '3rem' }}>
                <PageTitle pageTitle={t('Image Gallery')} />
            </div>
            
            <div className="container mx-auto px-4 max-w-7xl" style={{ paddingBottom: '3rem' }}>
                {/* Hero Carousel Section */}
                <div style={{ marginBottom: '3rem' }}>
                    <div className="relative w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
                        {sliderImages.length > 0 && (
                            <>
                                <div className="relative h-96 md:h-[500px] overflow-hidden">
                                    <img
                                        src={`${CMS_endpoint}${sliderImages[currentSlide]?.url}`}
                                        alt={`Slide ${currentSlide + 1}`}
                                        className="w-full h-full object-cover transition-all duration-500 ease-in-out transform hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                </div>
                                
                                {/* Navigation Arrows */}
                                <button
                                    onClick={prevSlide}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                
                                {/* Dots Indicator */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                    {sliderImages.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => goToSlide(index)}
                                            className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                                index === currentSlide 
                                                    ? 'bg-white scale-125' 
                                                    : 'bg-white/50 hover:bg-white/80'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Video Section */}
                <div style={{ marginBottom: '3rem' }}>
                    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-6">
                            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                <iframe 
                                    src="//player.bilibili.com/player.html?isOutside=true&aid=114384575665912&bvid=BV1mCLWzNEtN&cid=29562765662&p=1" 
                                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gallery Grid Section */}
                <div style={{ marginBottom: '3rem' }}>
                    <div 
                        className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4"
                        style={{ columnGap: '1rem' }}
                    >
                        {galleryImages.map((image, index) => (
                            <div
                                key={index}
                                className="break-inside-avoid relative group cursor-pointer mb-4"
                                onClick={() => handleImageClick(`${CMS_endpoint}${image.url}`)}
                            >
                                <div className="relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                    <img
                                        src={`${CMS_endpoint}${image.url}`}
                                        alt={`Gallery image ${index + 1}`}
                                        className="w-full object-cover transition-all duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-white/90 p-3 rounded-full">
                                            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal for full-screen image view */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="relative max-w-7xl max-h-[90vh] mx-4">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600">
                                <h3 className="text-xl font-semibold text-white">
                                    {t('Shot in Roseneath Caravan Park')}
                                </h3>
                                <button
                                    onClick={handleClose}
                                    className="text-white hover:text-gray-200 p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-6">
                                <img
                                    src={selectedImage}
                                    alt="Full size gallery image"
                                    className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;