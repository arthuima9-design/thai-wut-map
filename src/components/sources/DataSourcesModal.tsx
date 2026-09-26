import React from 'react';
import { DATA_SOURCES } from '../../data/dataSourcesInfo';
import { Database, X, ExternalLink, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

interface DataSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataSourcesModal: React.FC<DataSourcesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                แหล่งข้อมูลและการเชื่อมต่อ API
              </h2>
              <p className="text-xs text-slate-500">
                ความโปร่งใสและสถานะการบูรณาการข้อมูลภัยธรรมชาติ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice badge */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong>นโยบายความโปร่งใส (Data Transparency Principle):</strong> เพื่อความปลอดภัยสูงสุดของประชาชน ระบบระบุสถานะของแต่ละแหล่งข้อมูลอย่างชัดเจน ในระยะ MVP นี้ ข้อมูลบนหน้าจอเป็น <strong>DEMO DATA</strong> เพื่อทดสอบสถาปัตยกรรม โดยเตรียมพร้อมสำหรับการเปิดใช้งาน API จริงในขั้นตอนต่อไป
          </div>
        </div>

        {/* Source Cards List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
          {DATA_SOURCES.map((source) => (
            <div
              key={source.code}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all flex flex-col gap-2 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-white text-sky-700 border border-slate-200 font-mono shadow-xs">
                    {source.code}
                  </span>
                  <h3 className="text-sm font-bold text-slate-800">{source.nameTh}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {source.isIntegrated ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      เชื่อมต่อแล้ว
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3 h-3" />
                      เตรียมเชื่อมต่อ API
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{source.description}</p>

              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 gap-2">
                <div className="flex items-center gap-4">
                  <span>
                    หมวดหมู่: <span className="text-slate-800 font-medium">{source.category}</span>
                  </span>
                  <span>
                    รอบอัปเดต: <span className="text-slate-800 font-medium">{source.updateFrequency}</span>
                  </span>
                </div>
                {source.officialUrl && (
                  <a
                    href={source.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 hover:underline font-medium"
                  >
                    <span>เว็บไซต์ทางการ</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            เข้าใจแล้ว ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
