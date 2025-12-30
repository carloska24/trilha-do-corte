import { useState, useEffect } from 'react';
import { LogOut, Check } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export const useShopStatus = () => {
  const { shopSettings } = useData();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getShopStatus = () => {
    // 1. Get Current Time Info
    const hour = currentTime.getHours();

    // 2. Format Date Key (YYYY-MM-DD) for local time
    const year = currentTime.getFullYear();
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const day = String(currentTime.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    // 3. Get Exception for Today (if any)
    const exception = shopSettings.exceptions?.[dateKey];

    // 4. Determine Limits depending on priority (Exception > Global)
    let startHour = shopSettings.startHour;
    let endHour = shopSettings.endHour;
    let isClosedDay = false;

    if (exception) {
      if (exception.closed) {
        isClosedDay = true;
      } else {
        if (exception.startHour !== undefined) startHour = exception.startHour;
        if (exception.endHour !== undefined) endHour = exception.endHour;
      }
    }

    // 5. Check "Open" Status
    // Open if: NOT closed day AND current hour is within range
    const isOpen = !isClosedDay && hour >= startHour && hour < endHour;

    if (isOpen) {
      return {
        label: 'ABERTO',
        color: 'text-green-500',
        bg: 'bg-green-900/20',
        border: 'border-green-500/50',
        icon: Check,
        glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
        isOpen: true,
      };
    } else {
      return {
        label: 'FECHADO',
        color: 'text-red-500',
        bg: 'bg-red-900/20',
        border: 'border-red-900/50',
        icon: LogOut,
        glow: 'shadow-none',
        isOpen: false,
      };
    }
  };

  return { currentTime, shopStatus: getShopStatus() };
};
