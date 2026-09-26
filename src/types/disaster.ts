export type DisasterType =
  | 'flood'         // 🌊 น้ำท่วม
  | 'heavy_rain'    // 🌧️ ฝนตกหนัก
  | 'thunderstorm'  // ⛈️ พายุฝนฟ้าคะนอง
  | 'storm'         // 🌪️ พายุ
  | 'earthquake'    // 🌍 แผ่นดินไหว
  | 'landslide'     // 🟠 ดินถล่ม
  | 'wildfire'      // 🔥 ไฟป่า / จุดความร้อน (Hotspots)
  | 'strong_wind'   // 🌊 คลื่นลมแรง / ลมกระโชกแรง
  | 'alert';        // ⚠️ ประกาศเตือนภัยทั่วไป

export type SeverityLevel =
  | 'normal'   // 🟢 ปกติ
  | 'watch'    // 🟡 เฝ้าระวัง
  | 'warning'  // 🟠 เสี่ยง
  | 'danger';  // 🔴 อันตราย

export type DisasterStatus =
  | 'active'     // กำลังเกิดเหตุ
  | 'monitoring' // เฝ้าระวังติดตาม
  | 'resolving'  // เริ่มคลี่คลาย
  | 'resolved';  // คลี่คลายแล้ว

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type FreshnessCategory =
  | 'fresh'     // 0–30 นาที 🟢 ล่าสุด
  | 'moderate'  // 30–120 นาที 🟡 อาจมีความล่าช้า
  | 'aged'      // 2-24 ชั่วโมง 🟠 ข้อมูลเก่า
  | 'stale';    // มากกว่า 24 ชั่วโมง 🔴 ไม่ควรใช้สำหรับสถานการณ์ปัจจุบัน

export interface DisasterEvent {
  id: string;
  type: DisasterType;
  title: string;
  description: string;
  province: string;
  district: string;
  subdistrict?: string;
  latitude: number;
  longitude: number;
  severity: SeverityLevel;
  status: DisasterStatus;
  source: string;
  sourceUrl?: string;
  sourceCode: 'GISTDA' | 'TMD' | 'DDPM' | 'NDWC' | 'USGS' | 'NASA_FIRMS' | 'RID' | 'SYSTEM' | 'HII' | 'COMMUNITY';
  reportedAt: string; // ISO 8601
  updatedAt: string;  // ISO 8601
  confidence: ConfidenceLevel;
  isDemo?: boolean;
  isCommunityReport?: boolean;
  upvotes?: number;
  reporterName?: string;
  reportSourceType?: 'self' | 'social_media' | 'rescue_team';
  affectedPeople?: number;
  affectedHouseholds?: number;
  depthCm?: number;        // for floods
  rainfallMm24h?: number;  // for heavy rain
  magnitude?: number;      // for earthquake
  depthKm?: number;        // for earthquake
  hotspotCount?: number;   // for wildfire
  windSpeedKmh?: number;   // for storm
  guidelines?: string[];   // emergency recommendations
}

export interface ProvinceInfo {
  code: string;
  nameTh: string;
  nameEn: string;
  region: 'north' | 'northeast' | 'central' | 'east' | 'west' | 'south';
  center: [number, number]; // [lat, lng]
  districts: string[];
}

export interface ProvinceRiskSummary {
  provinceName: string;
  overallRisk: SeverityLevel;
  activeDisastersCount: number;
  lastUpdated: string;
  breakdown: {
    flood: SeverityLevel;
    rain: SeverityLevel;
    earthquake: SeverityLevel;
    wildfire: SeverityLevel;
    landslide: SeverityLevel;
  };
  keyEvents: DisasterEvent[];
  isDemo: boolean;
}

export interface SituationMetric {
  type: DisasterType;
  label: string;
  count: number;
  unit: string;
  severity: SeverityLevel;
  icon: string;
}

export interface DataSourceMeta {
  code: string;
  nameTh: string;
  nameEn: string;
  organization: string;
  category: string;
  updateFrequency: string;
  apiStatus: 'ready' | 'planned' | 'testing';
  apiEndpoint?: string;
  description: string;
  officialUrl: string;
  isIntegrated: boolean;
}
