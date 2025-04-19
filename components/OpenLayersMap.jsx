// components/OpenLayersMap.jsx
'use client';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, useMap, Popup, FeatureGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import L from 'leaflet';

function HeatmapLayer({ positions, radius = 25, blur = 15 }) {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!map || !positions) return;

    const heatData = positions.map(pos => [pos[0], pos[1], pos[2] || 1]);

    heatLayerRef.current = L.heatLayer(heatData, { radius, blur }).addTo(map);

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, positions, radius, blur]);

  return null;
}

function RegionBoundaries({ regions }) {
  const geoJsonData = useMemo(() => {
    if (!regions?.features) return null;
    return {
      type: 'FeatureCollection',
      features: regions.features.map(feature => ({
        type: 'Feature',
        geometry: feature.geometry,
        properties: feature.properties,
      })),
    };
  }, [regions]);

  return geoJsonData ? (
    <FeatureGroup>
      {geoJsonData.features.map((feature, index) => (
        <L.GeoJSON
          key={index}
          data={feature}
          style={{
            fillColor: 'rgba(69, 48, 61, 0.3)',
            color: 'white',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7,
          }}
        >
          <Popup>
            <h3>{feature.properties?.name || 'Unnamed Region'}</h3>
            {feature.geometry.coordinates && feature.geometry.type === 'Point' && (
              <p>Lon/Lat: {feature.geometry.coordinates.join(', ')}</p>
            )}
            {feature.geometry.coordinates && feature.geometry.type !== 'Point' && (
              <p>Region Boundaries</p>
            )}
          </Popup>
        </L.GeoJSON>
      ))}
    </FeatureGroup>
  ) : null;
}

const ReactLeafletMap = ({ regions, rainfallData, mapBounds, loading, error }) => {
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState([9.1450, 39.5339]);
  const [mapZoom, setMapZoom] = useState(6);

  useEffect(() => {
    if (mapBounds) {
      const leafletMap = mapRef.current;
      if (leafletMap) {
        try {
          leafletMap.fitBounds([[mapBounds[0][1], mapBounds[0][0]], [mapBounds[1][1], mapBounds[1][0]]]);
        } catch (e) {
          console.error("Error fitting map bounds:", e);
        }
      }
    }
  }, [mapBounds, mapRef]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        ref={mapRef}
        className="absolute inset-0"
        style={{ height: '100%', width: '100%' }}
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {regions && <RegionBoundaries regions={regions} />}
        {rainfallData && <HeatmapLayer positions={rainfallData} radius={30} blur={20} />}
      </MapContainer>
      {loading && <div className="absolute top-4 right-4 bg-white p-2 rounded shadow z-[1000]">Loading...</div>}
      {error && <div className="absolute top-4 right-4 bg-red-100 text-red-700 p-2 rounded shadow z-[1000]">Error: {error}</div>}
    </div>
  );
};

export default ReactLeafletMap;