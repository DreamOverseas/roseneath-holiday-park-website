import axios from "axios";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import "../Css/RoomList.css";

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const { t, i18n } = useTranslation();

  const CMS_endpoint = process.env.REACT_APP_CMS_ENDPOINT;
  const CMS_token = process.env.REACT_APP_CMS_TOKEN;

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${CMS_endpoint}/api/room-types?populate=Cover`, {
          headers: {
            Authorization: `Bearer ${CMS_token}`,
          },
        });
        setRooms(response.data.data);
      } catch (error) {
        console.error("Error loading:", error);
      }
    };

    fetchRooms();
  }, [CMS_endpoint, CMS_token]);

  return (
    <div className='room-list'>
      <Helmet>
        <title>Rooms - Roseneath Holiday Park</title>
        <meta name="description" content="Showing different types of rooms for the Roseneath Holiday Park near Lake Willinton, the place for Camping, Caravan and Accomadation in the nature." />
        <meta name="keywords" content="Rooms, Holiday, Roseneath, Camp, Caravan, Wild, Nature, Exploration, Willinton, Lake, Beach, Accomadation, Food, Service, Course, Facility, Storage, Landscape" />
      </Helmet>

      <h1>{t("roomlist_title")}</h1>
      <div className='room-grid'>
        {rooms.map(room => (
          <Link key={room.id} to={`/room/${room.Name_en}`} className='room-card'>
            <img src={`${CMS_endpoint}${room.Cover.url}`} alt={room.Name_en} className='room-image' />
            <h2 className='room-name'>{i18n.language === "zh"
              ? room.Name_zh
              : room.Name_en}
            </h2>
            <p className='room-subtitle'>{i18n.language === "zh"
              ? room.Title_zh
              : room.Title_en}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RoomList;
