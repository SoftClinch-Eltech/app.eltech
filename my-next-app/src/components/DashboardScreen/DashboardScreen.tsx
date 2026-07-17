import React from 'react';
import { Screen, User } from '../../types';
import {
  FilePieChart,
  BookOpen,
  Receipt,
  Users,
  Sliders,
  CheckCircle,
  TrendingUp,
  CreditCard,
  AlertCircle,
  Building,
  HelpCircle,
  Activity
} from 'lucide-react';


interface DashboardScreenProps {
  currentUser: User | null;
  onNavigate: (screen: Screen) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ currentUser, onNavigate }) => {
  // Tile definition with icon, subtitle, color accents
  const tiles = [
    {
      id: 'tile-fin-statements',
      title: 'Financial Statements',
      tcode: 'F.01 / FAGLB03',
      description: 'Review Balance Sheets, Profit & Loss structure, and full Trial Balance statements.',
      icon: FilePieChart,
      target: 'FIN_STATEMENTS_MAIN' as Screen,
      borderClass: 'border border-[#D9DEE6] hover:border-[#273B5E]/50'
    },
    {
      id: 'tile-ledger-reporting',
      title: 'Ledger Reporting',
      tcode: 'FBL3N / FBL5N',
      description: 'Query detailed postings for General Ledger accounts, Customers, and Suppliers.',
      icon: BookOpen,
      target: 'LEDGER_REP_MAIN' as Screen,
      borderClass: 'border-2 border-[#963F29] hover:border-[#963F29]/80'
    },
    {
      id: 'tile-document-display',
      title: 'Document Display',
      tcode: 'FB03 / VF03',
      description: 'Audit journal receipts and sales billing documents down to line segment details.',
      icon: Receipt,
      target: 'DOC_DISPLAY_MAIN' as Screen,
      borderClass: 'border-2 border-[#10B981] hover:border-[#10B981]/80'
    },
    {
      id: 'tile-user-master',
      title: 'User Master & Roles',
      tcode: 'SU01',
      description: 'Manage active operator registers, profiles, passwords, and custom ledger permissions.',
      icon: Users,
      target: 'USER_MASTER_MAIN' as Screen,
      borderClass: 'border border-[#D9DEE6] hover:border-[#273B5E]/50'
    },
    {
      id: 'tile-settings',
      title: 'System Settings',
      tcode: 'SPRO',
      description: 'Maintain corporate company configurations, audit logging registers, and ledger rules.',
      icon: Sliders,
      target: 'SETTINGS_MAIN' as Screen,
      borderClass: 'border-2 border-[#273B5E] hover:border-[#273B5E]/80'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Welcome Bar / Meta Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#D9DEE6] p-5 rounded-xl shadow-sm">
        <div>
          <h2 className="text-lg font-sans font-bold text-[#273B5E] tracking-tight">
            Softclinch Consult Services Launchpad
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, <strong className="text-slate-700">{currentUser?.fullName}</strong>. Your session is bound to client <span className="text-emerald-600 font-mono font-bold">800</span> on server <span className="text-amber-600 font-mono font-bold">S4P</span>.
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-mono">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">ERP GATEWAY</span>
            <span className="text-slate-700 font-bold mt-0.5">STATUS: CONNECTED</span>
          </div>
        </div>
      </div>


      {/* Main launch grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400">
          Corporate Financial Sub-Systems
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tiles.map((tile) => {
            const IconComponent = tile.icon;
            return (
              <div
                id={tile.id}
                key={tile.id}
                onClick={() => onNavigate(tile.target)}
                className={`bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ${tile.borderClass}`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[#273B5E]">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      T-Code: {tile.tcode}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#273B5E]">
                      {tile.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {tile.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-sans font-semibold text-[#273B5E] mt-4 pt-3 border-t border-slate-100">
                  <span>Launch Module</span>
                  <span className="text-lg leading-none">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help Note on Fiori Command bar */}
      <div className="bg-slate-50 border border-[#D9DEE6] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-slate-400 shrink-0" />
          <p>
            <strong>Consultant Command Tip:</strong> You can quickly hop directly to any screen by typing standard transaction codes (e.g. <code>fb03</code> or <code>fbl3n</code>) into the top navigation search bar and pressing <strong>Enter</strong>!
          </p>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#963F29]">
          <span>SAP-Standard compliant CLI</span>
        </div>
      </div>
    </div>
  );
};
