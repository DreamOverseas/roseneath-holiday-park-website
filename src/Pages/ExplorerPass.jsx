import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Seo from "../Components/Seo";
import "../Css/ExplorerPass.css";

const ExplorerPass = () => {
  const { t } = useTranslation();
  const mail_API_endpoint = import.meta.env.VITE_EMAIL_ENQUIRY;

  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(mail_API_endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Name: formData.name,
          PhoneNumber: formData.phone,
          Email: formData.email,
          Subject: "Roseneath Explorer Pass Enquiry",
          Question: "I'm interested in the Roseneath Explorer Pass ($199/year). Please send me the payment details.",
        }),
      });

      if (response.ok) {
        setResponseMessage(t("explorerPass.formSuccess"));
        setFormData({ name: "", email: "", phone: "" });
      } else {
        setErrorMessage(t("explorerPass.formError"));
      }
    } catch (error) {
      setErrorMessage(t("explorerPass.formError"));
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    { typeKey: "explorerPass.rowUnpowered", benefitKey: "explorerPass.rowUnpoweredBenefit" },
    { typeKey: "explorerPass.rowPowered", benefitKey: "explorerPass.rowPoweredBenefit" },
    { typeKey: "explorerPass.rowPremium", benefitKey: "explorerPass.rowPremiumBenefit" },
    { typeKey: "explorerPass.rowCabin", benefitKey: "explorerPass.rowCabinBenefit" },
  ];

  const terms = ["explorerPass.term1", "explorerPass.term2", "explorerPass.term3", "explorerPass.term4"];

  return (
    <main className="explorer-pass-page">
      <Seo
        title="Roseneath Explorer Pass | Roseneath Holiday Park"
        description="Join the Roseneath Explorer Pass annual membership for exclusive camping and cabin discounts at Roseneath Holiday Park near Lake Willinton."
        canonical="https://roseneathholidaypark.au/explorer_pass"
        image="/logo192.png"
        keywords="Roseneath Explorer Pass, Roseneath Holiday Park membership, annual pass, camping discount"
      />

      <section className="explorer-hero">
        <Container>
          <span className="explorer-badge">{t("explorerPass.limitedBadge")}</span>
          <h1>{t("explorerPass.pageTitle")}</h1>
          <h2>{t("explorerPass.pageSubtitle")}</h2>
          <p className="explorer-tagline">{t("explorerPass.tagline")}</p>
        </Container>
      </section>

      <Container className="explorer-content">
        <Row className="align-items-stretch g-4">
          <Col lg={7}>
            <div className="explorer-card benefits-card">
              <h3>{t("explorerPass.benefitsTitle")}</h3>
              <div className="table-responsive">
                <Table className="benefits-table" borderless>
                  <thead>
                    <tr>
                      <th>{t("explorerPass.tableAccommodation")}</th>
                      <th>{t("explorerPass.tableBenefit")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benefits.map((row, idx) => (
                      <tr key={idx}>
                        <td>{t(row.typeKey)}</td>
                        <td>
                          <span className="benefit-pill">{t(row.benefitKey)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>

            <div className="explorer-card terms-card">
              <h3>{t("explorerPass.termsTitle")}</h3>
              <ul>
                {terms.map((key) => (
                  <li key={key}>{t(key)}</li>
                ))}
              </ul>
            </div>
          </Col>

          <Col lg={5}>
            <div className="explorer-card price-card">
              <span className="price-label">{t("explorerPass.priceLabel")}</span>
              <div className="price-value">{t("explorerPass.price")}</div>
              <span className="price-limited">{t("explorerPass.limitedBadge")}</span>
              <p className="price-intro">{t("explorerPass.intro")}</p>
            </div>

            <div className="explorer-card form-card">
              <h3>{t("explorerPass.formTitle")}</h3>
              <p className="form-subtitle">{t("explorerPass.formSubtitle")}</p>

              {responseMessage && <Alert variant="success">{responseMessage}</Alert>}
              {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>{t("explorerPass.formName")}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t("explorerPass.formNamePlaceholder")}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>{t("explorerPass.formEmail")}</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder={t("explorerPass.formEmailPlaceholder")}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="phone" className="mb-3">
                  <Form.Label>{t("explorerPass.formPhone")}</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder={t("explorerPass.formPhonePlaceholder")}
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button type="submit" className="explorer-submit-btn w-100" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    t("explorerPass.formSubmit")
                  )}
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default ExplorerPass;
