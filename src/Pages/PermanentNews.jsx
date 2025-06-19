import React from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";

function PermanentNews() {
  const { t } = useTranslation();

  return (
    <Container>
      <div dangerouslySetInnerHTML={{ __html: t('policy_content') }}/>
      <br />
    </Container>
  );
}

export default PermanentNews;
