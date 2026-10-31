import React, { useState } from 'react';
import { useTheme, THEME_OPTIONS, Theme } from '../../context/ThemeContext';
import { useAuthSafe } from '../../context/AuthContext';
import { Palette, Check, X, Sparkles, Crown, Lock, ArrowRight } from 'lucide-react';

export const ThemeModal: React.FC = () => {
  const { theme, setTheme, isThemePickerOpen, closeThemePicker } = useTheme();
  const auth = useAuthSafe();
  const activePackage = auth?.activePackage;
  const [vipNotice, setVipNotice] = useState<string | null>(null);

  if (!isThemePickerOpen) return null;

  const isAdmin = typeof window !== 'undefined' && Boolean(localStorage.getItem('ms_admin_token'));
  const isOneMonthMember = activePackage?.packageId === 'monthly' || isAdmin;

  const handleSelectTheme = (themeId: Theme, isOneMonthVipOnly?: boolean) => {
    if (isOneMonthVipOnly && !isOneMonthMember) {
      setVipNotice(
        '🔒 Exclusive to One Month VIP Members! Upgrade your plan to the One Month Package (Rs. 1,000) to activate Gold, Silver, and Diamond skins.'
      );
      return;
    }
    setVipNotice(null);
    setTheme(themeId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={closeThemePicker}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative my-6 text-slate-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  Appearance Suite
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-[10px] text-amber-400 font-mono font-semibold flex items-center gap-1">
                  <Crown className="w-3 h-3" /> VIP Skins Available
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Select Visual Skin</h3>
            </div>
          </div>

          <button
            onClick={closeThemePicker}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close theme picker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* VIP Lock Warning Notification if clicked without One Month package */}
        {vipNotice && (
          <div className="mb-3.5 p-3.5 bg-gradient-to-r from-amber-950/80 to-yellow-950/60 border border-amber-500/50 rounded-2xl text-xs text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-in fade-in">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{vipNotice}</span>
            </div>
            <button
              onClick={() => {
                closeThemePicker();
                window.location.search = '?tab=packages';
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-xl shrink-0 flex items-center gap-1 shadow-md transition-all cursor-pointer"
            >
              <span>Get 1-Month Plan</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Theme List */}
        <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
          {/* Section: Standard Brand Themes */}
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 font-mono">
            Standard Themes
          </div>
          {THEME_OPTIONS.filter((t) => !t.isOneMonthVipOnly).map((opt) => {
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectTheme(opt.id, false)}
                className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden shadow-inner shrink-0"
                    style={{ backgroundColor: opt.canvasColor }}
                  >
                    <div
                      className="w-5 h-5 rounded-lg border border-white/20 shadow-sm"
                      style={{ backgroundColor: opt.cardColor }}
                    />
                    <div
                      className="w-2.5 h-2.5 rounded-full absolute bottom-1 right-1 border border-black/40"
                      style={{ backgroundColor: opt.accentColor }}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                        {opt.name}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium shrink-0">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug mt-0.5 truncate">
                      {opt.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center pl-2 shrink-0">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-800 group-hover:border-slate-600" />
                  )}
                </div>
              </button>
            );
          })}

          {/* Section: One Month VIP Exclusive Skins */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider font-mono flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                One Month VIP Exclusive Skins
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isOneMonthMember
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}>
                {isOneMonthMember ? '👑 Unlocked' : '🔒 1-Month Plan Only'}
              </span>
            </div>

            <div className="space-y-2.5">
              {THEME_OPTIONS.filter((t) => t.isOneMonthVipOnly).map((opt) => {
                const isSelected = theme === opt.id;
                const isGold = opt.id === 'gold';
                const isSilver = opt.id === 'silver';
                const isDiamond = opt.id === 'diamond';

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectTheme(opt.id, true)}
                    className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer group relative overflow-hidden ${
                      isSelected
                        ? isGold
                          ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-950/60 ring-2 ring-amber-400/40'
                          : isSilver
                          ? 'bg-slate-800/90 border-slate-300 shadow-lg shadow-slate-900 ring-2 ring-slate-300/40'
                          : 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-950/60 ring-2 ring-cyan-400/40'
                        : isOneMonthMember
                        ? 'bg-slate-950/80 border-slate-800 hover:border-amber-500/40'
                        : 'bg-slate-950/40 border-slate-800/60 opacity-80 hover:opacity-100 hover:border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Luxury Swatch Preview */}
                      <div
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center relative overflow-hidden shadow-inner shrink-0 ${
                          isGold
                            ? 'border-amber-500/40 shadow-amber-950/50'
                            : isSilver
                            ? 'border-slate-400/40 shadow-slate-900'
                            : 'border-cyan-400/40 shadow-cyan-950/50'
                        }`}
                        style={{ backgroundColor: opt.canvasColor }}
                      >
                        <div
                          className="w-5 h-5 rounded-lg border border-white/30 shadow-sm"
                          style={{ backgroundColor: opt.cardColor }}
                        />
                        <div
                          className="w-3 h-3 rounded-full absolute bottom-1 right-1 border border-black/40 shadow-sm"
                          style={{ backgroundColor: opt.accentColor }}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold transition-colors truncate ${
                            isGold ? 'text-amber-300' : isSilver ? 'text-slate-100' : 'text-cyan-300'
                          }`}>
                            {opt.name}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold font-mono shrink-0 ${
                            isGold
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : isSilver
                              ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug mt-0.5 truncate">
                          {opt.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center pl-2 shrink-0">
                      {isSelected ? (
                        <div className={`w-6 h-6 rounded-full text-slate-950 flex items-center justify-center shadow-sm font-bold ${
                          isGold ? 'bg-amber-400' : isSilver ? 'bg-slate-200' : 'bg-cyan-400'
                        }`}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : !isOneMonthMember ? (
                        <div className="p-1 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-400">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-700 group-hover:border-amber-400/50" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>VIP Skins require 1-Month Package</span>
          </span>
          <button
            onClick={closeThemePicker}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-sm shrink-0"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
