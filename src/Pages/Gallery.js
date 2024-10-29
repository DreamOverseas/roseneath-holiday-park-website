import React from "react";
import "../Css/Gallery.css";
import { Container, Row, Col, Image } from 'react-bootstrap';

const Gallery = () => {

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
    ];

    return (
        <Container fluid>
          <h2 className="text-center my-4">Image Gallery</h2>
          <Row>
            {images.map((src, index) => (
              <Col key={index} xs={6} md={4} lg={3} className="mb-4">
                <Image src={src} thumbnail fluid/>
              </Col>
            ))}
          </Row>
        </Container>
      );
};

export default Gallery;
