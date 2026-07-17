import React, { useState, useMemo } from 'react';
import { Screen, TrialBalanceItem, LedgerEntry } from '../../types';
import { initialTrialBalanceItems, mockGLEntries } from '../../data/sapMockData';
import { TableToolbar, OutputHeaderButtonBoxes, ButtonBoxField } from '../CommonUI/CommonUI';
import {
  FileText,
  ArrowLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Layers,
  Search,
  BookOpen,
  PieChart
} from 'lucide-react';

interface FinancialStatementsModuleProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  triggerToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const FinancialStatementsModule: React.FC<FinancialStatementsModuleProps> = ({
  activeScreen,
  onNavigate,
  triggerToast
}) => {
  // ============================================================================
  // SHARED FORM STATE VARIABLES
  // ============================================================================
  const [companyCode, setCompanyCode] = useState('1900');
  const [fiscalYear, setFiscalYear] = useState('2026');
  const [period, setPeriod] = useState('07');
  const [ledger, setLedger] = useState('0L');
  const [accountNum, setAccountNum] = useState('100010');

  // Trial balance records state to support dynamic insertion
  const [trialBalanceItems, setTrialBalanceItems] = useState<TrialBalanceItem[]>(initialTrialBalanceItems);

  // Fast entry input block variables (exactly 2 boxes)
  const [fastAccountNum, setFastAccountNum] = useState('');
  const [fastAccountDesc, setFastAccountDesc] = useState('');

  // Table search & sort helpers
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('account');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sort and filter logic for Trial Balance
  const filteredTrialBalance = useMemo(() => {
    let result = [...trialBalanceItems];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.account.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      let aVal = a[sortField as keyof TrialBalanceItem];
      let bVal = b[sortField as keyof TrialBalanceItem];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return result;
  }, [trialBalanceItems, searchTerm, sortField, sortDirection]);

  // Calculations for summary cards
  const trialBalanceSums = useMemo(() => {
    let debitTotal = 0;
    let creditTotal = 0;
    let closingBalanceNet = 0;

    filteredTrialBalance.forEach((item) => {
      debitTotal += item.debit;
      creditTotal += item.credit;
      closingBalanceNet += item.closingBalance;
    });

    return { debitTotal, creditTotal, closingBalanceNet };
  }, [filteredTrialBalance]);

  // Balance Display calculations (FAGLB03 for single account)
  const balanceDisplayEntries = useMemo(() => {
    return mockGLEntries[accountNum] || [
      { postingDate: '2026-07-01', documentNum: '100000101', reference: 'OPENING', description: 'Opening Balance Ledger', debit: 12000, credit: 0, balance: 12000 }
    ];
  }, [accountNum]);

  // Profit & Loss computation (Sales starting with 4, Expense starting with 5 and 6)
  const pandLResult = useMemo(() => {
    const revenueItems = trialBalanceItems.filter(i => i.category === 'Revenue');
    const expenseItems = trialBalanceItems.filter(i => i.category === 'Expense');

    const totalRevenue = revenueItems.reduce((acc, i) => acc + Math.abs(i.closingBalance), 0);
    const totalExpense = expenseItems.reduce((acc, i) => acc + i.closingBalance, 0);
    const netProfit = totalRevenue - totalExpense;

    return { revenueItems, expenseItems, totalRevenue, totalExpense, netProfit };
  }, [trialBalanceItems]);

  // Balance Sheet computation (Assets starts with 1, Liabilities starts with 2, Equity starts with 3)
  const balanceSheetResult = useMemo(() => {
    const assets = trialBalanceItems.filter(i => i.category === 'Asset');
    const liabilities = trialBalanceItems.filter(i => i.category === 'Liability');
    const equity = trialBalanceItems.filter(i => i.category === 'Equity');

    const totalAssets = assets.reduce((acc, i) => acc + i.closingBalance, 0);
    const totalLiabilities = liabilities.reduce((acc, i) => acc + Math.abs(i.closingBalance), 0);
    const totalEquity = equity.reduce((acc, i) => acc + Math.abs(i.closingBalance), 0);

    return { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity };
  }, [trialBalanceItems]);


  // ============================================================================
  // RENDER SECTIONS
  // ============================================================================

  // ----------------------------------------------------------------------------
  // MAIN PANEL CHOOSE TILE
  // ----------------------------------------------------------------------------
  if (activeScreen === 'FIN_STATEMENTS_MAIN') {
    const subTiles = [
      { id: 'tile-tb', name: 'Trial Balance', code: 'FAGLB03', target: 'TRIAL_BALANCE_SEL' as Screen, desc: 'General ledger periodic total balances summary' },
      { id: 'tile-bd', name: 'Balance Display', code: 'FAGLB03', target: 'BALANCE_DISP_SEL' as Screen, desc: 'Monthly balance breakdown of individual G/L accounts' },
      { id: 'tile-pl', name: 'Profit & Loss Statement', code: 'F.01', target: 'PROFIT_LOSS_SEL' as Screen, desc: 'Revenue, materials and personnel expenses mapping' },
      { id: 'tile-bs', name: 'Balance Sheet', code: 'F.01', target: 'BALANCE_SHEET_SEL' as Screen, desc: 'Assets, liabilities, and retained capital structure' },
    ];

    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-sans font-bold text-[#273B5E]">Financial Statements</h2>
            <p className="text-xs text-slate-500 mt-1">Select reporting transaction module</p>
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
                    <FileText className="w-5 h-5 text-[#963F29]" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">T-Code: {tile.code}</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#273B5E] group-hover:text-[#963F29] transition-colors">{tile.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tile.desc}</p>
                </div>
              </div>
              <div className="text-[11px] font-semibold text-[#273B5E] pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span>Select Criteria</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // TRIAL BALANCE - SELECTION SCREEN
  // ----------------------------------------------------------------------------
  if (activeScreen === 'TRIAL_BALANCE_SEL') {
    return (
      <div className="p-6 max-w-xl mx-auto select-none">
        <div className="bg-white rounded-xl border border-[#D9DEE6] shadow-md overflow-hidden">
          <div className="bg-[#273B5E] text-white p-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-500" />
            <div>
              <h3 className="font-bold text-xs">TRIAL BALANCE SELECTION</h3>
              <p className="text-[10px] text-gray-300">Transaction FAGLB03 / F.01</p>
            </div>
          </div>

          <div className="p-5 space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Company Code</label>
              <select
                id="tb-sel-company"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
                className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-medium"
              >
                <option value="1900">1900 - Softclinch India (INR ₹)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fiscal Year</label>
                <input
                  id="tb-sel-year"
                  type="text"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Reporting Period</label>
                <input
                  id="tb-sel-period"
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ledger</label>
              <select
                id="tb-sel-ledger"
                value={ledger}
                onChange={(e) => setLedger(e.target.value)}
                className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-medium"
              >
                <option value="0L">0L - Standard Leading Ledger</option>
                <option value="1L">1L - Local GAAP Non-Leading</option>
              </select>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 gap-3">
              <button
                id="btn-tb-back"
                onClick={() => onNavigate('FIN_STATEMENTS_MAIN')}
                className="px-4 py-2 border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 font-medium"
              >
                Back
              </button>
              <div className="flex gap-2">
                <button
                  id="btn-tb-clear"
                  onClick={() => {
                    setCompanyCode('1000');
                    setFiscalYear('2026');
                    setPeriod('07');
                    setLedger('0L');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-medium"
                >
                  Clear
                </button>
                <button
                  id="btn-tb-display"
                  onClick={() => onNavigate('TRIAL_BALANCE_REP')}
                  className="px-5 py-2 bg-[#273B5E] hover:bg-[#3d5680] text-white rounded text-xs font-semibold flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Display Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // TRIAL BALANCE - OUTPUT REPORT SCREEN
  // ----------------------------------------------------------------------------
  if (activeScreen === 'TRIAL_BALANCE_REP') {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-sans font-bold text-[#273B5E]">Trial Balance Report</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Client: 800 | Company Code: {companyCode} | Year: {fiscalYear} | Period: {period} | Ledger: {ledger}
            </p>
          </div>
          <button
            id="btn-tb-rep-back"
            onClick={() => onNavigate('TRIAL_BALANCE_SEL')}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Selection</span>
          </button>
        </div>

        {/* Unified Button Box Metadata Grid replacing standard summary cards */}
        {(() => {
          const tbFields: ButtonBoxField[] = [
            { label: 'Company Code', value: companyCode, highlight: true, valueClass: 'text-[#273B5E]' },
            { label: 'Fiscal Year', value: fiscalYear },
            { label: 'Reporting Period', value: `Period: ${period} / 12` },
            { label: 'Standard Ledger', value: ledger === '0L' ? '0L Standard' : '1L Local GAAP' },
            { label: 'Base Currency', value: 'INR', valueClass: 'text-emerald-600' },
            { label: 'Active G/L Count', value: `${filteredTrialBalance.length} accounts` },
            { label: 'Accumulated Debit', value: `₹${(trialBalanceSums.debitTotal * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valueClass: 'text-emerald-600 font-bold' },
            { label: 'Accumulated Credit', value: `₹${(trialBalanceSums.creditTotal * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valueClass: 'text-rose-600 font-bold' },
            { label: 'Closing Net Diff', value: `₹${(trialBalanceSums.closingBalanceNet * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, highlight: true, valueClass: 'text-amber-700 font-black' }
          ];
          return (
            <OutputHeaderButtonBoxes
              fields={tbFields}
              title="TRIAL BALANCE PARAMETERS & AGGREGATIONS"
              tcode="FAGLB03"
            />
          );
        })()}

        {/* SAP Fast Data Entry Panel (exactly 2 inputs with a button) */}
        <div className="bg-[#273B5E]/5 border-2 border-[#273B5E]/30 border-l-8 border-l-[#273B5E] rounded-xl p-6 flex flex-col md:flex-row items-end gap-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex-grow space-y-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="bg-[#273B5E] text-white px-2.5 py-1 rounded text-xs font-mono tracking-wider font-extrabold uppercase">SAP Table FS00</span>
              <span className="text-xs uppercase font-black text-[#273B5E] font-mono tracking-wide">G/L Account Data Entry Block</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-slate-800 tracking-wide block uppercase">1. Enter Account Code</label>
                <input
                  type="text"
                  placeholder="e.g. 100030"
                  value={fastAccountNum}
                  onChange={(e) => setFastAccountNum(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-3 text-sm sm:text-base md:text-lg font-mono font-black text-[#273B5E] focus:outline-none focus:border-[#273B5E] focus:ring-4 focus:ring-[#273B5E]/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-slate-800 tracking-wide block uppercase">2. Enter Account Name / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Operating Supplies Reserve"
                  value={fastAccountDesc}
                  onChange={(e) => setFastAccountDesc(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-3 text-sm sm:text-base md:text-lg font-black text-[#273B5E] focus:outline-none focus:border-[#273B5E] focus:ring-4 focus:ring-[#273B5E]/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (!fastAccountNum.trim() || !fastAccountDesc.trim()) {
                triggerToast('Please fill in both inputs: Account Code and Description.');
                return;
              }
              if (trialBalanceItems.some(item => item.account === fastAccountNum.trim())) {
                triggerToast(`G/L Account ${fastAccountNum} already exists in Trial Balance!`,'warning');
                return;
              }
              const firstDigit = fastAccountNum.trim()[0];
              let cat: TrialBalanceItem['category'] = 'Asset';
              if (firstDigit === '2') cat = 'Liability';
              else if (firstDigit === '3') cat = 'Equity';
              else if (firstDigit === '4') cat = 'Revenue';
              else if (firstDigit === '5' || firstDigit === '6') cat = 'Expense';

              const newItem: TrialBalanceItem = {
                account: fastAccountNum.trim(),
                description: fastAccountDesc.trim(),
                openingBalance: 0,
                debit: 0,
                credit: 0,
                closingBalance: 0,
                category: cat
              };
              setTrialBalanceItems(prev => [...prev, newItem]);
              setFastAccountNum('');
              setFastAccountDesc('');
              triggerToast(`G/L Account ${newItem.account} successfully posted to database table.`);
            }}
            className="w-full md:w-auto px-8 py-4 bg-[#963F29] hover:bg-[#b84e32] active:bg-[#863721] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shrink-0 shadow-md hover:translate-y-[-1px] active:translate-y-[0px]"
          >
            <span>+ Insert SAP Record</span>
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-[#D9DEE6] overflow-hidden shadow-sm">
          <TableToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalRecords={filteredTrialBalance.length}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 border-b border-[#D9DEE6] text-slate-700 select-none">
                <tr>
                  <th className="p-3 font-mono">Account</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 font-mono text-center">CoCode</th>
                  <th className="p-3 font-mono text-center">Year</th>
                  <th className="p-3 font-mono text-center">Currency</th>
                  <th className="p-3 font-mono text-right">Opening Balance</th>
                  <th className="p-3 font-mono text-right">Debit</th>
                  <th className="p-3 font-mono text-right">Credit</th>
                  <th className="p-3 font-mono text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTrialBalance.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{item.account}</td>
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 font-mono text-center text-slate-500 font-medium">{companyCode}</td>
                    <td className="p-3 font-mono text-center text-slate-500 font-medium">{fiscalYear}</td>
                    <td className="p-3 font-mono text-center text-emerald-600 font-bold">INR</td>
                    <td className="p-3 font-mono text-right">₹{(item.openingBalance * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 font-mono text-right text-emerald-600">₹{(item.debit * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 font-mono text-right text-rose-600">₹{(item.credit * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 font-mono text-right font-bold text-slate-900">
                      ₹{(item.closingBalance * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
  // BALANCE DISPLAY - SELECTION SCREEN (FAGLB03)
  // ----------------------------------------------------------------------------
  if (activeScreen === 'BALANCE_DISP_SEL') {
    return (
      <div className="p-6 max-w-xl mx-auto select-none">
        <div className="bg-white rounded-xl border border-[#D9DEE6] shadow-md overflow-hidden">
          <div className="bg-[#273B5E] text-white p-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <div>
              <h3 className="font-bold text-xs">G/L ACCOUNT BALANCE SELECTION</h3>
              <p className="text-[10px] text-gray-300">Transaction FAGLB03</p>
            </div>
          </div>

          <div className="p-5 space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">G/L Account Number</label>
              <select
                id="bd-sel-account"
                value={accountNum}
                onChange={(e) => setAccountNum(e.target.value)}
                className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-mono font-bold"
              >
                <option value="100010">100010 - Petty Cash Account</option>
                <option value="140000">140000 - Accounts Receivable Generic</option>
                <option value="210000">210000 - Accounts Payable Generic</option>
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
                id="btn-bd-back"
                onClick={() => onNavigate('FIN_STATEMENTS_MAIN')}
                className="px-4 py-2 border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 font-medium"
              >
                Back
              </button>
              <button
                id="btn-bd-display"
                onClick={() => onNavigate('BALANCE_DISP_REP')}
                className="px-5 py-2 bg-[#273B5E] hover:bg-[#3d5680] text-white rounded text-xs font-semibold flex items-center gap-1"
              >
                <span>Display Account Balances</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // BALANCE DISPLAY - OUTPUT SCREEN
  // ----------------------------------------------------------------------------
  if (activeScreen === 'BALANCE_DISP_REP') {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-sans font-bold text-[#273B5E]">Balance Display Report</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Account: {accountNum} | Company Code: {companyCode} | Year: {fiscalYear}
            </p>
          </div>
          <button
            id="btn-bd-rep-back"
            onClick={() => onNavigate('BALANCE_DISP_SEL')}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Selection Screen</span>
          </button>
        </div>

        {/* Unified Button Box Metadata Grid */}
        {(() => {
          const bdFields: ButtonBoxField[] = [
            { label: 'G/L Account', value: accountNum, highlight: true, valueClass: 'text-[#963F29]' },
            { label: 'Account Category', value: accountNum === '100010' ? 'Asset (Petty Cash)' : accountNum === '140000' ? 'Asset (AR General)' : 'Liability (AP General)' },
            { label: 'Company Code', value: companyCode },
            { label: 'Fiscal Year', value: fiscalYear },
            { label: 'Ledger Book', value: '0L (Leading)' },
            { label: 'Posted Postings', value: `${balanceDisplayEntries.length} Items`, valueClass: 'text-[#273B5E]' },
            { label: 'Base Currency', value: 'INR', valueClass: 'text-emerald-600' },
            { label: 'Current Balance', value: `₹${(balanceDisplayEntries.reduce((acc, e) => acc + (e.debit - e.credit), 0) * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valueClass: 'text-emerald-600 font-bold' },
            { label: 'SAP Client', value: '800', badge: 'SYS: S4P' }
          ];
          return (
            <OutputHeaderButtonBoxes
              fields={bdFields}
              title="G/L SINGLE ACCOUNT CONTEXT MATRIX"
              tcode="FAGLB03"
            />
          );
        })()}

        {/* Interactive Period Table */}
        <div className="bg-white rounded-lg border border-[#D9DEE6] overflow-hidden shadow-sm">
          <TableToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalRecords={balanceDisplayEntries.length}
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
                  <th className="p-3">Posting Text</th>
                  <th className="p-3 text-right font-mono">Debit Amount</th>
                  <th className="p-3 text-right font-mono">Credit Amount</th>
                  <th className="p-3 text-right font-mono">Balance Carryforward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {balanceDisplayEntries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3">{entry.postingDate}</td>
                    <td className="p-3 font-mono text-[#963F29] font-semibold">{entry.documentNum}</td>
                    <td className="p-3 font-mono">{entry.reference}</td>
                    <td className="p-3 font-mono text-center text-slate-500 font-medium">{companyCode}</td>
                    <td className="p-3 font-mono text-center text-slate-500 font-medium">{fiscalYear}</td>
                    <td className="p-3 font-medium text-slate-800">{entry.description}</td>
                    <td className="p-3 text-right text-emerald-600 font-mono font-medium">
                      {entry.debit > 0 ? `₹${(entry.debit * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="p-3 text-right text-rose-600 font-mono font-medium">
                      {entry.credit > 0 ? `₹${(entry.credit * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
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
  // PROFIT & LOSS - SELECTION SCREEN
  // ----------------------------------------------------------------------------
  if (activeScreen === 'PROFIT_LOSS_SEL') {
    return (
      <div className="p-6 max-w-xl mx-auto select-none">
        <div className="bg-white rounded-xl border border-[#D9DEE6] shadow-md overflow-hidden">
          <div className="bg-[#273B5E] text-white p-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-500" />
            <div>
              <h3 className="font-bold text-xs">PROFIT & LOSS SELECTION</h3>
              <p className="text-[10px] text-gray-300">Transaction F.01 Financial Statement Version</p>
            </div>
          </div>

          <div className="p-5 space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Company Code</label>
              <input
                type="text"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
                className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fiscal Year</label>
                <input
                  type="text"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Reporting Period</label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 gap-3">
              <button
                id="btn-pl-back"
                onClick={() => onNavigate('FIN_STATEMENTS_MAIN')}
                className="px-4 py-2 border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 font-medium"
              >
                Back
              </button>
              <button
                id="btn-pl-display"
                onClick={() => onNavigate('PROFIT_LOSS_REP')}
                className="px-5 py-2 bg-[#273B5E] hover:bg-[#3d5680] text-white rounded text-xs font-semibold flex items-center gap-1"
              >
                <span>Generate P&L Statement</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // PROFIT & LOSS - OUTPUT SCREEN
  // ----------------------------------------------------------------------------
  if (activeScreen === 'PROFIT_LOSS_REP') {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-sans font-bold text-[#273B5E]">Profit & Loss Statement (F.01)</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Company Code: {companyCode} | Year: {fiscalYear} | Period: {period}
            </p>
          </div>
          <button
            id="btn-pl-rep-back"
            onClick={() => onNavigate('PROFIT_LOSS_SEL')}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Selection Screen</span>
          </button>
        </div>

        {/* Unified Button Box Metadata Grid replacing standard summary cards */}
        {(() => {
          const plFields: ButtonBoxField[] = [
            { label: 'Company Code', value: companyCode, highlight: true, valueClass: 'text-[#273B5E]' },
            { label: 'Fiscal Year', value: fiscalYear },
            { label: 'Reporting Period', value: `Period 01 - ${period}` },
            { label: 'Gross Revenue', value: `₹${(pandLResult.totalRevenue * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valueClass: 'text-emerald-600 font-bold' },
            { label: 'Operating Expenses', value: `₹${(pandLResult.totalExpense * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valueClass: 'text-rose-600 font-bold' },
            { label: 'Est Corporate Tax', value: '30% Stat Rate' },
            { label: 'Net Corp Profit', value: `₹${(pandLResult.netProfit * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, highlight: true, valueClass: 'text-emerald-600 font-black' },
            { label: 'Base Currency', value: 'INR', valueClass: 'text-emerald-600' },
            { label: 'SAP Client', value: '800', badge: 'SYS: S4P' }
          ];
          return (
            <OutputHeaderButtonBoxes
              fields={plFields}
              title="PROFIT & LOSS STATEMENT AGGREGATIONS"
              tcode="F.01"
            />
          );
        })()}

        {/* Revenue / Expense Node display */}
        <div className="bg-white rounded-lg border border-[#D9DEE6] overflow-hidden p-5 space-y-6">
          {/* Revenue Node */}
          <div>
            <h4 className="font-bold text-[#273B5E] text-xs uppercase border-b border-slate-200 pb-1.5 mb-3 flex justify-between">
              <span>REVENUE FROM COMMERCIAL OPERATIONS</span>
              <span className="font-mono text-emerald-600">₹{(pandLResult.totalRevenue * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </h4>
            <div className="space-y-2 text-xs">
              {pandLResult.revenueItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded hover:bg-slate-100/60 font-mono">
                  <div>
                    <span className="font-bold text-slate-800 mr-2">{item.account}</span>
                    <span className="text-slate-600 font-sans">{item.description}</span>
                  </div>
                  <span className="font-bold text-slate-900">₹{(Math.abs(item.closingBalance) * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expenses Node */}
          <div>
            <h4 className="font-bold text-[#273B5E] text-xs uppercase border-b border-slate-200 pb-1.5 mb-3 flex justify-between">
              <span>OPERATING EXPENDITURES</span>
              <span className="font-mono text-rose-600">-₹{(pandLResult.totalExpense * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </h4>
            <div className="space-y-2 text-xs">
              {pandLResult.expenseItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded hover:bg-slate-100/60 font-mono">
                  <div>
                    <span className="font-bold text-slate-800 mr-2">{item.account}</span>
                    <span className="text-slate-600 font-sans">{item.description}</span>
                  </div>
                  <span className="font-bold text-slate-900">₹{(item.closingBalance * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // BALANCE SHEET - SELECTION SCREEN
  // ----------------------------------------------------------------------------
  if (activeScreen === 'BALANCE_SHEET_SEL') {
    return (
      <div className="p-6 max-w-xl mx-auto select-none">
        <div className="bg-white rounded-xl border border-[#D9DEE6] shadow-md overflow-hidden">
          <div className="bg-[#273B5E] text-white p-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <div>
              <h3 className="font-bold text-xs">BALANCE SHEET SELECTION</h3>
              <p className="text-[10px] text-gray-300">Transaction F.01 Reporting</p>
            </div>
          </div>

          <div className="p-5 space-y-4 text-xs font-sans">
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
                id="btn-bs-back"
                onClick={() => onNavigate('FIN_STATEMENTS_MAIN')}
                className="px-4 py-2 border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 font-medium"
              >
                Back
              </button>
              <button
                id="btn-bs-display"
                onClick={() => onNavigate('BALANCE_SHEET_REP')}
                className="px-5 py-2 bg-[#273B5E] hover:bg-[#3d5680] text-white rounded text-xs font-semibold flex items-center gap-1"
              >
                <span>Display Balance Sheet</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // BALANCE SHEET - OUTPUT SCREEN
  // ----------------------------------------------------------------------------
  if (activeScreen === 'BALANCE_SHEET_REP') {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-sans font-bold text-[#273B5E]">Corporate Balance Sheet (F.01)</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Company Code: {companyCode} | Reporting Year: {fiscalYear}
            </p>
          </div>
          <button
            id="btn-bs-rep-back"
            onClick={() => onNavigate('BALANCE_SHEET_SEL')}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Selection Screen</span>
          </button>
        </div>

        {/* Unified Button Box Metadata Grid */}
        {(() => {
          const bsFields: ButtonBoxField[] = [
            { label: 'Company Code', value: companyCode, highlight: true, valueClass: 'text-[#273B5E]' },
            { label: 'Fiscal Year', value: fiscalYear },
            { label: 'Ledger Book', value: '0L (Leading Ledger)' },
            { label: 'Total Assets', value: `₹${(balanceSheetResult.totalAssets * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valueClass: 'text-emerald-600 font-bold' },
            { label: 'Total Liabilities', value: `₹${(balanceSheetResult.totalLiabilities * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valueClass: 'text-rose-600 font-bold' },
            { label: 'Equity capital', value: `₹${(balanceSheetResult.totalEquity * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valueClass: 'text-amber-700 font-semibold' },
            { label: 'Equation Status', value: 'Assets = Liab + Eq', badge: 'BALANCED', valueClass: 'text-emerald-600 font-bold' },
            { label: 'Base Currency', value: 'INR', valueClass: 'text-emerald-600' },
            { label: 'SAP Client', value: '800', badge: 'SYS: S4P' }
          ];
          return (
            <OutputHeaderButtonBoxes
              fields={bsFields}
              title="CORPORATE BALANCE SHEET PARAMETERS & EQUATIONS"
              tcode="F.01"
            />
          );
        })()}

        {/* Balance Sheet Bento layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ASSETS */}
          <div className="bg-white rounded-xl border border-[#D9DEE6] p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#273B5E] border-b border-slate-200 pb-2 flex justify-between">
              <span>ASSETS (ACTIVE)</span>
              <span className="font-mono text-emerald-600">₹{(balanceSheetResult.totalAssets * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </h3>

            <div className="space-y-2 text-xs">
              {balanceSheetResult.assets.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded font-mono">
                  <div>
                    <span className="font-bold text-slate-800 mr-2">{item.account}</span>
                    <span className="text-slate-600 font-sans">{item.description}</span>
                  </div>
                  <span className="font-bold text-slate-900">₹{(item.closingBalance * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LIABILITIES & CAPITAL */}
          <div className="bg-white rounded-xl border border-[#D9DEE6] p-5 shadow-sm space-y-6">
            {/* Liabilities */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#273B5E] border-b border-slate-200 pb-2 flex justify-between">
                <span>LIABILITIES (PASSIVE)</span>
                <span className="font-mono text-rose-600">₹{(balanceSheetResult.totalLiabilities * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </h3>

              <div className="space-y-2 text-xs mt-3">
                {balanceSheetResult.liabilities.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded font-mono">
                    <div>
                      <span className="font-bold text-slate-800 mr-2">{item.account}</span>
                      <span className="text-slate-600 font-sans">{item.description}</span>
                    </div>
                    <span className="font-bold text-slate-900">₹{(Math.abs(item.closingBalance) * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Equity */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#273B5E] border-b border-slate-200 pb-2 flex justify-between">
                <span>EQUITY & RESERVES</span>
                <span className="font-mono text-[#963F29]">₹{(balanceSheetResult.totalEquity * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </h3>

              <div className="space-y-2 text-xs mt-3">
                {balanceSheetResult.equity.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded font-mono">
                    <div>
                      <span className="font-bold text-slate-800 mr-2">{item.account}</span>
                      <span className="text-slate-600 font-sans">{item.description}</span>
                    </div>
                    <span className="font-bold text-slate-900">₹{(Math.abs(item.closingBalance) * 83).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
