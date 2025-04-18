export const mockRegions = [
    { id: "afar", name: "Afar", coordinates: [11.755, 40.958] },
    { id: "amhara", name: "Amhara", coordinates: [11.661, 37.958] },
    { id: "oromia", name: "Oromia", coordinates: [7.546, 40.634] },
    // Add more regions...
  ];
  
  export const mockRainfallData = {
    dates: ["2023-01-01", "2023-01-02", "2023-01-03", "2023-01-04"],
    regions: {
      afar: [12.5, 0.0, 3.2, 7.8],
      amhara: [8.2, 1.5, 5.7, 10.3],
      oromia: [15.0, 2.3, 8.9, 12.4],
    },
  };
  
  export const mockTemperatureData = {
    dates: ["2023-01-01", "2023-01-02", "2023-01-03", "2023-01-04"],
    regions: {
      afar: [28.5, 29.1, 30.2, 27.8],
      amhara: [22.1, 21.5, 23.0, 22.7],
      oromia: [24.3, 25.0, 24.8, 23.9],
    },
  };
  