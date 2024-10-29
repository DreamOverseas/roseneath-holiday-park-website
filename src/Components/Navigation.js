import React from "react";
import "../Css/Navigation.css";
import Container from 'react-bootstrap/Container';
import { Navbar, Nav, Figure, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const Navigation = () => {
  const { t } = useTranslation();
  const location = useLocation(); // Get the current URL path

  return (
    <Navbar bg="light" data-bs-theme="light" className="NavigationBar sticky-top">
      <Container>
        <Navbar.Brand href="/">
          <Figure.Image width={100} src="/logo192.png" />
        </Navbar.Brand>

        <Nav>
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
        </Nav>

        <div className="NavContact">
          <Nav.Link className="NavContactWord" href="/contact-us">+61 (03) 5157-8298</Nav.Link>
          <Button className="NavContactWord" >{t('Contact us')}</Button>
        </div>
        
      </Container>
    </Navbar>
  );
};

export default Navigation;
