import React from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";

function BookMembership() {
  const { t } = useTranslation();

  return (
    <Container>
        <br /><br />
        <div dangerouslySetInnerHTML={{ __html: t('book.membership') }}/>
        <br />
    </Container>
  );
}

export default BookMembership;
