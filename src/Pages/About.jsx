import React from "react";
import { Container, Row, Col, Image } from 'react-bootstrap';
import { useTranslation } from "react-i18next";
import PageTitle from "../Components/PageTitle";
import "../Css/About.css";
import "../Css/HtmlBeautify.css";

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
          <h2 className='section-title'>{t("aboutUs.section1.slogan")}</h2>
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
          
          <div className='subsections-grid'>
            <div className='subsection'>
              <h3>{t("aboutUs.section1.location.title")}</h3>
              <p>{t("aboutUs.section1.location.content")}</p>
            </div>
            <div className='subsection'>
              <h3>{t("aboutUs.section1.amenities.title")}</h3>
              <p>{t("aboutUs.section1.amenities.content")}</p>
            </div>
            <div className='subsection'>
              <h3>{t("aboutUs.section1.nature.title")}</h3>
              <p>{t("aboutUs.section1.nature.content")}</p>
            </div>
            <div className='subsection'>
              <h3>{t("aboutUs.section1.shop.title")}</h3>
              <p>{t("aboutUs.section1.shop.content")}</p>
            </div>
            <div className='subsection'>
              <h3>{t("aboutUs.section1.nearbyAttractions.title")}</h3>
              <p>{t("aboutUs.section1.nearbyAttractions.content")}</p>
            </div>
            <div className='subsection'>
              <h3>{t("aboutUs.section1.localStory.title")}</h3>
              <p>{t("aboutUs.section1.localStory.content")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className='why-visit-section'>
        <div className='container'>
          <h2 className='section-title'>{t("aboutUs.section2.title")}</h2>
          <div className='why-visit-content'>
            <p>{t("aboutUs.section2.intro")}</p>
            <p className='vision-text'><strong>{t("aboutUs.section2.vision")}</strong></p>
          </div>
        </div>
      </section>

      <section className='flexible-accommodation-section'>
        <div className='container'>
          <h2 className='section-title'>{t("aboutUs.section7.title")}</h2>
          <div className='qa-item'>
            <h3 className='qa-question'>{t("aboutUs.section7.question")}</h3>
            <p>{t("aboutUs.section7.answer")}</p>
          </div>
          <div className='qa-item'>
            <p>{t("aboutUs.section7.capacity")}</p>
            <p className='vision-text'><strong>{t("aboutUs.section7.vision")}</strong></p>
          </div>
        </div>
      </section>

      <section className='membership-section'>
        <div className='container'>
          <h2 className='section-title'>{t("aboutUs.section8.title")}</h2>
          <div className='membership-content'>
            <p><strong>{t("aboutUs.section8.membershipCard")}</strong></p>
            <p>{t("aboutUs.section8.offersInclude")}</p>
            
            <div className='qa-item'>
              <h3 className='qa-question'>{t("aboutUs.section8.pricingQuestion")}</h3>
              <p>{t("aboutUs.section8.pricingAnswer")}</p>
            </div>

            <h3>{t("aboutUs.section8.ecosystem")}</h3>
            <p>{t("aboutUs.section8.barterSystem")}</p>
            <p><strong>{t("aboutUs.section8.purpose")}</strong></p>

            <div className='qa-item'>
              <h3 className='qa-question'>{t("aboutUs.section8.howItWorks")}</h3>
            </div>
          </div>
        </div>
      </section>

      <section className='activities-section'>
        <div className='container'>
          <h2 className='section-title'>{t("aboutUs.section13.title")}</h2>
          <div className='activities-content'>
            <p><strong>{t("aboutUs.section13.activities")}</strong></p>
            
            <div className='qa-item'>
              <h3 className='qa-question'>{t("aboutUs.section13.facilitiesQuestion")}</h3>
              <p>{t("aboutUs.section13.facilitiesAnswer")}</p>
            </div>

            <div className='qa-item'>
              <h3 className='qa-question'>{t("aboutUs.section13.eventsQuestion")}</h3>
              <p>{t("aboutUs.section13.eventsAnswer")}</p>
            </div>

            <h3>{t("aboutUs.section13.customEvents")}</h3>
            <p>{t("aboutUs.section13.catering")}</p>
            <p className='vision-text'><strong>{t("aboutUs.section13.horsesAllowed")}</strong></p>

            <div className='image-col'>
              <img
                src='DSC0E2965.webp' // Update to correct path
                alt={t("aboutUs.imageAlt")}
                className='about-image'
              />
            </div>
          </div>
        </div>
      </section>

      <section className="html-section">
        <div className="container">
          <div className="html-content">
            <div dangerouslySetInnerHTML={{ __html: t('facility') }}/>
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
            <Col><div dangerouslySetInnerHTML={{ __html: t('metung') }}/></Col>
            <Col><Image className="home-landscape" src="/about/Metung.webp" /></Col>
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
            <Col><Image className="home-food" src="/about/Wilsons_Promontory_National_Park.jpg" /></Col>
            <Col><div dangerouslySetInnerHTML={{ __html: t('wp_national_park') }}/></Col>
          </Row>        
          <Image className="home-food" src="/about/Sale_Explorers_Guide.jpg" />
        </Container>
      </section>
    </main>
  );
}

export default AboutUs;
