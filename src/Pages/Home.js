import React from "react";
import "../Css/Home.css";
import {Container,Row,Col,Image,Button} from 'react-bootstrap'
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();

    return (
      <div className="home-background">
        <section className="home-banner-title">
          <h1>Roseneath Holiday Park</h1>
          <strong><h3>By Lake Willington</h3></strong>
        </section>
        <section className="home-introduction">
          <Container>
            <Row className="landscape">
              <Col className="landscape-info">
                <h2>Beautiful Landscape</h2>
                <p>Escape to a world of breathtaking landscapes where nature's beauty unfolds before your eyes. From serene mountain peaks to tranquil seaside sunsets, immerse yourself in the stunning vistas that refresh your soul and inspire your spirit. Experience the allure of nature like never before with Beautiful Scenery, where every view is a masterpiece.</p>
                <div className="landscape-btn-container"><Button>{t("book_Now")}</Button></div>
              </Col>
              <Col>
                <Image className="home-landscape" src="/home/home_landscape.webp"/>
              </Col>
            </Row>
            <Row className="food">
              <Col>
                <Image className="home-animal" src="/home/home_food.webp"/>
              </Col>
              <Col className="food-info">
                <h2>Delicious Wild Food</h2>
                <p>
                  Discover the rich flavors of nature with Delicious Wild Food. Our carefully curated selection of wild ingredients brings the taste of the wilderness straight to your table. Experience the pure, untamed essence of wild foraged foods, perfect for the adventurous palate. Savor the wild, taste the difference!
                </p>
                <div className="food-btn-container"><Button>{t("book_Now")}</Button></div>
              </Col>
            </Row>
            <Row className="animal">
              <Col>
                <Image className="home-food" src="/home/home_animal.webp"/>
              </Col>
              <Col className="animal-info">
                <h2>Wild Animals</h2>
                <p>Experience the thrill of the wild! Discover breathtaking footage of majestic kanguroos, elusive leopards, and untamed wilderness. Our wildlife documentary brings you closer to nature's most extraordinary creatures. Witness the beauty, power, and mystery of the animal kingdom in stunning high-definition. Don't miss this incredible journey into the heart of the wild!</p>
                <div className="animal-btn-container"><Button>{t("book_Now")}</Button></div>
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
        
    );
};

export default Home;
