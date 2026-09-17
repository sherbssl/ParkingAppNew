import React from 'react';
import { ScreenTab } from '../types';

interface HeaderProps {
  currentTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
  onLocateGps: () => void;
  gpsActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onLocateGps,
  gpsActive,
}) => {
  const getSubTitle = () => {
    switch (currentTab) {
      case 'explore':
        return 'Explore';
      case 'calculator':
        return 'Rate Calculator';
      case 'saved':
        return 'Saved & Parked';
      case 'profile':
        return 'Driver Profile';
      default:
        return 'Explore';
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 pt-[env(safe-area-inset-top,0px)] bg-[#0b1326]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
      <div className="h-16 px-4 max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div 
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => onSelectTab('explore')}
          role="button"
          tabIndex={0}
        >
          <img
            alt="ParkPulse Logo"
            className="h-8 w-auto object-contain drop-shadow-sm"
            src="https://lh3.googleusercontent.com/aida/AEtjO1U5IY66yV-nHEZObGLNRw4Nq5yMExOOixF-qCLM2ci6VaEX_7NXZm_tGuXOeV7PvgfInZW_HCDGpbVbsJV_REMSfhBesrTslLvN9NBM7rVrxJcW-0GdKWTi02EU8eQXjx5tZzoYgl20Klt8tRlRfmPx7NoAOv37SOHHgRwuoeSNfLB3L8wWkAyIZofWkeyqxAoHY_zgz1YH5L6nhbo2HY9NFfsPDjk0IkqKYiu-Qu-XpHdC6d6XnYTUEGs"
          />
          <div className="flex flex-col">
            <span className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#dae2fd] leading-tight tracking-tight">
              ParkPulse
            </span>
            <span className="font-['Inter'] text-[11px] text-[#94a3b8] capitalize font-medium">
              {getSubTitle()}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            aria-label="Locate vehicle or GPS"
            onClick={onLocateGps}
            title="Locate via GPS"
            className={`w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full transition-all duration-200 ${
              gpsActive
                ? 'bg-[#2563eb]/25 text-[#93ccff] border border-[#93ccff]/40 shadow-[0_0_12px_rgba(147,204,255,0.3)]'
                : 'bg-[#171f33] text-[#93ccff] hover:text-white hover:bg-[#222a3d]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {gpsActive ? 'my_location' : 'near_me'}
            </span>
          </button>

          <button
            onClick={() => onSelectTab('profile')}
            aria-label="Open Driver Profile"
            className="w-8 h-8 rounded-full bg-[#93ccff] text-[#003351] flex items-center justify-center hover:ring-2 hover:ring-[#93ccff]/50 transition-all font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};
