import Cookies from "js-cookie";
import React, { useEffect } from "react";
import { Container, Figure, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
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
      expand='lg'
      data-bs-theme='light'
      className='NavigationBar sticky-top'
    >
      <Container fluid>
        <Navbar.Brand href='/'>
          <Figure.Image width={100} src='/logo192.png' />
        </Navbar.Brand>

        {/* Toggle button for smaller screens */}
        <Navbar.Toggle className='NavToggle' aria-controls='basic-navbar-nav' />
        {/* Collapsible navigation menu */}
        <Navbar.Collapse id='basic-navbar-nav'>
          <Container>
            <Nav className='NavContainer'>
              <Nav.Link
                className={`NavWord ${location.pathname === "/" ? "NavActive" : ""
                  }`}
                href='/'
              >
                {t("Home")}
              </Nav.Link>

              <Nav.Link
                className={`NavWord ${location.pathname === "/roomlist" ? "NavActive" : ""
                  }`}
                href='/roomlist'
              >
                {t("Room")}
              </Nav.Link>

              <Nav.Link
                className={`NavWord ${location.pathname === "/gallery" ? "NavActive" : ""
                  }`}
                href='/gallery'
              >
                {t("Gallery")}
              </Nav.Link>

              <Nav.Link
                className={`NavWord ${location.pathname === "/about-us" ? "NavActive" : ""
                  }`}
                href='/about-us'
              >
                {t("About")}
              </Nav.Link>

              <Nav.Link
                className={`NavWord ${location.pathname === "/news" ? "NavActive" : ""
                  }`}
                href='/news'
              >
                {t("News")}
              </Nav.Link>

              <Nav.Link
                className={`NavWord ${location.pathname === "/contact-us" ? "NavActive" : ""
                  }`}
                href='/contact-us'
              >
                {t("Contact")}
              </Nav.Link>

              <NavDropdown
                className='NavNoHighlightWord'
                title={t("Investment")}
                id='investment-dropdown'
              >
                <NavDropdown.Item href='/investment'>
                    {t("Investment")}
                </NavDropdown.Item>
                <NavDropdown.Item href='/cooperation'>
                    {t("Cooperation")}
                </NavDropdown.Item>
              </NavDropdown>

              <NavDropdown
                className='NavNoHighlightWord'
                title={"语言(Language)"}
                id='language-dropdown'
              >
                <NavDropdown.Item onClick={() => changeLanguage("zh")}>
                  中文
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => changeLanguage("en")}>
                  English
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Container>
          {/* <div className='NavContact ms-auto'>
            <Nav.Link className='NavNoHighlightWord' href='/contact-us'>
              +61 (03) 5157-8298
            </Nav.Link>
          </div> */} {/* Hide now comfirmed by John for text-warp problems */}
          <div className="PlaceholderDiv" />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
