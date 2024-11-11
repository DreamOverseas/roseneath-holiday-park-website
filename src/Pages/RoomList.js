import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Css/RoomList.css";

const RoomList = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch("/static_data/room.json")
      .then(response => response.json())
      .then(data => setRooms(data.rooms));
  }, []);

  return (
    <div className='room-list'>
      <h1>Our Accommodations</h1>
      <div className='room-grid'>
        {rooms.map(room => (
          <Link key={room.id} to={`/room/${room.id}`} className='room-card'>
            <img src={room.image_path} alt={room.name} className='room-image' />
            <h2 className='room-name'>{room.name}</h2>
            <p className='room-subtitle'>{room.subtitle}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RoomList;
