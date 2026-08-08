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
import { sampleVendorLedgerData, VendorLedgerItem } from '../../data/vendorLedgerData';
import { API_BASE_URL } from '../../config/api';
import { exportToExcel } from '../../utils/exportToExcel';
import { TableToolbar, OutputHeaderButtonBoxes, ButtonBoxField, ColumnFilterBar, ColumnOption, ColumnFilterState } from '../CommonUI/CommonUI';
import {
  BookOpen,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
  FileSpreadsheet,
  Download
} from 'lucide-react';

interface ReportPaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const ReportPaginationBar: React.FC<ReportPaginationBarProps> = ({
  currentPage,
  totalPages,
  totalCount,
  loading,
  onPageChange
}) => {
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages || totalPages === 0;

  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="bg-white border border-[#D9DEE6] rounded-lg px-4 py-2 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs shadow-xs font-sans select-none">
      <div className="flex flex-wrap items-center gap-2 text-slate-600">
        <span className="font-medium">
          Page <strong className="text-[#273B5E] font-mono">{currentPage}</strong> of <strong className="text-[#273B5E] font-mono">{totalPages || 1}</strong>
        </span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-500 font-mono text-[11px]">
          Total <strong className="text-slate-800">{totalCount.toLocaleString()}</strong> records
        </span>
        <span className="text-slate-300">|</span>
        <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
          100 records / page
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(1)}
          disabled={isFirst || loading}
          className="p-1.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirst || loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-[#273B5E] hover:text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1 mx-1">
          {visiblePages.map(p => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              disabled={loading}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                p === currentPage
                  ? 'bg-[#273B5E] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLast || loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-[#273B5E] hover:text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
          title="Next Page"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={isLast || loading}
          className="p-1.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>

        {loading && (
          <Loader2 className="w-4 h-4 text-[#273B5E] animate-spin ml-1 shrink-0" />
        )}
      </div>
    </div>
  );
};

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
  const [glPage, setGlPage] = useState<number>(1);
  const [glPaginationInfo, setGlPaginationInfo] = useState<{ page: number; page_size: number; total_count: number; total_pages: number }>({ page: 1, page_size: 100, total_count: sampleGeneralLedgerData.length, total_pages: Math.ceil(sampleGeneralLedgerData.length / 100) || 1 });
  const [glGrandTotal, setGlGrandTotal] = useState<{ credit_total: number; debit_total: number; net: number } | null>(null);
  const [glAccountTotalsMap, setGlAccountTotalsMap] = useState<Record<string, { credit_total: number; debit_total: number; net: number }>>({});

  // Customer Ledger Form Specific States
  const [fromCustNum, setFromCustNum] = useState('');
  const [toCustNum, setToCustNum] = useState('');
  const [custFromDate, setCustFromDate] = useState('2024-04-01');
  const [custToDate, setCustToDate] = useState('2024-04-30');
  const [custOption, setCustOption] = useState<'all_entries' | 'open_items' | 'cleared_items'>('all_entries');
  const [apiCustData, setApiCustData] = useState<CustomerLedgerItem[]>(sampleCustomerLedgerData);
  const [loadingCust, setLoadingCust] = useState(false);
  const [custPage, setCustPage] = useState<number>(1);
  const [custPaginationInfo, setCustPaginationInfo] = useState<{ page: number; page_size: number; total_count: number; total_pages: number }>({ page: 1, page_size: 100, total_count: sampleCustomerLedgerData.length, total_pages: Math.ceil(sampleCustomerLedgerData.length / 100) || 1 });
  const [custGrandTotal, setCustGrandTotal] = useState<{ credit_total: number; debit_total: number; net: number } | null>(null);

  // Vendor Ledger Form Specific States
  const [fromVendorNum, setFromVendorNum] = useState('');
  const [toVendorNum, setToVendorNum] = useState('');
  const [vendorFromDate, setVendorFromDate] = useState('2024-04-01');
  const [vendorToDate, setVendorToDate] = useState('2024-04-30');
  const [vendorOption, setVendorOption] = useState<'all_entries' | 'open_items' | 'cleared_items'>('all_entries');
  const [apiVendorData, setApiVendorData] = useState<VendorLedgerItem[]>(sampleVendorLedgerData);
  const [loadingVendor, setLoadingVendor] = useState(false);
  const [vendorPage, setVendorPage] = useState<number>(1);
  const [vendorPaginationInfo, setVendorPaginationInfo] = useState<{ page: number; page_size: number; total_count: number; total_pages: number }>({ page: 1, page_size: 100, total_count: sampleVendorLedgerData.length, total_pages: Math.ceil(sampleVendorLedgerData.length / 100) || 1 });
  const [vendorGrandTotal, setVendorGrandTotal] = useState<{ credit_total: number; debit_total: number; net: number } | null>(null);

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
  const [sortColumn, setSortColumn] = useState<string>('posting_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
  const handleFetchGeneralLedger = async (targetPage: number = 1) => {
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
    setGlPage(targetPage);

    try {
      const baseUrl = API_BASE_URL;
      let url = `${baseUrl}/api/ledger-reporting/general-ledger?company_code=${encodeURIComponent(companyCode.trim())}&option=${encodeURIComponent(glOption)}&page=${targetPage}&page_size=100`;
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
        let pag = { page: targetPage, page_size: 100, total_count: 0, total_pages: 1 };
        if (json.data) {
          if (Array.isArray(json.data.data)) {
            items = json.data.data;
          } else if (Array.isArray(json.data)) {
            items = json.data;
          }
          if (json.data.grand_total) {
            setGlGrandTotal(json.data.grand_total);
          } else {
            setGlGrandTotal(null);
          }
          if (Array.isArray(json.data.gl_account_totals)) {
            const map: Record<string, { credit_total: number; debit_total: number; net: number }> = {};
            json.data.gl_account_totals.forEach((tot: any) => {
              if (tot.gl_account) {
                map[String(tot.gl_account)] = {
                  credit_total: Number(tot.credit_total || 0),
                  debit_total: Number(tot.debit_total || 0),
                  net: Number(tot.net || 0),
                };
              }
            });
            setGlAccountTotalsMap(map);
          } else {
            setGlAccountTotalsMap({});
          }
          if (json.data.pagination) {
            pag = json.data.pagination;
          } else {
            pag.total_count = items.length;
            pag.total_pages = Math.ceil(items.length / 100) || 1;
          }
        } else if (Array.isArray(json)) {
          items = json;
          setGlGrandTotal(null);
          setGlAccountTotalsMap({});
          pag.total_count = items.length;
          pag.total_pages = Math.ceil(items.length / 100) || 1;
        }
        setApiGlData(items);
        setGlPaginationInfo(pag);
        triggerToast(`General Ledger data fetched successfully (${items.length} records, Page ${pag.page} of ${pag.total_pages}).`, 'success');
      } else {
        throw new Error(`API returned HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn('Backend API connection fallback to local filtering:', err);
      setGlGrandTotal(null);
      setGlAccountTotalsMap({});

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

      const total_count = filtered.length;
      const total_pages = Math.ceil(total_count / 100) || 1;
      const startIndex = (targetPage - 1) * 100;
      const pageItems = filtered.slice(startIndex, startIndex + 100);

      setApiGlData(pageItems);
      setGlPaginationInfo({ page: targetPage, page_size: 100, total_count, total_pages });
      triggerToast(`Loaded shortlisted General Ledger data (${pageItems.length} entries on page ${targetPage}).`, 'info');
    } finally {
      setLoadingGl(false);
      onNavigate('GL_LEDGER_REP');
    }
  };
  // Sorting General Ledger data
  const sortedGLData = useMemo(() => {
    return [...apiGlData].sort((a, b) => {
      const aValue = (a as any)[sortColumn];
      const bValue = (b as any)[sortColumn];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;

      // Amount sorting
      if (
        sortColumn === 'amount_lc' ||
        sortColumn === 'amount1'
      ) {
        comparison = Number(aValue || 0) - Number(bValue || 0);
      }

      // Date sorting
      else if (
        sortColumn === 'posting_date' ||
        sortColumn === 'clgentdate'
      ) {
        comparison =
          new Date(String(aValue)).getTime() -
          new Date(String(bValue)).getTime();
      }

      // Text / number sorting
      else {
        comparison = String(aValue).localeCompare(
          String(bValue),
          undefined,
          {
            numeric: true,
            sensitivity: 'base',
          }
        );
      }

      return sortDirection === 'asc'
        ? comparison
        : -comparison;
    });
  }, [apiGlData, sortColumn, sortDirection]);

  // Grouping of API / Filtered General Ledger entries by G/L account for output table
  const groupedGLData = useMemo(() => {
    const groups: { key: string; items: GeneralLedgerItem[] }[] = [];
    const map = new Map<string, GeneralLedgerItem[]>();

    sortedGLData.forEach((item) => {
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
      if (!map.has(acct)) {
        const groupItems: GeneralLedgerItem[] = [];
        map.set(acct, groupItems);
        groups.push({ key: acct, items: groupItems });
      }
      map.get(acct)!.push(item);
    });

    return groups;
  }, [sortedGLData, searchTerm, columnFilters]);

  // Shortlisted GL Items
  const shortlistedGLItems = useMemo(() => {
    return groupedGLData.flatMap(g => g.items);
  }, [groupedGLData]);

  // Overall grand total amount calculation
  const grandTotalAmount = useMemo(() => {
    return shortlistedGLItems.reduce((acc, item) => acc + (item.amount_lc || 0), 0);
  }, [shortlistedGLItems]);

  // Overall GL summary calculations (Debit, Credit, Net)
  const glSummary = useMemo(() => {
    const debit = shortlistedGLItems.reduce((acc, item) => acc + (item.d_c_indic === 'S' ? (item.amount_lc || 0) : 0), 0);
    const credit = shortlistedGLItems.reduce((acc, item) => acc + (item.d_c_indic === 'H' ? (item.amount_lc || 0) : 0), 0);
    const net = debit - credit;
    return { debit, credit, net };
  }, [shortlistedGLItems]);

  // Handler for Fetching Customer Ledger API / Local Data
  const handleFetchCustomerLedger = async (targetPage: number = 1) => {
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
    setCustPage(targetPage);

    try {
      const baseUrl = API_BASE_URL;
      let url = `${baseUrl}/api/ledger-reporting/customer-ledger?company_code=${encodeURIComponent(companyCode.trim())}&option=${encodeURIComponent(custOption)}&page=${targetPage}&page_size=100`;
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
        let pag = { page: targetPage, page_size: 100, total_count: 0, total_pages: 1 };
        if (json.data) {
          if (Array.isArray(json.data.data)) {
            items = json.data.data;
          } else if (Array.isArray(json.data)) {
            items = json.data;
          }
          if (json.data.grand_total) {
            setCustGrandTotal(json.data.grand_total);
          } else {
            setCustGrandTotal(null);
          }
          if (json.data.pagination) {
            pag = json.data.pagination;
          } else {
            pag.total_count = items.length;
            pag.total_pages = Math.ceil(items.length / 100) || 1;
          }
        } else if (Array.isArray(json)) {
          items = json;
          setCustGrandTotal(null);
          pag.total_count = items.length;
          pag.total_pages = Math.ceil(items.length / 100) || 1;
        }
        setApiCustData(items);
        setCustPaginationInfo(pag);
        triggerToast(`Customer Ledger data fetched successfully (${items.length} records, Page ${pag.page} of ${pag.total_pages}).`, 'success');
      } else {
        throw new Error(`API returned HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn('Backend API connection fallback to local filtering:', err);
      setCustGrandTotal(null);

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

      const total_count = filtered.length;
      const total_pages = Math.ceil(total_count / 100) || 1;
      const startIndex = (targetPage - 1) * 100;
      const pageItems = filtered.slice(startIndex, startIndex + 100);

      setApiCustData(pageItems);
      setCustPaginationInfo({ page: targetPage, page_size: 100, total_count, total_pages });
      triggerToast(`Loaded shortlisted Customer Ledger data (${pageItems.length} entries on page ${targetPage}).`, 'info');
    } finally {
      setLoadingCust(false);
      onNavigate('CUSTOMER_LEDGER_REP');
    }
  };

  // Sorting Customer Ledger data
  const sortedCustData = useMemo(() => {
    return [...apiCustData].sort((a, b) => {
      const aValue = (a as any)[sortColumn];
      const bValue = (b as any)[sortColumn];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;

      if (
        sortColumn === 'amount_lc' ||
        sortColumn === 'amount1'
      ) {
        comparison = Number(aValue || 0) - Number(bValue || 0);
      } else if (
        sortColumn === 'posting_date' ||
        sortColumn === 'clgentdate'
      ) {
        comparison =
          new Date(String(aValue)).getTime() -
          new Date(String(bValue)).getTime();
      } else {
        comparison = String(aValue).localeCompare(
          String(bValue),
          undefined,
          {
            numeric: true,
            sensitivity: 'base',
          }
        );
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [apiCustData, sortColumn, sortDirection]);

  // Grouping of API / Filtered Customer Ledger entries by customer for output table
  const groupedCustData = useMemo(() => {
    const groups: { key: string; items: CustomerLedgerItem[] }[] = [];
    const map = new Map<string, CustomerLedgerItem[]>();

    sortedCustData.forEach((item) => {
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
      if (!map.has(custKey)) {
        const groupItems: CustomerLedgerItem[] = [];
        map.set(custKey, groupItems);
        groups.push({ key: custKey, items: groupItems });
      }
      map.get(custKey)!.push(item);
    });

    return groups;
  }, [sortedCustData, searchTerm, columnFilters]);

  // Shortlisted Customer Items
  const shortlistedCustItems = useMemo(() => {
    return groupedCustData.flatMap(g => g.items);
  }, [groupedCustData]);

  // Overall grand total amount calculation for Customer Ledger
  const grandTotalCustAmount = useMemo(() => {
    return shortlistedCustItems.reduce((acc, item) => acc + (item.amount_lc || 0), 0);
  }, [shortlistedCustItems]);

  // Overall Customer summary calculations (Debit, Credit, Net)
  const custSummary = useMemo(() => {
    const debit = shortlistedCustItems.reduce((acc, item) => acc + (item.d_c_indic === 'S' ? (item.amount_lc || 0) : 0), 0);
    const credit = shortlistedCustItems.reduce((acc, item) => acc + (item.d_c_indic === 'H' ? (item.amount_lc || 0) : 0), 0);
    const net = debit - credit;
    return { debit, credit, net };
  }, [shortlistedCustItems]);

  // Handler for Fetching Vendor Ledger API / Local Data
  const handleFetchVendorLedger = async (targetPage: number = 1) => {
    if (!companyCode.trim()) {
      triggerToast('Company Code is mandatory.', 'warning');
      return;
    }
    if (!vendorToDate.trim()) {
      triggerToast('To Date is mandatory.', 'warning');
      return;
    }
    if (vendorOption !== 'open_items' && !vendorFromDate.trim()) {
      triggerToast('From Date is mandatory for all/cleared entries selection.', 'warning');
      return;
    }

    setLoadingVendor(true);
    setVendorPage(targetPage);

    try {
      const baseUrl = API_BASE_URL;
      let url = `${baseUrl}/api/ledger-reporting/vendor-ledger?company_code=${encodeURIComponent(companyCode.trim())}&option=${encodeURIComponent(vendorOption)}&page=${targetPage}&page_size=100`;
      if (fromVendorNum.trim()) url += `&from_vendor_num=${encodeURIComponent(fromVendorNum.trim())}`;
      if (toVendorNum.trim()) url += `&to_vendor_num=${encodeURIComponent(toVendorNum.trim())}`;
      if (vendorOption !== 'open_items' && vendorFromDate.trim()) url += `&from_date=${encodeURIComponent(vendorFromDate.trim())}`;
      if (vendorToDate.trim()) url += `&to_date=${encodeURIComponent(vendorToDate.trim())}`;

      const token = typeof window !== 'undefined' ? localStorage.getItem('sap_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      const res = await fetch(url, { method: 'GET', headers });
      if (res.ok) {
        const json = await res.json();
        let items: VendorLedgerItem[] = [];
        let pag = { page: targetPage, page_size: 100, total_count: 0, total_pages: 1 };
        if (json.data) {
          if (Array.isArray(json.data.data)) {
            items = json.data.data;
          } else if (Array.isArray(json.data)) {
            items = json.data;
          }
          if (json.data.grand_total) {
            setVendorGrandTotal(json.data.grand_total);
          } else {
            setVendorGrandTotal(null);
          }
          if (json.data.pagination) {
            pag = json.data.pagination;
          } else {
            pag.total_count = items.length;
            pag.total_pages = Math.ceil(items.length / 100) || 1;
          }
        } else if (Array.isArray(json)) {
          items = json;
          setVendorGrandTotal(null);
          pag.total_count = items.length;
          pag.total_pages = Math.ceil(items.length / 100) || 1;
        }
        setApiVendorData(items);
        setVendorPaginationInfo(pag);
        triggerToast(`Vendor Ledger data fetched successfully (${items.length} records, Page ${pag.page} of ${pag.total_pages}).`, 'success');
      } else {
        throw new Error(`API returned HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn('Backend API connection fallback to local filtering:', err);
      setVendorGrandTotal(null);

      const isNumFrom = Boolean(fromVendorNum.trim()) && !isNaN(Number(fromVendorNum));
      const isNumTo = Boolean(toVendorNum.trim()) && !isNaN(Number(toVendorNum));

      let filtered = sampleVendorLedgerData.filter((item) => {
        if (companyCode.trim() && item.cocode !== companyCode.trim()) return false;

        if (fromVendorNum.trim()) {
          const isNumVend = Boolean(item.vendor) && !isNaN(Number(item.vendor));
          if (isNumFrom && isNumVend) {
            if (Number(item.vendor) < Number(fromVendorNum)) return false;
          } else if (item.vendor < fromVendorNum.trim()) {
            return false;
          }
        }

        if (toVendorNum.trim()) {
          const isNumVend = Boolean(item.vendor) && !isNaN(Number(item.vendor));
          if (isNumTo && isNumVend) {
            if (Number(item.vendor) > Number(toVendorNum)) return false;
          } else if (item.vendor > toVendorNum.trim()) {
            return false;
          }
        }

        if (vendorOption === 'open_items') {
          if (item.clgentdate) return false;
          if (vendorToDate.trim() && item.posting_date > vendorToDate.trim()) return false;
        } else if (vendorOption === 'cleared_items') {
          if (!item.clgentdate) return false;
          if (vendorFromDate.trim() && item.posting_date < vendorFromDate.trim()) return false;
          if (vendorToDate.trim() && item.posting_date > vendorToDate.trim()) return false;
        } else {
          if (vendorFromDate.trim() && item.posting_date < vendorFromDate.trim()) return false;
          if (vendorToDate.trim() && item.posting_date > vendorToDate.trim()) return false;
        }

        return true;
      });

      const total_count = filtered.length;
      const total_pages = Math.ceil(total_count / 100) || 1;
      const startIndex = (targetPage - 1) * 100;
      const pageItems = filtered.slice(startIndex, startIndex + 100);

      setApiVendorData(pageItems);
      setVendorPaginationInfo({ page: targetPage, page_size: 100, total_count, total_pages });
      triggerToast(`Loaded shortlisted Vendor Ledger data (${pageItems.length} entries on page ${targetPage}).`, 'info');
    } finally {
      setLoadingVendor(false);
      onNavigate('VENDOR_LEDGER_REP');
    }
  };

  // Sorting Vendor Ledger data
  const sortedVendorData = useMemo(() => {
    return [...apiVendorData].sort((a, b) => {
      const aValue = (a as any)[sortColumn];
      const bValue = (b as any)[sortColumn];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;

      if (
        sortColumn === 'amount_lc' ||
        sortColumn === 'amount1'
      ) {
        comparison = Number(aValue || 0) - Number(bValue || 0);
      } else if (
        sortColumn === 'posting_date' ||
        sortColumn === 'clgentdate'
      ) {
        comparison =
          new Date(String(aValue)).getTime() -
          new Date(String(bValue)).getTime();
      } else {
        comparison = String(aValue).localeCompare(
          String(bValue),
          undefined,
          {
            numeric: true,
            sensitivity: 'base',
          }
        );
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [apiVendorData, sortColumn, sortDirection]);

  // Grouping of API / Filtered Vendor Ledger entries by vendor for output table
  const groupedVendorData = useMemo(() => {
    const groups: { key: string; items: VendorLedgerItem[] }[] = [];
    const map = new Map<string, VendorLedgerItem[]>();

    sortedVendorData.forEach((item) => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const match =
          item.documentno.toLowerCase().includes(term) ||
          item.vendor.toLowerCase().includes(term) ||
          item.g_l_acct2.toLowerCase().includes(term) ||
          (item.assignment && item.assignment.toLowerCase().includes(term)) ||
          (item.reference_key && item.reference_key.toLowerCase().includes(term)) ||
          (item.vendor_name && item.vendor_name.toLowerCase().includes(term));
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

      const vendKey = item.vendor || 'Unassigned Vendor';
      if (!map.has(vendKey)) {
        const groupItems: VendorLedgerItem[] = [];
        map.set(vendKey, groupItems);
        groups.push({ key: vendKey, items: groupItems });
      }
      map.get(vendKey)!.push(item);
    });

    return groups;
  }, [sortedVendorData, searchTerm, columnFilters]);

  // Shortlisted Vendor Items
  const shortlistedVendorItems = useMemo(() => {
    return groupedVendorData.flatMap(g => g.items);
  }, [groupedVendorData]);

  // Overall grand total amount calculation for Vendor Ledger
  const grandTotalVendorAmount = useMemo(() => {
    return shortlistedVendorItems.reduce((acc, item) => acc + (item.amount_lc || 0), 0);
  }, [shortlistedVendorItems]);

  // Overall Vendor summary calculations (Debit, Credit, Net)
  const vendorSummary = useMemo(() => {
    const debit = shortlistedVendorItems.reduce((acc, item) => acc + (item.d_c_indic === 'S' ? (item.amount_lc || 0) : 0), 0);
    const credit = shortlistedVendorItems.reduce((acc, item) => acc + (item.d_c_indic === 'H' ? (item.amount_lc || 0) : 0), 0);
    const net = debit - credit;
    return { debit, credit, net };
  }, [shortlistedVendorItems]);

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
  // EXCEL DOWNLOAD HANDLERS (FRONTEND CLIENT-SIDE EXPORT)
  // ============================================================================
  const handleExportGLExcel = () => {
    const exportData = sortedGLData.map(item => ({
      documentno: item.documentno,
      doc_type: item.doc_type || 'SA',
      g_l_acct2: item.g_l_acct2,
      gl_description: item.gl_description || '',
      cocode: item.cocode,
      assignment: item.assignment || '',
      posting_date: item.posting_date || '',
      clgentdate: item.clgentdate || 'Open Item',
      postkey: item.postkey || '',
      d_c_indic: item.d_c_indic || '',
      amount_lc: item.amount_lc || 0,
      amount1: item.amount1 !== undefined && item.amount1 !== null ? item.amount1 : '',
      reference_key: item.reference_key || '',
      customer: item.customer || '',
      vendor: item.vendor || '',
      material: item.material || '',
      profit_ctr: item.profit_ctr || '',
      cost_ctr: item.cost_ctr || ''
    }));

    const columnMap = {
      documentno: 'Document No',
      doc_type: 'Doc Type',
      g_l_acct2: 'G/L Account',
      gl_description: 'G/L Description',
      cocode: 'Company Code',
      assignment: 'Assignment',
      posting_date: 'Posting Date',
      clgentdate: 'Clearing Date',
      postkey: 'Posting Key',
      d_c_indic: 'D/C',
      amount_lc: 'Amount in LC (₹)',
      amount1: 'Amount 1',
      reference_key: 'Reference Key',
      customer: 'Customer',
      vendor: 'Vendor',
      material: 'Material',
      profit_ctr: 'Profit Center',
      cost_ctr: 'Cost Center'
    };

    exportToExcel(exportData, `General_Ledger_Report_${companyCode}`, 'General Ledger', columnMap);
    triggerToast(`Exported ${exportData.length} General Ledger records to Excel successfully!`, 'success');
  };

  const handleExportCustExcel = () => {
    const exportData = sortedCustData.map(item => ({
      documentno: item.documentno,
      doc_type: item.doc_type || 'SA',
      customer: item.customer,
      customer_name: item.customer_name || '',
      g_l_acct2: item.g_l_acct2,
      cocode: item.cocode,
      assignment: item.assignment || '',
      posting_date: item.posting_date || '',
      clgentdate: item.clgentdate || 'Open Item',
      postkey: item.postkey || '',
      d_c_indic: item.d_c_indic || '',
      amount_lc: item.amount_lc || 0,
      amount1: item.amount1 !== undefined && item.amount1 !== null ? item.amount1 : '',
      reference_key: item.reference_key || '',
      vendor: item.vendor || '',
      material: item.material || '',
      profit_ctr: item.profit_ctr || '',
      cost_ctr: item.cost_ctr || ''
    }));

    const columnMap = {
      documentno: 'Document No',
      doc_type: 'Doc Type',
      customer: 'Customer No',
      customer_name: 'Customer Name',
      g_l_acct2: 'G/L Account',
      cocode: 'Company Code',
      assignment: 'Assignment',
      posting_date: 'Posting Date',
      clgentdate: 'Clearing Date',
      postkey: 'Posting Key',
      d_c_indic: 'D/C',
      amount_lc: 'Amount in LC (₹)',
      amount1: 'Amount 1',
      reference_key: 'Reference Key',
      vendor: 'Vendor',
      material: 'Material',
      profit_ctr: 'Profit Center',
      cost_ctr: 'Cost Center'
    };

    exportToExcel(exportData, `Customer_Ledger_Report_${companyCode}`, 'Customer Ledger', columnMap);
    triggerToast(`Exported ${exportData.length} Customer Ledger records to Excel successfully!`, 'success');
  };

  const handleExportVendorExcel = () => {
    const exportData = sortedVendorData.map(item => ({
      documentno: item.documentno,
      doc_type: item.doc_type || 'SA',
      vendor: item.vendor,
      vendor_name: item.vendor_name || '',
      g_l_acct2: item.g_l_acct2,
      cocode: item.cocode,
      assignment: item.assignment || '',
      posting_date: item.posting_date || '',
      clgentdate: item.clgentdate || 'Open Item',
      postkey: item.postkey || '',
      d_c_indic: item.d_c_indic || '',
      amount_lc: item.amount_lc || 0,
      amount1: item.amount1 !== undefined && item.amount1 !== null ? item.amount1 : '',
      reference_key: item.reference_key || '',
      customer: item.customer || '',
      material: item.material || '',
      profit_ctr: item.profit_ctr || '',
      cost_ctr: item.cost_ctr || ''
    }));

    const columnMap = {
      documentno: 'Document No',
      doc_type: 'Doc Type',
      vendor: 'Vendor No',
      vendor_name: 'Vendor Name',
      g_l_acct2: 'G/L Account',
      cocode: 'Company Code',
      assignment: 'Assignment',
      posting_date: 'Posting Date',
      clgentdate: 'Clearing Date',
      postkey: 'Posting Key',
      d_c_indic: 'D/C',
      amount_lc: 'Amount in LC (₹)',
      amount1: 'Amount 1',
      reference_key: 'Reference Key',
      customer: 'Customer',
      material: 'Material',
      profit_ctr: 'Profit Center',
      cost_ctr: 'Cost Center'
    };

    exportToExcel(exportData, `Vendor_Ledger_Report_${companyCode}`, 'Vendor Ledger', columnMap);
    triggerToast(`Exported ${exportData.length} Vendor Ledger records to Excel successfully!`, 'success');
  };

  const handleExportStockExcel = () => {
    const exportData = stockItems.map(item => ({
      matCode: item.matCode,
      name: item.name,
      cocode: companyCode || '1900',
      fiscalYear: fiscalYear || '2026',
      plant: item.plant,
      storageLoc: item.storageLoc,
      stockQty: item.stockQty,
      uom: item.uom,
      val: item.val * 83
    }));

    const columnMap = {
      matCode: 'Material Number',
      name: 'Material Description',
      cocode: 'Company Code',
      fiscalYear: 'Fiscal Year',
      plant: 'Plant Code',
      storageLoc: 'Storage Location',
      stockQty: 'On-Hand Quantity',
      uom: 'Unit of Measure',
      val: 'Simulated Valuation (₹)'
    };

    exportToExcel(exportData, `Stock_Inventory_Report_${companyCode}`, 'Stock Inventory', columnMap);
    triggerToast(`Exported ${exportData.length} Stock items to Excel successfully!`, 'success');
  };


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
                onClick={() => handleFetchGeneralLedger(1)}
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
      { key: 'doc_type', label: 'DocType' },
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
      { key: 'doc_type', label: 'DocType', minWidth: '70px', align: 'center', render: (i: GeneralLedgerItem) => <span className="font-mono text-slate-700 font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">{i.doc_type || 'SA'}</span> },
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
              Company Code: <strong>{companyCode}</strong> | Option: <strong>{glOption}</strong> | Page: <strong>{glPage} of {glPaginationInfo.total_pages || 1}</strong> | Total Records: <strong>{glPaginationInfo.total_count}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleExportGLExcel}
              className="group flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-[#273B5E] hover:text-white hover:border-[#273B5E] rounded-md text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              title="Download General Ledger to Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 group-hover:text-white transition-colors shrink-0" />
              <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors shrink-0" />
              <span>Download Excel</span>
            </button>
            <button
              id="btn-gl-rep-back"
              onClick={() => onNavigate('GL_LEDGER_SEL')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Selection Screen</span>
            </button>
          </div>
        </div>

        {/* Dynamic 3 Key-Value Column Filters Toolbar */}
        <ColumnFilterBar
          columns={glColumnOptions}
          filters={columnFilters}
          onFilterChange={handleColumnFilterChange}
          onClearAll={handleClearColumnFilters}
          title="Dynamic 3-Column Header Filters"
          sortColumn={sortColumn}
          onSortColumnChange={setSortColumn}
          sortDirection={sortDirection}
          onSortDirectionChange={setSortDirection}
        />

        {/* Display Grouped Tables per G/L Account (matching SAP GUI FBL3N layout) */}
        {groupedGLData.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#D9DEE6] p-8 text-center text-slate-400">
            No matching General Ledger records found for Company Code {companyCode}.
          </div>
        ) : (
          groupedGLData.map((group) => {
            const acctKey = group.key;
            const items = group.items;
            const backendAcctTotal = (!searchTerm.trim() && columnFilters.every(f => !f.value.trim())) ? glAccountTotalsMap[acctKey] : null;
            const acctDebitTotal = backendAcctTotal ? backendAcctTotal.debit_total : items.reduce((acc, i) => acc + (i.d_c_indic === 'S' ? (i.amount_lc || 0) : 0), 0);
            const acctCreditTotal = backendAcctTotal ? backendAcctTotal.credit_total : items.reduce((acc, i) => acc + (i.d_c_indic === 'H' ? (i.amount_lc || 0) : 0), 0);
            const acctNetTotal = backendAcctTotal ? backendAcctTotal.net : acctDebitTotal - acctCreditTotal;

            return (
              <div key={acctKey} className="bg-white rounded-lg border border-[#D9DEE6] overflow-hidden shadow-sm space-y-0">
                {/* SAP G/L Account Header Banner with Net, Credit, Debit Totals */}
                <div className="bg-[#273B5E] text-white px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-bold bg-[#963F29] px-2 py-0.5 rounded text-[10.5px]">
                      G/L Account: {acctKey}
                    </span>
                    {items[0]?.gl_description && (
                      <span className="font-bold bg-slate-700/80 text-slate-100 px-2 py-0.5 rounded text-[10.5px]">
                        G/L Description: {items[0].gl_description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 px-2 py-0.5 rounded font-medium">
                      Debit: <strong className="text-white">₹{acctDebitTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </span>
                    <span className="bg-rose-950/80 border border-rose-700/60 text-rose-300 px-2 py-0.5 rounded font-medium">
                      Credit: <strong className="text-white">₹{acctCreditTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </span>
                    <span className="bg-amber-950/80 border border-amber-600/60 text-amber-300 px-2 py-0.5 rounded font-bold">
                      Net: <strong className="text-amber-200">₹{acctNetTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </span>
                  </div>
                </div>

                <div className="max-h-[60vh] overflow-auto border-t border-slate-200">
                  <table className="w-full text-left border-collapse text-[11px] whitespace-nowrap font-sans relative">
                    <thead className="bg-slate-100 border-b border-[#D9DEE6] text-slate-800 font-bold sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="py-2 px-2 text-center min-w-[40px] sticky top-0 bg-slate-100 z-10">St</th>
                        {orderedGlCols.map((col) => {
                          const isFiltered = selectedGlKeys.includes(col.key);
                          return (
                            <th
                              key={col.key}
                              style={{ minWidth: col.minWidth }}
                              className={`py-2 px-2 font-mono sticky top-0 z-10 ${isFiltered ? 'bg-amber-200 text-[#963F29]' : 'bg-slate-100'} ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${isFiltered ? 'font-black border-b-2 border-[#963F29]' : ''}`}
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
                          * Account {acctKey} Subtotal ({items.length} items): <span className="text-[#963F29] font-black ml-2">₹{acctNetTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}

        {/* Bottom Pagination Bar */}
        <ReportPaginationBar
          currentPage={glPage}
          totalPages={glPaginationInfo.total_pages}
          totalCount={glPaginationInfo.total_count}
          loading={loadingGl}
          onPageChange={handleFetchGeneralLedger}
        />

        {/* Grand Total Footer Box */}
        <div className="bg-[#273B5E] px-4 py-2.5 rounded-lg shadow-sm flex flex-col sm:flex-row items-center justify-between font-mono text-xs border border-slate-700/80 gap-3">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="font-sans block text-[11px] uppercase tracking-wider font-bold text-slate-300">TOTAL GRAND ACCUMULATED BALANCE</span>
            <span className="font-bold text-[12px] block text-white">
              Total Records: <span className="font-bold text-amber-300 ml-1">{glPaginationInfo.total_count} records</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
            <span className="bg-emerald-950/90 border border-emerald-600/80 text-emerald-300 px-3 py-1 rounded font-medium shadow-sm">
              Debit: <strong className="text-white ml-1">₹{(glGrandTotal ? glGrandTotal.debit_total : glSummary.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </span>
            <span className="bg-rose-950/90 border border-rose-600/80 text-rose-300 px-3 py-1 rounded font-medium shadow-sm">
              Credit: <strong className="text-white ml-1">₹{(glGrandTotal ? glGrandTotal.credit_total : glSummary.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </span>
            <span className="bg-amber-950/90 border border-amber-500/80 text-amber-300 px-3 py-1 rounded font-bold shadow-sm">
              Net: <strong className="text-amber-200 ml-1">₹{(glGrandTotal ? glGrandTotal.net : glSummary.net).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
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
                onClick={() => handleFetchCustomerLedger(1)}
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
      { key: 'doc_type', label: 'DocType' },
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
      { key: 'doc_type', label: 'DocType', minWidth: '70px', align: 'center', render: (i: CustomerLedgerItem) => <span className="font-mono text-slate-700 font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">{i.doc_type || 'SA'}</span> },
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
              Company Code: <strong>{companyCode}</strong> | Option: <strong>{custOption}</strong> | Page: <strong>{custPage} of {custPaginationInfo.total_pages || 1}</strong> | Total Records: <strong>{custPaginationInfo.total_count}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleExportCustExcel}
              className="group flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-[#273B5E] hover:text-white hover:border-[#273B5E] rounded-md text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              title="Download Customer Ledger to Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 group-hover:text-white transition-colors shrink-0" />
              <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors shrink-0" />
              <span>Download Excel</span>
            </button>
            <button
              id="btn-cl-rep-back"
              onClick={() => onNavigate('CUSTOMER_LEDGER_SEL')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Selection Screen</span>
            </button>
          </div>
        </div>

        {/* Dynamic 3 Key-Value Column Filters Toolbar */}
        <ColumnFilterBar
          columns={custColumnOptions}
          filters={columnFilters}
          onFilterChange={handleColumnFilterChange}
          onClearAll={handleClearColumnFilters}
          title="Dynamic 3-Column Header Filters"
          sortColumn={sortColumn}
          onSortColumnChange={setSortColumn}
          sortDirection={sortDirection}
          onSortDirectionChange={setSortDirection}
        />

        {/* Display Grouped Tables per Customer */}
        {groupedCustData.length === 0 ? (
          <div className="bg-[#ffffff] rounded-lg border border-[#D9DEE6] p-8 text-center text-slate-400">
            No matching Customer Ledger records found for Company Code {companyCode}.
          </div>
        ) : (
          groupedCustData.map((group) => {
            const custKey = group.key;
            const items = group.items;
            const custDebitTotal = items.reduce((acc, i) => acc + (i.d_c_indic === 'S' ? (i.amount_lc || 0) : 0), 0);
            const custCreditTotal = items.reduce((acc, i) => acc + (i.d_c_indic === 'H' ? (i.amount_lc || 0) : 0), 0);
            const custNetTotal = custDebitTotal - custCreditTotal;

            return (
              <div key={custKey} className="bg-white rounded-lg border border-[#D9DEE6] overflow-hidden shadow-sm space-y-0">
                {/* SAP Customer Account Header Banner with Net, Credit, Debit Totals */}
                <div className="bg-[#273B5E] text-white px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-bold bg-[#963F29] px-2 py-0.5 rounded text-[10.5px]">
                      Customer Account: {custKey}
                    </span>
                    {items[0]?.customer_name && (
                      <span className="font-bold bg-slate-700/80 text-slate-100 px-2 py-0.5 rounded text-[10.5px]">
                        Customer Name: {items[0].customer_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 px-2 py-0.5 rounded font-medium">
                      Debit: <strong className="text-white">₹{custDebitTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </span>
                    <span className="bg-rose-950/80 border border-rose-700/60 text-rose-300 px-2 py-0.5 rounded font-medium">
                      Credit: <strong className="text-white">₹{custCreditTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </span>
                    <span className="bg-amber-950/80 border border-amber-600/60 text-amber-300 px-2 py-0.5 rounded font-bold">
                      Net: <strong className="text-amber-200">₹{custNetTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </span>
                  </div>
                </div>

                <div className="max-h-[60vh] overflow-auto border-t border-slate-200">
                  <table className="w-full text-left border-collapse text-[11px] whitespace-nowrap font-sans relative">
                    <thead className="bg-slate-100 border-b border-[#D9DEE6] text-slate-800 font-bold sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="py-2 px-2 text-center min-w-[40px] sticky top-0 bg-slate-100 z-10">St</th>
                        {orderedCols.map((col) => {
                          const isFiltered = selectedKeys.includes(col.key);
                          return (
                            <th
                              key={col.key}
                              style={{ minWidth: col.minWidth }}
                              className={`py-2 px-2 font-mono sticky top-0 z-10 ${isFiltered ? 'bg-amber-200 text-[#963F29]' : 'bg-slate-100'} ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${isFiltered ? 'font-black border-b-2 border-[#963F29]' : ''}`}
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
                          * Customer {custKey} Subtotal ({items.length} items): <span className="text-[#963F29] font-black ml-2">₹{custNetTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}

        {/* Bottom Pagination Bar */}
        <ReportPaginationBar
          currentPage={custPage}
          totalPages={custPaginationInfo.total_pages}
          totalCount={custPaginationInfo.total_count}
          loading={loadingCust}
          onPageChange={handleFetchCustomerLedger}
        />

        {/* Grand Total Footer Box */}
        <div className="bg-[#273B5E] px-4 py-2.5 rounded-lg shadow-sm flex flex-col sm:flex-row items-center justify-between font-mono text-xs border border-slate-700/80 gap-3">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="font-sans block text-[11px] uppercase tracking-wider font-bold text-slate-300">TOTAL GRAND ACCUMULATED BALANCE</span>
            <span className="font-bold text-[12px] block text-white">
              Total Records: <span className="font-bold text-amber-300 ml-1">{custPaginationInfo.total_count} records</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
            <span className="bg-emerald-950/90 border border-emerald-600/80 text-emerald-300 px-3 py-1 rounded font-medium shadow-sm">
              Debit: <strong className="text-white ml-1">₹{(custGrandTotal ? custGrandTotal.debit_total : custSummary.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </span>
            <span className="bg-rose-950/90 border border-rose-600/80 text-rose-300 px-3 py-1 rounded font-medium shadow-sm">
              Credit: <strong className="text-white ml-1">₹{(custGrandTotal ? custGrandTotal.credit_total : custSummary.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </span>
            <span className="bg-amber-950/90 border border-amber-500/80 text-amber-300 px-3 py-1 rounded font-bold shadow-sm">
              Net: <strong className="text-amber-200 ml-1">₹{(custGrandTotal ? custGrandTotal.net : custSummary.net).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
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
      <div className="p-2 sm:p-3 max-w-xl mx-auto select-none">
        <div className="bg-white rounded-xl border border-[#D9DEE6] shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-[#273B5E] text-white px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-300 shrink-0" />
              <div>
                <h3 className="font-bold text-xs sm:text-sm tracking-tight uppercase">Vendor Ledger Selection</h3>
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
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wider block">From Vendor Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 0000200501"
                    value={fromVendorNum}
                    onChange={(e) => setFromVendorNum(e.target.value)}
                    className="w-full bg-white border border-[#D9DEE6] rounded px-2 py-1 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#273B5E]"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-slate-600 uppercase tracking-wider block">To Vendor Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 0000200502"
                    value={toVendorNum}
                    onChange={(e) => setToVendorNum(e.target.value)}
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
                      From Date {vendorOption !== 'open_items' && <span className="text-rose-600 font-bold">*</span>}
                    </label>
                  </div>
                  <input
                    type="date"
                    value={vendorFromDate}
                    onChange={(e) => setVendorFromDate(e.target.value)}
                    disabled={vendorOption === 'open_items'}
                    className={`w-full border rounded px-1.5 py-1 text-xs font-mono transition-all ${vendorOption === 'open_items'
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
                    value={vendorToDate}
                    onChange={(e) => setVendorToDate(e.target.value)}
                    className="w-full bg-white border border-[#D9DEE6] rounded px-1.5 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#273B5E]"
                    required
                  />
                </div>
              </div>

              {vendorOption === 'open_items' && (
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
                  onClick={() => setVendorOption('all_entries')}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-lg border-2 cursor-pointer transition-all ${vendorOption === 'all_entries'
                    ? 'border-[#273B5E] bg-[#273B5E]/5 text-[#273B5E] font-bold shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="vendor_option"
                    value="all_entries"
                    checked={vendorOption === 'all_entries'}
                    onChange={() => setVendorOption('all_entries')}
                    className="sr-only"
                  />
                  <span className="text-xs">All entries</span>
                  <span className="text-[8px] text-slate-400 font-mono mt-0.5">(all_entries)</span>
                </label>

                <label
                  onClick={() => setVendorOption('open_items')}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-lg border-2 cursor-pointer transition-all ${vendorOption === 'open_items'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="vendor_option"
                    value="open_items"
                    checked={vendorOption === 'open_items'}
                    onChange={() => setVendorOption('open_items')}
                    className="sr-only"
                  />
                  <span className="text-xs">Open Items</span>
                  <span className="text-[8px] text-slate-400 font-mono mt-0.5">(open_items)</span>
                </label>

                <label
                  onClick={() => setVendorOption('cleared_items')}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-lg border-2 cursor-pointer transition-all ${vendorOption === 'cleared_items'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="vendor_option"
                    value="cleared_items"
                    checked={vendorOption === 'cleared_items'}
                    onChange={() => setVendorOption('cleared_items')}
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
                id="btn-vl-back"
                onClick={() => onNavigate('LEDGER_REP_MAIN')}
                className="px-4 py-1.5 border border-[#D9DEE6] rounded-lg text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors text-center"
              >
                Back
              </button>
              <button
                id="btn-vl-display"
                disabled={loadingVendor}
                onClick={() => handleFetchVendorLedger(1)}
                className="px-5 py-1.5 bg-[#273B5E] hover:bg-[#1f2f4b] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {loadingVendor ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Fetching Data...</span>
                  </>
                ) : (
                  <>
                    <span>Display Vendor Postings</span>
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
  // VENDOR LEDGER - OUTPUT REPORT (FBL1N)
  // ----------------------------------------------------------------------------
  if (activeScreen === 'VENDOR_LEDGER_REP') {
    const vendKeys = Object.keys(groupedVendorData);

    const vendorColumnOptions: ColumnOption[] = [
      { key: 'documentno', label: 'DocumentNo' },
      { key: 'doc_type', label: 'DocType' },
      { key: 'vendor', label: 'Vendor' },
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
      { key: 'customer', label: 'Customer' },
      { key: 'material', label: 'Material' },
      { key: 'profit_ctr', label: 'Profit Ctr' },
      { key: 'cost_ctr', label: 'Cost Ctr' }
    ];

    const vendorTableCols = [
      { key: 'documentno', label: 'DocumentNo', minWidth: '110px', align: 'left', render: (i: VendorLedgerItem) => <span className="font-mono font-bold text-[#963F29]">{i.documentno}</span> },
      { key: 'doc_type', label: 'DocType', minWidth: '70px', align: 'center', render: (i: VendorLedgerItem) => <span className="font-mono text-slate-700 font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">{i.doc_type || 'SA'}</span> },
      { key: 'vendor', label: 'Vendor', minWidth: '100px', align: 'left', render: (i: VendorLedgerItem) => <span className="font-mono text-slate-700 font-bold">{i.vendor}</span> },
      { key: 'g_l_acct2', label: 'G/L Acct', minWidth: '100px', align: 'left', render: (i: VendorLedgerItem) => <span className="font-mono text-slate-700">{i.g_l_acct2}</span> },
      { key: 'cocode', label: 'CoCode', minWidth: '70px', align: 'center', render: (i: VendorLedgerItem) => <span className="font-mono text-center text-slate-600">{i.cocode}</span> },
      { key: 'assignment', label: 'Assignment', minWidth: '110px', align: 'left', render: (i: VendorLedgerItem) => <span className="font-mono text-slate-600">{i.assignment || ''}</span> },
      { key: 'posting_date', label: 'Posting Date', minWidth: '100px', align: 'left', render: (i: VendorLedgerItem) => <span className="font-mono text-slate-700">{i.posting_date || ''}</span> },
      { key: 'clgentdate', label: 'Clearing Date', minWidth: '100px', align: 'left', render: (i: VendorLedgerItem) => <span className="font-mono text-slate-600">{i.clgentdate ? i.clgentdate : <span className="text-amber-700 font-bold text-[10px]">Open Item</span>}</span> },
      { key: 'postkey', label: 'PostKey', minWidth: '50px', align: 'center', render: (i: VendorLedgerItem) => <span className="font-mono text-slate-600">{i.postkey || ''}</span> },
      { key: 'd_c_indic', label: 'D/C', minWidth: '50px', align: 'center', render: (i: VendorLedgerItem) => <span className="font-mono font-semibold">{i.d_c_indic || ''}</span> },
      { key: 'amount_lc', label: 'Amount (LC)', minWidth: '130px', align: 'right', render: (i: VendorLedgerItem) => <span className={`font-mono font-bold ${i.d_c_indic === 'S' ? 'text-emerald-700' : 'text-slate-900'}`}>₹{(i.amount_lc || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> },
      { key: 'amount1', label: 'Amount 1', minWidth: '120px', align: 'right', render: (i: VendorLedgerItem) => <span className="font-mono text-slate-700">{i.amount1 !== undefined && i.amount1 !== null ? `₹${i.amount1.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : ''}</span> },
      { key: 'reference_key', label: 'Reference Key', minWidth: '160px', align: 'left', render: (i: VendorLedgerItem) => <span className="font-mono text-slate-600 truncate max-w-[160px]" title={i.reference_key || ''}>{i.reference_key || ''}</span> },
      { key: 'customer', label: 'Customer', minWidth: '100px', align: 'left', render: (i: VendorLedgerItem) => <span className="font-mono text-slate-700">{i.customer || ''}</span> },
      { key: 'material', label: 'Material', minWidth: '100px', align: 'left', render: (i: VendorLedgerItem) => <span className="font-mono text-slate-700">{i.material || ''}</span> },
      { key: 'profit_ctr', label: 'Profit Ctr', minWidth: '90px', align: 'center', render: (i: VendorLedgerItem) => <span className="font-mono text-slate-500">{i.profit_ctr || ''}</span> },
      { key: 'cost_ctr', label: 'Cost Ctr', minWidth: '90px', align: 'center', render: (i: VendorLedgerItem) => <span className="font-mono text-slate-500">{i.cost_ctr || ''}</span> }
    ];

    const selectedKeys = columnFilters.map(f => f.columnKey).filter(Boolean);
    const orderedCols = [
      ...selectedKeys.map(k => vendorTableCols.find(c => c.key === k)).filter(Boolean) as typeof vendorTableCols,
      ...vendorTableCols.filter(c => !selectedKeys.includes(c.key))
    ];

    return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto select-none font-sans">
        {/* Top Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-sans font-bold text-[#273B5E]">Vendor Line Item Display</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 font-mono mt-0.5">
              Company Code: <strong>{companyCode}</strong> | Option: <strong>{vendorOption}</strong> | Page: <strong>{vendorPage} of {vendorPaginationInfo.total_pages || 1}</strong> | Total Records: <strong>{vendorPaginationInfo.total_count}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleExportVendorExcel}
              className="group flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-[#273B5E] hover:text-white hover:border-[#273B5E] rounded-md text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              title="Download Vendor Ledger to Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 group-hover:text-white transition-colors shrink-0" />
              <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors shrink-0" />
              <span>Download Excel</span>
            </button>
            <button
              id="btn-vl-rep-back"
              onClick={() => onNavigate('VENDOR_LEDGER_SEL')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Selection Screen</span>
            </button>
          </div>
        </div>

        {/* Dynamic 3 Key-Value Column Filters Toolbar */}
        <ColumnFilterBar
          columns={vendorColumnOptions}
          filters={columnFilters}
          onFilterChange={handleColumnFilterChange}
          onClearAll={handleClearColumnFilters}
          title="Dynamic 3-Column Header Filters"
          sortColumn={sortColumn}
          onSortColumnChange={setSortColumn}
          sortDirection={sortDirection}
          onSortDirectionChange={setSortDirection}
        />

        {/* Display Grouped Tables per Vendor */}
        {groupedVendorData.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#D9DEE6] p-8 text-center text-slate-400">
            No matching Vendor Ledger records found for Company Code {companyCode}.
          </div>
        ) : (
          groupedVendorData.map((group) => {
            const vendKey = group.key;
            const items = group.items;
            const vendDebitTotal = items.reduce((acc, i) => acc + (i.d_c_indic === 'S' ? (i.amount_lc || 0) : 0), 0);
            const vendCreditTotal = items.reduce((acc, i) => acc + (i.d_c_indic === 'H' ? (i.amount_lc || 0) : 0), 0);
            const vendNetTotal = vendDebitTotal - vendCreditTotal;

            return (
              <div key={vendKey} className="bg-white rounded-lg border border-[#D9DEE6] overflow-hidden shadow-sm space-y-0">
                {/* SAP Vendor Account Header Banner with Net, Credit, Debit Totals */}
                <div className="bg-[#273B5E] text-white px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-bold bg-[#963F29] px-2 py-0.5 rounded text-[10.5px]">
                      Vendor Account: {vendKey}
                    </span>
                    {items[0]?.vendor_name && (
                      <span className="font-bold bg-slate-700/80 text-slate-100 px-2 py-0.5 rounded text-[10.5px]">
                        Vendor Name: {items[0].vendor_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 px-2 py-0.5 rounded font-medium">
                      Debit: <strong className="text-white">₹{vendDebitTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </span>
                    <span className="bg-rose-950/80 border border-rose-700/60 text-rose-300 px-2 py-0.5 rounded font-medium">
                      Credit: <strong className="text-white">₹{vendCreditTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </span>
                    <span className="bg-amber-950/80 border border-amber-600/60 text-amber-300 px-2 py-0.5 rounded font-bold">
                      Net: <strong className="text-amber-200">₹{vendNetTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </span>
                  </div>
                </div>

                <div className="max-h-[60vh] overflow-auto border-t border-slate-200">
                  <table className="w-full text-left border-collapse text-[11px] whitespace-nowrap font-sans relative">
                    <thead className="bg-slate-100 border-b border-[#D9DEE6] text-slate-800 font-bold sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="py-2 px-2 text-center min-w-[40px] sticky top-0 bg-slate-100 z-10">St</th>
                        {orderedCols.map((col) => {
                          const isFiltered = selectedKeys.includes(col.key);
                          return (
                            <th
                              key={col.key}
                              style={{ minWidth: col.minWidth }}
                              className={`py-2 px-2 font-mono sticky top-0 z-10 ${isFiltered ? 'bg-amber-200 text-[#963F29]' : 'bg-slate-100'} ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${isFiltered ? 'font-black border-b-2 border-[#963F29]' : ''}`}
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
                          * Vendor {vendKey} Subtotal ({items.length} items): <span className="text-[#963F29] font-black ml-2">₹{vendNetTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}

        {/* Bottom Pagination Bar */}
        <ReportPaginationBar
          currentPage={vendorPage}
          totalPages={vendorPaginationInfo.total_pages}
          totalCount={vendorPaginationInfo.total_count}
          loading={loadingVendor}
          onPageChange={handleFetchVendorLedger}
        />

        {/* Grand Total Footer Box */}
        <div className="bg-[#273B5E] px-4 py-2.5 rounded-lg shadow-sm flex flex-col sm:flex-row items-center justify-between font-mono text-xs border border-slate-700/80 gap-3">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="font-sans block text-[11px] uppercase tracking-wider font-bold text-slate-300">TOTAL GRAND ACCUMULATED BALANCE</span>
            <span className="font-bold text-[12px] block text-white">
              Total Records: <span className="font-bold text-amber-300 ml-1">{vendorPaginationInfo.total_count} records</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
            <span className="bg-emerald-950/90 border border-emerald-600/80 text-emerald-300 px-3 py-1 rounded font-medium shadow-sm">
              Debit: <strong className="text-white ml-1">₹{(vendorGrandTotal ? vendorGrandTotal.debit_total : vendorSummary.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </span>
            <span className="bg-rose-950/90 border border-rose-600/80 text-rose-300 px-3 py-1 rounded font-medium shadow-sm">
              Credit: <strong className="text-white ml-1">₹{(vendorGrandTotal ? vendorGrandTotal.credit_total : vendorSummary.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </span>
            <span className="bg-amber-950/90 border border-amber-500/80 text-amber-300 px-3 py-1 rounded font-bold shadow-sm">
              Net: <strong className="text-amber-200 ml-1">₹{(vendorGrandTotal ? vendorGrandTotal.net : vendorSummary.net).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </span>
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
            onExportExcel={handleExportStockExcel}
            totalRecords={stockItems.length}
            hideSearch={false}
          />

          <div className="max-h-[60vh] overflow-auto border-t border-slate-200">
            <table className="w-full text-left border-collapse text-xs relative">
              <thead className="bg-slate-100 border-b border-[#D9DEE6] text-slate-700 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-3 font-mono bg-slate-100 sticky top-0 z-10">Material Number</th>
                  <th className="p-3 bg-slate-100 sticky top-0 z-10">Material Description</th>
                  <th className="p-3 font-mono text-center bg-slate-100 sticky top-0 z-10">CoCode</th>
                  <th className="p-3 font-mono text-center bg-slate-100 sticky top-0 z-10">Year</th>
                  <th className="p-3 font-mono bg-slate-100 sticky top-0 z-10">Plant</th>
                  <th className="p-3 font-mono bg-slate-100 sticky top-0 z-10">Storage Loc</th>
                  <th className="p-3 text-right font-mono bg-slate-100 sticky top-0 z-10">On-Hand Quantity</th>
                  <th className="p-3 bg-slate-100 sticky top-0 z-10">Unit</th>
                  <th className="p-3 text-right font-mono bg-slate-100 sticky top-0 z-10">Simulated Valuation</th>
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
