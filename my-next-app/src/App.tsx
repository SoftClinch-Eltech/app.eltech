"use client";

import { useState, useEffect } from 'react';
import { Screen, User } from './types';
import { initialUsers } from './data/sapMockData';

const SCREEN_TO_SLUG: Record<Screen, string> = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  FIN_STATEMENTS_MAIN: '/financial-statements',
  TRIAL_BALANCE_SEL: '/trial-balance-select',
  TRIAL_BALANCE_REP: '/trial-balance-report',
  BALANCE_DISP_SEL: '/balance-display-select',
  BALANCE_DISP_REP: '/balance-display-report',
  PROFIT_LOSS_SEL: '/profit-loss-select',
  PROFIT_LOSS_REP: '/profit-loss-report',
  BALANCE_SHEET_SEL: '/balance-sheet-select',
  BALANCE_SHEET_REP: '/balance-sheet-report',
  LEDGER_REP_MAIN: '/ledger-reporting',
  GL_LEDGER_SEL: '/gl-ledger-select',
  GL_LEDGER_REP: '/gl-ledger-report',
  CUSTOMER_LEDGER_SEL: '/customer-ledger-select',
  CUSTOMER_LEDGER_REP: '/customer-ledger-report',
  VENDOR_LEDGER_SEL: '/vendor-ledger-select',
  VENDOR_LEDGER_REP: '/vendor-ledger-report',
  STOCK_REP: '/stock-report',
  DOC_DISPLAY_MAIN: '/document-display',
  FIN_DOC_SEL: '/financial-document-select',
  FIN_DOC_REP: '/financial-document-report',
  INVOICE_SEL: '/invoice-select',
  INVOICE_REP: '/invoice-report',
  PO_REP: '/purchase-order-report',
  USER_MASTER_MAIN: '/user-master',
  USER_DETAILS: '/user-details',
  SETTINGS_MAIN: '/settings',
  SETTINGS_DETAILS: '/settings-details',
};

const SLUG_TO_SCREEN = Object.fromEntries(
  Object.entries(SCREEN_TO_SLUG).map(([screen, slug]) => [slug, screen as Screen])
);

// Common UI Elements
import {
  AppHeader,
  Breadcrumbs,
  Sidebar,
  ToastNotification,
  Toast,
  WireframeModal
} from './components/CommonUI/CommonUI';

// Screen Modules
import { LoginScreen } from './components/LoginScreen/LoginScreen';
import { DashboardScreen } from './components/DashboardScreen/DashboardScreen';
import { FinancialStatementsModule } from './components/FinancialStatementsModule/FinancialStatementsModule';
import { LedgerReportingModule } from './components/LedgerReportingModule/LedgerReportingModule';
import { DocumentDisplayModule } from './components/DocumentDisplayModule/DocumentDisplayModule';
import { UserMasterModule } from './components/UserMasterModule/UserMasterModule';
import { SettingsModule } from './components/SettingsModule/SettingsModule';

// SAP Diagnostics drawer
import { SAPMappingPanel } from './components/SAPMappingPanel/SAPMappingPanel';

export default function App() {
  // Session Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Navigation Router state
  const [activeScreen, setActiveScreen] = useState<Screen>('DASHBOARD');

  // Interactive System-wide Toast notice
  const [toast, setToast] = useState<Toast | null>(null);

  // Wireframe / SAP Blueprint Modal toggle
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Shared users database state for SU01 User Master dynamic updates
  const [usersList, setUsersList] = useState<User[]>(initialUsers);

  // Helper to trigger system toast notices
  const triggerToast = (message: string, type: Toast['type'] = 'success') => {
    setToast({ message, type });
  };

  // Synchronize state with URL slug
  useEffect(() => {
    const handlePopState = () => {
      let path = window.location.pathname;
      const basePath = path.startsWith('/app.eltech') ? '/app.eltech' : '';
      if (basePath) {
        path = path.slice(basePath.length);
      }
      
      const targetScreen = SLUG_TO_SCREEN[path] || (currentUser ? 'DASHBOARD' : 'LOGIN');
      
      if (!currentUser && targetScreen !== 'LOGIN') {
        setActiveScreen('LOGIN');
        window.history.replaceState(null, '', `${basePath}/login`);
      } else {
        setActiveScreen(targetScreen);
      }
    };

    handlePopState();

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    triggerToast(`Welcome back to Client 800, ${user.fullName}!`);
    setActiveScreen('DASHBOARD');

    const basePath = window.location.pathname.startsWith('/app.eltech') ? '/app.eltech' : '';
    window.history.pushState(null, '', `${basePath}/dashboard`);
  };

  const handleLogout = () => {
    if (currentUser) {
      triggerToast(`User ${currentUser.username} logged out from client gateway.`);
    }
    setCurrentUser(null);
    setActiveScreen('LOGIN');

    const basePath = window.location.pathname.startsWith('/app.eltech') ? '/app.eltech' : '';
    window.history.pushState(null, '', `${basePath}/login`);
  };

  const handleNavigate = (screen: Screen) => {
    // Check permission safeguards for different screens based on currentUser profile permissions
    if (currentUser) {
      if (screen.startsWith('USER_MASTER_') && !currentUser.permissions.userMaster) {
        triggerToast('Authorization error: Profile lacks SU01 User Master permissions.', 'warning');
        return;
      }
      if (screen.startsWith('SETTINGS_') && !currentUser.permissions.settings) {
        triggerToast('Authorization error: Profile lacks SPRO SPRO Configuration permissions.', 'warning');
        return;
      }
      if (screen.startsWith('FIN_DOC_') && !currentUser.permissions.fb03) {
        triggerToast('Authorization error: Account is not authorized to execute FB03.', 'warning');
        return;
      }
      if (screen.startsWith('INVOICE_') && !currentUser.permissions.vf03) {
        triggerToast('Authorization error: Account is not authorized to execute VF03.', 'warning');
        return;
      }
    }

    setActiveScreen(screen);

    const slug = SCREEN_TO_SLUG[screen] || '/login';
    const basePath = window.location.pathname.startsWith('/app.eltech') ? '/app.eltech' : '';
    const newPath = `${basePath}${slug}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  const hideSidebarScreens: Screen[] = [
    'PO_REP',
    'TRIAL_BALANCE_REP', 'BALANCE_DISP_REP', 'PROFIT_LOSS_REP', 'BALANCE_SHEET_REP',
    'GL_LEDGER_REP', 'CUSTOMER_LEDGER_REP', 'VENDOR_LEDGER_REP',
    'USER_DETAILS'
  ];
  const showSidebar = currentUser && activeScreen !== 'LOGIN' && !hideSidebarScreens.includes(activeScreen);

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Header (rendered if logged in) */}
        {currentUser && (
          <>
            <AppHeader
              currentUser={currentUser}
              activeScreen={activeScreen}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              onShowHelp={() => setShowBlueprint(true)}
            />
            <Breadcrumbs activeScreen={activeScreen} onNavigate={handleNavigate} />
          </>
        )}

        {/* Global Toast */}
        <ToastNotification toast={toast} onClose={() => setToast(null)} />

        {/* Page layout with permanent left sidebar */}
        <main className="flex flex-col lg:flex-row">
          {showSidebar && (
            <Sidebar
              currentUser={currentUser}
              activeScreen={activeScreen}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed((prev) => !prev)}
            />
          )}
          <div className="flex-1 min-w-0 min-h-[calc(100vh-3.5rem)] bg-[#FFFFFF]">
            {!currentUser || activeScreen === 'LOGIN' ? (
              <LoginScreen onLoginSuccess={handleLogin} />
            ) : (
              <>
              {/* Dashboard view */}
              {activeScreen === 'DASHBOARD' && (
                <DashboardScreen currentUser={currentUser} onNavigate={handleNavigate} />
              )}

              {/* Module 1: Financial Statements */}
              {(activeScreen.startsWith('FIN_STATEMENTS_') ||
                activeScreen.includes('TRIAL_BALANCE') ||
                activeScreen.includes('BALANCE_DISP') ||
                activeScreen.includes('PROFIT_LOSS') ||
                activeScreen.includes('BALANCE_SHEET')) && (
                <FinancialStatementsModule
                  activeScreen={activeScreen}
                  onNavigate={handleNavigate}
                  triggerToast={triggerToast}
                />
              )}

              {/* Module 2: Ledger Reporting */}
              {(activeScreen.startsWith('LEDGER_REP_') ||
                activeScreen.includes('GL_LEDGER_') ||
                activeScreen.includes('CUSTOMER_LEDGER_') ||
                activeScreen.includes('VENDOR_LEDGER_') ||
                activeScreen.includes('STOCK_')) && (
                <LedgerReportingModule
                  activeScreen={activeScreen}
                  onNavigate={handleNavigate}
                  triggerToast={triggerToast}
                />
              )}

              {/* Module 3: Document Display */}
              {(activeScreen.startsWith('DOC_DISPLAY_') ||
                activeScreen.includes('FIN_DOC_') ||
                activeScreen.includes('INVOICE_') ||
                activeScreen.includes('PO_')) && (
                <DocumentDisplayModule
                  activeScreen={activeScreen}
                  onNavigate={handleNavigate}
                  triggerToast={triggerToast}
                />
              )}

              {/* Module 4: User Master (SU01) */}
              {(activeScreen.startsWith('USER_MASTER_') || activeScreen === 'USER_DETAILS') && (
                <UserMasterModule
                  activeScreen={activeScreen}
                  onNavigate={handleNavigate}
                  triggerToast={triggerToast}
                  users={usersList}
                  onUpdateUsers={setUsersList}
                />
              )}

              {/* Module 5: Settings (SPRO) */}
              {(activeScreen.startsWith('SETTINGS_')) && (
                <SettingsModule
                  activeScreen={activeScreen}
                  onNavigate={handleNavigate}
                  triggerToast={triggerToast}
                />
              )}
            </>
          )}
          </div>
        </main>
      </div>

      {/* SAP diagnostics overlay for current transactions */}
      {currentUser && <SAPMappingPanel activeScreen={activeScreen} />}

      {/* Component Blueprint & Wireframe Overlay */}
      {showBlueprint && <WireframeModal onClose={() => setShowBlueprint(false)} />}

      {/* Simple Footer */}
      <footer className="bg-[#273B5E] text-slate-400 py-3 text-center text-[10px] font-mono select-none border-t border-slate-700">
        <span>Softclinch Consult Services Private Limited | Licensed to Eltech Appliances Private Limited | All Rights Reserved 2026</span>
      </footer>
    </div>
  );
}
