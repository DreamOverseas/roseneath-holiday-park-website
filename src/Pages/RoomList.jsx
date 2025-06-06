import axios from "axios";
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import "../Css/RoomList.css";

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const { t, i18n } = useTranslation();

  const CMS_endpoint = import.meta.env.VITE_CMS_ENDPOINT;
  const CMS_token = import.meta.env.VITE_CMS_TOKEN;

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${CMS_endpoint}/api/room-types?populate=Cover`, {
          headers: {
            Authorization: `Bearer ${CMS_token}`,
          },
        });

        // Sort rooms by "order" property in ascending order
        const sortedRooms = response.data.data.sort((a, b) => a.order - b.order);

        setRooms(sortedRooms);
      } catch (error) {
        console.error("Error loading:", error);
      }
    };

    fetchRooms();
  }, [CMS_endpoint, CMS_token]);

  return (
    <div className='room-list'>

      <h1>{t("roomlist_title")}</h1>
      <div className='room-grid'>
        {rooms.map(room => (
          <Link key={room.id} to={`/room/${room.Name_en}`} className='room-card'>
            <img src={`${CMS_endpoint}${room.Cover?.url}`} alt={room.Name_en} className='room-image' />
            <h2 className='room-name'>{i18n.language === "zh"
              ? room.Name_zh
              : room.Name_en}
            </h2>
            <br/>
            <p className='room-subtitle'>{t("Room_max_guest") + room.Max_guest} </p>
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
