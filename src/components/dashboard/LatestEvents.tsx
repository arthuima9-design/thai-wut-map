import React from 'react';
import type { DisasterEvent } from '../../types/disaster';
import { DISASTER_TYPES_CONFIG } from '../../utils/formatters';
import { SeverityBadge } from '../common/SeverityBadge';
import { formatThaiTime } from '../../utils/freshness';
import { ChevronRight, Activity, MapPin } from 'lucide-react';

interface LatestEventsProps {
  events: DisasterEvent[];
  selectedEventId: string | null;
  onSelectEvent: (event: DisasterEvent) => void;
  isLoading?: boolean;
}

export const LatestEvents: React.FC<LatestEventsProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  isLoading = false,
}) => {
  // Sort from newest to oldest
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-sky-600" />
            <span>เหตุการณ์ล่าสุด</span>
          </h2>
        </div>
        <span className="text-xs text-slate-500">
          พบทั้งหมด <span className="font-semibold text-slate-900">{sortedEvents.length}</span> รายการ
        </span>
      </div>

      {/* Events List */}
      <div className="space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
        {isLoading ? (
          <div className="space-y-3 p-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            ไม่มีเหตุการณ์ที่ตรงกับตัวกรองในขณะนี้
          </div>
        ) : (
          sortedEvents.map((evt) => {
            const isSelected = evt.id === selectedEventId;
            const typeConfig = DISASTER_TYPES_CONFIG[evt.type] || DISASTER_TYPES_CONFIG.alert;

            return (
              <button
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-3 group ${
                  isSelected
                    ? 'bg-sky-50/80 border-sky-400 shadow-sm ring-1 ring-sky-500/20'
                    : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Time Badge */}
                  <div className="flex flex-col items-center justify-center bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-center flex-shrink-0 shadow-xs">
                    <span className="text-[11px] font-mono font-bold text-slate-700">
                      {formatThaiTime(evt.updatedAt) || '08:30'}
                    </span>
                    <span className="text-lg mt-0.5">{typeConfig.emoji}</span>
                  </div>

                  {/* Event Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                        {typeConfig.labelTh.split('/')[0]}
                      </span>
                      <SeverityBadge level={evt.severity} size="sm" showIcon={false} />
                    </div>

                    <p className="text-xs text-slate-700 font-medium truncate mt-0.5">
                      {evt.title}
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                        <span>{evt.province} (อ.{evt.district})</span>
                      </span>
                      <span>•</span>
                      <span className="truncate">{evt.sourceCode}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 flex-shrink-0 self-center transition-colors" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
