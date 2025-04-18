'use client'
import { useState, useEffect, useCallback } from 'react';
import { fetchHazardData } from '@/lib/api';

export function useHazardData() {
  const [regions, setRegions] = useState(null);
  const [activeLayers, setActiveLayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);

  // Memoized loadRegions function to prevent unnecessary recreations
  const loadRegions = useCallback(async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching regions data...');
      
      const response = await fetchHazardData.getRegions();
      console.log('Regions data received:', response);
      
      // Only update if data has actually changed
      setRegions(prev => {
        const newRegions = {
          type: "FeatureCollection",
          features: response.features || response  
        };
        
        if (JSON.stringify(prev) === JSON.stringify(newRegions)) {
          return prev;
        }
        return newRegions;
      });
    } catch (err) {
      console.error('Error loading regions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const loadRainfall = useCallback(async (date) => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Clear existing rainfall layers
      setActiveLayers(prev => prev.filter(layer => layer.type !== 'rainfall'));
      
      console.log(`Fetching rainfall data for ${date}...`);
      const response = await fetchHazardData.getRainfall(date);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid data format received from API');
      }

      const gridLayer = createRainfallGridLayer(response.data, response.bounds);
      
      if (!gridLayer || !gridLayer.features?.length) {
        throw new Error('Created grid layer contains no features');
      }

      setActiveLayers(prev => [...prev, {
        id: `rainfall-${date}`,
        type: 'rainfall',
        date,
        data: gridLayer,
        visible: true,
        bounds: response.bounds,
        stats: response.stats
      }]);

      setMapBounds(response.bounds);
    } catch (err) {
      console.error('[ERROR] Rainfall load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const createRainfallGridLayer = (data, bounds) => {
    try {
      if (!data || !bounds) {
        throw new Error('Missing data or bounds');
      }

      const [minLat, minLon] = bounds[0];
      const [maxLat, maxLon] = bounds[1];
      
      const rows = data.length;
      const cols = data[0]?.length || 0;
      
      const cellHeight = (maxLat - minLat) / rows;
      const cellWidth = (maxLon - minLon) / cols;

      const allValues = data.flat().filter(val => val !== null);
      let minValue = allValues.length ? Math.min(...allValues) : 0;
      let maxValue = allValues.length ? Math.max(...allValues) : 1;

      if (minValue === maxValue) {
        maxValue = minValue + 1;
      }

      const features = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = data[r][c];
          if (val === null || val === undefined) continue;

          features.push({
            type: "Feature",
            properties: {
              value: val,
              normalizedValue: (val - minValue) / (maxValue - minValue),
              minValue,
              maxValue
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [minLon + c * cellWidth, minLat + r * cellHeight],
                [minLon + c * cellWidth, minLat + (r + 1) * cellHeight],
                [minLon + (c + 1) * cellWidth, minLat + (r + 1) * cellHeight],
                [minLon + (c + 1) * cellWidth, minLat + r * cellHeight],
                [minLon + c * cellWidth, minLat + r * cellHeight]
              ]]
            }
          });
        }
      }

      return {
        type: "FeatureCollection",
        features,
        bounds,
        minValue,
        maxValue
      };
    } catch (error) {
      console.error('[ERROR] Grid creation failed:', error);
      return null;
    }
  };

  const toggleLayerVisibility = (layerId) => {
    setActiveLayers(prev => 
      prev.map(layer => 
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const removeLayer = (layerId) => {
    setActiveLayers(prev => prev.filter(layer => layer.id !== layerId));
  };

  return {
    regions,
    activeLayers,
    loading,
    error,
    mapBounds,
    loadRegions,
    loadRainfall,
    toggleLayerVisibility,
    removeLayer,
    setMapBounds
  };
}