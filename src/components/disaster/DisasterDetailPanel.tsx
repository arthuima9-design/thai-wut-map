import React from 'react';
import type { DisasterEvent } from '../../types/disaster';
import { DISASTER_TYPES_CONFIG, STATUS_LABELS } from '../../utils/formatters';
import { SeverityBadge } from '../common/SeverityBadge';
import { FreshnessBadge } from '../common/FreshnessBadge';
import { formatThaiDateTime } from '../../utils/freshness';
import {
  X,
  ExternalLink,
  MapPin,
  Clock,
  Building2,
  Users,
  ShieldCheck,
  AlertTriangle,
  Phone,
  Waves,
  CloudRain,
  Flame,
  Activity,
  Wind,
} from 'lucide-react';

interface DisasterDetailPanelProps {
  event: DisasterEvent | null;
  onClose: () => void;
  onOpenHotlines: () => void;
}

export const DisasterDetailPanel: React.FC<DisasterDetailPanelProps> = ({
  event,
  onClose,
  onOpenHotlines,
}) => {
  if (!event) return null;

  const typeConfig = DISASTER_TYPES_CONFIG[event.type] || DISASTER_TYPES_CONFIG.alert;
  const statusConfig = STATUS_LABELS[event.status] || STATUS_LABELS.active;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] md:w-[460px] bg-white/98 backdrop-blur-xl border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/80">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-xs flex-shrink-0">
            {typeConfig.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold text-sky-700">
                {typeConfig.labelTh}
              </span>
              <SeverityBadge level={event.severity} size="sm" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {event.title}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          title="ปิดหน้าต่าง"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
        {/* Location & Status Bar */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span className="font-semibold text-slate-900">พื้นที่:</span>
            <span>
              {event.subdistrict ? `ต.${event.subdistrict} ` : ''}
              อ.{event.district} จ.{event.province}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">สถานะ:</span>
              <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${statusConfig.colorClass}`}>
                {statusConfig.labelTh}
              </span>
            </div>
            <FreshnessBadge updatedAt={event.updatedAt} showDetails />
          </div>
        </div>

        {/* Disaster specific metric highlights */}
        {(event.depthCm !== undefined ||
          event.rainfallMm24h !== undefined ||
          event.magnitude !== undefined ||
          event.hotspotCount !== undefined ||
          event.windSpeedKmh !== undefined) && (
          <div className="grid grid-cols-2 gap-2.5">
            {event.depthCm !== undefined && (
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-sky-700 mb-1">
                  <Waves className="w-3.5 h-3.5" />
                  <span>ระดับน้ำท่วมขัง</span>
                </div>
                <div className="text-xl font-bold text-sky-900">
                  {Number(event.depthCm.toFixed(2))} <span className="text-xs font-normal text-sky-700">ซม.</span>
                </div>
              </div>
            )}

            {event.rainfallMm24h !== undefined && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-blue-700 mb-1">
                  <CloudRain className="w-3.5 h-3.5" />
                  <span>ฝนสะสม 24 ชม.</span>
                </div>
                <div className="text-xl font-bold text-blue-900">
                  {Number(event.rainfallMm24h.toFixed(2))} <span className="text-xs font-normal text-blue-700">มม.</span>
                </div>
              </div>
            )}

            {event.magnitude !== undefined && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-amber-700 mb-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>ขนาดความรุนแรง</span>
                </div>
                <div className="text-xl font-bold text-amber-900">
                  {Number(event.magnitude.toFixed(2))} <span className="text-xs font-normal text-amber-700">แมกนิจูด</span>
                </div>
                {event.depthKm !== undefined && (
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    ลึก {Number(event.depthKm.toFixed(2))} กม.
                  </div>
                )}
              </div>
            )}

            {event.hotspotCount !== undefined && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-rose-700 mb-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>จุดความร้อน Hotspot</span>
                </div>
                <div className="text-xl font-bold text-rose-900">
                  {event.hotspotCount} <span className="text-xs font-normal text-rose-700">จุด</span>
                </div>
              </div>
            )}

            {event.windSpeedKmh !== undefined && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-teal-700 mb-1">
                  <Wind className="w-3.5 h-3.5" />
                  <span>ความเร็วลมสูงสุด</span>
                </div>
                <div className="text-xl font-bold text-teal-900">
                  {Number(event.windSpeedKmh.toFixed(2))} <span className="text-xs font-normal text-teal-700">กม./ชม.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Description */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            รายละเอียดสถานการณ์
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {event.description}
          </p>
        </div>

        {/* Affected summary if available */}
        {(event.affectedHouseholds || event.affectedPeople) && (
          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <Users className="w-4 h-4 text-sky-600 flex-shrink-0" />
            <div>
              <span className="text-slate-500">ผู้ได้รับผลกระทบเบื้องต้น: </span>
              <span className="font-semibold text-slate-900">
                {event.affectedPeople ? `${event.affectedPeople.toLocaleString()} คน ` : ''}
                {event.affectedHouseholds ? `(${event.affectedHouseholds.toLocaleString()} ครัวเรือน)` : ''}
              </span>
            </div>
          </div>
        )}

        {/* Emergency Guidelines (คำแนะนำการปฏิบัติตน) */}
        {event.guidelines && event.guidelines.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>ข้อปฏิบัติเพื่อความปลอดภัย</span>
            </h3>
            <ul className="space-y-2 text-xs">
              {event.guidelines.map((tip, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Data Source & Timestamp - MANDATORY REQUIREMENT */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              <span>แหล่งข้อมูล:</span>
            </span>
            <span className="font-semibold text-slate-800">{event.source}</span>
          </div>

          <div className="flex items-center justify-between text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>เวลาที่อัปเดต:</span>
            </span>
            <span className="text-slate-700 font-mono text-[11px]">
              {formatThaiDateTime(event.updatedAt)}
            </span>
          </div>

          {event.sourceUrl && (
            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-700 hover:underline font-medium"
              >
                <span>ตรวจสอบข้อมูลต้นทาง</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center gap-3">
        <button
          onClick={onOpenHotlines}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all active:scale-95"
        >
          <Phone className="w-4 h-4" />
          <span>ขอความช่วยเหลือฉุกเฉิน 1784</span>
        </button>

        <button
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors"
        >
          ปิด
        </button>
      </div>
    </div>
  );
};
