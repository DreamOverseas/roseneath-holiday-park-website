import React from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "../Css/HtmlBeautify.css";

function StayAndGuestGuide() {
  const { t } = useTranslation();

  return (
    <Container>
      <div className="html-content" dangerouslySetInnerHTML={{ __html: t('stay_and_guide_content') }}/>
      <br />
    </Container>
  );
}

export default StayAndGuestGuide;
