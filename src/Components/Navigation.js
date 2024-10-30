import React from "react";
import "../Css/Navigation.css";
import { Navbar, Nav, Figure, NavDropdown, Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const Navigation = () => {

  const { t, i18n } = useTranslation();
  const location = useLocation(); // Get the current URL path

  const changeLanguage = lng => {
    i18n.changeLanguage(lng);
    // Cookies.set("i18next", lng, { expires: 7 });
  };

  return (
    <Navbar bg="light" expand="lg" data-bs-theme="light" className="NavigationBar sticky-top">
      <Container>

        <Navbar.Brand href="/">
          <Figure.Image width={100} src="/logo192.png" />
        </Navbar.Brand>

        {/* Toggle button for smaller screens */}
        <Navbar.Toggle className="NavToggle" aria-controls="basic-navbar-nav" />
        {/* Collapsible navigation menu */}
        <Navbar.Collapse id="basic-navbar-nav">
          
            <Nav className="mx-auto justify-content-center">
              <Nav.Link
                className={`NavWord ${location.pathname === '/' ? 'NavActive' : ''}`}
                href="/"
              >
                {t('Home')}
              </Nav.Link>
              <Nav.Link
                className={`NavWord ${location.pathname === '/find-us' ? 'NavActive' : ''}`}
                href="/find-us"
              >
                {t('Find us')}
              </Nav.Link>
              <Nav.Link
                className={`NavWord ${location.pathname === '/gallery' ? 'NavActive' : ''}`}
                href="/gallery"
              >
                {t('Gallery')}
              </Nav.Link>
              
              <Nav.Link
                className={`NavWord ${location.pathname === '/about-us' ? 'NavActive' : ''}`}
                href="/about-us"
              >
                {t('About')}
              </Nav.Link>
              <Nav.Link
                className={`NavWord ${location.pathname === '/contact-us' ? 'NavActive' : ''}`}
                href="/contact-us"
              >
                {t('Contact')}
              </Nav.Link>
              <NavDropdown className="NavNoHighlightWord" title={t("Language")} id='language-dropdown'>
                <NavDropdown.Item onClick={() => changeLanguage("en")}>
                  English
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => changeLanguage("zh")}>
                  中文
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
            

            <div className="NavContact ms-auto">
              <Nav.Link className="NavNoHighlightWord" href="/contact-us">+61 (03) 5157-8298</Nav.Link>
            </div>

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
