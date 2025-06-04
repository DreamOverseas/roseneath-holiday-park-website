import React from "react";
import { Container, Row, Col, Image } from 'react-bootstrap';
import { useTranslation } from "react-i18next";
import PageTitle from "../Components/PageTitle";
import "../Css/About.css";

function AboutUs() {
  const { t } = useTranslation();

  return (
    <main className="about-page">

      <PageTitle
        pageTitle={t("aboutUs.pageTitle")}
        titleColor='aliceblue'
        background='DSC0E2965.webp'
      />

      <section className='info-section'>
        <div className='container'>
          <div className='row'>
            <div className='image-col'>
              <img
                src='IMG_E5149.jpg' // Update to correct path
                alt={t("aboutUs.imageAlt")}
                className='about-image'
              />
            </div>
            <div className='text-col'>
              <p>{t("aboutUs.section1.paragraph1")}</p>
              <p>{t("aboutUs.section1.paragraph2")}</p>
              <p>{t("aboutUs.section1.paragraph3")}</p>
              <p>{t("aboutUs.section1.paragraph4")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className='activities-section'>
        <div className='container'>
          <p>{t("aboutUs.activities.paragraph1")}</p>
          <p>{t("aboutUs.activities.paragraph2")}</p>
          <p>{t("aboutUs.activities.paragraph3")}</p>
          <p>{t("aboutUs.activities.paragraph4")}</p>
          <p>{t("aboutUs.activities.paragraph5")}</p>
          <p>{t("aboutUs.activities.paragraph6")}</p>
          <div className='image-col'>
            <img
              src='DSC0E2965.webp' // Update to correct path
              alt={t("aboutUs.imageAlt")}
              className='about-image'
            />
          </div>
        </div>
      </section>

      <section className="about-attraction">
        <Container>
          <h1>{t("home_attraction")}</h1>
          <Row className="about-attraction-row">
            <Col><Image className="home-animal" src="/about/Lakes_Entrance.webp" /></Col>
            <Col><div dangerouslySetInnerHTML={{ __html: t('lakes_entrance') }}/></Col>
          </Row>
          <Row className="about-attraction-row">
            <Col><div dangerouslySetInnerHTML={{ __html: t('peninsula_hot_springs') }}/></Col>
            <Col><Image className="home-food" src="/about/Peninsula_Hot_Springs.webp" /></Col>
          </Row>
          <Row className="about-attraction-row">
            <Col><Image className="home-landscape" src="/about/Mount_Hotham.webp" /></Col>
            <Col><div dangerouslySetInnerHTML={{ __html: t('mount_hotham') }}/></Col>
          </Row>
          <Row className="about-attraction-row">
            <Col><div dangerouslySetInnerHTML={{ __html: t('phillip_island_penguin_parade') }}/></Col>
            <Col><Image className="home-food" src="/about/Phillip_Island_Penguin_Parade.webp" /></Col>
          </Row>
          <Row className="about-attraction-row">
            <Col><Image className="home-landscape" src="/about/Metung.webp" /></Col>
            <Col><div dangerouslySetInnerHTML={{ __html: t('metung') }}/></Col>
          </Row>
        </Container>
      </section>
    </main>
  );
}

export default AboutUs;
