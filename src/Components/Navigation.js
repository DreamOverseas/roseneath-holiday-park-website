import Cookies from "js-cookie";
import React, { useEffect } from "react";
import { Figure, Nav, Navbar, NavDropdown } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import { useTranslation, withTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import "../Css/Navigation.css";

const Navigation = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation(); // Get the current URL path

  useEffect(() => {
    const savedLanguage = Cookies.get("i18nextLng") || "en";
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const changeLanguage = lng => {
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(lng);
      Cookies.set("i18nextLng", lng, { expires: 365 });
    }
  };

  return (
    <Navbar
      bg='light'
      data-bs-theme='light'
      className='NavigationBar sticky-top'
    >
      <Container>
        <Navbar.Brand href='/'>
          <Figure.Image width={100} src='/logo192.png' />
        </Navbar.Brand>

        <Nav>
          <Nav.Link
            className={`NavWord ${
              location.pathname === "/" ? "NavActive" : ""
            }`}
            href='/'
          >
            {t("Home")}
          </Nav.Link>
          <Nav.Link
            className={`NavWord ${
              location.pathname === "/find-us" ? "NavActive" : ""
            }`}
            href='/find-us'
          >
            {t("Find us")}
          </Nav.Link>
          <Nav.Link
            className={`NavWord ${
              location.pathname === "/gallery" ? "NavActive" : ""
            }`}
            href='/gallery'
          >
            {t("Gallery")}
          </Nav.Link>
          <Nav.Link
            className={`NavWord ${
              location.pathname === "/about-us" ? "NavActive" : ""
            }`}
            href='/about-us'
          >
            {t("About")}
          </Nav.Link>
          <Nav.Link
            className={`NavWord ${
              location.pathname === "/contact-us" ? "NavActive" : ""
            }`}
            href='/contact-us'
          >
            {t("Contact")}
          </Nav.Link>
        </Nav>

        <NavDropdown
          title={t("Language")}
          id='language-switch'
          className='ms-3'
        >
          <NavDropdown.Item onClick={() => changeLanguage("en")}>
            English
          </NavDropdown.Item>
          <NavDropdown.Item onClick={() => changeLanguage("zh")}>
            中文
          </NavDropdown.Item>
        </NavDropdown>
      </Container>
    </Navbar>
  );
};

export default withTranslation()(Navigation);
