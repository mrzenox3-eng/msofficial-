import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Check, Zap, Sparkles, Clock, ArrowRight, ShieldCheck, Lock, Unlock } from 'lucide-react';
import { UserTab } from './UserBottomNav';

interface FunnelProgressStepperProps {
  onNavigateTab: (tab: UserTab) => void;
}

export const FunnelProgressStepper: React.FC<FunnelProgressStepperProps> = ({ onNavigateTab }) => {
  const { user, activePackage, pendingPackage, isPackageUnlocked } = useAuth();

  // Determine current active funnel stage
  // Stage 1: Registered account (always true for logged in user)
  // Stage 2: Select & Pay package
  // Stage 3: Verification pending admin acceptance
  // Stage 4: Package active & features fully unlocked
  let currentStage = 2;
  if (isPackageUnlocked && activePackage) {
    currentStage = 4;
  } else if (pendingPackage) {
    currentStage = 3;
  }

  const stages = [
    {
      num: 1,
      title: 'Member Account',
      subtitle: user ? user.name : 'Registered',
      status: 'completed',
    },
    {
      num: 2,
      title: 'Select Plan',
      subtitle: activePackage ? activePackage.packageName : pendingPackage ? pendingPackage.packageName : 'Weekly or Monthly',
      status: currentStage > 2 ? 'completed' : currentStage === 2 ? 'current' : 'upcoming',
      action: () => onNavigateTab('packages'),
    },
    {
      num: 3,
      title: 'Verification',
      subtitle: activePackage ? 'Verified by Admin' : pendingPackage ? 'Under Review (5-15 min)' : 'Payment Receipt',
      status: currentStage > 3 ? 'completed' : currentStage === 3 ? 'current' : 'upcoming',
      action: () => (pendingPackage ? onNavigateTab('support') : onNavigateTab('packages')),
    },
    {
      num: 4,
      title: 'Earnings Unlocked',
      subtitle: isPackageUnlocked ? 'Attendance + Referrals Active' : 'Locked until approval',
      status: currentStage === 4 ? 'completed' : 'upcoming',
      action: () => (isPackageUnlocked ? onNavigateTab('invite') : onNavigateTab('packages')),
    },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      {/* Header bar of the funnel */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Member Earning Journey
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[10px] text-slate-400">Step {currentStage} of 4</span>
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">Account Activation Progress</h3>
          </div>
        </div>

        <div>
          {currentStage === 4 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
              <Unlock className="w-3 h-3 text-emerald-400" />
              Fully Active
            </span>
          ) : currentStage === 3 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold animate-pulse">
              <Clock className="w-3 h-3 text-amber-400" />
              Under Review
            </span>
          ) : (
            <button
              onClick={() => onNavigateTab('packages')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] transition-all cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <span>Unlock Now</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4-Step Progress Track */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-4">
        {stages.map((st, idx) => {
          const isDone = st.status === 'completed';
          const isCur = st.status === 'current';
          
          // Specific harmonic colors per step
          const stepColors = [
            { done: 'bg-blue-950/30 border-blue-500/40 text-blue-300', cur: 'bg-blue-950/40 border-blue-400 text-blue-300 ring-1 ring-blue-400/40', badgeDone: 'bg-blue-500 text-slate-950', badgeCur: 'bg-blue-500 text-slate-950 animate-pulse' },
            { done: 'bg-amber-950/30 border-amber-500/40 text-amber-300', cur: 'bg-amber-950/40 border-amber-400 text-amber-300 ring-1 ring-amber-400/40', badgeDone: 'bg-amber-500 text-slate-950', badgeCur: 'bg-amber-500 text-slate-950 animate-pulse' },
            { done: 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300', cur: 'bg-emerald-950/40 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400/40', badgeDone: 'bg-emerald-500 text-slate-950', badgeCur: 'bg-emerald-500 text-slate-950 animate-pulse' },
            { done: 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300', cur: 'bg-cyan-950/40 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/40', badgeDone: 'bg-cyan-400 text-slate-950', badgeCur: 'bg-cyan-400 text-slate-950 animate-pulse' },
          ][idx];

          return (
            <div
              key={st.num}
              onClick={st.action}
              className={`p-2 sm:p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                st.action ? 'cursor-pointer hover:border-slate-500' : ''
              } ${
                isDone
                  ? `${stepColors.done} shadow-xs`
                  : isCur
                  ? `${stepColors.cur} shadow-md`
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono ${
                    isDone
                      ? stepColors.badgeDone
                      : isCur
                      ? stepColors.badgeCur
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : st.num}
                </span>
                <span className="text-[9px] font-mono uppercase opacity-85 hidden sm:inline font-bold">
                  {isDone ? '✓ Done' : isCur ? 'Active' : 'Next'}
                </span>
              </div>

              <div>
                <span className="text-[10px] sm:text-[11px] font-extrabold block truncate leading-tight text-white">
                  {st.title}
                </span>
                <span className="text-[9px] block truncate text-slate-300 mt-0.5 font-medium">
                  {st.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Action / Information Banner based on current stage */}
      {currentStage === 2 && (
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                Activate Weekly (Rs. 500) or Monthly (Rs. 1,000)
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                Unlocks daily attendance rewards (Rs. 5/day) and affiliate bonus links.
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('packages')}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <span>Choose Plan</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {currentStage === 3 && (
        <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 animate-pulse">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                Payment Verification in Progress
              </span>
              <span className="text-[10px] text-amber-300/80 block truncate">
                Administrators are verifying your JazzCash/Easypaisa deposit receipt.
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('support')}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <span>Ask Support</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {currentStage === 4 && (
        <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                Active Tier: {activePackage?.packageName} (Valid until {activePackage ? new Date(activePackage.expiryDate).toLocaleDateString('en-GB') : ''})
              </span>
              <span className="text-[10px] text-emerald-300/80 block truncate">
                Check-in daily between 9 AM - 9 PM and share your invite link for referral bonus.
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('invite')}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <span>Invite Friends</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
