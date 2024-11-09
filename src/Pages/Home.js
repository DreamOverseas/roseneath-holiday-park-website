import axios from "axios";
import React, { useState, useEffect } from "react";
import "../Css/Home.css";
import { Container, Row, Col, Image, Button, Modal, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
  const path = "/static_data/room.json";
  const { t } = useTranslation();

  const [show, setShow] = useState(false);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    setShow(true);
  }, []);

  useEffect(() => {
    axios.get(path)
      .then(response => {
        setRooms(response.data.rooms);
      })
      .catch(error => {
        console.error("Error loading JSON file:", error);
      });
  }, []);

  const handleClose = () => setShow(false);

  // Slider 配置
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('welcome_title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('welcome_text').split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <div>
        <section className="home-banner-title">
          <h1>Roseneath Holiday Park</h1>
          <strong><h3>By Lake Willington</h3></strong>
        </section>

        <section className="home-banner-subtitle">
          <Container>
            <h3>Start your journey now!</h3>
          </Container>
        </section>

        <section className="room-presentation">
          <Container>
            <h1>Room</h1>
            <Slider {...sliderSettings}>
              {rooms.map((room) => (
                <div key={room.id} className="slider-card">
                  <Card className="home-room-card">
                    {room.image_path ? (
                      <Card.Img
                        variant="top"
                        src={room.image_path}
                        alt={room.name}
                        className="slider-card-img"
                      />
                    ) : (
                      <Card.Img
                        variant="top"
                        src="https://placehold.co/250x350"
                        alt="Placeholder"
                        className="slider-card-img"
                      />
                    )}
                    <Card.Body>
                      <Card.Title title={room.name}>{room.name}</Card.Title>
                      <p className="home-room-card-subtitle">{room.subtitle}</p>
                      <Card.Text>{room.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </Slider>
          </Container>
        </section>

        <section className="home-introduction">
          <Container>
            <Row className="food">
              <Col>
                <Image className="home-animal" src="/home/home_life.jpg" />
              </Col>
              <Col className="food-info">
                <h2>Escape to Pure Tranquility</h2>
                <p>
                  Escape the city's hustle and embrace a serene getaway at a camping holiday park. Here, guests enjoy the calming beauty of nature, with fresh air, star-filled skies, and peaceful surroundings. Unwind by campfires, explore scenic trails, and savor simple pleasures like morning coffee by the lake. A camping holiday park offers a refreshing, leisurely retreat perfect for relaxation.
                </p>
                <div className="food-btn-container"><Button>{t("book_Now")}</Button></div>
              </Col>
            </Row>
            <Row className="animal">
              <Col>
                <Image className="home-food" src="/home/home_animal.webp" />
              </Col>
              <Col className="animal-info">
                <h2>Wild Animals</h2>
                <p>
                  Experience the thrill of the wild! Discover breathtaking footage of majestic kangaroos, elusive leopards, and untamed wilderness. Our wildlife documentary brings you closer to nature's most extraordinary creatures. Witness the beauty, power, and mystery of the animal kingdom in stunning high-definition. Don't miss this incredible journey into the heart of the wild!
                </p>
                <div className="animal-btn-container"><Button>{t("book_Now")}</Button></div>
              </Col>
            </Row>
            <Row className="landscape">
              <Col>
                <Image className="home-landscape" src="/home/home_landscape.webp" />
              </Col>
              <Col className="landscape-info">
                <h2>Beautiful Landscape</h2>
                <p>
                  Escape to a world of breathtaking landscapes where nature's beauty unfolds before your eyes. From serene mountain peaks to tranquil seaside sunsets, immerse yourself in the stunning vistas that refresh your soul and inspire your spirit. Experience the allure of nature like never before with Beautiful Scenery, where every view is a masterpiece.
                </p>
                <div className="landscape-btn-container"><Button>{t("book_Now")}</Button></div>
              </Col>
            </Row>
          </Container>
        </section>
        
        <section className="home-find-us">
          <Container>
            <h1>Roseneath Holiday Park</h1>
            <strong><h4>Landed in between seaside & lake reserve</h4></strong>
            <strong><h4>Customize Your own Journey</h4></strong>
            <div className="home-find-us-btn-container">
              <Button className="find-us-btn">{t("find_Us_OnMap")}</Button>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
};
export default Home;