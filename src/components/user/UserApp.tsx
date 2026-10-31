import React, { useState, useEffect } from 'react';
import { UserHeader } from './UserHeader';
import { UserBottomNav, UserTab } from './UserBottomNav';
import { DailyAttendanceCard } from './DailyAttendanceCard';
import { LivePackageCard } from './LivePackageCard';
import { PackageSection } from './PackageSection';
import { InvitePage } from './InvitePage';
import { WalletPage } from './WalletPage';
import { DedicatedSupportPortal } from './DedicatedSupportPortal';
import { FunnelProgressStepper } from './FunnelProgressStepper';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useScreen } from '../../context/ScreenContext';
import { api } from '../../api/client';

export const UserApp: React.FC = () => {
  const { activePackage } = useAuth();
  const { isMaximizedLayout } = useScreen();
  const [activeTab, setActiveTab] = useState<UserTab>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'home' || tabParam === 'attendance') return 'home';
    if (tabParam === 'packages') return 'packages';
    if (tabParam === 'invite') return 'invite';
    if (tabParam === 'wallet') return 'wallet';
    if (tabParam === 'support') return 'support';
    return 'home';
  });
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);

  // Poll for unread support count to display badge on mobile bottom nav button
  useEffect(() => {
    const checkUnread = async () => {
      try {
        const msgs = await api.getSupportMessages();
        const unread = msgs.filter((m) => m.sender === 'admin' && m.status === 'unread').length;
        setUnreadSupportCount(unread);
      } catch {
        // ignore
      }
    };
    checkUnread();
    const interval = setInterval(checkUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${
        activeTab === 'support' ? 'h-screen overflow-hidden pb-16' : 'pb-28 overflow-x-hidden'
      } selection:bg-emerald-500/30 selection:text-emerald-200 w-full`}
    >
      {/* User Header (hidden on dedicated full support tab to avoid duplicate bars) */}
      {activeTab !== 'support' && (
        <UserHeader
          onOpenCustomerService={() => setActiveTab('support')}
          unreadSupportCount={unreadSupportCount}
        />
      )}

      {/* Main Content Area — dynamically expands and full-adjusts on screen */}
      <main
        className={`flex-1 w-full mx-auto transition-all duration-300 ${
          activeTab === 'support'
            ? 'h-[calc(100dvh-4rem)] flex flex-col p-0 max-w-5xl overflow-hidden'
            : isMaximizedLayout
            ? 'max-w-4xl px-3.5 pt-20 pb-4 sm:px-6 sm:pt-20 sm:pb-6'
            : 'max-w-lg px-3.5 pt-20 pb-4 sm:px-5 sm:pt-20 sm:pb-6'
        }`}
      >
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-5 animate-page-enter">
            {/* Interactive Journey Stepper */}
            <div className="animate-stagger-1">
              <FunnelProgressStepper onNavigateTab={(tab) => setActiveTab(tab)} />
            </div>

            {/* Daily Attendance Card */}
            <div className="animate-stagger-2">
              <DailyAttendanceCard />
            </div>

            {/* Live Package Status Card */}
            <div className="animate-stagger-3">
              <LivePackageCard />
            </div>

            {/* Quick Mobile Shortcut to Packages */}
            <div className="animate-stagger-4 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-blue-950/30 border-2 border-emerald-500/30 hover:border-emerald-500/50 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xl">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Subscription Packages
                </span>
                <p className="text-[11px] text-slate-400">
                  Weekly (Rs. 500) & Monthly (Rs. 1,000) earning tiers
                </p>
              </div>
              <button
                onClick={() => setActiveTab('packages')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/25 shrink-0 active:scale-95"
              >
                <span>View Plans</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PACKAGES */}
        {activeTab === 'packages' && (
          <div className="space-y-5 animate-page-enter">
            <PackageSection onOpenPage2={() => setActiveTab('invite')} />
          </div>
        )}

        {/* TAB 3: INVITE */}
        {activeTab === 'invite' && (
          <div className="animate-page-enter">
            <InvitePage />
          </div>
        )}

        {/* TAB 4: WALLET */}
        {activeTab === 'wallet' && (
          <div className="animate-page-enter">
            <WalletPage />
          </div>
        )}

        {/* TAB 5: SUPPORT */}
        {activeTab === 'support' && (
          <div className="flex-1 w-full h-full flex flex-col overflow-hidden animate-page-enter">
            <DedicatedSupportPortal onBackToApp={() => setActiveTab('home')} isEmbedded={true} />
          </div>
        )}
      </main>

      {/* 5-Button Bottom Mobile Navigation Bar (Home, Packages, Invite, Wallet, Support) */}
      <UserBottomNav
        currentTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        unreadSupportCount={unreadSupportCount}
      />
    </div>
  );
};
