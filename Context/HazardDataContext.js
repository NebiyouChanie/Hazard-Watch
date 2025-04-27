// context/HazardDataContext.js
'use client';
import { createContext, useState, useCallback, useContext } from 'react';
import { useHazardData } from '@/hooks/useHazardData';

const HazardDataContext = createContext({
  regions: null,
  hazardData: null,
  loading: false,
  stats: null,
  error: null,
  mapBounds: null,
  selectedHazardType: null,
  setSelectedHazardType: () => {},
  availablePeriods: {},
  availableDates: {},
  loadRegions: () => {},
  loadHazardData: () => {},
  clearError: () => {},
});

export function HazardDataProvider({ children }) {
  const hazardData = useHazardData();
  return (
    <HazardDataContext.Provider value={hazardData}>
      {children}
    </HazardDataContext.Provider>
  );
}

export function useHazardDataContext() {
  const context = useContext(HazardDataContext);
  if (!context) {
    throw new Error('useHazardDataContext must be used within a HazardDataProvider');
  }
  return context;
}