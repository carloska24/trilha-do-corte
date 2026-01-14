import React from 'react';

interface MarketingIconProps {
  size?: number;
  className?: string;
}

export const MarketingIcon: React.FC<MarketingIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="20" fill="#fc4750" r="11" />
      <circle cx="12" cy="20" fill="#f9f9f9" r="9" />
      <circle cx="12" cy="20" fill="#fc4750" r="6" />
      <circle cx="12" cy="20" fill="#f9f9f9" r="4" />
      <circle cx="12" cy="20" fill="#fc4750" r="2" />
      <path
        d="m30.97 7.75c-.09-.37-.4-.66-.77-.73l-4.35-.87-.87-4.35c-.08-.38-.36-.68-.73-.77s-.77.03-1.01.33l-5 6c-.2.25-.28.57-.2.88l1 4c.09.36.37.64.73.73l4 1c.07.02.15.03.23.03.23 0 .46-.08.64-.23l6-5c.3-.25.42-.64.33-1.02z"
        fill="#f6b545"
      />
      <path
        d="m12 21c-.26 0-.51-.1-.71-.29-.39-.39-.39-1.02 0-1.41l15-15c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-15 15c-.19.19-.44.29-.7.29z"
        fill="#7f4122"
      />
    </svg>
  );
};
