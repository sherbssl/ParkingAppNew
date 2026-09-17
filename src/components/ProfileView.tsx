import React, { useState } from 'react';
import { DEFAULT_VEHICLE } from '../data/mockParkingData';

export const ProfileView: React.FC = () => {
  const [vehicle, setVehicle] = useState(DEFAULT_VEHICLE);
  const [lowSpotAlert, setLowSpotAlert] = useState<boolean>(true);
  const [evPreference, setEvPreference] = useState<boolean>(false);
  const [autoSessionLogging, setAutoSessionLogging] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-4 pt-4 pb-24 gap-5">
      {/* Header */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#93ccff] text-[24px]">
            account_circle
          </span>
          <h1 className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-white">
            Driver &amp; Vehicle Profile
          </h1>
        </div>
        <p className="text-xs text-[#94a3b8] mt-1">
          Manage your Singapore vehicle IU, automatic Parking.sg billing, and telemetry preferences.
        </p>
      </div>

      {/* Driver Card */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-white/[0.08] shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-[#93ccff] text-[#003351] font-bold text-xl flex items-center justify-center shadow-lg shadow-[#93ccff]/20">
            AT
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
              Alexander Tan
            </span>
            <span className="text-xs text-[#94a3b8]">sherblinks@gmail.com</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
              <span className="text-[11px] font-semibold text-[#4edea3]">
                Verified Singapore Driver
              </span>
            </div>
          </div>
        </div>

        <div className="px-3 py-1 rounded-xl bg-[#131b2e] border border-white/5 text-[11px] text-[#93ccff] font-bold">
          ParkPulse Pro
        </div>
      </div>

      {/* Vehicle Registration & In-Vehicle Unit (IU) */}
      <form onSubmit={handleSaveProfile} className="bg-[#1e293b] rounded-2xl p-5 border border-white/[0.08] shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-['Plus_Jakarta_Sans'] text-white flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#2563eb]">directions_car</span>
            Registered Vehicle &amp; IU Device
          </h2>
          <span className="text-[10px] text-[#4edea3] bg-[#00a572]/20 px-2 py-0.5 rounded-full font-bold">
            ERP 2.0 Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-[#94a3b8]">
              Vehicle Plate Number
            </label>
            <input
              type="text"
              value={vehicle.plate}
              onChange={(e) => setVehicle({ ...vehicle, plate: e.target.value })}
              className="bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-[#93ccff]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-[#94a3b8]">
              Vehicle Model
            </label>
            <input
              type="text"
              value={vehicle.model}
              onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
              className="bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#93ccff]"
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-[10px] uppercase font-bold text-[#94a3b8]">
              In-Vehicle Unit (IU) / OBU ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={vehicle.iuNumber}
                onChange={(e) => setVehicle({ ...vehicle, iuNumber: e.target.value })}
                className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold tracking-widest focus:outline-none focus:border-[#93ccff]"
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-[#4edea3] font-bold">
                EPS Synced
              </span>
            </div>
            <span className="text-[10px] text-[#94a3b8]">
              Used for automated gantry entry deduction at MBFC, MBS, and URA barrier gantries.
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="mt-1 h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-[#2563eb]/30"
        >
          {savedSuccess ? 'Vehicle Details Saved ✓' : 'Update Vehicle Details'}
        </button>
      </form>

      {/* Parking Services Integration */}
      <div className="bg-[#1e293b] rounded-2xl p-4 border border-white/[0.08] shadow-xl flex flex-col gap-3">
        <h2 className="text-sm font-bold font-['Plus_Jakarta_Sans'] text-white flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-[#4edea3]">link</span>
          Digital Mobility Integrations
        </h2>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-[#131b2e] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white font-bold text-xs">
                P.sg
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white">Parking.sg Digital Coupons</span>
                <span className="text-[10px] text-[#94a3b8]">Auto-start street parking coupons</span>
              </div>
            </div>
            <span className="text-[11px] text-[#4edea3] font-bold">Connected</span>
          </div>

          <div className="p-3 rounded-xl bg-[#131b2e] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#ff0033] flex items-center justify-center text-white font-bold text-xs">
                DBS
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white">DBS PayLah! Auto-Debit</span>
                <span className="text-[10px] text-[#94a3b8]">Default payment method (•••• 8912)</span>
              </div>
            </div>
            <span className="text-[11px] text-[#93ccff] font-bold">Default</span>
          </div>
        </div>
      </div>

      {/* Driver Preferences Toggles */}
      <div className="bg-[#1e293b] rounded-2xl p-4 border border-white/[0.08] shadow-xl flex flex-col gap-3">
        <h2 className="text-sm font-bold font-['Plus_Jakarta_Sans'] text-white flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-[#ffb95f]">tune</span>
          Smart Driver Alerts
        </h2>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium text-white">Critical Lot Scarcity Alert</span>
              <span className="text-[10px] text-[#94a3b8]">Notify when destination carpark falls below 10 spots</span>
            </div>
            <button
              onClick={() => setLowSpotAlert(!lowSpotAlert)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                lowSpotAlert ? 'bg-[#00a572]' : 'bg-[#334155]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                lowSpotAlert ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex flex-col">
              <span className="font-medium text-white">EV Charging Bay Priority</span>
              <span className="text-[10px] text-[#94a3b8]">Highlight facilities with open Type 2 / CCS2 chargers</span>
            </div>
            <button
              onClick={() => setEvPreference(!evPreference)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                evPreference ? 'bg-[#00a572]' : 'bg-[#334155]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                evPreference ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex flex-col">
              <span className="font-medium text-white">Auto-Log Parked Location</span>
              <span className="text-[10px] text-[#94a3b8]">Automatically mark car location upon gantry entry</span>
            </div>
            <button
              onClick={() => setAutoSessionLogging(!autoSessionLogging)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                autoSessionLogging ? 'bg-[#00a572]' : 'bg-[#334155]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                autoSessionLogging ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
