import React, { useState, useEffect } from 'react';

const AnalysisGraph = () => {
  const [data, setData] = useState({
    totalReservations: 0,
    roomTypes: {},
    bookingsByDate: {}
  });

  useEffect(() => {
    fetchAndParseCSV();
  }, []);

  const fetchAndParseCSV = async () => {
    try {
      const response = await fetch('/reservations.csv');
      const text = await response.text();
      parseCSV(text);
    } catch (error) {
      console.error('Error loading CSV:', error);
    }
  };

  const parseCSV = (text) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    
    let totalReservations = 0;
    const roomTypes = {};
    const bookingsByDate = {};

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = parseCSVLine(lines[i]);
      if (values.length < headers.length) continue;

      totalReservations++;

      // Parse room types
      const roomType = values[11]?.trim() || 'Not Specified';
      if (roomType) {
        roomTypes[roomType] = (roomTypes[roomType] || 0) + 1;
      }

      // Parse booking date
      const bookedDate = values[0]?.trim();
      if (bookedDate) {
        bookingsByDate[bookedDate] = (bookingsByDate[bookedDate] || 0) + 1;
      }
    }

    setData({
      totalReservations,
      roomTypes,
      bookingsByDate
    });
  };

  const parseCSVLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    
    return values;
  };

  const BarChart = ({ data, title, color = 'bg-blue-500' }) => {
    if (!data || Object.keys(data).length === 0) {
      return <div className="text-gray-500">No data available</div>;
    }

    const maxValue = Math.max(...Object.values(data));
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-3">
          {entries.map(([label, value]) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-48 text-sm truncate" title={label}>
                {label || 'Unknown'}
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className={`${color} h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                    style={{ width: `${(value / maxValue) * 100}%` }}
                  >
                    <span className="text-white text-xs font-semibold">
                      {value}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TimelineChart = ({ data, title }) => {
    if (!data || Object.keys(data).length === 0) {
      return <div className="text-gray-500">No data available</div>;
    }

    const sortedEntries = Object.entries(data).sort((a, b) => {
      const dateA = parseDate(a[0]);
      const dateB = parseDate(b[0]);
      return dateA - dateB;
    });

    const maxValue = Math.max(...Object.values(data));

    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="overflow-x-auto">
          <div className="min-w-full flex items-end gap-2 h-64 pb-8">
            {sortedEntries.map(([date, value]) => (
              <div key={date} className="flex-1 flex flex-col items-center justify-end h-full min-w-12">
                <div className="text-xs font-semibold mb-1 text-gray-700">
                  {value}
                </div>
                <div
                  className="w-full bg-green-500 rounded-t transition-all duration-500"
                  style={{ height: `${(value / maxValue) * 80}%` }}
                ></div>
                <div className="text-xs mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                  {date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const parseDate = (dateStr) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return new Date(dateStr);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Reservation Analysis</h1>
      
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
        <h2 className="text-xl font-semibold mb-2">Total Reservations</h2>
        <p className="text-5xl font-bold">{data.totalReservations}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 mb-8">
        <div className="p-6 bg-gray-50 rounded-lg">
          <BarChart 
            data={data.roomTypes} 
            title="Reservations by Room Type" 
            color="bg-purple-500"
          />
        </div>

        <div className="p-6 bg-gray-50 rounded-lg">
          <TimelineChart 
            data={data.bookingsByDate} 
            title="Reservations Over Time"
          />
        </div>
      </div>
    </div>
  );
};

export default AnalysisGraph;