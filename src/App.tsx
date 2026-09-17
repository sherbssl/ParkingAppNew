import React, { useState, useEffect } from 'react';
import { ScreenTab, ParkingSpot, ActiveParkingSession } from './types';
import { INITIAL_PARKING_SPOTS, DEFAULT_VEHICLE } from './data/mockParkingData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ExploreView } from './components/ExploreView';
import { CalculatorView } from './components/CalculatorView';
import { SavedView } from './components/SavedView';
import { ProfileView } from './components/ProfileView';
import { LotDetailModal } from './components/LotDetailModal';
import { NavigationHudModal } from './components/NavigationHudModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ScreenTab>('explore');
  const [spots, setSpots] = useState<ParkingSpot[]>(INITIAL_PARKING_SPOTS);
  const [savedSpotIds, setSavedSpotIds] = useState<string[]>(['mbfc']);
  
  // Active parking session state (e.g. parked at MBFC Level P2)
  const [activeSession, setActiveSession] = useState<ActiveParkingSession | null>({
    lotId: 'mbfc',
    lotName: 'Marina Bay Financial Centre',
    level: 'P2',
    pillar: 'B14',
    vehiclePlate: DEFAULT_VEHICLE.plate,
    startTime: '13:00',
    durationMinutes: 42,
    costSoFar: 5.0,
    targetEndTime: '15:30',
  });

  // Modal inspection & Navigation state
  const [selectedSpotForDetail, setSelectedSpotForDetail] = useState<ParkingSpot | null>(null);
  const [activeNavSpot, setActiveNavSpot] = useState<ParkingSpot | null>(null);
  const [gpsActive, setGpsActive] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Realistic live URA lot fluctuations every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSpots((prevSpots) =>
        prevSpots.map((spot) => {
          const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
          const newAvailable = Math.max(1, Math.min(spot.totalLots, spot.availableLots + delta));
          return {
            ...spot,
            availableLots: newAvailable,
          };
        })
      );
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSave = (spotId: string) => {
    setSavedSpotIds((prev) => {
      if (prev.includes(spotId)) {
        showToast('Removed from saved car parks');
        return prev.filter((id) => id !== spotId);
      } else {
        showToast('Saved to your car parks list');
        return [...prev, spotId];
      }
    });
  };

  const handleStartNavigation = (spot: ParkingSpot) => {
    setActiveNavSpot(spot);
  };

  const handleFinishParking = (spot: ParkingSpot, level: string, pillar: string) => {
    const newSession: ActiveParkingSession = {
      lotId: spot.id,
      lotName: spot.name,
      level: level || 'P2',
      pillar: pillar || 'B14',
      vehiclePlate: DEFAULT_VEHICLE.plate,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: 0,
      costSoFar: spot.rate.blockRate,
      targetEndTime: '17:00',
    };
    setActiveSession(newSession);
    setActiveNavSpot(null);
    showToast(`Car parked at ${spot.shortName}, Level ${level}, Bay ${pillar}!`);
    setActiveTab('saved');
  };

  const handleEndParkingSession = () => {
    setActiveSession(null);
    showToast('Parking session ended and receipt archived.');
  };

  const handleSetQuickParking = (lotName: string, level: string, pillar: string) => {
    const newSession: ActiveParkingSession = {
      lotId: 'custom',
      lotName: lotName || 'Marina Bay Financial Centre',
      level: level || 'P2',
      pillar: pillar || 'B14',
      vehiclePlate: DEFAULT_VEHICLE.plate,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: 0,
      costSoFar: 2.5,
      targetEndTime: '17:00',
    };
    setActiveSession(newSession);
    showToast('Parked vehicle location saved!');
  };

  const handleLocateGps = () => {
    setGpsActive(true);
    showToast('GPS localized: Marina Bay Sands vicinity');
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] font-['Inter'] flex flex-col antialiased">
      {/* Fixed App Header */}
      <Header
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onLocateGps={handleLocateGps}
        gpsActive={gpsActive}
      />

      {/* Main Screen Body */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-16">
        {activeTab === 'explore' && (
          <ExploreView
            spots={spots}
            savedSpotIds={savedSpotIds}
            onToggleSave={handleToggleSave}
            onSelectSpot={setSelectedSpotForDetail}
            onStartNavigation={handleStartNavigation}
          />
        )}

        {activeTab === 'calculator' && (
          <CalculatorView
            spots={spots}
            onSelectSpot={setSelectedSpotForDetail}
            onStartNavigation={handleStartNavigation}
          />
        )}

        {activeTab === 'saved' && (
          <SavedView
            savedSpotIds={savedSpotIds}
            spots={spots}
            activeSession={activeSession}
            onToggleSave={handleToggleSave}
            onSelectSpot={setSelectedSpotForDetail}
            onStartNavigation={handleStartNavigation}
            onEndParkingSession={handleEndParkingSession}
            onSetQuickParking={handleSetQuickParking}
          />
        )}

        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1e293b]/95 border border-[#4edea3]/40 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold text-[#f8fafc] animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#4edea3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Carpark Detail Inspection Modal */}
      <LotDetailModal
        spot={selectedSpotForDetail}
        onClose={() => setSelectedSpotForDetail(null)}
        onStartNavigation={handleStartNavigation}
        isSaved={selectedSpotForDetail ? savedSpotIds.includes(selectedSpotForDetail.id) : false}
        onToggleSave={handleToggleSave}
      />

      {/* Driver Turn-by-Turn Navigation HUD Modal */}
      {activeNavSpot && (
        <NavigationHudModal
          spot={activeNavSpot}
          onClose={() => setActiveNavSpot(null)}
          onFinishParking={handleFinishParking}
        />
      )}

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        savedCount={savedSpotIds.length}
        hasActiveSession={!!activeSession}
      />
    </div>
  );
}
