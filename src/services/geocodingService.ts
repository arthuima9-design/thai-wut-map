/**
 * OpenStreetMap Nominatim Geocoding & Address Search Service
 * Provides Google Maps-like address, place, and landmark search in Thailand
 */

export interface AddressSearchResult {
  id: string;
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  type: string;
  category?: string;
  address?: {
    road?: string;
    suburb?: string;
    subdistrict?: string;
    district?: string;
    city?: string;
    state?: string; // Province in Thailand
    postcode?: string;
  };
}

class GeocodingService {
  private cache = new Map<string, AddressSearchResult[]>();
  private lastRequestTime = 0;
  private readonly MIN_INTERVAL_MS = 600; // Respect Nominatim rate limits

  /**
   * Search addresses, landmarks, roads, and places in Thailand
   */
  async searchAddresses(query: string): Promise<AddressSearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 2) return [];

    // Check in-memory cache
    if (this.cache.has(cleanQuery)) {
      return this.cache.get(cleanQuery)!;
    }

    // Rate limiting throttle
    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTime;
    if (timeSinceLast < this.MIN_INTERVAL_MS) {
      await new Promise((resolve) => setTimeout(resolve, this.MIN_INTERVAL_MS - timeSinceLast));
    }
    this.lastRequestTime = Date.now();

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        cleanQuery
      )}&format=json&countrycodes=th&addressdetails=1&limit=6&accept-language=th`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ThaiDisasterMap/1.0 (Emergency Public Service)',
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim error status: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) return [];

      const results: AddressSearchResult[] = data.map((item: any) => {
        const address = item.address || {};
        const state = address.state || address.province || '';
        const district = address.district || address.city || address.county || '';
        const subdistrict = address.subdistrict || address.suburb || '';
        const road = address.road || '';

        // Formulate a concise main title
        const primaryName = item.name || item.display_name.split(',')[0].trim();

        // Formulate a clean sub-label
        const parts = [road, subdistrict, district, state].filter(Boolean);
        const cleanSubtitle = parts.length > 0 ? parts.join(', ') : item.display_name;

        return {
          id: String(item.place_id || `${item.lat}-${item.lon}`),
          name: primaryName,
          displayName: cleanSubtitle,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          type: item.type || 'place',
          category: item.class || 'place',
          address: {
            road,
            subdistrict,
            district,
            state,
            postcode: address.postcode,
          },
        };
      });

      this.cache.set(cleanQuery, results);
      return results;
    } catch (err) {
      console.warn('Geocoding search failed:', err);
      return [];
    }
  }

  /**
   * Reverse geocode GPS coordinates to obtain a human-readable Thai address
   */
  async reverseGeocode(lat: number, lon: number): Promise<{
    displayName: string;
    subdistrict?: string;
    district?: string;
    province?: string;
  } | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=th`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ThaiDisasterMap/1.0 (Emergency Public Service)',
        },
      });

      if (!response.ok) return null;
      const data = await response.json();
      const addr = data.address || {};

      return {
        displayName: data.display_name || 'ตำแหน่งที่คุณเลือก',
        subdistrict: addr.subdistrict || addr.suburb,
        district: addr.district || addr.city || addr.county,
        province: addr.state || addr.province,
      };
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      return null;
    }
  }
}

export const geocodingService = new GeocodingService();
