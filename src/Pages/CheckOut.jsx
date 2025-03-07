import React from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from 'react-i18next';

const CheckOut = () => {

    const { t } = useTranslation();

    return (
        <Container>
            <div dangerouslySetInnerHTML={{ __html: t('checkOut') }}></div>
        </Container>
    );
};

export default CheckOut;