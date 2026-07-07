import React from "react";
import Seo from "../Components/Seo";
import { useTranslation } from 'react-i18next';

const IndividualVisitors = () => {

    const { t } = useTranslation();

    return (
        <>
            <Seo
                title="Individual Visitors | Roseneath Holiday Park"
                description="Individual visitor services and holiday accommodation at Roseneath Holiday Park near Lake Willinton."
                canonical="https://roseneathholidaypark.au/individual-visitors"
                image="/logo192.png"
                keywords="Roseneath Holiday Park, individual visitors, Lake Willinton camping, holiday accommodation"
            />
            <h2>Coming Soon...</h2>
        </>
    );
};

export default IndividualVisitors;