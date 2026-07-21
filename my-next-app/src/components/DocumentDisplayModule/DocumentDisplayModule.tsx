import React, { useState, useMemo } from 'react';
import { Screen, BKPF, BSEG, VBRK, VBRP, KNA1 } from '../../types';
import {
  dbBKPF,
  dbBSEG,
  dbVBRK,
  dbVBRP,
  dbKNA1,
  dbLFA1
} from '../../data/sapMockData';
import { TableToolbar, OutputHeaderButtonBoxes, ButtonBoxField } from '../CommonUI/CommonUI';
import {
  Receipt,
  ArrowLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Search,
  BookOpen,
  Info,
  Layers,
  Database,
  Truck,
  FileText,
  X
} from 'lucide-react';

interface DocumentDisplayModuleProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  triggerToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export interface IndianInvoiceItem {
  docNo: string;
  netValue: number;
  material: string;
  quantity: number;
  itemNo: string;
  pcCc: string;
  tax: number;
  salesOffice: string;
  customerName: string;
  customerGstin: string;
  customerState: string;
}

const initialIndianInvoices: IndianInvoiceItem[] = [
  {
    docNo: '1800091001',
    netValue: 1250000,
    material: 'Mild Steel Plates (IS 2062)',
    quantity: 50,
    itemNo: '10',
    pcCc: 'PC-MUM-01',
    tax: 225000,
    salesOffice: 'Mumbai (IN-WEST)',
    customerName: 'Tata Steel Processing Ltd',
    customerGstin: '27AACCT4567M1Z2',
    customerState: 'Maharashtra'
  },
  {
    docNo: '1800091002',
    netValue: 820000,
    material: 'Copper Wire Rods 8mm',
    quantity: 2000,
    itemNo: '20',
    pcCc: 'PC-BLR-02',
    tax: 147600,
    salesOffice: 'Bengaluru (IN-SOUTH)',
    customerName: 'Kirloskar Electric Co',
    customerGstin: '29AABCK1234F2Z4',
    customerState: 'Karnataka'
  },
  {
    docNo: '1800091003',
    netValue: 1500000,
    material: 'Heavy Grade Industrial Solvents',
    quantity: 30,
    itemNo: '10',
    pcCc: 'CC-DEL-04',
    tax: 270000,
    salesOffice: 'New Delhi (IN-NORTH)',
    customerName: 'Reliance Chemicals Pvt Ltd',
    customerGstin: '07AAACR7890N2Z9',
    customerState: 'Delhi'
  }
];

export const DocumentDisplayModule: React.FC<DocumentDisplayModuleProps> = ({
  activeScreen,
  onNavigate,
  triggerToast
}) => {
  // ============================================================================
  // DATABASE LOCALIZATION CONTEXT & LOCAL STATES
  // ============================================================================
  const [isIndianDb, setIsIndianDb] = useState(true);
  const [indianInvoices, setIndianInvoices] = useState<IndianInvoiceItem[]>(initialIndianInvoices);
  const [fastIndianDocNum, setFastIndianDocNum] = useState('');
  const [fastIndianDesc, setFastIndianDesc] = useState('');

  // ============================================================================
  // FORM STATE SELECTIONS
  // ============================================================================
  const [billingDocNumber, setBillingDocNumber] = useState(''); // Billing Doc ref for FB03
  const [docNumber, setDocNumber] = useState('1800091001'); // Default to Indian Customer Invoice
  const [companyCode, setCompanyCode] = useState('1900');
  const [fiscalYear, setFiscalYear] = useState('2026');
  const [reference, setReference] = useState('');

  const [invoiceNumber, setInvoiceNumber] = useState('1800091001'); // Default to Indian Invoice
  const [vf03DocNum, setVf03DocNum] = useState(''); // Document Number for VF03 screen
  const [billingCompanyCode, setBillingCompanyCode] = useState('1900');
  const [billingFiscalYear, setBillingFiscalYear] = useState('2026');
  const [billingReference, setBillingReference] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState('');

  // ============================================================================
  // SEARCH LOOKUP COMPUTATIONS (REAL FB03 & VF03 LINKED DATA)
  // ============================================================================

  // FB03 (Financial Document BKPF & BSEG split)
  const activeBKPF = useMemo(() => {
    return dbBKPF.find(
      (h) =>
        h.BELNR === docNumber.trim() &&
        h.BUKRS === companyCode.trim() &&
        (!fiscalYear.trim() || h.GJAHR === fiscalYear.trim())
    );
  }, [docNumber, companyCode, fiscalYear]);

  const activeBSEGItems = useMemo(() => {
    if (!activeBKPF) return [];
    return dbBSEG.filter(
      (item) =>
        item.BELNR === activeBKPF.BELNR &&
        item.BUKRS === activeBKPF.BUKRS &&
        item.GJAHR === activeBKPF.GJAHR
    );
  }, [activeBKPF]);

  // Calculations for debit and credit totals
  const bkpfSums = useMemo(() => {
    let debit = 0;
    let credit = 0;
    activeBSEGItems.forEach((item) => {
      if (item.SHKZG === 'S') debit += item.WRBTR;
      if (item.SHKZG === 'H') credit += item.WRBTR;
    });
    return { debit, credit };
  }, [activeBSEGItems]);


  // VF03 (Billing Document Invoice VBRK & VBRP split)
  const activeVBRK = useMemo(() => {
    return dbVBRK.find((i) => i.VBELN === invoiceNumber.trim());
  }, [invoiceNumber]);

  const activeVBRPItems = useMemo(() => {
    if (!activeVBRK) return [];
    return dbVBRP.filter((item) => item.VBELN === activeVBRK.VBELN);
  }, [activeVBRK]);

  const activeInvoiceCustomer = useMemo(() => {
    if (!activeVBRK) return null;
    return dbKNA1.find((c) => c.KUNNR === activeVBRK.KUNRG) || dbKNA1[0];
  }, [activeVBRK]);

  // Indian localized lookup
  const activeIndianInvoice = useMemo(() => {
    return indianInvoices.find((i) => i.docNo === invoiceNumber.trim());
  }, [invoiceNumber, indianInvoices]);

  const filteredIndianInvoices = useMemo(() => {
    if (!searchTerm.trim()) return indianInvoices;
    const term = searchTerm.toLowerCase();
    return indianInvoices.filter(
      (i) =>
        i.docNo.toLowerCase().includes(term) ||
        i.material.toLowerCase().includes(term) ||
        i.customerName.toLowerCase().includes(term) ||
        i.salesOffice.toLowerCase().includes(term)
    );
  }, [searchTerm, indianInvoices]);


  // Mock Purchase Order List for pro-grade PO display
  const mockPurchaseOrders = useMemo(() => {
    return [
      { poNum: '4500012901', vendor: 'SteelMill Inc & Metallurgy Corp', date: '2026-06-28', buyer: 'M_VANCE', material: 'Structural Heavy Steel H-Beam', qty: 25, unit: 'TON', amount: 125000, status: 'Released / Fully Invoiced' },
      { poNum: '4500012902', vendor: 'Nippon Carbon Components Ltd', date: '2026-07-02', buyer: 'T_ALBERS', material: 'High Tensile Carbon Fiber Sheet', qty: 100, unit: 'PC', amount: 40000, status: 'Goods Receipt Posted' },
    ];
  }, []);

  // Export actions
  // ============================================================================
  // RENDERING LOGIC
  // ============================================================================

  // ----------------------------------------------------------------------------
  // MODULE MAIN HUB
  // ----------------------------------------------------------------------------
  if (activeScreen === 'DOC_DISPLAY_MAIN') {
    const subTiles = [
      { id: 'tile-fb03', name: 'Display Financial Document', code: 'FB03', target: 'FIN_DOC_SEL' as Screen, desc: 'Audit journal ledger entries, debits/credits and cost distributions' },
      { id: 'tile-vf03', name: 'Display Billing Invoice', code: 'VF03', target: 'INVOICE_SEL' as Screen, desc: 'View customer billing, quantities sold, taxes, and customer addresses' },
      { id: 'tile-po', name: 'Purchase Order Registry', code: 'ME23N', target: 'PO_REP' as Screen, desc: 'Display physical commitments, buyer activities, and procurement values' },
    ];

    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-sans font-bold text-[#273B5E]">Document Display Hub</h2>
            <p className="text-xs text-slate-500 mt-1">Review ledger documents and transaction segments</p>
          </div>
          <button
            onClick={() => onNavigate('DASHBOARD')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Gateway Back</span>
          </button>
        </div>

        {/* Database Localization Context Panel */}
        <div className="bg-orange-500/5 border-2 border-orange-500/30 border-l-8 border-l-orange-500 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white border-2 border-orange-500/20 text-orange-600 rounded-lg shadow-sm">
              <Database className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-500 font-mono block tracking-wider uppercase">SAP Database Localization Context</span>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                🇮🇳 Indian Localization DB (INR ₹)
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm select-none">
              India Region Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subTiles.map((tile) => (
            <div
              id={tile.id}
              key={tile.id}
              onClick={() => onNavigate(tile.target)}
              className="bg-white rounded-xl border border-[#D9DEE6] p-5 shadow-sm hover:shadow-md hover:border-[#273B5E] transition-all cursor-pointer group flex flex-col justify-between border-l-4 border-l-[#273B5E]"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="p-2 bg-slate-50 text-[#273B5E] rounded-lg">
                    <Receipt className="w-5 h-5 text-[#963F29]" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">T-Code: {tile.code}</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#273B5E] group-hover:text-[#963F29] transition-colors">{tile.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tile.desc}</p>
                </div>
              </div>
              <div className="text-[11px] font-semibold text-[#273B5E] pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span>Display Document</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // FB03 FINANCIAL DOCUMENT - INPUT SELECTION SCREEN
  // ----------------------------------------------------------------------------
  if (activeScreen === 'FIN_DOC_SEL' || activeScreen === 'FIN_DOC_REP') {
    return (
      <>
        <div className="p-6 max-w-xl mx-auto select-none">
          <div className="bg-white rounded-xl border border-[#D9DEE6] shadow-md overflow-hidden">
            <div className="bg-[#273B5E] text-white p-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-500" />
              <div>
                <h3 className="font-bold text-xs">DISPLAY FINANCIAL DOCUMENT SELECTION</h3>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs font-sans">
              {formError && (
                <div className="p-3 bg-rose-50 text-[#963F29] border border-rose-200 rounded text-xs leading-relaxed font-sans font-semibold">
                  ⚠️ {formError}
                </div>
              )}

              {/* Field 1: Document Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Document Number <span className="text-[#963F29] font-black">*</span>
                </label>
                <input
                  id="fb03-sel-num"
                  type="text"
                  placeholder="e.g. 1800091001"
                  value={docNumber}
                  onChange={(e) => {
                    setDocNumber(e.target.value);
                    setFormError('');
                  }}
                  className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2.5 text-xs font-mono font-bold"
                />
              </div>

              {/* Fields 2 & 3: Company Code + Fiscal Year */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Company Code <span className="text-[#963F29] font-black">*</span>
                  </label>
                  <input
                    id="fb03-sel-company"
                    type="text"
                    placeholder="e.g. 1900"
                    value={companyCode}
                    onChange={(e) => {
                      setCompanyCode(e.target.value);
                      setFormError('');
                    }}
                    className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Fiscal Year <span className="text-slate-400 font-medium">(Optional)</span>
                  </label>
                  <input
                    id="fb03-sel-year"
                    type="text"
                    placeholder="e.g. 2026"
                    value={fiscalYear}
                    onChange={(e) => {
                      setFiscalYear(e.target.value);
                      setFormError('');
                    }}
                    className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 gap-3">
                <button
                  id="btn-fb03-back"
                  onClick={() => onNavigate('DOC_DISPLAY_MAIN')}
                  className="px-4 py-2 border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Back
                </button>
                <div className="flex gap-2">
                  <button
                    id="btn-fb03-clear"
                    onClick={() => {
                      setBillingDocNumber('');
                      setDocNumber('');
                      setCompanyCode('1900');
                      setFiscalYear('');
                      setReference('');
                      setFormError('');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-medium"
                  >
                    Clear
                  </button>
                  <button
                    id="btn-fb03-display"
                    onClick={() => {
                      if (!docNumber.trim()) {
                        setFormError('Document Number is required.');
                        return;
                      }
                      if (!companyCode.trim()) {
                        setFormError('Company Code is required.');
                        return;
                      }

                      if (isIndianDb) {
                        const matchedIn = indianInvoices.find((i) => i.docNo === docNumber.trim());
                        if (!matchedIn) {
                          setFormError(`Accounting Document ${docNumber} not found in Indian localization database. Try e.g. 1800091001, 1800091002, or 1800091003.`);
                          return;
                        }
                        onNavigate('FIN_DOC_REP');
                        return;
                      }
                      const matched = dbBKPF.find(
                        (h) =>
                          h.BELNR === docNumber.trim() &&
                          h.BUKRS === companyCode.trim() &&
                          (!fiscalYear.trim() || h.GJAHR === fiscalYear.trim())
                      );
                      if (!matched) {
                        setFormError(
                          fiscalYear.trim()
                            ? `Accounting Document ${docNumber} not found in SAP BKPF table for BUKRS ${companyCode} / Year ${fiscalYear}.`
                            : `Accounting Document ${docNumber} not found in SAP BKPF table for BUKRS ${companyCode}.`
                        );
                        return;
                      }
                      onNavigate('FIN_DOC_REP');
                    }}
                    className="px-5 py-2 bg-[#273B5E] hover:bg-[#3d5680] text-white rounded text-xs font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Financial Display</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Overlay for Report Details */}
        {activeScreen === 'FIN_DOC_REP' && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative border border-slate-200">
              <button
                onClick={() => onNavigate('FIN_DOC_SEL')}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-50"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {isIndianDb ? (() => {
                const selectedIndianInvoice = indianInvoices.find((i) => i.docNo === docNumber.trim()) || indianInvoices[0];
                if (!selectedIndianInvoice) {
                  return (
                    <div className="p-6 text-center select-none font-sans">
                      <p className="text-slate-500 text-xs">Error loading Indian localized financial document.</p>
                      <button onClick={() => onNavigate('FIN_DOC_SEL')} className="bg-slate-800 text-white px-4 py-2 text-xs rounded mt-3">Back</button>
                    </div>
                  );
                }

                return (
                  <div className="p-6 space-y-6 select-none animate-fade-in">
                    {/* Header navigation bar */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b-2 border-orange-200 pb-4 pr-10 sm:pr-12">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-[#273B5E]" />
                          <h2 className="text-lg font-sans font-black text-[#273B5E]">Financial Document Details</h2>
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('FIN_DOC_SEL')}
                        className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-orange-200 rounded-lg text-xs text-orange-750 hover:bg-orange-50 font-black transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Document Selection</span>
                      </button>
                    </div>

                    <div>
                      {(() => {
                        const fbFields: ButtonBoxField[] = [
                          { label: 'Document Number', value: selectedIndianInvoice.docNo, highlight: true, valueClass: 'text-orange-700 font-black' },
                          { label: 'Company Code', value: '1900 (IN)' },
                          { label: 'Customer ID', value: 'CUST-IN-401', valueClass: 'text-amber-700 font-bold' },
                          { label: 'Doc Date', value: '2026-07-15' },
                          { label: 'Posting Date', value: '2026-07-15' },
                          { label: 'Period', value: '07' },
                          { label: 'Reference', value: 'REF-IN-91001' },
                          { label: 'Currency', value: 'INR (Rupee)', valueClass: 'text-emerald-700 font-bold' },
                          { label: 'Fiscal Year', value: '2026' },
                        ];
                        return (
                          <OutputHeaderButtonBoxes
                            fields={fbFields}
                            title="FINANCIAL DOCUMENT TRANSACTION CONTEXT"
                          />
                        );
                      })()}
                    </div>

                    {/* Table section */}
                    <div className="bg-white rounded-lg border-2 border-orange-200 overflow-hidden shadow-sm">
                      <div className="bg-orange-50 p-4 border-b border-orange-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-orange-800 uppercase tracking-wider font-mono">
                            FINANCIAL DOCUMENT DISPLAY
                          </h4>
                        </div>
                        {/* Right side toolbar placeholder */}
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-100 border-b-2 border-orange-200 text-slate-800">
                            <tr>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] min-w-[110px]">Document Number</th>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] min-w-[90px]">Company Code</th>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] min-w-[80px]">Fiscal Year</th>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] min-w-[110px]">Reference Key</th>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] min-w-[80px]">Currency</th>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] text-right min-w-[110px]">Amount</th>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] min-w-[150px]">Material</th>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] text-right min-w-[90px]">Quantity</th>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] text-center min-w-[70px]">Period</th>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] min-w-[160px]">Customer Details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-700 text-xs">
                            {filteredIndianInvoices.map((item, idx) => (
                              <tr key={idx} className={`hover:bg-orange-50/20 transition-all ${item.docNo === selectedIndianInvoice.docNo ? 'bg-orange-50/40' : ''}`}>
                                <td className="p-3 font-mono font-bold text-orange-700">{item.docNo}</td>
                                <td className="p-3 font-mono text-slate-600">1900</td>
                                <td className="p-3 font-mono text-slate-600">2026</td>
                                <td className="p-3 font-mono text-slate-600">REF-IN-9100{idx + 1}</td>
                                <td className="p-3 font-mono text-slate-500">INR</td>
                                <td className="p-3 font-mono font-bold text-emerald-750 text-right">
                                  {item.netValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-3 font-bold text-slate-850">
                                  <span className="block text-[10px] text-slate-400 font-mono font-bold">POS_ID: 100-{item.itemNo}</span>
                                  {item.material}
                                </td>
                                <td className="p-3 text-right font-mono font-bold text-slate-900">{item.quantity.toLocaleString()} TN</td>
                                <td className="p-3 text-center font-mono font-bold text-slate-500">07</td>
                                <td className="p-3">
                                  <div className="space-y-1 font-sans text-xs">
                                    <p className="font-bold text-[#273B5E]">{item.customerName}</p>
                                    <p className="text-[10px] text-slate-500 font-mono">GSTIN: <span className="font-bold">{item.customerGstin}</span></p>
                                    <p className="text-[10px] text-slate-400">State: <span className="font-bold">{item.customerState}</span></p>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })() : (() => {
                if (!activeBKPF) {
                  return (
                    <div className="p-6 text-center select-none font-sans">
                      <p className="text-slate-500 text-xs">Error loading document. Returning...</p>
                      <button onClick={() => onNavigate('FIN_DOC_SEL')} className="bg-slate-800 text-white px-4 py-2 text-xs rounded mt-3">Back</button>
                    </div>
                  );
                }

                return (
                  <div className="p-6 space-y-6 select-none">
                    {/* Header toolbar */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4 pr-10 sm:pr-12">
                      <div>
                        <h2 className="text-lg font-sans font-bold text-[#273B5E]">Financial Document Details (FB03)</h2>
                      </div>
                      <button
                        onClick={() => onNavigate('FIN_DOC_SEL')}
                        className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Document Selection</span>
                      </button>
                    </div>

                    {/* BKPF Header Details metadata */}
                    {(() => {
                      const fbFields: ButtonBoxField[] = [
                        { label: 'Doc Number', value: activeBKPF.BELNR, highlight: true, valueClass: 'text-rose-600' },
                        { label: 'Net Value', value: `$${bkpfSums.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, valueClass: 'text-emerald-600' },
                        { label: 'Billing Date', value: activeBKPF.BLDAT },
                        { label: 'Doc Type (BLART)', value: activeBKPF.BLART, badge: 'HEADER TYPE' },
                        { label: 'Currency', value: activeBKPF.WAERS, valueClass: 'text-amber-600' },
                        { label: 'Company Code', value: activeBKPF.BUKRS },
                        { label: 'Fiscal Year', value: activeBKPF.GJAHR },
                        { label: 'Tax Value (Est)', value: `$${(bkpfSums.debit * 0.1).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                        { label: 'Reference', value: activeBKPF.XBLNR || 'NONE', valueClass: 'text-[#963F29]' },
                      ];
                      return (
                        <div className="space-y-4">
                          <OutputHeaderButtonBoxes
                            fields={fbFields}
                            title="HEADER INFORMATION (SAP TABLE BKPF)"
                            tcode="FB03"
                          />
                          <div className="bg-slate-50 border border-[#D9DEE6] rounded-lg p-3 text-xs flex gap-1.5">
                            <span className="text-slate-500 font-bold uppercase font-mono text-[10px]">Header Text (BKTXT):</span>
                            <span className="text-slate-700 italic font-medium">{activeBKPF.BKTXT || 'No header text assigned'}</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Ledger Segment Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white border border-[#D9DEE6] p-4 rounded-lg shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Accumulated Debit</span>
                        <span className="text-lg font-mono font-bold text-slate-800 mt-1 block">
                          ${bkpfSums.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })} {activeBKPF.WAERS}
                        </span>
                      </div>
                      <div className="bg-white border border-[#D9DEE6] p-4 rounded-lg shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Accumulated Credit</span>
                        <span className="text-lg font-mono font-bold text-slate-800 mt-1 block">
                          ${bkpfSums.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })} {activeBKPF.WAERS}
                        </span>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg shadow-sm">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase font-mono block">Document Balance Status</span>
                        <span className="text-lg font-mono font-bold text-emerald-700 mt-1 block flex items-center gap-1.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span>Balanced (0.00)</span>
                        </span>
                      </div>
                    </div>

                    {/* Line Segment Segment BSEG table */}
                    <div className="bg-white rounded-lg border border-[#D9DEE6] overflow-hidden shadow-sm">
                      <TableToolbar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        totalRecords={activeBSEGItems.length}
                      />

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-100 border-b-2 border-orange-200 text-slate-800">
                            <tr>
                              <th className="p-4 font-black text-[#273B5E] uppercase tracking-wide min-w-[150px] align-top">
                                <div className="text-xs font-black">Doc No (BELNR)</div>
                              </th>
                              <th className="p-4 font-black text-[#273B5E] uppercase tracking-wide text-right min-w-[240px] align-top">
                                <div className="text-xs font-black">Net Value</div>
                              </th>
                              <th className="p-4 font-black text-[#273B5E] uppercase tracking-wide min-w-[240px] align-top">
                                <div className="text-xs font-black">Material</div>
                                <div className="text-[10px] text-slate-500 font-medium normal-case tracking-normal leading-tight font-sans mt-0.5">
                                  (Commercial description and corporate product identification index)
                                </div>
                              </th>
                              <th className="p-4 font-black text-[#273B5E] uppercase tracking-wide text-right min-w-[160px] align-top">
                                <div className="text-xs font-black">Quantity</div>
                                <div className="text-[10px] text-slate-500 font-medium normal-case tracking-normal leading-tight font-sans mt-0.5">
                                  (Physical weight unit in Metric Tons)
                                </div>
                              </th>
                              <th className="p-4 font-black text-[#273B5E] uppercase tracking-wide text-center min-w-[130px] align-top">
                                <div className="text-xs font-black">Item No</div>
                                <div className="text-[10px] text-slate-500 font-medium normal-case tracking-normal leading-tight font-sans mt-0.5">
                                  (Line-item position index)
                                </div>
                              </th>
                              <th className="p-4 font-black text-[#273B5E] uppercase tracking-wide min-w-[160px] align-top">
                                <div className="text-xs font-black">PC/CC</div>
                                <div className="text-[10px] text-slate-500 font-medium normal-case tracking-normal leading-tight font-sans mt-0.5">
                                  (Assigned profit center or cost center allocation codes)
                                </div>
                              </th>
                              <th className="p-4 font-black text-[#273B5E] uppercase tracking-wide text-right min-w-[180px] align-top">
                                <div className="text-xs font-black">Tax</div>
                                <div className="text-[10px] text-slate-500 font-medium normal-case tracking-normal leading-tight font-sans mt-0.5">
                                  (Standard corporate tax distribution amount)
                                </div>
                              </th>
                              <th className="p-4 font-black text-[#273B5E] uppercase tracking-wide min-w-[180px] align-top">
                                <div className="text-xs font-black">Sales Office</div>
                                <div className="text-[10px] text-slate-500 font-medium normal-case tracking-normal leading-tight font-sans mt-0.5">
                                  (Registered geographical department handling distribution)
                                </div>
                              </th>
                              <th className="p-4 font-black text-[#273B5E] uppercase tracking-wide min-w-[220px] align-top">
                                <div className="text-xs font-black">Customer Details</div>
                                <div className="text-[10px] text-slate-500 font-medium normal-case tracking-normal leading-tight font-sans mt-0.5">
                                  (Registered entity name and geographic region details)
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-700">
                            {activeBSEGItems.map((item, idx) => {
                              // Resolve custom label based on account types
                              let partnerLabel = 'G/L Ledger Split';
                              if (item.KOART === 'D' && item.KUNNR) {
                                const c = dbKNA1.find(cu => cu.KUNNR === item.KUNNR);
                                partnerLabel = c ? c.NAME1 : item.KUNNR;
                              } else if (item.KOART === 'K' && item.LIFNR) {
                                const v = dbLFA1.find(ve => ve.LIFNR === item.LIFNR);
                                partnerLabel = v ? v.NAME1 : item.LIFNR;
                              }

                              // Make values realistic in Indian numbering notation
                              const inrValue = item.WRBTR * 83;
                              const formattedInrValue = `₹${inrValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                              const formattedInrTax = `₹${(inrValue * 0.18).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

                              const calculatedQty = `${((item.WRBTR / 100) || 5.5).toFixed(1)} MT`;
                              const assignedPcCc = item.PRCTR || item.KOSTL || 'PC-MUM-01';
                              const resolvedMaterial = item.SGTXT || 'Mild Steel Tubes';
                              const resolvedSalesOffice = idx % 2 === 0 ? 'Mumbai (IN-WEST)' : 'Delhi (IN-NORTH)';

                              return (
                                <tr key={idx} className="hover:bg-orange-50/20 transition-all">
                                  <td className="p-4 font-mono font-black text-orange-700">{activeBKPF.BELNR}</td>
                                  <td className="p-4 font-mono font-black text-emerald-750 text-right">
                                    {formattedInrValue}
                                  </td>
                                  <td className="p-4 font-black text-slate-850">
                                    <span className="block text-[10px] text-slate-400 font-mono font-bold">POS_ID: 100-{idx + 1}</span>
                                    {resolvedMaterial}
                                  </td>
                                  <td className="p-4 text-right font-mono font-black text-slate-900">{calculatedQty}</td>
                                  <td className="p-4 text-center font-mono font-black text-slate-500">{item.BUZEI}</td>
                                  <td className="p-4 font-mono font-black text-slate-600">{assignedPcCc}</td>
                                  <td className="p-4 text-right font-mono font-black text-orange-600">
                                    {formattedInrTax}
                                    <span className="block text-[10px] text-slate-400 font-normal font-sans">18% Standard Tax</span>
                                  </td>
                                  <td className="p-4 font-black text-slate-850">{resolvedSalesOffice}</td>
                                  <td className="p-4">
                                    <div className="space-y-1 font-sans text-xs">
                                      <p className="font-black text-[#273B5E]">{partnerLabel}</p>
                                      <p className="text-[10px] text-slate-500 font-mono">Tax Region: <span className="font-bold">Maharashtra</span></p>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </>
    );
  }

  // ----------------------------------------------------------------------------
  // VF03 BILLING DOCUMENT - SELECTION + REPORT (MODAL)
  // ----------------------------------------------------------------------------
  if (activeScreen === 'INVOICE_SEL' || activeScreen === 'INVOICE_REP') {
    return (
      <>
        <div className="p-6 max-w-xl mx-auto select-none">
          <div className="bg-white rounded-xl border border-[#D9DEE6] shadow-md overflow-hidden">
            <div className="bg-[#273B5E] text-white p-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-500" />
              <div>
                <h3 className="font-bold text-xs">DISPLAY INVOICE DOCUMENT</h3>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Billing Document</label>
                <input
                  id="vf03-sel-billing"
                  type="text"
                  placeholder="e.g. 1800091001"
                  value={billingDocNumber}
                  onChange={(e) => setBillingDocNumber(e.target.value)}
                  className={`w-full bg-white border-2 rounded p-3 text-sm font-mono font-black tracking-wide ${isIndianDb ? 'border-orange-300 focus:border-orange-500 text-orange-800' : 'border-[#D9DEE6] focus:border-[#273B5E]'}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Document Number</label>
                <input
                  id="vf03-sel-num"
                  type="text"
                  placeholder="e.g. 1800091001"
                  value={docNumber}
                  onChange={(e) => { setDocNumber(e.target.value); setFormError(''); }}
                  className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2.5 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Company Code</label>
                  <input
                    id="vf03-sel-company"
                    type="text"
                    placeholder="e.g. 1900"
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value)}
                    className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fiscal Year</label>
                  <input
                    id="vf03-sel-year"
                    type="text"
                    placeholder="e.g. 2026"
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(e.target.value)}
                    className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Reference</label>
                <input
                  id="vf03-sel-ref"
                  type="text"
                  placeholder="e.g. PO-2026-001"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-slate-50 border border-[#D9DEE6] rounded p-2.5 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 gap-3">
                <button
                  id="btn-vf03-back"
                  onClick={() => onNavigate('DOC_DISPLAY_MAIN')}
                  className="px-4 py-2 border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Back
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setBillingDocNumber('');
                      setDocNumber('');
                      setCompanyCode('1900');
                      setFiscalYear('2026');
                      setReference('');
                      setFormError('');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-medium"
                  >
                    Clear
                  </button>
                  <button
                    id="btn-vf03-display"
                    onClick={() => onNavigate('INVOICE_REP')}
                    className={`px-5 py-2 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors ${isIndianDb ? 'bg-orange-600 hover:bg-orange-700' : 'bg-[#273B5E] hover:bg-[#3d5680]'}`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Invoice Display</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Overlay for Invoice Report */}
        {activeScreen === 'INVOICE_REP' && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative border border-slate-200">
              <button
                onClick={() => onNavigate('INVOICE_SEL')}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-50"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {isIndianDb ? (() => {
                const selectedIndianInvoice = activeIndianInvoice || indianInvoices.find(i => i.docNo === billingDocNumber.trim()) || indianInvoices[0];
                if (!selectedIndianInvoice) return (
                  <div className="p-6 text-center"><p className="text-slate-500 text-xs">Error loading Indian invoice.</p></div>
                );
                return (
                  <div className="p-6 space-y-6 select-none animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b-2 border-orange-200 pb-4 pr-10 sm:pr-12">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-[#273B5E]" />
                          <h2 className="text-lg font-sans font-black text-[#273B5E]">Invoice Document Details</h2>
                        </div>
                      </div>
                      <button onClick={() => onNavigate('INVOICE_SEL')} className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-orange-200 rounded-lg text-xs hover:bg-orange-50 font-black transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /><span>Invoice Selection</span>
                      </button>
                    </div>
                    <div>
                      {(() => {
                        const vfFields: ButtonBoxField[] = [
                          { label: 'Document Number', value: selectedIndianInvoice.docNo, highlight: true, valueClass: 'text-orange-700 font-black' },
                          { label: 'Customer ID', value: 'CUST-IN-401', valueClass: 'text-amber-700 font-bold' },
                          { label: 'Fiscal Year', value: '2026' },
                          { label: 'Net Value', value: `${selectedIndianInvoice.netValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valueClass: 'text-emerald-700 font-black' },
                          { label: 'Gross Value', value: `${(selectedIndianInvoice.netValue + selectedIndianInvoice.tax).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valueClass: 'text-[#273B5E] font-black' },
                          { label: 'Tax', value: `${selectedIndianInvoice.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valueClass: 'text-orange-700 font-bold' },
                          { label: 'Billing Date', value: '2026-07-15' },
                          { label: 'Company Code', value: '1900 (IN)' },
                          { label: 'Reference', value: billingReference || 'REF-IN-91001' },
                        ];
                        return <OutputHeaderButtonBoxes fields={vfFields} title="🇮🇳 INDIAN LOCALIZED INVOICE" />;
                      })()}
                    </div>
                    <div className="bg-white rounded-lg border-2 border-orange-200 overflow-hidden shadow-sm">
                      <div className="bg-orange-50 p-4 border-b border-orange-200">
                        <h4 className="text-xs font-black text-orange-800 uppercase tracking-wider font-mono">INVOICE DOCUMENT DISPLAY</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-100 border-b-2 border-orange-200 text-slate-800">
                            <tr>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] min-w-[110px]">Doc No (BELNR)</th>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] text-right min-w-[110px]">Net Value</th>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] text-right min-w-[110px]">Tax</th>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] min-w-[120px]">Sales Office</th>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] min-w-[150px]">Material</th>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] text-right min-w-[90px]">Quantity</th>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] text-center min-w-[80px]">Item No</th>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] min-w-[90px]">PC/CC</th>
                              <th className="p-3 font-bold text-[#273B5E] uppercase tracking-wider text-[11px] min-w-[160px]">Customer Details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-700 text-xs">
                            {filteredIndianInvoices.map((item, idx) => (
                              <tr key={idx} className={`hover:bg-orange-50/20 transition-all ${item.docNo === selectedIndianInvoice.docNo ? 'bg-orange-50/40' : ''}`}>
                                <td className="p-3 font-mono font-bold text-orange-700">{item.docNo}</td>
                                <td className="p-3 font-mono font-bold text-emerald-750 text-right">{item.netValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td className="p-3 text-right font-mono font-bold text-orange-600">
                                  {item.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-3 font-bold text-slate-800">{item.salesOffice}</td>
                                <td className="p-3 font-bold text-slate-850">
                                  <span className="block text-[10px] text-slate-400 font-mono font-bold">POS_ID: 100-{idx + 1}</span>
                                  {item.material}
                                </td>
                                <td className="p-3 text-right font-mono font-bold text-slate-900">{item.quantity.toLocaleString()} TN</td>
                                <td className="p-3 text-center font-mono font-bold text-slate-500">{item.itemNo}</td>
                                <td className="p-3 font-mono font-bold text-slate-600">{item.pcCc}</td>
                                <td className="p-3">
                                  <div className="space-y-1 font-sans text-xs">
                                    <p className="font-bold text-[#273B5E]">{item.customerName}</p>
                                    <p className="text-[10px] text-slate-500 font-mono">GSTIN: <span className="font-bold">{item.customerGstin}</span></p>
                                    <p className="text-[10px] text-slate-400">State: <span className="font-bold">{item.customerState}</span></p>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })() : (() => {
                if (!activeVBRK) return (
                  <div className="p-6 text-center"><p className="text-slate-500 text-xs">Error loading invoice.</p></div>
                );
                return (
                  <div className="p-6 space-y-6 select-none">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4 pr-10 sm:pr-12">
                      <div>
                        <h2 className="text-lg font-sans font-bold text-[#273B5E]">Invoice Document Details (VF03)</h2>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">Invoice (VBELN): {activeVBRK.VBELN} | Company Code: {activeVBRK.BUKRS}</p>
                      </div>
                      <button onClick={() => onNavigate('INVOICE_SEL')} className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /><span>Invoice Selection</span>
                      </button>
                    </div>
                    <div>
                      {(() => {
                        const vfFields: ButtonBoxField[] = [
                          { label: 'Document Number', value: activeVBRK.VBELN, highlight: true, valueClass: 'text-[#273B5E] font-black' },
                          { label: 'Customer ID', value: activeVBRK.KUNRG, valueClass: 'text-amber-700 font-bold' },
                          { label: 'Fiscal Year', value: activeVBRK.FKDAT.split('-')[0] || '2026' },
                          { label: 'Net Value', value: `$${activeVBRK.NETWR.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, valueClass: 'text-emerald-600 font-bold' },
                          { label: 'Currency', value: activeVBRK.WAERK, valueClass: 'text-emerald-600 font-bold' },
                          { label: 'Tax', value: `$${activeVBRK.MWSBK.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, valueClass: 'text-orange-700 font-bold', badge: 'TAX VALUE' },
                          { label: 'Billing Date', value: activeVBRK.FKDAT },
                          { label: 'Company Code', value: activeVBRK.BUKRS },
                          { label: 'Reference', value: billingReference || 'REF-US-90001' },
                        ];
                        return <OutputHeaderButtonBoxes fields={vfFields} title="BILLING TRANSACTION SUMMARY (VBRK)" tcode="VF03" />;
                      })()}
                    </div>
                    <div className="bg-white rounded-lg border border-[#D9DEE6] overflow-hidden shadow-sm">
                      <TableToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} totalRecords={activeVBRPItems.length} />
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-100 border-b border-[#D9DEE6] text-slate-700">
                            <tr>
                              <th className="p-3 font-mono">Item POSNR</th>
                              <th className="p-3 font-mono">Material Code</th>
                              <th className="p-3">Material Description</th>
                              <th className="p-3 text-right font-mono">Quantity</th>
                              <th className="p-3 font-mono text-center">Unit</th>
                              <th className="p-3 text-right font-mono">Net Value</th>
                              <th className="p-3 text-right font-mono">Calculated Tax</th>
                              <th className="p-3 text-right font-mono font-bold">Total Item Value</th>
                              <th className="p-3 font-mono text-center">Profit Center</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {activeVBRPItems.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="p-3 font-mono font-bold text-slate-400">{item.POSNR}</td>
                                <td className="p-3 font-mono font-bold text-[#273B5E]">{item.MATNR}</td>
                                <td className="p-3 font-medium text-slate-800">{item.ARKTX}</td>
                                <td className="p-3 text-right font-mono font-bold text-slate-900">{item.FKIMG.toLocaleString()}</td>
                                <td className="p-3 text-center font-bold text-slate-400">{item.VRKME}</td>
                                <td className="p-3 text-right font-mono">${item.NETWR.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                <td className="p-3 text-right font-mono text-rose-500">${item.MWSBP.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                <td className="p-3 text-right font-mono font-bold text-[#273B5E]">${(item.NETWR + item.MWSBP).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                <td className="p-3 text-center font-mono text-slate-500">{item.PRCTR || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </>
    );
  }

  // ----------------------------------------------------------------------------
  // PURCHASE ORDER - REGISTRY SCREEN (ME23N)
  // ----------------------------------------------------------------------------
  if (activeScreen === 'PO_REP') {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-sans font-bold text-[#273B5E]">Purchase Orders Ledger Registry (ME23N)</h2>
            <p className="text-xs text-slate-500 mt-1">Review active material procurement contracts and logistics milestones</p>
          </div>
          <button
            onClick={() => onNavigate('DOC_DISPLAY_MAIN')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#D9DEE6] rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Document Display Hub</span>
          </button>
        </div>

        {/* Unified Button Box Metadata Grid with exactly 9 items */}
        {(() => {
          const poFields: ButtonBoxField[] = [
            { label: 'Plant Code', value: 'PL-10 / PL-20', highlight: true, valueClass: 'text-[#273B5E]' },
            { label: 'Total Contract Value', value: `$${mockPurchaseOrders.reduce((acc, po) => acc + po.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, valueClass: 'text-emerald-600 font-bold' },
            { label: 'Company Code', value: '1000' },
            { label: 'Fiscal Year', value: '2026' },
            { label: 'Active Orders', value: `${mockPurchaseOrders.length} Contracts` },
            { label: 'Buyers Assigned', value: 'PUR-01, PUR-02' },
            { label: 'Purchasing Org', value: '1000 Standard', badge: 'SAP ORG' },
            { label: 'Base Currency', value: 'USD', valueClass: 'text-emerald-600' },
            { label: 'SAP Client', value: '800', badge: 'SYS: S4P' }
          ];
          return (
            <OutputHeaderButtonBoxes
              fields={poFields}
              title="PURCHASE CONTRACTS & MATERIAL PROCUREMENT METRICS"
              tcode="ME23N"
            />
          );
        })()}

        {/* PO items list table */}
        <div className="bg-white rounded-lg border border-[#D9DEE6] overflow-hidden shadow-sm">
          <TableToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalRecords={mockPurchaseOrders.length}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 border-b border-[#D9DEE6] text-slate-700">
                <tr>
                  <th className="p-3 font-mono">PO Doc Number</th>
                  <th className="p-3">Vendor Supplier (LFA1)</th>
                  <th className="p-3 font-mono">Issue Date</th>
                  <th className="p-3 font-mono">Buyer Code</th>
                  <th className="p-3">Procured Material</th>
                  <th className="p-3 text-right font-mono">Order Quantity</th>
                  <th className="p-3 font-mono">Unit</th>
                  <th className="p-3 text-right font-mono font-bold">Total Contract Value</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {mockPurchaseOrders.map((po, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-[#963F29]">{po.poNum}</td>
                    <td className="p-3 font-semibold text-slate-700">{po.vendor}</td>
                    <td className="p-3 font-mono text-slate-500">{po.date}</td>
                    <td className="p-3 font-mono font-medium text-slate-600">{po.buyer}</td>
                    <td className="p-3 font-medium text-slate-800">{po.material}</td>
                    <td className="p-3 text-right font-mono font-bold">{po.qty}</td>
                    <td className="p-3 font-bold text-slate-400 font-sans">{po.unit}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      ${po.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-sans font-bold leading-none">
                        {po.status}
                      </span>
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
