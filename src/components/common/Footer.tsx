import React from 'react';
import { AlertTriangle, Phone } from 'lucide-react';

interface FooterProps {
  onOpenHotlines: () => void;
  onOpenSources: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenHotlines, onOpenSources }) => {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white text-slate-600 py-8 px-4 lg:px-8 text-xs">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* MANDATORY REQUIREMENT #21: EMERGENCY DISCLAIMER */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold text-amber-900">ข้อควรทราบกรณีฉุกเฉิน (Emergency Disclaimer): </span>
            ข้อมูลนี้จัดทำเพื่อการติดตามสถานการณ์และประกอบการตัดสินใจเบื้องต้น ไม่ควรใช้แทนประกาศเตือนภัยอย่างเป็นทางการ กรุณาตรวจสอบข้อมูลจากหน่วยงานราชการที่เกี่ยวข้องในกรณีฉุกเฉิน
          </div>
        </div>

        {/* Links and Agency attribution */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Thai Wut Map" className="w-6 h-6 object-contain" />
            <span className="font-bold text-slate-900">Thai Wut Map</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">เพื่อความปลอดภัยของประชาชนไทย</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-600">
            <button
              onClick={onOpenSources}
              className="hover:text-slate-900 hover:underline transition-colors"
            >
              แหล่งข้อมูลและ API
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={onOpenHotlines}
              className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>สายด่วน 1784</span>
            </button>
            <span className="text-slate-300">•</span>
            <a
              href="https://www.disaster.go.th"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 hover:underline"
            >
              ปภ. มหาดไทย
            </a>
            <span className="text-slate-300">•</span>
            <a
              href="https://www.tmd.go.th"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 hover:underline"
            >
              กรมอุตุนิยมวิทยา
            </a>
          </div>
        </div>

        {/* Copyright & Timestamp */}
        <div className="border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} Thai Wut Map (Open Disaster Project). พัฒนาเพื่อการเข้าถึงข้อมูลภัยพิบัติที่รวดเร็วและเข้าใจง่าย
        </div>
      </div>
    </footer>
  );
};
