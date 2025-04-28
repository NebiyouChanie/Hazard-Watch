// Add temperature support to the MinimalMap component
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useHazardData } from '@/context/HazardDataContext';
import { useTimeSeriesDataContext } from '@/context/TimeSeriesDataContext';
import RainfallStatsCard from './RainfallStatsCard';
import TemperatureStatsCard from './TemperatureStatsCard';
import RainfallLegend from './RainfallLegend';
import TemperatureLegend from './TemperatureLegend';

function getColorForIntensity(normalizedIntensity, hazardType) {
  if (hazardType === 'temperature') {
    if (normalizedIntensity > 0.9) return '#9A031E'; // Dark red
    if (normalizedIntensity > 0.7) return '#E36414'; // Orange-red
    if (normalizedIntensity > 0.5) return '#FB8B24'; // Orange
    if (normalizedIntensity > 0.3) return '#FFD166'; // Yellow
    if (normalizedIntensity > 0.1) return '#06D6A0'; // Teal
    return '#118AB2'; // Blue
  } else { // rainfall
    if (normalizedIntensity > 0.9) return '#03045e';
    if (normalizedIntensity > 0.7) return '#0077b6';
    if (normalizedIntensity > 0.5) return '#00b4d8';
    if (normalizedIntensity > 0.3) return '#90e0ef';
    if (normalizedIntensity > 0.1) return '#caf0f8';
    return '#e6f2ff';
  }
}

function GridLayer({ hazardData, cellSize = 0.4, hazardType = 'rainfall' }) {
  const map = useMap();
  const [renderedCells, setRenderedCells] = useState([]);

  useEffect(() => {
    if (!map || !hazardData) return;

    // Clear existing layers
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

    const allIntensities = hazardData.map(item => item[2]);
    const maxIntensity = Math.max(...allIntensities);

    const newRenderedCells = [];

    for (let lat = southWest.lat; lat < northEast.lat; lat += cellSize) {
      for (let lng = southWest.lng; lng < northEast.lng; lng += cellSize) {
        const cellBounds = [
          [lat, lng],
          [lat + cellSize, lng + cellSize],
        ];

        const pointsInCell = hazardData.filter(point =>
          point[0] >= lat && point[0] < lat + cellSize &&
          point[1] >= lng && point[1] < lng + cellSize
        );

        if (pointsInCell.length > 0) {
          const totalIntensity = pointsInCell.reduce((sum, point) => sum + point[2], 0);
          const averageIntensity = totalIntensity / pointsInCell.length;
          const normalizedIntensity = maxIntensity > 0 ? averageIntensity / maxIntensity : 0;
          const color = getColorForIntensity(normalizedIntensity, hazardType);

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
    };
  }, [map, hazardData, cellSize, hazardType]);

  return null;
}

const MinimalMap = () => {
  const {
    hazardData,
    loading: hazardLoading,
    error: hazardError,
    regions: regionalData,
    selectedHazardType,
  } = useHazardData();
  const { 
    loading: timeseriesLoading, 
    error: timeseriesError,  
  } = useTimeSeriesDataContext();
 
  const regionStyle = {
    color: 'brown',
    weight: 2,
    opacity: 1,
    fillOpacity: 0,
  };

  if (hazardLoading || timeseriesLoading) {
    return <div className="flex items-center justify-center h-full">Loading data...</div>;
  }

  if (hazardError || timeseriesError) {
    return <div className="flex items-center justify-center h-full text-red-500">
      Error: {hazardError || timeseriesError}
    </div>;
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
        {regionalData && (
          <GeoJSON data={regionalData} style={regionStyle} />
        )}
        {hazardData && Array.isArray(hazardData) && hazardData.length > 0 && (
          <GridLayer
            hazardData={hazardData}
            cellSize={0.4}
            hazardType={selectedHazardType}
          />
        )}
        {selectedHazardType === 'rainfall' && hazardData && Array.isArray(hazardData) && hazardData.length > 0 && (
          <RainfallLegend />
        )}
        {selectedHazardType === 'temperature' && hazardData && Array.isArray(hazardData) && hazardData.length > 0 && (
          <TemperatureLegend />
        )}
      </MapContainer>

      {selectedHazardType === 'rainfall' && <RainfallStatsCard/>}
      {selectedHazardType === 'temperature' && <TemperatureStatsCard/>}
    </div>
  );
};

export default MinimalMap;