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
import { sampleCustomerLedgerData, CustomerLedgerItem } from '../../data/customerLedgerData';
import { API_BASE_URL } from '../../config/api';
import { TableToolbar, OutputHeaderButtonBoxes, ButtonBoxField, ColumnFilterBar, ColumnOption, ColumnFilterState } from '../CommonUI/CommonUI';
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

  // Customer Ledger Form Specific States
  const [fromCustNum, setFromCustNum] = useState('');
  const [toCustNum, setToCustNum] = useState('');
  const [custFromDate, setCustFromDate] = useState('2024-04-01');
  const [custToDate, setCustToDate] = useState('2024-04-30');
  const [custOption, setCustOption] = useState<'all_entries' | 'open_items' | 'cleared_items'>('all_entries');
  const [apiCustData, setApiCustData] = useState<CustomerLedgerItem[]>(sampleCustomerLedgerData);
  const [loadingCust, setLoadingCust] = useState(false);

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

  // 3 Key-Value Column Filters state
  const [columnFilters, setColumnFilters] = useState<ColumnFilterState[]>([
    { columnKey: '', value: '' },
    { columnKey: '', value: '' },
    { columnKey: '', value: '' }
  ]);

  const handleColumnFilterChange = (index: number, columnKey: string, value: string) => {
    setColumnFilters(prev => {
      const next = [...prev];
      next[index] = { columnKey, value };
      return next;
    });
  };

  const handleClearColumnFilters = () => {
    setColumnFilters([
      { columnKey: '', value: '' },
      { columnKey: '', value: '' },
      { columnKey: '', value: '' }
    ]);
  };

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
          (item.gl_description && item.gl_description.toLowerCase().includes(term)) ||
          (item.assignment && item.assignment.toLowerCase().includes(term)) ||
          (item.vendor && item.vendor.toLowerCase().includes(term)) ||
          (item.customer && item.customer.toLowerCase().includes(term)) ||
          (item.reference_key && item.reference_key.toLowerCase().includes(term));
        if (!match) return;
      }

      // Dynamic 3 Key-Value Column Filters
      for (const filter of columnFilters) {
        if (filter.columnKey && filter.value.trim()) {
          const filterVal = filter.value.trim().toLowerCase();
          const itemVal = String((item as any)[filter.columnKey] ?? '').toLowerCase();
          if (!itemVal.includes(filterVal)) {
            return;
          }
        }
      }

      const acct = item.g_l_acct2 || 'General Account';
      if (!map[acct]) map[acct] = [];
      map[acct].push(item);
    });
    return map;
  }, [apiGlData, searchTerm, columnFilters]);

  // Overall grand total amount calculation
  const grandTotalAmount = useMemo(() => {
    return apiGlData.reduce((acc, item) => acc + (item.amount_lc || 0), 0);
  }, [apiGlData]);

  // Handler for Fetching Customer Ledger API / Local Data
  const handleFetchCustomerLedger = async () => {
    if (!companyCode.trim()) {
      triggerToast('Company Code is mandatory.', 'warning');
      return;
    }
    if (!custToDate.trim()) {
      triggerToast('To Date is mandatory.', 'warning');
      return;
    }
    if (custOption !== 'open_items' && !custFromDate.trim()) {
      triggerToast('From Date is mandatory for all/cleared entries selection.', 'warning');
      return;
    }

    setLoadingCust(true);

    try {
      const baseUrl = API_BASE_URL;
      let url = `${baseUrl}/api/ledger-reporting/customer-ledger?company_code=${encodeURIComponent(companyCode.trim())}&option=${encodeURIComponent(custOption)}`;
      if (fromCustNum.trim()) url += `&from_cust_num=${encodeURIComponent(fromCustNum.trim())}`;
      if (toCustNum.trim()) url += `&to_cust_num=${encodeURIComponent(toCustNum.trim())}`;
      if (custOption !== 'open_items' && custFromDate.trim()) url += `&from_date=${encodeURIComponent(custFromDate.trim())}`;
      if (custToDate.trim()) url += `&to_date=${encodeURIComponent(custToDate.trim())}`;

      const token = typeof window !== 'undefined' ? localStorage.getItem('sap_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      const res = await fetch(url, { method: 'GET', headers });
      if (res.ok) {
        const json = await res.json();
        let items: CustomerLedgerItem[] = [];
        if (json.data && Array.isArray(json.data.data)) {
          items = json.data.data;
        } else if (json.data && Array.isArray(json.data)) {
          items = json.data;
        } else if (Array.isArray(json)) {
          items = json;
        }
        setApiCustData(items);
        triggerToast(`Customer Ledger data fetched successfully (${items.length} records).`, 'success');
      } else {
        throw new Error(`API returned HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn('Backend API connection fallback to local filtering:', err);

      const isNumFrom = Boolean(fromCustNum.trim()) && !isNaN(Number(fromCustNum));
      const isNumTo = Boolean(toCustNum.trim()) && !isNaN(Number(toCustNum));

      let filtered = sampleCustomerLedgerData.filter((item) => {
        if (companyCode.trim() && item.cocode !== companyCode.trim()) return false;

        if (fromCustNum.trim()) {
          const isNumCust = Boolean(item.customer) && !isNaN(Number(item.customer));
          if (isNumFrom && isNumCust) {
            if (Number(item.customer) < Number(fromCustNum)) return false;
          } else if (item.customer < fromCustNum.trim()) {
            return false;
          }
        }

        if (toCustNum.trim()) {
          const isNumCust = Boolean(item.customer) && !isNaN(Number(item.customer));
          if (isNumTo && isNumCust) {
            if (Number(item.customer) > Number(toCustNum)) return false;
          } else if (item.customer > toCustNum.trim()) {
            return false;
          }
        }

        if (custOption === 'open_items') {
          if (item.clgentdate) return false;
          if (custToDate.trim() && item.posting_date > custToDate.trim()) return false;
        } else if (custOption === 'cleared_items') {
          if (!item.clgentdate) return false;
          if (custFromDate.trim() && item.posting_date < custFromDate.trim()) return false;
          if (custToDate.trim() && item.posting_date > custToDate.trim()) return false;
        } else {
          if (custFromDate.trim() && item.posting_date < custFromDate.trim()) return false;
          if (custToDate.trim() && item.posting_date > custToDate.trim()) return false;
        }

        return true;
      });

      setApiCustData(filtered);
      triggerToast(`Loaded shortlisted Customer Ledger data (${filtered.length} entries).`, 'info');
    } finally {
      setLoadingCust(false);
      onNavigate('CUSTOMER_LEDGER_REP');
    }
  };

  // Grouping of API / Filtered Customer Ledger entries by customer for output table
  const groupedCustData = useMemo(() => {
    const map: Record<string, CustomerLedgerItem[]> = {};
    apiCustData.forEach((item) => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const match =
          item.documentno.toLowerCase().includes(term) ||
          item.customer.toLowerCase().includes(term) ||
          item.g_l_acct2.toLowerCase().includes(term) ||
          (item.assignment && item.assignment.toLowerCase().includes(term)) ||
          (item.reference_key && item.reference_key.toLowerCase().includes(term)) ||
          (item.customer_name && item.customer_name.toLowerCase().includes(term));
        if (!match) return;
      }

      // Dynamic 3 Key-Value Column Filters
      for (const filter of columnFilters) {
        if (filter.columnKey && filter.value.trim()) {
          const filterVal = filter.value.trim().toLowerCase();
          const itemVal = String((item as any)[filter.columnKey] ?? '').toLowerCase();
          if (!itemVal.includes(filterVal)) {
            return;
          }
        }
      }

      const custKey = item.customer || 'Unassigned Customer';
      if (!map[custKey]) map[custKey] = [];
      map[custKey].push(item);
    });
    return map;
  }, [apiCustData, searchTerm, columnFilters]);

  // Overall grand total amount calculation for Customer Ledger
  const grandTotalCustAmount = useMemo(() => {
    return apiCustData.reduce((acc, item) => acc + (item.amount_lc || 0), 0);
  }, [apiCustData]);

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
      <div className="p-2 sm:p-3 max-w-xl mx-auto select-none">
        <div className="bg-white rounded-xl border border-[#D9DEE6] shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-[#273B5E] text-white px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-300 shrink-0" />
              <div>
                <h3 className="font-bold text-xs sm:text-sm tracking-tight uppercase">General Ledger Selection</h3>
              </div>
            </div>
            <button
              onClick={() => onNavigate('LEDGER_REP_MAIN')}
              className="text-slate-300 hover:text-white text-xs font-semibold px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              Back
            </button>
          </div>

          <div className="p-3 sm:p-3.5 space-y-2.5 text-xs font-sans">
            {/* Optional Fields Section */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2 space-y-1.5">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
                <span className="text-[10px] font-extrabold text-[#273B5E] uppercase tracking-wider">Optional Fields</span>
                <span className="text-[8px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-mono">Range Filter</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wider block">From GL Account Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 10502004"
                    value={fromGlAccount}
                    onChange={(e) => setFromGlAccount(e.target.value)}
                    className="w-full bg-white border border-[#D9DEE6] rounded px-2 py-1 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#273B5E]"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wider block">To GL Account Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 10502010"
                    value={toGlAccount}
                    onChange={(e) => setToGlAccount(e.target.value)}
                    className="w-full bg-white border border-[#D9DEE6] rounded px-2 py-1 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#273B5E]"
                  />
                </div>
              </div>
            </div>

            {/* Mandatory Fields Section */}
            <div className="bg-amber-50/30 border border-amber-200/80 rounded-lg p-2 space-y-1.5">
              <div className="flex items-center gap-2 border-b border-amber-200/60 pb-1">
                <span className="text-[10px] font-extrabold text-[#963F29] uppercase tracking-wider">Mandatory Fields</span>
                <span className="text-[8px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-mono font-bold">Required</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wider block">
                    Company Code <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6000"
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value)}
                    className="w-full bg-white border border-[#D9DEE6] rounded px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#273B5E]"
                    required
                  />
                </div>

                <div className="space-y-0.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wider block">
                      From Date {glOption !== 'open_items' && <span className="text-rose-600 font-bold">*</span>}
                    </label>
                  </div>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    disabled={glOption === 'open_items'}
                    className={`w-full border rounded px-1.5 py-1 text-xs font-mono transition-all ${glOption === 'open_items'
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-white border-[#D9DEE6] text-slate-800 focus:outline-none focus:border-[#273B5E]'
                      }`}
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wider block">
                    To Date <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full bg-white border border-[#D9DEE6] rounded px-1.5 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#273B5E]"
                    required
                  />
                </div>
              </div>

              {/* Special Note when Open Items is selected */}
              {glOption === 'open_items' && (
                <div className="bg-amber-100/70 border border-amber-300 text-amber-900 rounded p-1.5 text-[10px] flex items-center gap-1.5 mt-1">
                  <Info className="w-3 h-3 text-amber-700 shrink-0" />
                  <span className="leading-tight">
                    <strong>Note:</strong> Open Items includes all uncleared postings up to <strong>To Date</strong>. From Date disabled.
                  </span>
                </div>
              )}
            </div>

            {/* Selection Options (Restrict only one selection) */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                Selection Type (Restrict to one selection)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label
                  onClick={() => setGlOption('all_entries')}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-lg border-2 cursor-pointer transition-all ${glOption === 'all_entries'
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
                  <span className="text-[8px] text-slate-400 font-mono mt-0.5">(all_entries)</span>
                </label>

                <label
                  onClick={() => setGlOption('open_items')}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-lg border-2 cursor-pointer transition-all ${glOption === 'open_items'
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
                  <span className="text-[8px] text-slate-400 font-mono mt-0.5">(open_items)</span>
                </label>

                <label
                  onClick={() => setGlOption('cleared_items')}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-lg border-2 cursor-pointer transition-all ${glOption === 'cleared_items'
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
                  <span className="text-[8px] text-slate-400 font-mono mt-0.5">(cleared_items)</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-2.5 gap-3">
              <button
                id="btn-gl-back"
                onClick={() => onNavigate('LEDGER_REP_MAIN')}
                className="px-4 py-1.5 border border-[#D9DEE6] rounded-lg text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors text-center"
              >
                Back
              </button>
              <button
                id="btn-gl-display"
                disabled={loadingGl}
                onClick={handleFetchGeneralLedger}
                className="px-5 py-1.5 bg-[#273B5E] hover:bg-[#1f2f4b] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {loadingGl ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Fetching Data...</span>
                  </>
                ) : (
                  <>
                    <span>Display G/L Postings</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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

    const glColumnOptions: ColumnOption[] = [
      { key: 'documentno', label: 'DocumentNo' },
      { key: 'g_l_acct2', label: 'G/L Acct' },
      { key: 'gl_description', label: 'GL Description' },
      { key: 'cocode', label: 'CoCode' },
      { key: 'assignment', label: 'Assignment' },
      { key: 'posting_date', label: 'Posting Date' },
      { key: 'clgentdate', label: 'Clearing Date' },
      { key: 'postkey', label: 'PostKey' },
      { key: 'd_c_indic', label: 'D/C' },
      { key: 'amount_lc', label: 'Amount (LC)' },
      { key: 'amount1', label: 'Amount 1' },
      { key: 'reference_key', label: 'Reference Key' },
      { key: 'customer', label: 'Customer' },
      { key: 'vendor', label: 'Vendor' },
      { key: 'material', label: 'Material' },
      { key: 'profit_ctr', label: 'Profit Ctr' },
      { key: 'cost_ctr', label: 'Cost Ctr' }
    ];

    const glTableCols = [
      { key: 'documentno', label: 'DocumentNo', minWidth: '110px', align: 'left', render: (i: GeneralLedgerItem) => <span className="font-mono font-bold text-[#963F29]">{i.documentno}</span> },
      { key: 'g_l_acct2', label: 'G/L Acct', minWidth: '100px', align: 'left', render: (i: GeneralLedgerItem) => <span className="font-mono text-slate-700 font-bold">{i.g_l_acct2}</span> },
      { key: 'gl_description', label: 'GL Description', minWidth: '180px', align: 'left', render: (i: GeneralLedgerItem) => <span className="font-sans font-medium text-slate-800">{i.gl_description || '-'}</span> },
      { key: 'cocode', label: 'CoCode', minWidth: '70px', align: 'center', render: (i: GeneralLedgerItem) => <span className="font-mono text-center text-slate-600">{i.cocode}</span> },
      { key: 'assignment', label: 'Assignment', minWidth: '110px', align: 'left', render: (i: GeneralLedgerItem) => <span className="font-mono text-slate-600">{i.assignment || ''}</span> },
      { key: 'posting_date', label: 'Posting Date', minWidth: '100px', align: 'left', render: (i: GeneralLedgerItem) => <span className="font-mono text-slate-700">{i.posting_date || ''}</span> },
      { key: 'clgentdate', label: 'Clearing Date', minWidth: '100px', align: 'left', render: (i: GeneralLedgerItem) => <span className="font-mono text-slate-600">{i.clgentdate ? i.clgentdate : <span className="text-amber-700 font-bold text-[10px]">Open Item</span>}</span> },
      { key: 'postkey', label: 'PostKey', minWidth: '50px', align: 'center', render: (i: GeneralLedgerItem) => <span className="font-mono text-slate-600">{i.postkey || ''}</span> },
      { key: 'd_c_indic', label: 'D/C', minWidth: '50px', align: 'center', render: (i: GeneralLedgerItem) => <span className="font-mono font-semibold">{i.d_c_indic || ''}</span> },
      { key: 'amount_lc', label: 'Amount (LC)', minWidth: '130px', align: 'right', render: (i: GeneralLedgerItem) => <span className={`font-mono font-bold ${i.d_c_indic === 'S' ? 'text-emerald-700' : 'text-slate-900'}`}>₹{(i.amount_lc || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> },
      { key: 'amount1', label: 'Amount 1', minWidth: '120px', align: 'right', render: (i: GeneralLedgerItem) => <span className="font-mono text-slate-700">{i.amount1 !== undefined && i.amount1 !== null ? `₹${i.amount1.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : ''}</span> },
      { key: 'reference_key', label: 'Reference Key', minWidth: '160px', align: 'left', render: (i: GeneralLedgerItem) => <span className="font-mono text-slate-600 truncate max-w-[160px]" title={i.reference_key || ''}>{i.reference_key || ''}</span> },
      { key: 'customer', label: 'Customer', minWidth: '100px', align: 'left', render: (i: GeneralLedgerItem) => <span className="font-mono text-slate-700">{i.customer || ''}</span> },
      { key: 'vendor', label: 'Vendor', minWidth: '100px', align: 'left', render: (i: GeneralLedgerItem) => <span className="font-mono text-slate-700">{i.vendor || ''}</span> },
      { key: 'material', label: 'Material', minWidth: '100px', align: 'left', render: (i: GeneralLedgerItem) => <span className="font-mono text-slate-700">{i.material || ''}</span> },
      { key: 'profit_ctr', label: 'Profit Ctr', minWidth: '90px', align: 'center', render: (i: GeneralLedgerItem) => <span className="font-mono text-slate-500">{i.profit_ctr || ''}</span> },
      { key: 'cost_ctr', label: 'Cost Ctr', minWidth: '90px', align: 'center', render: (i: GeneralLedgerItem) => <span className="font-mono text-slate-500">{i.cost_ctr || ''}</span> }
    ];

    const selectedGlKeys = columnFilters.map(f => f.columnKey).filter(Boolean);
    const orderedGlCols = [
      ...selectedGlKeys.map(k => glTableCols.find(c => c.key === k)).filter(Boolean) as typeof glTableCols,
      ...glTableCols.filter(c => !selectedGlKeys.includes(c.key))
    ];

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

        {/* Dynamic 3 Key-Value Column Filters Toolbar */}
        <ColumnFilterBar
          columns={glColumnOptions}
          filters={columnFilters}
          onFilterChange={handleColumnFilterChange}
          onClearAll={handleClearColumnFilters}
          title="Dynamic 3-Column Header Filters"
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
                <div className="bg-[#273B5E] text-white px-3 py-1.5 flex items-center gap-2.5 font-mono text-[11px]">
                  <span className="font-bold bg-[#963F29] px-2 py-0.5 rounded text-[10.5px]">
                    G/L Account: {acctKey}
                  </span>
                  {items[0]?.gl_description && (
                    <span className="font-bold bg-slate-700/80 text-slate-100 px-2 py-0.5 rounded text-[10.5px]">
                      G/L Description: {items[0].gl_description}
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px] whitespace-nowrap font-sans">
                    <thead className="bg-slate-100 border-b border-[#D9DEE6] text-slate-800 font-bold">
                      <tr>
                        <th className="py-1.5 px-2 text-center min-w-[40px]">St</th>
                        {orderedGlCols.map((col) => {
                          const isFiltered = selectedGlKeys.includes(col.key);
                          return (
                            <th
                              key={col.key}
                              style={{ minWidth: col.minWidth }}
                              className={`py-1.5 px-2 font-mono ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${isFiltered ? 'bg-amber-200/80 text-[#963F29] font-black border-b-2 border-[#963F29]' : ''}`}
                            >
                              {col.label} {isFiltered && '★'}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {items.map((item, idx) => {
                        const isCleared = Boolean(item.clgentdate);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-1.5 px-2 text-center">
                              {isCleared ? (
                                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" title={`Cleared on ${item.clgentdate}`} />
                              ) : (
                                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-sm" title="Open Item" />
                              )}
                            </td>
                            {orderedGlCols.map((col) => {
                              const isFiltered = selectedGlKeys.includes(col.key);
                              return (
                                <td
                                  key={col.key}
                                  className={`py-1.5 px-2 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${isFiltered ? 'bg-amber-50/60 font-semibold' : ''}`}
                                >
                                  {col.render(item)}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                      {/* Subtotal row */}
                      <tr className="bg-[#fef9c3] font-mono font-bold text-slate-900 border-t-2 border-slate-300">
                        <td colSpan={orderedGlCols.length + 1} className="py-1.5 px-2 text-right text-slate-800 text-[11px]">
                          * Account {acctKey} Subtotal ({items.length} items): <span className="text-[#963F29] font-black ml-2">₹{acctSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}

        {/* Grand Total Footer Box */}
        <div className="bg-[#273B5E] px-4 py-2.5 rounded-lg shadow-sm flex items-center justify-between font-mono text-xs border border-slate-700/80">
          <div className="space-y-0.5">
            <span className="font-sans block text-[11px] uppercase tracking-wider font-bold text-slate-300">TOTAL GRAND ACCUMULATED BALANCE</span>
            <span className="font-bold text-[12px] block text-white">
              Shortlisted Result Count: <span className="font-bold text-amber-300 ml-1">{apiGlData.length} records</span>
            </span>
          </div>
          <div className="text-right space-y-0.5">
            <span className="text-[10px] block font-sans uppercase font-medium text-slate-400">Currency INR</span>
            <span className="text-sm font-bold block text-emerald-400" style={{ color: '#34D399', fontSize: '14px' }}>
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
      <div className="p-2 sm:p-3 max-w-xl mx-auto select-none">
        <div className="bg-white rounded-xl border border-[#D9DEE6] shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-[#273B5E] text-white px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-300 shrink-0" />
              <div>
                <h3 className="font-bold text-xs sm:text-sm tracking-tight uppercase">Customer Ledger Selection</h3>
              </div>
            </div>
            <button
              onClick={() => onNavigate('LEDGER_REP_MAIN')}
              className="text-slate-300 hover:text-white text-xs font-semibold px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              Back
            </button>
          </div>

          <div className="p-3 sm:p-3.5 space-y-2.5 text-xs font-sans">
            {/* Optional Fields Section */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2 space-y-1.5">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
                <span className="text-[10px] font-extrabold text-[#273B5E] uppercase tracking-wider">Optional Fields</span>
                <span className="text-[8px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-mono">Range Filter</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wider block">From Customer Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 100095"
                    value={fromCustNum}
                    onChange={(e) => setFromCustNum(e.target.value)}
                    className="w-full bg-white border border-[#D9DEE6] rounded px-2 py-1 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#273B5E]"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wider block">To Customer Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 100095"
                    value={toCustNum}
                    onChange={(e) => setToCustNum(e.target.value)}
                    className="w-full bg-white border border-[#D9DEE6] rounded px-2 py-1 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#273B5E]"
                  />
                </div>
              </div>
            </div>

            {/* Mandatory Fields Section */}
            <div className="bg-amber-50/30 border border-amber-200/80 rounded-lg p-2 space-y-1.5">
              <div className="flex items-center gap-2 border-b border-amber-200/60 pb-1">
                <span className="text-[10px] font-extrabold text-[#963F29] uppercase tracking-wider">Mandatory Fields</span>
                <span className="text-[8px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-mono font-bold">Required</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wider block">
                    Company Code <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6000"
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value)}
                    className="w-full bg-white border border-[#D9DEE6] rounded px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#273B5E]"
                    required
                  />
                </div>

                <div className="space-y-0.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wider block">
                      From Date {custOption !== 'open_items' && <span className="text-rose-600 font-bold">*</span>}
                    </label>
                  </div>
                  <input
                    type="date"
                    value={custFromDate}
                    onChange={(e) => setCustFromDate(e.target.value)}
                    disabled={custOption === 'open_items'}
                    className={`w-full border rounded px-1.5 py-1 text-xs font-mono transition-all ${custOption === 'open_items'
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-white border-[#D9DEE6] text-slate-800 focus:outline-none focus:border-[#273B5E]'
                      }`}
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wider block">
                    To Date <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="date"
                    value={custToDate}
                    onChange={(e) => setCustToDate(e.target.value)}
                    className="w-full bg-white border border-[#D9DEE6] rounded px-1.5 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#273B5E]"
                    required
                  />
                </div>
              </div>

              {custOption === 'open_items' && (
                <div className="bg-amber-100/70 border border-amber-300 text-amber-900 rounded p-1.5 text-[10px] flex items-center gap-1.5 mt-1">
                  <Info className="w-3 h-3 text-amber-700 shrink-0" />
                  <span className="leading-tight">
                    <strong>Note:</strong> Open Items includes all uncleared postings up to <strong>To Date</strong>. From Date disabled.
                  </span>
                </div>
              )}
            </div>

            {/* Selection Options */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                Selection Type (Restrict to one selection)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label
                  onClick={() => setCustOption('all_entries')}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-lg border-2 cursor-pointer transition-all ${custOption === 'all_entries'
                    ? 'border-[#273B5E] bg-[#273B5E]/5 text-[#273B5E] font-bold shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="cust_option"
                    value="all_entries"
                    checked={custOption === 'all_entries'}
                    onChange={() => setCustOption('all_entries')}
                    className="sr-only"
                  />
                  <span className="text-xs">All entries</span>
                  <span className="text-[8px] text-slate-400 font-mono mt-0.5">(all_entries)</span>
                </label>

                <label
                  onClick={() => setCustOption('open_items')}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-lg border-2 cursor-pointer transition-all ${custOption === 'open_items'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="cust_option"
                    value="open_items"
                    checked={custOption === 'open_items'}
                    onChange={() => setCustOption('open_items')}
                    className="sr-only"
                  />
                  <span className="text-xs">Open Items</span>
                  <span className="text-[8px] text-slate-400 font-mono mt-0.5">(open_items)</span>
                </label>

                <label
                  onClick={() => setCustOption('cleared_items')}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-lg border-2 cursor-pointer transition-all ${custOption === 'cleared_items'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="cust_option"
                    value="cleared_items"
                    checked={custOption === 'cleared_items'}
                    onChange={() => setCustOption('cleared_items')}
                    className="sr-only"
                  />
                  <span className="text-xs">Cleared Items</span>
                  <span className="text-[8px] text-slate-400 font-mono mt-0.5">(cleared_items)</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-2.5 gap-3">
              <button
                id="btn-cl-back"
                onClick={() => onNavigate('LEDGER_REP_MAIN')}
                className="px-4 py-1.5 border border-[#D9DEE6] rounded-lg text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors text-center"
              >
                Back
              </button>
              <button
                id="btn-cl-display"
                disabled={loadingCust}
                onClick={handleFetchCustomerLedger}
                className="px-5 py-1.5 bg-[#273B5E] hover:bg-[#1f2f4b] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {loadingCust ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Fetching Data...</span>
                  </>
                ) : (
                  <>
                    <span>Display Customer Postings</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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
  // CUSTOMER LEDGER - OUTPUT REPORT (FBL5N)
  // ----------------------------------------------------------------------------
  if (activeScreen === 'CUSTOMER_LEDGER_REP') {
    const custKeys = Object.keys(groupedCustData);

    const custColumnOptions: ColumnOption[] = [
      { key: 'documentno', label: 'DocumentNo' },
      { key: 'customer', label: 'Customer' },
      { key: 'g_l_acct2', label: 'G/L Acct' },
      { key: 'cocode', label: 'CoCode' },
      { key: 'assignment', label: 'Assignment' },
      { key: 'posting_date', label: 'Posting Date' },
      { key: 'clgentdate', label: 'Clearing Date' },
      { key: 'postkey', label: 'PostKey' },
      { key: 'd_c_indic', label: 'D/C' },
      { key: 'amount_lc', label: 'Amount (LC)' },
      { key: 'amount1', label: 'Amount 1' },
      { key: 'reference_key', label: 'Reference Key' },
      { key: 'vendor', label: 'Vendor' },
      { key: 'material', label: 'Material' },
      { key: 'profit_ctr', label: 'Profit Ctr' },
      { key: 'cost_ctr', label: 'Cost Ctr' }
    ];

    const custTableCols = [
      { key: 'documentno', label: 'DocumentNo', minWidth: '110px', align: 'left', render: (i: CustomerLedgerItem) => <span className="font-mono font-bold text-[#963F29]">{i.documentno}</span> },
      { key: 'customer', label: 'Customer', minWidth: '100px', align: 'left', render: (i: CustomerLedgerItem) => <span className="font-mono text-slate-700 font-bold">{i.customer}</span> },
      { key: 'g_l_acct2', label: 'G/L Acct', minWidth: '100px', align: 'left', render: (i: CustomerLedgerItem) => <span className="font-mono text-slate-700">{i.g_l_acct2}</span> },
      { key: 'cocode', label: 'CoCode', minWidth: '70px', align: 'center', render: (i: CustomerLedgerItem) => <span className="font-mono text-center text-slate-600">{i.cocode}</span> },
      { key: 'assignment', label: 'Assignment', minWidth: '110px', align: 'left', render: (i: CustomerLedgerItem) => <span className="font-mono text-slate-600">{i.assignment || ''}</span> },
      { key: 'posting_date', label: 'Posting Date', minWidth: '100px', align: 'left', render: (i: CustomerLedgerItem) => <span className="font-mono text-slate-700">{i.posting_date || ''}</span> },
      { key: 'clgentdate', label: 'Clearing Date', minWidth: '100px', align: 'left', render: (i: CustomerLedgerItem) => <span className="font-mono text-slate-600">{i.clgentdate ? i.clgentdate : <span className="text-amber-700 font-bold text-[10px]">Open Item</span>}</span> },
      { key: 'postkey', label: 'PostKey', minWidth: '50px', align: 'center', render: (i: CustomerLedgerItem) => <span className="font-mono text-slate-600">{i.postkey || ''}</span> },
      { key: 'd_c_indic', label: 'D/C', minWidth: '50px', align: 'center', render: (i: CustomerLedgerItem) => <span className="font-mono font-semibold">{i.d_c_indic || ''}</span> },
      { key: 'amount_lc', label: 'Amount (LC)', minWidth: '130px', align: 'right', render: (i: CustomerLedgerItem) => <span className={`font-mono font-bold ${i.d_c_indic === 'S' ? 'text-emerald-700' : 'text-slate-900'}`}>₹{(i.amount_lc || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> },
      { key: 'amount1', label: 'Amount 1', minWidth: '120px', align: 'right', render: (i: CustomerLedgerItem) => <span className="font-mono text-slate-700">{i.amount1 !== undefined && i.amount1 !== null ? `₹${i.amount1.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : ''}</span> },
      { key: 'reference_key', label: 'Reference Key', minWidth: '160px', align: 'left', render: (i: CustomerLedgerItem) => <span className="font-mono text-slate-600 truncate max-w-[160px]" title={i.reference_key || ''}>{i.reference_key || ''}</span> },
      { key: 'vendor', label: 'Vendor', minWidth: '100px', align: 'left', render: (i: CustomerLedgerItem) => <span className="font-mono text-slate-700">{i.vendor || ''}</span> },
      { key: 'material', label: 'Material', minWidth: '100px', align: 'left', render: (i: CustomerLedgerItem) => <span className="font-mono text-slate-700">{i.material || ''}</span> },
      { key: 'profit_ctr', label: 'Profit Ctr', minWidth: '90px', align: 'center', render: (i: CustomerLedgerItem) => <span className="font-mono text-slate-500">{i.profit_ctr || ''}</span> },
      { key: 'cost_ctr', label: 'Cost Ctr', minWidth: '90px', align: 'center', render: (i: CustomerLedgerItem) => <span className="font-mono text-slate-500">{i.cost_ctr || ''}</span> }
    ];

    const selectedKeys = columnFilters.map(f => f.columnKey).filter(Boolean);
    const orderedCols = [
      ...selectedKeys.map(k => custTableCols.find(c => c.key === k)).filter(Boolean) as typeof custTableCols,
      ...custTableCols.filter(c => !selectedKeys.includes(c.key))
    ];

    return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto select-none font-sans">
        {/* Top Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-sans font-bold text-[#273B5E]">Customer Line Item Display</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 font-mono mt-0.5">
              Company Code: <strong>{companyCode}</strong> | Option: <strong>{custOption}</strong> | Total Records: <strong>{apiCustData.length}</strong>
            </p>
          </div>
          <button
            id="btn-cl-rep-back"
            onClick={() => onNavigate('CUSTOMER_LEDGER_SEL')}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Selection Screen</span>
          </button>
        </div>

        {/* Dynamic 3 Key-Value Column Filters Toolbar */}
        <ColumnFilterBar
          columns={custColumnOptions}
          filters={columnFilters}
          onFilterChange={handleColumnFilterChange}
          onClearAll={handleClearColumnFilters}
          title="Dynamic 3-Column Header Filters"
        />

        {/* Display Grouped Tables per Customer */}
        {custKeys.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#D9DEE6] p-8 text-center text-slate-400">
            No matching Customer Ledger records found for Company Code {companyCode}.
          </div>
        ) : (
          custKeys.map((custKey) => {
            const items = groupedCustData[custKey];
            const custSubtotal = items.reduce((acc, i) => acc + (i.amount_lc || 0), 0);
            const custSubtotalAmount1 = items.reduce((acc, i) => acc + (i.amount1 || 0), 0);
            const custName = items[0]?.customer_name || 'Customer Account';

            return (
              <div key={custKey} className="bg-white rounded-lg border border-[#D9DEE6] overflow-hidden shadow-sm space-y-0">
                {/* SAP Customer Account Header Banner */}
                <div className="bg-[#273B5E] text-white px-3 py-1.5 flex items-center gap-2.5 font-mono text-[11px]">
                  <span className="font-bold bg-[#963F29] px-2 py-0.5 rounded text-[10.5px]">
                    Customer Account: {custKey}
                  </span>
                  {items[0]?.customer_name && (
                    <span className="font-bold bg-slate-700/80 text-slate-100 px-2 py-0.5 rounded text-[10.5px]">
                      Customer Name: {items[0].customer_name}
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px] whitespace-nowrap font-sans">
                    <thead className="bg-slate-100 border-b border-[#D9DEE6] text-slate-800 font-bold">
                      <tr>
                        <th className="py-1.5 px-2 text-center min-w-[40px]">St</th>
                        {orderedCols.map((col) => {
                          const isFiltered = selectedKeys.includes(col.key);
                          return (
                            <th
                              key={col.key}
                              style={{ minWidth: col.minWidth }}
                              className={`py-1.5 px-2 font-mono ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${isFiltered ? 'bg-amber-200/80 text-[#963F29] font-black border-b-2 border-[#963F29]' : ''}`}
                            >
                              {col.label} {isFiltered && '★'}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {items.map((item, idx) => {
                        const isCleared = Boolean(item.clgentdate);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-1.5 px-2 text-center">
                              {isCleared ? (
                                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" title={`Cleared on ${item.clgentdate}`} />
                              ) : (
                                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-sm" title="Open Item" />
                              )}
                            </td>
                            {orderedCols.map((col) => {
                              const isFiltered = selectedKeys.includes(col.key);
                              return (
                                <td
                                  key={col.key}
                                  className={`py-1.5 px-2 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${isFiltered ? 'bg-amber-50/60 font-semibold' : ''}`}
                                >
                                  {col.render(item)}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                      {/* Subtotal row */}
                      <tr className="bg-[#fef9c3] font-mono font-bold text-slate-900 border-t-2 border-slate-300">
                        <td colSpan={orderedCols.length + 1} className="py-1.5 px-2 text-right text-slate-800 text-[11px]">
                          * Customer {custKey} Subtotal ({items.length} items): <span className="text-[#963F29] font-black ml-2">₹{custSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}

        {/* Grand Total Footer Box */}
        <div className="bg-[#273B5E] px-4 py-2.5 rounded-lg shadow-sm flex items-center justify-between font-mono text-xs border border-slate-700/80">
          <div className="space-y-0.5">
            <span className="font-sans block text-[11px] uppercase tracking-wider font-bold text-slate-300">TOTAL GRAND ACCUMULATED BALANCE</span>
            <span className="font-bold text-[12px] block text-white">
              Shortlisted Result Count: <span className="font-bold text-amber-300 ml-1">{apiCustData.length} records</span>
            </span>
          </div>
          <div className="text-right space-y-0.5">
            <span className="text-[10px] block font-sans uppercase font-medium text-slate-400">Currency INR</span>
            <span className="text-sm font-bold block text-emerald-400" style={{ color: '#34D399', fontSize: '14px' }}>
              ₹{grandTotalCustAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
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
      <div className="p-2 sm:p-3 max-w-md mx-auto select-none">
        <div className="bg-white rounded-xl border border-[#D9DEE6] shadow-md overflow-hidden">
          <div className="bg-[#273B5E] text-white px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500 animate-pulse" />
              <div>
                <h3 className="font-bold text-xs">VENDOR SUBSIDIARY SELECTION</h3>
                <p className="text-[10px] text-gray-300">Transaction FBL1N - Accounts Payable</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('LEDGER_REP_MAIN')}
              className="text-slate-300 hover:text-white text-xs font-semibold px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              Back
            </button>
          </div>

          <div className="p-3.5 space-y-3 text-xs font-sans">
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

            <div className="grid grid-cols-2 gap-3">
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
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 gap-3">
              <button
                id="btn-vl-back"
                onClick={() => onNavigate('LEDGER_REP_MAIN')}
                className="px-4 py-1.5 border border-[#D9DEE6] rounded-lg text-xs text-slate-600 hover:bg-slate-50 font-medium"
              >
                Back
              </button>
              <button
                id="btn-vl-display"
                onClick={() => onNavigate('VENDOR_LEDGER_REP')}
                className="px-5 py-1.5 bg-[#273B5E] hover:bg-[#3d5680] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md"
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
