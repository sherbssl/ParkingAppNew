import React from 'react';
import { ScreenTab } from '../types';

interface BottomNavProps {
  activeTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
  savedCount?: number;
  hasActiveSession?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  savedCount = 0,
  hasActiveSession = false,
}) => {
  const navItems: { id: ScreenTab; label: string; icon: string; badge?: boolean }[] = [
    { id: 'explore', label: 'Explore', icon: 'near_me' },
    { id: 'calculator', label: 'Calculator', icon: 'calculate' },
    { id: 'saved', label: 'Saved', icon: 'bookmark', badge: hasActiveSession || savedCount > 0 },
    { id: 'profile', label: 'Profile', icon: 'account_circle' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-[env(safe-area-inset-bottom,0px)] bg-[#0b1326]/90 backdrop-blur-xl border-t border-white/[0.08] shadow-[0_-2px_12px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px] w-16 h-full gap-1 transition-all duration-150 ${
                isActive
                  ? 'text-[#93ccff] font-bold scale-[1.03]'
                  : 'text-[#bfc7d2] hover:text-[#dae2fd]'
              }`}
            >
              <div className="relative">
                <span className={`material-symbols-outlined text-[22px] transition-transform ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                {item.badge && item.id === 'saved' && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-[#4edea3] ring-2 ring-[#0b1326]" />
                )}
              </div>
              <span className="font-['Inter'] text-[11px] font-semibold tracking-wide">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
