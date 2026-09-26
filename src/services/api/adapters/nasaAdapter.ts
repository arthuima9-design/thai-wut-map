import type { DisasterEvent } from '../../../types/disaster';

/**
 * Adapter for NASA FIRMS (Fire Information for Resource Management System)
 * Thermal Anomalies / Hotspots from MODIS and VIIRS satellites
 */
export interface NasaFirmsHotspot {
  latitude: number;
  longitude: number;
  bright_ti4: number; // Brightness temperature
  scan: number;
  track: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  confidence: string; // 'low', 'nominal', 'high'
  frp: number; // Fire Radiative Power (MW)
}

export class NasaFirmsAdapter {
  public transform(
    hotspots: NasaFirmsHotspot[],
    province: string,
    district: string,
    clusterCenter: [number, number]
  ): DisasterEvent {
    const count = hotspots.length;
    const maxFrp = Math.max(...hotspots.map((h) => h.frp || 0));

    return {
      id: `firms-${province}-${Date.now()}`,
      type: 'wildfire',
      title: `ตรวจพบกลุ่มจุดความร้อน (Hotspot) ${count} จุดในพื้นที่ ${district}`,
      description: `ดาวเทียมตรวจพบความร้อนผิดปกติบนผิวดิน กำลังการแผ่ความร้อนสูงสุด ${maxFrp.toFixed(1)} MW เสี่ยงต่อการเกิดไฟป่าและฝุ่น PM 2.5`,
      province: province,
      district: district,
      latitude: clusterCenter[0],
      longitude: clusterCenter[1],
      severity: count > 20 ? 'danger' : count > 8 ? 'warning' : 'watch',
      status: 'active',
      source: 'NASA FIRMS (Fire Information for Resource Management System)',
      sourceCode: 'NASA_FIRMS',
      sourceUrl: 'https://firms.modaps.eosdis.nasa.gov',
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      confidence: 'high',
      hotspotCount: count,
      isDemo: false,
    };
  }
}
