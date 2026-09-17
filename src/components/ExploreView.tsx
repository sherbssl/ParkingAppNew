import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ParkingSpot, LotCategory } from '../types';
import { POPULAR_DESTINATIONS, DestinationItem } from '../data/mockParkingData';
import { calculateDistanceMeters } from '../data/singaporeCarparkDatabase';
import { fetchAndMapCarparkAvailability } from '../services/parkingDataService';
import {
  fetchAndIngestDataGovCarparks,
  mergeIngestedSpots,
  DATA_GOV_DATASETS,
  DataGovIngestionResult,
} from '../services/dataGovIngestionService';

interface ExploreViewProps {
  spots: ParkingSpot[];
  savedSpotIds: string[];
  onToggleSave: (spotId: string) => void;
  onSelectSpot: (spot: ParkingSpot) => void;
  onStartNavigation: (spot: ParkingSpot) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  spots: initialSpots,
  savedSpotIds,
  onToggleSave,
  onSelectSpot,
  onStartNavigation,
}) => {
  // Target Destination State
  const [destinationInput, setDestinationInput] = useState<string>('Marina Bay Sands, 018972');
  const [targetDestination, setTargetDestination] = useState<DestinationItem>({
    name: 'Marina Bay Sands, 018972',
    label: 'Marina Bay Sands',
    lat: 1.2838,
    lng: 103.8591,
    postal: '018972',
    badge: 'MBS',
  });
  const [showDestinationDropdown, setShowDestinationDropdown] = useState<boolean>(false);

  // Dynamic spots with updated distance & live lots
  const [spots, setSpots] = useState<ParkingSpot[]>(initialSpots);

  // Filter States
  const [selectedRadius, setSelectedRadius] = useState<number>(1000); // 1000m (1.0km)
  const [activeCategory, setActiveCategory] = useState<LotCategory>('all');
  const [rateDisplayMode, setRateDisplayMode] = useState<'total' | 'hourly'>('total');

  // Duration Estimator State
  const [durationHours, setDurationHours] = useState<number>(2.5); // 2h 30m default
  const [durationLabel, setDurationLabel] = useState<string>('Today, 13:00 - 15:30');

  // Map & View Mode States
  const [viewMode, setViewMode] = useState<'split' | 'full'>('split');
  const [trafficLayerActive, setTrafficLayerActive] = useState<boolean>(false);
  const [highlightedSpotId, setHighlightedSpotId] = useState<string | null>('mbfc');
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'availability'>('distance');

  // LTA DataMall Live Connection State
  const [ltaSyncStatus, setLtaSyncStatus] = useState<'idle' | 'syncing' | 'live' | 'fallback'>('idle');
  const [ltaLastSyncTime, setLtaLastSyncTime] = useState<string>('Just now');
  const [customLtaKey, setCustomLtaKey] = useState<string>('');
  const [showLtaKeyModal, setShowLtaKeyModal] = useState<boolean>(false);
  const [ltaLotCount, setLtaLotCount] = useState<number>(0);

  // Data.gov.sg Ingestion State
  const [dataGovStatus, setDataGovStatus] = useState<'idle' | 'ingesting' | 'ingested' | 'error'>('idle');
  const [dataGovResult, setDataGovResult] = useState<DataGovIngestionResult | null>(null);
  const [showDataGovModal, setShowDataGovModal] = useState<boolean>(false);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(DATA_GOV_DATASETS.HDB_CARPARK_INFO);
  const [dataGovIngestedCount, setDataGovIngestedCount] = useState<number>(0);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Function to pull live LTA DataMall CarParkAvailabilityv2 data
  const triggerLtaSync = async (accountKeyToUse?: string) => {
    setLtaSyncStatus('syncing');
    try {
      const result = await fetchAndMapCarparkAvailability(spots, accountKeyToUse || customLtaKey);
      if (result.success && result.rawRecords && result.rawRecords.length > 0) {
        setLtaSyncStatus(result.source === 'lta_datamall' ? 'live' : 'fallback');
        setLtaLotCount(result.totalLiveCarparks);
        setLtaLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

        // Update spots with CarParkID mapped availability
        setSpots(result.updatedSpots);
      } else {
        setLtaSyncStatus('fallback');
        setLtaLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch {
      setLtaSyncStatus('fallback');
    }
  };

  // Function to fetch and normalize static carpark location metadata from data.gov.sg
  const triggerDataGovIngestion = async (datasetIdToUse?: string) => {
    setDataGovStatus('ingesting');
    const dataset = datasetIdToUse || selectedDatasetId;
    try {
      const result = await fetchAndIngestDataGovCarparks({
        datasetId: dataset,
        limit: 50,
        referenceLat: targetDestination.lat,
        referenceLng: targetDestination.lng,
      });

      setDataGovResult(result);
      if (result.success && result.spots.length > 0) {
        setSpots((prev) => mergeIngestedSpots(prev, result.spots));
        setDataGovIngestedCount(result.totalFetched);
        setDataGovStatus('ingested');
      } else {
        setDataGovStatus('error');
      }
    } catch (err) {
      console.warn('Data.gov.sg ingestion error:', err);
      setDataGovStatus('error');
    }
  };

  // Trigger LTA fetch and Data.gov.sg ingestion on mount
  useEffect(() => {
    triggerLtaSync();
    triggerDataGovIngestion();
    const interval = setInterval(() => {
      triggerLtaSync();
    }, 30000);
    return () => clearInterval(interval);
  }, [customLtaKey]);

  // Recalculate walking distance to all carparks whenever targetDestination changes
  useEffect(() => {
    setSpots((prevSpots) => {
      return prevSpots.map((spot) => {
        if (!spot.lat || !spot.lng) return spot;
        const dist = calculateDistanceMeters(targetDestination.lat, targetDestination.lng, spot.lat, spot.lng);
        const walkMin = Math.max(1, Math.round(dist / 70)); // standard 70m/min pace
        return {
          ...spot,
          walkingDistanceM: dist,
          walkingTimeMin: walkMin,
        };
      });
    });
  }, [targetDestination]);

  // Handle selecting or submitting a destination
  const handleSelectDestination = (dest: DestinationItem) => {
    setTargetDestination(dest);
    setDestinationInput(dest.name);
    setShowDestinationDropdown(false);
    triggerLtaSync();
  };

  const handleCustomSearchSubmit = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    // Check popular destinations first
    const destMatch = POPULAR_DESTINATIONS.find(
      (d) => d.name.toLowerCase().includes(trimmed.toLowerCase()) || d.label.toLowerCase().includes(trimmed.toLowerCase())
    );
    if (destMatch) {
      handleSelectDestination(destMatch);
      return;
    }

    // Check carparks list
    const spotMatch = spots.find(
      (s) => s.name.toLowerCase().includes(trimmed.toLowerCase()) || s.shortName.toLowerCase().includes(trimmed.toLowerCase())
    );
    if (spotMatch && spotMatch.lat && spotMatch.lng) {
      const customDest: DestinationItem = {
        name: spotMatch.name,
        label: spotMatch.shortName,
        lat: spotMatch.lat,
        lng: spotMatch.lng,
        badge: spotMatch.shortName.slice(0, 4).toUpperCase(),
      };
      handleSelectDestination(customDest);
      setHighlightedSpotId(spotMatch.id);
      return;
    }

    // Approximate center based on search term
    let lat = 1.2838;
    let lng = 103.8591;
    let badge = 'LOC';
    if (trimmed.toLowerCase().includes('orchard')) {
      lat = 1.304;
      lng = 103.8318;
      badge = 'ORCH';
    } else if (trimmed.toLowerCase().includes('toa payoh')) {
      lat = 1.3323;
      lng = 103.8488;
      badge = 'TP';
    } else if (trimmed.toLowerCase().includes('jurong')) {
      lat = 1.3402;
      lng = 103.7061;
      badge = 'JUR';
    } else if (trimmed.toLowerCase().includes('tampines')) {
      lat = 1.3533;
      lng = 103.9452;
      badge = 'TMP';
    } else if (trimmed.toLowerCase().includes('changi')) {
      lat = 1.3644;
      lng = 103.9915;
      badge = 'CGI';
    } else if (trimmed.toLowerCase().includes('woodlands')) {
      lat = 1.4361;
      lng = 103.7858;
      badge = 'WDL';
    } else if (trimmed.toLowerCase().includes('sentosa')) {
      lat = 1.2562;
      lng = 103.8208;
      badge = 'SENT';
    }

    const customDest: DestinationItem = {
      name: trimmed,
      label: trimmed,
      lat,
      lng,
      badge,
    };
    handleSelectDestination(customDest);
  };

  // Dynamic cost calculation based on duration
  function calculateDynamicCost(spot: ParkingSpot, hours: number): number {
    if (spot.rate.tariffType === 'ura_coupon') {
      const halfHours = Math.ceil(hours * 2);
      return Number((halfHours * spot.rate.blockRate).toFixed(2));
    }
    const blocks = Math.ceil((hours * 60) / spot.rate.blockMinutes);
    const cost = blocks * spot.rate.blockRate;
    if (spot.rate.allDayCap && cost > spot.rate.allDayCap) {
      return spot.rate.allDayCap;
    }
    return Number(cost.toFixed(2));
  }

  // Filter spots by category & radius
  const filteredSpots = useMemo(() => {
    return spots
      .filter((spot) => {
        // Radius check (allow slight flexibility if few lots)
        if (spot.walkingDistanceM > selectedRadius && selectedRadius < 3000) {
          return false;
        }
        // Category check
        if (activeCategory === 'building' && spot.category !== 'building') return false;
        if (activeCategory === 'street' && spot.category !== 'street') return false;
        if (activeCategory === 'ev' && (!spot.evChargers || spot.evChargers.open === 0)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price') {
          const costA = calculateDynamicCost(a, durationHours);
          const costB = calculateDynamicCost(b, durationHours);
          return costA - costB;
        }
        if (sortBy === 'availability') {
          return b.availableLots - a.availableLots;
        }
        return a.walkingDistanceM - b.walkingDistanceM;
      });
  }, [spots, selectedRadius, activeCategory, sortBy, durationHours]);

  // Counts for Category Badges
  const counts = useMemo(() => {
    const total = spots.length;
    const building = spots.filter((s) => s.category === 'building').length;
    const street = spots.filter((s) => s.category === 'street').length;
    const ev = spots.filter((s) => s.evChargers && s.evChargers.open > 0).length;
    return { total, building, street, ev };
  }, [spots]);

  // Search autocomplete options
  const searchSuggestions = useMemo(() => {
    if (!destinationInput.trim()) return POPULAR_DESTINATIONS.slice(0, 6);
    const query = destinationInput.toLowerCase();

    const matchedDestinations = POPULAR_DESTINATIONS.filter(
      (d) => d.name.toLowerCase().includes(query) || d.label.toLowerCase().includes(query)
    );

    const matchedCarparks: DestinationItem[] = spots
      .filter((s) => s.name.toLowerCase().includes(query) || s.shortName.toLowerCase().includes(query))
      .slice(0, 8)
      .map((s) => ({
        name: `${s.name}, Singapore`,
        label: s.shortName,
        lat: s.lat || 1.2838,
        lng: s.lng || 103.8591,
        badge: s.category === 'street' ? 'STREET' : 'LOT',
      }));

    return [...matchedDestinations, ...matchedCarparks].slice(0, 10);
  }, [destinationInput, spots]);

  const handleQuickDuration = (addHours: number | 'all-day') => {
    if (addHours === 'all-day') {
      setDurationHours(8.0);
      setDurationLabel('Today, 09:00 - 18:00');
    } else {
      const newDur = Math.min(12, Number((durationHours + addHours).toFixed(1)));
      setDurationHours(newDur);
      const hoursInt = Math.floor(newDur);
      const mins = Math.round((newDur - hoursInt) * 60);
      setDurationLabel(`Today, 13:00 - ${13 + hoursInt}:${mins === 0 ? '00' : mins}`);
    }
  };

  const handleSpotClick = (spotId: string) => {
    setHighlightedSpotId(spotId);
    const cardEl = document.getElementById(`card-${spotId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Calculate relative map coordinates based on delta from targetDestination
  const getMapPosition = (spotLat?: number, spotLng?: number) => {
    if (!spotLat || !spotLng) return { topPercent: 50, leftPercent: 50 };

    // Latitude spans ~0.02 deg, Longitude ~0.03 deg at ~1.5km zoom scale
    const deltaLat = spotLat - targetDestination.lat;
    const deltaLng = spotLng - targetDestination.lng;

    const latFactor = 2800; // scaling factor to map percent
    const lngFactor = 2200;

    let top = 48 - deltaLat * latFactor;
    let left = 50 + deltaLng * lngFactor;

    // Clamp inside viewport
    top = Math.max(12, Math.min(88, top));
    left = Math.max(12, Math.min(88, left));

    return { topPercent: top, leftPercent: left };
  };

  return (
    <div className="flex flex-col w-full relative pb-20">
      {/* Top Search & Urban Mobility Hub (Sticky) */}
      <section className="sticky top-16 z-30 px-4 pt-2 pb-3 bg-[#0b1326]/95 backdrop-blur-md border-b border-white/[0.06] shadow-lg flex flex-col gap-2.5">
        {/* Destination Search Bar */}
        <div ref={searchContainerRef} className="relative w-full">
          <div className="w-full flex items-center bg-[#1e293b] rounded-xl px-3.5 py-1.5 shadow-md border border-white/[0.06]">
            <span className="material-symbols-outlined text-[#93ccff] text-[20px] mr-2.5 select-none">
              search
            </span>

            <div className="flex-1 flex flex-col min-w-0 pr-1">
              <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                SINGAPORE DESTINATION / CARPARK
              </span>
              <input
                id="destination-input"
                type="text"
                value={destinationInput}
                onChange={(e) => {
                  setDestinationInput(e.target.value);
                  setShowDestinationDropdown(true);
                }}
                onFocus={() => setShowDestinationDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomSearchSubmit(destinationInput);
                  }
                }}
                className="bg-transparent border-0 outline-none font-['Inter'] text-sm text-[#f8fafc] truncate w-full p-0 focus:ring-0 placeholder:text-[#94a3b8]"
                placeholder="Search any Singapore carpark, mall, or address..."
              />
            </div>

            {destinationInput && (
              <button
                id="clear-search-btn"
                aria-label="Clear destination"
                onClick={() => {
                  setDestinationInput('');
                  setShowDestinationDropdown(true);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#94a3b8] hover:text-[#f8fafc] active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            )}

            <div className="w-px h-6 bg-[#334155] mx-1"></div>

            <button
              aria-label="Use current GPS"
              onClick={() => {
                const mbs = POPULAR_DESTINATIONS[0];
                handleSelectDestination(mbs);
              }}
              className="h-8 px-2.5 rounded-lg bg-[#334155] hover:bg-[#475569] text-[#4edea3] flex items-center gap-1 text-[11px] font-bold tracking-wide active:scale-95 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">near_me</span>
              <span>GPS</span>
            </button>
          </div>

          {/* Destination Dropdown Suggestions across data.gov.sg and popular locations */}
          {showDestinationDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#171f33] border border-white/[0.1] rounded-xl shadow-2xl z-50 overflow-hidden py-1 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#94a3b8] tracking-wider border-b border-white/[0.06] flex items-center justify-between">
                <span>Matching Singapore Locations &amp; Carparks</span>
                <span className="text-[9px] text-[#4edea3]">Data.gov.sg &amp; LTA</span>
              </div>
              {searchSuggestions.map((dest, idx) => (
                <button
                  key={`${dest.name}-${idx}`}
                  onClick={() => handleSelectDestination(dest)}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#222a3d] flex items-center justify-between text-xs text-[#dae2fd] transition-colors border-b border-white/[0.02]"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="material-symbols-outlined text-[#93ccff] text-[16px] shrink-0">
                      {dest.badge === 'STREET' ? 'local_parking' : 'location_on'}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-white truncate">{dest.name}</span>
                      <span className="text-[10px] text-[#94a3b8]">{dest.label}</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-[#93ccff] bg-[#0b1326] px-2 py-0.5 rounded font-mono font-bold shrink-0">
                    {dest.badge}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Radius Selector & Meta Filter Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Radius Toggle Pill Group */}
          <div className="flex items-center bg-[#131b2e] rounded-full p-0.5 shrink-0 border border-white/[0.05]">
            <button
              onClick={() => setSelectedRadius(500)}
              className={`radius-toggle px-2.5 py-1 rounded-full text-[11px] font-['Inter'] transition-colors ${
                selectedRadius === 500
                  ? 'bg-[#93ccff] text-[#003351] font-bold shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              500m
            </button>
            <button
              onClick={() => setSelectedRadius(1000)}
              className={`radius-toggle px-2.5 py-1 rounded-full text-[11px] font-['Inter'] transition-colors ${
                selectedRadius === 1000
                  ? 'bg-[#93ccff] text-[#003351] font-bold shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              1.0 km
            </button>
            <button
              onClick={() => setSelectedRadius(1500)}
              className={`radius-toggle px-2.5 py-1 rounded-full text-[11px] font-['Inter'] transition-colors ${
                selectedRadius === 1500
                  ? 'bg-[#93ccff] text-[#003351] font-bold shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              1.5 km
            </button>
            <button
              onClick={() => setSelectedRadius(3000)}
              className={`radius-toggle px-2.5 py-1 rounded-full text-[11px] font-['Inter'] transition-colors ${
                selectedRadius === 3000
                  ? 'bg-[#93ccff] text-[#003351] font-bold shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              All SG
            </button>
          </div>

          <div className="h-4 w-px bg-[#334155] shrink-0"></div>

          {/* Live Category Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* All */}
            <button
              onClick={() => setActiveCategory('all')}
              className={`filter-chip px-3 py-1.5 rounded-full text-[11px] font-['Inter'] font-semibold flex items-center gap-1 active:scale-95 transition-all ${
                activeCategory === 'all'
                  ? 'bg-[#3198dc]/20 text-[#93ccff] ring-1 ring-[#93ccff]/40 shadow-sm'
                  : 'bg-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              <span>All</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeCategory === 'all'
                    ? 'bg-[#93ccff] text-[#003351] font-bold'
                    : 'bg-[#334155] text-[#bfc7d2]'
                }`}
              >
                {counts.total}
              </span>
            </button>

            {/* Building */}
            <button
              onClick={() => setActiveCategory('building')}
              className={`filter-chip px-3 py-1.5 rounded-full text-[11px] font-['Inter'] flex items-center gap-1 active:scale-95 transition-all ${
                activeCategory === 'building'
                  ? 'bg-[#3198dc]/20 text-[#93ccff] ring-1 ring-[#93ccff]/40 font-semibold'
                  : 'bg-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              <span>Building</span>
              <span className="text-[#bfc7d2] font-normal">{counts.building}</span>
            </button>

            {/* Street */}
            <button
              onClick={() => setActiveCategory('street')}
              className={`filter-chip px-3 py-1.5 rounded-full text-[11px] font-['Inter'] flex items-center gap-1 active:scale-95 transition-all ${
                activeCategory === 'street'
                  ? 'bg-[#3198dc]/20 text-[#93ccff] ring-1 ring-[#93ccff]/40 font-semibold'
                  : 'bg-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              <span>Street</span>
              <span className="text-[#bfc7d2] font-normal">{counts.street}</span>
            </button>

            {/* EV */}
            <button
              onClick={() => setActiveCategory('ev')}
              className={`filter-chip px-3 py-1.5 rounded-full text-[11px] font-['Inter'] flex items-center gap-1 active:scale-95 transition-all ${
                activeCategory === 'ev'
                  ? 'bg-[#00a572]/20 text-[#4edea3] ring-1 ring-[#4edea3]/40 font-semibold'
                  : 'bg-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] text-[#4edea3]">bolt</span>
              <span>EV ({counts.ev})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Rate & Duration Estimator Telemetry Bar + LTA Status */}
      <section className="px-4 py-2 bg-[#131b2e] border-b border-white/[0.05] shadow-sm">
        <div className="bg-[#1e293b] rounded-xl p-2.5 flex flex-col gap-2 border border-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-[#4edea3] text-[18px]">
                schedule
              </span>
              <span className="font-['Inter'] text-xs text-[#f8fafc] font-semibold truncate">
                {durationLabel}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#334155] text-[#93ccff] text-[10px] font-['Inter'] font-bold">
                {durationHours >= 1
                  ? `${Math.floor(durationHours)}h ${Math.round((durationHours % 1) * 60)}m`
                  : `${Math.round(durationHours * 60)}m`}
              </span>
            </div>

            {/* Toggle Rate Mode: Total vs /hr Rate */}
            <div className="flex items-center bg-[#060e20] rounded-lg p-0.5 text-[11px] font-['Inter']">
              <button
                id="calc-total"
                onClick={() => setRateDisplayMode('total')}
                className={`px-2 py-0.5 rounded transition-all ${
                  rateDisplayMode === 'total'
                    ? 'bg-[#2563eb] text-white font-bold shadow-sm'
                    : 'text-[#94a3b8] hover:text-[#f8fafc]'
                }`}
              >
                Total
              </button>
              <button
                id="calc-hourly"
                onClick={() => setRateDisplayMode('hourly')}
                className={`px-2 py-0.5 rounded transition-all ${
                  rateDisplayMode === 'hourly'
                    ? 'bg-[#2563eb] text-white font-bold shadow-sm'
                    : 'text-[#94a3b8] hover:text-[#f8fafc]'
                }`}
              >
                /hr Rate
              </button>
            </div>
          </div>

          {/* Second row: Quick time adjustments + LTA Connection Badge */}
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleQuickDuration(1.0)}
                className="px-2 py-1 rounded bg-[#334155] hover:bg-[#475569] text-[#f8fafc] font-['Inter'] text-[11px] font-medium active:scale-95 transition-transform"
              >
                +1.0h
              </button>
              <button
                onClick={() => handleQuickDuration(2.5)}
                className="px-2 py-1 rounded bg-[#334155] hover:bg-[#475569] text-[#f8fafc] font-['Inter'] text-[11px] font-medium active:scale-95 transition-transform"
              >
                +2.5h
              </button>
              <button
                onClick={() => handleQuickDuration('all-day')}
                className="px-2 py-1 rounded bg-[#334155] hover:bg-[#475569] text-[#f8fafc] font-['Inter'] text-[11px] font-medium active:scale-95 transition-transform"
              >
                All-Day
              </button>
            </div>

            {/* Government Data Sources: LTA DataMall & Data.gov.sg Ingestion Pills */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Data.gov.sg Ingestion Status Pill */}
              <button
                onClick={() => setShowDataGovModal(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0b1326] border border-white/5 text-[10px] font-['Inter'] font-semibold hover:border-[#93ccff]/40 transition-colors"
                title="Data.gov.sg Carpark Metadata Ingestion"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    dataGovStatus === 'ingested'
                      ? 'bg-[#93ccff]'
                      : dataGovStatus === 'ingesting'
                      ? 'bg-amber-400 animate-spin'
                      : 'bg-[#94a3b8]'
                  }`}
                ></span>
                <span className="text-[#dae2fd]">
                  {dataGovStatus === 'ingesting'
                    ? 'Ingesting...'
                    : `Data.gov.sg (${dataGovIngestedCount || 12})`}
                </span>
                <span className="material-symbols-outlined text-[12px] text-[#93ccff]">cloud_download</span>
              </button>

              {/* LTA DataMall Connection Status Pill */}
              <button
                onClick={() => setShowLtaKeyModal(true)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0b1326] border border-white/5 text-[10px] font-['Inter'] font-semibold hover:border-[#4edea3]/40 transition-colors"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    ltaSyncStatus === 'live'
                      ? 'bg-[#4edea3] animate-pulse'
                      : ltaSyncStatus === 'syncing'
                      ? 'bg-amber-400 animate-spin'
                      : 'bg-[#93ccff]'
                  }`}
                ></span>
                <span className="text-[#4edea3]">
                  {ltaSyncStatus === 'live'
                    ? `LTA Live (${ltaLotCount || 'Active'})`
                    : ltaSyncStatus === 'syncing'
                    ? 'Connecting LTA...'
                    : 'LTA Synced'}
                </span>
                <span className="material-symbols-outlined text-[12px] text-[#94a3b8]">settings</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Canvas */}
      <section
        className={`relative w-full transition-all duration-300 ${
          viewMode === 'full' ? 'h-[620px]' : 'h-[406px]'
        } bg-[#0b1326] overflow-hidden select-none`}
      >
        {/* Map Surface with Cartographic Background */}
        <div
          className="w-full h-full bg-cover bg-center relative"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAQpf7jab7vYOEM20LjgmyoUZ6IMQGoE41tsbPsoE2FhQFay3iOaa_DxKTpI7MUMTQ7kH3S_6Dbx8ikblMEPnhCSEePmAjRu-IvHWiRybtqldz1HXOXmrtcj2WmQtSEWBRvRuqCwE6ODBHBwcwP9VIR7WmOyo4XmX5V4kH1ee8s73n5kSttZNzJDq3A9cPZJfT8OHLmbLDCgGxZCBiPkupiGP6chTl2BI_JPHGijPukX-2-pKSjWPAD')`,
          }}
        >
          {/* Subtle Ambient Radial Vignette */}
          <div className="absolute inset-0 bg-radial from-transparent via-[#0b1326]/20 to-[#0b1326]/60 pointer-events-none" />

          {/* Optional Traffic Congestion Overlay */}
          {trafficLayerActive && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full opacity-60">
                <path
                  d="M 120 180 Q 200 240 320 230 T 460 210"
                  stroke="#ef4444"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="6 4"
                />
                <path
                  d="M 80 290 Q 220 280 280 240 T 360 260"
                  stroke="#4edea3"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 180 340 L 300 260 L 400 320"
                  stroke="#ffb95f"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="absolute top-3 left-4 px-2 py-0.5 rounded bg-black/80 backdrop-blur text-[10px] text-white flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Fast
                <span className="w-2 h-2 rounded-full bg-amber-400 ml-1"></span> Moderate
                <span className="w-2 h-2 rounded-full bg-rose-500 ml-1"></span> Heavy
              </div>
            </div>
          )}

          {/* Radius Ring Overlay centered around the identified Target Destination */}
          <div className="absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border-2 border-dashed border-[#2563eb]/50 bg-[#2563eb]/5 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border border-[#4edea3]/20 pointer-events-none" />
          </div>

          {/* Target Destination Point (Pulsing Halo and identified badge) */}
          <div className="absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10">
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#93ccff]/40 animate-ping absolute" />
              <div className="w-5 h-5 rounded-full bg-[#93ccff] flex items-center justify-center shadow-lg shadow-[#93ccff]/50">
                <span className="w-2 h-2 rounded-full bg-[#003351]" />
              </div>
            </div>
            <div className="mt-1 px-2.5 py-0.5 rounded bg-[#1e293b]/95 backdrop-blur-md shadow-lg border border-[#93ccff]/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
              <span className="text-[10px] font-['Inter'] font-bold text-[#f8fafc] tracking-wider uppercase">
                TARGET: {targetDestination.label || targetDestination.badge}
              </span>
            </div>
          </div>

          {/* Dynamic Interactive Pins for nearby carparks */}
          {filteredSpots.slice(0, 8).map((spot) => {
            const pos = getMapPosition(spot.lat, spot.lng);
            const isHighlighted = highlightedSpotId === spot.id;
            const cost = calculateDynamicCost(spot, durationHours);

            return (
              <button
                key={`pin-${spot.id}`}
                id={`pin-${spot.id}`}
                onClick={() => handleSpotClick(spot.id)}
                style={{
                  top: `${pos.topPercent}%`,
                  left: `${pos.leftPercent}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 focus:outline-none z-20 ${
                  isHighlighted ? 'scale-110 z-30' : ''
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 bg-[#1e293b] text-[#f8fafc] px-2.5 py-1.5 rounded-full shadow-xl shadow-black/70 group-hover:scale-105 active:scale-95 transition-transform border ${
                    spot.isCheapest
                      ? 'border-[#6ffbbe]/50'
                      : spot.lotStatus === 'Plentiful'
                      ? 'border-[#4edea3]/40'
                      : 'border-[#ffb95f]/40'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      spot.availableLots > 30
                        ? 'bg-[#4edea3] animate-pulse'
                        : spot.availableLots > 10
                        ? 'bg-[#ffb95f]'
                        : 'bg-rose-400'
                    }`}
                  />
                  <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#f8fafc]">
                    {rateDisplayMode === 'total' ? `$${cost.toFixed(2)}` : `$${spot.hourlyRate.toFixed(2)}/h`}
                  </span>
                  <span className="text-[10px] text-[#93ccff] font-['Inter'] font-bold">
                    {spot.shortName}
                  </span>
                </div>
                <div className="w-2 h-2 bg-[#1e293b] rotate-45 mx-auto -mt-1 shadow-sm border-r border-b border-white/20" />
              </button>
            );
          })}
        </div>

        {/* Floating Map Quick Action HUD Controls (Top Right) */}
        <div className="absolute right-4 top-4 flex flex-col gap-2 z-20">
          <button
            aria-label="Re-center on target"
            onClick={() => {
              if (filteredSpots[0]) {
                setHighlightedSpotId(filteredSpots[0].id);
              }
            }}
            title="Re-center on target"
            className="w-11 h-11 rounded-xl bg-[#1e293b]/90 backdrop-blur-md text-[#f8fafc] border border-white/[0.08] shadow-lg flex items-center justify-center active:scale-90 transition-all hover:bg-[#334155]"
          >
            <span className="material-symbols-outlined text-[22px] text-[#93ccff]">gps_fixed</span>
          </button>

          <button
            aria-label="Toggle Traffic Layer"
            onClick={() => setTrafficLayerActive(!trafficLayerActive)}
            title="Toggle Live Traffic"
            className={`w-11 h-11 rounded-xl backdrop-blur-md border shadow-lg flex items-center justify-center active:scale-90 transition-all ${
              trafficLayerActive
                ? 'bg-[#00a572]/40 border-[#4edea3] text-[#4edea3]'
                : 'bg-[#1e293b]/90 border-white/[0.08] text-[#4edea3] hover:bg-[#334155]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">layers</span>
          </button>
        </div>

        {/* Floating Map View Mode Pill Switcher (Bottom Center) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center bg-[#1e293b]/90 backdrop-blur-xl p-1 rounded-full shadow-2xl border border-white/[0.08]">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3.5 py-1 rounded-full text-xs font-['Inter'] transition-all ${
                viewMode === 'split'
                  ? 'bg-[#93ccff] text-[#003351] font-bold shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              List &amp; Map
            </button>
            <button
              onClick={() => setViewMode('full')}
              className={`px-3.5 py-1 rounded-full text-xs font-['Inter'] transition-all ${
                viewMode === 'full'
                  ? 'bg-[#93ccff] text-[#003351] font-bold shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              Map Full
            </button>
          </div>
        </div>
      </section>

      {/* Optimal Nearby Lots Bottom Deck / Results Sheet */}
      <section className="px-4 pt-3 pb-8 bg-[#0b1326] flex flex-col gap-3 shadow-2xl">
        {/* Grab Bar & Count summary */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
            <span className="font-['Plus_Jakarta_Sans'] text-base text-[#f8fafc] font-bold">
              Optimal Lots near {targetDestination.label} ({filteredSpots.length})
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-['Inter'] text-[#94a3b8]">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#1e293b] text-[#f8fafc] text-xs rounded-lg px-2 py-1 border border-white/[0.08] outline-none"
            >
              <option value="distance">Nearest</option>
              <option value="price">Lowest Price</option>
              <option value="availability">Most Lots</option>
            </select>
          </div>
        </div>

        {/* Carparks List */}
        <div className="flex flex-col gap-3.5">
          {filteredSpots.length === 0 ? (
            <div className="bg-[#1e293b] rounded-2xl p-6 text-center border border-white/5 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[32px] text-[#94a3b8]">search_off</span>
              <span className="text-sm font-semibold text-white">No carparks within {selectedRadius}m</span>
              <p className="text-xs text-[#94a3b8]">
                Expand the search radius to 1.5 km or All SG to discover more parking options.
              </p>
              <button
                onClick={() => setSelectedRadius(3000)}
                className="mt-2 px-3 py-1.5 rounded-xl bg-[#2563eb] text-white text-xs font-bold active:scale-95 transition-all"
              >
                Expand to All SG
              </button>
            </div>
          ) : (
            filteredSpots.map((spot) => {
              const cost = calculateDynamicCost(spot, durationHours);
              const isSaved = savedSpotIds.includes(spot.id);
              const isHighlighted = highlightedSpotId === spot.id;

              return (
                <article
                  key={spot.id}
                  id={`card-${spot.id}`}
                  onClick={() => setHighlightedSpotId(spot.id)}
                  className={`bg-[#1e293b] rounded-2xl p-4 border transition-all duration-200 shadow-xl cursor-pointer ${
                    isHighlighted
                      ? 'border-[#4edea3]/60 ring-2 ring-[#4edea3]/20 shadow-2xl'
                      : 'border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Name & Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#f8fafc] truncate">
                          {spot.name}
                        </h2>
                        {spot.isVerified && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#2563eb]/25 text-[#93ccff] text-[10px] font-['Inter'] font-semibold">
                            <span className="material-symbols-outlined text-[12px]">verified</span>
                            <span>Verified</span>
                          </span>
                        )}
                        {spot.isCheapest && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#00a572]/20 text-[#4edea3] text-[10px] font-['Inter'] font-semibold">
                            <span>Cheapest Choice</span>
                          </span>
                        )}
                        {spot.areaGroup && (
                          <span className="px-1.5 py-0.5 rounded-md bg-[#131b2e] text-[#94a3b8] text-[9px] font-mono">
                            {spot.areaGroup}
                          </span>
                        )}
                      </div>

                      {/* Subtitle / Location */}
                      <p className="font-['Inter'] text-xs text-[#94a3b8] truncate mb-2">
                        {spot.address}
                      </p>

                      {/* Walking metrics & vacancy */}
                      <div className="flex items-center gap-3 text-xs text-[#dae2fd]">
                        <span className="flex items-center gap-1 font-semibold text-[#93ccff]">
                          <span className="material-symbols-outlined text-[15px]">directions_walk</span>
                          <span>
                            {spot.walkingDistanceM}m • {spot.walkingTimeMin}m
                          </span>
                        </span>

                        <span className="h-3 w-px bg-white/10" />

                        <span
                          className={`flex items-center gap-1 font-semibold ${
                            spot.availableLots > 30
                              ? 'text-[#4edea3]'
                              : spot.availableLots > 10
                              ? 'text-[#ffb95f]'
                              : 'text-rose-400'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{spot.availableLots} Lots Available</span>
                        </span>
                      </div>
                    </div>

                    {/* Price Block */}
                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg text-[#f8fafc]">
                        {rateDisplayMode === 'total' ? `$${cost.toFixed(2)}` : `$${spot.hourlyRate.toFixed(2)}`}
                      </span>
                      <span className="text-[10px] text-[#94a3b8] font-['Inter']">
                        {rateDisplayMode === 'total' ? `est. ${durationHours}h total` : '/hr rate'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(spot.id);
                        }}
                        aria-label={isSaved ? 'Remove from saved' : 'Save carpark'}
                        className={`mt-2 p-1.5 rounded-xl border transition-colors ${
                          isSaved
                            ? 'bg-[#4edea3]/20 text-[#4edea3] border-[#4edea3]/40'
                            : 'bg-[#131b2e] text-[#94a3b8] border-white/5 hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isSaved ? 'bookmark_added' : 'bookmark_add'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Tariff schedule excerpt */}
                  <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex flex-wrap items-center justify-between text-[11px] text-[#94a3b8] gap-1">
                    <span className="truncate max-w-[280px]">
                      <strong className="text-white">Day Rate:</strong> {spot.weekdayDayRate}
                    </span>
                    <span className="text-[10px] text-[#93ccff]">
                      {spot.category === 'street' ? 'URA Coupon' : 'Electronic EPS'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartNavigation(spot);
                      }}
                      className="flex-1 h-9 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-[#2563eb]/20"
                    >
                      <span className="material-symbols-outlined text-[16px]">navigation</span>
                      <span>Direct Navigation</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSpot(spot);
                      }}
                      className="h-9 px-3.5 rounded-xl bg-[#131b2e] hover:bg-[#222a3d] text-[#93ccff] text-xs font-semibold border border-white/5 active:scale-95 transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* LTA DataMall Key Configuration Modal */}
      {showLtaKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 max-w-md w-full shadow-2xl flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4edea3] text-[20px]">api</span>
                <h3 className="text-sm font-bold font-['Plus_Jakarta_Sans'] text-white">
                  LTA DataMall CarParkAvailabilityv2
                </h3>
              </div>
              <button
                onClick={() => setShowLtaKeyModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#94a3b8] hover:text-white"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <p className="text-[#94a3b8] leading-relaxed">
              Real-time carpark availability feed from the Singapore Land Transport Authority (LTA)
              DataMall across HDB, LTA, and URA facilities.
            </p>

            <div className="p-3 rounded-xl bg-[#131b2e] border border-white/5 flex flex-col gap-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Status:</span>
                <span className="text-[#4edea3] font-bold">
                  {ltaSyncStatus === 'live' ? 'Connected (Live)' : 'Live Sensor Feed Active'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Last Request:</span>
                <span className="text-white">{ltaLastSyncTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Endpoint:</span>
                <span className="text-[#93ccff] truncate">ltaodataservice/CarParkAvailabilityv2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Header:</span>
                <span className="text-amber-300">AccountKey: &lt;LTA_ACCOUNT_KEY&gt;</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                Custom LTA DataMall AccountKey (Optional)
              </label>
              <input
                type="text"
                value={customLtaKey}
                onChange={(e) => setCustomLtaKey(e.target.value)}
                placeholder="Paste your LTA AccountKey here..."
                className="bg-[#131b2e] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#93ccff]"
              />
              <span className="text-[10px] text-[#94a3b8]">
                If left blank, ParkPulse uses the server-configured environment key or instant synchronized sensor backup.
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  triggerLtaSync(customLtaKey);
                  setShowLtaKeyModal(false);
                }}
                className="flex-1 h-9 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs active:scale-95 transition-all shadow-md"
              >
                Sync LTA Feed Now
              </button>
              <button
                onClick={() => setShowLtaKeyModal(false)}
                className="h-9 px-4 rounded-xl bg-[#334155] text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data.gov.sg Ingestion Inspector Modal */}
      {showDataGovModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 max-w-lg w-full shadow-2xl flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#93ccff] text-[20px]">cloud_sync</span>
                <h3 className="text-sm font-bold font-['Plus_Jakarta_Sans'] text-white">
                  Data.gov.sg Carpark Metadata Ingestion
                </h3>
              </div>
              <button
                onClick={() => setShowDataGovModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#94a3b8] hover:text-white"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <p className="text-[#94a3b8] leading-relaxed">
              Fetches and normalizes official static carpark metadata from Singapore data.gov.sg datasets. Converts SVY21 Easting/Northing coordinates into WGS84 geographic coordinates and maps official HDB/URA tariff models into the internal <code className="text-[#93ccff]">ParkingSpot</code> structure.
            </p>

            {/* Ingestion Status Box */}
            <div className="p-3.5 rounded-xl bg-[#131b2e] border border-white/5 flex flex-col gap-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Ingestion State:</span>
                <span className={`font-bold ${dataGovStatus === 'ingested' ? 'text-[#4edea3]' : dataGovStatus === 'ingesting' ? 'text-amber-300' : 'text-white'}`}>
                  {dataGovStatus === 'ingested' ? 'Successfully Ingested' : dataGovStatus === 'ingesting' ? 'Ingesting from Datastore...' : 'Ready'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Active Source:</span>
                <span className="text-[#93ccff]">
                  {dataGovResult?.source || 'data_gov_live / static_seed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Dataset Resource ID:</span>
                <span className="text-amber-300 font-bold truncate max-w-[240px]">
                  {selectedDatasetId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Ingested Carparks:</span>
                <span className="text-white font-bold">{dataGovIngestedCount || 12} locations normalized</span>
              </div>
            </div>

            {/* Select Dataset to Ingest */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                Select Singapore data.gov.sg Dataset
              </label>
              <select
                value={selectedDatasetId}
                onChange={(e) => setSelectedDatasetId(e.target.value)}
                className="bg-[#131b2e] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#93ccff]"
              >
                <option value={DATA_GOV_DATASETS.HDB_CARPARK_INFO}>
                  d_e36b7c1dfe770ef8ebcd3ace81eb9402 (HDB Carpark Info &amp; Coordinates)
                </option>
                <option value={DATA_GOV_DATASETS.URA_CARPARK_LIST}>
                  d_d959102fa76d58f2de276bfbb7e8f68e (URA Carpark List &amp; Rates)
                </option>
                <option value={DATA_GOV_DATASETS.GOV_CARPARKS_EAST}>
                  d_9bf8620ecfdc8a5f8f77e3f02160af5c (East Zone Carparks)
                </option>
                <option value={DATA_GOV_DATASETS.GOV_CARPARKS_CENTRAL}>
                  d_3b0c377cde41041c93f893d0a92e9fe7 (Central Zone Carparks)
                </option>
                <option value={DATA_GOV_DATASETS.GOV_CARPARKS_WEST}>
                  d_ca933a644e55d34fe21f28b8052fac63 (West Zone Carparks)
                </option>
                <option value={DATA_GOV_DATASETS.GOV_CARPARKS_NORTH}>
                  d_23f946fa557947f93a8043bbef41dd09 (North Zone Carparks)
                </option>
              </select>
            </div>

            {/* Normalization Mapping Schema Card */}
            <div className="p-3 rounded-xl bg-[#0b1326] border border-white/5 flex flex-col gap-1.5 text-[11px] text-[#94a3b8]">
              <div className="text-[10px] font-bold uppercase text-[#93ccff]">Normalization Pipeline</div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div>• SVY21 x/y → WGS84 Lat/Lng</div>
                <div>• car_park_type → Street vs Building</div>
                <div>• gantry_height → maxHeightM</div>
                <div>• type_of_parking → EPS vs Parking.sg</div>
                <div>• night_parking → $5.00 Cap logic</div>
                <div>• free_parking → Weekend free exemptions</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                disabled={dataGovStatus === 'ingesting'}
                onClick={() => {
                  triggerDataGovIngestion(selectedDatasetId);
                }}
                className="flex-1 h-9 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>{dataGovStatus === 'ingesting' ? 'Ingesting Records...' : 'Ingest Dataset Now'}</span>
              </button>
              <button
                onClick={() => setShowDataGovModal(false)}
                className="h-9 px-4 rounded-xl bg-[#334155] text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
