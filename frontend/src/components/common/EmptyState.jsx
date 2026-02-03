import React from 'react';

/**
 * EmptyState component - Reusable empty state placeholder
 */
const EmptyState = ({ 
  icon: Icon, 
  message, 
  description,
  action,
  actionLabel 
}) => {
  return (
    <div className="col-span-full py-24 text-center">
      <div className="max-w-sm mx-auto">
        {Icon && (
          <div className="inline-flex p-4 rounded-2xl bg-gray-100 dark:bg-[#1E1F20] text-gray-400 dark:text-[#5E5E5E] mb-4">
            <Icon size={40} className="opacity-30" />
          </div>
        )}
        <p className="text-lg font-medium text-gray-500 dark:text-[#C4C7C5] mb-2">
          {message}
        </p>
        {description && (
          <p className="text-sm text-gray-400 dark:text-[#5E5E5E] mb-6">
            {description}
          </p>
        )}
        {action && actionLabel && (
          <button
            onClick={action}
            className="px-6 py-2 bg-[#A8C7FA] text-[#003355] rounded-xl font-medium hover:bg-[#95B8E8] transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
