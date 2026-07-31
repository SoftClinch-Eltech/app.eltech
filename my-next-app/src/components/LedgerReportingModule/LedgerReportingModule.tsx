import React, { useState, useMemo } from 'react';
import { Screen, LedgerEntry } from '../../types';
import {
  mockGLEntries,
  mockCustomerLedger,
  mockVendorLedger,
  dbKNA1,
  dbLFA1,
  dbVBRP
} from '../../data/sapMockData';
import { sampleGeneralLedgerData, GeneralLedgerItem } from '../../data/generalLedgerData';
import { API_BASE_URL } from '../../config/api';
import { TableToolbar, OutputHeaderButtonBoxes, ButtonBoxField } from '../CommonUI/CommonUI';
import {
  BookOpen,
  ArrowLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Users,
  Briefcase,
  Layers,
  Search,
  Package,
  Calendar,
  DollarSign,
  Info,
  AlertCircle,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';

interface LedgerReportingModuleProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  triggerToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const LedgerReportingModule: React.FC<LedgerReportingModuleProps> = ({
  activeScreen,
  onNavigate,
  triggerToast
}) => {
  // ============================================================================
  // LEDGER FORM STATE VARIABLES
  // ============================================================================
  const [companyCode, setCompanyCode] = useState('6000');
  const [glAccount, setGlAccount] = useState('100010');
  const [fiscalYear, setFiscalYear] = useState('2026');
  const [postingDate, setPostingDate] = useState('2026-07-01');

  // General Ledger Form Specific States
  const [fromGlAccount, setFromGlAccount] = useState('');
  const [toGlAccount, setToGlAccount] = useState('');
  const [fromDate, setFromDate] = useState('2024-04-01');
  const [toDate, setToDate] = useState('2024-04-30');
  const [glOption, setGlOption] = useState<'all_entries' | 'open_items' | 'cleared_items'>('all_entries');
  const [apiGlData, setApiGlData] = useState<GeneralLedgerItem[]>(sampleGeneralLedgerData);
  const [loadingGl, setLoadingGl] = useState(false);

  const [customerCode, setCustomerCode] = useState('0000100201');
  const [vendorCode, setVendorCode] = useState('0000200501');

  // Databases stored in React state to support dynamic additions
  const [glEntriesDb, setGlEntriesDb] = useState<Record<string, LedgerEntry[]>>(mockGLEntries);
  const [customerEntriesDb, setCustomerEntriesDb] = useState<Record<string, LedgerEntry[]>>(mockCustomerLedger);
  const [vendorEntriesDb, setVendorEntriesDb] = useState<Record<string, LedgerEntry[]>>(mockVendorLedger);

  // Fast entry input block variables (exactly 2 boxes)
  const [fastDocNum, setFastDocNum] = useState('');
  const [fastDesc, setFastDesc] = useState('');

  // Table search text
  const [searchTerm, setSearchTerm] = useState('');

  // Handler for Fetching General Ledger API / Local Data
  const handleFetchGeneralLedger = async () => {
    if (!companyCode.trim()) {
      triggerToast('Company Code is mandatory.', 'warning');
      return;
    }
    if (!toDate.trim()) {
      triggerToast('To Date is mandatory.', 'warning');
      return;
    }
    if (glOption !== 'open_items' && !fromDate.trim()) {
      triggerToast('From Date is mandatory for all/cleared entries selection.', 'warning');
      return;
    }

    setLoadingGl(true);

    try {
      const baseUrl = API_BASE_URL;
      let url = `${baseUrl}/api/ledger-reporting/general-ledger?company_code=${encodeURIComponent(companyCode.trim())}&option=${encodeURIComponent(glOption)}`;
      if (fromGlAccount.trim()) url += `&from_gl_acc_num=${encodeURIComponent(fromGlAccount.trim())}`;
      if (toGlAccount.trim()) url += `&to_gl_acc_num=${encodeURIComponent(toGlAccount.trim())}`;
      if (glOption !== 'open_items' && fromDate.trim()) url += `&from_date=${encodeURIComponent(fromDate.trim())}`;
      if (toDate.trim()) url += `&to_date=${encodeURIComponent(toDate.trim())}`;

      const token = typeof window !== 'undefined' ? localStorage.getItem('sap_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      const res = await fetch(url, { method: 'GET', headers });
      if (res.ok) {
        const json = await res.json();
        let items: GeneralLedgerItem[] = [];
        if (json.data && Array.isArray(json.data.data)) {
          items = json.data.data;
        } else if (json.data && Array.isArray(json.data)) {
          items = json.data;
        } else if (Array.isArray(json)) {
          items = json;
        }
        setApiGlData(items);
        triggerToast(`General Ledger data fetched successfully (${items.length} records).`, 'success');
      } else {
        throw new Error(`API returned HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn('Backend API connection fallback to local filtering:', err);

      // Perform fallback local shortlist filter matching user input parameters
      let filtered = sampleGeneralLedgerData.filter((item) => {
        // 1. Mandatory Company Code filter
        if (companyCode.trim() && item.cocode !== companyCode.trim()) return false;

        // 2. Optional GL Account range filter
        if (fromGlAccount.trim() && item.g_l_acct2 < fromGlAccount.trim()) return false;
        if (toGlAccount.trim() && item.g_l_acct2 > toGlAccount.trim()) return false;

        // 3. Status selection option filter (all_entries, open_items, cleared_items)
        if (glOption === 'open_items') {
          // Open items: clgentdate must be null or empty string
          if (item.clgentdate) return false;
          if (toDate.trim() && item.posting_date > toDate.trim()) return false;
        } else if (glOption === 'cleared_items') {
          // Cleared items: clgentdate must exist
          if (!item.clgentdate) return false;
          if (fromDate.trim() && item.posting_date < fromDate.trim()) return false;
          if (toDate.trim() && item.posting_date > toDate.trim()) return false;
        } else {
          // All entries
          if (fromDate.trim() && item.posting_date < fromDate.trim()) return false;
          if (toDate.trim() && item.posting_date > toDate.trim()) return false;
        }

        return true;
      });

      setApiGlData(filtered);
      triggerToast(`Loaded shortlisted General Ledger data (${filtered.length} entries).`, 'info');
    } finally {
      setLoadingGl(false);
      onNavigate('GL_LEDGER_REP');
    }
  };

  // Grouping of API / Filtered General Ledger entries by G/L account for output table
  const groupedGLData = useMemo(() => {
    const map: Record<string, GeneralLedgerItem[]> = {};
    apiGlData.forEach((item) => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const match =
          item.documentno.toLowerCase().includes(term) ||
          item.g_l_acct2.toLowerCase().includes(term) ||
          (item.assignment && item.assignment.toLowerCase().includes(term)) ||
          (item.vendor && item.vendor.toLowerCase().includes(term)) ||
          (item.customer && item.customer.toLowerCase().includes(term)) ||
          (item.reference_key && item.reference_key.toLowerCase().includes(term));
        if (!match) return;
      }

      const acct = item.g_l_acct2 || 'General Account';
      if (!map[acct]) map[acct] = [];
      map[acct].push(item);
    });
    return map;
  }, [apiGlData, searchTerm]);

  // Overall grand total amount calculation
  const grandTotalAmount = useMemo(() => {
    return apiGlData.reduce((acc, item) => acc + (item.amount_lc || 0), 0);
  }, [apiGlData]);

  // Customer Master & Ledger
  const activeCustomer = useMemo(() => {
    return dbKNA1.find(c => c.KUNNR === customerCode) || dbKNA1[0];
  }, [customerCode]);

  const customerReportEntries = useMemo(() => {
    return customerEntriesDb[customerCode] || [];
  }, [customerEntriesDb, customerCode]);

  // Vendor Master & Ledger
  const activeVendor = useMemo(() => {
    return dbLFA1.find(v => v.LIFNR === vendorCode) || dbLFA1[0];
  }, [vendorCode]);

  const vendorReportEntries = useMemo(() => {
    return vendorEntriesDb[vendorCode] || [];
  }, [vendorEntriesDb, vendorCode]);

  // Stock Material lists
  const stockItems = useMemo(() => {
    return [
      { matCode: 'MAT-FIBER-01', name: 'High Tensile Carbon Fiber Sheet', stockQty: 480, plant: 'PL-10', storageLoc: 'SL-01', uom: 'PC', val: 192000 },
      { matCode: 'MAT-EPOXY-05', name: 'Liquid Industrial Resin Catalyst', stockQty: 250, plant: 'PL-10', storageLoc: 'SL-02', uom: 'GAL', val: 149090 },
      { matCode: 'MAT-SOFTWARE-ERP', name: 'Softclinch Consult Services Core License v12', stockQty: 10, plant: 'PL-20', storageLoc: 'SL-01', uom: 'EA', val: 1250000 },
      { matCode: 'MAT-STEEL-BEAM-H', name: 'Structural Heavy Steel H-Beam', stockQty: 85, plant: 'PL-10', storageLoc: 'SL-01', uom: 'TON', val: 412400 },
    ];
  }, []);

  // Filtered lists for customer & vendor lookup
  const filteredCustomerList = customerReportEntries.filter(entry =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.documentNum.includes(searchTerm)
  );

  const filteredVendorList = vendorReportEntries.filter(entry =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.documentNum.includes(searchTerm)
  );


  // ============================================================================
  // RENDERING COMPONENTS
  // ============================================================================

  // ----------------------------------------------------------------------------
  // MODULE MAIN INDEX
  // ----------------------------------------------------------------------------
  if (activeScreen === 'LEDGER_REP_MAIN') {
    const subTiles = [
      { id: 'tile-gl', name: 'General Ledger', code: 'FBL3N', target: 'GL_LEDGER_SEL' as Screen, desc: 'Detailed line postings of standard G/L accounts' },
      { id: 'tile-cl', name: 'Customer Ledger', code: 'FBL5N', target: 'CUSTOMER_LEDGER_SEL' as Screen, desc: 'Outstanding balances and cleared payments for clients' },
      { id: 'tile-vl', name: 'Vendor Ledger', code: 'FBL1N', target: 'VENDOR_LEDGER_SEL' as Screen, desc: 'AP balances, commitments, and supplier settlement entries' },
      { id: 'tile-sk', name: 'Stock Inventory', code: 'MMB3', target: 'STOCK_REP' as Screen, desc: 'Physical materials balance, storage bins, and plant stock' },
    ];

    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-sans font-bold text-[#273B5E]">Ledger Reporting Sub-System</h2>
            <p className="text-xs text-slate-500 mt-1">Select the operational sub-ledger account book</p>
          </div>
          <button
            onClick={() => onNavigate('DASHBOARD')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Gateway Back</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {subTiles.map((tile) => (
            <div
              id={tile.id}
              key={tile.id}
              onClick={() => onNavigate(tile.target)}
              className="bg-white rounded-xl border border-[#D9DEE6] p-5 shadow-sm hover:shadow-md hover:border-[#273B5E] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="p-2 bg-slate-50 text-[#273B5E] rounded-lg">
                    <BookOpen className="w-5 h-5 text-[#963F29]" />
                  </div>
                 
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#273B5E] group-hover:text-[#963F29] transition-colors">{tile.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tile.desc}</p>
                </div>
              </div>
              <div className="text-[11px] font-semibold text-[#273B5E] pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span>Configure Selection</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // GENERAL LEDGER - SELECTION (FBL3N)
  // ----------------------------------------------------------------------------
  if (activeScreen === 'GL_LEDGER_SEL') {
    return (
      <div className="p-3 sm:p-6 max-w-2xl mx-auto select-none">
        <div className="bg-white rounded-xl border border-[#D9DEE6] shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#273B5E] text-white p-3.5 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Filter className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <h3 className="font-bold text-xs sm:text-sm tracking-tight uppercase">General Ledger Selection</h3>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 text-xs font-sans">
            {/* Optional Fields Section */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="text-[11px] font-extrabold text-[#273B5E] uppercase tracking-wider">Optional Fields</span>
                <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">Range Filter</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">From GL Account Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 10502004"
                    value={fromGlAccount}
                    onChange={(e) => setFromGlAccount(e.target.value)}
                    className="w-full bg-white border border-[#D9DEE6] rounded p-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#273B5E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">To GL Account Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 10502010"
                    value={toGlAccount}
                    onChange={(e) => setToGlAccount(e.target.value)}
                    className="w-full bg-white border border-[#D9DEE6] rounded p-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#273B5E]"
                  />
                </div>
              </div>
            </div>

            {/* Mandatory Fields Section */}
            <div className="bg-amber-50/30 border border-amber-200/80 rounded-lg p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2">
                <span className="text-[11px] font-extrabold text-[#963F29] uppercase tracking-wider">Mandatory Fields</span>
                <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-mono font-bold">Required</span>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                  Company Code <span className="text-rose-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6000"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value)}
                  className="w-full bg-white border border-[#D9DEE6] rounded p-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#273B5E]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                      From Date {glOption !== 'open_items' && <span className="text-rose-600 font-bold">*</span>}
                    </label>
                    {glOption === 'open_items' && (
                      <span className="text-[9px] text-amber-700 font-bold font-mono">Disabled</span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    disabled={glOption === 'open_items'}
                    className={`w-full border rounded p-2 text-xs font-mono transition-all ${
                      glOption === 'open_items'
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-white border-[#D9DEE6] text-slate-800 focus:outline-none focus:border-[#273B5E]'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                    To Date <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full bg-white border border-[#D9DEE6] rounded p-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#273B5E]"
                    required
                  />
                </div>
              </div>

              {/* Special Note when Open Items is selected */}
              {glOption === 'open_items' && (
                <div className="bg-amber-100/70 border border-amber-300 text-amber-900 rounded-lg p-3 text-xs flex items-start gap-2.5 animate-fade-in mt-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="leading-snug text-[11px] sm:text-xs">
                    <span className="font-bold block text-amber-950">Note on Open Items Selection:</span>
                    When <strong>Open Items</strong> is selected, <strong>From Date</strong> is disabled as open items reporting includes all uncleared postings up to the key <strong>To Date</strong>.
                  </div>
                </div>
              )}
            </div>

            {/* Selection Options (Restrict only one selection) */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Selection Type (Restrict to one selection)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <label
                  onClick={() => setGlOption('all_entries')}
                  className={`flex sm:flex-col items-center justify-between sm:justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    glOption === 'all_entries'
                      ? 'border-[#273B5E] bg-[#273B5E]/5 text-[#273B5E] font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="gl_option"
                    value="all_entries"
                    checked={glOption === 'all_entries'}
                    onChange={() => setGlOption('all_entries')}
                    className="sr-only"
                  />
                  <span className="text-xs">All entries</span>
                  <span className="text-[9px] text-slate-400 font-mono sm:mt-0.5">(all_entries)</span>
                </label>

                <label
                  onClick={() => setGlOption('open_items')}
                  className={`flex sm:flex-col items-center justify-between sm:justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    glOption === 'open_items'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="gl_option"
                    value="open_items"
                    checked={glOption === 'open_items'}
                    onChange={() => setGlOption('open_items')}
                    className="sr-only"
                  />
                  <span className="text-xs">Open Items</span>
                  <span className="text-[9px] text-slate-400 font-mono sm:mt-0.5">(open_items)</span>
                </label>

                <label
                  onClick={() => setGlOption('cleared_items')}
                  className={`flex sm:flex-col items-center justify-between sm:justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    glOption === 'cleared_items'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="gl_option"
                    value="cleared_items"
                    checked={glOption === 'cleared_items'}
                    onChange={() => setGlOption('cleared_items')}
                    className="sr-only"
                  />
                  <span className="text-xs">Cleared Items</span>
                  <span className="text-[9px] text-slate-400 font-mono sm:mt-0.5">(cleared_items)</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between border-t border-slate-200 pt-4 gap-3">
              <button
                id="btn-gl-back"
                onClick={() => onNavigate('LEDGER_REP_MAIN')}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-[#D9DEE6] rounded-lg text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors text-center"
              >
                Back
              </button>
              <button
                id="btn-gl-display"
                disabled={loadingGl}
                onClick={handleFetchGeneralLedger}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#273B5E] hover:bg-[#1f2f4b] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {loadingGl ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Fetching Data...</span>
                  </>
                ) : (
                  <>
                    <span>Display G/L Postings</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // GENERAL LEDGER - OUTPUT REPORT (FBL3N)
  // ----------------------------------------------------------------------------
  if (activeScreen === 'GL_LEDGER_REP') {
    const accountKeys = Object.keys(groupedGLData);

    return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto select-none font-sans">
        {/* Top Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-sans font-bold text-[#273B5E]">G/L Account Line Item Display</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 font-mono mt-0.5">
              Company Code: <strong>{companyCode}</strong> | Option: <strong>{glOption}</strong> | Total Records: <strong>{apiGlData.length}</strong>
            </p>
          </div>
          <button
            id="btn-gl-rep-back"
            onClick={() => onNavigate('GL_LEDGER_SEL')}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Selection Screen</span>
          </button>
        </div>

        {/* Global Toolbar Search */}
        <TableToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalRecords={apiGlData.length}
        />

        {/* Display Grouped Tables per G/L Account (matching SAP GUI FBL3N layout) */}
        {accountKeys.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#D9DEE6] p-8 text-center text-slate-400">
            No matching General Ledger records found for Company Code {companyCode}.
          </div>
        ) : (
          accountKeys.map((acctKey) => {
            const items = groupedGLData[acctKey];
            const acctSubtotal = items.reduce((acc, i) => acc + (i.amount_lc || 0), 0);

            return (
              <div key={acctKey} className="bg-white rounded-lg border border-[#D9DEE6] overflow-hidden shadow-sm space-y-0">
                {/* SAP G/L Account Header Banner */}
                <div className="bg-[#273B5E] text-white px-4 py-2.5 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold bg-[#963F29] px-2 py-0.5 rounded text-[11px]">
                      G/L Account: {acctKey}
                    </span>
                    <span className="text-slate-300 font-sans">
                      Company Code: <strong>{companyCode}</strong>
                    </span>
                  </div>
                  <span className="text-[#fef08a] font-bold">
                    Subtotal: ₹{acctSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs whitespace-nowrap font-sans">
                    <thead className="bg-slate-100 border-b border-[#D9DEE6] text-slate-800 font-bold sticky top-0">
                      <tr>
                        <th className="p-2.5 text-center min-w-[50px]">St</th>
                        <th className="p-2.5 font-mono min-w-[110px]">DocumentNo</th>
                        <th className="p-2.5 font-mono min-w-[100px]">G/L Acct</th>
                        <th className="p-2.5 font-mono text-center min-w-[70px]">CoCode</th>
                        <th className="p-2.5 font-mono min-w-[110px]">Assignment</th>
                        <th className="p-2.5 font-mono min-w-[100px]">Posting Date</th>
                        <th className="p-2.5 font-mono min-w-[100px]">Clearing Date</th>
                        <th className="p-2.5 font-mono text-center min-w-[50px]">PostKey</th>
                        <th className="p-2.5 font-mono text-center min-w-[50px]">D/C</th>
                        <th className="p-2.5 text-right font-mono min-w-[130px]">Amount (LC)</th>
                        <th className="p-2.5 text-right font-mono min-w-[120px]">Amount 1</th>
                        <th className="p-2.5 font-mono min-w-[160px]">Reference Key</th>
                        <th className="p-2.5 font-mono min-w-[100px]">Customer</th>
                        <th className="p-2.5 font-mono min-w-[100px]">Vendor</th>
                        <th className="p-2.5 font-mono min-w-[100px]">Material</th>
                        <th className="p-2.5 font-mono min-w-[90px]">Profit Ctr</th>
                        <th className="p-2.5 font-mono min-w-[90px]">Cost Ctr</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {items.map((item, idx) => {
                        const isCleared = Boolean(item.clgentdate);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            {/* 1. St (Status Indicator Dot based on clearing date) */}
                            <td className="p-2.5 text-center">
                              {isCleared ? (
                                <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 shadow-sm" title={`Cleared on ${item.clgentdate}`} />
                              ) : (
                                <span className="inline-block w-3 h-3 rounded-sm bg-rose-500 shadow-sm" title="Open Item" />
                              )}
                            </td>
                            {/* 2. DocumentNo */}
                            <td className="p-2.5 font-mono font-bold text-[#963F29]">{item.documentno}</td>
                            {/* 3. G/L Account */}
                            <td className="p-2.5 font-mono text-slate-700 font-bold">{item.g_l_acct2}</td>
                            {/* 4. Company Code */}
                            <td className="p-2.5 font-mono text-center text-slate-600">{item.cocode}</td>
                            {/* 5. Assignment */}
                            <td className="p-2.5 font-mono text-slate-600">{item.assignment || '-'}</td>
                            {/* 6. Posting Date */}
                            <td className="p-2.5 font-mono text-slate-700">{item.posting_date || '-'}</td>
                            {/* 7. Clearing Date */}
                            <td className="p-2.5 font-mono text-slate-600">
                              {isCleared ? item.clgentdate : <span className="text-amber-700 font-bold text-[10px]">Open Item</span>}
                            </td>
                            {/* 8. PK (Posting Key) */}
                            <td className="p-2.5 text-center font-mono text-slate-600">{item.postkey || '-'}</td>
                            {/* 9. D/C (Debit / Credit) */}
                            <td className="p-2.5 text-center font-mono font-semibold">{item.d_c_indic || '-'}</td>
                            {/* 10. Amount LC */}
                            <td className={`p-2.5 text-right font-mono font-bold ${item.d_c_indic === 'S' ? 'text-emerald-700' : 'text-slate-900'}`}>
                              ₹{(item.amount_lc || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            {/* 11. Amount 1 */}
                            <td className="p-2.5 text-right font-mono text-slate-700">
                              {item.amount1 !== undefined && item.amount1 !== null
                                ? `₹${item.amount1.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                : '-'}
                            </td>
                            {/* 12. Reference Key */}
                            <td className="p-2.5 font-mono text-slate-600 truncate max-w-[160px]" title={item.reference_key || ''}>
                              {item.reference_key || '-'}
                            </td>
                            {/* 13. Customer */}
                            <td className="p-2.5 font-mono text-slate-700">{item.customer || '-'}</td>
                            {/* 14. Vendor */}
                            <td className="p-2.5 font-mono text-slate-700">{item.vendor || '-'}</td>
                            {/* 15. Material */}
                            <td className="p-2.5 font-mono text-slate-700">{item.material || '-'}</td>
                            {/* 16. Profit Center */}
                            <td className="p-2.5 font-mono text-center text-slate-500">{item.profit_ctr || '-'}</td>
                            {/* 17. Cost Center */}
                            <td className="p-2.5 font-mono text-center text-slate-500">{item.cost_ctr || '-'}</td>
                          </tr>
                        );
                      })}
                      {/* SAP Subtotal row for each G/L account */}
                      <tr className="bg-[#fef9c3] font-mono font-bold text-slate-900 border-t-2 border-slate-300">
                        <td colSpan={9} className="p-2.5 text-right text-slate-800">
                          * Account {acctKey} Total:
                        </td>
                        <td className="p-2.5 text-right text-slate-900 text-sm font-black">
                          ₹{acctSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right text-slate-900 text-sm font-black">
                          ₹{items.reduce((acc, i) => acc + (i.amount1 || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td colSpan={6} />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}

        {/* Grand Total Footer Box */}
        <div className="bg-[#273B5E] text-white p-4 rounded-lg shadow-md flex items-center justify-between font-mono text-xs">
          <div>
            <span className="font-sans text-slate-300 block">TOTAL GRAND ACCUMULATED BALANCE</span>
            <span className="text-amber-400 font-bold">Shortlisted Result Count: {apiGlData.length} records</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-sans uppercase">Currency INR</span>
            <span className="text-lg font-black text-emerald-400">
              ₹{grandTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // CUSTOMER LEDGER - SELECTION (FBL5N)
  // ----------------------------------------------------------------------------
  if (activeScreen === 'CUSTOMER_LEDGER_SEL') {
    return (
      <div className="p-6 max-w-xl mx-auto select-none">
        <div className="bg-white rounded-xl border border-[#D9DEE6] shadow-md overflow-hidden">
          <div className="bg-[#273B5E] text-white p-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            <div>
              <h3 className="font-bold text-xs">CUSTOMER SUBSIDIARY SELECTION</h3>
              <p className="text-[10px] text-gray-300">Transaction FBL5N - Accounts Receivable</p>
            </div>
          </div>

          <div className="p-5 space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Select Customer Account</label>
              <select
                id="cl-sel-customer"
                value={customerCode}
                onChange={(e) => setCustomerCode(e.target.value)}
                className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-mono font-bold"
              >
                {dbKNA1.map((c) => (
                  <option key={c.KUNNR} value={c.KUNNR}>
                    {c.KUNNR} - {c.NAME1}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Company Code</label>
              <input
                type="text"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
                className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fiscal Year</label>
              <input
                type="text"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-mono font-bold"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 gap-3">
              <button
                id="btn-cl-back"
                onClick={() => onNavigate('LEDGER_REP_MAIN')}
                className="px-4 py-2 border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 font-medium"
              >
                Back
              </button>
              <button
                id="btn-cl-display"
                onClick={() => onNavigate('CUSTOMER_LEDGER_REP')}
                className="px-5 py-2 bg-[#273B5E] hover:bg-[#3d5680] text-white rounded text-xs font-semibold flex items-center gap-1"
              >
                <span>Query Customer Items</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // CUSTOMER LEDGER - OUTPUT REPORT (FBL5N)
  // ----------------------------------------------------------------------------
  if (activeScreen === 'CUSTOMER_LEDGER_REP') {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
        {/* Customer Header Details & Metadata block */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Customer master information KNA1 (1-column) */}
          <div className="bg-white border border-[#D9DEE6] p-5 rounded-xl shadow-sm flex flex-col justify-between lg:col-span-1">
            <div>
              <span className="text-[9px] uppercase tracking-wider font-mono text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
                SAP CUSTOMER (KNA1)
              </span>
              <h3 className="font-bold text-base text-[#273B5E] mt-2">{activeCustomer.NAME1}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeCustomer.STRAS}, {activeCustomer.ORT01}, {activeCustomer.PSTLZ}, {activeCustomer.LAND1}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-400 mt-4">
              Customer Code Lookup: <strong className="text-slate-600 font-bold">{activeCustomer.KUNNR}</strong>
            </div>
          </div>

          {/* OutputHeaderButtonBoxes 9-grid (2-columns) */}
          <div className="lg:col-span-2">
            {(() => {
              const custFields: ButtonBoxField[] = [
                { label: 'Cust Account', value: activeCustomer.KUNNR, highlight: true, valueClass: 'text-amber-700' },
                { label: 'Current Balance', value: `₹${(customerReportEntries.reduce((acc, e) => acc + (e.debit - e.credit), 0) * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valueClass: 'text-emerald-600 font-bold' },
                { label: 'Company Code', value: companyCode },
                { label: 'Fiscal Year', value: fiscalYear },
                { label: 'Recon Account', value: '140000 (AR General)' },
                { label: 'Country', value: 'IN' },
                { label: 'Active Records', value: `${filteredCustomerList.length} Rows`, valueClass: 'text-[#273B5E]' },
                { label: 'Currency', value: 'INR', valueClass: 'text-emerald-600' },
                { label: 'SAP Client', value: '800', badge: 'SYS: S4P' }
              ];
              return (
                <OutputHeaderButtonBoxes
                  fields={custFields}
                  title="CUSTOMER BALANCES TRANSACTION CONTEXT"
                  tcode="FBL5N"
                />
              );
            })()}
          </div>
        </div>

        {/* SAP Customer Clearing Entry Block (exactly 2 inputs with button) */}
        <div className="bg-[#D97706]/5 border-2 border-[#D97706]/30 border-l-8 border-l-amber-600 rounded-xl p-6 flex flex-col md:flex-row items-end gap-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex-grow space-y-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="bg-amber-700 text-white px-2.5 py-1 rounded text-xs font-mono tracking-wider font-extrabold uppercase">SAP Table BSID</span>
              <span className="text-xs uppercase font-black text-amber-700 font-mono tracking-wide">Customer AR Entry Fast Block</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-slate-800 tracking-wide block uppercase">1. Enter Document Number</label>
                <input
                  type="text"
                  placeholder="e.g. 100000305"
                  value={fastDocNum}
                  onChange={(e) => setFastDocNum(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-3 text-sm sm:text-base md:text-lg font-mono font-black text-amber-700 focus:outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-600/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-slate-800 tracking-wide block uppercase">2. Enter Activity Description</label>
                <input
                  type="text"
                  placeholder="e.g. Customer clearing invoice payment"
                  value={fastDesc}
                  onChange={(e) => setFastDesc(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-3 text-sm sm:text-base md:text-lg font-black text-slate-800 focus:outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-600/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (!fastDocNum.trim() || !fastDesc.trim()) {
                triggerToast('Please fill in both inputs: Document Number and Description.');
                return;
              }
              const currentEntries = customerEntriesDb[customerCode] || [];
              if (currentEntries.some(e => e.documentNum === fastDocNum.trim())) {
                triggerToast(`Document ${fastDocNum} already exists for this customer!`, 'warning');
                return;
              }
              const lastBalance = currentEntries.length > 0 ? currentEntries[currentEntries.length - 1].balance : 0;
              const newEntry: LedgerEntry = {
                postingDate: new Date().toISOString().split('T')[0],
                documentNum: fastDocNum.trim(),
                reference: 'CUST-CLEAR',
                description: fastDesc.trim(),
                debit: 5000,
                credit: 0,
                balance: lastBalance + 5000
              };
              setCustomerEntriesDb(prev => ({
                ...prev,
                [customerCode]: [...currentEntries, newEntry]
              }));
              setFastDocNum('');
              setFastDesc('');
              triggerToast(`Successfully posted custom Customer Ledger line item document ${newEntry.documentNum}.`);
            }}
            className="w-full md:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shrink-0 shadow-md hover:translate-y-[-1px] active:translate-y-[0px]"
          >
            <span>+ Add Clearing Item</span>
          </button>
        </div>

        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h4 className="font-sans font-bold text-sm text-[#273B5E]">Postings & Open Accounts Receivable</h4>
          <button
            id="btn-cl-rep-back"
            onClick={() => onNavigate('CUSTOMER_LEDGER_SEL')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Selection</span>
          </button>
        </div>

        {/* Customer items table */}
        <div className="bg-white rounded-lg border border-[#D9DEE6] overflow-hidden shadow-sm">
          <TableToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalRecords={filteredCustomerList.length}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 border-b border-[#D9DEE6] text-slate-700">
                <tr>
                  <th className="p-3">Posting Date</th>
                  <th className="p-3 font-mono">Doc Number</th>
                  <th className="p-3 font-mono">Reference</th>
                  <th className="p-3 font-mono text-center">CoCode</th>
                  <th className="p-3 font-mono text-center">Year</th>
                  <th className="p-3">Activity Description</th>
                  <th className="p-3 text-right font-mono">Debited Amount</th>
                  <th className="p-3 text-right font-mono">Credited Payment</th>
                  <th className="p-3 text-right font-mono">Running AR Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCustomerList.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3">{entry.postingDate}</td>
                    <td className="p-3 font-mono font-bold text-[#963F29]">{entry.documentNum}</td>
                    <td className="p-3 font-mono">{entry.reference}</td>
                    <td className="p-3 font-mono text-center text-slate-500 font-medium">{companyCode}</td>
                    <td className="p-3 font-mono text-center text-slate-500 font-medium">{fiscalYear}</td>
                    <td className="p-3 font-medium">{entry.description}</td>
                    <td className="p-3 text-right text-emerald-600 font-mono font-semibold">
                      {entry.debit > 0 ? `₹${(entry.debit * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="p-3 text-right text-rose-600 font-mono font-semibold">
                      {entry.credit > 0 ? `₹${(entry.credit * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      ₹{(entry.balance * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // VENDOR LEDGER - SELECTION (FBL1N)
  // ----------------------------------------------------------------------------
  if (activeScreen === 'VENDOR_LEDGER_SEL') {
    return (
      <div className="p-6 max-w-xl mx-auto select-none">
        <div className="bg-white rounded-xl border border-[#D9DEE6] shadow-md overflow-hidden">
          <div className="bg-[#273B5E] text-white p-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500 animate-pulse" />
            <div>
              <h3 className="font-bold text-xs">VENDOR SUBSIDIARY SELECTION</h3>
              <p className="text-[10px] text-gray-300">Transaction FBL1N - Accounts Payable</p>
            </div>
          </div>

          <div className="p-5 space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Select Vendor Account</label>
              <select
                id="vl-sel-vendor"
                value={vendorCode}
                onChange={(e) => setVendorCode(e.target.value)}
                className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-mono font-bold"
              >
                {dbLFA1.map((v) => (
                  <option key={v.LIFNR} value={v.LIFNR}>
                    {v.LIFNR} - {v.NAME1}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Company Code</label>
              <input
                type="text"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
                className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fiscal Year</label>
              <input
                type="text"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-mono font-bold"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 gap-3">
              <button
                id="btn-vl-back"
                onClick={() => onNavigate('LEDGER_REP_MAIN')}
                className="px-4 py-2 border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 font-medium"
              >
                Back
              </button>
              <button
                id="btn-vl-display"
                onClick={() => onNavigate('VENDOR_LEDGER_REP')}
                className="px-5 py-2 bg-[#273B5E] hover:bg-[#3d5680] text-white rounded text-xs font-semibold flex items-center gap-1"
              >
                <span>Query Vendor Items</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // VENDOR LEDGER - OUTPUT REPORT (FBL1N)
  // ----------------------------------------------------------------------------
  if (activeScreen === 'VENDOR_LEDGER_REP') {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
        {/* Vendor Header Details & Metadata block */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Vendor master information LFA1 (1-column) */}
          <div className="bg-white border border-[#D9DEE6] p-5 rounded-xl shadow-sm flex flex-col justify-between lg:col-span-1">
            <div>
              <span className="text-[9px] uppercase tracking-wider font-mono text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
                SAP VENDOR (LFA1)
              </span>
              <h3 className="font-bold text-base text-[#273B5E] mt-2">{activeVendor.NAME1}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeVendor.STRAS}, {activeVendor.ORT01}, {activeVendor.PSTLZ}, {activeVendor.LAND1}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-400 mt-4">
              Vendor Code Lookup: <strong className="text-slate-600 font-bold">{activeVendor.LIFNR}</strong>
            </div>
          </div>

          {/* OutputHeaderButtonBoxes 9-grid (2-columns) */}
          <div className="lg:col-span-2">
            {(() => {
              const vendFields: ButtonBoxField[] = [
                { label: 'Vendor Account', value: activeVendor.LIFNR, highlight: true, valueClass: 'text-[#963F29]' },
                { label: 'Current Balance', value: `₹${(vendorReportEntries.reduce((acc, e) => acc + (e.credit - e.debit), 0) * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valueClass: 'text-rose-600 font-bold' },
                { label: 'Company Code', value: companyCode },
                { label: 'Fiscal Year', value: fiscalYear },
                { label: 'Recon Account', value: '210000 (AP General)' },
                { label: 'Country', value: 'IN' },
                { label: 'Active Records', value: `${filteredVendorList.length} Rows`, valueClass: 'text-[#273B5E]' },
                { label: 'Currency', value: 'INR', valueClass: 'text-emerald-600' },
                { label: 'SAP Client', value: '800', badge: 'SYS: S4P' }
              ];
              return (
                <OutputHeaderButtonBoxes
                  fields={vendFields}
                  title="VENDOR BALANCES TRANSACTION CONTEXT"
                  tcode="FBL1N"
                />
              );
            })()}
          </div>
        </div>

        {/* SAP Vendor Liability Entry Block (exactly 2 inputs with button) */}
        <div className="bg-[#963F29]/5 border-2 border-[#963F29]/30 border-l-8 border-l-[#963F29] rounded-xl p-6 flex flex-col md:flex-row items-end gap-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex-grow space-y-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="bg-[#963F29] text-white px-2.5 py-1 rounded text-xs font-mono tracking-wider font-extrabold uppercase">SAP Table BSIK</span>
              <span className="text-xs uppercase font-black text-[#963F29] font-mono tracking-wide">Vendor AP Entry Fast Block</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-slate-800 tracking-wide block uppercase">1. Enter Document Number</label>
                <input
                  type="text"
                  placeholder="e.g. 100000411"
                  value={fastDocNum}
                  onChange={(e) => setFastDocNum(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-3 text-sm sm:text-base md:text-lg font-mono font-black text-[#963F29] focus:outline-none focus:border-[#963F29] focus:ring-4 focus:ring-[#963F29]/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-slate-800 tracking-wide block uppercase">2. Enter Transaction Description</label>
                <input
                  type="text"
                  placeholder="e.g. Raw steel delivery batch A"
                  value={fastDesc}
                  onChange={(e) => setFastDesc(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-3 text-sm sm:text-base md:text-lg font-black text-slate-800 focus:outline-none focus:border-[#963F29] focus:ring-4 focus:ring-[#963F29]/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (!fastDocNum.trim() || !fastDesc.trim()) {
                triggerToast('Please fill in both inputs: Document Number and Description.');
                return;
              }
              const currentEntries = vendorEntriesDb[vendorCode] || [];
              if (currentEntries.some(e => e.documentNum === fastDocNum.trim())) {
                triggerToast(`Document ${fastDocNum} already exists for this vendor!`, 'warning');
                return;
              }
              const lastBalance = currentEntries.length > 0 ? currentEntries[currentEntries.length - 1].balance : 0;
              const newEntry: LedgerEntry = {
                postingDate: new Date().toISOString().split('T')[0],
                documentNum: fastDocNum.trim(),
                reference: 'VEND-LIAB',
                description: fastDesc.trim(),
                debit: 0,
                credit: 6000,
                balance: lastBalance - 6000
              };
              setVendorEntriesDb(prev => ({
                ...prev,
                [vendorCode]: [...currentEntries, newEntry]
              }));
              setFastDocNum('');
              setFastDesc('');
              triggerToast(`Successfully posted custom Vendor Ledger line item document ${newEntry.documentNum}.`);
            }}
            className="w-full md:w-auto px-8 py-4 bg-[#963F29] hover:bg-[#83331e] active:bg-[#682716] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shrink-0 shadow-md hover:translate-y-[-1px] active:translate-y-[0px]"
          >
            <span>+ Add Liability Item</span>
          </button>
        </div>

        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h4 className="font-sans font-bold text-sm text-[#273B5E]">Postings & Open Accounts Payable</h4>
          <button
            id="btn-vl-rep-back"
            onClick={() => onNavigate('VENDOR_LEDGER_SEL')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Selection</span>
          </button>
        </div>

        {/* Vendor items table */}
        <div className="bg-white rounded-lg border border-[#D9DEE6] overflow-hidden shadow-sm">
          <TableToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalRecords={filteredVendorList.length}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 border-b border-[#D9DEE6] text-slate-700">
                <tr>
                  <th className="p-3">Posting Date</th>
                  <th className="p-3 font-mono">Doc Number</th>
                  <th className="p-3 font-mono">Reference</th>
                  <th className="p-3 font-mono text-center">CoCode</th>
                  <th className="p-3 font-mono text-center">Year</th>
                  <th className="p-3">Transaction Description</th>
                  <th className="p-3 text-right font-mono">Debited Settlement</th>
                  <th className="p-3 text-right font-mono">Credited Invoice</th>
                  <th className="p-3 text-right font-mono">Outstanding Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredVendorList.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3">{entry.postingDate}</td>
                    <td className="p-3 font-mono font-bold text-[#963F29]">{entry.documentNum}</td>
                    <td className="p-3 font-mono">{entry.reference}</td>
                    <td className="p-3 font-mono text-center text-slate-500 font-medium">{companyCode}</td>
                    <td className="p-3 font-mono text-center text-slate-500 font-medium">{fiscalYear}</td>
                    <td className="p-3 font-medium text-slate-800">{entry.description}</td>
                    <td className="p-3 text-right text-emerald-600 font-mono font-semibold">
                      {entry.debit > 0 ? `₹${(entry.debit * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="p-3 text-right text-rose-600 font-mono font-semibold">
                      {entry.credit > 0 ? `₹${(entry.credit * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      ₹{(Math.abs(entry.balance) * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // STOCK - OUTPUT SCREEN
  // ----------------------------------------------------------------------------
  if (activeScreen === 'STOCK_REP') {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-sans font-bold text-[#273B5E]">Physical Materials Stock Display (MMB3)</h2>
            <p className="text-xs text-slate-500 mt-1">Real-time inventory plant and storage location check</p>
          </div>
          <button
            id="btn-stock-back"
            onClick={() => onNavigate('LEDGER_REP_MAIN')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ledger Reporting Menu</span>
          </button>
        </div>

        {/* Unified Button Box Metadata Grid */}
        {(() => {
          const stockFields: ButtonBoxField[] = [
            { label: 'Plant Code', value: 'PL-10 / PL-20', highlight: true, valueClass: 'text-[#273B5E]' },
            { label: 'Total Stock Valuation', value: `₹${(stockItems.reduce((acc, i) => acc + i.val, 0) * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valueClass: 'text-emerald-600 font-bold' },
            { label: 'Company Code', value: companyCode || '1900' },
            { label: 'Fiscal Year', value: fiscalYear || '2026' },
            { label: 'SKU Varieties', value: `${stockItems.length} active SKUs` },
            { label: 'Storage Locations', value: 'SL-01, SL-02' },
            { label: 'Valuation Class', value: '3000 Raw Materials', badge: 'SAP CLASS' },
            { label: 'Base Currency', value: 'INR', valueClass: 'text-emerald-600' },
            { label: 'SAP Client', value: '800', badge: 'SYS: S4P' }
          ];
          return (
            <OutputHeaderButtonBoxes
              fields={stockFields}
              title="INVENTORY STOCK LEVEL SUMMARY"
              tcode="MMB3"
            />
          );
        })()}

        {/* Stock Items Table */}
        <div className="bg-white rounded-lg border border-[#D9DEE6] overflow-hidden shadow-sm">
          <TableToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalRecords={stockItems.length}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 border-b border-[#D9DEE6] text-slate-700">
                <tr>
                  <th className="p-3 font-mono">Material Number</th>
                  <th className="p-3">Material Description</th>
                  <th className="p-3 font-mono text-center">CoCode</th>
                  <th className="p-3 font-mono text-center">Year</th>
                  <th className="p-3 font-mono">Plant</th>
                  <th className="p-3 font-mono">Storage Loc</th>
                  <th className="p-3 text-right font-mono">On-Hand Quantity</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3 text-right font-mono">Simulated Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stockItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-[#273B5E]">{item.matCode}</td>
                    <td className="p-3 font-medium text-slate-800">{item.name}</td>
                    <td className="p-3 font-mono text-center text-slate-500 font-medium">{companyCode || '1900'}</td>
                    <td className="p-3 font-mono text-center text-slate-500 font-medium">{fiscalYear || '2026'}</td>
                    <td className="p-3 font-mono font-semibold">{item.plant}</td>
                    <td className="p-3 font-mono text-slate-500">{item.storageLoc}</td>
                    <td className="p-3 text-right font-mono font-bold text-[#963F29]">
                      {item.stockQty.toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-slate-400 font-sans">{item.uom}</td>
                    <td className="p-3 text-right font-mono text-slate-900 font-semibold">
                      ₹{(item.val * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
