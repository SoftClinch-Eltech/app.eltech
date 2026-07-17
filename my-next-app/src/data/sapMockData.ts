import { BKPF, BSEG, VBRK, VBRP, KNA1, LFA1, TrialBalanceItem, User, AuditLog, SAPMapping, LedgerEntry } from '../types';

// ============================================================================
// SAP DATABASE TABLE SIMULATIONS (BKPF, BSEG, VBRK, VBRP, KNA1, LFA1)
// ============================================================================

// BKPF - Accounting Document Header Database
export const dbBKPF: BKPF[] = [
  {
    BELNR: '100000201',
    BUKRS: '1000',
    GJAHR: '2026',
    BLART: 'SA', // G/L Document
    BLDAT: '2026-07-01',
    BUDAT: '2026-07-02',
    MONAT: '07',
    USNAM: 'S_SCHMIDT',
    WAERS: 'USD',
    XBLNR: 'REF-2026-001',
    BKTXT: 'Accrued Payroll July 2026',
  },
  {
    BELNR: '100000202',
    BUKRS: '1000',
    GJAHR: '2026',
    BLART: 'DR', // Customer Invoice
    BLDAT: '2026-07-05',
    BUDAT: '2026-07-06',
    MONAT: '07',
    USNAM: 'M_MUELLER',
    WAERS: 'USD',
    XBLNR: 'INV-90000101',
    BKTXT: 'Customer AR Invoice Standard',
  },
  {
    BELNR: '100000203',
    BUKRS: '1000',
    GJAHR: '2026',
    BLART: 'KR', // Vendor Invoice
    BLDAT: '2026-07-10',
    BUDAT: '2026-07-11',
    MONAT: '07',
    USNAM: 'J_DOE',
    WAERS: 'USD',
    XBLNR: 'VEND-INV-3392',
    BKTXT: 'Raw Material Delivery',
  },
  {
    BELNR: '100000204',
    BUKRS: '1000',
    GJAHR: '2026',
    BLART: 'SA',
    BLDAT: '2026-07-12',
    BUDAT: '2026-07-12',
    MONAT: '07',
    USNAM: 'A_RODRIGUEZ',
    WAERS: 'USD',
    XBLNR: 'DEP-883921',
    BKTXT: 'Intercompany Wire Transfer',
  },
  {
    BELNR: '100000205',
    BUKRS: '2000',
    GJAHR: '2026',
    BLART: 'SA',
    BLDAT: '2026-07-14',
    BUDAT: '2026-07-14',
    MONAT: '07',
    USNAM: 'S_SCHMIDT',
    WAERS: 'EUR',
    XBLNR: 'REF-EUR-990',
    BKTXT: 'European Office Lease July',
  }
];

// BSEG - Accounting Document Line Items Database
export const dbBSEG: BSEG[] = [
  // BELNR '100000201' - Payroll Accrual
  {
    BELNR: '100000201',
    BUKRS: '1000',
    GJAHR: '2026',
    BUZEI: '001',
    BSCHL: '40', // Debit G/L
    KOART: 'S',
    HKONT: '600010', // Salaries Expense
    WRBTR: 145000.00,
    SHKZG: 'S',
    MWSKZ: 'U1',
    PRCTR: 'PC-100', // Administration PC
    KOSTL: 'CC-101', // HR Cost Center
    SGTXT: 'Base salary July payroll',
  },
  {
    BELNR: '100000201',
    BUKRS: '1000',
    GJAHR: '2026',
    BUZEI: '002',
    BSCHL: '50', // Credit G/L
    KOART: 'S',
    HKONT: '200150', // Cash Clearing Account
    WRBTR: 145000.00,
    SHKZG: 'H',
    MWSKZ: 'U1',
    PRCTR: 'PC-100',
    KOSTL: 'CC-101',
    SGTXT: 'Base salary July payroll clearing',
  },

  // BELNR '100000202' - Customer AR Posting
  {
    BELNR: '100000202',
    BUKRS: '1000',
    GJAHR: '2026',
    BUZEI: '001',
    BSCHL: '01', // Debit Customer
    KOART: 'D',
    HKONT: '140000', // Accounts Receivable Generic G/L
    KUNNR: '0000100201', // TechClinch Corp
    WRBTR: 85600.00,
    SHKZG: 'S',
    MWSKZ: 'A1', // Sales Tax 10%
    PRCTR: 'PC-200', // Sales PC
    SGTXT: 'Invoice INV-90000101 TechClinch AR',
  },
  {
    BELNR: '100000202',
    BUKRS: '1000',
    GJAHR: '2026',
    BUZEI: '002',
    BSCHL: '50', // Credit Revenue
    KOART: 'S',
    HKONT: '400010', // Product Revenue G/L
    WRBTR: 77818.18, // Net Revenue
    SHKZG: 'H',
    MWSKZ: 'A1',
    PRCTR: 'PC-200',
    KOSTL: 'CC-202', // Sales Department CC
    SGTXT: 'Revenue distribution TechClinch',
  },
  {
    BELNR: '100000202',
    BUKRS: '1000',
    GJAHR: '2026',
    BUZEI: '003',
    BSCHL: '50', // Credit Tax
    KOART: 'S',
    HKONT: '220010', // Sales Tax Payable G/L
    WRBTR: 7781.82, // Tax Amount
    SHKZG: 'H',
    MWSKZ: 'A1',
    PRCTR: 'PC-200',
    SGTXT: 'Output sales tax 10%',
  },

  // BELNR '100000203' - Vendor AP Posting
  {
    BELNR: '100000203',
    BUKRS: '1000',
    GJAHR: '2026',
    BUZEI: '001',
    BSCHL: '31', // Credit Vendor
    KOART: 'K',
    HKONT: '210000', // Accounts Payable Generic G/L
    LIFNR: '0000200501', // SteelMill Inc
    WRBTR: 52400.00,
    SHKZG: 'H',
    MWSKZ: 'V1', // Input Tax 8%
    PRCTR: 'PC-300', // Manufacturing PC
    SGTXT: 'Raw Steel Supply Inv 3392',
  },
  {
    BELNR: '100000203',
    BUKRS: '1000',
    GJAHR: '2026',
    BUZEI: '002',
    BSCHL: '40', // Debit Inventory / Purchases
    KOART: 'S',
    HKONT: '500010', // Raw Material Purchase Exp
    WRBTR: 48518.52, // Net Purchase
    SHKZG: 'S',
    MWSKZ: 'V1',
    PRCTR: 'PC-300',
    KOSTL: 'CC-301', // Factory Procurement CC
    SGTXT: 'Raw steel stock physical receipt',
  },
  {
    BELNR: '100000203',
    BUKRS: '1000',
    GJAHR: '2026',
    BUZEI: '003',
    BSCHL: '40', // Debit Input Tax
    KOART: 'S',
    HKONT: '120010', // Input Tax Recoverable G/L
    WRBTR: 3881.48, // Tax Amount
    SHKZG: 'S',
    MWSKZ: 'V1',
    PRCTR: 'PC-300',
    SGTXT: 'Input tax recovery 8%',
  },

  // BELNR '100000204' - Wire Transfer
  {
    BELNR: '100000204',
    BUKRS: '1000',
    GJAHR: '2026',
    BUZEI: '001',
    BSCHL: '40',
    KOART: 'S',
    HKONT: '100010', // Petty Cash / Bank Account
    WRBTR: 50000.00,
    SHKZG: 'S',
    MWSKZ: 'U0',
    PRCTR: 'PC-100',
    SGTXT: 'Incoming Treasury Deposit',
  },
  {
    BELNR: '100000204',
    BUKRS: '1000',
    GJAHR: '2026',
    BUZEI: '002',
    BSCHL: '50',
    KOART: 'S',
    HKONT: '100020', // Main House Bank Account
    WRBTR: 50000.00,
    SHKZG: 'H',
    MWSKZ: 'U0',
    PRCTR: 'PC-100',
    SGTXT: 'Incoming Treasury Deposit Outflow Clearing',
  }
];

// VBRK - Billing Document Header Database
export const dbVBRK: VBRK[] = [
  {
    VBELN: '90000101',
    FKART: 'F2', // Standard Invoice
    FKDAT: '2026-07-05',
    BUKRS: '1000',
    NETWR: 77818.18,
    MWSBK: 7781.82,
    WAERK: 'USD',
    KUNRG: '0000100201',
    KUNRE: '0000100201',
  },
  {
    VBELN: '90000102',
    FKART: 'F2',
    FKDAT: '2026-07-08',
    BUKRS: '1000',
    NETWR: 125000.00,
    MWSBK: 12500.00,
    WAERK: 'USD',
    KUNRG: '0000100202',
    KUNRE: '0000100202',
  },
  {
    VBELN: '90000103',
    FKART: 'F2',
    FKDAT: '2026-07-12',
    BUKRS: '2000',
    NETWR: 4500.00,
    MWSBK: 450.00,
    WAERK: 'EUR',
    KUNRG: '0000100203',
    KUNRE: '0000100203',
  }
];

// VBRP - Billing Document Item Database
export const dbVBRP: VBRP[] = [
  {
    VBELN: '90000101',
    POSNR: '000010',
    MATNR: 'MAT-FIBER-01',
    ARKTX: 'High Tensile Carbon Fiber Sheet',
    FKIMG: 120,
    VRKME: 'PC',
    NETWR: 48000.00,
    MWSBP: 4800.00,
    PRCTR: 'PC-200',
    KOSTL: 'CC-202',
  },
  {
    VBELN: '90000101',
    POSNR: '000020',
    MATNR: 'MAT-EPOXY-05',
    ARKTX: 'Liquid Industrial Resin Catalyst',
    FKIMG: 50,
    VRKME: 'GAL',
    NETWR: 29818.18,
    MWSBP: 2981.82,
    PRCTR: 'PC-200',
    KOSTL: 'CC-202',
  },
  {
    VBELN: '90000102',
    POSNR: '000010',
    MATNR: 'MAT-SOFTWARE-ERP',
    ARKTX: 'Softclinch Consult Services Core Enterprise License v12',
    FKIMG: 1,
    VRKME: 'EA',
    NETWR: 125000.00,
    MWSBP: 12500.00,
    PRCTR: 'PC-100',
    KOSTL: 'CC-101',
  },
  {
    VBELN: '90000103',
    POSNR: '000010',
    MATNR: 'MAT-CONSULTING-H',
    ARKTX: 'SAP Solution Architecture Advisory Hours',
    FKIMG: 15,
    VRKME: 'HR',
    NETWR: 4500.00,
    MWSBP: 450.00,
    PRCTR: 'PC-200',
    KOSTL: 'CC-202',
  }
];

// KNA1 - Customer Master General Data Table
export const dbKNA1: KNA1[] = [
  {
    KUNNR: '0000100201',
    NAME1: 'TechClinch Global Corporation',
    STRAS: '100 Innovation Parkway Suite 400',
    ORT01: 'San Jose',
    PSTLZ: '95110',
    LAND1: 'US',
  },
  {
    KUNNR: '0000100202',
    NAME1: 'Standard Aerospace & Defense Ltd',
    STRAS: '852 Aviation Blvd',
    ORT01: 'Seattle',
    PSTLZ: '98101',
    LAND1: 'US',
  },
  {
    KUNNR: '0000100203',
    NAME1: 'Continental Automotive GmbH',
    STRAS: 'Werner-von-Siemens-Strasse 12',
    ORT01: 'Munich',
    PSTLZ: '80331',
    LAND1: 'DE',
  }
];

// LFA1 - Vendor Master General Data Table
export const dbLFA1: LFA1[] = [
  {
    LIFNR: '0000200501',
    NAME1: 'SteelMill Inc & Metallurgy Corp',
    STRAS: '448 Heavy Industry Row',
    ORT01: 'Pittsburgh',
    PSTLZ: '15201',
    LAND1: 'US',
  },
  {
    LIFNR: '0000200502',
    NAME1: 'Global Logistics Partners S.A.',
    STRAS: 'Rue de la Gabelle 14',
    ORT01: 'Geneva',
    PSTLZ: '1227',
    LAND1: 'CH',
  },
  {
    LIFNR: '0000200503',
    NAME1: 'Nippon Carbon Components Ltd',
    STRAS: '3-1 Chiyoda-ku Otemachi',
    ORT01: 'Tokyo',
    PSTLZ: '100-8114',
    LAND1: 'JP',
  }
];

// ============================================================================
// FINANCIAL REPORTING STRUCTURE MOCKS
// ============================================================================

// Trial Balance Data
export const initialTrialBalanceItems: TrialBalanceItem[] = [
  { account: '100010', description: 'Petty Cash Local Account', openingBalance: 45000.00, debit: 50000.00, credit: 0.00, closingBalance: 95000.00, category: 'Asset' },
  { account: '100020', description: 'Main Bank Account USD', openingBalance: 1250000.00, debit: 0.00, credit: 50000.00, closingBalance: 1200000.00, category: 'Asset' },
  { account: '120010', description: 'Input Tax Recoverable Account', openingBalance: 8200.00, debit: 3881.48, credit: 0.00, closingBalance: 12081.48, category: 'Asset' },
  { account: '140000', description: 'Accounts Receivable (AR)', openingBalance: 320000.00, debit: 85600.00, credit: 0.00, closingBalance: 405600.00, category: 'Asset' },
  { account: '200150', description: 'Payroll Clearing Account', openingBalance: 0.00, debit: 0.00, credit: 145000.00, closingBalance: -145000.00, category: 'Liability' },
  { account: '210000', description: 'Accounts Payable (AP)', openingBalance: -250000.00, debit: 0.00, credit: 52400.00, closingBalance: -302400.00, category: 'Liability' },
  { account: '220010', description: 'Sales Tax Payable Account', openingBalance: -14000.00, debit: 0.00, credit: 7781.82, closingBalance: -21781.82, category: 'Liability' },
  { account: '300010', description: 'Common Share Capital', openingBalance: -1000000.00, debit: 0.00, credit: 0.00, closingBalance: -1000000.00, category: 'Equity' },
  { account: '300020', description: 'Retained Earnings Balance', openingBalance: -359200.00, debit: 0.00, credit: 0.00, closingBalance: -359200.00, category: 'Equity' },
  { account: '400010', description: 'Product Sales Revenue', openingBalance: 0.00, debit: 0.00, credit: 77818.18, closingBalance: -77818.18, category: 'Revenue' },
  { account: '500010', description: 'Raw Material Expenses', openingBalance: 0.00, debit: 48518.52, credit: 0.00, closingBalance: 48518.52, category: 'Expense' },
  { account: '600010', description: 'Salaries and Wages Expense', openingBalance: 0.00, debit: 145000.00, credit: 0.00, closingBalance: 145000.00, category: 'Expense' },
];

// General Ledger entries for Account 100010, 140000, 210000 etc.
export const mockGLEntries: Record<string, LedgerEntry[]> = {
  '100010': [
    { postingDate: '2026-07-01', documentNum: '100000101', reference: 'OPENING', description: 'Opening Balance July 2026', debit: 45000, credit: 0, balance: 45000 },
    { postingDate: '2026-07-12', documentNum: '100000204', reference: 'DEP-883921', description: 'Incoming Treasury Deposit', debit: 50000, credit: 0, balance: 95000 },
  ],
  '140000': [
    { postingDate: '2026-07-01', documentNum: '100000101', reference: 'OPENING', description: 'Opening Balance July 2026', debit: 320000, credit: 0, balance: 320000 },
    { postingDate: '2026-07-06', documentNum: '100000202', reference: 'INV-90000101', description: 'TechClinch AR Invoice Standard', debit: 85600, credit: 0, balance: 405600 },
  ],
  '210000': [
    { postingDate: '2026-07-01', documentNum: '100000101', reference: 'OPENING', description: 'Opening Balance July 2026', debit: 0, credit: 250000, balance: -250000 },
    { postingDate: '2026-07-11', documentNum: '100000203', reference: 'VEND-INV-3392', description: 'Raw Steel Supply Inv 3392', debit: 0, credit: 52400, balance: -302400 },
  ],
};

// Customer Ledger entries
export const mockCustomerLedger: Record<string, LedgerEntry[]> = {
  '0000100201': [
    { postingDate: '2026-07-01', documentNum: '100000101', reference: 'OPENING', description: 'Opening Balance Ledger Standard', debit: 180000, credit: 0, balance: 180000 },
    { postingDate: '2026-07-06', documentNum: '100000202', reference: 'INV-90000101', description: 'Carbon Fiber Product Delivery', debit: 85600, credit: 0, balance: 265600 },
  ],
  '0000100202': [
    { postingDate: '2026-07-01', documentNum: '100000101', reference: 'OPENING', description: 'Opening Balance Ledger Standard', debit: 140000, credit: 0, balance: 140000 },
    { postingDate: '2026-07-08', documentNum: '100000155', reference: 'INV-90000102', description: 'ERP Software Licensing Standard', debit: 137500, credit: 0, balance: 277500 },
  ]
};

// Vendor Ledger entries
export const mockVendorLedger: Record<string, LedgerEntry[]> = {
  '0000200501': [
    { postingDate: '2026-07-01', documentNum: '100000101', reference: 'OPENING', description: 'Opening Balance Ledger Standard', debit: 0, credit: 150000, balance: -150000 },
    { postingDate: '2026-07-11', documentNum: '100000203', reference: 'VEND-INV-3392', description: 'Raw Steel Supply physical receipt', debit: 0, credit: 52400, balance: -202400 },
  ],
  '0000200502': [
    { postingDate: '2026-07-01', documentNum: '100000101', reference: 'OPENING', description: 'Opening Balance Ledger Standard', debit: 0, credit: 100000, balance: -100000 },
  ]
};

// ============================================================================
// APPLICATION USERS MASTER
// ============================================================================

export const initialUsers: User[] = [
  {
    id: 'USR001',
    username: 'softclinch_arch',
    fullName: 'Softclinch Senior SAP Architect',
    email: 'architect@softclinch.com',
    role: 'Solution Architect',
    department: 'Enterprise UX & Core Systems',
    permissions: {
      fb03: true,
      vf03: true,
      fbl3n: true,
      fbl5n: true,
      fbl1n: true,
      userMaster: true,
      settings: true,
    },
    status: 'Active',
    lastLogin: '2026-07-15 03:45 UTC',
  },
  {
    id: 'USR002',
    username: 'fiori_consultant',
    fullName: 'Theresa Albers',
    email: 't.albers@softclinch.com',
    role: 'Functional Consultant',
    department: 'Financial Advisory Services',
    permissions: {
      fb03: true,
      vf03: true,
      fbl3n: true,
      fbl5n: true,
      fbl1n: true,
      userMaster: false,
      settings: true,
    },
    status: 'Active',
    lastLogin: '2026-07-14 18:22 UTC',
  },
  {
    id: 'USR003',
    username: 'ledger_controller',
    fullName: 'Michael Vance',
    email: 'm.vance@softclinch.com',
    role: 'Finance Manager',
    department: 'Corporate Accounting Division',
    permissions: {
      fb03: true,
      vf03: false,
      fbl3n: true,
      fbl5n: true,
      fbl1n: true,
      userMaster: false,
      settings: false,
    },
    status: 'Active',
    lastLogin: '2026-07-15 01:10 UTC',
  },
  {
    id: 'USR004',
    username: 'auditor_extern',
    fullName: 'Claire Sterling',
    email: 'c.sterling@audit-partners.com',
    role: 'Auditor',
    department: 'External Compliance Board',
    permissions: {
      fb03: true,
      vf03: true,
      fbl3n: true,
      fbl5n: true,
      fbl1n: true,
      userMaster: false,
      settings: false,
    },
    status: 'Active',
    lastLogin: '2026-07-11 09:30 UTC',
  }
];

// ============================================================================
// AUDIT LOG DATABASE
// ============================================================================

export const initialAuditLogs: AuditLog[] = [
  { id: 'LOG-001', timestamp: '2026-07-15 03:50:11', userId: 'USR001', username: 'softclinch_arch', action: 'LOGIN_SUCCESS', details: 'Successful authentication on Softclinch Consult Services gateway', ipAddress: '192.168.10.45' },
  { id: 'LOG-002', timestamp: '2026-07-15 03:12:00', userId: 'USR001', username: 'softclinch_arch', action: 'TRIAL_BALANCE_QUERY', details: 'Queried Trial Balance Report: BUKRS=1000, GJAHR=2026, Ledger=0L', ipAddress: '192.168.10.45' },
  { id: 'LOG-003', timestamp: '2026-07-14 19:40:22', userId: 'USR002', username: 'fiori_consultant', action: 'FB03_DISPLAY', details: 'Displayed FB03 Accounting Document BELNR=100000201', ipAddress: '192.168.10.77' },
  { id: 'LOG-004', timestamp: '2026-07-14 18:25:01', userId: 'USR002', username: 'fiori_consultant', action: 'VF03_DISPLAY', details: 'Displayed VF03 Sales Invoice VBELN=90000101', ipAddress: '192.168.10.77' },
  { id: 'LOG-005', timestamp: '2026-07-13 14:02:44', userId: 'USR003', username: 'ledger_controller', action: 'FBL3N_EXPORT', details: 'Exported General Ledger results to MS Excel format', ipAddress: '10.200.4.12' },
];

// ============================================================================
// TECHNICAL SAP FIELD & TABLE MAPPINGS (MAPPING DICTIONARY)
// ============================================================================

export const sapMappingDictionary: Record<string, SAPMapping> = {
  TRIAL_BALANCE: {
    transactionCode: 'FAGLB03 / FBL3N',
    sapTables: ['GLT0', 'FAGLFLEXT', 'SKB1', 'SKA1'],
    description: 'Trial Balance selection lists the collective net balances of all G/L accounts within a specific company code, ledger, and fiscal period context.',
    fieldMappings: [
      { webField: 'Company Code', sapTable: 'FAGLFLEXT', sapField: 'BUKRS', desc: 'Identifies the legal company entity code (T001).' },
      { webField: 'Fiscal Year', sapTable: 'FAGLFLEXT', sapField: 'RYEAR', desc: 'The ledger reporting financial year.' },
      { webField: 'Reporting Period', sapTable: 'FAGLFLEXT', sapField: 'RPMAX', desc: 'Maximum period limit for summary posting computation.' },
      { webField: 'Ledger', sapTable: 'FAGLFLEXT', sapField: 'RLDNR', desc: 'Defines Leading Ledger (0L) or non-leading local ledger contexts.' },
      { webField: 'Opening Balance', sapTable: 'GLT0', sapField: 'HSLVT', desc: 'Balance brought forward in local company currency.' },
      { webField: 'Debit Accumulation', sapTable: 'GLT0', sapField: 'HSL01-16', desc: 'Sum of debit postings across periodic columns.' },
      { webField: 'Credit Accumulation', sapTable: 'GLT0', sapField: 'HSL01-16', desc: 'Sum of credit postings across periodic columns.' },
    ]
  },
  BALANCE_DISPLAY: {
    transactionCode: 'FAGLB03',
    sapTables: ['FAGLFLEXT', 'SKB1'],
    description: 'FAGLB03 Balance Display shows the monthly balance breakdowns, total credit, debit, and resulting cumulative balance for a single designated G/L account.',
    fieldMappings: [
      { webField: 'G/L Account', sapTable: 'SKB1', sapField: 'SAKNR', desc: 'G/L account number configured in Company Code chart.' },
      { webField: 'Company Code', sapTable: 'SKB1', sapField: 'BUKRS', desc: 'Company Code key.' },
      { webField: 'Fiscal Year', sapTable: 'FAGLFLEXT', sapField: 'RYEAR', desc: 'Standard ledger posting reporting year.' },
    ]
  },
  PROFIT_LOSS: {
    transactionCode: 'F.01',
    sapTables: ['FAGLFLEXT', 'SKA1', 'T011'],
    description: 'Generates structured Profit & Loss report summarizing revenues, raw material expenses, and personnel/salary expenditures mapped by SAP Financial Statement Versions (FSVs).',
    fieldMappings: [
      { webField: 'Revenue Nodes', sapTable: 'SKA1', sapField: 'KTOPL', desc: 'Chart of accounts account group mappings filtered for revenue classes.' },
      { webField: 'Expense Items', sapTable: 'FAGLFLEXT', sapField: 'HSLXX', desc: 'Periodic local currency totals aggregated for expense accounts.' },
    ]
  },
  BALANCE_SHEET: {
    transactionCode: 'F.01',
    sapTables: ['FAGLFLEXT', 'SKA1', 'T011'],
    description: 'Generates Assets, Liabilities, and Equity balances organized in standard corporate reporting structures based on SAP FSV nodes.',
    fieldMappings: [
      { webField: 'Asset Accounts', sapTable: 'SKA1', sapField: 'BILKT', desc: 'Group account number for Balance Sheet allocation.' },
      { webField: 'Liabilities / Equity', sapTable: 'FAGLFLEXT', sapField: 'HSL', desc: 'Balance sheet amount calculated as closing balance of active periods.' },
    ]
  },
  GENERAL_LEDGER: {
    transactionCode: 'FBL3N',
    sapTables: ['BSIS', 'BSAS', 'BKPF', 'BSEG'],
    description: 'G/L Account Line Item Display lists the granular journal transactions. BSIS represents open items; BSAS represents cleared items.',
    fieldMappings: [
      { webField: 'Posting Key', sapTable: 'BSEG', sapField: 'BSCHL', desc: 'Defines transaction type (Debit/Credit) and partner account type.' },
      { webField: 'Document Number', sapTable: 'BKPF', sapField: 'BELNR', desc: 'Uniquely identifies the financial journal receipt document.' },
      { webField: 'G/L Account Number', sapTable: 'BSEG', sapField: 'HKONT', desc: 'Target general ledger account of the posting split.' },
    ]
  },
  CUSTOMER_LEDGER: {
    transactionCode: 'FBL5N',
    sapTables: ['BSID', 'BSAD', 'KNA1', 'BSEG'],
    description: 'Customer Line Items Display. BSID handles open customer items, and BSAD stores historical cleared items linked to customer payments.',
    fieldMappings: [
      { webField: 'Customer Number', sapTable: 'KNA1', sapField: 'KUNNR', desc: 'Unique SAP system alphanumeric customer client identifier.' },
      { webField: 'Debit Flag (S)', sapTable: 'BSEG', sapField: 'SHKZG', desc: 'Soll (Debit) or Haben (Credit) flag indicator.' },
    ]
  },
  VENDOR_LEDGER: {
    transactionCode: 'FBL1N',
    sapTables: ['BSIK', 'BSAK', 'LFA1', 'BSEG'],
    description: 'Vendor Line Items Display. BSIK catalogs outstanding vendor obligations, and BSAK references settled invoices.',
    fieldMappings: [
      { webField: 'Vendor Code', sapTable: 'LFA1', sapField: 'LIFNR', desc: 'Unique alphanumeric vendor/supplier record ID.' },
      { webField: 'Document Type', sapTable: 'BKPF', sapField: 'BLART', desc: 'E.g., KR indicates Vendor Invoice, KZ indicates Vendor Payment.' },
    ]
  },
  FINANCIAL_DOCUMENT: {
    transactionCode: 'FB03',
    sapTables: ['BKPF', 'BSEG'],
    description: 'Display Document: Standard SAP transaction to review complete dual-entry accounting receipts. BKPF contains header metadata (document date, reference); BSEG contains dual debit/credit entries.',
    fieldMappings: [
      { webField: 'Document Number', sapTable: 'BKPF', sapField: 'BELNR', desc: 'Uniquely identifies the original ledger entry document.' },
      { webField: 'Line Item Number', sapTable: 'BSEG', sapField: 'BUZEI', desc: 'Line sequence number of the ledger balance split.' },
      { webField: 'Cost Center', sapTable: 'BSEG', sapField: 'KOSTL', desc: 'Operational department code absorbing administrative expense allocations.' },
      { webField: 'Profit Center', sapTable: 'BSEG', sapField: 'PRCTR', desc: 'Internal division responsible for distinct commercial revenue splits.' },
    ]
  },
  INVOICE: {
    transactionCode: 'VF03',
    sapTables: ['VBRK', 'VBRP', 'KNA1'],
    description: 'Display Billing Document: SAP SD-billing module viewer. VBRK hosts billing header metrics; VBRP contains materials, commercial quantities, and tax ratios.',
    fieldMappings: [
      { webField: 'Billing Document', sapTable: 'VBRK', sapField: 'VBELN', desc: 'Sales & Distribution invoice identifier.' },
      { webField: 'Material Number', sapTable: 'VBRP', sapField: 'MATNR', desc: 'Inventory stock or service material ID code.' },
      { webField: 'Billing Quantity', sapTable: 'VBRP', sapField: 'FKIMG', desc: 'Physical quantity shipped and commercially billed.' },
    ]
  }
};
