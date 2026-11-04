import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Wallet, WithdrawalRecord, WalletTransaction, WalletAmountMemoriesResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { WithdrawalModal } from './WithdrawalModal';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  Clock,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Database,
  HardDrive,
  ShieldCheck,
  Brain,
  Download,
  Sparkles,
  TrendingUp,
  Calendar,
  Users,
  Coins,
} from 'lucide-react';

export const WalletPage: React.FC = () => {
  const { wallet: authWallet, refreshUser } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(authWallet);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [memoriesData, setMemoriesData] = useState<WalletAmountMemoriesResponse | null>(null);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'transactions' | 'memories'>('withdrawals');
  const [isLoading, setIsLoading] = useState(false);

  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      const [summary, memories] = await Promise.all([
        api.getWalletSummary(),
        api.getWalletAmountMemories().catch(() => null),
      ]);
      setWallet(summary.wallet);
      setWithdrawals(summary.recentWithdrawals);
      setTransactions(summary.recentTransactions);
      if (memories) {
        setMemoriesData(memories);
      }
    } catch (e) {
      console.error('Failed to load wallet data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportMemories = () => {
    const exportPayload = {
      appName: 'MS Official',
      exportedAt: new Date().toISOString(),
      storageEngine: 'Cloud Firestore & Atomic JSON DB Engine',
      firestoreDatabaseId: 'ai-studio-msofficial-e3ea03c5-52b6-4d29-9e2a-ae174f7e3c72',
      walletSummary: wallet,
      amountMemories: memoriesData?.walletAmountMemories,
      transactions: transactions,
      withdrawals: withdrawals,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ms-official-wallet-amount-memories-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const totalAccountBalance = (wallet?.availableBalance || 0) + (wallet?.pendingBalance || 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Financial Overview</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">My Wallet</h2>
        </div>
        <button
          onClick={fetchWalletData}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          title="Refresh balances"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Primary Balance Cards */}
      <div className="glass-card-hover bg-gradient-to-br from-blue-950/40 via-slate-900 to-emerald-950/40 border-2 border-blue-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-500/10 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 text-cyan-300 border border-blue-500/30 shadow-md">
              <WalletIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Total Account Balance</span>
          </div>
          <span className="text-[11px] text-cyan-400/80 font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/20">PKR · Pakistani Rupee</span>
        </div>

        <div className="mb-6">
          <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight flex items-baseline gap-2">
            <span>Rs. {totalAccountBalance.toLocaleString()}</span>
            <span className="text-xs font-semibold text-emerald-400 font-sans tracking-normal">Active Funds</span>
          </div>
        </div>

        {/* 2 Sub Balances: Available Balance & Pending Balance */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80 mb-6">
          <div className="p-4 bg-gradient-to-b from-emerald-950/40 to-slate-950/90 rounded-2xl border border-emerald-500/30 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-emerald-300 uppercase font-black tracking-wider block">Available Balance</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              Rs. {(wallet?.availableBalance || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-300/80 mt-1 block font-medium">Ready for instant payout</span>
          </div>

          <div className="p-4 bg-gradient-to-b from-amber-950/40 to-slate-950/90 rounded-2xl border border-amber-500/30 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-amber-300 uppercase font-black tracking-wider block">Pending Balance</span>
              <Clock className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              Rs. {(wallet?.pendingBalance || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-amber-300/80 mt-1 block font-medium">Under admin review</span>
          </div>
        </div>

        {/* WITHDRAW BUTTON */}
        <button
          onClick={() => setIsWithdrawOpen(true)}
          className="group relative overflow-hidden w-full py-4 px-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] text-slate-950 font-black rounded-2xl text-xs sm:text-sm tracking-wider uppercase transition-all shadow-xl shadow-emerald-500/30 ring-2 ring-emerald-400/50 hover:ring-emerald-300 flex items-center justify-center gap-2 cursor-pointer select-none"
        >
          <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out pointer-events-none" />
          <ArrowUpRight className="w-4 h-4 stroke-[3] relative z-10 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          <span className="relative z-10 font-black tracking-wider">REQUEST INSTANT WITHDRAWAL</span>
        </button>
      </div>

      {/* Transaction & Withdrawal History */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'withdrawals' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Withdrawals
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'transactions' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ledger Logs
            </button>
            <button
              onClick={() => setActiveTab('memories')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'memories'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md ring-1 ring-cyan-400/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-cyan-300" />
              <span>Amount Memories</span>
            </button>
          </div>
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">Real-time DB records</span>
        </div>

        {activeTab === 'withdrawals' && (
          <div>
            {withdrawals.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No withdrawal requests found yet.</p>
                <span className="text-[10px] text-slate-500">Your requested payouts will appear here.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((w) => {
                  const statusDisplay = {
                    successful: {
                      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
                      label: 'Successful',
                    },
                    rejected: {
                      badge: 'bg-red-500/10 text-red-400 border-red-500/20',
                      icon: <XCircle className="w-3.5 h-3.5 text-red-400" />,
                      label: 'Rejected',
                    },
                    pending: {
                      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                      icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
                      label: 'Pending',
                    },
                  }[w.status];

                  return (
                    <div
                      key={w.id}
                      className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-mono">{w.id}</span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusDisplay.badge}`}
                          >
                            {statusDisplay.icon}
                            <span>{statusDisplay.label}</span>
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              w.method.toLowerCase().includes('jazz')
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {w.method}
                          </span>
                          <span>·</span>
                          <span className="font-mono">{w.phone}</span>
                          <span>·</span>
                          <span>{new Date(w.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
                        <div className="text-base font-bold text-white font-mono">
                          Rs. {w.amount.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            {transactions.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No ledger transactions yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-800/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{tx.reason}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(tx.createdAt).toLocaleDateString()} · {tx.id}
                        {tx.adminName && ` · Admin: ${tx.adminName}`}
                      </div>
                    </div>
                    <div
                      className={`font-mono font-bold ${
                        tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {tx.type === 'credit' ? '+' : '-'} Rs. {tx.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WALLET AMOUNT MEMORIES & STORAGE */}
        {activeTab === 'memories' && (
          <div className="space-y-5 animate-page-enter">
            {/* Storage Architecture Live Status Banner - Hidden as requested */}
            <div className="hidden" aria-hidden="true">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0 mt-0.5 shadow-sm">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Live Storage & Memories Active</span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      SYNCHRONIZED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    Firestore DB: <strong className="text-cyan-300">{memoriesData?.storageStatus.firestoreDatabaseId || 'ai-studio-msofficial-e3ea03c5-52b6-4d29-9e2a-ae174f7e3c72'}</strong>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Total Archived Memories: <strong>{memoriesData?.storageStatus.totalRecordsArchived ?? (transactions.length + withdrawals.length)} records</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportMemories}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-[0.97] shrink-0"
                title="Download JSON copy of all wallet amount memories"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Memories</span>
              </button>
            </div>

            {/* 4-Stat Amount Memories Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30">
                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Total Earned</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-white font-mono">
                  Rs. {(memoriesData?.walletAmountMemories.totalEarnedLifetime ?? (wallet?.totalEarned || 0)).toLocaleString()}
                </div>
                <span className="text-[9px] text-slate-400">Cumulative memory</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/30">
                <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Calendar className="w-3 h-3" />
                  <span>Attendance</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-cyan-300 font-mono">
                  Rs. {(memoriesData?.walletAmountMemories.attendanceRewards.totalAmount ?? 0).toLocaleString()}
                </div>
                <span className="text-[9px] text-slate-400">
                  {memoriesData?.walletAmountMemories.attendanceRewards.streakDays ?? 0} days (+Rs. 5 each)
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30">
                <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Users className="w-3 h-3" />
                  <span>Referrals</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-amber-300 font-mono">
                  Rs. {(memoriesData?.walletAmountMemories.referralCommissions.totalAmount ?? 0).toLocaleString()}
                </div>
                <span className="text-[9px] text-slate-400">
                  {memoriesData?.walletAmountMemories.referralCommissions.payoutsCount ?? 0} bonuses gained
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-indigo-500/30">
                <div className="flex items-center gap-1.5 text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Coins className="w-3 h-3" />
                  <span>Disbursed</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-indigo-300 font-mono">
                  Rs. {(memoriesData?.walletAmountMemories.withdrawals.totalDisbursed ?? 0).toLocaleString()}
                </div>
                <span className="text-[9px] text-slate-400">
                  {memoriesData?.walletAmountMemories.withdrawals.successfulCount ?? 0} paid withdrawals
                </span>
              </div>
            </div>

            {/* Amount Memories Timeline Feed */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Chronological Amount Memories Timeline</span>
                </span>
                <button
                  onClick={handleExportMemories}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-mono text-[10px] flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Export Memories JSON"
                >
                  <Download className="w-3 h-3 text-cyan-400" />
                  <span>Export</span>
                </button>
              </div>

              {(!memoriesData?.walletAmountMemories.memoriesTimeline || memoriesData.walletAmountMemories.memoriesTimeline.length === 0) ? (
                <div className="text-center py-8 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                  <Brain className="w-7 h-7 text-slate-600 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-400">No amount memories recorded yet.</p>
                  <span className="text-[10px] text-slate-500">Check in today (+Rs. 5) or invite friends to build your wallet memory trail!</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {memoriesData.walletAmountMemories.memoriesTimeline.map((item) => {
                    const categoryStyles = {
                      attendance: 'border-l-4 border-l-cyan-400 bg-slate-950/80',
                      referral: 'border-l-4 border-l-amber-400 bg-slate-950/80',
                      withdrawal: 'border-l-4 border-l-rose-400 bg-slate-950/80',
                      ledger: 'border-l-4 border-l-emerald-400 bg-slate-950/80',
                    }[item.category] || 'border-l-4 border-l-slate-600 bg-slate-950/80';

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs transition-all hover:bg-slate-950 ${categoryStyles}`}
                      >
                        <div>
                          <div className="font-semibold text-slate-200 flex items-center gap-2">
                            <span>{item.reason}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                              {item.category}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {new Date(item.timestamp).toLocaleString()} · ID: {item.id.slice(0, 8)}...
                          </div>
                        </div>
                        <div
                          className={`font-mono font-bold text-xs sm:text-sm shrink-0 ml-3 ${
                            item.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {item.type === 'credit' ? '+' : '-'} Rs. {item.amount.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* History Memories & Storage Overview Card */}
      <div className="glass-card-hover bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
              Data Architecture
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              History Memories & Storage Security
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <History className="w-4 h-4 shrink-0" />
              <span>Immutable Ledger</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every attendance reward (+Rs. 5), referral bonus, and withdrawal is assigned a permanent UUID and memorized in the database.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
              <HardDrive className="w-4 h-4 shrink-0" />
              <span>Storage System</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Persistent JSON database on server disk with automated backup & structured file directories for deposit screenshots and tasks.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Session Memory</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Encrypted JWT tokens preserve your login and balances securely across browser tabs and device reboots.
            </p>
          </div>
        </div>
      </div>

      {/* Withdrawal Form Modal */}
      {isWithdrawOpen && wallet && (
        <WithdrawalModal
          wallet={wallet}
          onClose={() => setIsWithdrawOpen(false)}
          onSuccess={() => {
            fetchWalletData();
            refreshUser();
          }}
        />
      )}
    </div>
  );
};
