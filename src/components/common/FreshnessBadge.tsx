import React from 'react';
import { getFreshnessInfo } from '../../utils/freshness';
import { Clock } from 'lucide-react';

interface FreshnessBadgeProps {
  updatedAt: string;
  showDetails?: boolean;
  className?: string;
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({
  updatedAt,
  showDetails = false,
  className = '',
}) => {
  const info = getFreshnessInfo(updatedAt);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${info.badgeClass} ${className}`}
      title={info.description}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${info.dotColor} ${info.category === 'fresh' ? 'animate-pulse' : ''}`} />
      <Clock className="w-3 h-3 opacity-70" />
      <span>{info.badgeText}</span>
      {showDetails && (
        <span className="opacity-70 text-[10px]">
          ({info.minutesAgo < 60 ? `${info.minutesAgo} นาที` : `${Math.floor(info.minutesAgo / 60)} ชม.`})
        </span>
      )}
    </div>
  );
};
