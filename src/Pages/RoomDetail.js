import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../Css/RoomDetail.css";

const RoomDetail = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);

  useEffect(() => {
    fetch("/static_data/room.json")
      .then(response => response.json())
      .then(data => {
        const selectedRoom = data.rooms.find(r => r.id === parseInt(id));
        setRoom(selectedRoom);
      });
  }, [id]);

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
