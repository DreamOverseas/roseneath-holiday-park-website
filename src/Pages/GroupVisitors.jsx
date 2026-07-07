import React from "react";
import Seo from "../Components/Seo";
import { useTranslation } from 'react-i18next';

const GroupVisitors = () => {

    const { t } = useTranslation();

    return (
        <>
            <Seo
                title="Group Visitors | Roseneath Holiday Park"
                description="Group visitor services and holiday accommodation at Roseneath Holiday Park near Lake Willinton."
                canonical="https://roseneathholidaypark.au/group-visitors"
                image="/logo192.png"
                keywords="Roseneath Holiday Park, group visitors, Lake Willinton group stay, holiday accommodation"
            />
            <h2>Coming Soon...</h2>
        </>
    );
};

export default GroupVisitors;