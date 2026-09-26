import { THAILAND_PROVINCES } from '../data/thailandProvinces';
import type { ProvinceInfo, DisasterEvent } from '../types/disaster';

export interface LocationSearchResult {
  type: 'province' | 'district';
  province: ProvinceInfo;
  district?: string;
  matchedName: string;
  center: [number, number];
}

class ProvinceService {
  getAllProvinces(): ProvinceInfo[] {
    return THAILAND_PROVINCES;
  }

  getProvinceByName(name: string): ProvinceInfo | undefined {
    const clean = name.trim().toLowerCase();
    return THAILAND_PROVINCES.find(
      (p) => p.nameTh.toLowerCase() === clean || p.nameEn.toLowerCase() === clean
    );
  }

  getProvinceByCode(code: string): ProvinceInfo | undefined {
    return THAILAND_PROVINCES.find((p) => p.code.toLowerCase() === code.toLowerCase());
  }

  searchLocations(query: string): LocationSearchResult[] {
    if (!query || query.trim().length === 0) return [];
    const q = query.trim().toLowerCase();
    const results: LocationSearchResult[] = [];

    // Match provinces
    for (const prov of THAILAND_PROVINCES) {
      if (prov.nameTh.toLowerCase().includes(q) || prov.nameEn.toLowerCase().includes(q)) {
        results.push({
          type: 'province',
          province: prov,
          matchedName: `จ.${prov.nameTh}`,
          center: prov.center,
        });
      }
    }

    // Match districts
    for (const prov of THAILAND_PROVINCES) {
      for (const dist of prov.districts) {
        if (dist.toLowerCase().includes(q)) {
          results.push({
            type: 'district',
            province: prov,
            district: dist,
            matchedName: `อ.${dist} (จ.${prov.nameTh})`,
            center: prov.center,
          });
        }
      }
    }

    return results.slice(0, 8); // Top 8 matches
  }

  /**
   * Calculate distance between two lat/lng coordinates in kilometers (Haversine formula)
   */
  calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  findNearbyDisasters(
    center: [number, number],
    events: DisasterEvent[],
    radiusKm: number = 80
  ): { event: DisasterEvent; distanceKm: number }[] {
    if (!center || !Array.isArray(center) || typeof center[0] !== 'number' || typeof center[1] !== 'number') {
      return [];
    }
    const [lat, lng] = center;
    if (isNaN(lat) || isNaN(lng)) return [];

    const list: { event: DisasterEvent; distanceKm: number }[] = [];

    for (const evt of events || []) {
      if (
        !evt ||
        typeof evt.latitude !== 'number' ||
        typeof evt.longitude !== 'number' ||
        isNaN(evt.latitude) ||
        isNaN(evt.longitude)
      ) {
        continue;
      }
      const dist = this.calculateDistanceKm(lat, lng, evt.latitude, evt.longitude);
      if (!isNaN(dist) && dist <= radiusKm) {
        list.push({ event: evt, distanceKm: dist });
      }
    }

    return list.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  /**
   * Find the closest Thailand province to the provided GPS coordinates
   */
  findNearestProvince(lat: number, lon: number): ProvinceInfo | null {
    if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
      return null;
    }

    let closestProvince: ProvinceInfo | null = null;
    let minDistance = Infinity;

    for (const prov of THAILAND_PROVINCES) {
      if (!prov.center || !Array.isArray(prov.center)) continue;
      const [pLat, pLon] = prov.center;
      const dist = this.calculateDistanceKm(lat, lon, pLat, pLon);
      if (dist < minDistance) {
        minDistance = dist;
        closestProvince = prov;
      }
    }

    return closestProvince;
  }
}

export const provinceService = new ProvinceService();
