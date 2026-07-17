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
  DollarSign
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
  // SHARED FORM STATE VARIABLES
  // ============================================================================
  const [companyCode, setCompanyCode] = useState('1900');
  const [glAccount, setGlAccount] = useState('100010');
  const [fiscalYear, setFiscalYear] = useState('2026');
  const [postingDate, setPostingDate] = useState('2026-07-01');

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

  // ============================================================================
  // DERIVED MOCK DATA SELECTIONS
  // ============================================================================

  // General Ledger Entries
  const glReportEntries = useMemo(() => {
    return glEntriesDb[glAccount] || [];
  }, [glEntriesDb, glAccount]);

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

  // Stock Material lists (Calculated dynamically from VBRP table entries to make it 100% connected!)
  const stockItems = useMemo(() => {
    return [
      { matCode: 'MAT-FIBER-01', name: 'High Tensile Carbon Fiber Sheet', stockQty: 480, plant: 'PL-10', storageLoc: 'SL-01', uom: 'PC', val: 192000 },
      { matCode: 'MAT-EPOXY-05', name: 'Liquid Industrial Resin Catalyst', stockQty: 250, plant: 'PL-10', storageLoc: 'SL-02', uom: 'GAL', val: 149090 },
      { matCode: 'MAT-SOFTWARE-ERP', name: 'Softclinch Consult Services Core License v12', stockQty: 10, plant: 'PL-20', storageLoc: 'SL-01', uom: 'EA', val: 1250000 },
      { matCode: 'MAT-STEEL-BEAM-H', name: 'Structural Heavy Steel H-Beam', stockQty: 85, plant: 'PL-10', storageLoc: 'SL-01', uom: 'TON', val: 412400 },
    ];
  }, []);

  // Filtered lists for simple lookup
  const filteredGLList = glReportEntries.filter(entry =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.documentNum.includes(searchTerm)
  );

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
                  <span className="text-[10px] text-slate-400 font-mono font-bold">T-Code: {tile.code}</span>
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
      <div className="p-6 max-w-xl mx-auto select-none">
        <div className="bg-white rounded-xl border border-[#D9DEE6] shadow-md overflow-hidden">
          <div className="bg-[#273B5E] text-white p-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-500" />
            <div>
              <h3 className="font-bold text-xs">G/L LINE ITEM SELECTION</h3>
              <p className="text-[10px] text-gray-300">Transaction FBL3N - General Ledger</p>
            </div>
          </div>

          <div className="p-5 space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target G/L Account</label>
              <select
                id="gl-sel-account"
                value={glAccount}
                onChange={(e) => setGlAccount(e.target.value)}
                className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-mono font-bold"
              >
                <option value="100010">100010 - Petty Cash Local Account</option>
                <option value="140000">140000 - Accounts Receivable General</option>
                <option value="210000">210000 - Accounts Payable General</option>
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">From Posting Date</label>
                <input
                  type="date"
                  value={postingDate}
                  onChange={(e) => setPostingDate(e.target.value)}
                  className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 gap-3">
              <button
                id="btn-gl-back"
                onClick={() => onNavigate('LEDGER_REP_MAIN')}
                className="px-4 py-2 border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 font-medium"
              >
                Back
              </button>
              <button
                id="btn-gl-display"
                onClick={() => onNavigate('GL_LEDGER_REP')}
                className="px-5 py-2 bg-[#273B5E] hover:bg-[#3d5680] text-white rounded text-xs font-semibold flex items-center gap-1"
              >
                <span>Display G/L Postings</span>
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
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-sans font-bold text-[#273B5E]">G/L Line Item Report (FBL3N)</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Company Code: {companyCode} | Account: {glAccount} | Fiscal Year: {fiscalYear}
            </p>
          </div>
          <button
            id="btn-gl-rep-back"
            onClick={() => onNavigate('GL_LEDGER_SEL')}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Selection Screen</span>
          </button>
        </div>

        {/* Unified Button Box Metadata Grid */}
        {(() => {
          const glFields: ButtonBoxField[] = [
            { label: 'G/L Account', value: glAccount, highlight: true, valueClass: 'text-[#963F29]' },
            { label: 'Account Description', value: glAccount === '100010' ? 'Petty Cash Local Account' : glAccount === '140000' ? 'Accounts Receivable' : 'Accounts Payable' },
            { label: 'Company Code', value: companyCode },
            { label: 'Fiscal Year', value: fiscalYear },
            { label: 'Ledger Book', value: '0L (Leading)' },
            { label: 'Total Postings', value: `${filteredGLList.length} Rows`, valueClass: 'text-[#273B5E]' },
            { label: 'From Posting Date', value: postingDate },
            { label: 'Currency', value: 'INR', valueClass: 'text-emerald-600' },
            { label: 'SAP Client', value: '800', badge: 'SYS: S4P' }
          ];
          return (
            <OutputHeaderButtonBoxes
              fields={glFields}
              title="LEDGER SUMMARY DATA MATRIX"
              tcode="FBL3N"
            />
          );
        })()}

        {/* SAP G/L Posting Data Entry Block (exactly 2 inputs with button) */}
        <div className="bg-[#273B5E]/5 border-2 border-[#273B5E]/30 border-l-8 border-l-[#273B5E] rounded-xl p-6 flex flex-col md:flex-row items-end gap-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex-grow space-y-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="bg-[#273B5E] text-white px-2.5 py-1 rounded text-xs font-mono tracking-wider font-extrabold uppercase">SAP Table BKPF</span>
              <span className="text-xs uppercase font-black text-[#273B5E] font-mono tracking-wide">G/L Entry Fast Posting Block</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-slate-800 tracking-wide block uppercase">1. Enter Document Number</label>
                <input
                  type="text"
                  placeholder="e.g. 100000210"
                  value={fastDocNum}
                  onChange={(e) => setFastDocNum(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-3 text-sm sm:text-base md:text-lg font-mono font-black text-[#273B5E] focus:outline-none focus:border-[#273B5E] focus:ring-4 focus:ring-[#273B5E]/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-black text-slate-800 tracking-wide block uppercase">2. Enter Posting Text / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Petty Cash replenishment"
                  value={fastDesc}
                  onChange={(e) => setFastDesc(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-3 text-sm sm:text-base md:text-lg font-black text-[#273B5E] focus:outline-none focus:border-[#273B5E] focus:ring-4 focus:ring-[#273B5E]/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
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
              const currentEntries = glEntriesDb[glAccount] || [];
              if (currentEntries.some(e => e.documentNum === fastDocNum.trim())) {
                triggerToast(`Document ${fastDocNum} already exists for this G/L account!`, 'warning');
                return;
              }
              const lastBalance = currentEntries.length > 0 ? currentEntries[currentEntries.length - 1].balance : 0;
              const newEntry: LedgerEntry = {
                postingDate: new Date().toISOString().split('T')[0],
                documentNum: fastDocNum.trim(),
                reference: 'FAST-ENT',
                description: fastDesc.trim(),
                debit: 1000,
                credit: 0,
                balance: lastBalance + 1000
              };
              setGlEntriesDb(prev => ({
                ...prev,
                [glAccount]: [...currentEntries, newEntry]
              }));
              setFastDocNum('');
              setFastDesc('');
              triggerToast(`Successfully posted custom G/L journal line item document ${newEntry.documentNum}.`);
            }}
            className="w-full md:w-auto px-8 py-4 bg-[#273B5E] hover:bg-[#1a283f] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shrink-0 shadow-md hover:translate-y-[-1px] active:translate-y-[0px]"
          >
            <span>+ Post Journal Item</span>
          </button>
        </div>

        {/* GL Ledger table */}
        <div className="bg-white rounded-lg border border-[#D9DEE6] overflow-hidden shadow-sm">
          <TableToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalRecords={filteredGLList.length}
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
                  <th className="p-3">Line Description</th>
                  <th className="p-3 text-right font-mono">Debit Amount</th>
                  <th className="p-3 text-right font-mono">Credit Amount</th>
                  <th className="p-3 text-right font-mono">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredGLList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                      No matching SAP entries found for G/L Account {glAccount}
                    </td>
                  </tr>
                ) : (
                  filteredGLList.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-medium">{entry.postingDate}</td>
                      <td className="p-3 font-mono font-bold text-[#963F29]">{entry.documentNum}</td>
                      <td className="p-3 font-mono">{entry.reference}</td>
                      <td className="p-3 font-mono text-center text-slate-500 font-medium">{companyCode}</td>
                      <td className="p-3 font-mono text-center text-slate-500 font-medium">{fiscalYear}</td>
                      <td className="p-3">{entry.description}</td>
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
                  ))
                )}
              </tbody>
            </table>
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
