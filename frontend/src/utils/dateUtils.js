/**
 * Date utility functions for consistent date handling across the app
 */

/**
 * Get current date in YYYY-MM-DD format (local timezone)
 */
export const getTodayDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Format date to local date string
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {object} options - Intl.DateTimeFormat options
 */
export const formatDate = (dateStr, options = { month: 'short', day: 'numeric' }) => {
  return new Date(dateStr).toLocaleDateString('en-US', options);
};

/**
 * Format date to long format
 * @param {string} dateStr - Date string
 */
export const formatDateLong = (dateStr) => {
  return new Date(dateStr).toLocaleDateString(undefined, { dateStyle: 'long' });
};

/**
 * Format time from datetime string
 * @param {string} datetimeStr - ISO datetime string
 */
export const formatTime = (datetimeStr) => {
  return new Date(datetimeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Check if a date is in the past (before today)
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 */
export const isPastDate = (dateStr) => {
  return new Date(dateStr).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
};

/**
 * Check if a date is today
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 */
export const isToday = (dateStr) => {
  return dateStr === getTodayDate();
};

/**
 * Add or subtract days from a date
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {number} days - Number of days to add (positive) or subtract (negative)
 */
export const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Convert date string to ISO format for backend
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 */
export const toISODateTime = (dateStr) => {
  return dateStr ? new Date(dateStr).toISOString() : null;
};

/**
 * Extract date from ISO datetime string
 * @param {string} isoStr - ISO datetime string
 */
export const extractDate = (isoStr) => {
  return isoStr ? isoStr.split('T')[0] : '';
};
