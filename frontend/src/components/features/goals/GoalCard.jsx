import React from 'react';
import { Check, Edit2, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import Card from '../../common/Card';
import { formatDate } from '../../../utils/dateUtils';

/**
 * GoalCard component - Individual goal display card
 */
const GoalCard = ({ goal, onEdit, onComplete, onDelete }) => {
  return (
    <Card className="p-5 flex flex-col h-full bg-white dark:bg-[#1E1F20] dark:border-[#444746] hover:border-indigo-300 dark:hover:border-[#A8C7FA] transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2 rounded-lg ${
          goal.is_completed 
            ? 'bg-green-100 text-green-600 dark:bg-green-900/30' 
            : 'bg-pink-100 text-pink-600 dark:bg-pink-900/30'
        }`}>
          {goal.is_completed ? (
            <Check size={20} />
          ) : (
            <div className="w-5 h-5 border-2 border-current rounded-full" />
          )}
        </div>
        
        <div className="flex gap-1">
          {!goal.is_completed && onComplete && (
            <button 
              onClick={onComplete}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#303030] text-green-600"
              title="Mark Complete"
            >
              <Check size={18} />
            </button>
          )}
          <button 
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#303030] text-gray-500 dark:text-[#C4C7C5]"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#303030] text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <h3 className={`font-bold text-lg mb-2 ${
        goal.is_completed 
          ? 'line-through text-gray-400' 
          : 'text-gray-800 dark:text-[#E3E3E3]'
      }`}>
        {goal.title}
      </h3>
      
      <p className="text-gray-500 dark:text-[#C4C7C5] text-sm mb-4 flex-1">
        {goal.description}
      </p>
      
      {goal.target_date && (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-50 dark:bg-[#131314] p-2 rounded-lg w-fit">
          <CalendarIcon size={14} />
          Target: {formatDate(goal.target_date, { dateStyle: 'medium' })}
        </div>
      )}
    </Card>
  );
};

export default GoalCard;
