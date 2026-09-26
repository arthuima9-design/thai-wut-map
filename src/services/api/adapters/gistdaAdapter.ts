import type { DisasterEvent } from '../../../types/disaster';

/**
 * Adapter interface for GISTDA Flood & Satellite API
 * In production, calls should proxy through a secure backend (Supabase Edge Function or Express API)
 * to keep API keys private.
 */
export interface GistdaRawFeature {
  id: string;
  properties: {
    province: string;
    amphoe: string;
    depth_cm?: number;
    area_sqkm?: number;
    detected_at: string;
    status: string;
  };
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
}

export class GistdaAdapter {
  /**
   * Transforms external GISTDA API response into unified DisasterEvent model
   */
  public transform(raw: GistdaRawFeature): DisasterEvent {
    const lat = raw.geometry.coordinates[1];
    const lng = raw.geometry.coordinates[0];
    const depth = raw.properties.depth_cm || 30;

    return {
      id: `gistda-${raw.id}`,
      type: 'flood',
      title: `ตรวจพบพื้นที่น้ำท่วมขัง ${raw.properties.amphoe} (${raw.properties.province})`,
      description: `ภาพถ่ายดาวเทียมตรวจพบพื้นที่น้ำท่วมขัง ความลึกประมาณ ${depth} ซม.`,
      province: raw.properties.province,
      district: raw.properties.amphoe,
      latitude: lat,
      longitude: lng,
      severity: depth > 50 ? 'danger' : depth > 20 ? 'warning' : 'watch',
      status: 'active',
      source: 'GISTDA สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ',
      sourceCode: 'GISTDA',
      sourceUrl: 'https://disaster.gistda.or.th',
      reportedAt: raw.properties.detected_at,
      updatedAt: raw.properties.detected_at,
      confidence: 'high',
      depthCm: depth,
      isDemo: false,
    };
  }
}
