import React from 'react';
import type { DisasterType } from '../../types/disaster';
import { DISASTER_TYPES_CONFIG } from '../../utils/formatters';
import { Layers, CheckSquare, Square } from 'lucide-react';

interface MapLayerFilterProps {
  activeLayers: DisasterType[];
  onToggleLayer: (type: DisasterType) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  className?: string;
}

export const MapLayerFilter: React.FC<MapLayerFilterProps> = ({
  activeLayers,
  onToggleLayer,
  onSelectAll,
  onClearAll,
  className = '',
}) => {
  const displayTypes: DisasterType[] = [
    'flood',
    'heavy_rain',
    'storm',
    'earthquake',
    'landslide',
    'wildfire',
    'alert',
  ];

  return (
    <div className={`bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3.5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">ชั้นข้อมูลภัยพิบัติ</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <button
            onClick={onSelectAll}
            className="text-sky-600 hover:text-sky-700 font-semibold"
          >
            เลือกทั้งหมด
          </button>
          <span className="text-slate-300">/</span>
          <button
            onClick={onClearAll}
            className="text-slate-500 hover:text-slate-700"
          >
            ล้าง
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5">
        {displayTypes.map((type) => {
          const cfg = DISASTER_TYPES_CONFIG[type];
          const isActive = activeLayers.includes(type);

          return (
            <button
              key={type}
              onClick={() => onToggleLayer(type)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left ${
                isActive
                  ? 'bg-sky-50 text-sky-950 border border-sky-200 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm">{cfg.emoji}</span>
                <span className="truncate">{cfg.labelTh.split('/')[0]}</span>
              </div>
              <span className="flex-shrink-0 ml-1.5">
                {isActive ? (
                  <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-300" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
