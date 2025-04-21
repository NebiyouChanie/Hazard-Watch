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
    const [selectedRegion, setSelectedRegion] = useState(null); // Add this state

    const formatDate = useCallback((date, period) => {
        if (!date) return null;
        let year = date.getFullYear();
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let day = String(date.getDate()).padStart(2, '0');

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
            setRegions(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadHazardData = useCallback(async (date, period, hazardType) => {
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
        } catch (err) {
            setError(`Failed to load ${hazardType} data for ${period}: ${err.message}`);
            setHazardData(null);
        } finally {
            setLoading(false);
        }
    }, [formatDate, convertGridToLatLng]);

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
        selectedRegion, // Expose the state
        setSelectedRegion, // Expose the setter function
        loadRegions,
        loadHazardData,
        clearError,
    };
}