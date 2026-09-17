import React, { useState } from 'react';
import { ParkingSpot } from '../types';

interface CalculatorViewProps {
  spots: ParkingSpot[];
  onSelectSpot: (spot: ParkingSpot) => void;
  onStartNavigation: (spot: ParkingSpot) => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  spots,
  onSelectSpot,
  onStartNavigation,
}) => {
  const [selectedSpotId, setSelectedSpotId] = useState<string>('mbfc');
  const [vehicleType, setVehicleType] = useState<'car' | 'motorcycle' | 'ev'>('car');
  const [durationMinutes, setDurationMinutes] = useState<number>(150); // 2.5 hours = 150 mins
  const [dayType, setDayType] = useState<'weekday_day' | 'weekday_night' | 'weekend'>('weekday_day');
  const [useGracePeriod, setUseGracePeriod] = useState<boolean>(true);

  const selectedSpot = spots.find((s) => s.id === selectedSpotId) || spots[0];

  // Calculate fee for any spot with selected duration and dayType
  const computeSpotFee = (spot: ParkingSpot, minutes: number, day: string) => {
    let billableMins = minutes;
    if (useGracePeriod && billableMins <= 10) {
      return { total: 0, formula: 'Free (Within 10 min grace period)' };
    }

    // Motorcycle rate modifier
    const vehicleMultiplier = vehicleType === 'motorcycle' ? 0.4 : 1.0;

    if (spot.rate.tariffType === 'ura_coupon') {
      let blockPrice = 1.2;
      if (day === 'weekday_night') blockPrice = 0.6;
      if (day === 'weekend') return { total: 0, formula: 'Free on Sundays & Public Holidays' };

      const halfHours = Math.ceil(billableMins / 30);
      const total = Number((halfHours * blockPrice * vehicleMultiplier).toFixed(2));
      return {
        total,
        formula: `${halfHours} × 30m blocks @ $${blockPrice.toFixed(2)}`,
      };
    }

    // Commercial building calculation
    if (day === 'weekday_night') {
      const flat = 3.5 * vehicleMultiplier;
      return { total: flat, formula: 'Flat evening entry rate' };
    }

    if (day === 'weekend') {
      const flat = 3.5 * vehicleMultiplier;
      const extraHours = Math.max(0, Math.ceil((billableMins - 240) / 60));
      const total = flat + extraHours * 1.5;
      return {
        total: Number(total.toFixed(2)),
        formula: `$3.50 (1st 4h) + ${extraHours}h @ $1.50/h`,
      };
    }

    // Weekday day
    const halfHours = Math.ceil(billableMins / 30);
    let total = halfHours * spot.rate.blockRate * vehicleMultiplier;
    if (spot.rate.allDayCap && total > spot.rate.allDayCap) {
      total = spot.rate.allDayCap;
      return { total, formula: 'Reached daily maximum cap' };
    }
    return {
      total: Number(total.toFixed(2)),
      formula: `${halfHours} blocks of 30 mins @ $${spot.rate.blockRate.toFixed(2)}`,
    };
  };

  const currentResult = computeSpotFee(selectedSpot, durationMinutes, dayType);
  const hoursDisplay = Math.floor(durationMinutes / 60);
  const minsDisplay = durationMinutes % 60;

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-4 pt-4 pb-24 gap-5">
      {/* Header */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#93ccff] text-[24px]">
            calculate
          </span>
          <h1 className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-white">
            Parking Tariff Calculator
          </h1>
        </div>
        <p className="text-xs text-[#94a3b8] mt-1">
          Accurate Singapore URA and commercial CBD parking fee simulation with grace periods &amp; EV rebates.
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-[#1e293b] rounded-2xl p-4 border border-white/[0.06] shadow-xl flex flex-col gap-4">
        {/* Carpark Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
            Selected Car Park
          </label>
          <select
            value={selectedSpotId}
            onChange={(e) => setSelectedSpotId(e.target.value)}
            className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-[#93ccff]"
          >
            {spots.map((spot) => (
              <option key={spot.id} value={spot.id} className="bg-[#1e293b]">
                {spot.name} (${spot.hourlyRate.toFixed(2)}/hr) • {spot.category.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle Type Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
            Vehicle Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setVehicleType('car')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                vehicleType === 'car'
                  ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/40'
                  : 'bg-[#131b2e] text-[#94a3b8] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">directions_car</span>
              <span>Motorcar</span>
            </button>
            <button
              onClick={() => setVehicleType('motorcycle')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                vehicleType === 'motorcycle'
                  ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/40'
                  : 'bg-[#131b2e] text-[#94a3b8] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
              <span>Motorcycle</span>
            </button>
            <button
              onClick={() => setVehicleType('ev')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                vehicleType === 'ev'
                  ? 'bg-[#00a572] text-white shadow-md shadow-[#00a572]/40'
                  : 'bg-[#131b2e] text-[#94a3b8] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">electric_car</span>
              <span>Electric (EV)</span>
            </button>
          </div>
        </div>

        {/* Duration Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
              Estimated Duration
            </label>
            <span className="text-base font-bold font-['Plus_Jakarta_Sans'] text-[#93ccff]">
              {hoursDisplay > 0 ? `${hoursDisplay}h ` : ''}
              {minsDisplay > 0 ? `${minsDisplay}m` : ''}
            </span>
          </div>

          <input
            type="range"
            min="15"
            max="600"
            step="15"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full accent-[#2563eb] cursor-pointer h-2 bg-[#131b2e] rounded-lg"
          />

          {/* Quick preset chips */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
            {[30, 60, 120, 150, 240, 480].map((mins) => (
              <button
                key={mins}
                onClick={() => setDurationMinutes(mins)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                  durationMinutes === mins
                    ? 'bg-[#93ccff] text-[#003351] font-bold'
                    : 'bg-[#131b2e] text-[#94a3b8] hover:text-white'
                }`}
              >
                {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
              </button>
            ))}
          </div>
        </div>

        {/* Day / Time Period */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
            Tariff Period
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setDayType('weekday_day')}
              className={`p-2 rounded-xl text-xs font-medium text-center transition-all ${
                dayType === 'weekday_day'
                  ? 'bg-[#334155] text-[#93ccff] ring-1 ring-[#93ccff]'
                  : 'bg-[#131b2e] text-[#94a3b8] hover:text-white'
              }`}
            >
              Weekday Day (07-17h)
            </button>
            <button
              onClick={() => setDayType('weekday_night')}
              className={`p-2 rounded-xl text-xs font-medium text-center transition-all ${
                dayType === 'weekday_night'
                  ? 'bg-[#334155] text-[#93ccff] ring-1 ring-[#93ccff]'
                  : 'bg-[#131b2e] text-[#94a3b8] hover:text-white'
              }`}
            >
              Evening (Per Entry)
            </button>
            <button
              onClick={() => setDayType('weekend')}
              className={`p-2 rounded-xl text-xs font-medium text-center transition-all ${
                dayType === 'weekend'
                  ? 'bg-[#334155] text-[#93ccff] ring-1 ring-[#93ccff]'
                  : 'bg-[#131b2e] text-[#94a3b8] hover:text-white'
              }`}
            >
              Weekend / Sunday
            </button>
          </div>
        </div>

        {/* 10 Minute Grace Period Toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">timer</span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">10-Minute Grace Period</span>
              <span className="text-[10px] text-[#94a3b8]">Free if leaving within 10 minutes</span>
            </div>
          </div>
          <button
            onClick={() => setUseGracePeriod(!useGracePeriod)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
              useGracePeriod ? 'bg-[#00a572]' : 'bg-[#334155]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                useGracePeriod ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Calculated Total Card */}
      <div className="bg-gradient-to-br from-[#1e293b] to-[#171f33] rounded-2xl p-5 border border-[#93ccff]/20 shadow-2xl flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#93ccff]">
              ESTIMATED TOTAL FEE
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-bold font-['Plus_Jakarta_Sans'] text-white">
                ${currentResult.total.toFixed(2)}
              </span>
              <span className="text-xs text-[#94a3b8]">
                SGD • {selectedSpot.shortName}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#2563eb]/20 text-[#93ccff] border border-[#2563eb]/30">
            <span className="material-symbols-outlined text-2xl">receipt_long</span>
          </div>
        </div>

        <div className="bg-[#131b2e] p-3 rounded-xl text-xs flex flex-col gap-1.5 border border-white/5">
          <div className="flex justify-between text-[#94a3b8]">
            <span>Tariff Calculation:</span>
            <span className="text-[#dae2fd] font-medium">{currentResult.formula}</span>
          </div>
          <div className="flex justify-between text-[#94a3b8]">
            <span>Payment Method:</span>
            <span className="text-[#4edea3] font-medium">{selectedSpot.paymentMethod}</span>
          </div>

          {/* Official data.gov.sg tariff rules */}
          <div className="pt-2 mt-1 border-t border-white/5 flex flex-col gap-1 text-[11px]">
            <span className="font-bold text-[#93ccff] uppercase text-[10px] tracking-wider">
              Official Data.gov.sg Tariff Schedule:
            </span>
            <div className="flex justify-between text-[#dae2fd]">
              <span className="text-[#94a3b8]">Weekday Day:</span>
              <span className="text-right max-w-[240px] truncate">{selectedSpot.weekdayDayRate}</span>
            </div>
            <div className="flex justify-between text-[#dae2fd]">
              <span className="text-[#94a3b8]">Weekday Evening:</span>
              <span className="text-right max-w-[240px] truncate">{selectedSpot.eveningRate}</span>
            </div>
            <div className="flex justify-between text-[#dae2fd]">
              <span className="text-[#94a3b8]">Saturday / Sun & PH:</span>
              <span className="text-right max-w-[240px] truncate">{selectedSpot.weekendRate}</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={() => onStartNavigation(selectedSpot)}
            className="flex-1 h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-[#2563eb]/30 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">navigation</span>
            <span>Navigate to {selectedSpot.shortName}</span>
          </button>

          <button
            onClick={() => onSelectSpot(selectedSpot)}
            className="h-11 px-4 rounded-xl bg-[#334155] hover:bg-[#475569] text-white text-xs font-semibold"
          >
            Full Details
          </button>
        </div>
      </div>

      {/* Cross-Comparison Table */}
      <div className="bg-[#1e293b] rounded-2xl p-4 border border-white/[0.06] shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-['Plus_Jakarta_Sans'] text-white flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">compare_arrows</span>
            Side-by-Side Lot Cost Comparison ({hoursDisplay}h {minsDisplay}m)
          </h2>
        </div>

        <div className="divide-y divide-white/5 text-xs">
          {spots.map((spot) => {
            const fee = computeSpotFee(spot, durationMinutes, dayType);
            const isSelected = spot.id === selectedSpotId;

            return (
              <div
                key={spot.id}
                onClick={() => setSelectedSpotId(spot.id)}
                className={`py-2.5 px-2 flex items-center justify-between rounded-xl cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#222a3d]' : 'hover:bg-[#131b2e]'
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{spot.name}</span>
                    {spot.isCheapest && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        Cheapest
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#94a3b8] mt-0.5">
                    {spot.walkingDistanceM}m walk • {spot.availableLots} lots open
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-base font-bold font-['Plus_Jakarta_Sans'] text-white">
                    ${fee.total.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-[#94a3b8]">{spot.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
