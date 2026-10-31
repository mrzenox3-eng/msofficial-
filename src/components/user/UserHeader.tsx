import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme, THEME_OPTIONS } from '../../context/ThemeContext';
import { Headphones, LogOut, User as UserIcon, Phone, ShieldCheck, X, CheckCircle2, AlertCircle, Save, Globe, ExternalLink, Palette } from 'lucide-react';
import { api } from '../../api/client';
import { MaximizeButton } from '../common/MaximizeButton';
import appIcon from '../../assets/images/ms_official_icon_new_1791275507280.jpg';

interface UserHeaderProps {
  onOpenCustomerService: () => void;
  unreadSupportCount?: number;
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  onOpenCustomerService,
  unreadSupportCount = 0,
}) => {
  const { user, logout, refreshUser, activePackage } = useAuth();
  const { theme, setTheme, openThemePicker, activeThemeOption } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleOpenProfile = () => {
    setPhoneInput(user?.phone || '');
    setFeedback(null);
    setIsProfileOpen(true);
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim() || phoneInput.trim().length < 8) {
      setFeedback({ type: 'error', message: 'Please enter a valid phone number (at least 8 digits)' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await api.updatePhoneNumber(phoneInput.trim());
      setFeedback({ type: 'success', message: res.message });
      await refreshUser();
      setTimeout(() => {
        setFeedback(null);
      }, 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update phone number' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b-2 border-cyan-500/30 px-4 py-3 shadow-lg shadow-cyan-950/20 before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-blue-500 before:via-cyan-400 before:to-emerald-400">
        <div className="max-w-xl mx-auto flex items-center justify-between w-full">
          {/* Brand Lockup with App Icon */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-emerald-400 shadow-md shadow-emerald-500/30 shrink-0 bg-slate-900 ring-2 ring-emerald-500/40">
              <img
                src={appIcon}
                alt="MS Official Icon"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white leading-none">MS Official</h1>
              {activePackage?.packageId === 'monthly' ? (
                <div className="flex items-center gap-1 mt-0.5">
                  {theme === 'gold' ? (
                    <span className="text-[10px] text-amber-300 font-black font-mono flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40">
                      👑 1M VIP GOLD
                    </span>
                  ) : theme === 'silver' ? (
                    <span className="text-[10px] text-slate-100 font-black font-mono flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-500/20 border border-slate-400/40">
                      🥈 1M VIP SILVER
                    </span>
                  ) : theme === 'diamond' ? (
                    <span className="text-[10px] text-cyan-300 font-black font-mono flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40">
                      💎 1M VIP DIAMOND
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-300 font-black font-mono flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40">
                      👑 1M VIP Member
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-emerald-400 font-bold tracking-tight mt-0.5 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Verified Member</span>
                </p>
              )}
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            {/* Color Theme Selector Palette Button with live color indicator */}
            <button
              onClick={openThemePicker}
              className="p-2 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white border-2 border-emerald-500/50 hover:border-emerald-400 transition-all flex items-center justify-center cursor-pointer text-xs relative group shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/30 active:scale-95"
              title={`Color Theme: ${activeThemeOption.name} (Click to change)`}
              aria-label="Open Theme Palette"
            >
              <Palette className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span
                className="w-2.5 h-2.5 rounded-full absolute -top-0.5 -right-0.5 border border-slate-900 shadow-sm"
                style={{ backgroundColor: activeThemeOption.accentColor }}
              />
            </button>

            {/* Maximize Full Adjust Screen Button */}
            <MaximizeButton variant="header" />

            {/* User Profile / Logout */}
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
              <button
                onClick={handleOpenProfile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-emerald-950/50 hover:from-blue-900/60 hover:to-emerald-900/50 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer group shadow-xs"
                title="Click to view & update your profile phone number"
              >
                <UserIcon className="w-3.5 h-3.5 text-cyan-400 group-hover:text-emerald-400 transition-colors" />
                <span className="text-xs font-bold text-slate-100 max-w-[80px] sm:max-w-[120px] truncate">
                  {user?.name || 'User'}
                </span>
              </button>

              <button
                onClick={logout}
                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500 transition-all cursor-pointer shadow-xs"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* User Profile & Real Phone Number Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-2xl shadow-emerald-950/50 relative">
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">{user?.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
              </div>
            </div>

            {feedback && (
              <div
                className={`mb-4 p-3 rounded-2xl text-xs flex items-center gap-2 border ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-red-950/60 border-red-800 text-red-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSavePhone} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Real Phone Number (Synced with Backend)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    type="tel"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  This phone number is instantly displayed in the Admin Directory for payment verifications & customer support.
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Referral Code:</span>
                <span className="text-emerald-400 font-bold">{user?.referralCode}</span>
              </div>

              {/* Official Website Domains */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    Official Website Domains
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Live</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href="https://msofficial.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-200 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span className="font-mono text-[11px] truncate">msofficial.com</span>
                    <ExternalLink className="w-3 h-3 text-emerald-400 shrink-0" />
                  </a>
                  <a
                    href="https://786msofficial.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-200 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span className="font-mono text-[11px] truncate">786msofficial.com</span>
                    <ExternalLink className="w-3 h-3 text-amber-400 shrink-0" />
                  </a>
                </div>
              </div>

              {/* Color Theme Preference Suite Setting */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Theme & Colors</span>
                    <span className="text-[10px] text-slate-400">Current: {activeThemeOption.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={openThemePicker}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer text-slate-200 transition-colors shadow-sm"
                  >
                    <Palette className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Choose Skin</span>
                  </button>
                </div>

                {/* Quick theme selector chips */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 pt-0.5">
                  {THEME_OPTIONS.slice(0, 6).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (t.isOneMonthVipOnly && activePackage?.packageId !== 'monthly') {
                          openThemePicker();
                        } else {
                          setTheme(t.id);
                        }
                      }}
                      className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        theme === t.id
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/30'
                          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                      }`}
                      title={t.name}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: t.accentColor }}
                      />
                      <span className="text-[9px] font-semibold text-slate-300 truncate w-full text-center">
                        {t.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] disabled:opacity-50 text-slate-950 font-black rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>{isSaving ? 'Saving to Backend...' : 'SAVE REAL PHONE NUMBER'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
