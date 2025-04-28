// hooks/useHazardData.js
import { useState, useCallback, useEffect } from 'react';
import { fetchHazardData } from '../lib/api';

export function useHazardData() {
  const [hazardData, setHazardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regions, setRegions] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedHazardType, setSelectedHazardType] = useState(null);
  const [availablePeriods, setAvailablePeriods] = useState({});
  const [availableDates, setAvailableDates] = useState({});
  const [lastFetched, setLastFetched] = useState({});

  const formatDate = useCallback((date, period) => {
    if (!date) return null;
    
    // Handle seasonal case first
    if (period === 'seasonal') {
      // If date is already in "SEASON-YEAR" format, return as-is
      if (typeof date === 'string' && date.match(/^(MAM|JJAS|OND)-\d{4}$/)) {
        return date;
      }
      // If date is a Date object, convert to seasonal format
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
      
      // Determine season based on month
      let season;
      if (month >= 3 && month <= 5) season = 'MAM';
      else if (month >= 6 && month <= 9) season = 'JJAS';
      else season = 'OND'; // October-December
      
      return `${season}-${year}`;
    }
  
    // Original formatting for other periods
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
  
    if (period === 'monthly') {
      return `${year}-${month}`;
    } else if (period === 'annual') {
      return `${year}`;
    } else {
      return `${year}-${month}-${day}`;
    }
  }, []);

  const convertGridToLatLng = useCallback((gridData) => {
    if (!gridData || !gridData.data || !gridData.bounds) {
      console.error('Invalid grid data format:', gridData);
      return null;
    }
    const { data, bounds } = gridData;
    const [minLat, minLng] = bounds[0];
    const [maxLat, maxLng] = bounds[1];
    const rows = data.length;
    const cols = data[0]?.length || 0;
    const points = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const value = data[row][col];
        if (value === null || value === undefined || value === 0) continue;
        const lat = maxLat - (row + 0.5) * (maxLat - minLat) / rows;
        const lng = minLng + (col + 0.5) * (maxLng - minLng) / cols;
        points.push([lat, lng, value]);
      }
    }
    return points;
  }, []);

  const loadRegions = useCallback(async () => {
    if (regions) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHazardData.getRegions();
      setRegions(data);
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
    } finally {
      setLoading(false);
    }
  }, [regions]);

// Update the loadHazardData function in useHazardData hook
const loadHazardData = useCallback(async (date, period, hazardType) => {
    const cacheKey = `${hazardType}-${period}-${date}`;
    if (lastFetched[cacheKey]) return;
    
    setLoading(true);
    setError(null);
    try {
      let formattedDate = null;
      if (date) {
        formattedDate = formatDate(date, period);
      }
  
      let response;
      switch (hazardType) {
        case 'rainfall':
          response = await fetchHazardData.getRainfall(formattedDate, period);
          break;
        case 'temperature':
          response = await fetchHazardData.getTemperature(formattedDate, period);
          break;
        default:
          throw new Error(`Unsupported hazard type: ${hazardType}`);
      }
      setStats(response?.stats || null);
      const heatmapData = response?.data ? convertGridToLatLng(response) : null;
      setHazardData(heatmapData);
      setSelectedHazardType(hazardType);
      setLastFetched(prev => ({ ...prev, [cacheKey]: true }));
    } catch (err) {
      setError(`Failed to load ${hazardType} data for ${period}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [formatDate, convertGridToLatLng, lastFetched]);
  

  const loadAvailablePeriods = useCallback(async (hazardType) => {
    if (availablePeriods[hazardType]) return;
    
    try {
      const periodsData = await fetchHazardData.getAvailablePeriods(hazardType);
      setAvailablePeriods(prev => ({ ...prev, [hazardType]: periodsData.periods }));
    } catch (error) {
      console.error(`Failed to load available periods for ${hazardType}:`, error);
      setAvailablePeriods(prev => ({ ...prev, [hazardType]: [] }));
    }
  }, [availablePeriods]);

  const loadAvailableDates = useCallback(async (hazardType) => {
    if (availableDates[hazardType]) return;
    
    try {
      const datesData = await fetchHazardData.getAvailableDates(hazardType);
      setAvailableDates(prev => ({
        ...prev,
        [hazardType]: {
          daily: datesData.dates || [],
          monthly: datesData.months || [],
          annual: datesData.years || [],
        },
      }));
    } catch (error) {
      console.error(`Failed to load available dates for ${hazardType}:`, error);
      setAvailableDates(prev => ({ ...prev, [hazardType]: { daily: [], monthly: [], annual: [] } }));
    }
  }, [availableDates]);

  useEffect(() => {
    if (selectedHazardType) {
      loadAvailablePeriods(selectedHazardType);
      loadAvailableDates(selectedHazardType);
    }
  }, [selectedHazardType, loadAvailablePeriods, loadAvailableDates]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    regions,
    hazardData,
    loading,
    stats,
    error,
    mapBounds,
    selectedHazardType,
    setSelectedHazardType,
    availablePeriods,
    availableDates,
    loadRegions,
    loadHazardData,
    clearError,
  };
}