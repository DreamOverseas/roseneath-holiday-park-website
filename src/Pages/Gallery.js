import React, { useState } from "react";
import { Container, Image, Carousel, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import PageTitle from "../Components/PageTitle";

const Gallery = () => {

    require('../Css/Tailwind.css')

    const { t } = useTranslation();

    const images = [
        "/GalleryImage/DSC02707.jpg",
        "/GalleryImage/DSC02711.jpg",
        "/GalleryImage/DSC02714.jpg",
        "/GalleryImage/DSC02721.jpg",
        "/GalleryImage/DSC02724.jpg",
        "/GalleryImage/DSC02730.jpg",
        "/GalleryImage/DSC02740.jpg",
        "/GalleryImage/DSC02748.jpg",
        "/GalleryImage/DSC02751.jpg",
        "/GalleryImage/DSC02800.jpg",
        "/GalleryImage/DSC02814.jpg",
        "/GalleryImage/DSC02855.jpg",
        "/GalleryImage/DSC02868.jpg",
        "/GalleryImage/DSC02872.jpg",
        "/GalleryImage/DSC02879.jpg",
        "/GalleryImage/DSC02900.jpg",
        "/GalleryImage/DSC02923.jpg",
        "/GalleryImage/DSC02925.jpg",
        "/GalleryImage/DSC02934.jpg",
        "/GalleryImage/DSC03083.jpg",
        "/GalleryImage/IMG_5004.webp",
        "/GalleryImage/IMG_5007.webp",
        "/GalleryImage/IMG_5025.webp",
        "/GalleryImage/IMG_5031.webp",
        "/GalleryImage/IMG_5033.webp",
        "/GalleryImage/IMG_5080.webp",
        "/GalleryImage/IMG_5091.webp",
        "/GalleryImage/IMG_5094.webp",
        "/GalleryImage/IMG_5115.webp",
        "/GalleryImage/IMG_5116.webp",
        "/GalleryImage/IMG_5126.webp",
        "/GalleryImage/IMG_5128.webp",
        "/GalleryImage/IMG_5131.webp",
        "/GalleryImage/IMG_5160.webp",
        "/GalleryImage/IMG_E5136.webp",
        "/GalleryImage/IMG_E5149.webp",
        "/GalleryImage/IMG_E5152.webp",
    ];

    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageClick = (src) => {
        setSelectedImage(src);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    return (
        <>
            <PageTitle
                pageTitle={t('Image Gallery')}
            /> <br />
            {/* I don't know why <Container className="pb-8"> in here didn't work :( */}
            <Container style={{ paddingBottom: '2rem' }}>
            <Container className="d-flex justify-content-center">
                <Carousel className="flex w-80%">
                    <Carousel.Item>
                        <Image className="slideImage" src="/GalleryImage/IMG_5151.webp" thumbnail />
                    </Carousel.Item>
                    <Carousel.Item>
                        <Image className="slideImage" src="/GalleryImage/IMG_5097.webp" thumbnail />
                    </Carousel.Item>
                    <Carousel.Item>
                        <Image className="slideImage" src="/GalleryImage/IMG_5111.webp" thumbnail />
                    </Carousel.Item>
                </Carousel>
            </Container>
            <br />
            <Container fluid>
                <div className="container mx-auto px-4">
                    {/* Masonry Grid */}
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                        {images.map((image, index) => (
                        <div 
                            key={index} 
                            className="break-inside-avoid mb-4 relative group"
                            onClick={() => handleImageClick(image)}
                        >
                            <div className="relative overflow-hidden rounded-lg">
                            {/* Image */}
                            <img
                                src={image}
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
            <Modal show={showModal} onHide={handleClose} centered size="xl">
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
