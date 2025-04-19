// components/MinimalMap.jsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useHazardDataContext } from '@/context/HazardDataContext';
import RainfallStatsCard from './RainfallStatsCard';
import RainfallLegend from './RainfallLegend';

function getColorForIntensity(normalizedIntensity) {
  if (normalizedIntensity > 0.9) return '#03045e';
  if (normalizedIntensity > 0.7) return '#0077b6';
  if (normalizedIntensity > 0.5) return '#00b4d8';
  if (normalizedIntensity > 0.3) return '#90e0ef';
  if (normalizedIntensity > 0.1) return '#caf0f8';
  return '#e6f2ff';
}

function GridLayer({ rainfallData, cellSize = 1.8 }) {
  const map = useMap();
  const gridLayerRef = useRef(null);
  const [renderedCells, setRenderedCells] = useState([]);

  useEffect(() => {
    if (!map || !rainfallData) return;

    map.eachLayer(layer => {
      if (layer instanceof L.Rectangle) {
        map.removeLayer(layer);
      }
    });
    setRenderedCells([]);

    const bounds = L.latLngBounds(
      L.latLng(3.0, 32.5),
      L.latLng(15.5, 48.5)
    );
    const southWest = bounds.getSouthWest();
    const northEast = bounds.getNorthEast();

    const allIntensities = rainfallData.map(item => item[2]);
    const maxIntensity = Math.max(...allIntensities);

    const newRenderedCells = [];

    for (let lat = southWest.lat; lat < northEast.lat; lat += cellSize) {
      for (let lng = southWest.lng; lng < northEast.lng; lng += cellSize) {
        const cellBounds = [
          [lat, lng],
          [lat + cellSize, lng + cellSize],
        ];

        const pointsInCell = rainfallData.filter(point =>
          point[0] >= lat && point[0] < lat + cellSize &&
          point[1] >= lng && point[1] < lng + cellSize
        );

        if (pointsInCell.length > 0) {
          const totalIntensity = pointsInCell.reduce((sum, point) => sum + point[2], 0);
          const averageIntensity = totalIntensity / pointsInCell.length;
          const normalizedIntensity = maxIntensity > 0 ? averageIntensity / maxIntensity : 0;
          const color = getColorForIntensity(normalizedIntensity);

          const rect = L.rectangle(cellBounds, {
            fillColor: color,
            fillOpacity: 0.8,
            color: 'transparent',
            weight: 0,
          }).addTo(map);
          newRenderedCells.push(rect);
        }
      }
    }

    setRenderedCells(newRenderedCells);
    map.fitBounds(bounds);

    return () => {
      newRenderedCells.forEach(cell => {
        if (map.hasLayer(cell)) {
          map.removeLayer(cell);
        }
      });
      setRenderedCells([]);
    };
  }, [map, rainfallData, cellSize]);

  return null;
}

const MinimalMap = () => {
  const {
    rainfallData,
    stats,
    loading,
    error,
  } = useHazardDataContext();

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading map data...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-[700px] w-full relative">
      <MapContainer
        center={[9.0, 38.7]}
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
          <GridLayer
            rainfallData={rainfallData}
            cellSize={0.4}
          />
        )}
      </MapContainer>

      {stats && <RainfallStatsCard stats={stats} />}
      {stats && <RainfallLegend />}
    </div>
  );
};

export default MinimalMap;