import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { Container, Figure, Nav, Navbar, NavDropdown, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import LoginModal from './LoginModal.jsx';
import "../Css/Navigation.css";

const Navigation = () => {
  const { t, i18n } = useTranslation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  const userCookie = Cookies.get("user");

  const handleAuthButtonClick = () => {
    if (userCookie) {
      if (location.pathname === "/membership") {
        Cookies.remove("user");
        Cookies.remove("AuthToken");
        navigate("/");
      } else {
        navigate("/membership");
      }
    } else {
      setShowLoginModal(true);
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
          <Figure.Image width={"100px"} src='/logo192.png' />
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
                className={`NavWord ${location.pathname === "/news" ? "NavActive" : ""
                  }`}
                href='/news'
              >
                {t("News")}
              </Nav.Link>

              <NavDropdown
                className='NavNoHighlightWord'
                title={t("About")}
              >
                <NavDropdown.Item href='/about-us'>
                  {t("About-us")}
                </NavDropdown.Item>
                <NavDropdown.Item href='/contact-us'>
                  {t("Contact")}
                </NavDropdown.Item>
                <NavDropdown.Item href='/policy'>
                  {t("Policy")}
                </NavDropdown.Item>
              </NavDropdown>

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
          <div className="text-center nav-login-button">
            <Button
              onClick={handleAuthButtonClick}
              variant={userCookie ? (location.pathname === "/membership" ? "danger" : "primary") : "primary"}
            >
              {userCookie ? (location.pathname === "/membership" ? `${t("membership_logout")}` : `${t("membership_center")}`) : `${t("membership_reglog")}`}
            </Button>
          </div>

          {/* <div className='NavContact ms-auto'>
            <Nav.Link className='NavNoHighlightWord' href='/contact-us'>
              +61 (03) 5157-8298
            </Nav.Link>
          </div> */} {/* Hide now comfirmed by John for text-warp problems */}
        </Navbar.Collapse>
        <LoginModal
          show={showLoginModal}
          handleClose={() => setShowLoginModal(false)}
        />
      </Container>
    </Navbar>

  );
};

export default Navigation;
