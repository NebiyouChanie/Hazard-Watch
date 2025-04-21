// components/RainfallLegend.jsx
import React from 'react';

const RainfallLegend = () => {
  return (
    <div className="bg-white p-4 rounded shadow-md absolute bottom-4 right-12 z-2000 w-48">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Rainfall Intensity</h3>
      <div className="space-y-1">
        <div className="flex items-center">
          <div className="w-6 h-3 mr-2" style={{ backgroundColor: '#03045e' }}></div>
          <span className="text-xs">Very High</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-3 mr-2" style={{ backgroundColor: '#0077b6' }}></div>
          <span className="text-xs">High</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-3 mr-2" style={{ backgroundColor: '#00b4d8' }}></div>
          <span className="text-xs">Moderate</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-3 mr-2" style={{ backgroundColor: '#90e0ef' }}></div>
          <span className="text-xs">Low</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-3 mr-2" style={{ backgroundColor: '#caf0f8' }}></div>
          <span className="text-xs">Very Low</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-3 mr-2" style={{ backgroundColor: '#e6f2ff' }}></div>
          <span className="text-xs">No Data/Very Light</span>
        </div>
      </div>
    </div>
  );
};

export default RainfallLegend;