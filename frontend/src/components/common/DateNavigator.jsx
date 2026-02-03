import React, { useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import BeautifulCalendar from './BeautifulCalendar';
import { useModal, useClickOutside } from '../../hooks/useModal';
import { formatDate } from '../../utils/dateUtils';

/**
 * DateNavigator component - Reusable date picker with navigation
 */
const DateNavigator = ({ date, onDateChange, onNextDay, onPreviousDay }) => {
  const { isOpen, open, close } = useModal();
  const calendarRef = useClickOutside(close);

  return (
    <div className="flex items-center bg-white dark:bg-[#1E1F20] p-1 rounded-xl border border-gray-200 dark:border-[#444746] shadow-sm">
      <button 
        onClick={onPreviousDay} 
        className="p-2 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg text-gray-500 dark:text-[#C4C7C5]"
      >
        <ChevronLeft size={20} />
      </button>
      
      <div className="relative" ref={calendarRef}>
        <button 
          onClick={open}
          className="px-4 py-2 flex items-center gap-2 text-gray-700 dark:text-[#E3E3E3] font-medium hover:bg-gray-50 dark:hover:bg-[#303030] rounded-lg transition-colors"
        >
          <CalendarIcon size={18} className="text-[#A8C7FA]" />
          {formatDate(date)}
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <BeautifulCalendar 
              selectedDate={date} 
              onChange={(newDate) => {
                onDateChange(newDate);
                close();
              }}
              onClose={close}
            />
          )}
        </AnimatePresence>
      </div>
      
      <button 
        onClick={onNextDay}
        className="p-2 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg text-gray-500 dark:text-[#C4C7C5]"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default DateNavigator;
