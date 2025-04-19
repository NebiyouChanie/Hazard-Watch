import { useState, useCallback, useEffect } from 'react';
import { fetchHazardData } from '../lib/api';

export function useHazardData() {
  const [rainfallData, setRainfallData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regions, setRegions] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);

  const formatDate = useCallback((date) => {
    if (!date) return null;
  
    // Handle string dates in various formats
    if (typeof date === 'string') {
      // Try to parse ISO format (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      
      // Try to parse other common formats
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate;
      } else {
        throw new Error('Invalid date string format');
      }
    }
  
    // Handle Date objects
    if (date instanceof Date) {
      if (isNaN(date.getTime())) {
        throw new Error('Invalid Date object');
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }
  
    throw new Error('Unsupported date format');
  }, []);


  const convertGridToLatLng = useCallback((gridData) => {
    if (!gridData || !gridData.data || !gridData.bounds) {
      console.error('Invalid grid data format:', gridData);
      return null;
    }
  
    const { data, bounds } = gridData;
    const [minLat, minLng] = bounds[0]; // SW corner (3,33)
    const [maxLat, maxLng] = bounds[1]; // NE corner (15,48)
  
    const rows = data.length;
    const cols = data[0]?.length || 0;
  
    const points = [];
  
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const value = data[row][col];
        if (value === null || value === undefined || value === 0) continue;
  
        // Calculate lat/lng for each grid cell
        const lat = maxLat - (row + 0.5) * (maxLat - minLat) / rows;
        const lng = minLng + (col + 0.5) * (maxLng - minLng) / cols;
  
        points.push([lat, lng, value]);
      }
    }
  
    console.log('Converted points:', points.slice(0, 5)); // Log first 5 points for verification
    return points;
  }, []);

  const loadRegions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHazardData.getRegions();
      setRegions(data);

      // Calculate initial map bounds based on regions data
      if (data?.features?.length > 0) {
        let allCoords = [];
        data.features.forEach(feature => {
          if (feature.geometry?.coordinates) {
            if (feature.geometry.type === 'Point') {
              allCoords.push(feature.geometry.coordinates);
            } else if (feature.geometry.type === 'Polygon') {
              allCoords.push(...feature.geometry.coordinates[0]);
            } else if (feature.geometry.type === 'MultiPolygon') {
              feature.geometry.coordinates.forEach(polygon => allCoords.push(...polygon[0]));
            }
          }
        });

        if (allCoords.length > 0) {
          const lats = allCoords.map(coord => coord[1]);
          const lngs = allCoords.map(coord => coord[0]);
          setMapBounds([[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]]);
        }
      }
    } catch (err) {
      setError(`Failed to load regions: ${err.message}`);
      setRegions(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRainfall = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const formattedDate = formatDate(date);
      const response = await fetchHazardData.getRainfall(formattedDate);
      const heatmapData = convertGridToLatLng(response);
      setRainfallData(heatmapData);
    } catch (err) {
      setError(`Failed to load rainfall data: ${err.message}`);
      setRainfallData(null);
    } finally {
      setLoading(false);
    }
  }, [formatDate, convertGridToLatLng]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

    console.log("🚀 ~ useHazardData ~ rainfallData:", rainfallData)
  return {
    regions,
    rainfallData,
    loading,
    error,
    mapBounds,
    loadRegions,
    loadRainfall,
    clearError,
  };
}