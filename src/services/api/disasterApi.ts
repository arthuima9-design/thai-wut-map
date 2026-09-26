import type { DisasterEvent, DisasterType, ProvinceRiskSummary, SituationMetric, SeverityLevel } from '../../types/disaster';
import { MOCK_DISASTER_EVENTS } from '../../data/mockDisasters';
import { THAILAND_PROVINCES } from '../../data/thailandProvinces';

export interface DisasterFilterOptions {
  types?: DisasterType[];
  severities?: SeverityLevel[];
  province?: string;
  searchQuery?: string;
  isDemo?: boolean;
}

export interface IDisasterApi {
  fetchDisasterEvents(filter?: DisasterFilterOptions): Promise<DisasterEvent[]>;
  fetchEventById(id: string): Promise<DisasterEvent | null>;
  fetchProvinceRisk(provinceName: string): Promise<ProvinceRiskSummary>;
  fetchSituationMetrics(): Promise<SituationMetric[]>;
  getSystemStatus(): Promise<{ isOnline: boolean; lastSync: string; sourceCount: number }>;
}

/**
 * Mock Disaster API implementation
 * Safe for MVP, fully typed, supports latency & error simulation for testing error boundaries
 */
export class MockDisasterApi implements IDisasterApi {
  private events: DisasterEvent[] = [...MOCK_DISASTER_EVENTS];
  private shouldSimulateError: boolean = false;

  public setSimulateError(value: boolean) {
    this.shouldSimulateError = value;
  }

  async fetchDisasterEvents(filter?: DisasterFilterOptions): Promise<DisasterEvent[]> {
    // Artificial latency 250ms for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 250));

    if (this.shouldSimulateError) {
      throw new Error('ไม่สามารถเชื่อมต่อระบบข้อมูลภัยพิบัติส่วนกลางได้ (Simulated Error)');
    }

    let results = [...this.events];

    if (filter?.types && filter.types.length > 0) {
      results = results.filter((evt) => filter.types!.includes(evt.type));
    }

    if (filter?.severities && filter.severities.length > 0) {
      results = results.filter((evt) => filter.severities!.includes(evt.severity));
    }

    if (filter?.province) {
      results = results.filter((evt) => evt.province.toLowerCase().includes(filter.province!.toLowerCase()));
    }

    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase().trim();
      results = results.filter(
        (evt) =>
          evt.province.toLowerCase().includes(q) ||
          evt.district.toLowerCase().includes(q) ||
          evt.title.toLowerCase().includes(q) ||
          evt.description.toLowerCase().includes(q)
      );
    }

    // Sort newest to oldest
    return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async fetchEventById(id: string): Promise<DisasterEvent | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.events.find((evt) => evt.id === id) || null;
  }

  async fetchProvinceRisk(provinceName: string): Promise<ProvinceRiskSummary> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const targetProvince = THAILAND_PROVINCES.find(
      (p) => p.nameTh === provinceName || p.nameEn.toLowerCase() === provinceName.toLowerCase()
    );

    const provEvents = this.events.filter(
      (evt) => evt.province === provinceName || (targetProvince && evt.province === targetProvince.nameTh)
    );

    // Calculate risk breakdown
    const getHighestSeverityForType = (type: DisasterType): SeverityLevel => {
      const typeEvents = provEvents.filter((e) => e.type === type && e.status !== 'resolved');
      if (typeEvents.some((e) => e.severity === 'danger')) return 'danger';
      if (typeEvents.some((e) => e.severity === 'warning')) return 'warning';
      if (typeEvents.some((e) => e.severity === 'watch')) return 'watch';
      return 'normal';
    };

    // Overall province risk
    let overallRisk: SeverityLevel = 'normal';
    if (provEvents.some((e) => e.severity === 'danger')) overallRisk = 'danger';
    else if (provEvents.some((e) => e.severity === 'warning')) overallRisk = 'warning';
    else if (provEvents.some((e) => e.severity === 'watch')) overallRisk = 'watch';

    return {
      provinceName: targetProvince ? targetProvince.nameTh : provinceName,
      overallRisk,
      activeDisastersCount: provEvents.filter((e) => e.status === 'active').length,
      lastUpdated: new Date().toISOString(),
      breakdown: {
        flood: getHighestSeverityForType('flood'),
        rain: getHighestSeverityForType('heavy_rain'),
        earthquake: getHighestSeverityForType('earthquake'),
        wildfire: getHighestSeverityForType('wildfire'),
        landslide: getHighestSeverityForType('landslide'),
      },
      keyEvents: provEvents,
      isDemo: true,
    };
  }

  async fetchSituationMetrics(): Promise<SituationMetric[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const activeEvents = this.events.filter((e) => e.status !== 'resolved');

    const floodCount = activeEvents.filter((e) => e.type === 'flood').length;
    const rainCount = activeEvents.filter((e) => e.type === 'heavy_rain').length;
    const alertCount = activeEvents.filter((e) => e.type === 'alert' || e.severity === 'danger').length;
    const earthquakeCount = activeEvents.filter((e) => e.type === 'earthquake').length;

    return [
      {
        type: 'flood',
        label: 'น้ำท่วมขัง',
        count: floodCount,
        unit: 'พื้นที่',
        severity: floodCount > 2 ? 'danger' : 'warning',
        icon: '🌊',
      },
      {
        type: 'heavy_rain',
        label: 'ฝนตกหนัก',
        count: rainCount,
        unit: 'พื้นที่',
        severity: rainCount > 3 ? 'warning' : 'watch',
        icon: '🌧️',
      },
      {
        type: 'alert',
        label: 'แจ้งเตือนภัย',
        count: alertCount,
        unit: 'รายการ',
        severity: alertCount > 0 ? 'warning' : 'normal',
        icon: '⚠️',
      },
      {
        type: 'earthquake',
        label: 'แผ่นดินไหว',
        count: earthquakeCount,
        unit: 'เหตุการณ์',
        severity: earthquakeCount > 0 ? 'watch' : 'normal',
        icon: '🌍',
      },
    ];
  }

  async getSystemStatus() {
    return {
      isOnline: true,
      lastSync: new Date().toISOString(),
      sourceCount: 7,
    };
  }
}

// Singleton API instance
export const disasterApi = new MockDisasterApi();
