import React from 'react';
import type { DisasterType, DisasterEvent } from '../../types/disaster';
import { DISASTER_TYPES_CONFIG } from '../../utils/formatters';
import { SeverityBadge } from '../common/SeverityBadge';
import { formatThaiDateTime } from '../../utils/freshness';
import {
  MapPin,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

interface DisasterTypeViewProps {
  type: DisasterType;
  events: DisasterEvent[];
  onBack: () => void;
  onSelectEvent: (event: DisasterEvent) => void;
  onFocusMap: (center: [number, number], zoom: number) => void;
}

export const DisasterTypeView: React.FC<DisasterTypeViewProps> = ({
  type,
  events,
  onBack,
  onSelectEvent,
  onFocusMap,
}) => {
  const typeConfig = DISASTER_TYPES_CONFIG[type] || DISASTER_TYPES_CONFIG.alert;
  const typeEvents = events.filter((e) => e.type === type);

  // Group affected provinces
  const affectedProvinces = Array.from(new Set(typeEvents.map((e) => e.province)));
  const totalAffectedPeople = typeEvents.reduce((acc, curr) => acc + (curr.affectedPeople || 0), 0);
  const totalHouseholds = typeEvents.reduce((acc, curr) => acc + (curr.affectedHouseholds || 0), 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-sky-600" />
          <span>กลับหน้า Dashboard หลัก</span>
        </button>

        <span className="text-xs text-slate-500">
          หมวดหมู่ภัยพิบัติ: <span className="font-semibold text-slate-900">{typeConfig.labelTh}</span>
        </span>
      </div>

      {/* Banner Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-3xl shadow-xs">
              {typeConfig.emoji}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>{typeConfig.labelTh}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                {typeConfig.descriptionTh}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-center">
            <div>
              <div className="text-[10px] text-slate-500">พื้นที่เกิดเหตุ</div>
              <div className="text-xl font-bold text-slate-900">{typeEvents.length} จุด</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <div className="text-[10px] text-slate-500">จังหวัดที่ได้รับผลกระทบ</div>
              <div className="text-xl font-bold text-sky-600">{affectedProvinces.length} จังหวัด</div>
            </div>
          </div>
        </div>

        {/* Impact numbers */}
        {(totalAffectedPeople > 0 || totalHouseholds > 0) && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="text-slate-500">ผลกระทบเบื้องต้น:</span>
            {totalAffectedPeople > 0 && (
              <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-800 font-medium">
                ประชาชน {totalAffectedPeople.toLocaleString()} คน
              </span>
            )}
            {totalHouseholds > 0 && (
              <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-800 font-medium">
                {totalHouseholds.toLocaleString()} ครัวเรือน
              </span>
            )}
          </div>
        )}
      </div>

      {/* Affected Provinces Pills */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          <span>จังหวัดที่อยู่ในพื้นที่เสี่ยงหรือกำลังเกิดเหตุ</span>
        </h3>
        {affectedProvinces.length === 0 ? (
          <p className="text-xs text-slate-400">ไม่มีจังหวัดที่ได้รับผลกระทบในขณะนี้</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {affectedProvinces.map((prov) => (
              <span
                key={prov}
                className="px-3 py-1 rounded-lg bg-slate-50 text-slate-800 border border-slate-200 text-xs font-medium"
              >
                {prov}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Timeline of events for this disaster type */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-600" />
          <span>ไทม์ไลน์เหตุการณ์ {typeConfig.labelTh}</span>
        </h3>

        {typeEvents.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            ไม่พบรายงานเหตุการณ์ {typeConfig.labelTh} ในขณะนี้
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-5 py-2">
            {typeEvents.map((evt) => (
              <div key={evt.id} className="relative pl-6">
                {/* Timeline node */}
                <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-sky-500 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                </span>

                <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 p-4 rounded-xl transition-all shadow-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {evt.province} (อ.{evt.district})
                      </span>
                      <SeverityBadge level={evt.severity} size="sm" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {formatThaiDateTime(evt.updatedAt)}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-sky-700 mb-1">{evt.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{evt.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px]">
                    <span className="text-slate-500">
                      ที่มา: <span className="text-slate-800 font-medium">{evt.source}</span>
                    </span>

                    <button
                      onClick={() => {
                        onBack();
                        onSelectEvent(evt);
                        if (
                          typeof evt.latitude === 'number' &&
                          typeof evt.longitude === 'number' &&
                          !isNaN(evt.latitude) &&
                          !isNaN(evt.longitude)
                        ) {
                          onFocusMap([evt.latitude, evt.longitude], 11);
                        }
                      }}
                      className="text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
                    >
                      ดูบนแผนที่และรายละเอียด →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
