import React from "react";
import "../Css/Navigation.css";
import Container from 'react-bootstrap/Container';
import {Navbar, Nav} from 'react-bootstrap';

const Navigation = () => {

    // TODO

    return (
      <Navbar bg="light" data-bs-theme="light">
        <Container>
          <Navbar.Brand href="/">Navbar</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/find-us">FindUs</Nav.Link>
            <Nav.Link href="/gallery">Gallery</Nav.Link>
            <Nav.Link href="/about-us">About</Nav.Link>
            <Nav.Link href="/contact-us">Contact</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    );
};

export default Navigation;
