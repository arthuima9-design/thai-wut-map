import React from 'react';
import type { SituationMetric, DisasterType } from '../../types/disaster';
import { SEVERITY_CONFIG } from '../../utils/formatters';

interface SituationSummaryProps {
  metrics: SituationMetric[];
  activeLayers: DisasterType[];
  onSelectType: (type: DisasterType) => void;
  isLoading?: boolean;
}

export const SituationSummary: React.FC<SituationSummaryProps> = ({
  metrics,
  activeLayers,
  onSelectType,
  isLoading = false,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-2">
      {metrics.map((metric) => {
        const isSelected = activeLayers.length === 1 && activeLayers.includes(metric.type);
        const sevConfig = SEVERITY_CONFIG[metric.severity] || SEVERITY_CONFIG.normal;

        return (
          <button
            key={metric.type}
            onClick={() => onSelectType(metric.type)}
            className={`relative overflow-hidden rounded-2xl p-3.5 sm:p-4 border transition-all text-left group shadow-xs ${
              isSelected
                ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20 shadow-sm'
                : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Subtle gradient backdrop */}
            <div
              className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
              style={{ backgroundColor: sevConfig.hexColor }}
            />

            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl sm:text-3xl">{metric.icon}</span>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: sevConfig.hexColor }}
                title={`สถานะ: ${sevConfig.labelTh}`}
              />
            </div>

            <div className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
              {metric.label}
            </div>

            <div className="flex items-baseline gap-1.5 mt-1">
              {isLoading ? (
                <span className="h-7 w-12 bg-slate-200 animate-pulse rounded"></span>
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {metric.count}
                </span>
              )}
              <span className="text-xs text-slate-500">{metric.unit}</span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
              <span>คลิกเพื่อกรอง</span>
              <span className="font-semibold" style={{ color: sevConfig.hexColor }}>
                {sevConfig.emoji} {sevConfig.labelTh}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
