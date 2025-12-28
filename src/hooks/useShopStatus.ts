import { useState, useEffect } from 'react';
import { LogOut, Check } from 'lucide-react';

export const useShopStatus = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getShopStatus = () => {
    const hour = currentTime.getHours();
    const day = currentTime.getDay();

    if (day === 0)
      return {
        label: 'LOJA FECHADA',
        color: 'text-red-500',
        bg: 'bg-red-900/20',
        border: 'border-red-900/50',
        icon: LogOut,
        glow: 'shadow-none',
        isOpen: false,
      };
    if (hour >= 9 && hour < 18)
      return {
        label: 'ABERTO',
        color: 'text-green-500',
        bg: 'bg-green-900/20',
        border: 'border-green-500/50',
        icon: Check,
        glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
        isOpen: true,
      };
    return {
      label: 'FECHADO',
      color: 'text-red-500',
      bg: 'bg-red-900/20',
      border: 'border-red-900/50',
      icon: LogOut,
      glow: 'shadow-none',
      isOpen: false,
    };
  };

  return { currentTime, shopStatus: getShopStatus() };
};
