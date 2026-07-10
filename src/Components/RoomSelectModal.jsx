import React from "react";
import { Modal, Button, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const parseRoomJson = (rawJson) => {
  try {
    const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const RoomSelectModal = ({ show, onHide, room, DBLink_LH }) => {
  const { t } = useTranslation();

  if (!room) return null;

  const roomOptions = parseRoomJson(room.RoomJson);

  const handleSelect = (uuid) => {
    window.open(`${DBLink_LH}?room_type=${uuid}`, '_blank', 'noopener,noreferrer');
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{t("room_select_title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted mb-3">{t("room_select_subtitle")}</p>
        <Row className="g-3">
          {roomOptions.map((option) => (
            <Col key={option.uuid} xs={12} sm={6} md={4}>
              <div
                className="room-select-option"
                onClick={() => handleSelect(option.uuid)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelect(option.uuid)}
                style={{
                  cursor: 'pointer',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  e.currentTarget.style.borderColor = '#0d6efd';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#dee2e6';
                }}
              >
                <img
                  src="https://placehold.co/300x200"
                  alt={option.name}
                  style={{ width: '100%', display: 'block' }}
                />
                <div style={{ padding: '8px 12px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', lineHeight: '1.4' }}>
                    {option.name}
                  </p>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t("room_select_close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RoomSelectModal;
