import Cookies from "js-cookie";
import React, {useEffect} from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function AnnualNews() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const userCookie = Cookies.get("user");

  useEffect(() => {
    if (!userCookie) {
      navigate("?tab=login");
    }
  }, [userCookie]);

  return (
    <Container>
        {userCookie ? 
          <>
            <div dangerouslySetInnerHTML={{ __html: t('policy_content') }}/>
            <br />
          </> : 
          <div className="text-center my-40">
            <h1>{t("pleaseLogin")}</h1>
          </div>
        }
      
    </Container>
  );
}

export default AnnualNews;
