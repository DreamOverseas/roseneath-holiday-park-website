import React from "react";
import { useTranslation } from "react-i18next";
import PageTitle from "../Components/PageTitle";
import "../Css/About.css";

function AboutUs() {
  const { t } = useTranslation();

  return (
    <main>
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
          <div className='image-col'>
            <img
              src='DSC0E2965.webp' // Update to correct path
              alt={t("aboutUs.imageAlt")}
              className='about-image'
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default AboutUs;
