import React from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "../Css/HtmlBeautify.css";

function Policy() {
  const { t } = useTranslation();

  return (
    <Container>
      <div className="html-content" dangerouslySetInnerHTML={{ __html: t('policy_content') }}/>
      <br />
    </Container>
  );
}

export default Policy;
