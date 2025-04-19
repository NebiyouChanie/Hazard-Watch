// components/RainfallStatsCard.jsx
import React from 'react';

const RainfallStatsCard = ({ stats }) => {
  if (!stats) {
    return null;
  }

  const getColorForValue = (value, min, max) => {
    if (max === min) return '#e0f7fa'; // Light cyan for no variation

    const normalizedValue = (value - min) / (max - min);
    if (normalizedValue > 0.9) return '#1a237e';   // Deep indigo
    if (normalizedValue > 0.7) return '#283593';
    if (normalizedValue > 0.5) return '#3f51b5';   // Primary indigo
    if (normalizedValue > 0.3) return '#5c6bc0';
    if (normalizedValue > 0.1) return '#7986cb';
    return '#e0f7fa';                             // Light cyan for low values
  };

  const formatValue = (value) => {
    return typeof value === 'number' ? value.toFixed(2) : value;
  };

  const minColor = getColorForValue(stats.min, stats.min, stats.max);
  const maxColor = getColorForValue(stats.max, stats.min, stats.max);
  const meanColor = getColorForValue(stats.mean, stats.min, stats.max);
  const medianColor = getColorForValue(stats.median, stats.min, stats.max);

  return (
    <div className="bg-white p-5 rounded-lg shadow-md absolute bottom-4 left-4 z-2000 w-64 border border-gray-200">
      <h3 className="text-xl font-semibold text-indigo-700 mb-3">Rainfall Insights</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Minimum:</span>
          <span className="text-indigo-900" style={{ color: minColor }}>{formatValue(stats.min)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Maximum:</span>
          <span className="text-indigo-900" style={{ color: maxColor }}>{formatValue(stats.max)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Average:</span>
          <span className="text-indigo-900" style={{ color: meanColor }}>{formatValue(stats.mean)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Median:</span>
          <span className="text-indigo-900" style={{ color: medianColor }}>{formatValue(stats.median)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Total:</span>
          <span className="text-indigo-900">{formatValue(stats.sum)}</span>
        </div>
      </div>
    </div>
  );
};

export default RainfallStatsCard;