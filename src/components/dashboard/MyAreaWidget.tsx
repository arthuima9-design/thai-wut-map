import React, { useState } from 'react';
import { getSavedMyArea, saveMyArea } from '../../utils/storage';
import type { MyAreaSetting } from '../../utils/storage';
import { THAILAND_PROVINCES } from '../../data/thailandProvinces';
import type { DisasterEvent, SeverityLevel } from '../../types/disaster';
import { provinceService } from '../../services/provinceService';
import { geolocationService } from '../../services/geolocationService';
import { geocodingService } from '../../services/geocodingService';
import { SeverityBadge } from '../common/SeverityBadge';
import { Navigation, Edit2, Check, ArrowRight, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

interface MyAreaWidgetProps {
  events: DisasterEvent[];
  onSelectEvent: (event: DisasterEvent) => void;
  onFocusMap: (center: [number, number], zoom: number) => void;
}

export const MyAreaWidget: React.FC<MyAreaWidgetProps> = ({
  events,
  onSelectEvent,
  onFocusMap,
}) => {
  const [myArea, setMyArea] = useState<MyAreaSetting>(getSavedMyArea());
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempProvince, setTempProvince] = useState<string>(myArea.province);
  const [tempDistrict, setTempDistrict] = useState<string>(myArea.district);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const selectedProvinceInfo = THAILAND_PROVINCES.find((p) => p.nameTh === myArea.province);
  const tempProvinceInfo = THAILAND_PROVINCES.find((p) => p.nameTh === tempProvince);

  // Find nearby incidents within 80km of my area center
  const nearbyDisasters = selectedProvinceInfo
    ? provinceService.findNearbyDisasters(selectedProvinceInfo.center, events, 90)
    : [];

  // Calculate local risk status
  let localRisk: SeverityLevel = 'normal';
  if (nearbyDisasters.some((d) => d.event.severity === 'danger' && d.distanceKm <= 50)) {
    localRisk = 'danger';
  } else if (nearbyDisasters.some((d) => d.event.severity === 'warning' && d.distanceKm <= 60)) {
    localRisk = 'warning';
  } else if (nearbyDisasters.length > 0) {
    localRisk = 'watch';
  }

  // Auto-detect and sync current GPS location
  const handleSyncGPS = async () => {
    setIsLocating(true);
    setGpsError(null);
    try {
      const pos = await geolocationService.getCurrentPosition();
      const nearestProv = provinceService.findNearestProvince(pos.latitude, pos.longitude);

      let district = nearestProv?.districts?.[0] || 'เมือง';
      try {
        const rev = await geocodingService.reverseGeocode(pos.latitude, pos.longitude);
        if (rev?.district) {
          district = rev.district;
        }
      } catch {
        // fallback
      }

      const provinceName = nearestProv?.nameTh || 'กรุงเทพมหานคร';
      const newArea: MyAreaSetting = {
        province: provinceName,
        district: district,
        latitude: pos.latitude,
        longitude: pos.longitude,
      };

      setMyArea(newArea);
      setTempProvince(provinceName);
      setTempDistrict(district);
      saveMyArea(newArea);
      setIsEditing(false);
      onFocusMap([pos.latitude, pos.longitude], 12);
    } catch (err: any) {
      setGpsError(err.message || 'ไม่สามารถดึงพิกัด GPS ได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSave = () => {
    const provInfo = THAILAND_PROVINCES.find((p) => p.nameTh === tempProvince);
    const center: [number, number] = provInfo?.center && Array.isArray(provInfo.center)
      ? provInfo.center
      : [14.0228, 99.5328];
    const newArea: MyAreaSetting = {
      province: tempProvince,
      district: tempDistrict,
      latitude: center[0],
      longitude: center[1],
    };
    setMyArea(newArea);
    saveMyArea(newArea);
    setIsEditing(false);
    onFocusMap(center, 10);
  };

  const handleFocusArea = () => {
    if (selectedProvinceInfo && selectedProvinceInfo.center) {
      onFocusMap(selectedProvinceInfo.center, 10);
    } else {
      onFocusMap([myArea.latitude || 14.0228, myArea.longitude || 99.5328], 10);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm relative overflow-hidden">
      {/* Decorative accent top line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-400 to-rose-400" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>📍 พื้นที่ของฉัน</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              สถานการณ์ภัยพิบัติในพื้นที่ที่คุณติดตาม
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSyncGPS}
            disabled={isLocating}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-xs font-medium text-sky-700 transition-colors ${
              isLocating ? 'opacity-70 cursor-wait' : ''
            }`}
            title="ค้นหาและระบุตำแหน่งปัจจุบันของฉันด้วย GPS"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-sky-600" />
            )}
            <span className="text-[11px] font-semibold">GPS</span>
          </button>

          <button
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>บันทึก</span>
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5 text-sky-600" />
                <span>เปลี่ยน</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editing State or View State */}
      {isEditing ? (
        <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          {/* Quick GPS Auto-Detect Button */}
          <button
            onClick={handleSyncGPS}
            disabled={isLocating}
            className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-98"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Navigation className="w-4 h-4 text-white" />
            )}
            <span>{isLocating ? 'กำลังดึงพิกัด GPS...' : '📍 ดึงพิกัดจาก GPS เครื่องฉันอัตโนมัติ'}</span>
          </button>

          {gpsError && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}

          <div className="flex items-center gap-2 my-1">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[10px] text-slate-400 font-medium">หรือเลือกด้วยตนเอง</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <div>
            <label className="text-xs text-slate-600 block mb-1">เลือกจังหวัด:</label>
            <select
              value={tempProvince}
              onChange={(e) => {
                setTempProvince(e.target.value);
                const p = THAILAND_PROVINCES.find((prov) => prov.nameTh === e.target.value);
                if (p && p.districts.length > 0) {
                  setTempDistrict(p.districts[0]);
                }
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            >
              {THAILAND_PROVINCES.map((prov) => (
                <option key={prov.code} value={prov.nameTh}>
                  {prov.nameTh}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-600 block mb-1">เลือกอำเภอ:</label>
            <select
              value={tempDistrict}
              onChange={(e) => setTempDistrict(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            >
              {tempProvinceInfo?.districts.map((dist) => (
                <option key={dist} value={dist}>
                  อ.{dist}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            ยืนยันพื้นที่ของฉัน
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div>
              <div className="text-xs text-slate-500">พิกัดติดตาม:</div>
              <div className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <span>จ.{myArea.province}</span>
                <span className="text-slate-500 text-xs font-normal">
                  (อ.{myArea.district})
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 mb-1">ระดับความเสี่ยง:</div>
              <SeverityBadge level={localRisk} size="md" />
            </div>
          </div>

          {/* Nearby alerts */}
          <div>
            <div className="text-xs text-slate-500 flex items-center justify-between mb-1.5">
              <span>เหตุการณ์ในรัศมี 90 กม.:</span>
              <span className="font-semibold text-slate-800">
                {nearbyDisasters.length} เหตุการณ์
              </span>
            </div>

            {nearbyDisasters.length === 0 ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>ไม่พบเหตุการณ์ภัยพิบัติรุนแรงใกล้พื้นที่ของคุณในขณะนี้</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {nearbyDisasters.slice(0, 2).map(({ event, distanceKm }) => (
                  <button
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-sky-50 border border-slate-200 text-xs flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm">
                        {event.type === 'flood' ? '🌊' : event.type === 'heavy_rain' ? '🌧️' : '⚠️'}
                      </span>
                      <span className="text-slate-800 truncate font-medium">{event.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 flex-shrink-0 group-hover:text-sky-700 ml-2">
                      ~{distanceKm} กม.
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncGPS}
              disabled={isLocating}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
              title="อัปเดตพิกัดตามตำแหน่ง GPS จริงของฉัน"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-sky-600" />
              )}
              <span>อัปเดตตาม GPS</span>
            </button>

            <button
              onClick={handleFocusArea}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-800 text-xs font-semibold border border-sky-200 transition-colors"
            >
              <span>ซูมดูแผนที่</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
