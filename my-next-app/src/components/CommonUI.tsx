import React, { useState, useEffect } from 'react';
import { Screen, User } from '../types';
import {
  Search,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
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
  Archive
} from 'lucide-react';

// ============================================================================
// SYSTEM TOAST NOTIFICATION HELPERS
// ============================================================================
export interface Toast {
  message: string;
  type: 'success' | 'info' | 'warning';
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
// APP HEADER COMPONENT
// ============================================================================
interface AppHeaderProps {
  currentUser: User | null;
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  onShowHelp: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  activeScreen,
  onNavigate,
  onLogout,
  onShowHelp
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
    <header className="bg-[#273B5E] text-white border-b border-slate-700 select-none shadow-sm h-14 sticky top-0 z-50 flex items-center justify-between px-4">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => currentUser && onNavigate('DASHBOARD')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 active:scale-95 transition-transform"
        >
          <div className="bg-[#963F29] text-white p-1.5 rounded font-mono font-black tracking-tighter text-sm flex items-center justify-center shadow-inner">
            SC
          </div>
          <div className="flex flex-col">
            <h1 className="font-sans font-bold tracking-tight text-sm leading-tight">Softclinch Consult</h1>
            <span className="text-[9px] uppercase tracking-wider font-mono text-amber-500 leading-none">Services</span>
          </div>
        </div>


      </div>

      {/* Global Command Search bar */}
      <div className="hidden lg:flex items-center bg-slate-800/80 border border-slate-700 rounded-md max-w-sm w-80 px-2.5 py-1 text-xs gap-2">
        <Search className="w-3.5 h-3.5 text-slate-400" />
        <input
          id="hdr-command-input"
          type="text"
          placeholder="Enter Transaction Code (e.g. /nFB03, /nVF03)..."
          className="bg-transparent text-slate-200 outline-none w-full text-xs font-mono"
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
        <span className="bg-slate-700 text-slate-400 px-1 py-0.5 rounded text-[8px] font-mono">Enter</span>
      </div>

      {/* Utility Area */}
      <div className="flex items-center gap-4">




        {/* User profile dropdown info */}
        {currentUser && (
          <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-semibold leading-tight text-white">{currentUser.fullName}</span>
              <span className="text-[9px] text-[#963F29] font-mono uppercase font-bold">{currentUser.role}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-[#273B5E] border border-amber-500 flex items-center justify-center text-white text-xs font-mono font-bold shadow-sm">
              {currentUser.username === 'softclinch_arch' ? 'SC' : currentUser.username.substring(0, 2).toUpperCase()}
            </div>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-400 p-1 hover:bg-slate-850 rounded transition-all ml-1"
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
      { label: 'Customer Ledger (Coming Soon)', screen: 'CUSTOMER_LEDGER_SEL' as Screen, icon: FileSpreadsheet, disabled: true },
      { label: 'Vendor Ledger (Coming Soon)', screen: 'VENDOR_LEDGER_SEL' as Screen, icon: FileSpreadsheet, disabled: true },
      { label: 'Stock Ledger (Coming Soon)', screen: null, icon: FileSpreadsheet, disabled: true },
    ]
  },
  {
    title: 'Document Display',
    items: [
      { label: 'Financial Document', screen: 'FIN_DOC_SEL' as Screen, icon: Receipt },
      { label: 'Invoice', screen: 'INVOICE_SEL' as Screen, icon: Receipt },
      { label: 'Purchase Order (Coming Soon)', screen: 'PO_REP' as Screen, icon: Receipt, disabled: true },
    ]
  },
  {
    title: 'User Management',
    items: [
      { label: 'User Master', screen: 'USER_MASTER_MAIN' as Screen, icon: Users },
      { label: 'Create User', screen: 'USER_MASTER_MAIN' as Screen, icon: ShieldCheck },
      { label: 'Edit User', screen: 'USER_MASTER_MAIN' as Screen, icon: ShieldCheck },
      { label: 'User Roles', screen: 'USER_MASTER_MAIN' as Screen, icon: ShieldCheck },
      { label: 'Permissions', screen: 'USER_MASTER_MAIN' as Screen, icon: ShieldCheck },
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
  const isActive = (screen: Screen | null) => {
    if (!screen) return false;
    if (screen === activeScreen) return true;
    if (screen === 'USER_MASTER_MAIN' && activeScreen.startsWith('USER_MASTER')) return true;
    if (screen === 'SETTINGS_MAIN' && activeScreen.startsWith('SETTINGS')) return true;
    if (screen === 'FIN_STATEMENTS_MAIN' && activeScreen.startsWith('FIN_STATEMENTS')) return true;
    return false;
  };

  return (
    <aside className={`border-r border-slate-200 bg-[#F4F6F9] text-slate-700 h-[calc(100vh-3.5rem)] sticky top-[3.5rem] flex flex-col overflow-hidden transition-all z-30 ${collapsed ? 'w-20' : 'w-72'}`}>
      <div className={`px-4 py-4 border-b border-slate-200 ${collapsed ? 'text-center' : ''}`}>
        <div className={`flex ${collapsed ? 'flex-col items-center gap-3' : 'items-center gap-3'}`}>
          <div className="w-11 h-11 rounded-2xl bg-[#273B5E] text-white flex items-center justify-center font-mono font-black text-sm shadow-sm">SC</div>
          {!collapsed && (
            <div className="text-left">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">Softclinch</p>
              <h1 className="text-sm font-bold text-[#273B5E]">Consult Services</h1>
            </div>
          )}
          <button
            onClick={onToggle}
            className="ml-auto rounded-full bg-slate-200 p-2 text-slate-600 hover:bg-[#EBF4FF] hover:text-[#1B4B83] transition-colors"
            title={collapsed ? 'Open sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        {!collapsed && (
          <div className="mt-4 bg-white border border-slate-200 rounded-xl p-3 text-[11px]">
            <p className="text-slate-500 uppercase tracking-[0.2em] font-semibold">Active Client</p>
            <p className="mt-1 font-mono text-slate-800">
              {currentUser ? currentUser.username : 'CLNT 800'}
            </p>
          </div>
        )}
      </div>

      <div className={`p-4 ${collapsed ? 'space-y-3' : 'space-y-6'}`}>
        {navSections.map((section) => {
          const isSectionDisabled = section.title !== 'Document Display' && section.title !== 'Ledger Reporting';
          return (
            <div key={section.title} className={isSectionDisabled ? 'opacity-40 blur-[0.5px] pointer-events-none select-none' : ''}>
              {!collapsed && (
                <div className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-semibold mb-3">{section.title}</div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.screen || null);
                  const disabled = item.disabled || isSectionDisabled;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        if (disabled) return;
                        if (item.screen) onNavigate(item.screen);
                      }}
                      className={`w-full text-left rounded-lg px-3 py-2 flex items-center gap-3 text-sm transition-all duration-150 group ${disabled ? 'cursor-not-allowed opacity-50 blur-[0.5px]' : 'hover:bg-[#EBF4FF] hover:text-[#1B4B83] hover:translate-x-1'} ${active ? 'bg-[#E0EDFF] text-[#1B4B83] font-bold border-l-4 border-[#273B5E] shadow-xs' : 'text-slate-700'}`}
                      title={disabled ? 'Disabled' : item.label}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-[#1B4B83]' : 'text-slate-500 group-hover:text-[#1B4B83]'}`} />
                      {!collapsed && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-5 border-t border-slate-200">
        <div className={`flex items-center gap-3 text-[11px] font-sans text-slate-500 ${collapsed ? 'flex-col items-center' : ''}`}>
          {!collapsed && (
            <div>
              <p className="font-semibold text-slate-800">Operator</p>
              <p className="text-slate-500">Navigate modules & audit logs</p>
            </div>
          )}
          <button
            onClick={onLogout}
            className="text-slate-500 hover:text-rose-500 transition-colors"
            title="Logout from Financial Reporting Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
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
  gridColsClass?: string;
}

export const OutputHeaderButtonBoxes: React.FC<OutputHeaderButtonBoxesProps> = ({ fields, title, tcode, className, gridColsClass }) => {
  const defaultGridCols = fields.length === 5
    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5'
    : fields.length === 7
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

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
      <div className={`grid gap-2.5 ${gridColsClass || defaultGridCols}`}>
        {fields.map((field, idx) => {
          const Icon = field.icon;
          return (
            <div
              key={idx}
              className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border bg-[#F8FAFC] transition-all hover:bg-slate-50 hover:border-slate-300 min-w-0 overflow-hidden ${field.highlight
                ? 'border-amber-200 bg-amber-50/40'
                : 'border-[#D9DEE6]'
                }`}
            >
              <div className="flex flex-col gap-0.5 min-w-0 shrink-0">
                <div className="flex items-center gap-1 min-w-0">
                  {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider font-sans leading-tight truncate" title={field.label}>
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
              <div className={`flex-1 min-w-0 text-center bg-white border border-[#D9DEE6] px-2 py-1.5 rounded-md shadow-sm font-mono text-xs font-bold text-slate-800 hover:shadow-md hover:border-[#273B5E] transition-all truncate select-text cursor-default ${field.valueClass || ''}`} title={String(field.value)}>
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
