import type { DisasterType, SeverityLevel, DisasterStatus } from '../types/disaster';

export interface DisasterTypeConfig {
  type: DisasterType;
  labelTh: string;
  emoji: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  textColor: string;
  descriptionTh: string;
}

export const DISASTER_TYPES_CONFIG: Record<DisasterType, DisasterTypeConfig> = {
  flood: {
    type: 'flood',
    labelTh: 'น้ำท่วม / น้ำหลาก',
    emoji: '🌊',
    color: '#0284C7',
    badgeBg: 'bg-sky-50',
    borderColor: 'border-sky-200',
    textColor: 'text-sky-700',
    descriptionTh: 'น้ำท่วมขัง น้ำล้นตลิ่ง น้ำป่าไหลหลาก',
  },
  heavy_rain: {
    type: 'heavy_rain',
    labelTh: 'ฝนตกหนัก',
    emoji: '🌧️',
    color: '#2563EB',
    badgeBg: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    descriptionTh: 'ปริมาณฝนสะสมสูง เสี่ยงน้ำท่วมฉับพลัน',
  },
  thunderstorm: {
    type: 'thunderstorm',
    labelTh: 'พายุฝนฟ้าคะนอง',
    emoji: '⛈️',
    color: '#7C3AED',
    badgeBg: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    descriptionTh: 'ฝนฟ้าคะนอง ลมกระโชกแรง ฟ้าผ่า',
  },
  storm: {
    type: 'storm',
    labelTh: 'พายุหมุน / พายุโซนร้อน',
    emoji: '🌪️',
    color: '#DB2777',
    badgeBg: 'bg-pink-50',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-700',
    descriptionTh: 'พายุดีเปรสชัน โซนร้อน หรือไต้ฝุ่น',
  },
  earthquake: {
    type: 'earthquake',
    labelTh: 'แผ่นดินไหว',
    emoji: '🌍',
    color: '#D97706',
    badgeBg: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    descriptionTh: 'แรงสั่นสะเทือนจากรอยเลื่อนใต้พิภพ',
  },
  landslide: {
    type: 'landslide',
    labelTh: 'ดินถล่ม / โคลนถล่ม',
    emoji: '🟠',
    color: '#EA580C',
    badgeBg: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    descriptionTh: 'ดินสไลด์ ดินโคลนถล่มบริเวณลาดเชิงเขา',
  },
  wildfire: {
    type: 'wildfire',
    labelTh: 'ไฟป่า / จุดความร้อน',
    emoji: '🔥',
    color: '#DC2626',
    badgeBg: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
    descriptionTh: 'ไฟป่า จุด Hotspot ฝุ่นควัน PM 2.5',
  },
  strong_wind: {
    type: 'strong_wind',
    labelTh: 'คลื่นลมแรง / ทะเลคลื่นสูง',
    emoji: '🌊',
    color: '#0891B2',
    badgeBg: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-800',
    descriptionTh: 'คลื่นลมแรงในอ่าวไทยและทะเลอันดามัน',
  },
  alert: {
    type: 'alert',
    labelTh: 'ประกาศเตือนภัยฉุกเฉิน',
    emoji: '⚠️',
    color: '#E11D48',
    badgeBg: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
    descriptionTh: 'หนังสือเตือนภัยหรือประกาศสถานการณ์ฉุกเฉิน',
  },
};

export interface SeverityConfig {
  level: SeverityLevel;
  labelTh: string;
  emoji: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  hexColor: string;
  pulseColor: string;
}

export const SEVERITY_CONFIG: Record<SeverityLevel, SeverityConfig> = {
  normal: {
    level: 'normal',
    labelTh: 'ปกติ',
    emoji: '🟢',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-200',
    hexColor: '#059669',
    pulseColor: 'rgba(5, 150, 105, 0.4)',
  },
  watch: {
    level: 'watch',
    labelTh: 'เฝ้าระวัง',
    emoji: '🟡',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
    hexColor: '#D97706',
    pulseColor: 'rgba(217, 119, 6, 0.4)',
  },
  warning: {
    level: 'warning',
    labelTh: 'เสี่ยง',
    emoji: '🟠',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200',
    hexColor: '#EA580C',
    pulseColor: 'rgba(234, 88, 12, 0.4)',
  },
  danger: {
    level: 'danger',
    labelTh: 'อันตราย',
    emoji: '🔴',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-800',
    borderColor: 'border-rose-200',
    hexColor: '#DC2626',
    pulseColor: 'rgba(220, 38, 38, 0.5)',
  },
};

export const STATUS_LABELS: Record<DisasterStatus, { labelTh: string; colorClass: string }> = {
  active: { labelTh: 'กำลังเกิดเหตุ', colorClass: 'text-rose-700 bg-rose-50 border-rose-200' },
  monitoring: { labelTh: 'เฝ้าระวังติดตาม', colorClass: 'text-amber-800 bg-amber-50 border-amber-200' },
  resolving: { labelTh: 'เริ่มคลี่คลาย', colorClass: 'text-blue-700 bg-blue-50 border-blue-200' },
  resolved: { labelTh: 'คลี่คลายแล้ว', colorClass: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
};
