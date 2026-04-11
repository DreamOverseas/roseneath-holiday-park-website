import React from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "../Css/HtmlBeautify.css";

function HtmlContent({ translationKey, imageUrl, imageAlt }) {
  const { t } = useTranslation();

  return (
    <Container>
      <br />
      {imageUrl && <img src={imageUrl} alt={imageAlt || "content"} />}
      {imageUrl && <br />}
      <div className="html-content" dangerouslySetInnerHTML={{ __html: t(translationKey) }}/>
      <br />
    </Container>
  );
}

export default HtmlContent;
