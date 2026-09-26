import type { SeverityLevel } from '../types/disaster';

export interface MyAreaSetting {
  province: string;
  district: string;
  latitude: number;
  longitude: number;
}

export interface CommunityReport {
  id: string;
  title: string;
  description: string;
  province: string;
  district: string;
  subdistrict?: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  severity: SeverityLevel;
  depthCm?: number;
  reportedAt: string; // ISO 8601
  expiresAt: string;  // ISO 8601 — 24 hours after reportedAt
  reporterName?: string;
  sourceType: 'self' | 'social_media' | 'rescue_team';
  upvotes: number;
}

const STORAGE_KEYS = {
  MY_AREA: 'tdm_my_area',
  DEMO_MODE: 'tdm_demo_mode',
  SOUND_ENABLED: 'tdm_sound_enabled',
  COMMUNITY_REPORTS: 'tdm_community_reports',
  UPVOTED_REPORTS: 'tdm_upvoted_reports',
};

const DEFAULT_MY_AREA: MyAreaSetting = {
  province: 'กาญจนบุรี',
  district: 'เมืองกาญจนบุรี',
  latitude: 14.0228,
  longitude: 99.5328,
};

export function getSavedMyArea(): MyAreaSetting {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MY_AREA);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_MY_AREA;
}

export function saveMyArea(area: MyAreaSetting): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MY_AREA, JSON.stringify(area));
  } catch {}
}

export function getDemoMode(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEMO_MODE);
    if (raw !== null) return raw === 'true';
  } catch {}
  return true; // Default to DEMO MODE
}

export function setDemoMode(isDemo: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, isDemo ? 'true' : 'false');
  } catch {}
}

export function getCommunityReports(): CommunityReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMUNITY_REPORTS);
    if (raw) {
      const all: CommunityReport[] = JSON.parse(raw);
      const now = Date.now();
      // Prune expired (or legacy reports without expiresAt older than 24h)
      const active = all.filter((r) => {
        if (r.expiresAt) return now < new Date(r.expiresAt).getTime();
        // Legacy reports without expiresAt: expire 24h after reportedAt
        return now < new Date(r.reportedAt).getTime() + 24 * 60 * 60 * 1000;
      });
      if (active.length !== all.length) {
        localStorage.setItem(STORAGE_KEYS.COMMUNITY_REPORTS, JSON.stringify(active));
      }
      return active;
    }
  } catch {}
  return [];
}

export function updateCommunityReportLocation(
  reportId: string,
  latitude: number,
  longitude: number
): void {
  try {
    const reports = getCommunityReports();
    const target = reports.find((r) => r.id === reportId);
    if (!target) return;
    target.latitude = latitude;
    target.longitude = longitude;
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_REPORTS, JSON.stringify(reports));
  } catch (err) {
    console.warn('Failed to update community report location:', err);
  }
}


export function saveCommunityReport(report: CommunityReport): void {
  try {
    const existing = getCommunityReports();
    // Prepend new report
    const updated = [report, ...existing.filter((r) => r.id !== report.id)];
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_REPORTS, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save community report:', err);
  }
}

export function hasUserUpvoted(reportId: string): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UPVOTED_REPORTS);
    if (raw) {
      const upvotedIds: string[] = JSON.parse(raw);
      return upvotedIds.includes(reportId);
    }
  } catch {}
  return false;
}

export function upvoteCommunityReport(reportId: string): { success: boolean; newCount: number } {
  try {
    const rawUpvoted = localStorage.getItem(STORAGE_KEYS.UPVOTED_REPORTS);
    const upvotedIds: string[] = rawUpvoted ? JSON.parse(rawUpvoted) : [];
    
    if (upvotedIds.includes(reportId)) {
      return { success: false, newCount: 0 };
    }

    const reports = getCommunityReports();
    const target = reports.find((r) => r.id === reportId);
    if (!target) return { success: false, newCount: 0 };

    target.upvotes = (target.upvotes || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_REPORTS, JSON.stringify(reports));

    upvotedIds.push(reportId);
    localStorage.setItem(STORAGE_KEYS.UPVOTED_REPORTS, JSON.stringify(upvotedIds));

    return { success: true, newCount: target.upvotes };
  } catch {
    return { success: false, newCount: 0 };
  }
}

