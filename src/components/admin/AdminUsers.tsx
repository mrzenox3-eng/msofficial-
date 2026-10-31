import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { AdminUserListItem, UserPackage, WalletTransaction, WithdrawalRecord, User, Wallet } from '../../types';
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  History,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Users,
  Shield,
  Download,
  Phone,
  Zap,
  ZapOff,
  Package,
  KeyRound,
  Trash2,
  Lock,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedUserHistory, setSelectedUserHistory] = useState<{
    user: User;
    wallet: Wallet;
    packages: UserPackage[];
    transactions: WalletTransaction[];
    withdrawals: WithdrawalRecord[];
  } | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Change Password state
  const [passwordModalUser, setPasswordModalUser] = useState<AdminUserListItem | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Delete User Account state
  const [deleteModalUser, setDeleteModalUser] = useState<AdminUserListItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers(searchTerm, statusFilter);
      setUsers(data);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, statusFilter]);

  const handleToggleStatus = async (user: AdminUserListItem) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'suspend'} user ${user.name}?`)) {
      return;
    }

    try {
      await api.updateAdminUserStatus(user.id, newStatus);
      setActionFeedback(`User ${user.name} has been ${newStatus}.`);
      setTimeout(() => setActionFeedback(null), 3000);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleViewHistory = async (userId: string) => {
    setHistoryLoading(true);
    try {
      const data = await api.getAdminUserHistory(userId);
      setSelectedUserHistory(data);
    } catch (e) {
      alert('Failed to load user history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleTogglePackage = async (
    userId: string,
    packageType: 'weekly' | 'monthly',
    action: 'activate' | 'deactivate'
  ) => {
    try {
      const res = await api.toggleUserPackageDirectly({ userId, packageType, action });
      setActionFeedback(
        action === 'activate'
          ? `Successfully activated ${packageType === 'monthly' ? 'One Month' : 'One Week'} package!`
          : 'User active package has been deactivated.'
      );
      setTimeout(() => setActionFeedback(null), 3500);
      await fetchUsers();
      if (selectedUserHistory && selectedUserHistory.user.id === userId) {
        await handleViewHistory(userId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update package');
    }
  };

  const handleOpenPasswordModal = (user: AdminUserListItem) => {
    setPasswordModalUser(user);
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setPasswordError(null);
  };

  const handleClosePasswordModal = () => {
    setPasswordModalUser(null);
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setPasswordError(null);
  };

  const handleSubmitChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match. Please verify.');
      return;
    }

    setPasswordSubmitting(true);
    setPasswordError(null);
    try {
      await api.changeAdminUserPassword(passwordModalUser.id, newPassword);
      setActionFeedback(`Password successfully updated for user "${passwordModalUser.name}".`);
      setTimeout(() => setActionFeedback(null), 3500);
      handleClosePasswordModal();
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update user password.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (user: AdminUserListItem) => {
    setDeleteModalUser(user);
    setDeleteError(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalUser(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalUser) return;

    setDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await api.deleteAdminUser(deleteModalUser.id);
      setActionFeedback(`User account "${deleteModalUser.name}" has been permanently deleted.`);
      setTimeout(() => setActionFeedback(null), 4000);
      handleCloseDeleteModal();
      await fetchUsers();
      if (selectedUserHistory && selectedUserHistory.user.id === deleteModalUser.id) {
        setSelectedUserHistory(null);
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete user account.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const activeCount = users.filter((u) => u.status === 'active').length;
  const suspendedCount = users.filter((u) => u.status === 'suspended').length;
  const totalBalance = users.reduce((acc, curr) => acc + (curr.balance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-red-400">Account Directory</span>
          <h2 className="text-xl font-bold text-white tracking-tight">User Account Directory</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit registered members, inspect financial balances, toggle account statuses, and review ledger histories.
          </p>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Desktop Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Members</span>
            <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">{activeCount}</div>
            <span className="text-[10px] text-slate-500">Accounts in good standing</span>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Suspended Members</span>
            <div className="text-xl font-extrabold text-red-400 font-mono mt-1">{suspendedCount}</div>
            <span className="text-[10px] text-slate-500">Blocked from check-in & payouts</span>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cumulative Balances</span>
            <div className="text-xl font-extrabold text-white font-mono mt-1">
              Rs. {totalBalance.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">Across {users.length} registered members</span>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by Name, Email, Phone, or User ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Active Plan</th>
                <th className="py-3.5 px-4 text-right">Available Balance</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Loading accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {u.id.slice(0, 8)}...</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-400">
                        <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{u.phone || 'No phone set'}</span>
                      </div>
                      {u.phone && (
                        <a
                          href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '').replace(/^0/, '92')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-slate-400 hover:text-emerald-300 font-mono inline-block mt-0.5 underline transition-colors"
                          title="Open WhatsApp chat with this real number"
                        >
                          WhatsApp Direct
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.package === 'One Month'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : u.package === 'One Week'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          <Zap className="w-3 h-3" />
                          <span>{u.package}</span>
                        </span>

                        {u.package !== 'None' ? (
                          <button
                            onClick={() =>
                              handleTogglePackage(
                                u.id,
                                u.package === 'One Month' ? 'monthly' : 'weekly',
                                'deactivate'
                              )
                            }
                            className="px-2 py-0.5 rounded-md bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 hover:text-white text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Deactivate package membership for this user"
                          >
                            <ZapOff className="w-2.5 h-2.5" />
                            <span>Deactivate</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleTogglePackage(u.id, 'weekly', 'activate')}
                              className="px-2 py-0.5 rounded-md bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
                              title="Activate One Week (7 Days) Package"
                            >
                              + 7 Days
                            </button>
                            <button
                              onClick={() => handleTogglePackage(u.id, 'monthly', 'activate')}
                              className="px-2 py-0.5 rounded-md bg-amber-950/60 hover:bg-amber-900 border border-amber-800/80 text-amber-300 hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
                              title="Activate One Month (30 Days) Package"
                            >
                              + 30 Days
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      Rs. {u.balance.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleViewHistory(u.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="View Complete User History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            u.status === 'active'
                              ? 'bg-red-950/40 hover:bg-red-900 text-red-400'
                              : 'bg-emerald-950/40 hover:bg-emerald-900 text-emerald-400'
                          }`}
                          title={u.status === 'active' ? 'Suspend User' : 'Activate User'}
                        >
                          {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleOpenPasswordModal(u)}
                          className="p-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900 text-blue-400 hover:text-white transition-colors cursor-pointer"
                          title="Change User Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(u)}
                          className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-400 hover:text-white transition-colors cursor-pointer"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User History Modal */}
      {selectedUserHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative my-8 max-h-[85vh] flex flex-col">
            <button
              onClick={() => setSelectedUserHistory(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">
                Full Account Audit
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {selectedUserHistory.user.name} ({selectedUserHistory.user.email})
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-mono">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                  <Phone className="w-3 h-3" />
                  Real Phone: {selectedUserHistory.user.phone || 'None'}
                </span>
                <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                  Referral: {selectedUserHistory.user.referralCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem('ms_auto_search_user', selectedUserHistory.user.email);
                    window.dispatchEvent(new CustomEvent('ms_navigate_tab', { detail: 'user_data_info' }));
                    setSelectedUserHistory(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-sans font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Open in User Data Info System with all 4 tables"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Open in User Data Info System</span>
                </button>
              </div>
            </div>

            {/* Balances summary */}
            <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Available Balance</span>
                <div className="text-base font-bold text-emerald-400 font-mono">
                  Rs. {selectedUserHistory.wallet.availableBalance.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Pending Balance</span>
                <div className="text-base font-bold text-amber-400 font-mono">
                  Rs. {selectedUserHistory.wallet.pendingBalance.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Scrollable tables */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h4 className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Package Subscriptions & Status</span>
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => handleTogglePackage(selectedUserHistory.user.id, 'weekly', 'activate')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[11px] font-bold transition-colors cursor-pointer"
                      title="Directly activate One Week (7 Days) Package"
                    >
                      + Activate One Week
                    </button>
                    <button
                      onClick={() => handleTogglePackage(selectedUserHistory.user.id, 'monthly', 'activate')}
                      className="px-2.5 py-1 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 text-[11px] font-bold transition-colors cursor-pointer"
                      title="Directly activate One Month (30 Days) Package"
                    >
                      + Activate One Month
                    </button>
                    {selectedUserHistory.packages.some((p) => p.status === 'active') && (
                      <button
                        onClick={() =>
                          handleTogglePackage(
                            selectedUserHistory.user.id,
                            'monthly',
                            'deactivate'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="Deactivate currently active package"
                      >
                        <ZapOff className="w-3 h-3" />
                        <span>Deactivate Active</span>
                      </button>
                    )}
                  </div>
                </div>

                {selectedUserHistory.packages.length === 0 ? (
                  <p className="text-xs text-slate-500 py-1">No package subscriptions recorded.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedUserHistory.packages.map((p) => (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-xl border text-xs flex justify-between items-center ${
                          p.status === 'active'
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div>
                          <span className="font-semibold text-white mr-2">{p.packageName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            via {p.paymentMethod} · {new Date(p.startDate).toLocaleDateString()} to {new Date(p.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              p.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {p.status.toUpperCase()}
                          </span>
                          {p.status === 'active' && (
                            <button
                              onClick={() =>
                                handleTogglePackage(
                                  selectedUserHistory.user.id,
                                  p.packageId,
                                  'deactivate'
                                )
                              }
                              className="px-2 py-0.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 text-[10px] font-semibold cursor-pointer"
                              title="Deactivate this package"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-300 mb-2">Withdrawals History</h4>
                {selectedUserHistory.withdrawals.length === 0 ? (
                  <p className="text-xs text-slate-500">No withdrawals made.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedUserHistory.withdrawals.map((w) => (
                      <div key={w.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between">
                        <div>
                          <span className="font-semibold text-white">Rs. {w.amount.toLocaleString()} ({w.method})</span>
                          <span className="text-[10px] text-slate-500 ml-2 font-mono">{w.id}</span>
                        </div>
                        <span className="font-mono text-amber-400 font-bold">{w.status.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-300 mb-2">Ledger Adjustments</h4>
                {selectedUserHistory.transactions.length === 0 ? (
                  <p className="text-xs text-slate-500">No transactions recorded.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedUserHistory.transactions.map((t) => (
                      <div key={t.id} className="p-2 bg-slate-950 rounded-xl border border-slate-800/80 text-xs flex justify-between items-center">
                        <div>
                          <span className="text-slate-300">{t.reason}</span>
                          <span className="text-[10px] text-slate-500 ml-2 font-mono">{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className={`font-mono font-bold ${t.type === 'credit' ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {t.type === 'credit' ? '+' : '-'} Rs. {t.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={handleClosePasswordModal}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-2xl">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Security Override</span>
                <h3 className="text-base font-bold text-white tracking-tight">Change User Password</h3>
              </div>
            </div>

            <div className="mb-4 p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 text-xs">
              <div className="font-bold text-white text-sm">{passwordModalUser.name}</div>
              <div className="text-slate-400 font-mono text-[11px] mt-0.5">{passwordModalUser.email}</div>
              <div className="text-slate-500 font-mono text-[10px] mt-0.5">User ID: {passwordModalUser.id}</div>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitChangePassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-950/50 transition-all cursor-pointer disabled:opacity-60"
                >
                  {passwordSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Account Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-rose-900/60 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={handleCloseDeleteModal}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Destructive Action</span>
                <h3 className="text-base font-bold text-white tracking-tight">Delete User Account</h3>
              </div>
            </div>

            <div className="p-3.5 bg-rose-950/30 border border-rose-900/50 rounded-2xl mb-4 text-xs text-rose-200/90 leading-relaxed">
              Are you sure you want to permanently delete this user account? All credentials, wallets, subscription packages, and ledger history for this user will be purged.
            </div>

            <div className="mb-5 p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="font-bold text-white">{deleteModalUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono text-slate-300">{deleteModalUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono text-emerald-400">{deleteModalUser.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Available Balance:</span>
                <span className="font-mono font-bold text-emerald-400">Rs. {deleteModalUser.balance.toLocaleString()}</span>
              </div>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deleteSubmitting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-950/50 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteSubmitting ? 'Deleting Account...' : 'Permanently Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
