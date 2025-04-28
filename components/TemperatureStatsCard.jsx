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

const TemperatureStatsCard = () => {
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
    
    if (currentPeriod === 'monthly' && availableDates.dates?.length) {
      const yearMonths = [...new Set(
        availableDates.dates.map(dateStr => dateStr.slice(0, 7)))
      ].sort();
      
      const minDate = yearMonths[0] ? new Date(`${yearMonths[0]}-01`) : null;
      const maxDate = yearMonths[yearMonths.length - 1] 
        ? new Date(`${yearMonths[yearMonths.length - 1]}-01`) 
        : null;
    
      return {
        min: minDate,
        max: maxDate
      };
    }
    
    if (currentPeriod === 'annual' && availableDates.years?.length) {
      const sortedYears = [...availableDates.years].sort();
      
      return {
        min: new Date(sortedYears[0], 0, 1),   
        max: new Date(sortedYears[sortedYears.length - 1], 11, 31)   
      };
    }

    if (currentPeriod === 'seasonal' && availableDates.dates?.length) {
      const seasonMap = {};
      
      availableDates.dates.forEach(dateStr => {
        const date = parseISO(dateStr);
        if (!isValid(date)) return;
        
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        let season;
        if (month >= 3 && month <= 5) season = 'MAM';
        else if (month >= 6 && month <= 9) season = 'JJAS';
        else if (month >= 10 || month <= 2) season = 'OND';
        
        const seasonKey = `${season}-${year}`;
        seasonMap[seasonKey] = true;
      });
      
      const seasons = Object.keys(seasonMap).sort();
      if (seasons.length === 0) return { min: null, max: null };
      
      const seasonToDate = (seasonStr) => {
        const [season, year] = seasonStr.split('-');
        let month;
        if (season === 'MAM') month = 4;
        else if (season === 'JJAS') month = 7;
        else month = 11;
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
        const year = maxDate.getFullYear();
        const month = maxDate.getMonth() + 1;
      
        let season;
        if (month >= 3 && month <= 5) season = 'MAM';
        else if (month >= 6 && month <= 9) season = 'JJAS';
        else season = 'OND';
      
        const seasonDate = `${season}-${year}`;
      
        setSelectedSeason(season);
        setSelectedYear(maxDate);
        loadInitialData(seasonDate, 'seasonal');
      }
    }
  }, [availableDates, currentPeriod, initialLoadDone, minDate, maxDate]);

  const loadInitialData = async (date, periodType) => {
    setIsLoading(true);
    try {
      if (periodType === 'daily') {
        await fetchTimeSeries('daily_by_day', null, format(date, 'MM-dd'), 'daily', 'temperature');
        await loadHazardData(date, 'daily', 'temperature');
      } 
      else if (periodType === 'monthly') {
        await fetchTimeSeries('monthly', null, format(date, 'MM'), 'monthly', 'temperature');
        await loadHazardData(date, 'monthly', 'temperature');
      } 
      else if (periodType === 'annual') {
        await fetchTimeSeries('annual', null, format(date, 'yyyy'), 'annual', 'temperature');
        await loadHazardData(date, 'annual', 'temperature');
      } 
      else if (periodType === 'seasonal') {
        const season = date.split('-')[0]
        await fetchTimeSeries('seasonal', null, season, 'seasonal', 'temperature');
        await loadHazardData(date, 'seasonal', 'temperature');
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
      await fetchTimeSeries('daily_by_day', null, format(date, 'MM-dd'), 'daily', 'temperature');
      await loadHazardData(date, 'daily', 'temperature');
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
      await fetchTimeSeries('monthly', null, format(date, 'MM'), 'monthly', 'temperature');
      await loadHazardData(date, 'monthly', 'temperature');
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
      await fetchTimeSeries('annual', null, format(date, 'yyyy'), 'annual', 'temperature');
      await loadHazardData(date, 'annual', 'temperature');
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
          await fetchTimeSeries('seasonal', null, selectedSeason, 'seasonal', 'temperature');
          await loadHazardData(seasonKey, 'seasonal', 'temperature');
        } catch (error) {
          console.error('Error loading seasonal data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [selectedSeason, selectedYear, currentPeriod]);

  if (!stats || Object.keys(stats).length === 0 || timeseriesLoading) {
    return (
      <Card className="absolute bottom-4 left-4 z-2000 w-80 border border-gray-200 bg-white shadow-md rounded-lg p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Temperature Data</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          {isLoading ? 'Loading data...' : `No temperature data available for the selected ${currentPeriod}.`}
        </CardContent>
      </Card>
    );
  }

  let cardTitle = "Temperature Data";
  let cardDescription = "";
  let chartData = [];
  let dateControls = null;

  if (currentPeriod === 'daily') {
    const selectedDay = Object.keys(stats)[0];
    const tempValues = Array.isArray(stats[selectedDay]) ? stats[selectedDay] : [stats[selectedDay]];
    cardTitle = `Temperature on ${selectedDay}`;
    cardDescription = "Temperature readings across available years.";
    chartData = tempValues.map((value, index) => ({
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
    cardTitle = `Temperature in ${selectedMonthName}`;
    cardDescription = `Temperature for ${selectedMonthName} across available years.`;
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
    cardTitle = "Annual Temperature";
    cardDescription = "Average annual temperature for available years.";
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
    cardTitle = "Seasonal Temperature";
    cardDescription = "Temperature readings for each season across available years.";
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
        <select
          value={selectedSeason}
          onChange={(e) => handleSeasonChange(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="MAM">MAM (Mar-May)</option>
          <option value="JJAS">JJAS (Jun-Sep)</option>
          <option value="OND">OND (Oct-Dec)</option>
        </select>
    
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
            <YAxis label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="p-4">
        {dateControls}
      </CardFooter>
    </Card>
  );
};

export default TemperatureStatsCard;