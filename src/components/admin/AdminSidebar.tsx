import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  Image,
  Wallet,
  Headphones,
  ArrowDownToLine,
  CreditCard,
  Sliders,
  FileText,
  FileSpreadsheet,
  Link2,
  LogOut,
  ShieldAlert,
  ChevronRight,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';
import backendAppIcon from '../../assets/images/ms_backend_icon_1792735023014.jpg';

export type AdminTab =
  | 'dashboard'
  | 'user_data_info'
  | 'users'
  | 'packages'
  | 'screenshots'
  | 'balances'
  | 'support'
  | 'withdrawals'
  | 'payment_settings'
  | 'package_settings'
  | 'audit_logs'
  | 'deployment_links';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  pendingCounts?: {
    payments?: number;
    withdrawals?: number;
    support?: number;
    screenshots?: number;
  };
}

export const BACKEND_ICON_COLORS = [
  {
    id: 'emerald',
    name: 'Emerald Green',
    border: 'border-emerald-500/50 ring-2 ring-emerald-500/20',
    shadow: 'shadow-emerald-950/60',
    text: 'text-emerald-400',
    pulse: 'bg-emerald-400',
    activeBg: 'bg-emerald-500/10',
    activeBorder: 'border-emerald-500/30',
    activeText: 'text-emerald-400',
    chevron: 'text-emerald-400',
    hex: '#10b981',
  },
  {
    id: 'cyan',
    name: 'Electric Cyan',
    border: 'border-cyan-500/50 ring-2 ring-cyan-500/20',
    shadow: 'shadow-cyan-950/60',
    text: 'text-cyan-400',
    pulse: 'bg-cyan-400',
    activeBg: 'bg-cyan-500/10',
    activeBorder: 'border-cyan-500/30',
    activeText: 'text-cyan-400',
    chevron: 'text-cyan-400',
    hex: '#06b6d4',
  },
  {
    id: 'indigo',
    name: 'Royal Indigo',
    border: 'border-indigo-500/50 ring-2 ring-indigo-500/20',
    shadow: 'shadow-indigo-950/60',
    text: 'text-indigo-400',
    pulse: 'bg-indigo-400',
    activeBg: 'bg-indigo-500/10',
    activeBorder: 'border-indigo-500/30',
    activeText: 'text-indigo-400',
    chevron: 'text-indigo-400',
    hex: '#6366f1',
  },
  {
    id: 'amber',
    name: 'Gold Amber',
    border: 'border-amber-500/50 ring-2 ring-amber-500/20',
    shadow: 'shadow-amber-950/60',
    text: 'text-amber-400',
    pulse: 'bg-amber-400',
    activeBg: 'bg-amber-500/10',
    activeBorder: 'border-amber-500/30',
    activeText: 'text-amber-400',
    chevron: 'text-amber-400',
    hex: '#f59e0b',
  },
  {
    id: 'purple',
    name: 'Neon Purple',
    border: 'border-purple-500/50 ring-2 ring-purple-500/20',
    shadow: 'shadow-purple-950/60',
    text: 'text-purple-400',
    pulse: 'bg-purple-400',
    activeBg: 'bg-purple-500/10',
    activeBorder: 'border-purple-500/30',
    activeText: 'text-purple-400',
    chevron: 'text-purple-400',
    hex: '#a855f7',
  },
  {
    id: 'rose',
    name: 'Rose Red',
    border: 'border-rose-500/50 ring-2 ring-rose-500/20',
    shadow: 'shadow-rose-950/60',
    text: 'text-rose-400',
    pulse: 'bg-rose-400',
    activeBg: 'bg-rose-500/10',
    activeBorder: 'border-rose-500/30',
    activeText: 'text-rose-400',
    chevron: 'text-rose-400',
    hex: '#f43f5e',
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  pendingCounts = {},
}) => {
  const { logout, admin } = useAdminAuth();
  const { openThemePicker, activeThemeOption } = useTheme();

  const [iconColorId, setIconColorId] = useState<string>(() => {
    return localStorage.getItem('ms_backend_icon_color') || 'emerald';
  });
  const [showColorPicker, setShowColorPicker] = useState(false);

  const activeColor = BACKEND_ICON_COLORS.find((c) => c.id === iconColorId) || BACKEND_ICON_COLORS[0];

  const handleSelectColor = (id: string) => {
    setIconColorId(id);
    localStorage.setItem('ms_backend_icon_color', id);
    setShowColorPicker(false);
  };

  const navSections = [
    {
      group: 'Overview & Users',
      items: [
        { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'user_data_info' as AdminTab, label: 'User Data Info System', icon: FileSpreadsheet },
        { id: 'users' as AdminTab, label: 'User Directory', icon: Users },
      ],
    },
    {
      group: 'Subscriptions & Proofs',
      items: [
        {
          id: 'packages' as AdminTab,
          label: 'Package Management',
          icon: Package,
          badge: pendingCounts.payments,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
        {
          id: 'screenshots' as AdminTab,
          label: 'Invite Proofs Chat',
          icon: Image,
          badge: pendingCounts.screenshots,
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        },
      ],
    },
    {
      group: 'Finance & Payouts',
      items: [
        { id: 'balances' as AdminTab, label: 'Ledger Balances', icon: Wallet },
        {
          id: 'withdrawals' as AdminTab,
          label: 'Withdrawal Orders',
          icon: ArrowDownToLine,
          badge: pendingCounts.withdrawals,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        },
      ],
    },
    {
      group: 'Communication',
      items: [
        {
          id: 'support' as AdminTab,
          label: 'Live Helpdesk',
          icon: Headphones,
          badge: pendingCounts.support,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
      ],
    },
    {
      group: 'System & Security',
      items: [
        { id: 'payment_settings' as AdminTab, label: 'Payment Settings', icon: CreditCard },
        { id: 'package_settings' as AdminTab, label: 'Package Rules', icon: Sliders },
        { id: 'audit_logs' as AdminTab, label: 'Audit Trail', icon: FileText },
        { id: 'deployment_links' as AdminTab, label: 'Links with Domain', icon: Link2 },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 md:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 w-72 h-screen bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 shrink-0 select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              {/* Backend Brand Icon with Dynamic Border & Glow */}
              <div
                className={`w-11 h-11 rounded-2xl overflow-hidden border ${activeColor.border} shadow-xl ${activeColor.shadow} shrink-0 bg-slate-900 transition-all p-0.5 group`}
              >
                <img
                  src={backendAppIcon}
                  alt="MS Official Backend Core"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight font-sans">MS Official</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${activeColor.pulse} animate-pulse`} />
                  <span className={`text-[10px] ${activeColor.text} font-mono font-bold uppercase tracking-wider`}>
                    Backend Core
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Color Picker Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono group"
                title="Change backend icon color"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: activeColor.hex }}
                />
                <Palette className="w-3 h-3 text-slate-400 group-hover:text-white" />
              </button>

              {/* Color Picker Dropdown Popover */}
              {showColorPicker && (
                <div className="absolute right-0 top-full mt-2 w-48 p-2.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 space-y-1.5 backdrop-blur-xl animate-in fade-in duration-150">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    Select Icon Color
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {BACKEND_ICON_COLORS.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => handleSelectColor(color.id)}
                        className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          iconColorId === color.id
                            ? 'bg-slate-950 border-white/40 ring-1 ring-white/30'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                        }`}
                        title={color.name}
                      >
                        <span
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-[9px] text-slate-300 font-mono truncate max-w-full">
                          {color.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="flex-1 overflow-y-auto p-3 space-y-5">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  {section.group}
                </span>

                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                        isActive
                          ? `${activeColor.activeBg} text-white font-semibold border ${activeColor.activeBorder} shadow-xs`
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? activeColor.activeText : 'text-slate-500 group-hover:text-slate-300'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {Boolean(item.badge && item.badge > 0) && (
                          <span
                            className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold border ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className={`w-3.5 h-3.5 ${activeColor.chevron}`} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Admin Footer Profile & Logout */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60">
          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-center justify-between mb-2">
            <div className="min-w-0 pr-2">
              <div className="text-xs font-bold text-white truncate">{admin?.name || 'Administrator'}</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">{admin?.email}</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-red-950 text-red-300 border border-red-800/60">
              ROOT
            </span>
          </div>

          {/* Quick Theme Switcher */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/90 mb-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0 pr-1">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20"
                style={{ backgroundColor: activeThemeOption.accentColor }}
              />
              <span className="text-[11px] text-slate-300 font-medium truncate">
                {activeThemeOption.name.split(' ')[0]}
              </span>
            </div>
            <button
              onClick={openThemePicker}
              className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white flex items-center gap-1 cursor-pointer text-[10px] font-bold transition-all shadow-sm shrink-0"
              title="Open Theme Palette Suite"
            >
              <Palette className="w-3 h-3 text-emerald-400" />
              <span>Theme</span>
            </button>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminate Admin Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
