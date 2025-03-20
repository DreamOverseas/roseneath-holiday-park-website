import axios from "axios";
import React, { useEffect, useState } from "react";
import { Row, Button, Modal } from 'react-bootstrap';
import { useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import "../Css/RoomDetail.css";

const RoomDetail = () => {
  const { Name_en } = useParams();
  const [room, setRoom] = useState(null);
  const { t, i18n } = useTranslation();

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // useEffect(() => {
  //   fetch("/static_data/room.json")
  //     .then(response => response.json())
  //     .then(data => {
  //       const selectedRoom = data.rooms.find(r => r.id === parseInt(id));
  //       setRoom(selectedRoom);
  //     });
  // }, [id]);

  const CMS_endpoint = import.meta.env.VITE_CMS_ENDPOINT;
  const CMS_token = import.meta.env.VITE_CMS_TOKEN;
  const DBLink_LH = 'https://book-directonline.com/properties/roseneathholidaypark-1'

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${CMS_endpoint}/api/room-types?populate=Cover`, {
          headers: {
            Authorization: `Bearer ${CMS_token}`,
          },
        });

        setRoom(response.data.data.find(r => r.Name_en === Name_en));
      } catch (error) {
        console.error("Error loading:", error);
      }
    };

    fetchRooms();
  }, [CMS_endpoint, CMS_token, Name_en]);

  if (!room) return <div>Loading...</div>;

  return (
    <div className='room-detail'>
      <h1 className='room-detail-name'>{i18n.language === "zh"
        ? room.Name_zh
        : room.Name_en}
      </h1>
      <button onClick={handleShow}>
        <img
          src={`${CMS_endpoint}${room.Cover.url}`}
          alt={room.Name_en}
          className='room-detail-image'
        />
      </button>

      <Modal fullscreen={true} show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className="ms-auto">
            <h1 className='room-detail-name'>{i18n.language === "zh"
              ? room.Name_zh
              : room.Name_en}
            </h1>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img
            src={`${CMS_endpoint}${room.Cover.url}`}
            alt={room.Name_en}
            className='room-detail-image'
          />
        </Modal.Body>
      </Modal>
      <p className='room-detail-subtitle'>{i18n.language === "zh"
        ? room.Title_zh
        : room.Title_en}
      </p>
      {/* Set description with the more detailed info */}
      <div dangerouslySetInnerHTML={i18n.language === "zh"
        ? { __html: room.Details_zh }
        : { __html: room.Details_en }
      } />

      <Row className="home-contact-us-btn-container">
        <a href={`${DBLink_LH}?room_type=${room.RoomTypeID}`} target="_blank" rel="noopener noreferrer">
          <Button className="room-detail-book-btn">{t("book_Now")}</Button>
        </a>
      </Row>
    </div>
  );
};

export default RoomDetail;
