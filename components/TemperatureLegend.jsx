'use client'
import React from 'react';

const TemperatureLegend = () => {
  const gradientStyle = {
    background: 'linear-gradient(to right, #118AB2, #06D6A0, #FFD166, #FB8B24, #E36414, #9A031E)'
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center mb-2">
        <span className="font-semibold">Temperature (°C)</span>
      </div>
      <div className="flex items-center">
        <div className="w-6 h-6 mr-2" style={gradientStyle}></div>
        <div className="flex justify-between w-full text-xs">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export default TemperatureLegend;