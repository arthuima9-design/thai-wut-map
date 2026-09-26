import React from 'react';
import { Phone, Database, RefreshCw, Flame, Megaphone } from 'lucide-react';

interface HeaderProps {
  lastUpdatedTime: string;
  isRefreshing?: boolean;
  onRefresh: () => void;
  onOpenHotlines: () => void;
  onOpenSources: () => void;
  onOpenReportFlood?: () => void;
  activeDisasterCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  lastUpdatedTime,
  isRefreshing = false,
  onRefresh,
  onOpenHotlines,
  onOpenSources,
  onOpenReportFlood,
  activeDisasterCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 lg:px-8 py-2.5 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-md shadow-sky-500/20 border border-sky-400 p-1.5 flex-shrink-0">
            <img src="/logo.svg" alt="Thai Wut Map Logo" className="w-full h-full object-contain" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                Thai Wut Map
              </h1>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                v1.0 MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden xs:block">
              ระบบติดตามสถานการณ์ภัยธรรมชาติประเทศไทย
            </p>
          </div>
        </div>

        {/* Center: System Status & Time */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-700 font-semibold">ระบบข้อมูลออนไลน์</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="text-slate-600">
            อัปเดตล่าสุด <span className="font-semibold text-slate-900">{lastUpdatedTime}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="text-amber-700 font-medium flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>กำลังติดตาม {activeDisasterCount} เหตุการณ์</span>
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-200/60 transition-colors"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Refresh (Mobile) */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="lg:hidden p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
          </button>

          {/* Sources button */}
          <button
            onClick={onOpenSources}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 shadow-sm transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-sky-600" />
            <span>แหล่งข้อมูล</span>
          </button>

          {/* Crowdsourced Report Flood Button */}
          {onOpenReportFlood && (
            <button
              onClick={onOpenReportFlood}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all active:scale-95"
              title="ปักหมุดแจ้งเหตุน้ำท่วมในพื้นที่ของคุณ"
            >
              <Megaphone className="w-3.5 h-3.5 animate-pulse" />
              <span>แจ้งน้ำท่วม</span>
            </button>
          )}

          {/* Emergency Hotline Button */}
          <button
            onClick={onOpenHotlines}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all active:scale-95"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">สายด่วน 1784</span>
            <span className="xs:hidden">1784</span>
          </button>
        </div>
      </div>
    </header>
  );
};
