// Designed for using in membership market
import React, { useState, useEffect } from 'react';

const AlternatingText = ({ text1, text2, judge = 1 }) => {
    const [showFirst, setShowFirst] = useState(true);

    useEffect(() => {
      if (judge <= 0.01) {
        return;
      }
      const timer = setInterval(() => {
        setShowFirst((prev) => !prev);
      }, 3000);
      return () => clearInterval(timer);
    }, [judge]);
  
    const message =
        judge <= 0.01
        ? <text>{text1}</text>
        : showFirst
        ? <text>{text1}</text>
        : <text style={{ color: 'RoyalBlue' }}>{text2}</text>;
  
    return <span style={{ whiteSpace: 'nowrap' }}>{message}</span>;
};

export default AlternatingText;
