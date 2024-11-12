import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../Css/RoomDetail.css";

const RoomDetail = () => {
  const { Name_en } = useParams();
  const [room, setRoom] = useState(null);

  // useEffect(() => {
  //   fetch("/static_data/room.json")
  //     .then(response => response.json())
  //     .then(data => {
  //       const selectedRoom = data.rooms.find(r => r.id === parseInt(id));
  //       setRoom(selectedRoom);
  //     });
  // }, [id]);

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
        
        setRoom(response.data.data.find(r => r.Name_en === Name_en));
      } catch (error) {
        console.error("Error loading:", error);
      }
    };
  
    fetchRooms();
  }, []);

  if (!room) return <div>Loading...</div>;

  return (
    <div className='room-detail'>
      <img
        src={room.image_path}
        alt={room.name}
        className='room-detail-image'
      />
      <h1 className='room-detail-name'>{room.name}</h1>
      <p className='room-detail-subtitle'>{room.subtitle}</p>
      <p className='room-detail-description'>{room.description}</p>
    </div>
  );
};

export default RoomDetail;
