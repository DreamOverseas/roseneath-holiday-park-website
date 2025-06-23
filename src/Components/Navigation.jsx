import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { Container, Figure, Nav, Navbar, NavDropdown, Button, Image } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import LoginModal from './LoginModal.jsx';
import "../Css/Navigation.css";

const Navigation = () => {
  const { t, i18n } = useTranslation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [logoPath, setLogoPath] = useState('/logo192.png');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedLanguage = Cookies.get("i18nextLng") || "en";
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab === 'login' || tab === 'register') {
      setShowLoginModal(true);
    }
  }, [location.search]);

  const changeLanguage = lng => {
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(lng);
      Cookies.set("i18nextLng", lng, { expires: 365 });
      setLogoPath(lng === "zh" ? '/logo192_chinese.png' : '/logo192.png');
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


  // Replace the return statement with this updated version:

  return (
    <div className="navWholeBar">
      <Navbar
        bg='light'
        expand='lg'
        data-bs-theme='light'
        className='NavigationBar sticky-top'
      >
        <Container fluid>
          {/* Brand logo - will be centered on mobile */}
          <Navbar.Brand className="navbar-brand-custom">
            <Figure.Image width={"120px"} height={"120px"} src={logoPath} />
          </Navbar.Brand>
          
          {/* Toggle button for smaller screens */}
          <Navbar.Toggle className='NavToggle' aria-controls='basic-navbar-nav' />
          
          {/* Collapsible navigation menu */}
          <Navbar.Collapse id='basic-navbar-nav'>
            <Container>
              <Nav className='NavContainer'>
                <Nav.Link
                  className={`NavWord ${location.pathname === "/" ? "NavActive" : ""}`}
                  href='/'
                >
                  {t("Home")}
                </Nav.Link>

                <NavDropdown
                  className='NavNoHighlightWord'
                  title={t("Booking")}
                >
                  <NavDropdown.Item href='/roomlist'>
                    {t("Room")}
                  </NavDropdown.Item>
                  <NavDropdown.Item href='/book-membership'>
                    {t("BookMembership")}
                  </NavDropdown.Item>
                  <NavDropdown.Item href='/eco-and-culture-tours'>
                    {t("EcoAndCultureTours")}
                  </NavDropdown.Item>
                </NavDropdown>

                <Nav.Link
                  className={`NavWord ${location.pathname === "/gallery" ? "NavActive" : ""}`}
                  href='/gallery'
                >
                  {t("Gallery")}
                </Nav.Link>

                <NavDropdown
                  className='NavNoHighlightWord'
                  title={t("News")}
                >
                  <NavDropdown.Item href='/news'>
                    {t("HolidayGuests")}
                  </NavDropdown.Item>
                  <NavDropdown.Item href='/annual-news'>
                    {t("AnnualNews")}
                  </NavDropdown.Item>
                  <NavDropdown.Item href='/permanent-news'>
                    {t("PermanentNews")}
                  </NavDropdown.Item>
                </NavDropdown>

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
                  className='NavNoHighlightWord nav-language'
                  title={<Image
                    src={'/home/languages.png'}
                    width={40}
                    height={40}
                    alt="Language icon"
                  />}
                  id='language-dropdown'
                >
                  <NavDropdown.Item onClick={() => changeLanguage("zh")}>
                    中文
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => changeLanguage("en")}>
                    English
                  </NavDropdown.Item>
                </NavDropdown>
                
                {/* Move login button inside Nav for better mobile layout */}
                <div className="text-center nav-login-button">
                  <Button
                    onClick={handleAuthButtonClick}
                    variant={userCookie ? (location.pathname === "/membership" ? "danger" : "primary") : "primary"}
                  >
                    {userCookie ? (location.pathname === "/membership" ? `${t("membership_logout")}` : `${t("membership_center")}`) : `${t("membership_reglog")}`}
                  </Button>
                </div>
              </Nav>
            </Container>
          </Navbar.Collapse>
          
          <LoginModal
            show={showLoginModal}
            handleClose={() => setShowLoginModal(false)}
          />
        </Container>
      </Navbar>
    </div>
  );
};

export default Navigation;
