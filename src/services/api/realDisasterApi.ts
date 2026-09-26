import type {
  DisasterEvent,
  DisasterType,
  ProvinceRiskSummary,
  SituationMetric,
  SeverityLevel,
} from '../../types/disaster';
import type { IDisasterApi, DisasterFilterOptions } from './disasterApi';
import { usgsAdapter } from './adapters/usgsAdapter';
import { openMeteoAdapter } from './adapters/openMeteoAdapter';
import { MOCK_DISASTER_EVENTS } from '../../data/mockDisasters';
import { THAILAND_PROVINCES } from '../../data/thailandProvinces';

export type ApiMode = 'demo' | 'hybrid' | 'live';

export class RealDisasterApi implements IDisasterApi {
  private apiMode: ApiMode = 'hybrid'; // Default to hybrid so live earthquakes and rain merge with mock floods
  private liveEventsCache: DisasterEvent[] = [];
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL_MS = 60 * 1000; // 1 minute cache

  public setApiMode(mode: ApiMode) {
    this.apiMode = mode;
  }

  public getApiMode(): ApiMode {
    return this.apiMode;
  }

  private async fetchAllLiveSources(): Promise<DisasterEvent[]> {
    const now = Date.now();
    if (this.liveEventsCache.length > 0 && now - this.lastFetchTime < this.CACHE_TTL_MS) {
      return this.liveEventsCache;
    }

    try {
      // Parallel fetch from live real APIs (USGS and Open-Meteo)
      const [earthquakes, weatherAlerts] = await Promise.all([
        usgsAdapter.fetchLiveEarthquakes(),
        openMeteoAdapter.fetchLiveWeatherAlerts(),
      ]);

      const liveList = [...earthquakes, ...weatherAlerts];
      this.liveEventsCache = liveList;
      this.lastFetchTime = now;
      return liveList;
    } catch (err) {
      console.warn('Real API fetch failed, falling back to cached or demo data:', err);
      return this.liveEventsCache;
    }
  }

  async fetchDisasterEvents(filter?: DisasterFilterOptions): Promise<DisasterEvent[]> {
    let combinedEvents: DisasterEvent[] = [];

    if (this.apiMode === 'demo') {
      combinedEvents = [...MOCK_DISASTER_EVENTS];
    } else if (this.apiMode === 'live') {
      // Pure Live: only real API data (USGS + Open-Meteo)
      const liveData = await this.fetchAllLiveSources();
      combinedEvents = liveData;
    } else {
      // Hybrid: Live Real APIs (USGS + Open-Meteo) merged with mock floods/landslides from other agencies
      const liveData = await this.fetchAllLiveSources();
      
      // Filter out mock earthquakes/storms if live ones are present, else keep mock
      const mockFiltered = MOCK_DISASTER_EVENTS.filter((m) => {
        if (m.type === 'earthquake' && liveData.some((l) => l.type === 'earthquake')) return false;
        return true;
      });

      combinedEvents = [...liveData, ...mockFiltered];
    }

    // Apply Filters
    let results = combinedEvents;

    if (filter?.types && filter.types.length > 0) {
      results = results.filter((evt) => filter.types!.includes(evt.type));
    }

    if (filter?.severities && filter.severities.length > 0) {
      results = results.filter((evt) => filter.severities!.includes(evt.severity));
    }

    if (filter?.province) {
      results = results.filter((evt) =>
        evt.province.toLowerCase().includes(filter.province!.toLowerCase())
      );
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

    return results.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async fetchEventById(id: string): Promise<DisasterEvent | null> {
    const all = await this.fetchDisasterEvents();
    return all.find((e) => e.id === id) || null;
  }

  async fetchProvinceRisk(provinceName: string): Promise<ProvinceRiskSummary> {
    const allEvents = await this.fetchDisasterEvents();
    const targetProvince = THAILAND_PROVINCES.find(
      (p) => p.nameTh === provinceName || p.nameEn.toLowerCase() === provinceName.toLowerCase()
    );

    const provEvents = allEvents.filter(
      (evt) =>
        evt.province === provinceName ||
        (targetProvince && evt.province.includes(targetProvince.nameTh))
    );

    const getHighestSeverityForType = (type: DisasterType): SeverityLevel => {
      const typeEvents = provEvents.filter((e) => e.type === type && e.status !== 'resolved');
      if (typeEvents.some((e) => e.severity === 'danger')) return 'danger';
      if (typeEvents.some((e) => e.severity === 'warning')) return 'warning';
      if (typeEvents.some((e) => e.severity === 'watch')) return 'watch';
      return 'normal';
    };

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
      isDemo: this.apiMode === 'demo',
    };
  }

  async fetchSituationMetrics(): Promise<SituationMetric[]> {
    const activeEvents = (await this.fetchDisasterEvents()).filter(
      (e) => e.status !== 'resolved'
    );

    const floodCount = activeEvents.filter((e) => e.type === 'flood').length;
    const rainCount = activeEvents.filter((e) => e.type === 'heavy_rain' || e.type === 'thunderstorm').length;
    const alertCount = activeEvents.filter((e) => e.type === 'alert' || e.severity === 'danger').length;
    const earthquakeCount = activeEvents.filter((e) => e.type === 'earthquake').length;

    return [
      {
        type: 'flood',
        label: 'น้ำท่วมขัง',
        count: floodCount,
        unit: 'พื้นที่',
        severity: floodCount > 2 ? 'danger' : floodCount > 0 ? 'warning' : 'normal',
        icon: '🌊',
      },
      {
        type: 'heavy_rain',
        label: 'ฝนตก / พายุ',
        count: rainCount,
        unit: 'พื้นที่',
        severity: rainCount > 2 ? 'warning' : 'watch',
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
      sourceCount: 5,
    };
  }
}

export const realDisasterApi = new RealDisasterApi();
