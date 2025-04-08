import axios from "axios";
import Cookies from "js-cookie";
import React, { useContext, useState } from "react";
import {
  Button,
  Col,
  Form,
  Modal,
  Row,
  Tab,
  Nav,
  Image,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Auth/AuthContext.jsx";
// import "../css/LoginModal.css";

const BACKEND_HOST = import.meta.env.VITE_CMS_ENDPOINT;

const LoginModal = ({ show, handleClose }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeKey, setActiveKey] = useState("sign-in");
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignin = async event => {
    event.preventDefault();
    setSubmitted(true);
    setError(null);

    if (email && password) {
      try {
        await login(email, password);
        navigate("/"); 
        handleClose();
      } catch (error) {
        const errorMessage =
          error.response?.data?.error?.message || t("error_occurred");
        setError(errorMessage);
      }
    }
  };

  const handleSignup = async event => {
    event.preventDefault();
    setSubmitted(true);
    setError(null);

    if (email && password && confirmedPassword && password === confirmedPassword) {
      try {
        const response = await axios.post(
          `${BACKEND_HOST}/api/auth/local/register`,
          {
            username,
            email,
            password
          }
        );

        await login(email, password);
        Cookies.set("token", response.data.jwt, { expires: 7 });
        navigate("/");
        handleClose();
      } catch (error) {
        const errorMessage =
          error.response?.data?.error?.message || t("error_occurred");
        setError(errorMessage);
      }
    } else {
      setError(t("password_mismatch"));
      console.log(error);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="login-modal-custom-modal-dialog"
      contentClassName="login-modal-custom-modal-content"
    >
      <Modal.Header closeButton>
        <Modal.Title>{t(activeKey === "sign-in" ? "sign_in" : "sign_up")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          {/* show image based on activeKey */}
          <Col md={5} className="d-flex justify-content-center align-items-center">
            <Image
              className="login-modal-login-image-display"
              src={activeKey === "sign-in" ? t("sign_in_image") : t("sign_up_image")}
              fluid
            />
          </Col>

          {/* form area */}
          <Col md={7}>
            <Tab.Container
              activeKey={activeKey}
              onSelect={(key) => setActiveKey(key)}
            >
              <Row className="justify-content-center">
                <Tab.Content>
                  
                  {/* sign in form */}
                  <Tab.Pane eventKey="sign-in">
                    <h4 style={{textAlign: "center"}}>{t("sign_in_panel_title")}</h4>
                    <Form onSubmit={handleSignin}>
                      <Form.Group controlId="userEmail" className="login-modal-form-group">
                        <Form.Label className="login-modal-form-label">{t("email")}</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder={t("enter_email")}
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          isInvalid={submitted && !email}
                          className="login-modal-form-control"
                        />
                        <Form.Control.Feedback type="invalid" className="login-modal-invalid-feedback">
                          {t("email_invalid")}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group controlId="userPassword" className="login-modal-form-group">
                        <Form.Label className="login-modal-form-label">{t("password")}</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder={t("enter_password")}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          isInvalid={submitted && !password}
                          className="login-modal-form-control"
                        />
                        <Form.Control.Feedback type="invalid" className="login-modal-invalid-feedback">
                          {t("password_required")}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <div className="login-modal-form-button-container">
                        <Button variant="primary" type="submit" className="login-modal-submit-btn">
                          {t("sign_in")}
                        </Button>
                      </div>
                    </Form>

                    {/* "Do not have an account?" */}
                    <div className="text-center mt-3">
                      <p>
                        {t("noAccount")}
                        <Nav.Link 
                          eventKey="sign-up" 
                          onClick={() => setActiveKey("sign-up")} 
                          className="d-inline-block login-modal-nav-link-Login"
                        >
                          {t("sign_up")}
                        </Nav.Link>
                      </p>
                    </div>
                  </Tab.Pane>

                  {/* sign up form */}
                  <Tab.Pane eventKey="sign-up">
                    <h4 style={{textAlign: "center"}}>{t("sign_up_panel_title")}</h4>
                    <Form onSubmit={handleSignup}>
                      <Form.Group controlId="userUsername" className="login-modal-form-group">
                        <Form.Label className="login-modal-form-label">{t("username")}</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t("enter_username")}
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          isInvalid={submitted && !username}
                          className="login-modal-form-control"
                        />
                        <Form.Control.Feedback type="invalid" className="login-modal-invalid-feedback">
                          {t("username_invalid")}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group controlId="userEmail" className="login-modal-form-group">
                        <Form.Label className="login-modal-form-label">{t("email")}</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder={t("enter_email")}
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          isInvalid={submitted && !email}
                          className="login-modal-form-control"
                        />
                        <Form.Control.Feedback type="invalid" className="login-modal-invalid-feedback">
                          {t("email_invalid")}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group controlId="userPassword" className="login-modal-form-group">
                        <Form.Label className="login-modal-form-label">{t("password")}</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder={t("enter_password")}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          isInvalid={submitted && !password}
                          className="login-modal-form-control"
                        />
                        <Form.Control.Feedback type="invalid" className="login-modal-invalid-feedback">
                          {t("password_required")}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group controlId="confirmedPassword" className="login-modal-form-group">
                        <Form.Label className="login-modal-form-label">{t("confirm_password")}</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder={t("confirm_password")}
                          value={confirmedPassword}
                          onChange={e => setConfirmedPassword(e.target.value)}
                          isInvalid={submitted && password !== confirmedPassword}
                          className="login-modal-form-control"
                        />
                        <Form.Control.Feedback type="invalid" className="login-modal-invalid-feedback">
                          {t("password_mismatch")}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <div className="login-modal-form-button-container">
                        <Button variant="primary" type="submit" className="login-modal-submit-btn">
                          {t("sign_up")}
                        </Button>
                      </div>
                    </Form>

                    {/* "Already have an account?"*/}
                    <div className="text-center mt-3">
                      <p>
                        {t("hasAccount")}
                        <Nav.Link 
                          eventKey="sign-in" 
                          onClick={() => setActiveKey("sign-in")} 
                          className="d-inline-block login-modal-nav-link-Login"
                        >
                          {t("sign_in")}
                        </Nav.Link>
                      </p>
                    </div>
                  </Tab.Pane>
                </Tab.Content>
              </Row>
            </Tab.Container>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;