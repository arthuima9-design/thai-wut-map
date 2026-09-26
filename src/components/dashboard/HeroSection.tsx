import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, ArrowRight, Navigation, Loader2, Building, AlertCircle } from 'lucide-react';
import { provinceService } from '../../services/provinceService';
import type { LocationSearchResult } from '../../services/provinceService';
import { geocodingService, type AddressSearchResult } from '../../services/geocodingService';
import { geolocationService } from '../../services/geolocationService';

export interface AddressLocationSelection {
  title: string;
  subtitle: string;
  center: [number, number];
  provinceName?: string;
  districtName?: string;
}

export interface GPSLocationSelection {
  center: [number, number];
  accuracy?: number;
  displayName: string;
  provinceName?: string;
  districtName?: string;
}

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectLocation: (result: LocationSearchResult) => void;
  onSelectAddress?: (result: AddressLocationSelection) => void;
  onSelectGPS?: (result: GPSLocationSelection) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSelectLocation,
  onSelectAddress,
  onSelectGPS,
}) => {
  const [provinceResults, setProvinceResults] = useState<LocationSearchResult[]>([]);
  const [addressResults, setAddressResults] = useState<AddressSearchResult[]>([]);
  const [isSearchingAddresses, setIsSearchingAddresses] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search local provinces/districts & remote places (Google Maps style)
  useEffect(() => {
    const trimmed = searchQuery.trim();

    if (trimmed.length >= 2) {
      // 1. Instant local search
      const localMatches = provinceService.searchLocations(trimmed);
      setProvinceResults(localMatches);
      setIsOpen(true);

      // 2. Debounced OSM Nominatim place/address search
      if (addressDebounceRef.current) {
        clearTimeout(addressDebounceRef.current);
      }

      setIsSearchingAddresses(true);
      addressDebounceRef.current = setTimeout(async () => {
        try {
          const places = await geocodingService.searchAddresses(trimmed);
          setAddressResults(places);
        } catch {
          setAddressResults([]);
        } finally {
          setIsSearchingAddresses(false);
        }
      }, 350);
    } else {
      setProvinceResults([]);
      setAddressResults([]);
      setIsOpen(false);
      setIsSearchingAddresses(false);
    }

    return () => {
      if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    };
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocal = (item: LocationSearchResult) => {
    onSelectLocation(item);
    setIsOpen(false);
  };

  const handleSelectPlace = (place: AddressSearchResult) => {
    if (onSelectAddress) {
      // Resolve nearest province if available
      const nearest = provinceService.findNearestProvince(place.lat, place.lon);
      onSelectAddress({
        title: place.name,
        subtitle: place.displayName,
        center: [place.lat, place.lon],
        provinceName: place.address?.state || nearest?.nameTh,
        districtName: place.address?.district,
      });
    }
    onSearchChange(place.name);
    setIsOpen(false);
  };

  const handleQuickTag = (provinceName: string) => {
    onSearchChange(provinceName);
    const prov = provinceService.getProvinceByName(provinceName);
    if (prov) {
      onSelectLocation({
        type: 'province',
        province: prov,
        matchedName: `จ.${prov.nameTh}`,
        center: prov.center,
      });
    }
  };

  // Device GPS Geolocation
  const handleLocateMe = async () => {
    setIsLocatingGPS(true);
    setGpsError(null);

    try {
      const pos = await geolocationService.getCurrentPosition();
      const nearestProv = provinceService.findNearestProvince(pos.latitude, pos.longitude);
      
      // Try reverse geocoding to get full address description
      const addr = await geocodingService.reverseGeocode(pos.latitude, pos.longitude);
      
      const provinceName = addr?.province || nearestProv?.nameTh || 'ประเทศไทย';
      const districtName = addr?.district;
      const displayLabel = addr?.displayName
        ? `📍 ตำแหน่งของฉัน (${addr.displayName.split(',')[0].trim()})`
        : `📍 ตำแหน่งของฉัน (จ.${provinceName})`;

      onSearchChange(displayLabel);

      if (onSelectGPS) {
        onSelectGPS({
          center: [pos.latitude, pos.longitude],
          accuracy: pos.accuracy,
          displayName: displayLabel,
          provinceName,
          districtName,
        });
      }
      setIsOpen(false);
    } catch (err: any) {
      console.warn('GPS location error:', err);
      setGpsError(err.message || 'ไม่สามารถดึงตำแหน่ง GPS ได้');
      setTimeout(() => setGpsError(null), 5000);
    } finally {
      setIsLocatingGPS(false);
    }
  };

  const totalResults = provinceResults.length + addressResults.length;

  return (
    <div className="relative pt-3 pb-4 sm:pt-6 sm:pb-6 text-center">
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-2xl h-32 bg-sky-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Main Titles */}
      <div className="relative z-10 max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold mb-2.5 border border-sky-200 shadow-xs">
          <span>🗺️</span>
          <span>Thai Wut Map &bull; แผนที่ติดตามภัยธรรมชาติประเทศไทย</span>
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-2 sm:mb-3">
          ติดตามภัยธรรมชาติในประเทศไทย
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-normal">
          ศูนย์รวมข้อมูลติดตามสถานการณ์ภัยพิบัติ พิกัด GPS ค้นหาที่อยู่ และภาพถ่ายดาวเทียมแบบเรียลไทม์
        </p>

        {/* Search Box */}
        <div ref={containerRef} className="relative mt-4 sm:mt-5 max-w-2xl mx-auto">
          <div className="relative flex items-center shadow-md rounded-2xl overflow-hidden border border-slate-300 bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
            <Search className="w-5 h-5 text-slate-400 ml-4 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => {
                if (totalResults > 0) setIsOpen(true);
              }}
              placeholder="พิมพ์ค้นหาที่อยู่, สถานที่, ถนน, อำเภอ, จังหวัด..."
              className="w-full py-3.5 px-3 bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={() => {
                  onSearchChange('');
                  setIsOpen(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 mr-1"
                title="ล้างข้อความ"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* GPS Quick Action Button inside Search Input */}
            <button
              onClick={handleLocateMe}
              disabled={isLocatingGPS}
              className="flex items-center gap-1.5 px-3 py-2 mr-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold border border-sky-200 shadow-xs transition-all active:scale-95 disabled:opacity-60 flex-shrink-0"
              title="ค้นหาตำแหน่ง GPS ปัจจุบันของฉันบนอุปกรณ์"
            >
              {isLocatingGPS ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                  <span className="hidden sm:inline">กำลังระบุ GPS...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-sky-600" />
                  <span className="hidden sm:inline">GPS ของฉัน</span>
                </>
              )}
            </button>
          </div>

          {/* GPS Error Notification if permission denied or unavailable */}
          {gpsError && (
            <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between gap-2 shadow-xs text-left animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{gpsError}</span>
              </div>
              <button onClick={() => setGpsError(null)} className="p-1 hover:text-rose-900">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Autocomplete Dropdown (Google Maps style places + Administrative areas) */}
          {isOpen && (totalResults > 0 || isSearchingAddresses) && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-left animate-in fade-in duration-150 max-h-80 overflow-y-auto divide-y divide-slate-100">
              
              {/* Category 1: Places & Addresses (OpenStreetMap Geocoding) */}
              {addressResults.length > 0 && (
                <div>
                  <div className="px-3.5 py-1.5 text-[11px] font-bold text-sky-800 bg-sky-50/70 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-sky-600" />
                      <span>สถานที่ & ที่อยู่ ({addressResults.length})</span>
                    </span>
                    <span className="text-[10px] text-sky-600 font-normal">คล้าย Google Maps</span>
                  </div>
                  <ul className="divide-y divide-slate-50">
                    {addressResults.map((place) => (
                      <li key={place.id}>
                        <button
                          onClick={() => handleSelectPlace(place)}
                          className="w-full px-4 py-2.5 flex items-start justify-between text-left text-xs sm:text-sm text-slate-700 hover:bg-sky-50/80 hover:text-sky-800 transition-colors group"
                        >
                          <div className="flex items-start gap-2.5 min-w-0 pr-2">
                            <MapPin className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 group-hover:text-sky-700 truncate">
                                {place.name}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                {place.displayName}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 flex-shrink-0 mt-1" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Loading Indicator for Remote Addresses */}
              {isSearchingAddresses && addressResults.length === 0 && (
                <div className="px-4 py-2 text-xs text-slate-500 flex items-center gap-2 bg-slate-50/60">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                  <span>กำลังค้นหาสถานที่และที่อยู่...</span>
                </div>
              )}

              {/* Category 2: Administrative Provinces & Districts */}
              {provinceResults.length > 0 && (
                <div>
                  <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>จังหวัด / อำเภอ ({provinceResults.length})</span>
                  </div>
                  <ul className="divide-y divide-slate-50">
                    {provinceResults.map((item, idx) => (
                      <li key={idx}>
                        <button
                          onClick={() => handleSelectLocal(item)}
                          className="w-full px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm text-slate-700 hover:bg-slate-50 hover:text-sky-700 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                            <span className="font-medium text-slate-900">{item.matchedName}</span>
                            {item.type === 'district' && (
                              <span className="text-[11px] text-slate-500">({item.province.nameEn})</span>
                            )}
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Quick suggestions & GPS button below */}
          <div className="flex items-center justify-center flex-wrap gap-1.5 mt-3 text-xs text-slate-500">
            {/* GPS Mobile quick tap button */}
            <button
              onClick={handleLocateMe}
              className="inline-flex sm:hidden items-center gap-1 px-3 py-1 rounded-full bg-sky-100/80 text-sky-800 font-semibold border border-sky-300 text-[11px]"
            >
              <Navigation className="w-3 h-3 text-sky-700" />
              <span>ตำแหน่ง GPS ของฉัน</span>
            </button>

            <span className="text-[11px] text-slate-600">พื้นที่ยอดนิยม:</span>
            {['กาญจนบุรี', 'พระนครศรีอยุธยา', 'เชียงใหม่', 'อุบลราชธานี', 'นครนายก', 'ภูเก็ต'].map((prov) => (
              <button
                key={prov}
                onClick={() => handleQuickTag(prov)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs text-[11px] transition-all font-medium"
              >
                {prov}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
