'use client';
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import L from 'leaflet';
import { useHazardDataContext } from '@/context/HazardDataContext';


function HeatmapLayer({ positions, radius = 12, blur = 8 }) { // Reduced radius and blur
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!map || !positions || positions.length === 0) return;

    // Normalize intensity values
    const maxValue = Math.max(...positions.map(pos => pos[2]));
    const normalizedData = positions.map(pos => [
      pos[0], // lat
      pos[1], // lng
      maxValue > 0 ? (pos[2] / maxValue) * 10 : 0.1
    ]);

    heatLayerRef.current = L.heatLayer(normalizedData, {
      radius,
      blur,
      maxZoom: 12,
      minOpacity: 0.5,
      gradient: { 
        0.1: '#e6f2ff',  // Very light blue
        0.3: '#b3d7ff',  // Light blue
        0.6: '#66b3ff',  // Medium blue
        0.9: '#0077e6',  // Dark blue
        1.0: '#005bb3'   // Darkest blue
      }
    }).addTo(map);

    // Set Ethiopia bounds with some padding
    const ethiopiaBounds = L.latLngBounds(
      L.latLng(3.0, 32.5), // Slightly expanded SW
      L.latLng(15.5, 48.5)  // Slightly expanded NE
    );
    map.fitBounds(ethiopiaBounds);

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, positions, radius, blur]);

  return null;
}

const MinimalMap = () => {
  const { 
    rainfallData, 
    loading, 
    error 
  } = useHazardDataContext();

  console.log('Rainfall data:', rainfallData); // Debug output

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading map data...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-[700px] w-full relative">
      <MapContainer 
        center={[9.0, 38.7]} // Default Ethiopia center
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        whenCreated={(map) => {
          setTimeout(() => map.invalidateSize(), 100);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {rainfallData && rainfallData.length > 0 && (
          <HeatmapLayer 
            positions={rainfallData} 
            radius={30}
            blur={25}
          />
        )}
      </MapContainer>
      
      {/* Debug overlay */}
      <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow text-xs">
        Data points: {rainfallData?.length || 0}
      </div>
    </div>
  );
};

export default MinimalMap;