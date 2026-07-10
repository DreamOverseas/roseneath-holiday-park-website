import React, { useState } from "react";
import { Container, Button, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import RoomSelectModal from "./RoomSelectModal";

const hasRoomJsonContent = (room) => {
  try {
    const parsed = typeof room.RoomJson === 'string' ? JSON.parse(room.RoomJson) : room.RoomJson;
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
};

const RoomSection = ({ rooms, CMS_endpoint, DBLink_LH }) => {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [modalRoom, setModalRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleBookNow = (room) => {
    if (hasRoomJsonContent(room)) {
      setModalRoom(room);
      setShowModal(true);
    } else {
      window.open(`${DBLink_LH}?room_type=${room.RoomTypeID}`, '_blank', 'noopener,noreferrer');
    }
  };

  const filteredRooms = rooms.filter((room) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (room.Name_en?.toLowerCase() || "").includes(term) ||
      (room.Name_zh || "").includes(term)
    );
  });

  const isSearching = search.trim() !== "";

  const sliderSettings = {
    dots: true,
    infinite: rooms.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 768,
        settings: { slidesToShow: 2, slidesToScroll: 1 },
      },
      {
        breakpoint: 576,
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
    ],
  };

  const renderRoomCard = (room) => (
    <Card className="home-room-card">
      {room.Cover?.url ? (
        <Card.Img
          variant="top"
          src={`${CMS_endpoint}${room.Cover.url}`}
          alt={room.Name_en}
          className="slider-card-img"
        />
      ) : (
        <Card.Img
          variant="top"
          src="https://placehold.co/250x350"
          alt="Placeholder"
          className="slider-card-img"
        />
      )}
      <Card.Body>
        <Card.Title>
          {i18n.language === "zh" ? room.Name_zh : room.Name_en}
        </Card.Title>
        <p className="home-room-card-subtitle">
          {i18n.language === "zh" ? room.Title_zh : room.Title_en}
        </p>
        <Card.Text>
          {i18n.language === "zh" ? room.Description_zh : room.Description_en}
        </Card.Text>
        {room.Availability ? (
          <Button onClick={() => handleBookNow(room)}>{t("book_Now")}</Button>
        ) : (
          <Button variant="secondary">{t("book_unavailable")}</Button>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <section className="room-presentation activities-section">
      <Container>
        <h1>{t("Room")}</h1>

        <div className="mb-4">
          <input
            type="text"
            className="form-control"
            placeholder={t("room_search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '400px', margin: '0 auto', display: 'block' }}
          />
        </div>

        {isSearching ? (
          <div className="d-flex flex-wrap gap-3 justify-content-center mb-3">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <div key={room.id} style={{ width: '250px' }}>
                  {renderRoomCard(room)}
                </div>
              ))
            ) : (
              <p className="text-muted">{t("room_no_results")}</p>
            )}
          </div>
        ) : (
          <Slider {...sliderSettings}>
            {rooms.map((room) => (
              <div key={room.id} className="room_slider-card">
                {renderRoomCard(room)}
              </div>
            ))}
          </Slider>
        )}

        <div className="more-btn-container">
          <a href="/roomlist" className="gallery-link">
            {t("btn_more")}
          </a>
        </div>
      </Container>

      <RoomSelectModal
        show={showModal}
        onHide={() => setShowModal(false)}
        room={modalRoom}
        DBLink_LH={DBLink_LH}
      />
    </section>
  );
};

export default RoomSection;
