import React from 'react';
import { Home, Share2, ReceiptText, User } from 'lucide-react';

export type NavTab = 'home' | 'refer' | 'records' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'home', label: 'HOME', bnLabel: 'হোম', icon: Home },
    { id: 'refer', label: 'REFER', bnLabel: 'রেফার', icon: Share2 },
    { id: 'records', label: 'RECORDS', bnLabel: 'হিসাব', icon: ReceiptText },
    { id: 'profile', label: 'PROFILE', bnLabel: 'প্রোফাইল', icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#091226]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id as NavTab)}
              className={`relative py-1 flex flex-col items-center justify-center rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Pill Glow */}
              {isActive && (
                <div className="absolute inset-0 bg-emerald-500/10 rounded-xl border border-emerald-500/20" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'scale-100'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-sm shadow-emerald-400" />
                )}
              </div>

              <span className="text-[10px] tracking-wide mt-1 z-10">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
