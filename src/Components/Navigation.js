import React from "react";
import "../Css/Navigation.css";
import Container from 'react-bootstrap/Container';
import {Navbar, Nav, Figure, Button} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';


const Navigation = () => {

  const { t } = useTranslation();


    // TODO

    return (
      <Navbar bg="light" data-bs-theme="light" className="NavigationBar sticky-top">
        <Container>
          <Navbar.Brand href="/">
            <Figure.Image
              width={100}
              src="/logo192.png"
            />
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link className="NavWord" href="/">{t('Home')}</Nav.Link>
            <Nav.Link className="NavWord" href="/find-us">{t('Find us')}</Nav.Link>
            <Nav.Link className="NavWord" href="/gallery">{t('Gallery')}</Nav.Link>
            <Nav.Link className="NavWord" href="/about-us">{t('About')}</Nav.Link>
            <Nav.Link className="NavWord" href="/contact-us">{t('Contact')}</Nav.Link>
          </Nav>
          <Nav.Link className="NavWord" href="/contact-us">+61 (03) 5157-8298</Nav.Link>
          <Button className="NavWord">Contact us</Button>
        </Container>
      </Navbar>
    );
};

export default Navigation;
