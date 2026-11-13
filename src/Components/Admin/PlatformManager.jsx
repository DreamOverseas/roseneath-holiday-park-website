import React, { useEffect, useState } from 'react';

/**
 * PlatformManager Component
 * Displays a list of media accounts with their credentials.
 * Automatically switches to a card-based layout on mobile.
 */



const PlatformManager = ({ sessionToken }) => {
  const [platformData, setPlatformData] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const endpoint = (import.meta.env.VITE_CMS_ENDPOINT || 'https://api.do360.com').replace(/\/$/, '');
    fetch(endpoint + '/api/rhp-admin/platforms', { cache: 'no-store', headers: { Authorization: 'Bearer ' + sessionToken } })
      .then(response => { if (!response.ok) throw new Error('Unable to load platform accounts. Please sign in again.'); return response.json(); })
      .then(data => { if (active) setPlatformData(data); })
      .catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [sessionToken]);
  const handleRowClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert("No direct link available for this platform.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans antialiased text-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
            Media Platform Manager
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-600">
            Centralized directory for media accounts. 
            <span className="block md:inline mt-1 md:mt-0 md:ml-1 font-medium text-blue-600">
              Tap any item to open the login page.
            </span>
          </p>
        </header>

        {error && <p role="alert" className="text-red-700">{error}</p>}
        {/* --- Desktop Table View (Visible on md screens and up) --- */}
        <div className="hidden md:block overflow-hidden bg-white shadow-sm ring-1 ring-slate-200 rounded-xl">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Platform Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email Address</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Password</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Remarks / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {platformData.map((item, index) => (
                <tr 
                  key={index}
                  onClick={() => handleRowClick(item.url)}
                  className="group hover:bg-blue-50 cursor-pointer transition-all duration-150"
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-3 text-xs">
                        {item.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-800 group-hover:text-blue-700">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    {item.email ? (
                      <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {item.email}
                      </span>
                    ) : (
                      <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 italic">Unique</span>
                    )}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    {item.password ? (
                      <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {item.password}
                      </span>
                    ) : (
                      <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 italic">Unique</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm text-slate-500 max-w-xs truncate lg:max-w-md" title={item.note}>
                      {item.note || "--"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- Mobile Card View (Visible on small screens only) --- */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {platformData.map((item, index) => (
            <div 
              key={index}
              onClick={() => handleRowClick(item.url)}
              className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 active:bg-blue-50 transition-colors"
            >
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold mr-3 text-sm">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{item.name}</h3>
                  {item.note && <p className="text-xs text-slate-500">{item.note}</p>}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Email Address</label>
                  <div className="text-sm font-mono bg-slate-50 border border-slate-100 rounded px-3 py-2 text-slate-700 break-all">
                    {item.email || "Unique per user"}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Password</label>
                  <div className="text-sm font-mono bg-slate-50 border border-slate-100 rounded px-3 py-2 text-slate-700 break-all">
                    {item.password || "Unique per user"}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                <span className="text-xs font-semibold text-blue-600">Open Login →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformManager;