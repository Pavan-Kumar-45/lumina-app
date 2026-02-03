import { useState } from 'react';
import { getTodayDate, addDays } from '../utils/dateUtils';

/**
 * Custom hook for managing date navigation
 * @param {string} initialDate - Initial date in YYYY-MM-DD format
 * @returns {object} Date state and navigation functions
 */
export const useDateNavigation = (initialDate = getTodayDate()) => {
  const [date, setDate] = useState(initialDate);

  const nextDay = () => setDate(prev => addDays(prev, 1));
  const previousDay = () => setDate(prev => addDays(prev, -1));
  const goToToday = () => setDate(getTodayDate());
  const goToDate = (newDate) => setDate(newDate);

  return {
    date,
    setDate: goToDate,
    nextDay,
    previousDay,
    goToToday
  };
};
