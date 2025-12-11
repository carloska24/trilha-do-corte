import React from 'react';
import { SettingsIcon } from './SettingsIcon';

interface NavIconProps {
  name: 'dashboard' | 'clients' | 'calendar' | 'services' | 'settings';
  isActive: boolean;
  className?: string;
}

export const NavIcon: React.FC<NavIconProps> = ({ name, isActive, className = '' }) => {
  const activeColor = '#FFD700'; // Gold
  const inactiveColor = '#9CA3AF'; // Gray-400

  // Special case for Settings (Custom SVG)
  if (name === 'settings') {
    return <SettingsIcon size={24} className={className} />;
  }

  // Map names to file paths
  const iconMap = {
    dashboard: '/icons/nav-dashboard.png',
    clients: '/icons/nav-clients.png',
    calendar: '/icons/nav-calendar.png',
    services: '/icons/nav-services.png',
  };

  const iconPath = iconMap[name as keyof typeof iconMap];

  if (!iconPath) return null;

  return (
    <div
      className={`w-6 h-6 ${className}`}
      style={{
        backgroundColor: isActive ? activeColor : inactiveColor,
        maskImage: `url("${iconPath}")`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskImage: `url("${iconPath}")`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        transition: 'background-color 0.3s ease',
      }}
    />
  );
};
