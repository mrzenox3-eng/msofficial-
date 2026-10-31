import React from 'react';
import { Home, Package, UserPlus, Wallet, Headphones, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type UserTab = 'home' | 'packages' | 'invite' | 'wallet' | 'support';

interface UserBottomNavProps {
  currentTab: UserTab;
  onTabChange: (tab: UserTab) => void;
  unreadSupportCount?: number;
}

export const UserBottomNav: React.FC<UserBottomNavProps> = ({
  currentTab,
  onTabChange,
  unreadSupportCount = 0,
}) => {
  const { isPackageUnlocked, pendingPackage } = useAuth();

  const tabs = [
    {
      id: 'home' as UserTab,
      label: 'Home',
      icon: Home,
      glow: 'shadow-emerald-500/20 text-emerald-400',
      activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    {
      id: 'packages' as UserTab,
      label: 'Packages',
      icon: Package,
      glow: 'shadow-amber-500/20 text-amber-400',
      activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/30',
      dot: 'bg-amber-400',
    },
    {
      id: 'invite' as UserTab,
      label: isPackageUnlocked ? 'Invite' : 'Invite 🔒',
      icon: UserPlus,
      isCenterHero: true,
      locked: !isPackageUnlocked,
      isPending: Boolean(pendingPackage && !isPackageUnlocked),
      glow: 'shadow-cyan-500/30 text-cyan-300',
      activeBg: 'bg-gradient-to-b from-cyan-500/25 to-blue-500/20 border-cyan-400/60 text-cyan-200 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-950/80',
      dot: 'bg-cyan-400',
    },
    {
      id: 'wallet' as UserTab,
      label: 'Wallet',
      icon: Wallet,
      glow: 'shadow-teal-500/20 text-teal-400',
      activeBg: 'bg-teal-500/15 border-teal-500/40 text-teal-300 ring-1 ring-teal-500/30',
      dot: 'bg-teal-400',
    },
    {
      id: 'support' as UserTab,
      label: 'Support',
      icon: Headphones,
      badge: unreadSupportCount,
      glow: 'shadow-sky-500/20 text-sky-400',
      activeBg: 'bg-sky-500/15 border-sky-500/40 text-sky-300 ring-1 ring-sky-500/30',
      dot: 'bg-sky-400',
    },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 pointer-events-none pb-safe">
      <div className="max-w-xl mx-auto px-2 sm:px-3 pb-1.5 sm:pb-2.5 pointer-events-auto">
        <nav
          className="bg-slate-950/95 backdrop-blur-2xl border-2 border-slate-800/90 rounded-3xl shadow-[0_-6px_25px_rgba(0,0,0,0.6),0_12px_35px_rgba(0,0,0,0.85)] relative overflow-hidden transition-all duration-300"
          aria-label="Bottom Navigation"
        >
          {/* Animated Multi-Color Neon Accent Top Runner */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 via-emerald-400 to-amber-400 animate-neon-sweep" />

          <div className="grid grid-cols-5 h-[4.25rem] sm:h-18 items-center px-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`min-h-[48px] w-full flex flex-col items-center justify-center py-1 group cursor-pointer relative select-none transition-transform duration-150 active:scale-90 ${
                    tab.isCenterHero ? '-mt-1' : ''
                  }`}
                  aria-label={tab.label}
                >
                  {/* Tab Icon Pill */}
                  <div
                    className={`relative p-2 rounded-2xl border transition-all duration-300 flex items-center justify-center ${
                      isActive
                        ? `${tab.activeBg} scale-105 shadow-md -translate-y-0.5 animate-nav-pop`
                        : tab.isCenterHero
                        ? 'border-cyan-500/30 bg-cyan-950/30 text-cyan-300 hover:border-cyan-400/50 hover:bg-cyan-900/40'
                        : 'border-transparent text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8] group-hover:scale-105'
                      }`}
                    />

                    {/* Active Floating Bottom Dot */}
                    {isActive && (
                      <span
                        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 ${tab.dot} rounded-full shadow-sm animate-pulse`}
                      />
                    )}

                    {/* Locked Badge */}
                    {tab.locked && (
                      <span
                        className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold border border-slate-950 shadow-xs ${
                          tab.isPending ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-slate-700 text-slate-300'
                        }`}
                        title={tab.isPending ? 'Pending admin approval' : 'Package required'}
                      >
                        <Lock className="w-2 h-2" />
                      </span>
                    )}

                    {/* Notification Badge */}
                    {tab.badge && tab.badge > 0 ? (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-full text-[9px] font-black flex items-center justify-center border-2 border-slate-950 shadow-md animate-pulse">
                        {tab.badge}
                      </span>
                    ) : null}
                  </div>

                  {/* Tab Label */}
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold tracking-tight mt-0.5 transition-colors truncate max-w-full px-0.5 ${
                      isActive
                        ? tab.glow
                        : tab.isCenterHero
                        ? 'text-cyan-400/90'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

