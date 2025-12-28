import React, { createContext, useContext, useState } from 'react';
import { BookingData } from '../types';

interface UIContextType {
  isBookingOpen: boolean;
  bookingInitialData: Partial<BookingData> | undefined;
  openBooking: (data?: Partial<BookingData>) => void;
  closeBooking: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingInitialData, setBookingInitialData] = useState<Partial<BookingData> | undefined>(
    undefined
  );

  const openBooking = (data?: Partial<BookingData>) => {
    if (data) setBookingInitialData(data);
    setIsBookingOpen(true);
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
    setBookingInitialData(undefined);
  };

  return (
    <UIContext.Provider
      value={{
        isBookingOpen,
        bookingInitialData,
        openBooking,
        closeBooking,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
