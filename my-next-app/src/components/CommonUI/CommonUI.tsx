import React, { useState, useEffect } from 'react';
import { Screen, User } from '../../types';
import {
  Search,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Clock,
  User as UserIcon,
  RotateCcw,
  Sliders,
  Sparkles,
  Layers,
  BookOpen,
  Receipt,
  Users,
  Settings2,
  LayoutGrid,
  ShieldCheck,
  Archive,
  Menu
} from 'lucide-react';

// ============================================================================
// SYSTEM TOAST NOTIFICATION HELPERS
// ============================================================================
export interface Toast {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export const ToastNotification: React.FC<{ toast: Toast | null; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed top-16 right-4 z-50 flex items-center gap-3 bg-white border-l-4 border-[#963F29] text-slate-800 px-4 py-3 rounded-md shadow-xl animate-bounce-short text-xs font-sans">
      <div className="p-1 rounded-full bg-amber-50">
        <Sparkles className="w-4 h-4 text-[#963F29]" />
      </div>
      <div>
        <span className="font-semibold block text-[#273B5E]">System Notice</span>
        <span className="text-slate-600">{toast.message}</span>
      </div>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold ml-4 text-sm">×</button>
    </div>
  );
};


// ============================================================================
// BRAND LOGO COMPONENT
// ============================================================================
export const SoftClinchLogo: React.FC<{
  collapsed?: boolean;
  darkBg?: boolean;
  hideText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ collapsed = false, darkBg = false, hideText = false, size = 'md' }) => {
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-16 h-16' : 'w-10 h-10';
  return (
    <div className={`flex items-center gap-3 ${collapsed ? 'flex-col justify-center' : ''}`}>
      {/* The Logo Symbol */}
      <div className={`relative ${iconSize} flex-shrink-0`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Top/Right Blue Ribbon */}
          <path
            d="M 20,45 C 20,25 35,10 55,10 C 75,10 90,25 90,45 C 90,52 85,58 78,58 C 71,58 68,52 68,45 C 68,38 62,32 55,32 C 48,32 42,38 42,45 C 42,52 36,58 29,58 C 22,58 20,52 20,45 Z"
            fill={darkBg ? "#60a5fa" : "#273B5E"}
          />
          {/* Bottom/Left Red Ribbon */}
          <path
            d="M 80,55 C 80,75 65,90 45,90 C 25,90 10,75 10,55 C 10,48 15,42 22,42 C 29,42 32,48 32,55 C 32,62 38,68 45,68 C 52,68 58,62 58,55 C 58,48 64,42 71,42 C 78,42 80,48 80,55 Z"
            fill="#963F29"
          />
        </svg>
      </div>
      {/* The Text brand details */}
      {!collapsed && !hideText && (
        <div className="flex flex-col text-left">
          <div className="font-sans font-extrabold tracking-tight text-base leading-none">
            <span className={darkBg ? "text-white" : "text-[#273B5E]"}>Soft</span>
            <span className="text-[#963F29]">Clinch</span>
          </div>
          <span className={`text-[8px] uppercase tracking-wider font-sans font-bold leading-none mt-1.5 ${darkBg ? "text-slate-300" : "text-[#273B5E]/70"}`}>
            We Ensure What We Assure
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// APP HEADER COMPONENT
// ============================================================================
interface AppHeaderProps {
  currentUser: User | null;
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  onShowHelp: () => void;
  onToggleSidebar?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  activeScreen,
  onNavigate,
  onLogout,
  onShowHelp,
  onToggleSidebar
}) => {
  const [timeStr, setTimeStr] = useState<string>('2026-07-15 03:51:54 UTC');

  // Real-time UTC clock simulated correctly
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-[#273B5E] text-white border-b border-slate-700/80 select-none shadow-sm h-14 sticky top-0 z-30 flex items-center justify-between px-4">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        {currentUser && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors shrink-0"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div
          onClick={() => currentUser && onNavigate('DASHBOARD')}
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 active:scale-95 transition-transform"
        >
          {/* SC Square Logo */}
          <div className="w-11 h-11 bg-[#963F29] rounded-xl flex items-center justify-center font-sans font-black text-white text-xl tracking-tight shadow-sm">
            sc
          </div>
          {/* Softclinch Consult SERVICES Text */}
          <div className="flex flex-col text-left">
            <span className="font-sans font-bold text-white text-sm leading-tight tracking-tight">
              Softclinch Consult
            </span>
            <span className="text-[9px] font-sans font-extrabold text-[#963F29] tracking-wider leading-none mt-1">
              SERVICES
            </span>
          </div>
        </div>


      </div>

      {/* Global Command Search bar */}
      <div className="hidden lg:flex items-center bg-[#1E293B] border border-slate-700/60 rounded-md w-80 px-3 py-1.5 text-xs gap-2">
        <Search className="w-3.5 h-3.5 text-slate-400" />
        <input
          id="hdr-command-input"
          type="text"
          placeholder="Enter Transaction Code (e.g. /nFB03)"
          className="bg-transparent text-slate-200 outline-none w-full text-xs font-mono placeholder:text-slate-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = e.currentTarget.value.trim().toLowerCase();
              if (val === '/nfb03' || val === 'fb03') {
                onNavigate('FIN_DOC_SEL');
              } else if (val === '/nvf03' || val === 'vf03') {
                onNavigate('INVOICE_SEL');
              } else if (val === '/nfbl3n' || val === 'fbl3n') {
                onNavigate('GL_LEDGER_SEL');
              } else if (val === '/nfbl5n' || val === 'fbl5n') {
                onNavigate('CUSTOMER_LEDGER_SEL');
              } else if (val === '/nfbl1n' || val === 'fbl1n') {
                onNavigate('VENDOR_LEDGER_SEL');
              } else if (val === '/nf.01' || val === 'f.01') {
                onNavigate('TRIAL_BALANCE_SEL');
              } else if (val === '/ndashboard' || val === 'dashboard') {
                onNavigate('DASHBOARD');
              } else if (val === '/nusers' || val === 'user') {
                onNavigate('USER_MASTER_MAIN');
              } else if (val === '/nsettings' || val === 'settings') {
                onNavigate('SETTINGS_MAIN');
              }
              e.currentTarget.value = '';
            }
          }}
        />
        <span className="bg-slate-700/60 text-slate-400 px-1 py-0.5 rounded text-[8px] font-mono">Enter</span>
      </div>

      {/* Utility Area */}
      <div className="flex items-center gap-4">




        {/* User profile dropdown info */}
        {currentUser && (
          <div className="flex items-center gap-2.5 border-l border-slate-700/80 pl-4">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-semibold leading-tight text-white">{currentUser.fullName}</span>
              <span className="text-[9px] text-[#963F29] font-mono uppercase font-bold mt-0.5">{currentUser.role}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-amber-500 flex items-center justify-center text-white text-xs font-mono font-bold shadow-sm">
              {currentUser.username === 'softclinch_arch' ? 'SC' : currentUser.username.substring(0, 2).toUpperCase()}
            </div>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-all ml-1"
              title="Logout from Gateway"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

// ============================================================================
// BREADCRUMBS NAVIGATION
// ============================================================================
interface BreadcrumbsProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ activeScreen, onNavigate }) => {
  const getBreadcrumbs = (screen: Screen) => {
    const list = [{ label: 'ERP Gateway', target: 'DASHBOARD' as Screen }];

    if (screen === 'DASHBOARD') {
      return [{ label: 'Enterprise Cockpit', target: 'DASHBOARD' as Screen }];
    }

    // Financial Statements
    if (screen.startsWith('FIN_STATEMENTS_MAIN') || screen.startsWith('TRIAL_BALANCE_') || screen.startsWith('BALANCE_DISP_') || screen.startsWith('PROFIT_LOSS_') || screen.startsWith('BALANCE_SHEET_')) {
      list.push({ label: 'Financial Statements', target: 'FIN_STATEMENTS_MAIN' as Screen });
      if (screen.includes('TRIAL_BALANCE')) list.push({ label: 'Trial Balance', target: 'TRIAL_BALANCE_SEL' as Screen });
      if (screen.includes('BALANCE_DISP')) list.push({ label: 'Balance Display', target: 'BALANCE_DISP_SEL' as Screen });
      if (screen.includes('PROFIT_LOSS')) list.push({ label: 'Profit & Loss', target: 'PROFIT_LOSS_SEL' as Screen });
      if (screen.includes('BALANCE_SHEET')) list.push({ label: 'Balance Sheet', target: 'BALANCE_SHEET_SEL' as Screen });
    }

    // Ledger Reporting
    if (screen.startsWith('LEDGER_REP_MAIN') || screen.startsWith('GL_LEDGER_') || screen.startsWith('CUSTOMER_LEDGER_') || screen.startsWith('VENDOR_LEDGER_') || screen.startsWith('STOCK_')) {
      list.push({ label: 'Ledger Reporting', target: 'LEDGER_REP_MAIN' as Screen });
      if (screen.includes('GL_LEDGER')) list.push({ label: 'General Ledger', target: 'GL_LEDGER_SEL' as Screen });
      if (screen.includes('CUSTOMER_LEDGER')) list.push({ label: 'Customer Ledger', target: 'CUSTOMER_LEDGER_SEL' as Screen });
      if (screen.includes('VENDOR_LEDGER')) list.push({ label: 'Vendor Ledger', target: 'VENDOR_LEDGER_SEL' as Screen });
      if (screen === 'STOCK_REP') list.push({ label: 'Stock Ledger', target: 'STOCK_REP' as Screen });
    }

    // Document Display
    if (screen.startsWith('DOC_DISPLAY_MAIN') || screen.startsWith('FIN_DOC_') || screen.startsWith('INVOICE_') || screen.startsWith('PO_')) {
      list.push({ label: 'Document Display', target: 'DOC_DISPLAY_MAIN' as Screen });
      if (screen.includes('FIN_DOC')) list.push({ label: 'Financial Document', target: 'FIN_DOC_SEL' as Screen });
      if (screen.includes('INVOICE')) list.push({ label: 'Invoice', target: 'INVOICE_SEL' as Screen });
      if (screen === 'PO_REP') list.push({ label: 'Purchase Order', target: 'PO_REP' as Screen });
    }

    // User Master
    if (screen.startsWith('USER_MASTER_MAIN') || screen === 'USER_DETAILS') {
      list.push({ label: 'User Administration', target: 'USER_MASTER_MAIN' as Screen });
      if (screen === 'USER_DETAILS') list.push({ label: 'Details & Permissions Assignment', target: 'USER_DETAILS' as Screen });
    }

    // Settings
    if (screen.startsWith('SETTINGS_MAIN') || screen === 'SETTINGS_DETAILS') {
      list.push({ label: 'Settings', target: 'SETTINGS_MAIN' as Screen });
      if (screen === 'SETTINGS_DETAILS') list.push({ label: 'System Configuration & Auditing', target: 'SETTINGS_DETAILS' as Screen });
    }

    return list;
  };

  const items = getBreadcrumbs(activeScreen);

  return (
    <nav className="flex items-center gap-1.5 py-2.5 px-4 bg-white border-b border-slate-200 select-none text-[11px] text-slate-500 font-sans">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          <span
            onClick={() => onNavigate(item.target)}
            className={`cursor-pointer transition-colors ${index === items.length - 1 ? 'text-slate-800 font-semibold' : 'hover:text-[#273B5E]'
              }`}
          >
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};

// ============================================================================
// PERMANENT LEFT SIDEBAR NAVIGATION COMPONENT
// ============================================================================
interface SidebarProps {
  currentUser?: User | null;
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

const navSections = [
  {
    title: 'Navigation',
    items: [
      { label: 'Dashboard', screen: 'DASHBOARD' as Screen, icon: LayoutGrid },
    ]
  },
  {
    title: 'Financial Statements',
    items: [
      { label: 'Trial Balance', screen: 'TRIAL_BALANCE_SEL' as Screen, icon: BookOpen },
      { label: 'Balance Display', screen: 'BALANCE_DISP_SEL' as Screen, icon: BookOpen },
      { label: 'Profit & Loss', screen: 'PROFIT_LOSS_SEL' as Screen, icon: BookOpen },
      { label: 'Balance Sheet', screen: 'BALANCE_SHEET_SEL' as Screen, icon: BookOpen },
    ]
  },
  {
    title: 'Ledger Reporting',
    items: [
      { label: 'General Ledger', screen: 'GL_LEDGER_SEL' as Screen, icon: FileSpreadsheet },
      { label: 'Customer Ledger', screen: 'CUSTOMER_LEDGER_SEL' as Screen, icon: FileSpreadsheet },
      { label: 'Vendor Ledger', screen: 'VENDOR_LEDGER_SEL' as Screen, icon: FileSpreadsheet },
      { label: 'Stock Ledger (Coming Soon)', screen: null, icon: FileSpreadsheet, disabled: true },
    ]
  },
  {
    title: 'Document Display',
    items: [
      { label: 'Financial Document', screen: 'FIN_DOC_SEL' as Screen, icon: Receipt },
      { label: 'Invoice', screen: 'INVOICE_SEL' as Screen, icon: Receipt },
      { label: 'Purchase Order (Coming Soon)', screen: 'PO_REP' as Screen, icon: Receipt },
    ]
  },
  {
    title: 'User Management',
    items: [
      { label: 'User Master', screen: null, icon: Users, disabled: true },
      { label: 'Create User', screen: null, icon: ShieldCheck, disabled: true },
      { label: 'Edit User', screen: null, icon: ShieldCheck, disabled: true },
      { label: 'User Roles', screen: null, icon: ShieldCheck, disabled: true },
      { label: 'Permissions', screen: null, icon: ShieldCheck, disabled: true },
    ]
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', screen: 'SETTINGS_MAIN' as Screen, icon: Settings2 },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeScreen, onNavigate, onLogout, collapsed, onToggle }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Navigation': true,
    'Financial Statements': false,
    'Ledger Reporting': false,
    'Document Display': false,
    'User Management': false,
    'System': false,
  });

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isActive = (screen: Screen | null) => {
    if (!screen) return false;
    if (screen === activeScreen) return true;

    // User Management
    if (screen === 'USER_MASTER_MAIN' && (activeScreen.startsWith('USER_MASTER') || activeScreen === 'USER_DETAILS')) return true;

    // Settings / SPRO
    if (screen === 'SETTINGS_MAIN' && activeScreen.startsWith('SETTINGS')) return true;

    // Financial Statements
    if (screen === 'FIN_STATEMENTS_MAIN' && activeScreen.startsWith('FIN_STATEMENTS')) return true;
    if (screen === 'TRIAL_BALANCE_SEL' && activeScreen === 'TRIAL_BALANCE_REP') return true;
    if (screen === 'BALANCE_DISP_SEL' && activeScreen === 'BALANCE_DISP_REP') return true;
    if (screen === 'PROFIT_LOSS_SEL' && activeScreen === 'PROFIT_LOSS_REP') return true;
    if (screen === 'BALANCE_SHEET_SEL' && activeScreen === 'BALANCE_SHEET_REP') return true;

    // Ledger Reporting
    if (screen === 'GL_LEDGER_SEL' && activeScreen === 'GL_LEDGER_REP') return true;
    if (screen === 'CUSTOMER_LEDGER_SEL' && activeScreen === 'CUSTOMER_LEDGER_REP') return true;
    if (screen === 'VENDOR_LEDGER_SEL' && activeScreen === 'VENDOR_LEDGER_REP') return true;

    // Document Display
    if (screen === 'FIN_DOC_SEL' && activeScreen === 'FIN_DOC_REP') return true;
    if (screen === 'INVOICE_SEL' && activeScreen === 'INVOICE_REP') return true;

    return false;
  };

  return (
    <>
      {/* Mobile Sidebar backdrop */}
      {!collapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-35 transition-opacity"
          onClick={onToggle}
        />
      )}
      <aside className={`border-r border-slate-700/60 bg-[#273B5E] text-slate-200 lg:h-[calc(100vh-3.5rem)] lg:max-h-[calc(100vh-3.5rem)] lg:sticky lg:top-[3.5rem] flex flex-col transition-all duration-300 ease-in-out z-40
        fixed inset-y-0 left-0 h-screen max-h-screen lg:translate-x-0
        ${collapsed ? '-translate-x-full lg:w-20' : 'translate-x-0 lg:w-72 w-72'}
      `}>
        <div className={`px-4 py-4 border-b border-slate-700/60 shrink-0 ${collapsed ? 'text-center' : ''}`}>
          <div className={`flex ${collapsed ? 'flex-col items-center gap-3' : 'items-center gap-3'}`}>
            <div
              onClick={() => {
                onNavigate('DASHBOARD');
                if (window.innerWidth < 1024) onToggle();
              }}
              className="cursor-pointer hover:opacity-90 active:scale-95 transition-transform"
            >
              {/* White/Navy SC Logo Box */}
              <div className="w-12 h-12 rounded-3xl bg-white text-[#273B5E] flex items-center justify-center font-sans font-black text-sm tracking-wider shadow-sm select-none shrink-0">
                SC
              </div>
            </div>

            {!collapsed && (
              <div
                onClick={() => {
                  onNavigate('DASHBOARD');
                  if (window.innerWidth < 1024) onToggle();
                }}
                className="text-left flex-1 min-w-0 cursor-pointer"
              >
                <span className="block text-[10px] uppercase tracking-[0.2em] text-[#8A9BB4] font-black leading-none mb-1 font-sans">
                  SOFTCLINCH
                </span>
                <span className="block text-[15px] font-extrabold text-white font-sans leading-tight">
                  Consult Services
                </span>
              </div>
            )}

            <button
              onClick={onToggle}
              className="rounded-full bg-slate-800/80 hover:bg-slate-700 p-2 text-slate-300 transition-colors w-8 h-8 flex items-center justify-center shrink-0 ml-auto"
              title={collapsed ? 'Open sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4 text-slate-300" /> : <ChevronLeft className="w-4 h-4 text-slate-300" />}
            </button>
          </div>

          {!collapsed && (
            <div className="mt-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-[10px] select-none text-left">
              <p className="text-[#8A9BB4] uppercase tracking-[0.18em] font-extrabold font-sans">
                ACTIVE CLIENT
              </p>
              <p className="mt-1 font-mono text-white font-bold text-[11px]">
                {currentUser ? currentUser.username : 'CLNT 800'}
              </p>
            </div>
          )}
        </div>

        <div className={`p-4 flex-1 overflow-y-auto scrollbar-thin ${collapsed ? 'space-y-4' : 'space-y-3'}`}>
          {navSections.map((section) => {
            const isOpen = expandedSections[section.title] ?? false;
            const isSectionDisabled = section.title === 'User Management' || section.title === 'System';

            return (
              <div
                key={section.title}
                className={`flex flex-col ${isSectionDisabled ? 'opacity-40 blur-[0.5px] pointer-events-none select-none' : ''}`}
              >
                {!collapsed ? (
                  // Section Title (Collapsible Header)
                  <button
                    disabled={isSectionDisabled}
                    onClick={() => !isSectionDisabled && toggleSection(section.title)}
                    className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-left text-white ${isSectionDisabled
                        ? 'cursor-not-allowed text-slate-400'
                        : 'hover:text-[#963F29] hover:bg-white/5'
                      } transition-all select-none group mb-1`}
                  >
                    <span className="text-xs uppercase tracking-wider font-bold font-sans">
                      {section.title}
                    </span>
                    {!isSectionDisabled && (
                      isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#963F29] transition-transform" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#963F29] transition-transform" />
                      )
                    )}
                  </button>
                ) : (
                  // Separator for collapsed state
                  <div className="border-b border-slate-700/40 my-2 shrink-0" />
                )}

                {/* Items List (only show if open or if collapsed) */}
                {(isOpen || collapsed) && !isSectionDisabled && (
                  <div className={`space-y-1 transition-all duration-150 ${!collapsed ? 'pl-3 border-l border-slate-700/30 ml-2.5 mt-1.5 mb-2' : ''}`}>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.screen || null);
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            if (item.disabled) return;
                            if (item.screen) {
                              onNavigate(item.screen);
                              if (window.innerWidth < 1024) onToggle(); // Auto close on mobile
                            }
                          }}
                          className={`w-full text-left rounded-lg px-3 py-2 flex items-center gap-3 text-xs transition-all duration-150 ${item.disabled ? 'cursor-not-allowed opacity-40 blur-[1px]' : 'hover:bg-white/10 hover:translate-x-1 hover:text-white'} ${active ? 'bg-[#963F29] text-white shadow-lg shadow-[#963F29]/20' : 'text-slate-300'}`}
                          title={item.disabled ? 'Coming soon in future release' : item.label}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                          {!collapsed && <span className="font-medium truncate">{item.label}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-4 py-5 border-t border-slate-700/60 shrink-0">
          <div className={`flex items-center gap-3 text-[11px] font-sans text-slate-400 ${collapsed ? 'flex-col items-center' : ''}`}>
            {!collapsed && (
              <div>
                <p className="font-semibold text-slate-200">Operator</p>
                <p className="text-slate-400">Navigate modules & audit logs</p>
              </div>
            )}
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-400 transition-colors ml-auto"
              title="Logout from Financial Reporting Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

// ============================================================================
// FINANCIAL KPI CARD COMPONENT
// ============================================================================
interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: { val: string; isPositive: boolean };
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, trend }) => {
  return (
    <div className="bg-white rounded-lg border border-[#D9DEE6] p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow transition-shadow">
      <div className="absolute right-0 top-0 w-1.5 h-full bg-[#273B5E] group-hover:bg-[#963F29] transition-colors" />
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-sans font-medium text-slate-500 uppercase tracking-wider">{title}</span>
        <span className="text-xl font-mono font-bold text-[#273B5E] tracking-tight">{value}</span>
      </div>
      {(subtitle || trend) && (
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 font-sans">
          <span>{subtitle}</span>
          {trend && (
            <span className={`font-mono font-bold ${trend.isPositive ? 'text-emerald-600' : 'text-[#963F29]'}`}>
              {trend.val}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// STYLIZED "BUTTON BOX" METADATA GRID FOR OUTPUT/REPORT SCREENS
// ============================================================================
export interface ButtonBoxField {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
  valueClass?: string;
}

interface OutputHeaderButtonBoxesProps {
  fields: ButtonBoxField[];
  title?: string;
  tcode?: string;
  className?: string;
}

export const OutputHeaderButtonBoxes: React.FC<OutputHeaderButtonBoxesProps> = ({ fields, title, tcode, className }) => {
  return (
    <div className={`bg-white border rounded-xl shadow-sm p-4 space-y-3 select-none ${className || 'border-[#D9DEE6]'}`}>
      {title && (
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <span className="text-[11px] font-bold text-[#273B5E] uppercase tracking-wider font-sans">
            {title}
          </span>
          {tcode && (
            <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-mono font-bold">
              T-Code: {tcode}
            </span>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {fields.map((field, idx) => {
          const Icon = field.icon;
          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-lg border bg-[#F8FAFC] transition-all hover:bg-slate-50 hover:border-slate-300 ${field.highlight
                ? 'border-amber-200 bg-amber-50/40'
                : 'border-[#D9DEE6]'
                }`}
            >
              <div className="flex flex-col gap-1 pr-2 min-w-0">
                <div className="flex items-center gap-1.5">
                  {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-sans leading-tight">
                    {field.label}
                  </span>
                </div>
                {field.badge && (
                  <span className="text-[8px] bg-[#273B5E]/10 text-[#273B5E] font-mono px-1.5 py-0.5 rounded w-fit uppercase font-bold">
                    {field.badge}
                  </span>
                )}
              </div>

              {/* Outer button box style for the value */}
              <div className={`w-[140px] text-center shrink-0 bg-white border border-[#D9DEE6] px-2.5 py-1.5 rounded-md shadow-sm font-mono text-xs font-bold text-slate-800 hover:shadow-md hover:border-[#273B5E] transition-all whitespace-nowrap select-text cursor-default ${field.valueClass || ''}`}>
                {field.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// DATA TABLE TOOLBAR COMPONENT (SORTING, FILTERING, DOWNLOADS)
// ============================================================================
interface TableToolbarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onClearFilters?: () => void;
  totalRecords?: number;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  searchTerm,
  onSearchChange,
  onClearFilters,
  totalRecords = 0
}) => {
  const [freezeColumn, setFreezeColumn] = useState<boolean>(false);
  const [columnResize, setColumnResize] = useState<boolean>(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] border border-[#D9DEE6] border-b-0 rounded-t-lg p-3 select-none">
      {/* Search Input */}
      <div className="flex items-center gap-2 bg-white border border-[#D9DEE6] rounded px-2.5 py-1.5 text-xs w-full sm:w-72">
        <Search className="w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Global table lookup..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent outline-none w-full text-slate-700 font-sans"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="text-slate-400 hover:text-slate-600 font-bold text-xs"
          >
            ×
          </button>
        )}
      </div>

      {/* Grid Controls (Reset & Row Count) */}
      <div className="flex flex-wrap items-center gap-1.5">
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-sans bg-white text-slate-600 border border-[#D9DEE6] hover:bg-slate-50 transition-colors"
            title="Clear active filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Grid</span>
          </button>
        )}

        {/* Record count indicator */}
        <span className="text-[10px] text-slate-400 font-mono pl-2">
          {totalRecords} rows
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// SYSTEM ARCHITECT & WIREFRAME POPUP (HELP MANUAL OVERVIEW)
// ============================================================================
interface WireframeModalProps {
  onClose: () => void;
}

export const WireframeModal: React.FC<WireframeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-[700px] max-w-[90%] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#273B5E] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#963F29]" />
            <div>
              <h3 className="font-bold text-sm tracking-tight">ERP ARCHITECTURE & WIREFRAME MAP</h3>
              <p className="text-[10px] text-gray-300">Softclinch Consult Services Blueprint</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white font-mono font-bold text-lg">×</button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
          {/* Section 1: Introduction */}
          <div>
            <h4 className="font-bold text-[#273B5E] text-xs uppercase tracking-wide border-b border-slate-200 pb-1 mb-1.5">1. DESIGN BLUEPRINT OVERVIEW</h4>
            <p>
              Softclinch Consult Services modernizes enterprise ERP operations inspired by SAP Fiori guidelines.
              Unlike standard lightweight dashboards, the transaction flows are preserved exactly like standard SAP SAPGUI screens (e.g., selection fields, header mappings, line segments) while incorporating responsive layouts, Inter fonts, and high-contrast color palettes.
            </p>
          </div>

          {/* Section 2: Flow map & Wireframe */}
          <div>
            <h4 className="font-bold text-[#273B5E] text-xs uppercase tracking-wide border-b border-slate-200 pb-1 mb-1.5">2. COMPONENT FLOW HIERARCHY</h4>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded font-mono text-[10px] text-slate-600 space-y-1">
              <div>[App.tsx] - Core State, Gateway Authentication, Navigation Router</div>
              <div>├── [LoginScreen.tsx] - SAP Client Gateway Authentication</div>
              <div>└── [DashboardScreen.tsx] - Enterprise Launchpad Cockpit</div>
              <div>    ├── [FinancialStatementsModule] - GLT0 / FAGLFLEXT Aggregators</div>
              <div>    │   ├── Trial Balance (FAGLB03 / FBL3N) [Selection & Output]</div>
              <div>    │   ├── Balance Display [Selection & Output]</div>
              <div>    │   ├── Profit & Loss (F.01 FSV) [Selection & Output]</div>
              <div>    │   └── Balance Sheet (F.01 FSV) [Selection & Output]</div>
              <div>    ├── [LedgerReportingModule] - BSIS / BSAS Open/Closed Item Ledgers</div>
              <div>    │   ├── General Ledger, Customer Ledger, Vendor Ledger, Stock</div>
              <div>    ├── [DocumentDisplayModule] - BKPF/BSEG Document Header & Segment display</div>
              <div>    │   ├── Financial Document (FB03 Journal entries Viewer)</div>
              <div>    │   └── Billing Document (VF03 Customer Invoice & Items Viewer)</div>
              <div>    ├── [UserMasterModule] - SU01 role allocations, statuses</div>
              <div>    └── [SettingsModule] - SPAD configuration, transaction log registers</div>
            </div>
          </div>

          {/* Section 3: Technical Mapping */}
          <div>
            <h4 className="font-bold text-[#273B5E] text-xs uppercase tracking-wide border-b border-slate-200 pb-1 mb-1.5">3. ERP DATABASE TABLE REFERENCE</h4>
            <p className="mb-2">
              Every display item in this web core directly queries from mock relational structures designed around active SAP schemas:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li><strong>BKPF</strong>: Accounting Document Header (Dates, User USNAM, Currency WAERS)</li>
              <li><strong>BSEG</strong>: Accounting Document segment (Debit/Credit indicators, Profit Center PRCTR)</li>
              <li><strong>VBRK</strong>: SD Billing document invoice header (Net Value NETWR, Tax values)</li>
              <li><strong>VBRP</strong>: SD Billing items (Quantities, Materials, Cost Center allocation)</li>
              <li><strong>KNA1</strong>: Customer General Master (Address, Country, Billing Codes)</li>
              <li><strong>LFA1</strong>: Vendor General Master (AP details, bank locations)</li>
            </ul>
          </div>

          {/* Section 4: Architecture benefits */}
          <div className="bg-amber-50 border border-amber-200 p-3 rounded text-slate-700">
            <h5 className="font-bold text-[#963F29] text-xs mb-1">PRO-GRADE FEATURES IMPLEMENTED</h5>
            <p className="text-[11px] leading-tight">
              Each G/L and billing table supports **Global Search**, **Column Freeze Lock**, **Sort Keys**, and **Calculated Cumulative Totals**. Try using search boxes to trace postings back and forth across different report suites!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#273B5E] hover:bg-slate-700 text-white text-xs px-4 py-2 rounded font-sans transition-colors"
          >
            Acknowledge Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
