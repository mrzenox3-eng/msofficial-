import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { AttendanceStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle2, AlertTriangle, LogIn, LogOut, Calendar, Lock, Unlock, ShieldAlert } from 'lucide-react';

export const DailyAttendanceCard: React.FC = () => {
  const { activePackage, pendingPackage, isPackageUnlocked, refreshUser } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<'in' | 'out' | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = await api.getTodayAttendance();
      setAttendance(data);
    } catch (e: any) {
      console.error('Failed to load attendance:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();

    // Clock ticker
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isAttendanceUnlocked = Boolean(
    isPackageUnlocked || (attendance?.isUnlocked && activePackage?.status === 'active')
  );
  const isPendingVerification = Boolean(
    pendingPackage || (!isAttendanceUnlocked && attendance?.packageStatus === 'pending_verification')
  );

  const handleCheckIn = async () => {
    setFeedback(null);
    if (!isAttendanceUnlocked) {
      setFeedback({
        type: 'error',
        message: isPendingVerification
          ? 'Check-In is locked 🔒. Your package submission is pending admin acceptance. Once approved, it will unlock automatically!'
          : 'Check-In is locked 🔒. An active package accepted by the admin is required.',
      });
      return;
    }

    setActionLoading('in');
    try {
      const res = await api.checkIn();
      setFeedback({ type: 'success', message: res.message });
      await fetchAttendance();
      await refreshUser();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Check-in failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async () => {
    setFeedback(null);
    if (!isAttendanceUnlocked) {
      setFeedback({
        type: 'error',
        message: isPendingVerification
          ? 'Check-Out is locked 🔒. Your package submission is pending admin acceptance. Once approved, it will unlock automatically!'
          : 'Check-Out is locked 🔒. An active package accepted by the admin is required.',
      });
      return;
    }

    setActionLoading('out');
    try {
      const res = await api.checkOut();
      setFeedback({ type: 'success', message: res.message });
      await fetchAttendance();
      await refreshUser();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Check-out failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const isCheckedIn = attendance?.status === 'checked_in';
  const isCheckedOut = attendance?.status === 'checked_out';
  const canCheckIn = isAttendanceUnlocked && attendance?.withinHours && attendance?.status === 'not_checked_in';
  const canCheckOut = isAttendanceUnlocked && attendance?.withinHours && attendance?.status === 'checked_in';

  const getStatusDisplay = () => {
    if (!isAttendanceUnlocked) {
      if (isPendingVerification) {
        return {
          label: 'Locked · Pending Admin Approval',
          dot: 'text-amber-400',
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        };
      }
      return {
        label: 'Locked · Package Required',
        dot: 'text-red-400',
        bg: 'bg-red-500/10 text-red-300 border-red-500/20',
      };
    }
    if (!attendance?.withinHours) {
      return {
        label: 'Outside Allowed Hours',
        dot: 'text-amber-500',
        bg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      };
    }
    if (isCheckedOut) {
      return {
        label: 'Checked Out',
        dot: 'text-slate-400',
        bg: 'bg-slate-800 text-slate-300 border-slate-700',
      };
    }
    if (isCheckedIn) {
      return {
        label: 'Checked In',
        dot: 'text-emerald-400',
        bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      };
    }
    return {
      label: 'Unlocked · Check In (+ Rs. 05 PKR)',
      dot: 'text-emerald-400',
      bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    };
  };

  const statusStyle = getStatusDisplay();

  return (
    <section className="glass-card-hover bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 border-2 border-emerald-500/20 hover:border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">Daily Attendance</span>
          <h2 className="text-lg font-extrabold text-white tracking-tight">Today's Status</h2>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-mono bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentTime || '--:--:--'}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            {attendance?.date || new Date().toISOString().split('T')[0]}
          </div>
        </div>
      </div>

      {/* Allowed Working Hours & Reward Info Box */}
      <div className="bg-gradient-to-r from-emerald-950/30 via-slate-950/90 to-blue-950/30 border border-emerald-500/30 rounded-2xl p-3.5 mb-4 space-y-2.5 text-xs shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-200">Working Hours:</span>
          </div>
          <div className="text-slate-300 font-mono text-[11px] sm:text-xs">
            <span>Check-In: <strong className="text-emerald-400 font-bold">9:00 AM</strong></span>
            <span className="mx-2 text-slate-600">·</span>
            <span>Check-Out: <strong className="text-amber-400 font-bold">9:00 PM</strong></span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Daily Attendance Reward:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-black font-mono shadow-sm">
              + Rs. 05 PKR
            </span>
            <span className="text-[10px] text-slate-400 font-medium">/ Day</span>
          </div>
        </div>
      </div>

      {/* Package Lock Status Notice */}
      {!isAttendanceUnlocked && (
        <div
          className={`mb-4 p-4 rounded-2xl border ${
            isPendingVerification
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-slate-950/80 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs mb-1.5">
            {isPendingVerification ? (
              <>
                <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                <span className="text-amber-300 uppercase tracking-wide">
                  Package Submitted — Awaiting Admin Acceptance
                </span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-amber-300 uppercase tracking-wide">
                  Check-In & Check-Out Locked — Package Required
                </span>
              </>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {isPendingVerification ? (
              <>
                You submitted <strong>{pendingPackage?.packageName || 'your package'}</strong> (Rs. {pendingPackage?.price.toLocaleString() || '500'}). Your payment screenshot is currently in admin review.
              </>
            ) : (
              <>
                Daily Check-In & Check-Out is locked. Please submit a weekly or monthly package with your JazzCash or Easypaisa payment receipt.
              </>
            )}
          </p>

          <div className="mt-2 text-[11px] font-medium flex items-center gap-1.5 text-emerald-400">
            <Unlock className="w-3.5 h-3.5 shrink-0" />
            <span>
              {isPendingVerification
                ? 'When the admin accepts your package, Check In & Check Out will unlock automatically with Rs. 05 PKR daily rewards 🔓!'
                : 'When the admin accepts your package submission, Check In & Check Out will unlock automatically with Rs. 05 PKR daily rewards 🔓!'}
            </span>
          </div>
        </div>
      )}

      {/* Main Status Display Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-5">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800/80">
          <span className="text-xs text-slate-400">Current State:</span>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg}`}>
            <span className={`w-2 h-2 rounded-full ${statusStyle.dot} bg-current animate-pulse`} />
            <span>{statusStyle.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">Check-in Time</div>
            <div className="text-sm sm:text-base font-bold text-white font-mono">
              {attendance?.checkInTime || (loading ? 'Loading...' : 'Pending')}
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">Check-out Time</div>
            <div className="text-sm sm:text-base font-bold text-white font-mono">
              {attendance?.checkOutTime || (loading ? 'Loading...' : 'Pending')}
            </div>
          </div>
        </div>
      </div>

      {/* Action Notifications */}
      {feedback && (
        <div
          className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleCheckIn}
          disabled={!canCheckIn || actionLoading !== null}
          className="min-h-[48px] py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-800 text-slate-950 font-black rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          {!isAttendanceUnlocked ? <Lock className="w-4 h-4 text-slate-950" /> : <LogIn className="w-4 h-4 stroke-[2.5]" />}
          <span>
            {actionLoading === 'in'
              ? 'Checking In...'
              : !isAttendanceUnlocked
              ? isPendingVerification
                ? 'LOCKED (PENDING ADMIN)'
                : 'LOCKED (PACKAGE NEEDED)'
              : 'CHECK IN (+ Rs. 05 PKR)'}
          </span>
        </button>

        <button
          onClick={handleCheckOut}
          disabled={!canCheckOut || actionLoading !== null}
          className="min-h-[48px] py-3 px-4 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 hover:text-white font-bold rounded-2xl text-xs sm:text-sm tracking-wide transition-all border border-slate-700 shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          {!isAttendanceUnlocked ? <Lock className="w-4 h-4 text-slate-400" /> : <LogOut className="w-4 h-4 text-amber-400" />}
          <span>
            {actionLoading === 'out'
              ? 'Checking Out...'
              : !isAttendanceUnlocked
              ? 'LOCKED'
              : 'CHECK OUT'}
          </span>
        </button>
      </div>

      {!attendance?.withinHours && isAttendanceUnlocked && (
        <p className="text-[11px] text-center text-slate-500 mt-3">
          Check-in/out is active between 9:00 AM and 9:00 PM Pakistan Standard Time.
        </p>
      )}
    </section>
  );
};
