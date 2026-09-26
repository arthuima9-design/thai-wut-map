import React from 'react';
import type { SeverityLevel } from '../../types/disaster';
import { SEVERITY_CONFIG } from '../../utils/formatters';

interface SeverityBadgeProps {
  level: SeverityLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const config = SEVERITY_CONFIG[level] || SEVERITY_CONFIG.normal;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && <span>{config.emoji}</span>}
      <span>{config.labelTh}</span>
    </span>
  );
};
