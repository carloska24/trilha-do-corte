import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 dark:border-gray-800 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-neon-yellow rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
};
