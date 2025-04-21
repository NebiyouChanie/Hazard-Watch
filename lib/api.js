// lib/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/hazards';

export const fetchHazardData = {
  getRegions: async () => {
    const res = await fetch(`${API_BASE_URL}/regions`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },
  getRainfall: async (formattedDate, period = 'daily') => {
    const url = `${API_BASE_URL}/rainfall`;
    let fetchUrl = '';

    if (period === 'daily') {
      if (formattedDate) {
        fetchUrl = `${url}/daily/${formattedDate}`;
      } else {
        console.warn("Attempting to fetch daily rainfall without a date.");
        return Promise.reject("Date is required for daily rainfall data.");
      }
    } else if (period === 'monthly') {
      if (formattedDate) {
        // Assuming formattedDate is in YYYY-MM format
        fetchUrl = `${url}/monthly/${formattedDate}`;
        console.log("🚀 ~ getRainfall: ~ fetchUrl:", fetchUrl)
      } else {
        console.warn("Attempting to fetch monthly rainfall without a month.");
        return Promise.reject("Month (YYYY-MM) is required for monthly rainfall data.");
      }
    } else if (period === 'annual') {
      if (formattedDate) {
        // Assuming formattedDate is in YYYY format
        fetchUrl = `${url}/annual/${formattedDate}`;
        console.log("🚀 ~ getRainfall: ~ fetchUrl (yearly):", fetchUrl);
      } else {
        console.warn("Attempting to fetch yearly rainfall without a year.");
        return Promise.reject("Year (YYYY) is required for yearly rainfall data.");
      }
    } 

    const res = await fetch(fetchUrl);
    if (!res.ok) {
      console.error(`HTTP error! status: ${res.status} for URL: ${fetchUrl}`);
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  },
  getTemperature: async (date, period = 'daily') => {
    let url = `${API_BASE_URL}/temperature`;
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (period) params.append('period', period);
    const res = await fetch(`${url}?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },
};