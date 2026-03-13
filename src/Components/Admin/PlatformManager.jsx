import React from 'react';

/**
 * PlatformManager Component
 * * Displays a list of media accounts with their credentials and notes.
 * Clicking a row redirects the user to the platform's login page.
 */

const platformData = [
  {
    name: "Little Hotelier",
    email: "",
    password: "",
    url: "https://littlehotelier.authx.siteminder.com/login",
  },
  {
    name: "Booking.com",
    email: "John.du@do360.com",
    password: "360Media@@",
    url: "https://admin.booking.com/",
  },
  {
    name: "Hipcamp",
    email: "John.du@do360.com",
    password: "Dreamoverseas171!",
    url: "https://www.hipcamp.com/en-AU"
  },
  {
    name: "Mail Chimp",
    email: "John.du@do360.com",
    password: "Dreamoverseas171!",
    url: "https://mailchimp.com/?_gl=1*suzbtr*_up*MQ..*_gs*MQ..&gclid=EAIaIQobChMIw8LKjdabkwMVMqJmAh18-jeQEAAYASAAEgLccfD_BwE&gclsrc=aw.ds&gbraid=0AAAAADh1Fp2_dvy3eGrMGlAhzqQj5BWKQ&currency=AUD"
  },
  {
    name: "Trip.com",
    email: "61413168533",
    password: "ukjqt!37",
    url: "https://ebooking.trip.com/login/index",
  },
  {
    name: "Airbnb",
    email: "John.du@do360.com",
    password: "Xiaobaibnb@1963",
    url: "https://www.airbnb.com.au/login",
  },
  {
    name: "Square",
    email: "corp@roseneathholidaypark.au",
    password: "Dreamoverseas171！",
    url: "https://app.squareup.com/login",
  },
  {
    name: "Xero",
    email: "",
    password: "",
    url: "https://login.xero.com/identity/user/login",
  },
  {
    name: "WikiCamp",
    email: "corp@roseneathholidaypark.au",
    password: "Dreamoverseas171!",
    url: "",
    note: "Need to download mobile app"
  },
  {
    name: "Yodeck",
    email: "dreamoverseasgroup@gmail.com",
    password: "Dreamoverseas171!",
    url: "https://app.yodeck.com/login",
  }
];

const PlatformManager = () => {
  const handleRowClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert("No direct link available for this platform.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans antialiased text-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Media Platform Manager
          </h1>
          <p className="mt-2 text-slate-600">
            Centralized directory for media accounts and credentials. 
            <span className="ml-1 font-medium text-blue-600">Click any row to open the login page.</span>
          </p>
        </header>

        <div className="overflow-hidden bg-white shadow-sm ring-1 ring-slate-200 rounded-xl">
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
                      <span className="text-sm font-bold text-slate-800 group-hover:text-blue-700 underline-offset-4 decoration-2">
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
                      <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 italic">
                        Unique per user
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    {item.password ? (
                      <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {item.password}
                      </span>
                    ) : (
                      <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 italic">
                        Unique per user
                      </span>
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
      </div>
    </div>
  );
};

export default PlatformManager;