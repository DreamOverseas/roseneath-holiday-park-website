import axios from "axios";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Container, Image, Form, Modal } from 'react-bootstrap';
import "../Css/Investment.css";

const News = ({ userType }) => {
    const { t } = useTranslation();
    const [allNewsData, setAllNewsData] = useState([]);
    const [filteredNewsData, setFilteredNewsData] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [availableDates, setAvailableDates] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const CMS_endpoint = import.meta.env.VITE_CMS_ENDPOINT;
    const CMS_token = import.meta.env.VITE_CMS_TOKEN;

    useEffect(() => {
        const fetchNewsData = async () => {
            try {
                const response = await axios.get(`${CMS_endpoint}/api/rhp-news-lists?populate=*`, {
                    headers: {
                        Authorization: `Bearer ${CMS_token}`,
                    },
                });

                setAllNewsData(response.data.data);

                // Filter dates based on userType authorization
                if (userType) {
                    const authorizedNewsItems = response.data.data.filter(item => item[userType] === true);
                    
                    // Extract unique dates only from authorized news items
                    const dates = authorizedNewsItems
                        .map(item => item.newsDate)
                        .filter((date, index, self) => self.indexOf(date) === index)
                        .sort((a, b) => new Date(b) - new Date(a)); // Sort by newest first
                    
                    setAvailableDates(dates);
                } else {
                    // If no userType is provided, show no dates
                    setAvailableDates([]);
                }
            } catch (error) {
                console.error("Error loading news data:", error);
            }
        };

        fetchNewsData();
    }, [CMS_endpoint, CMS_token, userType]); // Added userType to dependencies

    // Filter news based on userType and selectedDate
    useEffect(() => {
        if (!userType) {
            console.warn("userType prop is required. Expected 'forGuest', 'forAnnual', or 'forPermanent'");
            setFilteredNewsData([]);
            return;
        }

        let filtered = allNewsData.filter(newsItem => {
            // Filter by user type
            const userTypeMatch = newsItem[userType] === true;
            
            // Filter by date if selected
            const dateMatch = !selectedDate || newsItem.newsDate === selectedDate;
            
            return userTypeMatch && dateMatch;
        });

        setFilteredNewsData(filtered);
    }, [allNewsData, userType, selectedDate]);

    // Reset selected date if it's no longer available for the current user type
    useEffect(() => {
        if (selectedDate && !availableDates.includes(selectedDate)) {
            setSelectedDate('');
        }
    }, [availableDates, selectedDate]);

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
    };

    const handleImageClick = (imageUrl, alt) => {
        setSelectedImage({ url: imageUrl, alt });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedImage(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
            <Container className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {t("News")}
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                </div>

                {/* Date Filter Section */}
                <div className="flex justify-center mb-8 sm:mb-12">
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 w-full max-w-sm">
                        <Form.Group className="w-full">
                            <Form.Label className="text-base sm:text-lg font-semibold text-gray-700 mb-3 block">
                                {t("News.SelectDate")}
                            </Form.Label>
                            <Form.Select 
                                value={selectedDate} 
                                onChange={handleDateChange}
                                className="border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-300 w-full"
                                disabled={availableDates.length === 0}
                            >
                                <option value="" className="text-gray-500">
                                    {t("News.AllDate")}
                                </option>
                                {availableDates.map((date) => (
                                    <option key={date} value={date} className="text-gray-700">
                                        {formatDate(date)}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </div>
                </div>

                {/* News Content Section */}
                {filteredNewsData.length === 0 ? (
                    <div className="text-center py-12 sm:py-16">
                        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 border border-gray-100">
                            <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                            <p className="text-lg sm:text-xl text-gray-500 font-medium">
                                {t("News.NoNews")}
                            </p>
                            <p className="text-sm sm:text-base text-gray-400 mt-2">
                                Check back later for updates
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 sm:space-y-16">
                        {filteredNewsData.map((newsItem, newsIndex) => (
                            <div key={newsIndex} className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
                                {/* Date Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-8 py-4 sm:py-6">
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center">
                                        <svg className="w-5 sm:w-6 h-5 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {formatDate(newsItem.newsDate)}
                                    </h2>
                                </div>

                                {/* News Images */}
                                <div className="p-4 sm:p-8">
                                    {newsItem.news && newsItem.news.length > 0 ? (
                                        <div className="grid gap-4 sm:gap-6">
                                            {newsItem.news.map((image, imageIndex) => (
                                                <div 
                                                    key={imageIndex} 
                                                    className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                                                    onClick={() => handleImageClick(`${CMS_endpoint}${image.url}`, `News from ${newsItem.newsDate} - Image ${imageIndex + 1}`)}
                                                >
                                                    <Image
                                                        src={`${CMS_endpoint}${image.url}`}
                                                        alt={`News from ${newsItem.newsDate} - Image ${imageIndex + 1}`}
                                                        className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                        loading="lazy"
                                                        fluid
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    {/* Click to expand indicator */}
                                                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/50 text-white p-1 sm:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200">
                                            <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                                                <svg className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm sm:text-base text-gray-500 font-medium mb-2">No images available for this news item</p>
                                            <details className="mt-3 sm:mt-4">
                                                <summary className="text-xs sm:text-sm text-gray-400 cursor-pointer hover:text-gray-600">Debug Information</summary>
                                                <pre className="mt-2 text-xs text-gray-400 bg-gray-100 p-2 sm:p-3 rounded-lg overflow-x-auto">
                                                    {JSON.stringify(newsItem, null, 2)}
                                                </pre>
                                            </details>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Image Modal */}
                <Modal 
                    show={showModal} 
                    onHide={handleCloseModal} 
                    size="xl" 
                    centered
                    className="image-modal"
                >
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="text-sm text-gray-600">
                            <br/>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-0">
                        {selectedImage && (
                            <div className="relative bg-black rounded-b-lg overflow-hidden">
                                <Image
                                    src={selectedImage.url}
                                    alt={selectedImage.alt}
                                    className="w-full h-auto object-contain"
                                    fluid
                                />
                            </div>
                        )}
                    </Modal.Body>
                </Modal>
            </Container>
        </div>
    );
};

export default News;