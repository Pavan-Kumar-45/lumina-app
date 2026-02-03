/**
 * Application-wide constants
 */

// Priority levels for tasks
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Export formats
export const EXPORT_FORMATS = {
  MARKDOWN: 'md',
  TEXT: 'txt',
  PDF: 'pdf'
};

// Animation variants for framer-motion
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, height: 0 }
  },
  slideInRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  }
};

// Color classes for different elements
export const COLOR_CLASSES = {
  primary: 'bg-[#A8C7FA] text-[#003355]',
  secondary: 'bg-gray-200 dark:bg-[#303030]',
  success: 'bg-green-100 text-green-600 dark:bg-green-900/30',
  danger: 'bg-red-100 text-red-600 dark:bg-red-900/30',
  warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
};

// Status colors for goals and tasks
export const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-600 dark:bg-green-900/30',
  active: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30',
  pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800',
  overdue: 'bg-red-100 text-red-600 dark:bg-red-900/30'
};

// Quote list for dashboard
export const MOTIVATIONAL_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal.", author: "Winston Churchill" }
];
