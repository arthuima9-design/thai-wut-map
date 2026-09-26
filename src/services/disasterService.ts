import { disasterApi } from './api/disasterApi';
import { realDisasterApi, type ApiMode } from './api/realDisasterApi';
import type { DisasterFilterOptions } from './api/disasterApi';
import type { DisasterEvent, ProvinceRiskSummary, SituationMetric } from '../types/disaster';

class DisasterService {
  private currentMode: ApiMode = 'hybrid'; // Default to Hybrid (Real USGS + Real Weather + Demo Floods)
  private cachedEvents: DisasterEvent[] | null = null;
  private lastFetchTime: string | null = null;

  private getActiveApi() {
    if (this.currentMode === 'demo') {
      return disasterApi;
    }
    realDisasterApi.setApiMode(this.currentMode);
    return realDisasterApi;
  }

  setApiMode(mode: ApiMode) {
    this.currentMode = mode;
    this.cachedEvents = null;
    realDisasterApi.setApiMode(mode);
  }

  getApiMode(): ApiMode {
    return this.currentMode;
  }

  async getDisasters(filter?: DisasterFilterOptions, forceRefresh: boolean = false): Promise<DisasterEvent[]> {
    const api = this.getActiveApi();
    if (!forceRefresh && this.cachedEvents && !filter?.searchQuery && !filter?.types?.length && !filter?.province) {
      return this.cachedEvents;
    }
    const events = await api.fetchDisasterEvents(filter);
    if (!filter || Object.keys(filter).length === 0) {
      this.cachedEvents = events;
      this.lastFetchTime = new Date().toISOString();
    }
    return events;
  }

  async getDisasterById(id: string): Promise<DisasterEvent | null> {
    return this.getActiveApi().fetchEventById(id);
  }

  async getProvinceRisk(provinceName: string): Promise<ProvinceRiskSummary> {
    return this.getActiveApi().fetchProvinceRisk(provinceName);
  }

  async getMetrics(): Promise<SituationMetric[]> {
    return this.getActiveApi().fetchSituationMetrics();
  }

  async getSystemStatus() {
    return this.getActiveApi().getSystemStatus();
  }

  getLastFetchTime(): string | null {
    return this.lastFetchTime;
  }

  setSimulateError(simulate: boolean) {
    if ('setSimulateError' in disasterApi) {
      (disasterApi as any).setSimulateError(simulate);
    }
  }
}

export const disasterService = new DisasterService();
