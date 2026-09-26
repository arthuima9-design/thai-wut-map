import React from 'react';
import { THAILAND_PROVINCES } from '../../data/thailandProvinces';
import type { ProvinceRiskSummary, DisasterEvent } from '../../types/disaster';
import { SeverityBadge } from '../common/SeverityBadge';
import { SEVERITY_CONFIG } from '../../utils/formatters';
import { MapPin, ChevronDown, CloudRain, Waves, Flame, Activity, Mountain } from 'lucide-react';

interface ProvinceMonitorProps {
  selectedProvinceName: string;
  provinceRisk: ProvinceRiskSummary | null;
  onSelectProvince: (provinceName: string) => void;
  onSelectEvent: (event: DisasterEvent) => void;
  onFocusMap: (center: [number, number], zoom: number) => void;
}

export const ProvinceMonitor: React.FC<ProvinceMonitorProps> = ({
  selectedProvinceName,
  provinceRisk,
  onSelectProvince,
  onSelectEvent,
  onFocusMap,
}) => {
  const currentProvinceInfo = THAILAND_PROVINCES.find(
    (p) => p.nameTh === selectedProvinceName
  );

  const handleProvinceChange = (nameTh: string) => {
    onSelectProvince(nameTh);
    const p = THAILAND_PROVINCES.find((prov) => prov.nameTh === nameTh);
    if (p) {
      onFocusMap(p.center, 9);
    }
  };

  const threatItems = [
    {
      label: 'ฝนสะสม / ฝนตกหนัก',
      icon: <CloudRain className="w-4 h-4 text-blue-400" />,
      emoji: '🌧️',
      severity: provinceRisk?.breakdown?.rain || 'normal',
    },
    {
      label: 'น้ำท่วม / น้ำหลาก',
      icon: <Waves className="w-4 h-4 text-sky-400" />,
      emoji: '🌊',
      severity: provinceRisk?.breakdown?.flood || 'normal',
    },
    {
      label: 'แผ่นดินไหว',
      icon: <Activity className="w-4 h-4 text-amber-400" />,
      emoji: '🌍',
      severity: provinceRisk?.breakdown?.earthquake || 'normal',
    },
    {
      label: 'ไฟป่า / จุดความร้อน',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      emoji: '🔥',
      severity: provinceRisk?.breakdown?.wildfire || 'normal',
    },
    {
      label: 'ดินโคลนถล่ม',
      icon: <Mountain className="w-4 h-4 text-orange-400" />,
      emoji: '🟠',
      severity: provinceRisk?.breakdown?.landslide || 'normal',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
      {/* Title & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>ติดตามสถานการณ์รายจังหวัด</span>
          </h2>
          <p className="text-xs text-slate-500">
            ตรวจสถานะความเสี่ยงและภัยธรรมชาติในแต่ละพื้นที่
          </p>
        </div>

        {/* Province Selector Dropdown */}
        <div className="relative min-w-[200px]">
          <select
            value={selectedProvinceName}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer appearance-none pr-8"
          >
            {THAILAND_PROVINCES.map((prov) => (
              <option key={prov.code} value={prov.nameTh}>
                {prov.nameTh} ({prov.nameEn})
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Main Risk Summary Card */}
      <div className="bg-gradient-to-r from-sky-50 to-indigo-50/50 rounded-xl p-4 border border-sky-100 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white border border-sky-100 flex items-center justify-center text-xl shadow-xs">
            📍
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">สถานะความเสี่ยงโดยรวม</div>
            <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{selectedProvinceName}</span>
              <span className="text-xs font-normal text-slate-500">
                ({currentProvinceInfo?.nameEn})
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {provinceRisk && (
            <SeverityBadge level={provinceRisk.overallRisk} size="lg" />
          )}
        </div>
      </div>

      {/* Threats Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-4">
        {threatItems.map((item, idx) => {
          const cfg = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.normal;
          return (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between hover:bg-slate-100/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-lg">{item.emoji}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cfg.hexColor }}
                />
              </div>
              <div className="text-[11px] text-slate-600 font-medium truncate mb-1">
                {item.label}
              </div>
              <div
                className="text-xs font-bold inline-flex items-center gap-1"
                style={{ color: cfg.hexColor }}
              >
                <span>{cfg.emoji}</span>
                <span>{cfg.labelTh}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Events in this province */}
      {provinceRisk && provinceRisk.keyEvents.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-700 mb-2">
            เหตุการณ์ภัยพิบัติที่กำลังดำเนินการในจังหวัดนี้ ({provinceRisk.keyEvents.length} จุด):
          </div>
          <div className="space-y-1.5">
            {provinceRisk.keyEvents.map((evt) => (
              <button
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="w-full text-left p-2.5 rounded-lg bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-xs flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-slate-900">อ.{evt.district}:</span>
                  <span className="text-slate-600 truncate">{evt.title}</span>
                </div>
                <SeverityBadge level={evt.severity} size="sm" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Demo Status disclaimer badge */}
      <div className="mt-3 pt-2 text-right">
        <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
          DEMO STATUS — ข้อมูลประเมินสถานะจำลองตามเกณฑ์ Data Layer
        </span>
      </div>
    </div>
  );
};
