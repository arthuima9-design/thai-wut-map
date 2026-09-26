import React, { useState } from 'react';
import {
  X,
  Megaphone,
  Navigation,
  Loader2,
  CheckCircle,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { THAILAND_PROVINCES } from '../../data/thailandProvinces';
import { geolocationService } from '../../services/geolocationService';
import { geocodingService } from '../../services/geocodingService';
import { provinceService } from '../../services/provinceService';
import { saveCommunityReport, type CommunityReport } from '../../utils/storage';
import type { SeverityLevel } from '../../types/disaster';

interface ReportFloodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted: (report: CommunityReport) => void;
  defaultProvince?: string;
}

export const ReportFloodModal: React.FC<ReportFloodModalProps> = ({
  isOpen,
  onClose,
  onReportSubmitted,
  defaultProvince = 'กรุงเทพมหานคร',
}) => {
  const [province, setProvince] = useState<string>(defaultProvince);
  const [district, setDistrict] = useState<string>('พระนคร');
  const [landmark, setLandmark] = useState<string>('');
  const [severity, setSeverity] = useState<SeverityLevel>('warning');
  const [sourceType, setSourceType] = useState<'self' | 'social_media' | 'rescue_team'>('self');
  const [reporterName, setReporterName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedProvObj = THAILAND_PROVINCES.find((p) => p.nameTh === province);

  // Auto-detect GPS coordinates
  const handleGetGPS = async () => {
    setIsLocating(true);
    setErrorMsg(null);
    try {
      const pos = await geolocationService.getCurrentPosition();
      setLatitude(pos.latitude);
      setLongitude(pos.longitude);

      const nearest = provinceService.findNearestProvince(pos.latitude, pos.longitude);
      if (nearest) {
        setProvince(nearest.nameTh);
        if (nearest.districts.length > 0) {
          setDistrict(nearest.districts[0]);
        }
      }

      try {
        const rev = await geocodingService.reverseGeocode(pos.latitude, pos.longitude);
        if (rev?.district) setDistrict(rev.district);
        if (rev?.displayName) setLandmark(rev.displayName.split(',')[0]);
      } catch {}
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถดึงพิกัด GPS ได้ กรุณาเลือกจังหวัดด้วยตนเอง');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Coordinate resolution
    let finalLat = latitude;
    let finalLng = longitude;

    if (!finalLat || !finalLng) {
      if (selectedProvObj && selectedProvObj.center) {
        finalLat = selectedProvObj.center[0];
        finalLng = selectedProvObj.center[1];
      } else {
        finalLat = 13.7563;
        finalLng = 100.5018;
      }
    }

    const title = landmark
      ? `น้ำท่วมบริเวณ ${landmark} (อ.${district} จ.${province})`
      : `รายงานเหตุน้ำท่วมในพื้นที่ อ.${district} จ.${province}`;

    const depthCm = severity === 'danger' ? 65 : severity === 'warning' ? 35 : 15;

    const newReport: CommunityReport = {
      id: `comm-report-${Date.now()}`,
      title,
      description: description || `มีน้ำท่วมขังในพื้นที่ ${landmark || district} ประชาชนโปรดใช้ความระมัดระวังในการสัญจร`,
      province,
      district,
      landmark,
      latitude: finalLat,
      longitude: finalLng,
      severity,
      depthCm,
      reportedAt: new Date().toISOString(),
      reporterName: reporterName.trim() || 'พลเมืองดี',
      sourceType,
      upvotes: 1,
    };

    saveCommunityReport(newReport);
    setIsSubmitted(true);

    setTimeout(() => {
      onReportSubmitted(newReport);
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 via-white to-amber-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shadow-xs">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-1.5 leading-tight">
                <span>ปักหมุดแจ้งเหตุน้ำท่วม</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                รายงานสถานการณ์สดจากหน้างาน หรือโพสต์ใน Facebook/โซเชียล
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSubmitted ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">บันทึกรายงานเหตุการณ์แล้ว!</h4>
            <p className="text-xs text-slate-500 max-w-xs">
              หมุดเตือนภัยของคุณถูกแสดงบนแผนที่เรียบร้อย ขอบคุณที่ช่วยแจ้งเตือนภัยแก่สังคมครับ
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* GPS Auto-Detect Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGetGPS}
                disabled={isLocating}
                className="flex-1 py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold border border-sky-200 flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs"
              >
                {isLocating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                ) : (
                  <Navigation className="w-4 h-4 text-sky-600" />
                )}
                <span>{latitude ? '📍 อัปเดตพิกัด GPS ปัจจุบันแล้ว' : '📍 ใช้พิกัด GPS ตำแหน่งของฉัน'}</span>
              </button>
            </div>

            {/* Province & District */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">จังหวัด *</label>
                <select
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    const p = THAILAND_PROVINCES.find((prov) => prov.nameTh === e.target.value);
                    if (p && p.districts.length > 0) setDistrict(p.districts[0]);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-500 font-medium"
                >
                  {THAILAND_PROVINCES.map((p) => (
                    <option key={p.code} value={p.nameTh}>
                      {p.nameTh}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">อำเภอ/เขต *</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-500 font-medium"
                >
                  {selectedProvObj?.districts.map((d) => (
                    <option key={d} value={d}>
                      อ.{d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Landmark / Road / Soi */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                <span>จุดสังเกต / ชื่อถนน / ซอย *</span>
                <span className="text-[10px] text-slate-400 font-normal">เช่น ปากซอยสุขุมวิท 39, หน้าตลาดบางแค</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="ระบุจุดสังเกต หรือชื่อถนนที่น้ำท่วม"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-sky-500 font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Severity Level Selector */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5 flex items-center justify-between">
                <span>ระดับความรุนแรงของน้ำท่วม *</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSeverity('watch')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    severity === 'watch'
                      ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-xs ring-1 ring-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-sm">🟡</span>
                    <span className="font-bold text-[11px]">เฝ้าระวัง</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    น้ำเริ่มขัง 10-20 ซม. (ท่วมฟุตบาท)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSeverity('warning')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    severity === 'warning'
                      ? 'bg-orange-50 border-orange-400 text-orange-900 font-bold shadow-xs ring-1 ring-orange-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-sm">🟠</span>
                    <span className="font-bold text-[11px]">เสี่ยงสูง</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    ท่วม 30-50 ซม. (ครึ่งล้อรถยนต์)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSeverity('danger')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    severity === 'danger'
                      ? 'bg-rose-50 border-rose-400 text-rose-900 font-bold shadow-xs ring-1 ring-rose-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-sm">🔴</span>
                    <span className="font-bold text-[11px]">วิกฤต</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    สูงเกิน 50 ซม. (ทะลักเข้าบ้าน/ต้องใช้เรือ)
                  </div>
                </button>
              </div>
            </div>

            {/* Source Type */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ที่มาของข้อมูล *</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSourceType('self')}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    sourceType === 'self'
                      ? 'bg-sky-50 border-sky-400 text-sky-800 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>📍 อยู่ในพื้นที่จริง</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceType('social_media')}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    sourceType === 'social_media'
                      ? 'bg-blue-50 border-blue-400 text-blue-800 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>📱 Facebook / โซเชียล</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceType('rescue_team')}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    sourceType === 'rescue_team'
                      ? 'bg-amber-50 border-amber-400 text-amber-800 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>🚨 กู้ภัย / อาสาสมัคร</span>
                </button>
              </div>
            </div>

            {/* Reporter Name (Optional) */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                ชื่อผู้แจ้ง หรือชื่อกลุ่ม / เพจข่าว (ไม่บังคับ)
              </label>
              <input
                type="text"
                placeholder="เช่น กู้ภัยสว่าง, เพจคนเมืองกาญจน์, พลเมืองดี"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-500 font-medium placeholder:text-slate-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                รายละเอียดสภาพน้ำ / การสัญจร
              </label>
              <textarea
                rows={2}
                placeholder="เช่น น้ำไหลเชี่ยวมาก รถจักรยานยนต์ดับหลายคัน, ทะลักเข้าชั้นล่างของอาคารพาณิชย์"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-500 font-medium placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                className="flex-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Megaphone className="w-4 h-4" />
                <span>ยืนยันปักหมุดรายงานน้ำท่วม</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
