import React from 'react';
import { AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  lastCachedTime?: string;
  onRetry: () => void;
  onResetSimulation?: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'ไม่สามารถโหลดข้อมูลล่าสุดได้',
  lastCachedTime = '08:30 น.',
  onRetry,
  onResetSimulation,
  isRetrying = false,
}) => {
  const isSimulated = message.includes('Simulated Error');

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border border-rose-200 rounded-2xl text-center max-w-md mx-auto my-6 shadow-sm">
      <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-4 animate-bounce border border-rose-200">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-rose-900 mb-1 leading-snug">
        {message}
      </h3>

      <p className="text-xs sm:text-sm text-slate-600 mb-3 leading-relaxed">
        {isSimulated
          ? 'หน้านี้กำลังแสดงผลการทดสอบ Error UI State ตามข้อกำหนด Requirement #25'
          : 'การเชื่อมต่อไปยังผู้ให้บริการข้อมูลขัดข้องชั่วคราว'}
      </p>

      {lastCachedTime && (
        <div className="text-xs bg-amber-50 px-3 py-1.5 rounded-lg text-amber-900 border border-amber-200 mb-5">
          ข้อมูลล่าสุดที่มี: <span className="font-semibold text-slate-900">{lastCachedTime}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full justify-center">
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>ลองใหม่อีกครั้ง</span>
        </button>

        {isSimulated && onResetSimulation && (
          <button
            onClick={onResetSimulation}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-emerald-700 text-xs sm:text-sm font-semibold rounded-xl border border-emerald-300 shadow-xs transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>กลับสู่โหมดข้อมูลปกติ</span>
          </button>
        )}
      </div>
    </div>
  );
};
