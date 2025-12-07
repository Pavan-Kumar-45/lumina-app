import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const BeautifulCalendar = ({ selectedDate, onChange, onClose, align = 'left' }) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const handleDayClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const offset = newDate.getTimezoneOffset() * 60000;
    const localISODate = new Date(newDate.getTime() - offset).toISOString().split('T')[0];
    onChange(localISODate);
    onClose();
  };

  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 10 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className={`absolute top-14 z-[100] bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#444746] p-4 w-72 ${align === 'right' ? 'right-0' : 'left-0'}`}
    >
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-full text-gray-600 dark:text-[#E3E3E3]"><ChevronLeft size={20} /></button>
        <span className="font-bold text-gray-800 dark:text-[#E3E3E3]">{monthName} {year}</span>
        <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-full text-gray-600 dark:text-[#E3E3E3]"><ChevronRight size={20} /></button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-medium text-gray-400 uppercase">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isSelected = 
            day === new Date(selectedDate).getDate() && 
            currentDate.getMonth() === new Date(selectedDate).getMonth() &&
            currentDate.getFullYear() === new Date(selectedDate).getFullYear();
            
          const isToday = 
            day === new Date().getDate() && 
            currentDate.getMonth() === new Date().getMonth() &&
            currentDate.getFullYear() === new Date().getFullYear();

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`
                h-8 w-8 rounded-full text-sm flex items-center justify-center transition-all
                ${isSelected ? 'bg-[#A8C7FA] text-[#003355] font-bold' : 'text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#303030]'}
                ${isToday && !isSelected ? 'border border-[#A8C7FA] text-[#A8C7FA]' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BeautifulCalendar;