import React, { useState } from 'react';
import {
  Waves,
  CloudRain,
  Cloud,
  Building,
  Layers,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Check,
} from 'lucide-react';
import type { RadarFrame } from '../../services/api/adapters/rainViewerAdapter';

export interface MapOverlaySettings {
  showRivers: boolean;
  showDams: boolean;
  showRainRadar: boolean;
  showClouds: boolean;
  radarOpacity: number; // 0.2 to 1.0
}

interface MapOverlayControlProps {
  settings: MapOverlaySettings;
  onChangeSettings: (settings: MapOverlaySettings) => void;
  radarFrames: RadarFrame[];
  currentFrameIndex: number;
  onSelectFrameIndex: (index: number) => void;
  isPlayingRadar: boolean;
  onTogglePlayRadar: () => void;
  className?: string;
}

export const MapOverlayControl: React.FC<MapOverlayControlProps> = ({
  settings,
  onChangeSettings,
  radarFrames,
  currentFrameIndex,
  onSelectFrameIndex,
  isPlayingRadar,
  onTogglePlayRadar,
  className = '',
}) => {
  // Default to collapsed pill on initial render so it doesn't block map or collide with other controls
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<'flood' | 'storm' | 'all' | 'clean' | 'custom'>('custom');

  // Helper toggle
  const toggleKey = (key: keyof Omit<MapOverlaySettings, 'radarOpacity'>) => {
    setActivePreset('custom');
    onChangeSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  // Presets
  const applyPreset = (preset: 'flood' | 'storm' | 'all' | 'clean') => {
    setActivePreset(preset);
    if (preset === 'flood') {
      onChangeSettings({
        ...settings,
        showRivers: true,
        showDams: true,
        showRainRadar: true,
        showClouds: false,
      });
    } else if (preset === 'storm') {
      onChangeSettings({
        ...settings,
        showRivers: false,
        showDams: false,
        showRainRadar: true,
        showClouds: true,
      });
    } else if (preset === 'all') {
      onChangeSettings({
        ...settings,
        showRivers: true,
        showDams: true,
        showRainRadar: true,
        showClouds: true,
      });
    } else if (preset === 'clean') {
      onChangeSettings({
        ...settings,
        showRivers: false,
        showDams: false,
        showRainRadar: false,
        showClouds: false,
      });
    }
  };

  const currentFrame = radarFrames[currentFrameIndex];
  const isLatestFrame = currentFrameIndex === radarFrames.length - 1;

  // Active layer counter
  const activeCount = [
    settings.showRivers,
    settings.showDams,
    settings.showRainRadar,
    settings.showClouds,
  ].filter(Boolean).length;

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Pill Badge (Light Theme) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white/95 hover:bg-white backdrop-blur-md rounded-xl border border-slate-200 shadow-md px-2.5 py-1.5 flex items-center justify-between gap-1.5 sm:gap-2 cursor-pointer transition-all duration-150 text-slate-800 select-none active:scale-98"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-md bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center flex-shrink-0">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 whitespace-nowrap">
              <span className="hidden sm:inline">เรดาร์ & แหล่งน้ำ</span>
              <span className="sm:hidden">เรดาร์</span>
              {activeCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-600 text-white leading-tight">
                  {activeCount}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center text-slate-400">
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Floating Dropdown Card (Light Theme) */}
      {isExpanded && (
        <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-3 space-y-3 z-50 text-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Quick Presets */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>โหมดดูด่วน (Quick Presets)</span>
            </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => applyPreset('flood')}
                  className={`px-2 py-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all ${
                    activePreset === 'flood'
                      ? 'bg-sky-50 border-sky-400 text-sky-700 font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>🌊</span>
                  <span className="truncate">โหมดน้ำท่วม</span>
                </button>

                <button
                  onClick={() => applyPreset('storm')}
                  className={`px-2 py-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all ${
                    activePreset === 'storm'
                      ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>🌧️</span>
                  <span className="truncate">โหมดพายุฝน</span>
                </button>

                <button
                  onClick={() => applyPreset('all')}
                  className={`px-2 py-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all ${
                    activePreset === 'all'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>👁️</span>
                  <span className="truncate">แสดงทั้งหมด</span>
                </button>

                <button
                  onClick={() => applyPreset('clean')}
                  className={`px-2 py-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all ${
                    activePreset === 'clean'
                      ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>🧹</span>
                  <span className="truncate">โหมดคลีน</span>
                </button>
              </div>
            </div>

            {/* Individual Layer Toggles */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                สวิตช์เปิด-ปิดชั้นข้อมูล
              </div>

              {/* 1. Rivers */}
              <button
                onClick={() => toggleKey('showRivers')}
                className={`w-full px-2.5 py-1.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                  settings.showRivers
                    ? 'bg-sky-50/80 border-sky-300 text-sky-800 font-semibold'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Waves className="w-3.5 h-3.5 text-sky-600" />
                  <span>เส้นทางน้ำหลัก & ลุ่มน้ำ</span>
                </div>
                {settings.showRivers ? (
                  <Check className="w-3.5 h-3.5 text-sky-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </button>

              {/* 2. Dams */}
              <button
                onClick={() => toggleKey('showDams')}
                className={`w-full px-2.5 py-1.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                  settings.showDams
                    ? 'bg-indigo-50/80 border-indigo-300 text-indigo-800 font-semibold'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-indigo-600" />
                  <span>เขื่อนหลัก & ประตูระบายน้ำ</span>
                </div>
                {settings.showDams ? (
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </button>

              {/* 3. Rain Radar */}
              <button
                onClick={() => toggleKey('showRainRadar')}
                className={`w-full px-2.5 py-1.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                  settings.showRainRadar
                    ? 'bg-blue-50/80 border-blue-300 text-blue-800 font-semibold'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                  <span>เรดาร์ตรวจวัดกลุ่มฝนสด</span>
                </div>
                {settings.showRainRadar ? (
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </button>

              {/* 4. Satellite Clouds */}
              <button
                onClick={() => toggleKey('showClouds')}
                className={`w-full px-2.5 py-1.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                  settings.showClouds
                    ? 'bg-slate-100 border-slate-300 text-slate-800 font-semibold'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Cloud className="w-3.5 h-3.5 text-slate-600" />
                  <span>ภาพดาวเทียมกลุ่มเมฆ</span>
                </div>
                {settings.showClouds ? (
                  <Check className="w-3.5 h-3.5 text-slate-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </button>
            </div>

            {/* Radar Animation & Opacity Controls (if radar or clouds enabled) */}
            {(settings.showRainRadar || settings.showClouds) && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                {/* Opacity Slider */}
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-sky-600" />
                    <span>ความเข้มเรดาร์:</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-700">
                    {Math.round(settings.radarOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={settings.radarOpacity}
                  onChange={(e) =>
                    onChangeSettings({
                      ...settings,
                      radarOpacity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />

                {/* Radar Playback Timeline */}
                {settings.showRainRadar && radarFrames.length > 0 && (
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">เวลาตรวจวัด:</span>
                      <span className="font-mono font-bold text-sky-700">
                        {currentFrame?.formattedTime || 'เวลาสด'}
                        {isLatestFrame && (
                          <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-700 border border-emerald-300">
                            สด
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={onTogglePlayRadar}
                        className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors"
                        title={isPlayingRadar ? 'หยุดชั่วคราว' : 'เล่นแอนิเมชันกลุ่มฝน'}
                      >
                        {isPlayingRadar ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Timeline Slider */}
                      <input
                        type="range"
                        min="0"
                        max={radarFrames.length - 1}
                        value={currentFrameIndex}
                        onChange={(e) => onSelectFrameIndex(parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />

                      <button
                        onClick={() => onSelectFrameIndex(radarFrames.length - 1)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        title="กระโดดไปเวลาล่าสุด"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
    </div>
  );
};
