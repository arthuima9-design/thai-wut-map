/**
 * RainViewer Open Weather Radar and Satellite API Adapter
 * https://www.rainviewer.com/api.html
 * 100% Free Public Meteorological Radar & Satellite Tile Server
 */

export interface RadarFrame {
  time: number;
  path: string;
  url: string;
  formattedTime: string;
}

export interface RainViewerMetadata {
  host: string;
  radarFrames: RadarFrame[];
  latestRadarUrl: string;
  latestSatelliteUrl: string;
  generatedAt: number;
}

class RainViewerAdapter {
  private cache: RainViewerMetadata | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes cache

  /**
   * Fetches real-time radar and satellite cloud frames from RainViewer
   */
  async getMetadata(): Promise<RainViewerMetadata> {
    const now = Date.now();
    if (this.cache && now - this.lastFetchTime < this.CACHE_TTL_MS) {
      return this.cache;
    }

    try {
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      if (!res.ok) throw new Error(`RainViewer HTTP error: ${res.status}`);
      const data = await res.json();

      const host = data.host || 'https://tilecache.rainviewer.com';
      // Use real measured Doppler radar frames (exclude nowcast extrapolation to eliminate stripe artifacts)
      const pastFrames = data.radar?.past || [];

      const radarFrames: RadarFrame[] = pastFrames.map((f: { time: number; path: string }) => {
        const d = new Date(f.time * 1000);
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        return {
          time: f.time,
          path: f.path,
          url: `${host}${f.path}/256/{z}/{x}/{y}/2/1_0.png`,
          formattedTime: `${hours}:${mins} น.`,
        };
      });

      const latestRadar = radarFrames.length > 0 ? radarFrames[radarFrames.length - 1] : null;
      const latestRadarUrl = latestRadar ? latestRadar.url : '';

      // Satellite infrared (Clouds)
      const satInfrared = data.satellite?.infrared || [];
      const latestSat = satInfrared.length > 0 ? satInfrared[satInfrared.length - 1] : null;
      const latestSatelliteUrl = latestSat
        ? `${host}${latestSat.path}/256/{z}/{x}/{y}/0/0_0.png`
        : '';

      const metadata: RainViewerMetadata = {
        host,
        radarFrames,
        latestRadarUrl,
        latestSatelliteUrl,
        generatedAt: data.generated || Math.floor(now / 1000),
      };

      this.cache = metadata;
      this.lastFetchTime = now;
      return metadata;
    } catch (err) {
      console.warn('RainViewer API fetch failed or offline, using fallback:', err);
      // Fallback object to ensure UI never crashes
      return {
        host: 'https://tilecache.rainviewer.com',
        radarFrames: [],
        latestRadarUrl: '',
        latestSatelliteUrl: '',
        generatedAt: Math.floor(Date.now() / 1000),
      };
    }
  }
}

export const rainViewerAdapter = new RainViewerAdapter();
