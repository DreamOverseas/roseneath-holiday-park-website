import axios from "axios";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Container, Image, Form, Row, Col } from 'react-bootstrap';
import "../Css/Investment.css";

const News = ({ userType }) => {
    const { t } = useTranslation();
    const [allNewsData, setAllNewsData] = useState([]);
    const [filteredNewsData, setFilteredNewsData] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [availableDates, setAvailableDates] = useState([]);

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

    return (
        <Container className="my-5">
            <h1 className="text-center mb-4">{t("News")}</h1>
            <div className="flex text-center justify-center mb-3">
                <Form.Group className="w-1/3">
                    <Form.Label>{t("News.SelectDate")}</Form.Label>
                    <Form.Select 
                        value={selectedDate} 
                        onChange={handleDateChange}
                        className="mb-3"
                        disabled={availableDates.length === 0}
                    >
                        <option value="">{t("News.AllDate")}</option>
                        {availableDates.map((date) => (
                            <option key={date} value={date}>
                                {formatDate(date)}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </div>

            {filteredNewsData.length === 0 ? (
                <div className="text-center">
                    <p>{t("News.NoNews")}</p>
                </div>
            ) : (
                filteredNewsData.map((newsItem, newsIndex) => (
                    <div key={newsIndex} className="my-40">
                        <h1 className="mb-3">
                            {formatDate(newsItem.newsDate)}
                        </h1>
                        <Row>
                            {newsItem.news && newsItem.news.length > 0 ? (
                                newsItem.news.map((image, imageIndex) => (
                                    <Image
                                        key={imageIndex}
                                        src={`${CMS_endpoint}${image.url}`}
                                        alt={`News from ${newsItem.newsDate} - Image ${imageIndex + 1}`}
                                        className="investment-instruction-img"
                                        loading="lazy"
                                        fluid
                                    />
                                ))
                            ) : (
                                <div>
                                    <p>No images available for this news item.</p>
                                    <p>Debug: {JSON.stringify(newsItem, null, 2)}</p>
                                </div>
                            )}
                        </Row>
                    </div>
                ))
            )}
        </Container>
    );
};

export default News;