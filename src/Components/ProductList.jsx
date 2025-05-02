import React, { useState } from 'react';
import { Row, Col, Card, Button, Pagination } from 'react-bootstrap';
import AlternatingText from './AlternatingText';
import { useTranslation } from "react-i18next";
import '../Css/MemberCenter.css';

const ProductList = ({ filteredProducts, handleCardClick, handleRedeemClick }) => {
  if (!filteredProducts) return;

  const { t } = useTranslation();

  const pageSize = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (pageNumber) => {
    // Ensure pageNumber is within bounds
    const newPage = Math.max(1, Math.min(totalPages, pageNumber));
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Product grid for current page */}
      <Row>
        {paginatedProducts.map(product => {
          const { id, Name, Icon, Price, MaxDeduction } = product;
          const iconUrl = Icon?.url
            ? `${import.meta.env.VITE_CMS_ENDPOINT}${Icon.url}`
            : '';

          return (
            <Col md={4} key={id} className="mb-4">
              <Card>
                <Card.Body
                  onClick={() => handleCardClick(product)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Title className="h-12 overflow-hidden text-center flex items-center justify-center">{Name}</Card.Title>

                  {iconUrl && (
                    <Card.Img
                      variant="top"
                      src={iconUrl}
                      alt={Name}
                      className="mb-3"
                      style={{ objectFit: 'cover', height: '200px' }}
                    />
                  )}

                  <Row className="text-center d-flex">
                    <AlternatingText
                      text1={`${Price} ${t("membership_total_point")}`}
                      text2={`${t("membership_max_dis")}${Math.min(Price, MaxDeduction)}!`}
                      judge={MaxDeduction}
                    />
                  </Row>
                </Card.Body>

                <Card.Footer>
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={(e) => handleRedeemClick(product, e)}
                  >
                    {t("membership_redeem")}
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Pagination className="justify-content-center">
        {/* 1. Prev */}
        <Pagination.Prev
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />

        {/* 2. ALL your page‑number buttons */}
        {Array.from({ length: totalPages }, (_, idx) => {
          const page = idx + 1;
          return (
            <Pagination.Item
              key={page}
              active={page === currentPage}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Pagination.Item>
          );
        })}

        {/* 3. Next */}
        <Pagination.Next
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </Pagination>

    </>
  );
};

export default ProductList;
