import { useState, useEffect, useCallback, useMemo } from 'react';
import type { DisasterEvent, DisasterType, SituationMetric, ProvinceRiskSummary } from '../types/disaster';
import { disasterService } from '../services/disasterService';

export const ALL_DISASTER_TYPES: DisasterType[] = [
  'flood',
  'heavy_rain',
  'storm',
  'earthquake',
  'landslide',
  'wildfire',
  'alert',
  'strong_wind',
  'thunderstorm',
];

export function useDisasters() {
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [metrics, setMetrics] = useState<SituationMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('08:30 น.');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>('กาญจนบุรี');
  const [provinceRisk, setProvinceRisk] = useState<ProvinceRiskSummary | null>(null);
  const [activeLayers, setActiveLayers] = useState<DisasterType[]>([
    'flood',
    'heavy_rain',
    'storm',
    'earthquake',
    'landslide',
    'wildfire',
    'alert',
  ]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [focusedLocation, setFocusedLocation] = useState<{ center: [number, number]; zoom: number } | null>(null);

  const fetchAllData = useCallback(async (isRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const [disasters, summaryMetrics] = await Promise.all([
        disasterService.getDisasters(undefined, isRefresh),
        disasterService.getMetrics(),
      ]);

      setEvents(disasters);
      setMetrics(summaryMetrics);

      const d = new Date();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      setLastUpdatedTime(`${hours}:${mins} น.`);
    } catch (err: any) {
      console.error('Failed to load disaster data:', err);
      setError(err?.message || 'ไม่สามารถโหลดข้อมูลล่าสุดได้');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch province risk when province changes
  const fetchProvinceDetails = useCallback(async (provinceName: string) => {
    try {
      const summary = await disasterService.getProvinceRisk(provinceName);
      setProvinceRisk(summary);
    } catch (err) {
      console.error('Failed to load province risk:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (selectedProvinceName) {
      fetchProvinceDetails(selectedProvinceName);
    }
  }, [selectedProvinceName, fetchProvinceDetails]);

  // Layer toggle handler
  const toggleLayer = useCallback((type: DisasterType) => {
    setActiveLayers((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const selectAllLayers = useCallback(() => {
    setActiveLayers(ALL_DISASTER_TYPES);
  }, []);

  const clearAllLayers = useCallback(() => {
    setActiveLayers([]);
  }, []);

  // Filtered events based on layer toggle and search
  const filteredEvents = useMemo(() => {
    let result = events.filter((evt) => activeLayers.includes(evt.type));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (evt) =>
          evt.province.toLowerCase().includes(q) ||
          evt.district.toLowerCase().includes(q) ||
          evt.title.toLowerCase().includes(q)
      );
    }
    return result;
  }, [events, activeLayers, searchQuery]);

  // Selected event object
  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return events.find((e) => e.id === selectedEventId) || null;
  }, [events, selectedEventId]);

  const filterByType = useCallback((type: DisasterType) => {
    setActiveLayers([type]);
  }, []);

  return {
    events,
    filteredEvents,
    metrics,
    loading,
    error,
    lastUpdatedTime,
    selectedEvent,
    selectedEventId,
    setSelectedEventId,
    selectedProvinceName,
    setSelectedProvinceName,
    provinceRisk,
    activeLayers,
    setActiveLayers,
    filterByType,
    toggleLayer,
    selectAllLayers,
    clearAllLayers,
    searchQuery,
    setSearchQuery,
    focusedLocation,
    setFocusedLocation,
    refetch: () => fetchAllData(true),
  };
}
