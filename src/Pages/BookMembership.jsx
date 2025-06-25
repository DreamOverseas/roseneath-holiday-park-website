import React from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "../Css/HtmlBeautify.css";

function BookMembership() {
  const { t } = useTranslation();

  return (
    <Container>
        <br /><br />
        <div className="html-content" dangerouslySetInnerHTML={{ __html: t('book.membership') }}/>
        <br />
    </Container>
  );
}

export default BookMembership;
