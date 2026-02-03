import React from 'react';

/**
 * LoadingSpinner component - Reusable loading indicator
 */
const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`${sizeClasses[size]} border-gray-300 border-t-[#A8C7FA] rounded-full animate-spin ${className}`} />
  );
};

/**
 * LoadingScreen component - Full page loading state
 */
export const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F4F8] dark:bg-[#131314]">
      <LoadingSpinner size="lg" />
      <div className="mt-4 text-gray-600 dark:text-[#E3E3E3] font-medium tracking-wide">
        {message}
      </div>
    </div>
  );
};

export default LoadingSpinner;
