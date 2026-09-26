import type { DisasterEvent } from '../../../types/disaster';

/**
 * Adapter for TMD (Thai Meteorological Department) Weather and Warning Feeds
 */
export interface TmdWarningFeed {
  warning_id: string;
  issue_no: string;
  title_th: string;
  description_th: string;
  affected_provinces: string[];
  rainfall_max_24h?: number;
  issue_time: string;
}

export class TmdAdapter {
  public transformWarning(raw: TmdWarningFeed, targetProvince: string, targetCoords: [number, number]): DisasterEvent {
    return {
      id: `tmd-${raw.warning_id}`,
      type: 'heavy_rain',
      title: raw.title_th,
      description: raw.description_th,
      province: targetProvince,
      district: 'ทุกอำเภอในเขตเฝ้าระวัง',
      latitude: targetCoords[0],
      longitude: targetCoords[1],
      severity: 'warning',
      status: 'active',
      source: 'กรมอุตุนิยมวิทยา',
      sourceCode: 'TMD',
      sourceUrl: 'https://www.tmd.go.th',
      reportedAt: raw.issue_time,
      updatedAt: raw.issue_time,
      confidence: 'high',
      rainfallMm24h: raw.rainfall_max_24h,
      isDemo: false,
    };
  }
}
