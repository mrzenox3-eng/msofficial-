import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Users,
  Package,
  ArrowDownToLine,
  CalendarCheck,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  UserCheck,
  Sparkles,
  Database,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../api/client';
import { UserFullDossier } from '../../types';

// Utility to export array of objects to CSV with UTF-8 BOM
function exportToCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent =
    '\uFEFF' +
    [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Utility to export JSON
function exportToJson(filename: string, data: any) {
  const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', jsonStr);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const AdminUserDataInfo: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dossier, setDossier] = useState<UserFullDossier | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [recentUsers, setRecentUsers] = useState<Array<{ id: string; name: string; email: string; phone: string; referralCode: string }>>([]);
  const [searchMatches, setSearchMatches] = useState<Array<{ id: string; name: string; email: string; phone: string; referralCode: string }>>([]);

  // Load initial demo/recent users for quick clicks
  useEffect(() => {
    loadInitialUsers();
  }, []);

  const loadInitialUsers = async () => {
    try {
      const users = await api.getAdminUsers();
      if (users && users.length > 0) {
        setRecentUsers(
          users.slice(0, 6).map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            referralCode: u.referralCode,
          }))
        );

        const autoSearch = sessionStorage.getItem('ms_auto_search_user');
        if (autoSearch) {
          sessionStorage.removeItem('ms_auto_search_user');
          setSearchQuery(autoSearch);
          executeSearch(autoSearch);
        } else {
          // Find Ali Husnain or first user to populate dossier by default
          const defaultUser =
            users.find((u) => u.email.toLowerCase().includes('alihusnain')) ||
            users[0];
          if (defaultUser) {
            executeSearch(defaultUser.email);
          }
        }
      }
    } catch (err: any) {
      console.warn('Could not load initial users for suggestions:', err);
    }
  };

  const handleCopy = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const executeSearch = async (termToSearch?: string) => {
    const term = (termToSearch !== undefined ? termToSearch : searchQuery).trim();
    if (!term) {
      setErrorMessage('Please enter a Gmail, Phone Number, or Invite Code to search.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSearchMatches([]);

    try {
      // Connect to required backend endpoint: /api/search-user.php?search=
      const res = await api.searchUserPhpApi(term);

      if (res.success && res.dossier) {
        setDossier(res.dossier);
        if (res.matches && res.matches.length > 1) {
          setSearchMatches(res.matches);
        }
      } else if (res.sampleUsers && res.sampleUsers.length > 0) {
        setRecentUsers(res.sampleUsers);
        setErrorMessage(res.message || 'No exact user found. Select from directory below:');
      } else {
        // Fallback to direct dossier lookup by userId or query
        const fallbackDossier = await api.getUserFullDossier(term);
        if (fallbackDossier) {
          setDossier(fallbackDossier);
        } else {
          setErrorMessage(res.message || `No user found matching "${term}".`);
        }
      }
    } catch (err: any) {
      console.error('Search error:', err);
      // Attempt fallback via admin users-data search
      try {
        const searchResults = await api.searchUsersDataInfo(term);
        if (searchResults && searchResults.length > 0) {
          const firstUserDossier = await api.getUserFullDossier(searchResults[0].id);
          setDossier(firstUserDossier);
          if (searchResults.length > 1) {
            setSearchMatches(searchResults);
          }
        } else {
          setErrorMessage(err.message || `No records matching "${term}".`);
        }
      } catch (fallbackErr: any) {
        setErrorMessage(err.message || 'Search failed. Please verify server connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    }
  };

  // Section 1: All Invited Friends CSV Export
  const exportSection1InvitedFriends = () => {
    if (!dossier) return;
    const headers = [
      'Friend Name',
      'Email',
      'Phone',
      'Status',
      'Referral Code',
      'Active Package',
      'Bonus Earned (PKR)',
      'Joined Date',
    ];
    const rows = dossier.invitedFriends.map((f) => [
      f.name,
      f.email,
      f.phone,
      f.status,
      f.referralCode,
      f.activePackage,
      f.bonusEarned || 0,
      f.joinedDate ? new Date(f.joinedDate).toLocaleString() : 'N/A',
    ]);
    const filename = `MS_OFFICIAL_Invited_Friends_${dossier.user.name.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    exportToCsv(filename, headers, rows);
  };

  // Section 2: Active Packages CSV Export
  const exportSection2Packages = () => {
    if (!dossier) return;
    const headers = [
      'Package Name',
      'Price (PKR)',
      'Status',
      'Payment Method',
      'Sender Account Name',
      'Sender Phone',
      'Activation Date',
      'Expiry Date',
      'Order Date',
    ];
    const rows = dossier.packages.map((p) => [
      p.packageName,
      p.price,
      p.status,
      p.paymentMethod,
      p.senderAccountName || 'N/A',
      p.senderPhone || 'N/A',
      p.startDate ? new Date(p.startDate).toLocaleString() : 'Pending Approval',
      p.expiryDate ? new Date(p.expiryDate).toLocaleString() : 'Pending Approval',
      p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A',
    ]);
    const filename = `MS_OFFICIAL_Packages_${dossier.user.name.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    exportToCsv(filename, headers, rows);
  };

  // Section 3: Withdraw History CSV Export
  const exportSection3Withdrawals = () => {
    if (!dossier) return;
    const headers = [
      'Withdrawal ID',
      'Amount (PKR)',
      'Status',
      'Payment Method',
      'Account Title',
      'Account Phone',
      'Request Date',
      'Processed Date',
      'Admin Notes',
    ];
    const rows = dossier.withdrawals.map((w) => [
      w.id,
      w.amount,
      w.status,
      w.method,
      w.accountName,
      w.phone,
      w.createdAt ? new Date(w.createdAt).toLocaleString() : 'N/A',
      w.processedAt ? new Date(w.processedAt).toLocaleString() : 'Unprocessed',
      w.adminNotes || 'None',
    ]);
    const filename = `MS_OFFICIAL_Withdrawals_${dossier.user.name.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    exportToCsv(filename, headers, rows);
  };

  // Section 4: Attendance Data CSV Export
  const exportSection4Attendance = () => {
    if (!dossier) return;
    const headers = [
      'Date',
      'Check-In Time',
      'Check-Out Time',
      'Status',
      'Daily Reward (PKR)',
      'Last Record Update',
    ];
    const rows = dossier.attendance.map((a) => {
      const reward = a.status === 'checked_out' ? 50 : 0;
      return [
        a.date,
        a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString() : 'Not Checked In',
        a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString() : 'Not Checked Out',
        a.status.replace(/_/g, ' ').toUpperCase(),
        reward,
        a.updatedAt ? new Date(a.updatedAt).toLocaleString() : 'N/A',
      ];
    });
    const filename = `MS_OFFICIAL_Attendance_${dossier.user.name.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    exportToCsv(filename, headers, rows);
  };

  // Global Full Dossier Single CSV Export (All 4 Sections Combined)
  const exportComprehensiveUserDossierCsv = () => {
    if (!dossier) return;
    const user = dossier.user;
    const headers = [
      'Data Category',
      'Record Reference / Field',
      'Value / Details',
      'Status / Amount',
      'Date / Timestamp',
      'Additional Notes',
    ];

    const rows: (string | number)[][] = [
      ['USER_PROFILE', 'User ID', user.id, user.status, user.createdAt || '', ''],
      ['USER_PROFILE', 'Full Name', user.name, 'Active Member', '', ''],
      ['USER_PROFILE', 'Gmail / Email', user.email, 'Verified', '', ''],
      ['USER_PROFILE', 'Phone Number', user.phone, 'Verified', '', ''],
      ['USER_PROFILE', 'Invite Code', user.referralCode, 'System Generated', '', ''],
      ['USER_PROFILE', 'Referred By User', dossier.inviter?.name || 'Organic / None', dossier.inviter?.referralCode || 'N/A', '', ''],
      ['WALLET_LEDGER', 'Available Balance', `${dossier.wallet.availableBalance} PKR`, 'Spendable / Withdrawable', dossier.wallet.updatedAt, ''],
      ['WALLET_LEDGER', 'Pending Balance', `${dossier.wallet.pendingBalance} PKR`, 'Locked in Payout', '', ''],
      ['WALLET_LEDGER', 'Total Earned', `${dossier.wallet.totalEarned} PKR`, 'Lifetime Earnings', '', ''],
    ];

    // Append Section 1: Invited Friends
    dossier.invitedFriends.forEach((f, idx) => {
      rows.push([
        'SECTION_1_INVITED_FRIEND',
        `Friend #${idx + 1}: ${f.name}`,
        `${f.email} | Phone: ${f.phone}`,
        f.status,
        f.joinedDate,
        `Package: ${f.activePackage} | Bonus: Rs. ${f.bonusEarned || 0}`,
      ]);
    });

    // Append Section 2: Packages
    dossier.packages.forEach((p, idx) => {
      rows.push([
        'SECTION_2_PACKAGE',
        `Package #${idx + 1}: ${p.packageName}`,
        `Price: Rs. ${p.price} | Method: ${p.paymentMethod}`,
        p.status,
        p.startDate || p.createdAt,
        `Sender: ${p.senderAccountName || 'N/A'} (${p.senderPhone || 'N/A'}) | Expiry: ${p.expiryDate || 'N/A'}`,
      ]);
    });

    // Append Section 3: Withdrawals
    dossier.withdrawals.forEach((w) => {
      rows.push([
        'SECTION_3_WITHDRAWAL',
        w.id,
        `Rs. ${w.amount} via ${w.method} to ${w.accountName} (${w.phone})`,
        w.status,
        w.createdAt,
        `Processed: ${w.processedAt || 'Pending'} | Notes: ${w.adminNotes || 'None'}`,
      ]);
    });

    // Append Section 4: Attendance
    dossier.attendance.forEach((a) => {
      rows.push([
        'SECTION_4_ATTENDANCE',
        `Attendance ${a.date}`,
        `In: ${a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString() : 'N/A'} | Out: ${a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString() : 'N/A'}`,
        a.status,
        a.date,
        a.status === 'checked_out' ? 'Daily Reward Credited: Rs. 50' : 'Incomplete',
      ]);
    });

    const filename = `MS_OFFICIAL_Full_Dossier_${user.name.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    exportToCsv(filename, headers, rows);
    setShowExportMenu(false);
  };

  // Export Entire Database Users Summary
  const exportGlobalAllUsersSummary = async () => {
    setIsExportingAll(true);
    try {
      const allData = await api.exportAllUsersData();
      const headers = [
        'User ID',
        'Full Name',
        'Gmail / Email',
        'Phone Number',
        'Status',
        'Invite Code',
        'Active Package',
        'Available Balance (PKR)',
        'Pending Balance (PKR)',
        'Total Earned (PKR)',
        'Total Withdrawn (PKR)',
        'Invited Friends Count',
        'Attendance Records Count',
        'Registration Date',
      ];
      const rows = allData.map((u) => [
        u.id,
        u.name,
        u.email,
        u.phone,
        u.status,
        u.referralCode,
        u.activePackage,
        u.availableBalance,
        u.pendingBalance,
        u.totalEarned,
        u.totalWithdrawn,
        u.invitedFriendsCount,
        u.attendanceDaysCount,
        u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A',
      ]);
      const filename = `MS_OFFICIAL_ALL_USERS_MASTER_EXPORT_${Date.now()}.csv`;
      exportToCsv(filename, headers, rows);
      setShowExportMenu(false);
    } catch (err: any) {
      alert(`Export failed: ${err.message || 'Could not fetch summary data'}`);
    } finally {
      setIsExportingAll(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto pb-12">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & MODERN SEARCH BAR COMPONENT               */}
      {/* ======================================================== */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Ambient Neon Accent Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Header Title & Platform Brand */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                MS OFFICIAL Intelligence Engine
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                User Data Info System
                <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-mono font-medium">
                  v3.2 SaaS
                </span>
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                Comprehensive multi-section intelligence console. Inspect invited friends, active packages, withdraw history, and daily attendance logs with instant CSV exports.
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 font-mono shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                API: <code className="text-emerald-400">/api/search-user.php</code>
              </div>
            </div>
          </div>

          {/* Search Input Bar with Action Buttons */}
          <div className="space-y-3">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Modern Search Input */}
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-400 transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search by Gmail, Phone Number, Invite Code"
                  className="w-full pl-12 pr-10 py-3.5 bg-slate-900/90 border border-slate-700/90 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium shadow-inner transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchMatches([]);
                    }}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 2 Buttons: SEARCH and Export & Download Data */}
              <div className="flex items-center gap-3 shrink-0">
                {/* SEARCH Button */}
                <button
                  onClick={() => executeSearch()}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>SEARCHING...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 stroke-[2.5]" />
                      <span>SEARCH</span>
                    </>
                  )}
                </button>

                {/* Export & Download Data Button (with dropdown choices) */}
                <div className="relative flex-1 sm:flex-none">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/90 hover:border-emerald-500/50 text-emerald-400 font-semibold text-sm rounded-2xl shadow-lg transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export & Download Data</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
                  </button>

                  {/* Dropdown Menu for Global Exports */}
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        Export Options
                      </div>
                      <button
                        onClick={exportComprehensiveUserDossierCsv}
                        disabled={!dossier}
                        className="w-full text-left px-3 py-2.5 text-xs text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 rounded-xl flex items-center gap-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="font-semibold">Current User Dossier (CSV)</div>
                          <div className="text-[10px] text-slate-400">All 4 sections in 1 file</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          if (dossier) {
                            exportToJson(`MS_OFFICIAL_Dossier_${dossier.user.name}_${Date.now()}.json`, dossier);
                            setShowExportMenu(false);
                          }
                        }}
                        disabled={!dossier}
                        className="w-full text-left px-3 py-2.5 text-xs text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 rounded-xl flex items-center gap-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div>
                          <div className="font-semibold">Complete JSON Raw Archive</div>
                          <div className="text-[10px] text-slate-400">Structured system backup</div>
                        </div>
                      </button>

                      <div className="border-t border-slate-800 my-1" />

                      <button
                        onClick={exportGlobalAllUsersSummary}
                        disabled={isExportingAll}
                        className="w-full text-left px-3 py-2.5 text-xs text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 rounded-xl flex items-center gap-2.5 transition-colors"
                      >
                        <Database className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div className="font-semibold">Global Users Master CSV</div>
                          <div className="text-[10px] text-slate-400">All system users directory</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick-Pick Recent/Sample Users Chips */}
            {recentUsers.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> Quick select:
                </span>
                {recentUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSearchQuery(u.email);
                      executeSearch(u.email);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-mono transition-all border ${
                      dossier?.user?.id === u.id
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold shadow-xs'
                        : 'bg-slate-900/60 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    {u.name} ({u.referralCode})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Multiple Matches Notice if applicable */}
          {searchMatches.length > 1 && (
            <div className="p-3 bg-slate-900/90 border border-slate-700 rounded-2xl flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Found {searchMatches.length} matches:</span>
              {searchMatches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => executeSearch(m.id)}
                  className={`px-2.5 py-1 rounded-lg border transition-colors ${
                    dossier?.user?.id === m.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {m.name} • {m.email}
                </button>
              ))}
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs sm:text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. USER PROFILE SUMMARY HERO CARD                        */}
      {/* ======================================================== */}
      {dossier ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: User Avatar & Core Identity */}
            <div className="lg:col-span-4 flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-slate-800 to-slate-900 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-2xl shadow-lg shrink-0">
                {dossier.user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-white truncate">{dossier.user.name}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                      dossier.user.status === 'active'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                    }`}
                  >
                    {dossier.user.status}
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-mono truncate mt-0.5">{dossier.user.email}</p>
                <p className="text-slate-400 text-xs font-mono mt-0.5">Phone: {dossier.user.phone}</p>
                {dossier.inviter && (
                  <p className="text-[11px] text-emerald-400/90 font-medium mt-1">
                    Invited by: {dossier.inviter.name} ({dossier.inviter.referralCode})
                  </p>
                )}
              </div>
            </div>

            {/* Middle: Invite Code & Active Package */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                  Invite Code
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {dossier.user.referralCode}
                  </span>
                  <button
                    onClick={() => handleCopy(dossier.user.referralCode, 'refCode')}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Copy Invite Code"
                  >
                    {copiedField === 'refCode' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                  Active Package
                </span>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white text-sm">
                    {dossier.activePackage ? dossier.activePackage.packageName : 'No Active Package'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Wallet Balance & Payout Status */}
            <div className="lg:col-span-4 flex items-center justify-between lg:justify-end gap-6 bg-slate-900/60 lg:bg-transparent border lg:border-none border-slate-800 rounded-2xl p-4 lg:p-0">
              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Available Balance
                </span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  Rs. {dossier.wallet.availableBalance.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Total Earned: Rs. {dossier.wallet.totalEarned.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Pending Payout
                </span>
                <span className="text-lg font-bold text-amber-400 font-mono">
                  Rs. {dossier.wallet.pendingBalance.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Total Withdrawn: Rs. {dossier.summary.totalWithdrawalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Invited Friends:</span>
              <strong className="text-white font-mono">{dossier.summary.totalInvited}</strong>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Package className="w-4 h-4 text-cyan-400" />
              <span>Packages Purchased:</span>
              <strong className="text-white font-mono">{dossier.packages.length}</strong>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <ArrowDownToLine className="w-4 h-4 text-rose-400" />
              <span>Withdrawal Requests:</span>
              <strong className="text-white font-mono">{dossier.summary.totalWithdrawalsCount}</strong>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CalendarCheck className="w-4 h-4 text-indigo-400" />
              <span>Attendance Days:</span>
              <strong className="text-white font-mono">{dossier.summary.totalAttendanceRecords}</strong>
            </div>
          </div>
        </div>
      ) : null}

      {/* ======================================================== */}
      {/* 3. FOUR DISTINCT SECTIONS IN PROFESSIONAL CARDS          */}
      {/* ======================================================== */}
      {dossier ? (
        <div className="space-y-6">
          {/* ---------------------------------------------------- */}
          {/* SECTION 1: All Invited Friends Data                   */}
          {/* ---------------------------------------------------- */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Section 1: All Invited Friends Data
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-semibold">
                      {dossier.invitedFriends.length}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Team referrals, registration timestamps, package status, and earned referral commissions.
                  </p>
                </div>
              </div>

              {/* Dedicated CSV Export Button */}
              <button
                onClick={exportSection1InvitedFriends}
                disabled={dossier.invitedFriends.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 hover:border-emerald-500/40 text-emerald-400 font-semibold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4 sm:px-6">Invited Member</th>
                    <th className="py-3 px-4">Contact (Email / Phone)</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4">Invite Code</th>
                    <th className="py-3 px-4">Active Package</th>
                    <th className="py-3 px-4 text-right">Commission Earned</th>
                    <th className="py-3 px-4 sm:px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {dossier.invitedFriends.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                        No invited friends recorded yet for this member.
                      </td>
                    </tr>
                  ) : (
                    dossier.invitedFriends.map((friend) => (
                      <tr key={friend.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 text-white font-semibold">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold">
                              {friend.name?.charAt(0).toUpperCase() || 'F'}
                            </div>
                            <span>{friend.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                          <div>{friend.email}</div>
                          <div className="text-slate-500">{friend.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {friend.joinedDate ? new Date(friend.joinedDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-emerald-400 font-mono text-[11px]">
                          {friend.referralCode}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 text-[11px]">
                            {friend.activePackage || 'None'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-semibold">
                          Rs. {(friend.bonusEarned || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              friend.status === 'active'
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                                : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                            }`}
                          >
                            {friend.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* SECTION 2: Active Packages Data                       */}
          {/* ---------------------------------------------------- */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Section 2: Active Packages Data
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-semibold">
                      {dossier.packages.length}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Purchased subscription packages, pricing, payment verification proofs, and validity terms.
                  </p>
                </div>
              </div>

              {/* Dedicated CSV Export Button */}
              <button
                onClick={exportSection2Packages}
                disabled={dossier.packages.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 hover:border-cyan-500/40 text-cyan-400 font-semibold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4 sm:px-6">Package Name</th>
                    <th className="py-3 px-4">Price (PKR)</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Sender Details</th>
                    <th className="py-3 px-4">Activation Date</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4 sm:px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {dossier.packages.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                        No package purchases or activations on record.
                      </td>
                    </tr>
                  ) : (
                    dossier.packages.map((pkg) => (
                      <tr key={pkg.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 text-white font-bold">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            <span>{pkg.packageName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-cyan-300 font-semibold">
                          Rs. {pkg.price.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px]">
                            {pkg.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          <div>{pkg.senderAccountName || 'N/A'}</div>
                          <div className="text-slate-500">{pkg.senderPhone || 'N/A'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {pkg.startDate ? new Date(pkg.startDate).toLocaleDateString() : 'Pending'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {pkg.expiryDate ? new Date(pkg.expiryDate).toLocaleDateString() : 'Pending'}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              pkg.status === 'active'
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                                : pkg.status === 'pending_verification'
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                                : pkg.status === 'expired'
                                ? 'bg-slate-700/50 border-slate-600 text-slate-400'
                                : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                            }`}
                          >
                            {pkg.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* SECTION 3: Withdraw History Data                      */}
          {/* ---------------------------------------------------- */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <ArrowDownToLine className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Section 3: Withdraw History Data
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-semibold">
                      {dossier.withdrawals.length}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">
                    User withdrawal requests, JazzCash / Easypaisa payment channels, amount, and approval status.
                  </p>
                </div>
              </div>

              {/* Dedicated CSV Export Button */}
              <button
                onClick={exportSection3Withdrawals}
                disabled={dossier.withdrawals.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 hover:border-rose-500/40 text-rose-400 font-semibold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4 sm:px-6">Withdrawal ID</th>
                    <th className="py-3 px-4">Amount (PKR)</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Account Holder & Phone</th>
                    <th className="py-3 px-4">Request Date</th>
                    <th className="py-3 px-4">Processed Date</th>
                    <th className="py-3 px-4 sm:px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {dossier.withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                        No withdrawal requests on record for this user.
                      </td>
                    </tr>
                  ) : (
                    dossier.withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 text-slate-300 font-mono text-[11px]">
                          {w.id}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold text-sm">
                          Rs. {w.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                              w.method === 'JazzCash'
                                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                                : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                            }`}
                          >
                            {w.method}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                          <div className="font-semibold text-white">{w.accountName}</div>
                          <div className="text-slate-500">{w.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {w.createdAt ? new Date(w.createdAt).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {w.processedAt ? new Date(w.processedAt).toLocaleString() : 'Pending'}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              w.status === 'successful'
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                                : w.status === 'pending'
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                                : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* SECTION 4: Attendance Data                            */}
          {/* ---------------------------------------------------- */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Section 4: Attendance Data
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-semibold">
                      {dossier.attendance.length}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Daily check-in / check-out history, working hours validation, and daily earnings rewards.
                  </p>
                </div>
              </div>

              {/* Dedicated CSV Export Button */}
              <button
                onClick={exportSection4Attendance}
                disabled={dossier.attendance.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 hover:border-indigo-500/40 text-indigo-400 font-semibold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4 sm:px-6">Date</th>
                    <th className="py-3 px-4">Check-In Time</th>
                    <th className="py-3 px-4">Check-Out Time</th>
                    <th className="py-3 px-4">Daily Reward</th>
                    <th className="py-3 px-4 sm:px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {dossier.attendance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                        No daily attendance records found for this user account.
                      </td>
                    </tr>
                  ) : (
                    dossier.attendance.map((att) => {
                      const isComplete = att.status === 'checked_out';
                      const reward = isComplete ? 50 : 0;
                      return (
                        <tr key={att.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="py-3.5 px-4 sm:px-6 font-mono text-white font-semibold">
                            {att.date}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString() : (
                              <span className="text-slate-500 italic">Not Checked In</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString() : (
                              <span className="text-slate-500 italic">Not Checked Out</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                            {reward > 0 ? `Rs. ${reward}` : 'Rs. 0'}
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                att.status === 'checked_out'
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                                  : att.status === 'checked_in'
                                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-400'
                              }`}
                            >
                              {att.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        !isLoading && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Search for a User to Inspect All Data</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Use the search bar above to query by Gmail, Phone Number, or Invite Code to view all invited friends, active packages, withdraw history, and attendance records.
            </p>
          </div>
        )
      )}
    </div>
  );
};
