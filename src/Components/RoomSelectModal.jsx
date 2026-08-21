import React, { useEffect, useState } from "react";
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

const getMapCoordinates = (option) => {
  const firstCoordinate = Number(option.longitude);
  const secondCoordinate = Number(option.latitude);

  if (!Number.isFinite(firstCoordinate) || !Number.isFinite(secondCoordinate)) {
    return null;
  }

  if (Math.abs(firstCoordinate) <= 90 && Math.abs(secondCoordinate) > 90) {
    return { latitude: firstCoordinate, longitude: secondCoordinate };
  }

  return { latitude: secondCoordinate, longitude: firstCoordinate };
};

const RoomSelectModal = ({ show, onHide, room, DBLink_LH }) => {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState(null);
  const [copied, setCopied] = useState(false);
  const roomOptions = room ? parseRoomJson(room.RoomJson) : [];

  useEffect(() => {
    setSelectedOption(roomOptions[0] || null);
    setCopied(false);
  }, [room]);

  if (!room) return null;

  const selectedCoordinates = selectedOption ? getMapCoordinates(selectedOption) : null;

  const handleBook = () => {
    if (!selectedOption) return;

    window.open(`${DBLink_LH}?room_type=${selectedOption.uuid}`, '_blank', 'noopener,noreferrer');
    onHide();
  };

  const handleOpenInGoogleMaps = () => {
    if (!selectedCoordinates) return;

    window.open(
      `https://www.google.com/maps?q=${selectedCoordinates.latitude},${selectedCoordinates.longitude}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleCopyCoordinates = async () => {
    if (!selectedCoordinates) return;

    const text = `${selectedCoordinates.latitude}, ${selectedCoordinates.longitude}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" scrollable backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{t("room_select_title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted mb-3">{t("room_select_subtitle")}</p>
        <Row className="g-3 align-items-stretch">
          <Col xs={12} md={4}>
            <div className="d-grid gap-2">
              {roomOptions.map((option) => (
                <Button
                  key={option.uuid}
                  variant={selectedOption?.uuid === option.uuid ? "primary" : "outline-secondary"}
                  className="text-start"
                  onClick={() => {
                    setSelectedOption(option);
                    setCopied(false);
                  }}
                >
                  {option.name}
                </Button>
              ))}
            </div>
          </Col>
          <Col xs={12} md={8}>
            {selectedCoordinates ? (
              <>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                  <span className="text-muted">
                    {selectedCoordinates.latitude}, {selectedCoordinates.longitude}
                  </span>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-secondary" onClick={handleCopyCoordinates}>
                      {copied ? t("room_select_copied") : t("room_select_copy_coordinates")}
                    </Button>
                    <Button size="sm" variant="outline-primary" onClick={handleOpenInGoogleMaps}>
                      {t("room_select_open_in_maps")}
                    </Button>
                  </div>
                </div>
                <iframe
                  title={selectedOption.name}
                  src={`https://www.google.com/maps?q=${selectedCoordinates.latitude},${selectedCoordinates.longitude}&t=k&z=16&output=embed`}
                  width="100%"
                  height="360"
                  style={{ border: 0, minHeight: '280px' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </>
            ) : (
              <p className="text-muted">{t("room_select_map_unavailable")}</p>
            )}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t("room_select_close")}
        </Button>
        <Button onClick={handleBook} disabled={!selectedOption}>
          {t("book_Now")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RoomSelectModal;
