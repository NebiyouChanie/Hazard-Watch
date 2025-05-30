// context/TimeSeriesDataContext.js
'use client'
import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { fetchHazardData } from '@/lib/api';

const API_TIMESERIES_URL = process.env.NEXT_PUBLIC_TIMESERIES_API_URL || 'http://localhost:8000/api/hazards/timeseries';

export const TimeSeriesDataContext = createContext({
  timeSeriesData: null,
  loading: false,
  error: null,
  fetchTimeSeries: () => {},
  currentPeriod: null,
  updateCurrentPeriod: () => {},
  availableDates: null,
  availablePeriods: null,
  fetchAvailableDates: () => {},
  fetchAvailablePeriods: () => {},
});

export const TimeSeriesDataProvider = ({ children }) => {
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [lastFetched, setLastFetched] = useState({});

  const updateCurrentPeriod = useCallback((period) => {
    setCurrentPeriod(period);
  }, []);


//  fetchTimeSeries  
const fetchTimeSeries = useCallback(async (aggregation = 'daily', region = null, date = null, period = 'daily', hazardType = 'rainfall') => {
    const cacheKey = `${hazardType}-${aggregation}-${region}-${date}-${period}`;
    if (lastFetched[cacheKey]) return;
    
    setLoading(true);
    setError(null);
    setCurrentPeriod(period);
    setLastFetched(prev => ({ ...prev, [cacheKey]: true }));
    
    try {
      let data;
      switch (hazardType) {
        case 'temperature':
          switch (aggregation) {
            case 'daily_by_day':
               data = await fetchHazardData.getDailyTemperatureTimeSeriesByDay(date);
              break;
            case 'monthly':
              data = await fetchHazardData.getMonthlyTemperatureTimeSeries(date);
              break;
            case 'annual':
              data = await fetchHazardData.getAnnualTemperatureTimeSeries(date);
              break;
            case 'seasonal':
              data = await fetchHazardData.getSeasonalTemperatureTimeSeries(date);
              break;
            default:
              data = await fetchHazardData.getTemperatureTimeSeries(aggregation);
          }
          break;
        case 'rainfall':
        default:
          switch (aggregation) {
            case 'daily_by_day':
              data = await fetchHazardData.getDailyTimeSeriesByDay(date);
              break;
            case 'monthly':
              data = await fetchHazardData.getMonthlyTimeSeries(date);
              break;
            case 'annual':
              data = await fetchHazardData.getAnnualTimeSeries(date);
              break;
            case 'seasonal':
              data = await fetchHazardData.getSeasonalTimeSeries(date);
              break;
            default:
              data = await fetchHazardData.getTimeSeries(aggregation);
          }
      }
      setTimeSeriesData(data);
    } catch (err) {
      setError(err.message);
      setTimeSeriesData(null);
    } finally {
      setLoading(false);
    }
  }, [lastFetched]);
            
  return (
    <TimeSeriesDataContext.Provider value={{ 
      timeSeriesData, 
      loading, 
      error, 
      fetchTimeSeries, 
      currentPeriod, 
      updateCurrentPeriod,
    }}>
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