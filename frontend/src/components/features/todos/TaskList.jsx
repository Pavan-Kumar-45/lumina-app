import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import TaskRow from './TaskRow';
import EmptyState from '../../common/EmptyState';

/**
 * TaskList component - List of tasks with sections
 */
const TaskList = ({ todos, isPast, onToggle, onEdit }) => {
  const [showCompleted, setShowCompleted] = useState(true);

  const pendingTodos = todos.filter(t => !t.status);
  const completedTodos = todos.filter(t => t.status);

  return (
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
      {/* Pending Tasks Section */}
      <section>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">
          Pending — {pendingTodos.length}
        </h2>
        <AnimatePresence mode="popLayout">
          {pendingTodos.map(todo => (
            <TaskRow 
              key={todo.id} 
              todo={todo} 
              onToggle={onToggle}
              onEdit={onEdit}
              isPast={isPast}
            />
          ))}
        </AnimatePresence>
        {pendingTodos.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-[#5E5E5E]">
            No pending tasks.
          </div>
        )}
      </section>

      {/* Completed Tasks Section */}
      {completedTodos.length > 0 && (
        <section>
          <button 
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-4"
          >
            {showCompleted ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            Completed — {completedTodos.length}
          </button>
          <AnimatePresence>
            {showCompleted && (
              <motion.div 
                initial={{ height: 0 }} 
                animate={{ height: 'auto' }} 
                exit={{ height: 0 }} 
                className="overflow-hidden"
              >
                {completedTodos.map(todo => (
                  <TaskRow 
                    key={todo.id} 
                    todo={todo} 
                    onToggle={onToggle}
                    onEdit={onEdit}
                    isPast={isPast}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}
    </div>
  );
};

export default TaskList;
