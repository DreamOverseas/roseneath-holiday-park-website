import axios from "axios";
import React, { useState, useEffect } from "react";
import "../Css/Home.css";
import { Container, Row, Col, Image, Button, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PriceList from "../Components/PriceListSection";

const Home = () => {
  // Read Env from file
  const CMS_endpoint = import.meta.env.VITE_CMS_ENDPOINT;
  const CMS_token = import.meta.env.VITE_CMS_TOKEN;
  const DBLink_LH = 'https://book-directonline.com/properties/roseneathholidaypark-1'

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
        const roomData = response.data.data.sort((a, b) => {
          return a.order - b.order; // Let available room types going to the front
        });
        setRooms(roomData);
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
      <div>
        <section className="home-banner-title">
          <h1>{t("home_place_name")}</h1>
          <strong><h3>{t("home_place_short_description")}</h3></strong>
        </section>

        <section className="home-banner-subtitle">
          <Container>
            <h1>{t("home_cheerup")}</h1>
            {/* 缩略图示例 */}
            <div className="d-flex justify-content-center align-items-center gap-40">
              <div className="d-flex flex-column align-items-center">
                <Image
                  src="/Icons/free-parking.png"
                  alt="Cheer up"
                  width={90}
                  height="auto"
                />
                <p>{t("park_free")}</p>
              </div>

              <div className="d-flex flex-column align-items-center">
                <Image
                  src="/Icons/dog.png"
                  alt="Cheer up"
                  width={90}
                  height="auto"
                />
                <p>{t("pet_friendly")}</p>
              </div>

              <div className="d-flex flex-column align-items-center">
                <Image
                  src="/Icons/horse.png"
                  alt="Cheer up"
                  width={90}
                  height="auto"
                />
                <p>{t("horse_by_your_side")}</p>
              </div>
            </div>
          </Container>
        </section>

        <section className="room-presentation">
          <Container>
            <h1>{t("Room")}</h1>
            <Slider {...room_sliderSettings}>
              {rooms.map((room) => (
                <div key={room.id} className="room_slider-card">
                  <Card className="home-room-card">
                    {room.Cover?.url ? (
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

        <Container className="other-service" >
          <h1>{t("our_service_title")}</h1>
          <Col className="our-service-button-group">
            <Button variant="outline-light" href="/individual-visitors">
              <Card className="text-center home-clickable-card">
                  <Card.Body>
                      <Image className="our-service-button" src="/Icons/individual_visitor.png" />
                      <Card.Title>{t("our_service_individual")}</Card.Title>
                  </Card.Body>
              </Card>
            </Button>
            <Button variant="outline-light" href="/group-visitors">
              <Card className="text-center home-clickable-card">
                  <Card.Body>
                      <Image className="our-service-button" src="/Icons/group_visitor.png" />
                      <Card.Title>{t("our_service_group")}</Card.Title>
                  </Card.Body>
              </Card>
            </Button>
            <Button variant="outline-light" href="/investment">
              <Card className="text-center home-clickable-card">
                  <Card.Body>
                      <Image className="our-service-button" src="/Icons/investment.png" />
                      <Card.Title>{t("investment")}</Card.Title>
                  </Card.Body>
              </Card>
            </Button>
            <Button variant="outline-light" href="/cooperation">
              <Card className="text-center home-clickable-card">
                  <Card.Body>
                      <Image className="our-service-button" src="/Icons/cooperate.png" />
                      <Card.Title>{t("cooperation")}</Card.Title>
                  </Card.Body>
              </Card>
            </Button>
          </Col>
        </Container>

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

              <Col>
                <Row className="contact-info-row">
                    <p>
                        <b>{t("contact_individual_title")}</b> &#9978;
                    </p>
                </Row>
                <Row className="contact-info-row">
                    <p>
                        <i class="bi bi-pin-angle"></i> &nbsp;
                        {t("contact_individual_location")}
                    </p>
                </Row>
                <Row className="contact-info-row">
                    <p>
                        <i class="bi bi-person"></i> &nbsp;
                        {t("contact_individual_name")}
                    </p>
                </Row>
                <Row className="contact-info-row">
                    <p>
                        <i class="bi bi-telephone-inbound"></i> &nbsp;
                        {t("contact_individual_phone")}
                    </p>
                </Row>
                <Row className="contact-info-row">
                    <p>
                        <i class="bi bi-mailbox"></i> &nbsp;
                        {t("contact_individual_email")}
                    </p>
                </Row>
                <br />
                <Row className="contact-info-row">
                    <p>
                        <b>{t("contact_group_title")}</b> &#128188;
                    </p>
                </Row>
                <Row className="contact-info-row">
                    <p>
                        <b>{t("contact_group_subject")}</b>
                    </p>
                </Row>
                <Row className="contact-info-row">
                    <p>
                        <i class="bi bi-pin-angle"></i> &nbsp;
                        {t("contact_group_location")}
                    </p>
                </Row>
                <Row className="contact-info-row">
                    <p>
                        <i class="bi bi-person"></i> &nbsp;
                        {t("contact_group_name")}
                    </p>
                </Row>
                <Row className="contact-info-row">
                    <p>
                        <i class="bi bi-telephone-inbound"></i> &nbsp;
                        {t("contact_group_phone")}
                    </p>
                </Row>
                <Row className="contact-info-row">
                    <p>
                        <i class="bi bi-mailbox"></i> &nbsp;
                        {t("contact_group_email")}
                    </p>
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
