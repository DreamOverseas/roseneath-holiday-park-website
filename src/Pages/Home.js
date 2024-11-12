import axios from "axios";
import React, { useState, useEffect } from "react";
import "../Css/Home.css";
import { Container, Row, Col, Image, Button, Modal, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
  // const room_path = "/static_data/room.json";                // Commended for update, pls detele after verified
  // const gallery_path = "/static_data/gallery.json";
  const CMS_endpoint = process.env.REACT_APP_CMS_ENDPOINT;
  const CMS_token = process.env.REACT_APP_CMS_TOKEN;
  const { t } = useTranslation();

  const [show, setShow] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    setShow(true);
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${CMS_endpoint}/api/room-types?populate=Cover`, {
          headers: {
            Authorization: `Bearer ${CMS_token}`,
          },
        });
        setRooms(response.data.data);
      } catch (error) {
        console.error("Error loading:", error);
      }
    };
  
    fetchRooms();
  }, []);
  

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
          setGallery(images.slice(15, 24));
        } else {
          console.warn("No images found in response data.");
        }
      } catch (error) {
        console.error("Error loading:", error);
      }
    };
  
    fetchGalleryPreview();
  }, []);
  

  const handleClose = () => setShow(false);

  const room_sliderSettings = {
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

  const gallery_sliderSettings = {
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
            <h4>Start your journey now!</h4>
          </Container>
        </section>

        <section className="room-presentation">
          <Container>
            <h1>Room</h1>
            <Slider {...room_sliderSettings}>
              {rooms.map((room) => (
                <div key={room.id} className="room_slider-card">
                  <Card className="home-room-card">
                    {room.Cover.url ? (
                      <Card.Img
                        variant="top"
                        src={`${CMS_endpoint}${room.Cover.url}`}
                        alt={room.Name_en}
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
                      <Card.Title title={room.Name_en}>{room.Name_en}</Card.Title>
                      <p className="home-room-card-subtitle">{room.Title_en}</p>
                      <Card.Text>{room.Description_en}</Card.Text>
                      <Button>{t("book_Now")}</Button>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </Slider>
            <div className="more-btn-container">
              <a href="/roomlist" className="gallery-link">
                {t("btn_more")}
              </a>
            </div>
          </Container>
        </section>

        <section className="home-attraction">
          <Container>
            <h1>Attractions</h1>
            <Row className="food">
              <Col>
                <Image className="home-animal" src="/home/home_life.jpg"/>
              </Col>
              <Col className="food-info">
                <h3>Escape to Pure Tranquility</h3>
                <p>
                  Escape the city's hustle and embrace a serene getaway at a camping holiday park. Here, guests enjoy the calming beauty of nature, with fresh air, star-filled skies, and peaceful surroundings. Unwind by campfires, explore scenic trails, and savor simple pleasures like morning coffee by the lake. A camping holiday park offers a refreshing, leisurely retreat perfect for relaxation.
                </p>
              </Col>
            </Row>
            <Row className="animal">
              <Col>
                <Image className="home-food" src="/home/home_animal.webp" />
              </Col>
              <Col className="animal-info">
                <h3>Wild Animals</h3>
                <p>
                  Experience the thrill of the wild! Discover breathtaking footage of majestic kangaroos, elusive leopards, and untamed wilderness. Our wildlife documentary brings you closer to nature's most extraordinary creatures. Witness the beauty, power, and mystery of the animal kingdom in stunning high-definition. Don't miss this incredible journey into the heart of the wild!
                </p>
              </Col>
            </Row>
            <Row className="landscape">
              <Col>
                <Image className="home-landscape" src="/home/home_landscape.webp" />
              </Col>
              <Col className="landscape-info">
                <h3>Beautiful Landscape</h3>
                <p>
                  Escape to a world of breathtaking landscapes where nature's beauty unfolds before your eyes. From serene mountain peaks to tranquil seaside sunsets, immerse yourself in the stunning vistas that refresh your soul and inspire your spirit. Experience the allure of nature like never before with Beautiful Scenery, where every view is a masterpiece.
                </p>
              </Col>
            </Row>
          </Container>
        </section>

        <section className="home-gallery">
          <Container>
            <h1>Gallery</h1>
            <Slider {...gallery_sliderSettings}>
              {gallery.map(picture => (
                <div key={picture.id} className="gallery-slider">
                    {picture.url ? (
                      <Image
                        variant="top"
                        src={`${CMS_endpoint}${picture.url}`}
                        alt={picture.Name}
                        className="gallery-slider-img"
                        thumbnail
                      />
                    ) : (
                      <Image
                        variant="top"
                        src="https://placehold.co/250x350"
                        alt="Placeholder"
                        className="gallery-slider-img"
                        thumbnail
                      />
                    )}
                </div>
              ))}
            </Slider>
            <div className="more-btn-container">
              <a href="/gallery" className="gallery-link">
                {t("btn_more")}
              </a>
            </div>
          </Container>
        </section>
        
        <section className="home-contact-us">
          <Container>
            <h1>Roseneath Holiday Park</h1>
            <strong><h4>Landed in between seaside & lake reserve</h4></strong>
            <strong><h4>Customize Your own Journey</h4></strong>
            <Row className="home-contact-us-board">

              <Col className="contact-info-column" md={5}>
              
                  <Row className="contact-row">
                      <Col className="contact-text">
                          <h5>Telephone Number</h5>
                          <p>+61 (03) 5157-8298</p>
                      </Col>
                      <Col className="contact-icon">
                          <i className="bi bi-telephone-inbound-fill icon"></i>
                      </Col>
                  </Row>

                  <Row className="contact-row">
                      <Col className="contact-text">
                          <h5>Email</h5>
                          <p>info@roseneathholidaypark.au</p>
                      </Col>
                      <Col className="contact-icon">
                          <i className="bi bi-mailbox2 icon"></i>
                      </Col>
                  </Row>

                  <Row className="contact-row">
                      <Col className="contact-text">
                          <h5>Address</h5>
                          <p>422 Woodpile Rd<br />Meerlieu VIC 3862<br />Australia</p>
                      </Col>
                      <Col className="contact-icon">
                          <i className="bi bi-pin-map-fill icon"></i>
                      </Col>
                  </Row>
              </Col>


              <Col className="home-map" md={7}>
                <>
                  <iframe
                      title="Roseneath Holiday Park Location Map"
                      src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d474013.57073654904!2d150.801209!3d-37.457687!3m2!1i1024!2i768!4f13.5!3m3!1m2!1s0x6b2f12fa55ba106b%3A0x97796bb5b7b2aa37!2sRoseneath%20Holiday%20Park!5e1!3m2!1sen!2sus!4v1730163420007!5m2!1sen!2sus"
                      width="100%"
                      height="400px"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                  />
                </>
              </Col>
            </Row>
            <Row className="home-contact-us-btn-container">
              <a href="/contact-us">
                <Button className="contact-us-btn">{t("Contact")}</Button>
              </a>
          </Row>
          </Container>
        </section>
      </div>
    </>
  );
};

export default Home;
