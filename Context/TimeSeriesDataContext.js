// context/TimeSeriesDataContext.js
'use client'
import React, { createContext, useState, useCallback, useContext } from 'react';

const API_TIMESERIES_URL = process.env.NEXT_PUBLIC_TIMESERIES_API_URL || 'http://localhost:8000/api/hazards/timeseries';

export const TimeSeriesDataContext = createContext({
    timeSeriesData: null,
    loading: false,
    error: null,
    fetchTimeSeries: () => {},
});

export const TimeSeriesDataProvider = ({ children }) => {
    const [timeSeriesData, setTimeSeriesData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // context/TimeSeriesDataContext.js
const fetchTimeSeries = useCallback(async (aggregation = 'daily', region = null, date = null) => {
    setLoading(true);
    setError(null);
    let url = `${API_TIMESERIES_URL}`;

    if (aggregation === 'daily_by_day' && date) { // Ensure 'date' is present for this endpoint
        url += `/daily_by_day?date=${date}`;
        if (region) {
            url += `&region=${encodeURIComponent(region)}`;
        }
    } else {
        url += `?aggregation=${aggregation}`;
        if (region) {
            url += `&region=${encodeURIComponent(region)}`;
        }
    }

    try {
        const response = await fetch(url);
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

    return (
        <TimeSeriesDataContext.Provider value={{ timeSeriesData, loading, error, fetchTimeSeries }}>
            {children}
        </TimeSeriesDataContext.Provider>
    );
};

// Custom hook to use the TimeSeriesDataContext
export const useTimeSeriesDataContext = () => {
    const context = useContext(TimeSeriesDataContext);
    if (!context) {
        throw new Error('useTimeSeriesDataContext must be used within a TimeSeriesDataProvider');
    }
    return context;
};