import type { FreshnessCategory } from '../types/disaster';

export interface FreshnessInfo {
  category: FreshnessCategory;
  minutesAgo: number;
  label: string;
  badgeText: string;
  description: string;
  dotColor: string;
  badgeClass: string;
  isStale: boolean;
}

/**
 * Calculates minutes passed since the given ISO timestamp
 */
export function calculateDataAgeMinutes(isoString: string): number {
  try {
    if (!isoString) return 99999;
    const updated = new Date(isoString).getTime();
    if (isNaN(updated)) return 99999;
    const now = Date.now();
    const diffMs = Math.max(0, now - updated);
    return Math.floor(diffMs / (1000 * 60));
  } catch {
    return 99999;
  }
}

/**
 * Evaluates the freshness category according to project specification:
 * - 0–30 min: 🟢 ล่าสุด
 * - 30–120 min: 🟡 อาจมีความล่าช้า
 * - > 2 hours (120–1440 min): 🟠 ข้อมูลเก่า
 * - > 24 hours (> 1440 min): 🔴 ไม่ควรใช้สำหรับสถานการณ์ปัจจุบัน
 */
export function getFreshnessInfo(isoString: string): FreshnessInfo {
  const minutes = calculateDataAgeMinutes(isoString);

  if (minutes <= 30) {
    return {
      category: 'fresh',
      minutesAgo: minutes,
      label: '🟢 ล่าสุด',
      badgeText: 'ข้อมูลล่าสุด',
      description: 'ข้อมูลมีความสดใหม่อัปเดตไม่เกิน 30 นาที',
      dotColor: 'bg-emerald-500',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      isStale: false,
    };
  }

  if (minutes <= 120) {
    return {
      category: 'moderate',
      minutesAgo: minutes,
      label: '🟡 อาจมีความล่าช้า',
      badgeText: 'อัปเดตปานกลาง',
      description: 'ข้อมูลอัปเดตเมื่อ 30-120 นาทีที่ผ่านมา อาจมีความล่าช้าจากสถานการณ์จริง',
      dotColor: 'bg-amber-500',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      isStale: false,
    };
  }

  if (minutes <= 1440) {
    return {
      category: 'aged',
      minutesAgo: minutes,
      label: '🟠 ข้อมูลเก่า',
      badgeText: 'ข้อมูลเก่า (>2 ชม.)',
      description: '⚠️ ข้อมูลอาจไม่เป็นปัจจุบัน อัปเดตเกิน 2 ชั่วโมงแล้ว',
      dotColor: 'bg-orange-500',
      badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
      isStale: true,
    };
  }

  return {
    category: 'stale',
    minutesAgo: minutes,
    label: '🔴 ข้อมูลล้าสมัย',
    badgeText: 'ไม่ควรใช้อ้างอิงปัจจุบัน',
    description: '🔴 ข้อมูลเกิน 24 ชั่วโมงแล้ว ไม่ควรใช้ประเมินสถานการณ์ฉุกเฉินปัจจุบัน',
    dotColor: 'bg-rose-500',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    isStale: true,
  };
}

/**
 * Format relative time in conversational Thai
 */
export function formatRelativeTimeThai(isoString: string): string {
  const minutes = calculateDataAgeMinutes(isoString);
  if (minutes < 1) return 'เมื่อสักครู่';
  if (minutes < 60) return `เมื่อ ${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `เมื่อ ${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  return `เมื่อ ${days} วันที่แล้ว`;
}

/**
 * Format full Thai Date and Time (e.g. 26 กันยายน 2569 เวลา 08:30 น.)
 */
export function formatThaiDateTime(isoString: string): string {
  try {
    if (!isoString) return 'ไม่ระบุเวลา';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'ไม่ระบุเวลา';
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    // Buddhist calendar year (+543)
    const year = d.getFullYear() + 543;
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} เวลา ${hours}:${mins} น.`;
  } catch {
    return isoString || 'ไม่ระบุเวลา';
  }
}

/**
 * Format time only (e.g. 08:30 น.)
 */
export function formatThaiTime(isoString: string): string {
  try {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${mins} น.`;
  } catch {
    return '';
  }
}
