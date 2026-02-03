import React from 'react';
import GoalCard from './GoalCard';
import EmptyState from '../../common/EmptyState';
import { Trophy } from 'lucide-react';

/**
 * GoalsList component - Grid layout for displaying goals
 */
const GoalsList = ({ goals, onEdit, onComplete, onDelete, emptyMessage }) => {
  if (goals.length === 0) {
    return (
      <div className="col-span-full text-center py-12 text-gray-400">
        {emptyMessage || 'No goals found.'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map(goal => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onEdit={() => onEdit(goal)}
          onComplete={goal.is_completed ? undefined : () => onComplete(goal.id)}
          onDelete={() => onDelete(goal.id)}
        />
      ))}
    </div>
  );
};

export default GoalsList;
