import React from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "../Css/HtmlBeautify.css";

function BookMembership() {
  const { t } = useTranslation();

  return (
    <Container>
        <br />
        <img src={"public/360_smart_card.jpg"} alt="smart_card" />
        <br />
        <div className="html-content" dangerouslySetInnerHTML={{ __html: t('book.membership') }}/>
        <br />
    </Container>
  );
}

export default BookMembership;
