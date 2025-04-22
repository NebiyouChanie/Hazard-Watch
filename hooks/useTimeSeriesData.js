// hooks/useTimeSeriesData.js
'use client'
import { useState, useEffect, useCallback } from 'react';

const API_TIMESERIES_URL = process.env.NEXT_PUBLIC_TIMESERIES_API_URL || 'http://localhost:8000/api/hazards/timeseries'; // Adjust if necessary

export function useTimeSeriesData() {
    const [timeSeriesData, setTimeSeriesData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTimeSeries = useCallback(async (aggregation = 'daily') => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_TIMESERIES_URL}?aggregation=${aggregation}`);
            if (!response.ok) {
                 throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setTimeSeriesData(data);
        } catch (err) {
            setError(err.message);
            setTimeSeriesData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        timeSeriesData,
        loading,
        error,
        fetchTimeSeries,
    };
}