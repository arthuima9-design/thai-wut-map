import { useState } from 'react';
import { useDisasters } from './hooks/useDisasters';
import type { DisasterType, DisasterEvent } from './types/disaster';
import type { LocationSearchResult } from './services/provinceService';
import type { ApiMode } from './services/api/realDisasterApi';

// Common components
import { Header } from './components/common/Header';
import { DemoBanner } from './components/common/DemoBanner';
import { Footer } from './components/common/Footer';
import { ErrorState } from './components/common/ErrorState';
import { EmptyState } from './components/common/EmptyState';
import { EmergencyHotlineModal } from './components/common/EmergencyHotlineModal';
import { BottomNav } from './components/common/BottomNav';
import type { MobileTab } from './components/common/BottomNav';

// Dashboard components
import { HeroSection, type AddressLocationSelection, type GPSLocationSelection } from './components/dashboard/HeroSection';
import { SituationSummary } from './components/dashboard/SituationSummary';
import { LatestEvents } from './components/dashboard/LatestEvents';
import { ProvinceMonitor } from './components/dashboard/ProvinceMonitor';
import { MyAreaWidget } from './components/dashboard/MyAreaWidget';
import { DisasterStatsChart } from './components/dashboard/DisasterStatsChart';

// Map & Disaster components
import { DisasterMap, type UserGPSLocation, type SearchPinLocation } from './components/map/DisasterMap';
import { MapLayerFilter } from './components/map/MapLayerFilter';
import { DisasterDetailPanel } from './components/disaster/DisasterDetailPanel';
import { DisasterTypeView } from './components/disaster/DisasterTypeView';
import { DataSourcesModal } from './components/sources/DataSourcesModal';
import { disasterService } from './services/disasterService';

export function App() {
  const {
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
    toggleLayer,
    selectAllLayers,
    clearAllLayers,
    searchQuery,
    setSearchQuery,
    focusedLocation,
    setFocusedLocation,
    refetch,
  } = useDisasters();

  // Navigation & Modal States
  const [mobileTab, setMobileTab] = useState<MobileTab>('home');
  const [activeTypeView, setActiveTypeView] = useState<DisasterType | null>(null);
  const [isHotlinesOpen, setIsHotlinesOpen] = useState<boolean>(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState<boolean>(false);
  const [isSimulatingError, setIsSimulatingError] = useState<boolean>(false);
  const [apiMode, setApiMode] = useState<ApiMode>('hybrid');

  // User GPS & Address Search Pin States
  const [userLocation, setUserLocation] = useState<UserGPSLocation | null>(null);
  const [searchPinLocation, setSearchPinLocation] = useState<SearchPinLocation | null>(null);

  // Handle Address / Landmark Search selection (Google Maps style)
  const handleSelectAddress = (selection: AddressLocationSelection) => {
    setSearchPinLocation({
      latitude: selection.center[0],
      longitude: selection.center[1],
      title: selection.title,
      subtitle: selection.subtitle,
    });
    setFocusedLocation({
      center: selection.center,
      zoom: 14,
    });
    if (selection.provinceName) {
      setSelectedProvinceName(selection.provinceName);
    }
  };

  // Handle GPS location selection from Hero search bar
  const handleSelectGPS = (gps: GPSLocationSelection) => {
    const loc: UserGPSLocation = {
      latitude: gps.center[0],
      longitude: gps.center[1],
      accuracy: gps.accuracy,
      addressName: gps.displayName,
      provinceName: gps.provinceName,
      districtName: gps.districtName,
    };
    setUserLocation(loc);
    setFocusedLocation({
      center: gps.center,
      zoom: 14,
    });
    if (gps.provinceName) {
      setSelectedProvinceName(gps.provinceName);
    }
  };

  // Handle GPS location found directly from DisasterMap component
  const handleUserLocationFound = (loc: UserGPSLocation) => {
    setUserLocation(loc);
    if (loc.provinceName) {
      setSelectedProvinceName(loc.provinceName);
    }
  };

  // Handle Event selection
  const handleSelectEvent = (event: DisasterEvent) => {
    if (!event) return;
    setSelectedEventId(event.id);
    if (
      typeof event.latitude === 'number' &&
      typeof event.longitude === 'number' &&
      !isNaN(event.latitude) &&
      !isNaN(event.longitude)
    ) {
      setFocusedLocation({
        center: [event.latitude, event.longitude],
        zoom: 12,
      });
    }
  };

  // Handle Location Search selection (Province or District)
  const handleSelectLocation = (result: LocationSearchResult) => {
    if (!result) return;
    if (result.province?.nameTh) {
      setSelectedProvinceName(result.province.nameTh);
    }
    if (
      result.center &&
      Array.isArray(result.center) &&
      typeof result.center[0] === 'number' &&
      typeof result.center[1] === 'number' &&
      !isNaN(result.center[0]) &&
      !isNaN(result.center[1])
    ) {
      setFocusedLocation({
        center: result.center,
        zoom: result.type === 'district' ? 12 : 9,
      });
    }
  };

  // Handle Situation Summary Metric click
  const handleSelectTypeMetric = (type: DisasterType) => {
    // If the user clicks on a metric card, filter to show only this disaster type on the map
    if (activeLayers.length === 1 && activeLayers[0] === type) {
      // If already isolated to this type, clicking again resets and shows all layers
      selectAllLayers();
    } else {
      // Isolate to this disaster type
      setActiveLayers([type]);
      // Also find the first active event of this type and focus the map on it
      const match = events.find(
        (e) =>
          e.type === type &&
          typeof e.latitude === 'number' &&
          typeof e.longitude === 'number' &&
          !isNaN(e.latitude) &&
          !isNaN(e.longitude)
      );
      if (match) {
        setFocusedLocation({
          center: [match.latitude, match.longitude],
          zoom: 9,
        });
      }
    }
  };

  // Toggle Error simulation for testing Requirement #25
  const handleToggleSimulateError = (simulate: boolean) => {
    setIsSimulatingError(simulate);
    disasterService.setSimulateError(simulate);
    refetch();
  };

  const handleResetSimulation = () => {
    setIsSimulatingError(false);
    disasterService.setSimulateError(false);
    refetch();
  };

  const handleRetry = () => {
    if (isSimulatingError) {
      handleResetSimulation();
    } else {
      refetch();
    }
  };

  const handleApiModeChange = (mode: ApiMode) => {
    setApiMode(mode);
    disasterService.setApiMode(mode);
    refetch();
  };

  const alertEventsCount = events.filter((e) => e.type === 'alert' || e.severity === 'danger').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. API MODE & STATUS BANNER (Requirement #27) */}
      <DemoBanner
        apiMode={apiMode}
        onChangeApiMode={handleApiModeChange}
        onOpenDataSources={() => setIsSourcesOpen(true)}
        onSimulateErrorToggle={handleToggleSimulateError}
        isSimulatingError={isSimulatingError}
      />

      {/* 2. HEADER (Requirement #3) */}
      <Header
        lastUpdatedTime={lastUpdatedTime}
        isRefreshing={loading}
        onRefresh={refetch}
        onOpenHotlines={() => setIsHotlinesOpen(true)}
        onOpenSources={() => setIsSourcesOpen(true)}
        activeDisasterCount={events.length}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 pb-20 md:pb-8">
        {/* If user opened a specific disaster type deep-dive page (Requirement #13) */}
        {activeTypeView ? (
          <DisasterTypeView
            type={activeTypeView}
            events={events}
            onBack={() => setActiveTypeView(null)}
            onSelectEvent={handleSelectEvent}
            onFocusMap={(center, zoom) => setFocusedLocation({ center, zoom })}
          />
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* 3. HERO & SEARCH (Requirement #4 & #11) */}
            <HeroSection
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectLocation={handleSelectLocation}
              onSelectAddress={handleSelectAddress}
              onSelectGPS={handleSelectGPS}
            />

            {/* 4. SITUATION SUMMARY CARDS (Requirement #5) */}
            <SituationSummary
              metrics={metrics}
              activeLayers={activeLayers}
              onSelectType={handleSelectTypeMetric}
              isLoading={loading}
            />

            {/* ERROR STATE (Requirement #25) */}
            {error && (
              <ErrorState
                message={error}
                lastCachedTime={lastUpdatedTime}
                onRetry={handleRetry}
                onResetSimulation={handleResetSimulation}
                isRetrying={loading}
              />
            )}

            {/* DESKTOP & TABLET MAIN DASHBOARD GRID (Requirement #23) */}
            <div className="hidden md:grid grid-cols-12 gap-4 lg:gap-5">
              {/* Left Column: Layers & My Area */}
              <div className="col-span-12 md:col-span-4 lg:col-span-3 space-y-4">
                <MapLayerFilter
                  activeLayers={activeLayers}
                  onToggleLayer={toggleLayer}
                  onSelectAll={selectAllLayers}
                  onClearAll={clearAllLayers}
                />
                <MyAreaWidget
                  events={events}
                  onSelectEvent={handleSelectEvent}
                  onFocusMap={(center, zoom) => setFocusedLocation({ center, zoom })}
                />
                <DisasterStatsChart events={events} />
              </div>

              {/* Center Column: Interactive Thailand Map (Requirement #6) */}
              <div className="col-span-12 md:col-span-8 lg:col-span-6 flex flex-col min-h-[500px] lg:min-h-[580px]">
                {filteredEvents.length === 0 && !loading && (
                  <EmptyState
                    title="🟢 ไม่พบเหตุการณ์ภัยพิบัติในชั้นข้อมูลที่เลือก"
                    onResetFilter={selectAllLayers}
                  />
                )}
                <div className="flex-1 w-full h-full">
                  <DisasterMap
                    events={filteredEvents}
                    selectedEventId={selectedEventId}
                    onSelectEvent={handleSelectEvent}
                    focusedLocation={focusedLocation}
                    userLocation={userLocation}
                    searchPinLocation={searchPinLocation}
                    onUserLocationFound={handleUserLocationFound}
                  />
                </div>
              </div>

              {/* Right Column: Latest Events Feed (Requirement #9) */}
              <div className="col-span-12 lg:col-span-3">
                <LatestEvents
                  events={filteredEvents}
                  selectedEventId={selectedEventId}
                  onSelectEvent={handleSelectEvent}
                  isLoading={loading}
                />
              </div>
            </div>

            {/* MOBILE LAYOUT BASED ON BOTTOM TABS (Requirement #22) */}
            <div className="md:hidden space-y-4">
              {mobileTab === 'home' && (
                <>
                  <div className="h-[360px] w-full">
                    <DisasterMap
                      events={filteredEvents}
                      selectedEventId={selectedEventId}
                      onSelectEvent={handleSelectEvent}
                      focusedLocation={focusedLocation}
                      userLocation={userLocation}
                      searchPinLocation={searchPinLocation}
                      onUserLocationFound={handleUserLocationFound}
                    />
                  </div>
                  <MapLayerFilter
                    activeLayers={activeLayers}
                    onToggleLayer={toggleLayer}
                    onSelectAll={selectAllLayers}
                    onClearAll={clearAllLayers}
                  />
                  <LatestEvents
                    events={filteredEvents}
                    selectedEventId={selectedEventId}
                    onSelectEvent={handleSelectEvent}
                    isLoading={loading}
                  />
                  <MyAreaWidget
                    events={events}
                    onSelectEvent={handleSelectEvent}
                    onFocusMap={(center, zoom) => setFocusedLocation({ center, zoom })}
                  />
                </>
              )}

              {mobileTab === 'map' && (
                <div className="space-y-3">
                  <div className="h-[70vh] w-full">
                    <DisasterMap
                      events={filteredEvents}
                      selectedEventId={selectedEventId}
                      onSelectEvent={handleSelectEvent}
                      focusedLocation={focusedLocation}
                      userLocation={userLocation}
                      searchPinLocation={searchPinLocation}
                      onUserLocationFound={handleUserLocationFound}
                    />
                  </div>
                  <MapLayerFilter
                    activeLayers={activeLayers}
                    onToggleLayer={toggleLayer}
                    onSelectAll={selectAllLayers}
                    onClearAll={clearAllLayers}
                  />
                </div>
              )}

              {mobileTab === 'alerts' && (
                <div className="space-y-4">
                  <LatestEvents
                    events={filteredEvents}
                    selectedEventId={selectedEventId}
                    onSelectEvent={handleSelectEvent}
                    isLoading={loading}
                  />
                  <DisasterStatsChart events={events} />
                </div>
              )}

              {mobileTab === 'myarea' && (
                <div className="space-y-4">
                  <MyAreaWidget
                    events={events}
                    onSelectEvent={handleSelectEvent}
                    onFocusMap={(center, zoom) => {
                      setMobileTab('map');
                      setFocusedLocation({ center, zoom });
                    }}
                  />
                  <ProvinceMonitor
                    selectedProvinceName={selectedProvinceName}
                    provinceRisk={provinceRisk}
                    onSelectProvince={setSelectedProvinceName}
                    onSelectEvent={handleSelectEvent}
                    onFocusMap={(center, zoom) => {
                      setMobileTab('map');
                      setFocusedLocation({ center, zoom });
                    }}
                  />
                </div>
              )}
            </div>

            {/* 5. PROVINCE MONITORING SECTION (Requirement #10) */}
            <div className="pt-2">
              <ProvinceMonitor
                selectedProvinceName={selectedProvinceName}
                provinceRisk={provinceRisk}
                onSelectProvince={setSelectedProvinceName}
                onSelectEvent={handleSelectEvent}
                onFocusMap={(center, zoom) => setFocusedLocation({ center, zoom })}
              />
            </div>
          </div>
        )}
      </main>

      {/* 6. DISASTER DETAIL SIDE PANEL / DRAWER (Requirement #8) */}
      <DisasterDetailPanel
        event={selectedEvent}
        onClose={() => setSelectedEventId(null)}
        onOpenHotlines={() => setIsHotlinesOpen(true)}
      />

      {/* 7. EMERGENCY HOTLINES MODAL */}
      <EmergencyHotlineModal
        isOpen={isHotlinesOpen}
        onClose={() => setIsHotlinesOpen(false)}
      />

      {/* 8. DATA SOURCES MODAL (Requirement #14) */}
      <DataSourcesModal
        isOpen={isSourcesOpen}
        onClose={() => setIsSourcesOpen(false)}
      />

      {/* 9. MOBILE BOTTOM NAVIGATION (Requirement #22) */}
      <BottomNav
        currentTab={mobileTab}
        onTabChange={setMobileTab}
        alertCount={alertEventsCount}
      />

      {/* 10. FOOTER WITH MANDATORY EMERGENCY DISCLAIMER (Requirement #21) */}
      <Footer
        onOpenHotlines={() => setIsHotlinesOpen(true)}
        onOpenSources={() => setIsSourcesOpen(true)}
      />
    </div>
  );
}

export default App;
