'use client';
import { createContext, useContext } from 'react';
import { useHazardData } from '@/hooks/useHazardData';

const HazardDataContext = createContext();

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