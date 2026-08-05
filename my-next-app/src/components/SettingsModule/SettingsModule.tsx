import React, { useState } from 'react';
import { Screen, AuditLog } from '../../types';
import { initialAuditLogs } from '../../data/sapMockData';
import { TableToolbar } from '../CommonUI/CommonUI';
import {
  Sliders,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  ListOrdered,
  FileText,
  KeyRound,
  Building,
  Activity,
  UserCheck,
  Terminal
} from 'lucide-react';

interface SettingsModuleProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  triggerToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  activeScreen,
  onNavigate,
  triggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'COMPANY' | 'THEME' | 'AUDIT'>('COMPANY');

  // Local settings states
  const [compName, setCompName] = useState('Softclinch Consult Services Pvt. Ltd.');
  const [compTaxId, setCompTaxId] = useState('27AACCT4567M1Z2');
  const [compCur, setCompCur] = useState('INR');
  const [ledgerStandard, setLedgerStandard] = useState('0L (Leading)');

  // Filter text for audit
  const [searchTerm, setSearchTerm] = useState('');

  const [auditList, setAuditList] = useState<AuditLog[]>(initialAuditLogs);

  const filteredAudits = auditList.filter((log) =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Company SPRO parameters written to client database!');
  };

  const handleClearAuditLogs = () => {
    if (confirm('Are you sure you want to flush all standard audit security histories?')) {
      setAuditList([]);
      triggerToast('Security audit records flushed.');
    }
  };


  // ============================================================================
  // RENDERING LOGIC
  // ============================================================================

  return (
    <div className="p-6 max-w-7xl mx-auto select-none">
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-sans font-bold text-[#273B5E]">SAP SPRO / System Settings</h2>
          <p className="text-xs text-slate-500 mt-1">Configure global client profiles, ledger indicators and audit security logs</p>
        </div>
        <button
          onClick={() => onNavigate('DASHBOARD')}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard Cockpit</span>
        </button>
      </div>

      {/* Main layout with Sidebar / Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        {/* Sidebar Nav */}
        <div className="bg-white border border-[#D9DEE6] rounded-xl overflow-hidden p-3 h-fit flex flex-col gap-1.5 shadow-sm">
          <button
            id="btn-settings-tab-company"
            onClick={() => setActiveTab('COMPANY')}
            className={`flex items-center gap-2.5 w-full text-left p-2.5 rounded text-xs font-sans font-semibold transition-colors ${activeTab === 'COMPANY'
                ? 'bg-[#273B5E] text-white'
                : 'hover:bg-slate-50 text-slate-600'
              }`}
          >
            <Building className="w-4 h-4" />
            <span>Company Settings</span>
          </button>
          <button
            id="btn-settings-tab-theme"
            onClick={() => setActiveTab('THEME')}
            className={`flex items-center gap-2.5 w-full text-left p-2.5 rounded text-xs font-sans font-semibold transition-colors ${activeTab === 'THEME'
                ? 'bg-[#273B5E] text-white'
                : 'hover:bg-slate-50 text-slate-600'
              }`}
          >
            <Sliders className="w-4 h-4" />
            <span>UX Theme Preferences</span>
          </button>
          <button
            id="btn-settings-tab-audit"
            onClick={() => setActiveTab('AUDIT')}
            className={`flex items-center gap-2.5 w-full text-left p-2.5 rounded text-xs font-sans font-semibold transition-colors ${activeTab === 'AUDIT'
                ? 'bg-[#273B5E] text-white'
                : 'hover:bg-slate-50 text-slate-600'
              }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Security Audit Log</span>
          </button>
        </div>

        {/* Tab Detail Pane */}
        <div className="md:col-span-3">
          {/* TAB 1: COMPANY SETTINGS */}
          {activeTab === 'COMPANY' && (
            <form onSubmit={handleSaveCompany} className="bg-white rounded-xl border border-[#D9DEE6] p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-[#273B5E] border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase">
                <Building className="w-4 h-4 text-[#963F29]" />
                <span>SPRO Corporate Global Settings</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block font-mono">Company Name</label>
                  <input
                    id="settings-form-companyname"
                    type="text"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-medium text-slate-800 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block font-mono">Tax Identification Code</label>
                  <input
                    id="settings-form-companytaxid"
                    type="text"
                    value={compTaxId}
                    onChange={(e) => setCompTaxId(e.target.value)}
                    className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block font-mono">Company Local Currency</label>
                  <select
                    id="settings-form-companycurr"
                    value={compCur}
                    onChange={(e) => setCompCur(e.target.value)}
                    className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-bold text-emerald-600 font-mono"
                  >
                    <option value="INR">INR - Indian Rupee (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block font-mono">Standard Leading Ledger</label>
                  <input
                    id="settings-form-companyledger"
                    type="text"
                    value={ledgerStandard}
                    onChange={(e) => setLedgerStandard(e.target.value)}
                    className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-semibold text-slate-800 disabled:opacity-60"
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  id="btn-settings-company-save"
                  type="submit"
                  className="px-5 py-2 bg-[#273B5E] hover:bg-[#3d5680] text-white rounded text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Commit SPRO Config</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: UX THEME PREFERENCES */}
          {activeTab === 'THEME' && (
            <div className="bg-white rounded-xl border border-[#D9DEE6] p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-sm text-[#273B5E] border-b border-slate-100 pb-2 flex items-center gap-1.5 uppercase">
                <Sliders className="w-4 h-4 text-[#963F29]" />
                <span>UX Fiori Style Palette</span>
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                The Softclinch Consult Services platform enforces strict **Enterprise High-Contrast Fiori & Dynamics 365 Guidelines** by default. To preserve brand integrity and professional aesthetics, preset palettes are standardized:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="border-2 border-[#273B5E] p-4 rounded-lg bg-slate-50 flex flex-col justify-between h-28 relative">
                  <div className="absolute right-2 top-2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[8px] font-mono px-1.5 py-0.5 rounded font-black">
                    ACTIVE
                  </div>
                  <span className="font-bold text-xs text-slate-700">Fiori Cosmic Blue</span>
                  <div className="flex gap-1.5 mt-2">
                    <span className="w-5 h-5 rounded-full bg-[#273B5E]" title="Primary Blue" />
                    <span className="w-5 h-5 rounded-full bg-[#963F29]" title="Accent Orange" />
                    <span className="w-5 h-5 rounded-full bg-[#FFFFFF]" title="Background" />
                  </div>
                </div>

                <div className="border border-[#D9DEE6] p-4 rounded-lg bg-white flex flex-col justify-between h-28 opacity-60">
                  <span className="font-bold text-xs text-slate-700">Dynamics Teal Mint</span>
                  <div className="flex gap-1.5 mt-2">
                    <span className="w-5 h-5 rounded-full bg-teal-800" />
                    <span className="w-5 h-5 rounded-full bg-emerald-500" />
                    <span className="w-5 h-5 rounded-full bg-[#FFFFFF]" />
                  </div>
                </div>

                <div className="border border-[#D9DEE6] p-4 rounded-lg bg-white flex flex-col justify-between h-28 opacity-60">
                  <span className="font-bold text-xs text-slate-700">Oracle Fusion Amber</span>
                  <div className="flex gap-1.5 mt-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-900" />
                    <span className="w-5 h-5 rounded-full bg-amber-500" />
                    <span className="w-5 h-5 rounded-full bg-slate-50" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY AUDIT LOG */}
          {activeTab === 'AUDIT' && (
            <div className="bg-white rounded-xl border border-[#D9DEE6] shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#D9DEE6] flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#963F29] animate-pulse" />
                  <div>
                    <h3 className="font-bold text-xs">SECURITY SYSTEM AUDITING</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Trace operational activities (BKPF / BSEG modifications)</p>
                  </div>
                </div>
                {auditList.length > 0 && (
                  <button
                    id="btn-settings-audit-clear"
                    onClick={handleClearAuditLogs}
                    className="self-start sm:self-auto px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded text-[11px] font-sans font-semibold transition-colors"
                  >
                    Clear Audit logs
                  </button>
                )}
              </div>

              <TableToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 border-b border-[#D9DEE6] text-slate-700">
                    <tr>
                      <th className="p-3 font-mono">Timestamp</th>
                      <th className="p-3 font-mono">Operator ID</th>
                      <th className="p-3">Username</th>
                      <th className="p-3 font-mono">Action Type</th>
                      <th className="p-3">Action Details</th>
                      <th className="p-3 font-mono text-center">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                    {filteredAudits.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                          No audit entries located. Clearer system status.
                        </td>
                      </tr>
                    ) : (
                      filteredAudits.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-medium text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                          <td className="p-3 text-slate-400 whitespace-nowrap">{log.userId}</td>
                          <td className="p-3 font-bold text-[#273B5E] font-sans whitespace-nowrap">{log.username}</td>
                          <td className="p-3 font-black text-[#963F29] whitespace-nowrap">{log.action}</td>
                          <td className="p-3 text-slate-600 font-sans">{log.details}</td>
                          <td className="p-3 text-center text-slate-400 whitespace-nowrap">{log.ipAddress}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
