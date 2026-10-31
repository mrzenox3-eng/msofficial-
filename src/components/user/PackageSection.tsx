import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { PackageOffer } from '../../types';
import { PaymentModal } from './PaymentModal';
import { Check, Zap, Crown, ShieldCheck, Sparkles, ArrowRight, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PackageSectionProps {
  onOpenPage2?: () => void;
}

export const PackageSection: React.FC<PackageSectionProps> = ({ onOpenPage2 }) => {
  const { refreshUser, activePackage, pendingPackage } = useAuth();
  const [packages, setPackages] = useState<{ weekly: PackageOffer; monthly: PackageOffer } | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<PackageOffer | null>(null);

  const fetchPackages = async () => {
    try {
      const data = await api.getAvailablePackages();
      setPackages(data);
    } catch (e) {
      console.error('Failed to load packages:', e);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return (
    <section className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
            Subscription Plans
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-[10px] text-slate-400">Step 2: Choose Plan</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Choose Your Earning Plan</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Select your subscription tier to unlock daily attendance earnings and affiliate bonus links.
        </p>
      </div>

      {/* Side-by-Side Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ONE WEEK PACKAGE CARD */}
        <div className="glass-card-hover bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-900 border-2 border-blue-500/40 hover:border-blue-400 rounded-3xl p-5 sm:p-6 shadow-xl shadow-blue-950/30 flex flex-col justify-between transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                ONE WEEK PACKAGE
              </span>
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Zap className="w-4 h-4" />
              </div>
            </div>

            <div className="mb-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                Rs. {packages?.weekly.price.toLocaleString() || '500'}
              </span>
              <span className="text-xs text-slate-400 ml-1.5">/ 7 days validity</span>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-800/80 mb-6">
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>7-Day Attendance (Rs. 5/day reward)</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span><strong>5 Daily Invite Links</strong> quota</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span><strong>10% Referral Bonus</strong> on friend packages</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => packages && setSelectedOffer(packages.weekly)}
            className="w-full min-h-[46px] py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-bold rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-blue-900/40 cursor-pointer flex items-center justify-center gap-2 border border-blue-400/30"
          >
            <span>Activate One Week</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ONE MONTH PACKAGE CARD */}
        <div className="glass-card-hover bg-gradient-to-b from-amber-950/40 via-slate-900 to-emerald-950/30 border-2 border-amber-400/60 hover:border-amber-300 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-amber-950/40 flex flex-col justify-between relative overflow-hidden transition-all group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Best Value Badge */}
          <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-wider py-1.5 px-3.5 rounded-bl-2xl shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Best Value · 2x Bonus</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>👑</span>
                <span>ONE MONTH PACKAGE</span>
              </span>
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Crown className="w-4 h-4" />
              </div>
            </div>

            <div className="mb-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                Rs. {packages?.monthly.price.toLocaleString() || '1,000'}
              </span>
              <span className="text-xs text-amber-300/80 ml-1.5">/ 30 days validity</span>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-800/80 mb-6">
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>30-Day Attendance (Rs. 5/day reward)</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span><strong>10 Daily Invite Links</strong> (Double limit)</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span><strong>20% Referral Bonus</strong> (Double commission)</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-amber-300">
                <div className="w-4 h-4 rounded-full bg-amber-500/30 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Crown className="w-3 h-3" />
                </div>
                <span><strong>Gold, Silver & Diamond</strong> VIP Skins Unlocked</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => packages && setSelectedOffer(packages.monthly)}
            className="w-full min-h-[46px] py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-[0.98] text-slate-950 font-black rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-xl shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Activate One Month VIP</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Official JazzCash & Easypaisa accounts. Fast manual & auto verification within 5–15 minutes.</span>
        </div>
        <span className="font-mono text-emerald-400 font-semibold text-[11px] shrink-0">
          24/7 Verified Support
        </span>
      </div>

      {/* Multi-Step Payment Modal */}
      {selectedOffer && (
        <PaymentModal
          packageOffer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onSuccess={(openPage2) => {
            fetchPackages();
            refreshUser();
            if (openPage2 && onOpenPage2) {
              onOpenPage2();
            }
          }}
        />
      )}
    </section>
  );
};
