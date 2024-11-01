import React, { useState } from "react";
import "../Css/Gallery.css";
import { Container, Row, Col, Image, Carousel, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import PageTitle from "../Components/PageTitle";

const Gallery = () => {
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
        "/GalleryImage/IMG_E5111.webp",
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
            <Container>
            <Carousel className="text-center">
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
            <br />
            <Container fluid>
                <Row>
                    {images.map((src, index) => (
                        <Col key={index} xs={12} md={6} lg={4} className="mb-4">
                            <Image
                                className="galleryImage"
                                src={src}
                                thumbnail
                                fluid
                                onClick={() => handleImageClick(src)}
                                style={{ cursor: 'pointer' }}
                            />
                        </Col>
                    ))}
                </Row>
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
