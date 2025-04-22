'use client'
import React, { createContext, useState, useCallback, useContext } from 'react';

const API_TIMESERIES_URL = process.env.NEXT_PUBLIC_TIMESERIES_API_URL || 'http://localhost:8000/api/hazards/timeseries';

export const TimeSeriesDataContext = createContext({
    timeSeriesData: null,
    loading: false,
    error: null,
    fetchTimeSeries: () => {},
    currentPeriod: null,
});

export const TimeSeriesDataProvider = ({ children }) => {
    const [timeSeriesData, setTimeSeriesData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPeriod, setCurrentPeriod] = useState(null);

    const fetchTimeSeries = useCallback(async (aggregation = 'daily', region = null, date = null, period = 'daily') => {
        setLoading(true);
        setError(null);
        setCurrentPeriod(period); // Set the current period when fetching
        let url = `${API_TIMESERIES_URL}`;

        if (aggregation === 'daily_by_day' && date) {
            url += `/daily_by_day?date=${date}`;
            if (region) {
                url += `&region=${encodeURIComponent(region)}`;
            }
        } else if (aggregation === 'monthly' && date) {
            url += `/monthly?month=${date.split('-')[0]}`;
            if (region) {
                url += `&region=${encodeURIComponent(region)}`;
            }
        } else if (aggregation === 'annual' && date) {
            url += `/annual?year=${date}`;
            if (region) {
                url += `&region=${encodeURIComponent(region)}`;
            }
        } else if (aggregation === 'seasonal') {
            url += `/seasonal`;
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
    }, [setCurrentPeriod]); // Add setCurrentPeriod to the dependency array

    // Helper function to update currentPeriod
    const updateCurrentPeriod = useCallback((period) => {
        setCurrentPeriod(period);
    }, [setCurrentPeriod]);

    return (
        <TimeSeriesDataContext.Provider value={{ timeSeriesData, loading, error, fetchTimeSeries, currentPeriod, updateCurrentPeriod }}>
            {children}
        </TimeSeriesDataContext.Provider>
    );
};

export const useTimeSeriesDataContext = () => {
    const context = useContext(TimeSeriesDataContext);
    if (!context) {
        throw new Error('useTimeSeriesDataContext must be used within a TimeSeriesDataProvider');
    }
    return context;
};