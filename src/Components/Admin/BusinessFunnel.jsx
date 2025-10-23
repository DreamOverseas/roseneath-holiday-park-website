import React, { useState, useEffect } from 'react';

const FunnelChart = () => {
  const [funnelData, setFunnelData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.do360.com/api/Funnels')
      .then(response => response.json())
      .then(result => {
        if (result.data && result.data.length > 0) {
          setFunnelData(result.data[0]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!funnelData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl text-gray-600">No data available</div>
      </div>
    );
  }

  const stages = [
    {
      title: 'Marketing Traffic',
      total: funnelData.SocialMedia + funnelData.Email + funnelData.SMS,
      subItems: [
        { label: 'Social Media', value: funnelData.SocialMedia },
        { label: 'Email', value: funnelData.Email },
        { label: 'SMS', value: funnelData.SMS }
      ],
      color: 'bg-blue-500'
    },
    {
      title: 'AI Consultation',
      total: funnelData.AI_Consultation,
      color: 'bg-purple-500'
    },
    {
      title: 'Email & Phone Consultation',
      total: funnelData.EmailPhoneConsultation,
      color: 'bg-indigo-500'
    },
    {
      title: 'Payment',
      total: funnelData.Payment,
      color: 'bg-green-500'
    }
  ];

  const maxValue = stages[0].total;

  const calculateHeight = (value) => {
    return Math.max((value / maxValue) * 100, 20);
  };

  const calculateConversionRate = (current, previous) => {
    if (previous === 0) return 0;
    return ((current / previous) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Business Funnel Dashboard
        </h1>

        {/* Horizontal Funnel */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between gap-4">
            {stages.map((stage, index) => {
              const prevTotal = index > 0 ? stages[index - 1].total : stage.total;
              const conversionRate = calculateConversionRate(stage.total, prevTotal);
              const height = calculateHeight(stage.total);

              return (
                <React.Fragment key={index}>
                  {/* Stage */}
                  <div className="flex-1 flex flex-col items-center">
                    {/* Conversion Rate */}
                    {index > 0 && (
                      <div className="mb-2 text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        {conversionRate}%
                      </div>
                    )}

                    {/* Funnel Block */}
                    <div className="w-full flex flex-col items-center">
                      <div
                        className={`${stage.color} rounded-lg shadow-lg w-full transition-all duration-300 hover:shadow-xl flex flex-col items-center justify-center p-4`}
                        style={{ height: `${height * 3}px`, minHeight: '150px' }}
                      >
                        <div className="text-white text-center">
                          <div className="text-sm font-semibold mb-2 opacity-90">
                            {stage.title}
                          </div>
                          <div className="text-3xl font-bold mb-2">
                            {stage.total.toLocaleString()}
                          </div>
                          
                          {/* Sub-items */}
                          {stage.subItems && (
                            <div className="mt-3 pt-3 border-t border-white border-opacity-30 space-y-1">
                              {stage.subItems.map((item, subIndex) => (
                                <div key={subIndex} className="text-xs">
                                  <span className="opacity-80">{item.label}:</span>{' '}
                                  <span className="font-semibold">{item.value.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  {index < stages.length - 1 && (
                    <div className="flex items-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Total Traffic</div>
              <div className="text-2xl font-bold text-blue-600">
                {stages[0].total.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Total Conversions</div>
              <div className="text-2xl font-bold text-green-600">
                {funnelData.Payment.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Overall Conversion Rate</div>
              <div className="text-2xl font-bold text-purple-600">
                {calculateConversionRate(funnelData.Payment, stages[0].total)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Last Updated</div>
              <div className="text-sm font-semibold text-gray-700">
                {new Date(funnelData.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunnelChart;