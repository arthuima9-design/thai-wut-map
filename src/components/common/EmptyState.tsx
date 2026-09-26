import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  onResetFilter?: () => void;
  areaName?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle = 'ข้อมูลอาจเปลี่ยนแปลงได้ กรุณาตรวจสอบอีกครั้ง',
  onResetFilter,
  areaName,
}) => {
  const displayTitle = title || (areaName 
    ? `🟢 ไม่พบเหตุการณ์ภัยพิบัติในพื้นที่ ${areaName}`
    : '🟢 ไม่พบเหตุการณ์ภัยพิบัติในพื้นที่นี้');

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-sm my-4">
      <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
        <ShieldCheck className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-emerald-800 mb-1">{displayTitle}</h3>
      <p className="text-xs text-slate-500 flex items-center gap-1.5 justify-center mt-1">
        <Info className="w-3.5 h-3.5 text-slate-400" />
        <span>{subtitle}</span>
      </p>
      {onResetFilter && (
        <button
          onClick={onResetFilter}
          className="mt-4 text-xs font-semibold text-sky-600 hover:text-sky-700 underline underline-offset-4"
        >
          ล้างตัวกรองและแสดงทั้งหมด
        </button>
      )}
    </div>
  );
};
