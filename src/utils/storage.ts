export interface MyAreaSetting {
  province: string;
  district: string;
  latitude: number;
  longitude: number;
}

const STORAGE_KEYS = {
  MY_AREA: 'tdm_my_area',
  DEMO_MODE: 'tdm_demo_mode',
  SOUND_ENABLED: 'tdm_sound_enabled',
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
