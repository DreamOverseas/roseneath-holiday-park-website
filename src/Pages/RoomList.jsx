import axios from "axios";
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from 'react-bootstrap';
import Seo from "../Components/Seo";
import RoomSelectModal from "../Components/RoomSelectModal";
import "../Css/RoomList.css";

const hasRoomJsonContent = (room) => {
  try {
    const parsed = typeof room.RoomJson === 'string' ? JSON.parse(room.RoomJson) : room.RoomJson;
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
};

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [modalRoom, setModalRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { t, i18n } = useTranslation();

  const CMS_endpoint = import.meta.env.VITE_CMS_ENDPOINT;
  const CMS_token = import.meta.env.VITE_CMS_TOKEN;
  const DBLink_LH = 'https://book-directonline.com/properties/roseneathholidaypark-1';

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${CMS_endpoint}/api/room-types?populate=Cover`, {
          headers: {
            Authorization: `Bearer ${CMS_token}`,
          },
        });
        const sortedRooms = response.data.data.sort((a, b) => a.order - b.order);
        setRooms(sortedRooms);
      } catch (error) {
        console.error("Error loading:", error);
      }
    };

    fetchRooms();
  }, [CMS_endpoint, CMS_token]);

  const handleBookNow = (e, room) => {
    e.preventDefault();
    e.stopPropagation();
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

  return (
    <div className='room-list'>
      <Seo
        title="Roseneath Holiday Park Rooms | Lake Willinton Accommodation"
        description="View room types, cabins and camping options at Roseneath Holiday Park, including pet-friendly and family holiday accommodation."
        canonical="https://roseneathholidaypark.au/roomlist"
        image="/logo192.png"
        keywords="Roseneath Holiday Park rooms, Lake Willinton accommodation, campsite rooms, cabin booking"
      />

      <h1>{t("roomlist_title")}</h1>

      <div className="room-search-bar">
        <input
          type="text"
          className="form-control"
          placeholder={t("room_search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className='room-grid'>
        {filteredRooms.length > 0 ? (
          filteredRooms.map(room => (
            <div key={room.id} className='room-card-wrapper'>
              <div className='room-card' onClick={(e) => handleBookNow(e, room)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleBookNow(e, room)}>
                <img
                  src={`${CMS_endpoint}${room.Cover?.url}`}
                  alt={room.Name_en}
                  className='room-image'
                />
                <h2 className='room-name'>
                  {i18n.language === "zh" ? room.Name_zh : room.Name_en}
                </h2>
                <p className='room-subtitle'>{t("Room_max_guest") + room.Max_guest}</p>
                <p className='room-subtitle'>
                  {i18n.language === "zh" ? room.Title_zh : room.Title_en}
                </p>
              </div>
              {room.Availability ? (
                <Button
                  className="room-book-btn"
                  onClick={(e) => handleBookNow(e, room)}
                >
                  {t("book_Now")}
                </Button>
              ) : (
                <Button className="room-book-btn" variant="secondary" disabled>
                  {t("book_unavailable")}
                </Button>
              )}
            </div>
          ))
        ) : (
          <p className="text-muted">{t("room_no_results")}</p>
        )}
      </div>

      <RoomSelectModal
        show={showModal}
        onHide={() => setShowModal(false)}
        room={modalRoom}
        DBLink_LH={DBLink_LH}
      />
    </div>
  );
};

export default RoomList;
