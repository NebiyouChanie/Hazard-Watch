import { useState, useCallback } from 'react';
import { fetchHazardData } from '../lib/api'; // Import your existing API caller

export function useHazardData() {
  const [activeLayers, setActiveLayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [regions, setRegions] = useState([]);

  // Format date as YYYY-MM-DD
  const formatDate = useCallback((date) => {
    if (!date) return null;
    
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }, []);

  // Load regions on initialization
  const loadRegions = useCallback(async () => {
    setLoading(true);
    try {
      const regionsData = await fetchHazardData.getRegions();
      setRegions(regionsData);
      return regionsData;
    } catch (err) {
      setError(`Failed to load regions: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);


  

  const loadRainfall = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    
    try {
      const formattedDate = formatDate(date);
      console.log("🚀 ~ loadRainfall ~ formattedDate:", formattedDate)
      if (!formattedDate) {
        throw new Error('Invalid date parameter');
      }

      const response = await fetchHazardData.getRainfall(formattedDate);
      console.log("🚀 ~ loadRainfall ~ response:", response)
      
      const newLayer = {
        id: `rainfall-${formattedDate}-${Date.now()}`,
        type: 'Rainfall',
        date: formattedDate,
        period: 'daily',
        visible: true,
        data: response.data,
        bounds: response.bounds,
        stats: response.stats
      };

      setActiveLayers(prev => [...prev, newLayer]);
      return response;
    } catch (err) {
      setError(err.message);
      console.error('[ERROR] Failed to load rainfall data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formatDate]);

  const toggleLayerVisibility = useCallback((layerId) => {
    setActiveLayers(prev =>
      prev.map(layer =>
        layer.id === layerId
          ? { ...layer, visible: !layer.visible }
          : layer
      )
    );
  }, []);

  const removeLayer = useCallback((layerId) => {
    setActiveLayers(prev => prev.filter(layer => layer.id !== layerId));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loadRainfall,
    loadRegions,
    activeLayers,
    toggleLayerVisibility,
    removeLayer,
    loading,
    error,
    clearError,
    regions,
    selectedRegion,
    setSelectedRegion
  };
}