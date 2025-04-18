'use client'
import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { useHazardData } from '@/hooks/useHazardData'

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
)

export default function HazardMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const {
    regions,
    activeLayers,
    loading,
    error,
    mapBounds,
    loadRegions,
    rainfallStyle,
    onEachRainfallFeature
  } = useHazardData();

  useEffect(() => {
    loadRegions();
  }, []);

  useEffect(() => {
    if (mapBounds && mapInstance.current) {
      mapInstance.current.fitBounds([
        [mapBounds[0][0], mapBounds[0][1]],
        [mapBounds[1][0], mapBounds[1][1]]
      ]);
    }
  }, [mapBounds]);

  useEffect(() => {
    // Ensure map resizes when layers change
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [activeLayers]);

  const regionStyle = {
    fillColor: '#45303d',
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.3
  };

  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute top-4 right-4 bg-white p-2 rounded shadow z-[1000]">
          Loading...
        </div>
      )}
      {error && (
        <div className="absolute top-4 right-4 bg-red-100 p-2 rounded shadow z-[1000]">
          Error: {error}
        </div>
      )}
      
      <MapContainer
        center={[9.1021, 40.7153]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        whenCreated={(map) => {
          mapRef.current = map;
          mapInstance.current = map;
          map.invalidateSize();
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {regions && (
          <GeoJSON
            data={regions}
            style={regionStyle}
            onEachFeature={(feature, layer) => {
              layer.bindPopup(`
                <div class="p-2">
                  <h3 class="font-bold">${feature.properties?.name || 'Unnamed Region'}</h3>
                </div>
              `);
            }}
          />
        )}
        
        {activeLayers.map(layer => (
          layer.visible && layer.type === 'rainfall' && layer.data && (
            <GeoJSON
              key={layer.id}
              data={layer.data}
              style={rainfallStyle}
              onEachFeature={onEachRainfallFeature}
              eventHandlers={{
                add: (e) => {
                  console.log('Rainfall layer added:', layer.id);
                },
                error: (e) => {
                  console.error('Rainfall layer error:', layer.id, e);
                }
              }}
            />
          )
        ))}
      </MapContainer>
    </div>
  );
}