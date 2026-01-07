import React, { createContext, useCallback, useContext, useState } from 'react';

interface TourContextType {
  isTourOpen: boolean;
  startTour: () => void;
  endTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTourOpen, setIsTourOpen] = useState(false);

  const startTour = useCallback(() => {
    setIsTourOpen(true);
  }, []);

  const endTour = useCallback(() => {
    setIsTourOpen(false);
  }, []);

  return (
    <TourContext.Provider
      value={{
        isTourOpen,
        startTour,
        endTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return ctx;
};