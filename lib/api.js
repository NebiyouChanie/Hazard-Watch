// lib/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/hazards';

export const fetchHazardData = {
  // Regions endpoints
  getRegions: async () => {
    const res = await fetch(`${API_BASE_URL}/regions`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  getRegionByName: async (name) => {
    const res = await fetch(`${API_BASE_URL}/regions/${name}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  // Rainfall endpoints
  getRainfall: async (date, period = 'daily') => {
    let endpoint;
    switch (period) {
      case 'daily':
        endpoint = `${API_BASE_URL}/rainfall/daily/${date}`;
        break;
      case 'monthly':
        endpoint = `${API_BASE_URL}/rainfall/monthly/${date}`;
        break;
      case 'annual':
        endpoint = `${API_BASE_URL}/rainfall/annual/${date}`;
        break;
      case 'seasonal':
        endpoint = `${API_BASE_URL}/rainfall/seasonal/${date}`;
        break;
      default:
        throw new Error(`Invalid period: ${period}`);
    }

    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  // Time series endpoints
  getTimeSeries: async (aggregation = 'daily') => {
    const res = await fetch(`${API_BASE_URL}/timeseries?aggregation=${aggregation}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  getDailyTimeSeriesByDay: async (date) => {
    console.log("🚀 ~ getDailyTimeSeriesByDay: ~ date:", date)
    const res = await fetch(`${API_BASE_URL}/timeseries/daily_by_day?date=${date}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  getMonthlyTimeSeries: async (month) => {
    const url = month 
      ? `${API_BASE_URL}/timeseries/monthly?month=${month}`
      : `${API_BASE_URL}/timeseries/monthly`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  getAnnualTimeSeries: async (year) => {
    const url = year 
      ? `${API_BASE_URL}/timeseries/annual?year=${year}`
      : `${API_BASE_URL}/timeseries/annual`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  getSeasonalTimeSeries: async (season) => {
    const url = season 
      ? `${API_BASE_URL}/timeseries/seasonal?season=${season}`
      : `${API_BASE_URL}/timeseries/seasonal`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  // Available data endpoints
  getAvailablePeriods: async () => {
    const res = await fetch(`${API_BASE_URL}/rainfall/available_periods`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  getAvailableDates: async () => {
    const res = await fetch(`${API_BASE_URL}/rainfall/available_dates`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },
  
// Temperature endpoints
getTemperature: async (date, period = 'daily') => {
  let endpoint;
  switch (period) {
    case 'daily':
      endpoint = `${API_BASE_URL}/temperature/daily/${date}`;
       break;
    case 'monthly':
      endpoint = `${API_BASE_URL}/temperature/monthly/${date}`;
      break;
    case 'annual':
      endpoint = `${API_BASE_URL}/temperature/annual/${date}`;
      break;
    case 'seasonal':
      endpoint = `${API_BASE_URL}/temperature/seasonal/${date}`;
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }

  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
},

// Temperature time series endpoints
getTemperatureTimeSeries: async (aggregation = 'daily') => {
  const res = await fetch(`${API_BASE_URL}/temperature/timeseries?aggregation=${aggregation}`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
},

getDailyTemperatureTimeSeriesByDay: async (date) => {
   const res = await fetch(`${API_BASE_URL}/temperature/timeseries/daily_by_day?date=${date}`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
   return res.json();
},

getMonthlyTemperatureTimeSeries: async (month) => {
  console.log("🚀 ~ getMonthlyTemperatureTimeSeries: ~ month:", month)
  const url = month 
    ? `${API_BASE_URL}/temperature/timeseries/monthly?month=${month}`
    : `${API_BASE_URL}/temperature/timeseries/monthly`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
},

getAnnualTemperatureTimeSeries: async (year) => {
  const url = year 
    ? `${API_BASE_URL}/temperature/timeseries/annual?year=${year}`
    : `${API_BASE_URL}/temperature/timeseries/annual`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
},

getSeasonalTemperatureTimeSeries: async (season) => {
  const url =  `${API_BASE_URL}/temperature/timeseries/seasonal?season=${season}`
  const res = await fetch(url);
  console.log("🚀 ~ getSeasonalTemperatureTimeSeries: ~ url:", url)
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
},

// Temperature available data endpoints
getTemperatureAvailablePeriods: async () => {
  const res = await fetch(`${API_BASE_URL}/temperature/available_periods`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
},

getTemperatureAvailableDates: async () => {
  const res = await fetch(`${API_BASE_URL}/temperature/available_dates`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}
};