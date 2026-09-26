import React, { useState } from 'react';
import type { ApiMode } from '../../services/api/realDisasterApi';
import { Database, ChevronRight, X, Radio } from 'lucide-react';

interface DemoBannerProps {
  apiMode: ApiMode;
  onChangeApiMode: (mode: ApiMode) => void;
  onOpenDataSources: () => void;
  onSimulateErrorToggle?: (simulate: boolean) => void;
  isSimulatingError?: boolean;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  apiMode,
  onChangeApiMode,
  onOpenDataSources,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      className={`border-b px-3 py-2 text-xs transition-colors backdrop-blur-md ${
        apiMode === 'live'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : apiMode === 'hybrid'
          ? 'bg-sky-50 border-sky-200 text-sky-900'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Status Text */}
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase shadow-sm ${
              apiMode === 'live'
                ? 'bg-emerald-600 text-white'
                : apiMode === 'hybrid'
                ? 'bg-sky-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            {apiMode === 'live' ? 'LIVE REAL API' : apiMode === 'hybrid' ? 'HYBRID API' : 'DEMO MODE'}
          </span>

          <span className="font-semibold text-slate-800">
            {apiMode === 'live' && '🟢 เชื่อมต่อ API จริงสด 100% (USGS Earthquake & Open-Meteo Weather)'}
            {apiMode === 'hybrid' && '🔄 โหมดไฮบริด: ดึงแผ่นดินไหว & สภาพอากาศจริงจากดาวเทียม + ข้อมูลจำลองน้ำท่วม'}
            {apiMode === 'demo' && '🟡 โหมดทดสอบ: แสดงข้อมูลจำลอง (Demo Data) ครบทุกมิติ'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher Buttons */}
          <div className="bg-white rounded-lg p-0.5 border border-slate-200 flex items-center text-[11px] shadow-sm">
            <button
              onClick={() => onChangeApiMode('hybrid')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                apiMode === 'hybrid'
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="ดึงข้อมูลสดจริงจาก USGS และ Open-Meteo ผสานกับข้อมูลจำลอง"
            >
              ไฮบริด (แนะนำ)
            </button>

            <button
              onClick={() => onChangeApiMode('live')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                apiMode === 'live'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="ดึงเฉพาะข้อมูลจริงที่เกิดขึ้นขณะนี้จาก API ภายนอก 100%"
            >
              เฉพาะข้อมูลจริง
            </button>

            <button
              onClick={() => onChangeApiMode('demo')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                apiMode === 'demo'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="ข้อมูลจำลองเพื่อการสาธิต"
            >
              ข้อมูลจำลอง
            </button>
          </div>

          <button
            onClick={onOpenDataSources}
            className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:text-sky-900 hover:underline cursor-pointer ml-1"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">สถานะ API</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"
            title="ซ่อนข้อความเตือน"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
