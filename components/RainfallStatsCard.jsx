// components/RainfallStatsCard.jsx
'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO, isValid, isBefore, isAfter } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTimeSeriesDataContext } from '@/context/TimeSeriesDataContext';
import { useHazardDataContext } from '@/context/HazardDataContext';

const RainfallStatsCard = () => {
  const { 
    timeSeriesData: stats,
    fetchTimeSeries, 
    currentPeriod, 
    availableDates,
    loading: timeseriesLoading,
  } = useTimeSeriesDataContext();
  
  const { loadHazardData } = useHazardDataContext();
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState('MAM');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Get min and max dates for each period type
  const getDateBounds = () => {
    if (!availableDates) return { min: null, max: null };
    
    if (currentPeriod === 'daily' && availableDates.dates?.length) {
      const sortedDates = availableDates.dates
        .map(dateStr => parseISO(dateStr))
        .filter(date => isValid(date))
        .sort((a, b) => a - b);
      
      return {
        min: sortedDates[0],
        max: sortedDates[sortedDates.length - 1]
      };
    }
    
    if (currentPeriod === 'monthly' && availableDates.months?.length) {
      const sortedMonths = availableDates.months
        .map(monthStr => {
          const [year, month] = monthStr.split('-');
          return new Date(year, month - 1);
        })
        .sort((a, b) => a - b);
      
      return {
        min: sortedMonths[0],
        max: sortedMonths[sortedMonths.length - 1]
      };
    }
    
    if (currentPeriod === 'annual' && availableDates.years?.length) {
      const sortedYears = availableDates.years
        .map(year => new Date(year, 0))
        .sort((a, b) => a - b);
      
      return {
        min: sortedYears[0],
        max: sortedYears[sortedYears.length - 1]
      };
    }
    
    return { min: null, max: null };
  };

  const { min: minDate, max: maxDate } = getDateBounds();

  // Safe date parsing function
  const safeParseISO = (dateString) => {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? date : null;
    } catch {
      return null;
    }
  };

  // Initialize with the last available date
  useEffect(() => {
    if (!initialLoadDone && availableDates && minDate && maxDate) {
      setInitialLoadDone(true);
      
      if (currentPeriod === 'daily') {
        setSelectedDate(maxDate);
        loadInitialData(maxDate, 'daily');
      } 
      else if (currentPeriod === 'monthly') {
        setSelectedMonthYear(maxDate);
        loadInitialData(maxDate, 'monthly');
      } 
      else if (currentPeriod === 'annual') {
        setSelectedYear(maxDate);
        loadInitialData(maxDate, 'annual');
      } 
      else if (currentPeriod === 'seasonal') {
        setSelectedYear(maxDate);
        setSelectedSeason('MAM');
        loadInitialData('MAM', 'seasonal');
      }
    }
  }, [availableDates, currentPeriod, initialLoadDone, minDate, maxDate]);

  const loadInitialData = async (date, periodType) => {
    setIsLoading(true);
    try {
      if (periodType === 'daily') {
        await fetchTimeSeries('daily_by_day', null, format(date, 'MM-dd'), 'daily');
        await loadHazardData(date, 'daily', 'rainfall');
      } 
      else if (periodType === 'monthly') {
        await fetchTimeSeries('monthly', null, format(date, 'MM'), 'monthly');
        await loadHazardData(date, 'monthly', 'rainfall');
      } 
      else if (periodType === 'annual') {
        await fetchTimeSeries('annual', null, format(date, 'yyyy'), 'annual');
        await loadHazardData(date, 'annual', 'rainfall');
      } 
      else if (periodType === 'seasonal') {
        const seasonKey = `${selectedSeason}-${date.getFullYear()}`;
        await fetchTimeSeries('seasonal', null, seasonKey, 'seasonal');
        await loadHazardData(seasonKey, 'seasonal', 'rainfall');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = async (date) => {
    if (!date) return;
    setSelectedDate(date);
    setIsLoading(true);
    try {
      await fetchTimeSeries('daily_by_day', null, format(date, 'MM-dd'), 'daily');
      await loadHazardData(date, 'daily', 'rainfall');
    } catch (error) {
      console.error('Error loading daily data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthYearChange = async (date) => {
    if (!date) return;
    setSelectedMonthYear(date);
    setIsLoading(true);
    try {
      await fetchTimeSeries('monthly', null, format(date, 'MM'), 'monthly');
      await loadHazardData(date, 'monthly', 'rainfall');
    } catch (error) {
      console.error('Error loading monthly data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearChange = async (date) => {
    if (!date) return;
    setSelectedYear(date);
    setIsLoading(true);
    try {
      await fetchTimeSeries('annual', null, format(date, 'yyyy'), 'annual');
      await loadHazardData(date, 'annual', 'rainfall');
    } catch (error) {
      console.error('Error loading annual data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeasonChange = async (season) => {
    if (!season || !selectedYear) return;
    setSelectedSeason(season);
    setIsLoading(true);
    try {
      const seasonKey = `${season}-${selectedYear.getFullYear()}`;
      await fetchTimeSeries('seasonal', null, seasonKey, 'seasonal');
      await loadHazardData(seasonKey, 'seasonal', 'rainfall');
    } catch (error) {
      console.error('Error loading seasonal data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeasonYearChange = async (date) => {
    if (!date || !selectedSeason) return;
    setSelectedYear(date);
    setIsLoading(true);
    try {
      const seasonKey = `${selectedSeason}-${format(date, 'yyyy')}`;
      await fetchTimeSeries('seasonal', null, seasonKey, 'seasonal');
      await loadHazardData(seasonKey, 'seasonal', 'rainfall');
    } catch (error) {
      console.error('Error loading seasonal data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!stats || Object.keys(stats).length === 0 || timeseriesLoading) {
    return (
      <Card className="absolute bottom-4 left-4 z-2000 w-80 border border-gray-200 bg-white shadow-md rounded-lg p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Rainfall Data</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          {isLoading ? 'Loading data...' : `No rainfall data available for the selected ${currentPeriod}.`}
        </CardContent>
      </Card>
    );
  }

  let cardTitle = "Rainfall Data";
  let cardDescription = "";
  let chartData = [];
  let dateControls = null;

  if (currentPeriod === 'daily') {
    const selectedDay = Object.keys(stats)[0];
    const rainfallValues = Array.isArray(stats[selectedDay]) ? stats[selectedDay] : [stats[selectedDay]];
    cardTitle = `Rainfall on ${selectedDay}`;
    cardDescription = "Rainfall readings across available years.";
    chartData = rainfallValues.map((value, index) => ({
      year: 2005 + index,
      value: Number(value),
    }));

    dateControls = (
      <div className="w-full">
    <DatePicker
        onChange={handleDateChange}
        minDate={minDate}
        maxDate={maxDate}
        placeholderText="Select date"
        className="w-full p-2 border rounded"
        dateFormat="MMMM d, yyyy"
        showMonthDropdown         
        showYearDropdown         
        scrollableYearDropdown
        yearDropdownItemNumber={10}
        />
      </div>
    );
  } 
  else if (currentPeriod === 'monthly') {
    const selectedMonthNumber = Object.keys(stats)[0];
    const selectedMonthName = selectedMonthNumber
      ? new Date(0, parseInt(selectedMonthNumber) - 1).toLocaleString('default', { month: 'long' })
      : '';
    const monthData = stats[selectedMonthNumber];
    cardTitle = `Rainfall in ${selectedMonthName}`;
    cardDescription = `Rainfall for ${selectedMonthName} across available years.`;
    chartData = (Array.isArray(monthData) ? monthData : [monthData]).map((value, index) => ({
      year: 2015 + index,
      value: Number(value),
    }));

    dateControls = (
      <div className="w-full">
        <DatePicker
          selected={selectedMonthYear}
          onChange={handleMonthYearChange}
          minDate={minDate}
          maxDate={maxDate}
          placeholderText="Select month and year"
          className="w-full p-2 border rounded"
          dateFormat="MMMM yyyy"
          showMonthYearPicker
          showYearDropdown
          scrollableYearDropdown
          yearDropdownItemNumber={10}
        />
      </div>
    );
  } 
  else if (currentPeriod === 'annual') {
    cardTitle = "Annual Rainfall";
    cardDescription = "Total annual rainfall for available years.";
    chartData = Object.entries(stats).map(([year, value]) => ({
      year: Number(year),
      value: Number(value),
    }));

    dateControls = (
      <div className="w-full">
        <DatePicker
          selected={selectedYear}
          onChange={handleYearChange}
          minDate={minDate}
          maxDate={maxDate}
          placeholderText="Select year"
          className="w-full p-2 border rounded"
          dateFormat="yyyy"
          showYearPicker
          scrollableYearDropdown
          yearDropdownItemNumber={10}
        />
      </div>
    );
  } 
  else if (currentPeriod === 'seasonal') {
    cardTitle = "Seasonal Rainfall";
    cardDescription = "Rainfall readings for each season across available years.";
    chartData = Object.entries(stats).flatMap(([season, values]) => {
      const seasonValues = Array.isArray(values) ? values : [values];
      return seasonValues.map((value, index) => ({
        year: 2005 + index,
        value: Number(value),
        season,
      }));
    });

    dateControls = (
      <div className="grid grid-cols-2 gap-2 w-full">
        <Select
          value={selectedSeason}
          onValueChange={handleSeasonChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MAM">MAM (Mar-May)</SelectItem>
            <SelectItem value="JJAS">JJAS (Jun-Sep)</SelectItem>
            <SelectItem value="OND">OND (Oct-Dec)</SelectItem>
          </SelectContent>
        </Select>
        <DatePicker
          selected={selectedYear}
          onChange={handleSeasonYearChange}
          minDate={minDate}
          maxDate={maxDate}
          placeholderText="Select year"
          className="w-full p-2 border rounded"
          dateFormat="yyyy"
          showYearPicker
          scrollableYearDropdown
          yearDropdownItemNumber={10}
        />
      </div>
    );
  }

  return (
    <Card className="absolute bottom-4 left-4 z-2000 w-96 border border-gray-200 bg-white shadow-md rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg text-blue-600 font-semibold">{cardTitle}</CardTitle>
        {cardDescription && <p className="text-sm text-gray-500">{cardDescription}</p>}
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis label={{ value: 'mm', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="p-4">
        {dateControls}
      </CardFooter>
    </Card>
  );
};

export default RainfallStatsCard;