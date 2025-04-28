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
    loading: timeseriesLoading,
  } = useTimeSeriesDataContext();
  
  const { loadHazardData,availableDates } = useHazardDataContext();
    
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState('MAM');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const availableRainfallDates = availableDates.rainfall
  // Get min and max dates for each period type
  const getDateBounds = () => {
    if (!availableRainfallDates) return { min: null, max: null };
     if (currentPeriod === 'daily' && availableRainfallDates.daily?.length) {
      const sortedDates = availableRainfallDates.daily
        .map(dateStr => parseISO(dateStr))
        .filter(date => isValid(date))
        .sort((a, b) => a - b);
      
      return {
        min: sortedDates[0],
        max: sortedDates[sortedDates.length - 1]
      };
    }
    
    if (currentPeriod === 'monthly' && availableRainfallDates.daily?.length) {
        // Get all unique year-month combinations from available dates
        const yearMonths = [...new Set(
          availableRainfallDates.daily.map(dateStr => dateStr.slice(0, 7)) // Extract YYYY-MM
        )].sort();
        
        const minDate = yearMonths[0] ? new Date(`${yearMonths[0]}-01`) : null;
        const maxDate = yearMonths[yearMonths.length - 1] 
          ? new Date(`${yearMonths[yearMonths.length - 1]}-01`) 
          : null;
      
        return {
          min: minDate,
          max: maxDate
        };
      }
    
      if (currentPeriod === 'annual' && availableRainfallDates.annual?.length) {
        // Sort years numerically (as strings)
        const sortedYears = [...availableRainfallDates.annual].sort();
        
        return {
          min: new Date(sortedYears[0], 0, 1),   
          max: new Date(sortedYears[sortedYears.length - 1], 11, 31)   
        };
      }

      if (currentPeriod === 'seasonal' && availableRainfallDates.daily?.length) {
        // Get all unique year-season combinations from available dates
        const seasonMap = {};
        
        availableRainfallDates.daily.forEach(dateStr => {
          const date = parseISO(dateStr);
          if (!isValid(date)) return;
          
          const year = date.getFullYear();
          const month = date.getMonth() + 1; // 1-12
          
          let season;
          if (month >= 3 && month <= 5) season = 'MAM';
          else if (month >= 6 && month <= 9) season = 'JJAS';
          else if (month >= 10 || month <= 2) season = 'OND';
          
          const seasonKey = `${season}-${year}`;
          seasonMap[seasonKey] = true;
        });
        
        const seasons = Object.keys(seasonMap).sort();
        if (seasons.length === 0) return { min: null, max: null };
        
        // Convert first and last seasons to Date objects (using middle month)
        const seasonToDate = (seasonStr) => {
          const [season, year] = seasonStr.split('-');
          let month;
          if (season === 'MAM') month = 4; // April
          else if (season === 'JJAS') month = 7; // July
          else month = 11; // November
          return new Date(year, month);
        };
        
        return {
          min: seasonToDate(seasons[0]),
          max: seasonToDate(seasons[seasons.length - 1])
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
    if (!initialLoadDone && availableRainfallDates && minDate && maxDate) {
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
        // Extract year and month from maxDate
        const year = maxDate.getFullYear();
        const month = maxDate.getMonth() + 1; // Months are 0-indexed in JS (0-11)
      
        // Determine the season based on the month
        let season;
        if (month >= 3 && month <= 5) season = 'MAM';      // Spring (March-May)
        else if (month >= 6 && month <= 9) season = 'JJAS';  // Summer (June-Sept)
        else season = 'OND';                                 // Autumn/Winter (Oct-Dec)
      
        // Format as "SEASON-YEAR" (e.g., "MAM-2024")
        const seasonDate = `${season}-${year}`;
      
        // Update state and load data
        setSelectedSeason(season);
        setSelectedYear(maxDate);
        loadInitialData(seasonDate, 'seasonal');
      }
    }
  }, [availableRainfallDates, currentPeriod, initialLoadDone, minDate, maxDate]);

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
        const season = date.split('-')[0]
        await fetchTimeSeries('seasonal', null, season, 'seasonal');
        await loadHazardData(date, 'seasonal', 'rainfall');
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

  const handleSeasonChange = (season) => {
    if (!season) return;
    setSelectedSeason(season);
   };
  
  const handleSeasonYearChange = (date) => {
    if (!date) return;
    setSelectedYear(date);
   };


useEffect(() => {
    if (currentPeriod === 'seasonal' && selectedSeason && selectedYear) {
      const year = selectedYear.getFullYear();
      const seasonKey = `${selectedSeason}-${year}`;

      const fetchData = async () => {
        setIsLoading(true);
        try {
          await fetchTimeSeries('seasonal', null, selectedSeason, 'seasonal');
          await loadHazardData(seasonKey, 'seasonal', 'rainfall');
        } catch (error) {
          console.error('Error loading seasonal data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [selectedSeason, selectedYear, currentPeriod, fetchTimeSeries, loadHazardData, setIsLoading]); // Ensure these dependencies are included

  
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
    cardTitle = `Daily Rainfall Analysis`;
    cardDescription = `Rainfall readings on ${selectedDay} across available years.`;
    chartData = rainfallValues.map((value, index) => ({
      year: 2005 + index,
      value: Number(value),
    }));

    dateControls = (
      <div className="w-full">
    <DatePicker
        selected={selectedDate}
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
    cardTitle = `Monthly Rainfall Analysis`;
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
    cardTitle = "Annual Rainfall Anaylsis";
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
          {/* Native select with Tailwind styling */}
          <select
            value={selectedSeason}
            onChange={(e) => handleSeasonChange(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="MAM">MAM (Mar-May)</option>
            <option value="JJAS">JJAS (Jun-Sep)</option>
            <option value="OND">OND (Oct-Dec)</option>
          </select>
      
          {/* Keep your existing DatePicker */}
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
        {dateControls}

      </CardHeader>
      <CardContent className="h-64">
      <CardTitle className="text-md text-gray-600 font-semibold">Time Series </CardTitle>
      {cardDescription && <p className="text-sm text-gray-500">{cardDescription}</p>}
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
      <CardFooter className="p-4 flex flex-col justify-start">
       </CardFooter>
    </Card>
  );
};

export default RainfallStatsCard;