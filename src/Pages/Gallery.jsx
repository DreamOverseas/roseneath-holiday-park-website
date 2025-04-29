import axios from "axios";
import React, { useState, useEffect } from "react";
import { Container, Image, Carousel, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import PageTitle from "../Components/PageTitle";
import '../Css/Gallery.css';
import '../Css/Tailwind.css';

const Gallery = () => {

    const { t } = useTranslation();

    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [sliderImages, setSliderImages] = useState([]);
    const [galleryImages, setGalleryImages] = useState([]);

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

                // Check the data structure and safely retrieve the images
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

                // Check the data structure and safely retrieve the images
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

    return (
        <>
            <PageTitle
                pageTitle={t('Image Gallery')}
            /> <br />
            {/* I don't know why <Container className="pb-8"> in here didn't work :( */}
            {/* A: There must be some myth overrides over the bootstap original settings... */}
            <Container style={{ paddingBottom: '2rem' }}>
                <Container className="d-flex justify-content-center">
                    <Carousel className="flex w-80%">
                        {sliderImages.map((image, index) => (
                            <Carousel.Item>
                                <Image className="slideImage" src={`${CMS_endpoint}${image.url}`} thumbnail />
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </Container>
                <br />
                <Container fluid className="flex justify-center items-center">
                    <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=114384575665912&bvid=BV1mCLWzNEtN&cid=29562765662&p=1" framespacing="0" allowfullscreen="true" width="98%" class="responsive-iframe"></iframe>
                </Container>
                <br />
                <Container fluid>
                    <div className="container mx-auto px-4">
                        {/* Masonry Grid */}
                        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                            {galleryImages.map((image, index) => (
                                <div
                                    key={index}
                                    className="break-inside-avoid mb-4 relative group"
                                    onClick={() => handleImageClick(`${CMS_endpoint}${image.url}`)}
                                >
                                    <div className="relative overflow-hidden rounded-lg">
                                        {/* Image */}
                                        <img
                                            src={`${CMS_endpoint}${image.url}`}
                                            alt={`${index + 1}`}
                                            className="cursor-pointer w-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
            </Container>

            {/* Modal for full-screen image view */}
            <Modal fullscreen={true} show={showModal} onHide={handleClose} centered size="xl">
                <Modal.Header closeButton>
                    <Modal.Title className="ms-auto GalleryImageTextTitle">{t('Shot in Roseneath Caravan Park')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Image src={selectedImage} fluid className="w-100" />
                </Modal.Body>
            </Modal>
        </>
    );
}

export default Gallery;
