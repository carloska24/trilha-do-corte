import { useState, useEffect } from 'react';

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
  shortFormatted: string;
}

export const useCountdown = (targetDate: string, targetTime: string): CountdownResult => {
  const [countdown, setCountdown] = useState<CountdownResult>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    formatted: '00:00:00',
    shortFormatted: '0h 0min',
  });

  useEffect(() => {
    if (!targetDate || !targetTime) {
      setCountdown(prev => ({ ...prev, isExpired: true }));
      return;
    }

    const target = new Date(`${targetDate}T${targetTime}`);

    const calculateCountdown = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          formatted: '00:00:00',
          shortFormatted: 'Agora!',
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n: number) => n.toString().padStart(2, '0');

      let formatted = '';
      let shortFormatted = '';

      if (days > 0) {
        formatted = `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        shortFormatted = `${days}d ${hours}h`;
      } else {
        formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        shortFormatted = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
      }

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        formatted,
        shortFormatted,
      });
    };

    // Calculate immediately
    calculateCountdown();

    // Update every second
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  return countdown;
};
