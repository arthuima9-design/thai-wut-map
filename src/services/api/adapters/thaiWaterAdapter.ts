import type { DisasterEvent, SeverityLevel } from '../../../types/disaster';

interface ThaiWaterStation {
  id: number;
  waterlevel_datetime: string;
  waterlevel_m?: number | null;
  waterlevel_msl?: string | null;
  discharge?: string | null;
  situation_level?: number;
  agency?: {
    id: number;
    agency_name?: { th?: string; en?: string };
    agency_shortname?: { th?: string; en?: string };
  };
  basin?: {
    id: number;
    basin_name?: { th?: string; en?: string };
  };
  station?: {
    id: number;
    tele_station_name?: { th?: string; en?: string };
    tele_station_lat: number;
    tele_station_long: number;
    left_bank?: number;
    right_bank?: number;
    min_bank?: number;
  };
  geocode?: {
    amphoe_name?: { th?: string; en?: string };
    tumbon_name?: { th?: string; en?: string };
    province_name?: { th?: string; en?: string };
  };
  diff_wl_bank?: string | null;
  diff_wl_bank_text?: string | null;
  river_name?: string | null;
}

export class ThaiWaterAdapter {
  private readonly apiUrl = 'https://api-v3.thaiwater.net/api/v1/thaiwater30/public/waterlevel';
  private cachedEvents: DisasterEvent[] = [];
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache

  /**
   * Fetches real-time waterlevel and river overflow telemetry across all 800+ stations in Thailand
   */
  async fetchLiveWaterLevels(): Promise<DisasterEvent[]> {
    const now = Date.now();
    if (this.cachedEvents.length > 0 && now - this.lastFetchTime < this.CACHE_TTL_MS) {
      return this.cachedEvents;
    }

    try {
      const res = await fetch(this.apiUrl, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`ThaiWater HTTP error: ${res.status}`);
      }

      const raw = await res.json();
      const stations: ThaiWaterStation[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : [];

      // Filter for stations reporting actual overflow or critical bank warning
      // situation_level: 5 = Flooded/Overflowing, 4 = Critical High Warning
      const overflowingStations = stations.filter((s) => {
        if (!s.station?.tele_station_lat || !s.station?.tele_station_long) return false;
        const text = s.diff_wl_bank_text || '';
        const level = s.situation_level;
        return text.includes('ล้นตลิ่ง') || level === 5 || level === 4;
      });

      const events: DisasterEvent[] = overflowingStations.map((s, idx) => {
        const isOverflow = (s.diff_wl_bank_text || '').includes('ล้นตลิ่ง') || s.situation_level === 5;
        const diffNum = s.diff_wl_bank ? parseFloat(s.diff_wl_bank) : 0;
        const depthCm = Math.max(0, Math.round(diffNum * 100));

        let severity: SeverityLevel = 'warning';
        if (isOverflow && (diffNum >= 0.5 || s.situation_level === 5)) {
          severity = 'danger'; // 🔴 อันตราย น้ำล้นตลิ่งสูงเกิน 50 ซม.
        } else if (isOverflow || s.situation_level === 4) {
          severity = 'warning'; // 🟠 เสี่ยง น้ำเริ่มล้นหรือปริ่มตลิ่ง
        } else {
          severity = 'watch';
        }

        const stationName = s.station?.tele_station_name?.th || 'สถานีตรวจวัดโทรมาตร';
        const riverName = s.river_name || s.basin?.basin_name?.th || 'ลำน้ำ';
        const province = s.geocode?.province_name?.th || 'ประเทศไทย';
        const district = s.geocode?.amphoe_name?.th || 'ไม่ระบุอำเภอ';
        const subdistrict = s.geocode?.tumbon_name?.th;
        const agencyName = s.agency?.agency_name?.th || 'สถาบันสารสนเทศทรัพยากรน้ำ (สสน.)';
        const agencyShort = s.agency?.agency_shortname?.th || 'HII';

        // Parse datetime "2026-09-26 11:10" to standard ISO format
        let reportedIso = new Date().toISOString();
        if (s.waterlevel_datetime) {
          try {
            const [datePart, timePart] = s.waterlevel_datetime.split(' ');
            if (datePart && timePart) {
              reportedIso = `${datePart}T${timePart}:00+07:00`;
            }
          } catch {}
        }

        const title = isOverflow
          ? `น้ำล้นตลิ่ง ${riverName} (${stationName}) จ.${province}`
          : `ระดับน้ำวิกฤตใกล้ล้นตลิ่ง ${riverName} (${stationName}) จ.${province}`;

        const diffText = isOverflow
          ? `ระดับน้ำสูงกว่าตลิ่ง ${diffNum.toFixed(2)} เมตร`
          : `ระดับน้ำปริ่มตลิ่งต่ำกว่าเพียง ${Math.abs(diffNum).toFixed(2)} เมตร`;

        const description = `ข้อมูลโทรมาตรวัดระดับน้ำอัตโนมัติสดจาก ${agencyName}: ${diffText} บริเวณ${stationName} ลุ่มน้ำ${s.basin?.basin_name?.th || riverName} ${subdistrict ? `ต.${subdistrict} ` : ''}อ.${district} จ.${province}`;

        return {
          id: `thaiwater-station-${s.id || s.station?.id || idx}-${datePartSafe(s.waterlevel_datetime)}`,
          type: 'flood',
          title,
          description,
          province,
          district,
          subdistrict,
          latitude: s.station!.tele_station_lat,
          longitude: s.station!.tele_station_long,
          severity,
          status: 'active',
          source: `${agencyShort} (คลังข้อมูลน้ำแห่งชาติ ThaiWater)`,
          sourceCode: 'HII',
          sourceUrl: 'https://www.thaiwater.net',
          reportedAt: reportedIso,
          updatedAt: reportedIso,
          confidence: 'high',
          isDemo: false, // 100% Live Telemetry
          depthCm: depthCm > 0 ? depthCm : undefined,
          guidelines: [
            'ติดตามประกาศระบายน้ำและระดับน้ำในแม่น้ำอย่างใกล้ชิด',
            'เคลื่อนย้ายทรัพย์สินและสิ่งของมีค่าขึ้นที่สูง',
            'เตรียมกระสอบทรายหรือแนวป้องกันน้ำเอ่อล้นเข้าที่พักอาศัย',
            'ตรวจสอบจุดกลับรถและเส้นทางสัญจรเลียบแม่น้ำก่อนเดินทาง',
          ],
        };
      });

      this.cachedEvents = events;
      this.lastFetchTime = now;
      return events;
    } catch (err) {
      console.warn('ThaiWater API fetch failed or offline, using cache:', err);
      return this.cachedEvents;
    }
  }
}

function datePartSafe(dtStr?: string): string {
  if (!dtStr) return String(Date.now());
  return dtStr.replace(/[^0-9]/g, '');
}

export const thaiWaterAdapter = new ThaiWaterAdapter();
