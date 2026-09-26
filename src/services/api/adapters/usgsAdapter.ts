import type { DisasterEvent } from '../../../types/disaster';

/**
 * Adapter for USGS Earthquake Hazards Program GeoJSON feed
 * https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
 */
export interface UsgsGeoJsonFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    title: string;
    url: string;
  };
  geometry: {
    coordinates: [number, number, number]; // [lng, lat, depth_km]
  };
}

export class UsgsAdapter {
  private readonly baseUrl = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

  /**
   * Fetches real live earthquakes in Thailand and Southeast Asia from USGS
   */
  public async fetchLiveEarthquakes(): Promise<DisasterEvent[]> {
    try {
      // Query SE Asia bounding box around Thailand (Latitude 2 to 24, Longitude 92 to 108)
      const url = `${this.baseUrl}?format=geojson&minmagnitude=2.5&minlatitude=2.0&maxlatitude=24.0&minlongitude=92.0&maxlongitude=108.0&limit=15`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`USGS HTTP Error: ${res.status}`);
      const data = await res.json();

      if (!data.features || !Array.isArray(data.features)) return [];

      return data.features.map((feature: UsgsGeoJsonFeature) => {
        let matchedProvince = 'พรมแดน/ภูมิภาคใกล้เคียง';
        const place = (feature.properties.place || '').toLowerCase();

        if (place.includes('thailand') || place.includes('chiang') || place.includes('phayao') || place.includes('lampang')) {
          matchedProvince = 'เชียงใหม่/ภาคเหนือ';
        } else if (place.includes('myanmar') || place.includes('burma')) {
          matchedProvince = 'เมียนมา (ชายแดนไทย)';
        } else if (place.includes('laos')) {
          matchedProvince = 'ลาว (ชายแดนไทย)';
        } else if (place.includes('andaman') || place.includes('nicobar') || place.includes('indonesia')) {
          matchedProvince = 'ทะเลอันดามัน (ภาคใต้)';
        } else if (place.includes('vietnam')) {
          matchedProvince = 'เวียดนาม (ภูมิภาคอินโดจีน)';
        }

        return this.transform(feature, matchedProvince);
      });
    } catch (err) {
      console.warn('Failed to fetch live earthquakes from USGS:', err);
      return [];
    }
  }

  public transform(raw: UsgsGeoJsonFeature, province: string = 'ภาคเหนือ/พรมแดน'): DisasterEvent {
    const coords = raw.geometry?.coordinates || [];
    const rawLng = coords[0];
    const rawLat = coords[1];
    const rawDepth = coords[2];

    const lng = typeof rawLng === 'number' && !isNaN(rawLng) ? rawLng : 100.5;
    const lat = typeof rawLat === 'number' && !isNaN(rawLat) ? rawLat : 13.7;
    const depth = typeof rawDepth === 'number' && !isNaN(rawDepth) ? rawDepth : 10;
    const mag = typeof raw.properties?.mag === 'number' && !isNaN(raw.properties.mag) ? raw.properties.mag : 3.0;

    let reportedAt = new Date().toISOString();
    let updatedAt = reportedAt;
    try {
      if (raw.properties?.time) {
        const d = new Date(raw.properties.time);
        if (!isNaN(d.getTime())) reportedAt = d.toISOString();
      }
      if (raw.properties?.updated) {
        const d = new Date(raw.properties.updated);
        if (!isNaN(d.getTime())) updatedAt = d.toISOString();
      }
    } catch {}

    const place = raw.properties?.place || 'จุดตรวจวัดในภูมิภาค';

    return {
      id: `usgs-${raw.id || Date.now()}`,
      type: 'earthquake',
      title: `แผ่นดินไหวขนาด ${mag.toFixed(1)} แมกนิจูด (${place})`,
      description: `เกิดแผ่นดินไหวขนาด ${mag.toFixed(1)} ลึกลงไปใต้ดิน ${depth} กม. จุดศูนย์กลาง ${place} ได้รับรายงานสดจาก USGS`,
      province: province,
      district: 'บริเวณศูนย์กลางแผ่นดินไหว',
      latitude: lat,
      longitude: lng,
      severity: mag >= 5.0 ? 'danger' : mag >= 4.0 ? 'warning' : 'watch',
      status: 'monitoring',
      source: 'USGS Earthquake Hazards Program (Real-time Feed)',
      sourceCode: 'USGS',
      sourceUrl: raw.properties?.url || 'https://earthquake.usgs.gov',
      reportedAt,
      updatedAt,
      confidence: 'high',
      magnitude: mag,
      depthKm: depth,
      isDemo: false, // LIVE REAL DATA!
      guidelines: [
        'หมอบ กำบัง ยึด (Drop, Cover, and Hold On) หากรู้สึกถึงการสั่นไหว',
        'อยู่ห่างจากอาคารสูง กระจก และสิ่งของที่อาจตกหล่นใส่',
        'เตรียมพร้อมรับมือคลื่นสึนามิหากเกิดแผ่นดินไหวใต้ทะเลอันดามัน',
      ],
    };
  }
}

export const usgsAdapter = new UsgsAdapter();
