import React, { useState } from 'react';
import { Modal, Tabs, Tab, Form, Button, InputGroup } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";

// Environment variable assignments to be used in API calls.
const CMS_endpoint = import.meta.env.VITE_CMS_ENDPOINT;
const CMS_token = import.meta.env.VITE_CMS_TOKEN;
const email_service_endpoint = import.meta.env.VITE_EMAIL_API_ENDPOINT;

const LoginModal = ({ show, handleClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // State to manage the active tab. Default is 'register'
  const [activeTab, setActiveTab] = useState('register');

  /* Registration form state variables */
  const [regUserName, setRegUserName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regVerificationCode, setRegVerificationCode] = useState('');
  // This state holds the generated verification code after "Send Code" is clicked.
  const [generatedCode, setGeneratedCode] = useState(null);
  // Holds error or status messages for registration actions.
  const [regError, setRegError] = useState('');

  /* Login form state variables */
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  // Holds error messages for login actions.
  const [loginError, setLoginError] = useState('');

  const [cooldown, setCooldown] = useState(0);

  /**
   * Helper function to validate email using a basic regex.
   */
  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  /**
 * Helper function to clear all form data in Modal
 */
  const clearModalData = () => {
    setRegEmail('');
    setLoginPassword('');
    setRegPassword('');
    setRegConfirmPassword('');
    setRegVerificationCode('');
    setRegError('');
  };

  /**
   * Handle clicking the "Send Code" button in the Registration tab.
   * Validates that required fields (User Name, Email, Password) are filled and that
   * the email address appears valid. If valid, generates a random 6-digit code,
   * stores it in state, and sends a POST request to the email service endpoint.
   */
  const handleSendCode = async () => {
    if (cooldown > 0) return;
    // Reset any existing error message.
    setRegError('');

    setCooldown(60);
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Check that required fields are populated.
    if (!regUserName || !regEmail || !regPassword) {
      setRegError('Please fill out Name, Email, and Password fields before sending the code.');
      setCooldown(3);
      return;
    }
    // Validate email format.
    if (!validateEmail(regEmail)) {
      setRegError('Invalid email address.');
      setCooldown(3);
      return;
    }
    // Generate a 6-digit code.
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    try {
      // Send code to the email service endpoint with the required details.
      const res = await fetch(`${email_service_endpoint}/do-mail-code-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verify_code: code,
          from: 'Roseneath Caravan Park',
          email: regEmail
        })
      });
      if (!res.ok) {
        setRegError('Failed to send verification code. Please try again.');
        setCooldown(0);
      } else {
        setRegError('Verification code sent successfully.');
      }
    } catch (error) {
      setRegError('Error sending verification code. Please try again.');
      setCooldown(0);
    }
  };

  /**
   * Handle registration form submission.
   * Validates that all fields are filled, the passwords match,
   * and that the entered verification code matches the one generated.
   */
  const handleRegister = async () => {
    // Reset any error message.
    setRegError('');

    // Validate that all fields are non-empty.
    if (!regUserName || !regEmail || !regPassword || !regConfirmPassword || !regVerificationCode) {
      setRegError('Please fill out all registration fields.');
      return;
    }
    // Check that password is at least 8 characters.
    if (regPassword.length < 8) {
      setRegError('Password must be over 8 charactors.');
      setCooldown(3);
      return;
    }
    // Validate that both password fields match.
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      setCooldown(3);
      return;
    }
    // Validate that the entered verification code matches the generated one.
    if (regVerificationCode !== generatedCode) {
      setRegError('Invalid verification code.');
      return;
    }

    try {
      // Create a new entry in the 'RHPMembership' collection type on Strapi.
      const req_body = JSON.stringify({
        data: {
          UserName: regUserName,
          Email: regEmail,
          Password: regPassword,
          IsMember: false
        }
      });
      const res = await fetch(`${CMS_endpoint}/api/rhp-memberships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CMS_token}`
        },
        body: req_body
      });
      if (res.ok) {
        const data = await res.json();
        // Set cookies for the authentication token and basic user details.
        Cookies.set('AuthToken', 'roseneath-holiday-park-website', { expires: 7 });
        const userCookie = {
          name: regUserName,
          email: regEmail,
          is_member: false
        };
        Cookies.set('user', JSON.stringify(userCookie));
        handleClose();
        clearModalData();
        navigate('/membership');
      } else {
        setRegError('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setRegError('Error during registration.');
    }
  };

  /**
   * Handle login form submission.
   * Sends entered email and password to the CMS_endpoint.
   * If a 400 response is returned, informs the user via an alert.
   * On success (200), retrieves the user data from Strapi using the email,
   * sets cookies accordingly, and navigates the user to the membership page.
   * Displays an inline error if credentials are incorrect.
   */
  const handleLogin = async () => {
    // Reset any existing login error message.
    setLoginError('');

    // Validate that both login fields are non-empty.
    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill out both email and password.');
      return;
    }

    try {
      // Send a POST request with the login credentials.
      const res = await fetch(`${CMS_endpoint}/api/rhp-memberships/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CMS_token}`
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });

      // If the response status is 400, alert the user.
      if (res.status === 400) {
        window.alert('Something is wrong, please contact us.');
        return;
      }
      // On success, fetch the full user details using the provided email.
      if (res.ok) {
        const userRes = await fetch(
          `${CMS_endpoint}/api/rhp-memberships?filters[Email][$eq]=${loginEmail}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${CMS_token}`
            }
          }
        );
        if (userRes.ok) {
          const userData = await userRes.json();
          const userAttributes = userData.data[0];
          // Create a base user cookie.
          let userCookie = {
            name: userAttributes.UserName,
            email: userAttributes.Email,
            is_member: userAttributes.IsMember
          };
          // If the user is a member, add additional fields to the cookie.
          if (userAttributes.IsMember) {
            userCookie = {
              ...userCookie,
              number: userAttributes.MembershipNumber || 'N/A',
              fname: userAttributes.FirstName || 'Not Specified',
              lname: userAttributes.LastName || 'Not Specified',
              contact: userAttributes.Contact || 'Not Specified',
              exp: userAttributes.ExpiryDate || 'N/A',
              point: userAttributes.Point || 'N/A',
              discount_p: userAttributes.DiscountPoint || 'N/A'
            };
          }
          Cookies.set('user', JSON.stringify(userCookie));
          Cookies.set('AuthToken', 'roseneath-holiday-park-website', { expires: 7 });
          handleClose();
          clearModalData();
          navigate('/membership');
        } else {
          setLoginError('Failed to retrieve user data.');
        }
      } else {
        setLoginError('Either email or password is wrong.');
      }
    } catch (error) {
      console.error(error);
      setLoginError('Error during login.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      {/* Modal Header with dynamic title based on active tab */}
      <Modal.Header closeButton>
        <Modal.Title><b>{activeTab === 'register' ? `${t("register")}` : `${t("login")}`}</b></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Tabs to switch between Register and Login. Default tab is Register */}
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} style={{ display: 'flex', flexDirection: 'row' }} fill >
          <Tab eventKey="register" title={t("register")} tabClassName="d-inline-block me-3">
            <Form className="mt-3">
              {/* User Name Field */}
              <Form.Group controlId="regUserName" className="mb-3">
                <Form.Label>{t("login_username")}</Form.Label>
                <Form.Control
                  type="text"
                  value={regUserName}
                  onChange={(e) => setRegUserName(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="regEmail" className="mb-3">
                <Form.Label>{t("email")}</Form.Label>
                <Form.Control
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="regPassword" className="mb-3">
                <Form.Label>{t("login_pwd")}</Form.Label>
                <Form.Control
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
                <Form.Text muted>Password should be over 8 charactors.</Form.Text>
              </Form.Group>

              <Form.Group controlId="regConfirmPassword" className="mb-3">
                <Form.Label>{t("login_comf_pwd")}</Form.Label>
                <Form.Control
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="regVerificationCode" className="mb-3">
                <Form.Label>{t("login_vrf_code")}</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    value={regVerificationCode}
                    onChange={(e) => setRegVerificationCode(e.target.value)}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={handleSendCode}
                    disabled={cooldown > 0}
                  >
                    {cooldown > 0 ? `${t("login_sent")}(${cooldown})` : `${t("login_send_code")}`}
                  </Button>
                </InputGroup>
              </Form.Group>

              {regError && <p className="text-danger">{regError}</p>}

              <div className="text-end d-grid gap-2">
                <Button variant="primary" onClick={handleRegister} className="mt-2" >
                  {t("contactForm_submit")}
                </Button>
              </div>
            </Form>
          </Tab>

          <Tab eventKey="login" title={t("login")} tabClassName="d-inline-block me-3">
            <Form className="mt-3">
              <Form.Group controlId="loginEmail" className="mb-3">
                <Form.Label>{t("email")}</Form.Label>
                <Form.Control
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="loginPassword" className="mb-3">
                <Form.Label>{t("login_pwd")}</Form.Label>
                <Form.Control
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </Form.Group>

              {loginError && <p className="text-danger">{loginError}</p>}

              <div className="text-end d-grid gap-2">
                <Button variant="primary" onClick={handleLogin}>
                  {t("login")}
                </Button>
              </div>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal >
  );
};

export default LoginModal;
