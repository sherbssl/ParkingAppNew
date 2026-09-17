import React, { useState, useEffect } from 'react';
import { ParkingSpot } from '../types';

interface NavigationHudModalProps {
  spot: ParkingSpot | null;
  onClose: () => void;
  onFinishParking: (spot: ParkingSpot, level: string, pillar: string) => void;
}

export const NavigationHudModal: React.FC<NavigationHudModalProps> = ({
  spot,
  onClose,
  onFinishParking,
}) => {
  if (!spot) return null;

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [distanceRemaining, setDistanceRemaining] = useState<number>(spot.walkingDistanceM);
  const [speed, setSpeed] = useState<number>(36);
  const [floorInput, setFloorInput] = useState<string>('P2');
  const [pillarInput, setPillarInput] = useState<string>('B14');
  const [showParkedDialog, setShowParkedDialog] = useState<boolean>(false);

  const steps = [
    {
      instruction: `Continue straight on Marina Boulevard towards ${spot.name}`,
      detail: 'Keep in the 2nd right lane for underpass ramp',
      icon: 'straight',
      distance: 120,
    },
    {
      instruction: `Turn Right into ${spot.gantryEntrance}`,
      detail: 'ERP EPS Gantry auto-scanning In-Vehicle Unit (IU)',
      icon: 'turn_right',
      distance: 40,
    },
    {
      instruction: 'Enter Carpark Level P2 - Subterranean Access',
      detail: 'Follow green LED light indicators towards vacant bays',
      icon: 'arrow_downward',
      distance: 20,
    },
    {
      instruction: 'Destination on Left: Bay P2-B14',
      detail: 'EV Charging & Lift Lobby B are 20m ahead',
      icon: 'local_parking',
      distance: 0,
    },
  ];

  const currentStep = steps[stepIndex];

  // Simulated GPS movement
  useEffect(() => {
    const timer = setInterval(() => {
      setSpeed((prev) => Math.max(24, Math.min(48, prev + (Math.random() > 0.5 ? 2 : -2))));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleNextStep = () => {
    if (stepIndex < steps.length - 1) {
      const nextIdx = stepIndex + 1;
      setStepIndex(nextIdx);
      setDistanceRemaining(steps[nextIdx].distance);
    } else {
      setShowParkedDialog(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060e20] text-white flex flex-col justify-between p-4 pb-[env(safe-area-inset-bottom,16px)] animate-in fade-in duration-300">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between bg-[#1e293b]/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#2563eb] flex items-center justify-center text-white shadow-lg shadow-[#2563eb]/50">
            <span className="material-symbols-outlined text-3xl">
              {currentStep.icon}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-bold font-['Plus_Jakarta_Sans'] leading-tight">
              {currentStep.distance > 0 ? `In ${currentStep.distance}m` : 'Arrived'}
            </span>
            <span className="text-xs text-[#93ccff] font-medium mt-0.5">
              {currentStep.instruction}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Exit navigation"
          className="w-10 h-10 rounded-full bg-[#334155] hover:bg-[#475569] flex items-center justify-center text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Center Simulated Visualizer / Compass HUD */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-4">
        {/* Radar Ring */}
        <div className="relative w-64 h-64 rounded-full border border-[#2563eb]/30 bg-[#131b2e]/60 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-[#4edea3]/20 animate-spin" style={{ animationDuration: '24s' }} />
          
          {/* Compass Needle */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-lg shadow-[#2563eb]/60">
              <span className="material-symbols-outlined text-2xl">navigation</span>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold font-['Plus_Jakarta_Sans']">{speed}</span>
              <span className="text-xs text-[#94a3b8] block">km/h</span>
            </div>
          </div>

          {/* Heading */}
          <div className="absolute top-2 text-[10px] font-bold text-[#94a3b8]">N 012°</div>
          <div className="absolute bottom-2 text-[10px] font-bold text-[#94a3b8]">S</div>
          <div className="absolute left-2 text-[10px] font-bold text-[#94a3b8]">W</div>
          <div className="absolute right-2 text-[10px] font-bold text-[#94a3b8]">E</div>
        </div>

        <div className="mt-4 px-4 py-1.5 rounded-full bg-[#1e293b] border border-white/10 flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
          <span className="text-[#94a3b8]">Heading:</span>
          <span className="font-semibold text-white">{spot.gantryEntrance}</span>
        </div>
      </div>

      {/* Live Carpark Telemetry Floating Pill */}
      <div className="bg-[#1e293b]/95 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4edea3] text-[20px]">
              local_parking
            </span>
            <div className="flex flex-col">
              <span className="text-xs text-[#94a3b8] uppercase font-bold tracking-wider">
                Target Availability
              </span>
              <span className="text-sm font-bold text-white">
                {spot.name}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-lg font-bold font-['Plus_Jakarta_Sans'] text-[#4edea3]">
              {spot.availableLots} Lots
            </span>
            <span className="text-[10px] text-[#93ccff] font-medium">
              {spot.levelInfo}
            </span>
          </div>
        </div>

        {/* Step details & manual trigger */}
        <p className="text-xs text-[#dae2fd] bg-[#131b2e] p-2.5 rounded-xl border border-white/5">
          {currentStep.detail}
        </p>

        {/* Control Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {stepIndex < steps.length - 1 ? (
            <button
              onClick={handleNextStep}
              className="flex-1 h-12 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#2563eb]/40 active:scale-95 transition-all cursor-pointer"
            >
              <span>Next Turn ({steps.length - 1 - stepIndex} left)</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={() => setShowParkedDialog(true)}
              className="flex-1 h-12 bg-[#00a572] hover:bg-[#008f62] text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#00a572]/40 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>I Have Parked Here</span>
            </button>
          )}

          <button
            onClick={() => setShowParkedDialog(true)}
            className="h-12 px-4 rounded-xl bg-[#334155] hover:bg-[#475569] text-white text-xs font-bold"
          >
            Finish Trip
          </button>
        </div>
      </div>

      {/* Parked Vehicle Location Dialog */}
      {showParkedDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#171f33] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-[#dae2fd]">
            <div className="flex items-center gap-2 text-[#4edea3]">
              <span className="material-symbols-outlined text-[24px]">verified</span>
              <h3 className="font-bold text-lg text-white font-['Plus_Jakarta_Sans']">
                Save Parking Location
              </h3>
            </div>

            <p className="text-xs text-[#94a3b8]">
              Record your exact parking spot inside <strong className="text-white">{spot.name}</strong> so you can locate your car easily.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-[#94a3b8]">
                  Level / Floor
                </label>
                <input
                  type="text"
                  value={floorInput}
                  onChange={(e) => setFloorInput(e.target.value)}
                  className="bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#93ccff]"
                  placeholder="e.g. B2, P2"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-[#94a3b8]">
                  Pillar / Bay No.
                </label>
                <input
                  type="text"
                  value={pillarInput}
                  onChange={(e) => setPillarInput(e.target.value)}
                  className="bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#93ccff]"
                  placeholder="e.g. B14, Lot 56"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  onFinishParking(spot, floorInput, pillarInput);
                  onClose();
                }}
                className="flex-1 h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-sm active:scale-95 transition-all shadow-md shadow-[#2563eb]/30"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Save to My Car</span>
              </button>

              <button
                onClick={() => setShowParkedDialog(false)}
                className="h-11 px-3 rounded-xl bg-[#334155] text-[#dae2fd] text-xs font-semibold hover:bg-[#475569]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
