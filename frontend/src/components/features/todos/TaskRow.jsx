import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Pencil } from 'lucide-react';
import { ANIMATION_VARIANTS } from '../../../constants';

/**
 * TaskRow component - Individual task item
 */
const TaskRow = ({ todo, onToggle, onEdit, isPast }) => {
  return (
    <motion.div 
      layout 
      {...ANIMATION_VARIANTS.fadeIn}
      className="mb-3"
    >
      <div 
        onClick={() => onToggle(todo)}
        className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
          todo.status 
            ? 'bg-gray-100/50 dark:bg-[#1E1F20] border-transparent opacity-60' 
            : 'bg-white dark:bg-[#1E1F20] border-gray-100 dark:border-[#444746] shadow-sm hover:shadow-md'
        }`}
      >
        <button 
          className={todo.status 
            ? 'text-[#A8C7FA]' 
            : 'text-gray-300 dark:text-gray-600 group-hover:text-[#A8C7FA]'
          }
        >
          {todo.status ? <CheckCircle2 size={24} /> : <Circle size={24} />}
        </button>
        
        <span 
          className={`text-lg font-medium flex-1 ${
            todo.status 
              ? 'line-through text-gray-400' 
              : 'text-gray-700 dark:text-[#E3E3E3]'
          }`}
        >
          {todo.title}
        </span>
        
        {!todo.status && !isPast && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(todo);
            }}
            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-[#00639B] hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg transition-all"
          >
            <Pencil size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default TaskRow;
