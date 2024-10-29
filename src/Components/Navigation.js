import React from "react";
import "../Css/Navigation.css";
import Container from 'react-bootstrap/Container';
import {Navbar, Nav, Figure} from 'react-bootstrap';

const Navigation = () => {

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
            <Nav.Link className="NavWord" href="/">Home</Nav.Link>
            <Nav.Link className="NavWord" href="/find-us">Find us</Nav.Link>
            <Nav.Link className="NavWord" href="/gallery">Gallery</Nav.Link>
            <Nav.Link className="NavWord" href="/about-us">About</Nav.Link>
            <Nav.Link className="NavWord" href="/contact-us">Contact</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    );
};

export default Navigation;
