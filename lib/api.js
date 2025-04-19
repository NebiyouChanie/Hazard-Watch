import axios from "axios";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/hazards';

 
export const fetchHazardData = {
  getRegions: async () => {
    const response = await fetch(`${API_BASE}/regions`);
    if (!response.ok) throw new Error('Failed to fetch regions');
    return await response.json();
  },
  
  getRainfall: async (date) => {
      try {
      const response = await axios.get(`${API_BASE}/rainfall/daily/${date}`);
      
       // Add validation for response structure
      if (!response.data || !response.data.data || !response.data.bounds) {
        throw new Error('Invalid response structure from server');
      }
      
      return {
        data: response.data.data,
        bounds: response.data.bounds,
        stats: response.data.stats || {},
        date: response.data.date
      };
    } catch (error) {
      console.error(`API Error for date ${date}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(`Failed to fetch rainfall data: ${error.response?.data?.detail || error.message}`);
    }
  },
};