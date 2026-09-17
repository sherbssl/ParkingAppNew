import React from 'react';
import { ParkingSpot } from '../types';

interface LotDetailModalProps {
  spot: ParkingSpot | null;
  onClose: () => void;
  onStartNavigation: (spot: ParkingSpot) => void;
  isSaved: boolean;
  onToggleSave: (spotId: string) => void;
}

export const LotDetailModal: React.FC<LotDetailModalProps> = ({
  spot,
  onClose,
  onStartNavigation,
  isSaved,
  onToggleSave,
}) => {
  if (!spot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#171f33] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col gap-4 text-[#dae2fd]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Handle & Close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]" />
            <span className="text-xs font-['Inter'] uppercase tracking-wider text-[#94a3b8] font-bold">
              Carpark Intelligence
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close details"
            className="w-8 h-8 rounded-full bg-[#222a3d] hover:bg-[#334155] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Title & Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-white">
                {spot.name}
              </h2>
              {spot.isVerified && (
                <span className="material-symbols-outlined text-[18px] text-[#93ccff]" title="Verified Facility">
                  verified
                </span>
              )}
            </div>
            <p className="text-xs text-[#94a3b8] mt-0.5">{spot.address}</p>
          </div>

          <button
            onClick={() => onToggleSave(spot.id)}
            className={`p-2.5 rounded-xl border transition-all ${
              isSaved
                ? 'bg-[#4edea3]/20 text-[#4edea3] border-[#4edea3]/50'
                : 'bg-[#222a3d] text-white border-white/10 hover:bg-[#334155]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSaved ? 'bookmark_added' : 'bookmark_add'}
            </span>
          </button>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-3 gap-2 py-2">
          <div className="bg-[#1e293b] p-3 rounded-xl border border-white/5 flex flex-col items-center text-center">
            <span className="text-[10px] uppercase tracking-wider text-[#94a3b8]">Live Vacancy</span>
            <span className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#4edea3] mt-1">
              {spot.availableLots}
            </span>
            <span className="text-[10px] text-[#94a3b8]">of {spot.totalLots} lots</span>
          </div>

          <div className="bg-[#1e293b] p-3 rounded-xl border border-white/5 flex flex-col items-center text-center">
            <span className="text-[10px] uppercase tracking-wider text-[#94a3b8]">Walking</span>
            <span className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#93ccff] mt-1">
              {spot.walkingTimeMin} min
            </span>
            <span className="text-[10px] text-[#94a3b8]">{spot.walkingDistanceM}m direct</span>
          </div>

          <div className="bg-[#1e293b] p-3 rounded-xl border border-white/5 flex flex-col items-center text-center">
            <span className="text-[10px] uppercase tracking-wider text-[#94a3b8]">Base Rate</span>
            <span className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#ffb95f] mt-1">
              ${spot.hourlyRate.toFixed(2)}
            </span>
            <span className="text-[10px] text-[#94a3b8]">per hour</span>
          </div>
        </div>

        {/* Level Occupancy Breakdown (if building) */}
        {spot.category === 'building' && (
          <div className="bg-[#1e293b] p-3.5 rounded-xl border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#93ccff]">layers</span>
                Live Floor Occupancy
              </span>
              <span className="text-[11px] text-[#4edea3]">Sensor verified</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#dae2fd]">
                <span>Basement 1 (Drop-off & VIP)</span>
                <span className="text-rose-400 font-medium">Full (0 open)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#0b1326] overflow-hidden">
                <div className="h-full bg-rose-500 w-full" />
              </div>

              <div className="flex items-center justify-between text-[#dae2fd] pt-1">
                <span>Basement 2 (Standard Lots)</span>
                <span className="text-[#4edea3] font-medium">88 lots open</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#0b1326] overflow-hidden">
                <div className="h-full bg-[#4edea3] w-[45%]" />
              </div>

              <div className="flex items-center justify-between text-[#dae2fd] pt-1">
                <span>Basement 3 & 4 (EV & Subterranean)</span>
                <span className="text-[#4edea3] font-medium">54 lots open</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#0b1326] overflow-hidden">
                <div className="h-full bg-[#4edea3] w-[35%]" />
              </div>
            </div>
          </div>
        )}

        {/* Tariff Schedule */}
        <div className="bg-[#1e293b] p-3.5 rounded-xl border border-white/5 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <span className="material-symbols-outlined text-[16px] text-[#ffb95f]">payments</span>
            Official URA / Operator Tariff Schedule
          </div>
          <div className="space-y-1.5 text-xs text-[#dae2fd]">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-[#94a3b8]">Weekday Daytime</span>
              <span className="font-medium text-white">{spot.weekdayDayRate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-[#94a3b8]">Evening (Post 17:00 / 19:00)</span>
              <span className="font-medium text-white">{spot.eveningRate}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#94a3b8]">Saturdays & Sundays</span>
              <span className="font-medium text-white">{spot.weekendRate}</span>
            </div>
          </div>
        </div>

        {/* Entrance & Physical Specs */}
        <div className="bg-[#1e293b] p-3.5 rounded-xl border border-white/5 flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <span className="material-symbols-outlined text-[16px] text-[#4edea3]">meeting_room</span>
            Access &amp; Gantry Details
          </div>
          <p className="text-[#dae2fd]">
            <strong className="text-white">Entrance Gantry:</strong> {spot.gantryEntrance}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {spot.maxHeightM && (
              <span className="px-2 py-1 rounded bg-[#334155] text-amber-300">
                Max Height: {spot.maxHeightM}m
              </span>
            )}
            <span className="px-2 py-1 rounded bg-[#334155] text-[#93ccff]">
              Payment: {spot.paymentMethod}
            </span>
            <span className="px-2 py-1 rounded bg-[#334155] text-emerald-300">
              Grace Period: 10 mins free
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onStartNavigation(spot);
            }}
            className="flex-1 h-12 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#2563eb]/40 active:scale-95 transition-all text-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">navigation</span>
            <span>Direct Navigation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
