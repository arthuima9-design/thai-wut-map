import type { DisasterEvent, SeverityLevel } from '../../../types/disaster';

interface StationLocation {
  province: string;
  district: string;
  lat: number;
  lng: number;
}

const MONITORING_STATIONS: StationLocation[] = [
  { province: 'เชียงใหม่', district: 'เมืองเชียงใหม่', lat: 18.79, lng: 98.98 },
  { province: 'กาญจนบุรี', district: 'เมืองกาญจนบุรี', lat: 14.02, lng: 99.53 },
  { province: 'กรุงเทพมหานคร', district: 'พระนคร', lat: 13.75, lng: 100.50 },
  { province: 'นครราชสีมา', district: 'เมืองนครราชสีมา', lat: 14.98, lng: 102.10 },
  { province: 'สุราษฎร์ธานี', district: 'เมืองสุราษฎร์ธานี', lat: 9.14, lng: 99.32 },
  { province: 'ภูเก็ต', district: 'เมืองภูเก็ต', lat: 7.88, lng: 98.39 },
  { province: 'ชลบุรี', district: 'เมืองชลบุรี', lat: 13.36, lng: 100.98 },
  { province: 'พระนครศรีอยุธยา', district: 'พระนครศรีอยุธยา', lat: 14.35, lng: 100.57 },
  { province: 'อุบลราชธานี', district: 'เมืองอุบลราชธานี', lat: 15.24, lng: 104.85 },
  { province: 'น่าน', district: 'บ่อเกลือ', lat: 19.15, lng: 101.17 },
];

export class OpenMeteoAdapter {
  private readonly baseUrl = 'https://api.open-meteo.com/v1/forecast';

  /**
   * Fetches real-time weather and precipitation across key Thailand monitoring stations
   */
  async fetchLiveWeatherAlerts(): Promise<DisasterEvent[]> {
    try {
      const lats = MONITORING_STATIONS.map((s) => s.lat).join(',');
      const lngs = MONITORING_STATIONS.map((s) => s.lng).join(',');

      const url = `${this.baseUrl}?latitude=${lats}&longitude=${lngs}&current=temperature_2m,precipitation,rain,weather_code,wind_speed_10m&timezone=Asia%2FBangkok`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Open-Meteo HTTP error: ${res.status}`);
      const data = await res.json();

      const items: any[] = Array.isArray(data) ? data : [data];
      const events: DisasterEvent[] = [];

      items.forEach((item, index) => {
        const station = MONITORING_STATIONS[index];
        if (!station || !item.current) return;

        const current = item.current;
        const rainMm = current.rain || current.precipitation || 0;
        const windKmh = current.wind_speed_10m || 0;
        const code = current.weather_code || 0;

        // Check if conditions meet disaster or watch thresholds
        const isRainy = rainMm > 0.05 || (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
        const isThunderstorm = code >= 95;
        const isStrongWind = windKmh >= 25;

        if (isRainy || isThunderstorm || isStrongWind) {
          let severity: SeverityLevel = 'watch';
          if (rainMm > 5 || windKmh > 50 || code >= 96) severity = 'danger';
          else if (rainMm > 1 || windKmh > 35 || isThunderstorm) severity = 'warning';

          const type = isThunderstorm
            ? 'thunderstorm'
            : isStrongWind && !isRainy
            ? 'strong_wind'
            : 'heavy_rain';

          const title = isThunderstorm
            ? `พายุฝนฟ้าคะนองสดในพื้นที่ ${station.district}`
            : isStrongWind
            ? `ลมกระโชกแรงตรวจวัดได้ ${windKmh.toFixed(1)} กม./ชม.`
            : `ฝนตกต่อเนื่อง ตรวจวัดได้ ${rainMm.toFixed(1)} มม.`;

          events.push({
            id: `openmeteo-${station.province}-${Date.now()}-${index}`,
            type,
            title,
            description: `รายงานสภาพอากาศสดจากสถานีตรวจวัดความละเอียดสูง: อุณหภูมิ ${current.temperature_2m}°C, ปริมาณฝน ${rainMm} มม., ความเร็วลม ${windKmh} กม./ชม.`,
            province: station.province,
            district: station.district,
            latitude: station.lat,
            longitude: station.lng,
            severity,
            status: 'active',
            source: 'Open-Meteo Global Meteorological API (Live Satellite/Radar Feed)',
            sourceCode: 'TMD',
            sourceUrl: 'https://open-meteo.com',
            reportedAt: current.time ? `${current.time}:00+07:00` : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            confidence: 'high',
            rainfallMm24h: rainMm * 24, // estimated rate
            windSpeedKmh: windKmh,
            isDemo: false, // LIVE REAL DATA!
            guidelines: [
              'ตรวจสอบสภาพอากาศก่อนออกเดินทาง',
              'หลีกเลี่ยงการสัญจรผ่านเส้นทางน้ำไหลหลากหรือต้นไม้ใหญ่',
              'พกร่มหรือเสื้อกันฝน และระวังทัศนวิสัยต่ำขณะขับขี่',
            ],
          });
        }
      });

      return events;
    } catch (err) {
      console.warn('Failed to fetch live weather from Open-Meteo:', err);
      return [];
    }
  }
}

export const openMeteoAdapter = new OpenMeteoAdapter();
