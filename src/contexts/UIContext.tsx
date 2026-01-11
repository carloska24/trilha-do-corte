import React, { createContext, useContext, useState, useEffect } from 'react';
import { BookingData } from '../types';

type Theme = 'dark' | 'light';

interface UIContextType {
  isBookingOpen: boolean;
  bookingInitialData: Partial<BookingData> | undefined;
  openBooking: (data?: Partial<BookingData>) => void;
  closeBooking: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingInitialData, setBookingInitialData] = useState<Partial<BookingData> | undefined>(
    undefined
  );

  // Initialize theme - ALWAYS DARK
  const [theme, setTheme] = useState<Theme>('dark');

  // Apply theme to HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
    localStorage.setItem('ui_theme', 'dark');
  }, []); // Run once on mount to enforce

  const toggleTheme = () => {
    // Disabled - ensure it stays dark
    setTheme('dark');
  };

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
        theme,
        setTheme,
        toggleTheme,
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
