import React, { useState } from 'react';
import { ParkingSpot, ActiveParkingSession } from '../types';

interface SavedViewProps {
  savedSpotIds: string[];
  spots: ParkingSpot[];
  activeSession: ActiveParkingSession | null;
  onToggleSave: (spotId: string) => void;
  onSelectSpot: (spot: ParkingSpot) => void;
  onStartNavigation: (spot: ParkingSpot) => void;
  onEndParkingSession: () => void;
  onSetQuickParking: (lotName: string, level: string, pillar: string) => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  savedSpotIds,
  spots,
  activeSession,
  onToggleSave,
  onSelectSpot,
  onStartNavigation,
  onEndParkingSession,
  onSetQuickParking,
}) => {
  const [showManualParkModal, setShowManualParkModal] = useState<boolean>(false);
  const [customLot, setCustomLot] = useState<string>('Marina Bay Financial Centre');
  const [customLevel, setCustomLevel] = useState<string>('P2');
  const [customPillar, setCustomPillar] = useState<string>('B14');

  const savedSpots = spots.filter((s) => savedSpotIds.includes(s.id));

  const pastReceipts = [
    {
      id: 'rec-1',
      lot: 'Marina Bay Financial Centre',
      date: 'Yesterday, 14:15 - 16:45',
      duration: '2h 30m',
      amount: '$12.50',
      method: 'EPS Auto-debit (CashCard)',
    },
    {
      id: 'rec-2',
      lot: 'Marina Blvd Kerbside',
      date: 'Sep 15, 11:00 - 12:00',
      duration: '1h 00m',
      amount: '$2.40',
      method: 'Parking.sg Mobile',
    },
    {
      id: 'rec-3',
      lot: 'The Shoppes at MBS',
      date: 'Sep 12, 19:30 - 22:00',
      duration: '2h 30m',
      amount: '$8.50',
      method: 'Sands Rewards Valet',
    },
  ];

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-4 pt-4 pb-24 gap-5">
      {/* Header */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#93ccff] text-[24px]">
            bookmark
          </span>
          <h1 className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-white">
            Saved &amp; Parked Vehicle
          </h1>
        </div>
        <p className="text-xs text-[#94a3b8] mt-1">
          Locate your parked vehicle, monitor live meter fees, and access quick-navigation shortcuts.
        </p>
      </div>

      {/* Find My Parked Car Section */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-white/[0.08] shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-pulse" />
            <h2 className="text-sm font-bold font-['Plus_Jakarta_Sans'] text-white uppercase tracking-wider">
              Find My Parked Car
            </h2>
          </div>
          {activeSession && (
            <span className="px-2 py-0.5 rounded-full bg-[#00a572]/20 text-[#4edea3] text-[10px] font-bold">
              Active Meter
            </span>
          )}
        </div>

        {activeSession ? (
          <div className="flex flex-col gap-3">
            <div className="bg-[#131b2e] p-4 rounded-xl border border-white/5 flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-base font-bold text-white block">
                    {activeSession.lotName}
                  </span>
                  <span className="text-xs text-[#94a3b8]">
                    Parked at: Level <strong className="text-white">{activeSession.level}</strong> • Pillar / Bay <strong className="text-white">{activeSession.pillar}</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#94a3b8] block">Estimated Cost</span>
                  <span className="text-lg font-bold font-['Plus_Jakarta_Sans'] text-[#4edea3]">
                    ${activeSession.costSoFar.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-xs text-[#94a3b8]">
                <div>
                  Started: <span className="text-white font-medium">{activeSession.startTime}</span>
                </div>
                <div>
                  Vehicle: <span className="text-white font-medium">{activeSession.vehiclePlate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert(`Walking navigation to ${activeSession.lotName}, Level ${activeSession.level}, Bay ${activeSession.pillar} started!`)}
                className="flex-1 h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-[#2563eb]/30"
              >
                <span className="material-symbols-outlined text-[18px]">directions_walk</span>
                <span>Walk Back to My Car</span>
              </button>

              <button
                onClick={onEndParkingSession}
                className="h-11 px-4 rounded-xl bg-[#334155] hover:bg-[#475569] text-rose-300 text-xs font-semibold"
              >
                End Session
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#131b2e] flex items-center justify-center text-[#94a3b8]">
              <span className="material-symbols-outlined text-2xl">directions_car</span>
            </div>
            <p className="text-xs text-[#94a3b8]">
              No vehicle currently logged as parked. Start navigation or log your parking spot manually.
            </p>
            <button
              onClick={() => setShowManualParkModal(true)}
              className="mt-2 px-4 py-2 bg-[#334155] hover:bg-[#475569] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add_location_alt</span>
              <span>Mark My Car Location Here</span>
            </button>
          </div>
        )}
      </div>

      {/* Manual Park Modal */}
      {showManualParkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#171f33] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-3.5">
            <h3 className="font-bold text-white text-base font-['Plus_Jakarta_Sans']">
              Quick Log Parked Location
            </h3>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-[#94a3b8]">Car Park</label>
              <input
                type="text"
                value={customLot}
                onChange={(e) => setCustomLot(e.target.value)}
                className="bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-[#94a3b8]">Level</label>
                <input
                  type="text"
                  value={customLevel}
                  onChange={(e) => setCustomLevel(e.target.value)}
                  className="bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-[#94a3b8]">Pillar / Bay</label>
                <input
                  type="text"
                  value={customPillar}
                  onChange={(e) => setCustomPillar(e.target.value)}
                  className="bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  onSetQuickParking(customLot, customLevel, customPillar);
                  setShowManualParkModal(false);
                }}
                className="flex-1 h-10 bg-[#2563eb] text-white text-xs font-bold rounded-xl"
              >
                Confirm &amp; Start Timer
              </button>
              <button
                onClick={() => setShowManualParkModal(false)}
                className="h-10 px-3 bg-[#334155] text-[#dae2fd] text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookmarked Car Parks */}
      <div className="bg-[#1e293b] rounded-2xl p-4 border border-white/[0.08] shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-['Plus_Jakarta_Sans'] text-white flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#ffb95f]">star</span>
            Bookmarked Parking Facilities ({savedSpots.length})
          </h2>
        </div>

        {savedSpots.length > 0 ? (
          <div className="divide-y divide-white/5">
            {savedSpots.map((spot) => (
              <div key={spot.id} className="py-3 flex items-center justify-between gap-2">
                <div 
                  className="flex flex-col cursor-pointer"
                  onClick={() => onSelectSpot(spot)}
                >
                  <span className="font-semibold text-white text-sm">{spot.name}</span>
                  <span className="text-xs text-[#94a3b8]">
                    ${spot.hourlyRate.toFixed(2)}/hr • {spot.walkingDistanceM}m • {spot.availableLots} lots open
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStartNavigation(spot)}
                    className="h-8 px-3 rounded-lg bg-[#2563eb] text-white text-xs font-bold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">navigation</span>
                    <span>Go</span>
                  </button>

                  <button
                    onClick={() => onToggleSave(spot.id)}
                    className="p-1.5 rounded-lg text-[#94a3b8] hover:text-rose-400"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#94a3b8]">
            No bookmarked car parks. Tap the bookmark icon on any car park card in Explore to save it here.
          </div>
        )}
      </div>

      {/* Parking History Receipts */}
      <div className="bg-[#1e293b] rounded-2xl p-4 border border-white/[0.08] shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-['Plus_Jakarta_Sans'] text-white flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#93ccff]">history</span>
            Recent Parking Sessions &amp; Receipts
          </h2>
        </div>

        <div className="divide-y divide-white/5 text-xs">
          {pastReceipts.map((rec) => (
            <div key={rec.id} className="py-2.5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium text-white">{rec.lot}</span>
                <span className="text-[10px] text-[#94a3b8]">{rec.date} ({rec.duration})</span>
                <span className="text-[10px] text-[#4edea3]">{rec.method}</span>
              </div>
              <span className="text-sm font-bold font-['Plus_Jakarta_Sans'] text-white">
                {rec.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
