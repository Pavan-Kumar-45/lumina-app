import React from 'react';
import { STATUS_COLORS } from '../../constants';

/**
 * StatusBadge component - Reusable status indicator
 */
const StatusBadge = ({ status, label, icon: Icon, className = '' }) => {
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS.pending;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {Icon && <Icon size={12} />}
      {label}
    </div>
  );
};

export default StatusBadge;
