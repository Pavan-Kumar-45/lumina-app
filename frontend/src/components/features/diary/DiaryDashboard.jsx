import React from 'react';
import { Plus, Lock, BookOpen, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { isPastDate, formatTime } from '../../../utils/dateUtils';
import EmptyState from '../../common/EmptyState';

/**
 * DiaryDashboard component - Grid view of diary entries
 */
const DiaryDashboard = ({ entries, onSelectEntry, onNewEntry, selectedDate }) => {
  const isPast = isPastDate(selectedDate);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-[#E3E3E3]">Diary</h1>
          <p className="text-gray-500 dark:text-[#C4C7C5]">
            {isPast ? "Past Entries" : "Reflect on today"}
          </p>
        </div>
        <Button 
          onClick={onNewEntry}
          disabled={isPast}
          className={`rounded-xl px-6 ${
            isPast 
              ? 'bg-gray-400 cursor-not-allowed text-white' 
              : 'bg-[#A8C7FA] text-[#003355]'
          }`}
        >
          {isPast ? (
            <span className="flex items-center gap-2">
              <Lock size={16} /> Locked
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Plus size={18} /> New Entry
            </span>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {entries.map((entry) => (
            <Card 
              key={entry.id} 
              onClick={() => onSelectEntry(entry)}
              className="h-56 flex flex-col cursor-pointer group hover:border-[#A8C7FA]/50 transition-all p-6 bg-white dark:bg-[#1E1F20] dark:border-[#444746]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-indigo-50 dark:bg-[#A8C7FA]/20 rounded-xl text-indigo-600 dark:text-[#A8C7FA]">
                  <BookOpen size={20} />
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 font-medium bg-gray-50 dark:bg-[#131314] px-2 py-1 rounded-md">
                  <Clock size={12} />
                  {formatTime(entry.entry_datetime)}
                </div>
              </div>
              
              <h3 className="font-bold text-xl text-gray-800 dark:text-[#E3E3E3] mb-3 line-clamp-1 group-hover:text-[#A8C7FA] transition-colors">
                {entry.title || 'Untitled'}
              </h3>
              
              <p className="text-gray-500 dark:text-[#C4C7C5] text-sm line-clamp-3 font-serif leading-relaxed">
                {entry.content}
              </p>
            </Card>
          ))}
        </AnimatePresence>
        
        {entries.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={BookOpen}
              message="No entries found."
              description={isPast ? "No entries were written on this date." : "Start writing your first entry today!"}
              action={!isPast ? onNewEntry : undefined}
              actionLabel={!isPast ? "New Entry" : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryDashboard;
