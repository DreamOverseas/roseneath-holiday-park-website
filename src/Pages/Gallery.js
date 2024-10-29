import React from "react";
import "../Css/Gallery.css";
import { Container, Row, Col, Image, Carousel } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

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
    ];

    return (
        <>
            <Carousel className="text-center">
                <Carousel.Item>
                    <Image className="slideImage" src="/GalleryImage/DSC02707.jpg" thumbnail/>
                </Carousel.Item>
                <Carousel.Item>
                    <Image className="slideImage" src="/GalleryImage/DSC02800.jpg" thumbnail/>
                </Carousel.Item>
                <Carousel.Item>
                    <Image className="slideImage" src="/GalleryImage/DSC03083.jpg" thumbnail/>
                </Carousel.Item>
            </Carousel>

            <Container fluid>
            <h2 className="text-center my-4">{t('Image Gallery')}</h2>
            <Row>
                {images.map((src, index) => (
                <Col key={index} xs={6} md={6} lg={4} className="mb-4">
                    <Image className="galleryImage" src={src} thumbnail fluid />
                </Col>
                ))}
            </Row>
            </Container>
        </>
      );
    }
export default Gallery;
