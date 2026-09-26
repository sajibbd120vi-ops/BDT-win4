import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SplashScreen } from './components/common/SplashScreen';
import { Header } from './components/common/Header';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { AuthScreen } from './components/auth/AuthScreen';

// User Views
import { UserHome } from './components/user/UserHome';
import { DepositView } from './components/user/DepositView';
import { WithdrawView } from './components/user/WithdrawView';
import { BankCardView } from './components/user/BankCardView';
import { ReferralView } from './components/user/ReferralView';
import { RecordsView } from './components/user/RecordsView';
import { HelpLineView } from './components/user/HelpLineView';
import { ProfileView } from './components/user/ProfileView';

// Games
import { WinColorGame } from './components/games/WinColorGame';
import { AviatorGame } from './components/games/AviatorGame';
import { NumberGame } from './components/games/NumberGame';
import { LuckySpinGame } from './components/games/LuckySpinGame';
import { DiceRollGame } from './components/games/DiceRollGame';

// Admin Portal
import { AdminPortal } from './components/admin/AdminPortal';

type ActiveView =
  | 'home'
  | 'refer'
  | 'records'
  | 'profile'
  | 'deposit'
  | 'withdraw'
  | 'bank'
  | 'help'
  | 'game_win_color'
  | 'game_aviator'
  | 'game_number'
  | 'game_lucky'
  | 'game_dice';

function MainApp() {
  const { currentUser, adminPortalOpen, setAdminPortalOpen } = useAuth();

  const [loadingSplash, setLoadingSplash] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Check URL referral code parameter if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && !currentUser) {
      setAuthModalOpen(true);
    }
  }, [currentUser]);

  if (loadingSplash) {
    return <SplashScreen onComplete={() => setLoadingSplash(false)} />;
  }

  // If Admin Portal opened via secret trigger, show it immediately
  if (adminPortalOpen) {
    return <AdminPortal onClose={() => setAdminPortalOpen(false)} />;
  }

  // If no user is authenticated, show dedicated full-screen Login/Signup page
  if (!currentUser) {
    return <AuthScreen />;
  }

  // Handle bottom navigation tabs
  const handleNavSelect = (tab: NavTab) => {
    setActiveView(tab);
  };

  const isSubView = [
    'deposit',
    'withdraw',
    'bank',
    'help',
    'game_win_color',
    'game_aviator',
    'game_number',
    'game_lucky',
    'game_dice',
  ].includes(activeView);

  return (
    <div className="min-h-screen bg-[#060c1c] text-white flex flex-col font-sans select-none antialiased">
      {/* Top Header - hidden in dedicated full-page games and subviews that have their own back button */}
      {!isSubView && (
        <Header
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenDeposit={() => setActiveView('deposit')}
          unreadCount={1}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-md mx-auto w-full px-3 pt-3">
        {activeView === 'home' && (
          <UserHome
            onNavigate={(target) => {
              setActiveView(target as ActiveView);
            }}
          />
        )}

        {activeView === 'refer' && <ReferralView />}

        {activeView === 'records' && <RecordsView />}

        {activeView === 'profile' && (
          <ProfileView
            onNavigate={(target) => {
              if (target === 'about') {
                // handled inside profile
              } else {
                setActiveView(target as ActiveView);
              }
            }}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {/* Sub-views with Back actions */}
        {activeView === 'deposit' && (
          <DepositView
            onBack={() => setActiveView('home')}
            onViewRecords={() => setActiveView('records')}
            onOpenHelp={() => setActiveView('help')}
          />
        )}

        {activeView === 'withdraw' && (
          <WithdrawView
            onBack={() => setActiveView('home')}
            onViewRecords={() => setActiveView('records')}
            onManageBanks={() => setActiveView('bank')}
          />
        )}

        {activeView === 'bank' && (
          <BankCardView onBack={() => setActiveView('profile')} />
        )}

        {activeView === 'help' && (
          <HelpLineView onBack={() => setActiveView('home')} />
        )}

        {/* Games Views */}
        {activeView === 'game_win_color' && (
          <WinColorGame
            onBack={() => setActiveView('home')}
            onNavigate={(target) => setActiveView(target as ActiveView)}
          />
        )}

        {activeView === 'game_aviator' && (
          <AviatorGame
            onBack={() => setActiveView('home')}
            onNavigate={(target) => setActiveView(target as ActiveView)}
          />
        )}

        {activeView === 'game_number' && (
          <NumberGame onBack={() => setActiveView('home')} />
        )}

        {activeView === 'game_lucky' && (
          <LuckySpinGame onBack={() => setActiveView('home')} />
        )}

        {activeView === 'game_dice' && (
          <DiceRollGame onBack={() => setActiveView('home')} />
        )}
      </main>

      {/* Bottom Navigation Bar - only on primary tabs */}
      {!isSubView && (
        <BottomNav
          currentTab={
            ['home', 'refer', 'records', 'profile'].includes(activeView)
              ? (activeView as NavTab)
              : 'home'
          }
          onSelectTab={handleNavSelect}
        />
      )}

      {/* Global Notifications Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
