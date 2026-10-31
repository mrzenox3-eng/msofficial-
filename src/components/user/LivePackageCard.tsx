import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Calendar, Share2, Award, AlertCircle } from 'lucide-react';

export const LivePackageCard: React.FC = () => {
  const { activePackage, pendingPackage, dailyUsage } = useAuth();

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '--/--/----';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  if (!activePackage && pendingPackage) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Package Submitted</span>
              <h3 className="text-base font-bold text-white tracking-tight">{pendingPackage.packageName}</h3>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 border border-amber-500/40 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Awaiting Admin Acceptance</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-2 mb-3">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Payment Method:</span>
            <span className="font-semibold text-white">{pendingPackage.paymentMethod}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Sender Account:</span>
            <span className="font-mono text-slate-200">{pendingPackage.senderAccountName}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Amount:</span>
            <span className="font-bold text-emerald-400 font-mono">Rs. {pendingPackage.price.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Submitted:</span>
            <span className="text-slate-400 font-mono">{formatDate(pendingPackage.createdAt)}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-900/50 text-[11px] text-amber-300/90 flex items-center gap-2">
          <span className="text-sm">🔒</span>
          <span>
            <strong>Locked:</strong> Page Invite and Check In / Check Out are currently locked. When the admin accepts your submission, both will unlock automatically 🔓!
          </span>
        </div>
      </div>
    );
  }

  if (!activePackage) {
    return (
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border-2 border-indigo-500/40 hover:border-indigo-500/60 rounded-3xl p-5 sm:p-6 text-center shadow-xl shadow-indigo-950/30 transition-all">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 mx-auto flex items-center justify-center text-indigo-400 mb-2.5 shadow-md shadow-indigo-950/50">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm sm:text-base font-extrabold text-white mb-1">No Active Package — Features Locked 🔒</h3>
        <p className="text-xs text-indigo-200/80 max-w-sm mx-auto mb-2">
          Activate a weekly or monthly package below to unlock Page Invite, Daily Attendance Check-In (+ Rs. 5/day), and referral commissions!
        </p>
      </div>
    );
  }

  const isMonthly = activePackage.packageId === 'monthly';
  const dailyInviteLimit = isMonthly ? 10 : 5;
  const bonus = isMonthly ? '20%' : '10%';

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Current Plan</span>
            <h3 className="text-base font-bold text-white tracking-tight">{activePackage.packageName}</h3>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80">
        <div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold mb-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>Start Date</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-200 font-mono">
            {formatDate(activePackage.startDate)}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold mb-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>Expiry Date</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
            {formatDate(activePackage.expiryDate)}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold mb-1">
            <Share2 className="w-3 h-3 text-slate-500" />
            <span>Daily Invites</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-200 font-mono">
            {dailyUsage ? `${dailyUsage.invitesUsed} / ${dailyInviteLimit}` : dailyInviteLimit}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold mb-1">
            <Award className="w-3 h-3 text-slate-500" />
            <span>Bonus</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-amber-400 font-mono">{bonus}</div>
        </div>
      </div>
    </div>
  );
};
