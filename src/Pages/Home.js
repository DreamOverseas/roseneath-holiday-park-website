import axios from "axios";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import "../Css/Home.css";
import { Container, Row, Col, Image, Button, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import PriceList from "../Components/PriceListSection";

const Home = () => {
  // Read Env from file
  const CMS_endpoint = process.env.REACT_APP_CMS_ENDPOINT;
  const CMS_token = process.env.REACT_APP_CMS_TOKEN;
  const DBLink_LH = process.env.REACT_APP_LH_DIRECT_BOOKING;

  const { t, i18n } = useTranslation();

  const [rooms, setRooms] = useState([]);
  const [gallery, setGallery] = useState([]);

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
  }, [CMS_endpoint, CMS_token]);


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
  }, [CMS_endpoint, CMS_token]);

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
      <Helmet>
        <title>Roseneath Holiday Park</title>
        <meta name="description" content="Official website for the Roseneath Holiday Park near Lake Willinton, the place for Camping, Caravan and Accomadation in the nature." />
        <meta name="keywords" content="Holiday, Roseneath, Camp, Caravan, Wild, Nature, Exploration, Willinton, Lake, Beach, Accomadation, Food, Service, Course, Facility, Storage, Landscape" />
      </Helmet>

      <div>
        <section className="home-banner-title">
          <h1>{t("home_place_name")}</h1>
          <strong><h3>{t("home_place_short_description")}</h3></strong>
        </section>

        <section className="home-banner-subtitle">
          <Container>
            <h4>{t("home_cheerup")}</h4>
          </Container>
        </section>

        <section className="room-presentation">
          <Container>
            <h1>{t("Room")}</h1>
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
                      <Card.Title>{i18n.language === "zh"
                        ? room.Name_zh
                        : room.Name_en}
                      </Card.Title>
                      <p className="home-room-card-subtitle">{i18n.language === "zh"
                        ? room.Title_zh
                        : room.Title_en}
                      </p>
                      <Card.Text>{i18n.language === "zh"
                        ? room.Description_zh
                        : room.Description_en}
                      </Card.Text>
                      {room.Availability? 
                      <a href={`${DBLink_LH}?room_type=${room.RoomTypeID}`} target="_blank" rel="noopener noreferrer">
                        <Button>{t("book_Now")}</Button>
                      </a>
                      :
                      <Button variant="secondary">{t("book_unavailable")}</Button>
                      }
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

        <Container className="home-price-list">
          <h1>{t("home_pricelist")}</h1>
          <PriceList />
        </Container>

        <section className="home-attraction">
          <Container>
            <h1>{t("home_attraction")}</h1>
            <Row className="food">
              <Col>
                <Image className="home-animal" src="/home/home_life.jpg" />
              </Col>
              <Col className="food-info">
                <h3>{t("home_section1_title")}</h3>
                <p>
                  {t("home_section1_txt")}
                </p>
              </Col>
            </Row>
            <Row className="animal">
              <Col>
                <Image className="home-food" src="/home/home_animal.webp" />
              </Col>
              <Col className="animal-info">
                <h3>{t("home_section2_title")}</h3>
                <p>
                  {t("home_section2_txt")}
                </p>
              </Col>
            </Row>
            <Row className="landscape">
              <Col>
                <Image className="home-landscape" src="/home/home_landscape.webp" />
              </Col>
              <Col className="landscape-info">
                <h3>{t("home_section3_title")}</h3>
                <p>
                  {t("home_section3_txt")}
                </p>
              </Col>
            </Row>
          </Container>
        </section>

        <section className="home-gallery">
          <Container>
            <h1>{t("Gallery")}</h1>
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
            <h1>{t("home_place_name")}</h1>
            <strong><h4>{t("home_place_description_l1")}</h4></strong>
            <strong><h4>{t("home_place_description_l2")}</h4></strong>
            <Row className="home-contact-us-board">

              <Col className="contact-info-column" md={5}>

                <Row className="contact-row">
                  <Col className="contact-text">
                    <h5>{t("telephone")}</h5>
                    <p>+61 (03) 5157-8298</p>
                  </Col>
                  <Col className="contact-icon">
                    <i className="bi bi-telephone-inbound-fill icon"></i>
                  </Col>
                </Row>

                <Row className="contact-row">
                  <Col className="contact-text">
                    <h5>{t("email")}</h5>
                    <p>info@roseneathholidaypark.au</p>
                  </Col>
                  <Col className="contact-icon">
                    <i className="bi bi-mailbox2 icon"></i>
                  </Col>
                </Row>

                <Row className="contact-row">
                  <Col className="contact-text">
                    <h5>{t("address")}</h5>
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
