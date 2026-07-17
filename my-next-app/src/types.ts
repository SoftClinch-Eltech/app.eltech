/**
 * Softclinch Consult Services
 * TypeScript Types & Interfaces
 */

export type Screen =
  | 'LOGIN'
  | 'DASHBOARD'
  // Module 1: Financial Statements
  | 'FIN_STATEMENTS_MAIN'
  | 'TRIAL_BALANCE_SEL' | 'TRIAL_BALANCE_REP'
  | 'BALANCE_DISP_SEL' | 'BALANCE_DISP_REP'
  | 'PROFIT_LOSS_SEL' | 'PROFIT_LOSS_REP'
  | 'BALANCE_SHEET_SEL' | 'BALANCE_SHEET_REP'
  // Module 2: Ledger Reporting
  | 'LEDGER_REP_MAIN'
  | 'GL_LEDGER_SEL' | 'GL_LEDGER_REP'
  | 'CUSTOMER_LEDGER_SEL' | 'CUSTOMER_LEDGER_REP'
  | 'VENDOR_LEDGER_SEL' | 'VENDOR_LEDGER_REP'
  | 'STOCK_REP'
  // Module 3: Document Display
  | 'DOC_DISPLAY_MAIN'
  | 'FIN_DOC_SEL' | 'FIN_DOC_REP' // FB03
  | 'INVOICE_SEL' | 'INVOICE_REP' // VF03
  | 'PO_REP'
  // Module 4: User Master
  | 'USER_MASTER_MAIN'
  | 'USER_DETAILS'
  // Module 5: Settings
  | 'SETTINGS_MAIN'
  | 'SETTINGS_DETAILS';

export interface SAPMapping {
  transactionCode: string;
  sapTables: string[];
  description: string;
  fieldMappings: { webField: string; sapTable: string; sapField: string; desc: string }[];
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'Solution Architect' | 'Functional Consultant' | 'Finance Manager' | 'Accountant' | 'Auditor';
  department: string;
  permissions: {
    fb03: boolean;
    vf03: boolean;
    fbl3n: boolean;
    fbl5n: boolean;
    fbl1n: boolean;
    userMaster: boolean;
    settings: boolean;
  };
  status: 'Active' | 'Locked' | 'Inactive';
  lastLogin: string;
}

// BKPF - Accounting Document Header (SAP Standard)
export interface BKPF {
  BELNR: string; // Document Number
  BUKRS: string; // Company Code
  GJAHR: string; // Fiscal Year
  BLART: string; // Document Type
  BLDAT: string; // Document Date
  BUDAT: string; // Posting Date
  MONAT: string; // Posting Period
  USNAM: string; // User Name
  WAERS: string; // Currency
  XBLNR: string; // Reference Document Number
  BKTXT: string; // Document Header Text
}

// BSEG - Accounting Document Segment (SAP Standard Line Items)
export interface BSEG {
  BELNR: string; // Document Number
  BUKRS: string; // Company Code
  GJAHR: string; // Fiscal Year
  BUZEI: string; // Line Item Number
  BSCHL: string; // Posting Key (e.g. 40 Debit, 50 Credit)
  KOART: string; // Account Type (S=G/L, D=Customer, K=Vendor, M=Material)
  HKONT: string; // G/L Account Number
  KUNNR?: string; // Customer Number
  LIFNR?: string; // Vendor Number
  WRBTR: number; // Amount in document currency
  SHKZG: 'S' | 'H'; // Debit/Credit Indicator (S=Debit/Soll, H=Credit/Haben)
  MWSKZ?: string; // Tax Code
  PRCTR?: string; // Profit Center
  KOSTL?: string; // Cost Center
  SGTXT?: string; // Item Text
}

// VBRK - Billing Document Header (SAP Invoice Header)
export interface VBRK {
  VBELN: string; // Billing Document Number
  FKART: string; // Billing Type
  FKDAT: string; // Billing Date
  BUKRS: string; // Company Code
  NETWR: number; // Net Value
  MWSBK: number; // Tax Amount
  WAERK: string; // Currency
  KUNRG: string; // Payer Customer Number
  KUNRE: string; // Bill-to Party Customer Number
}

// VBRP - Billing Document Item (SAP Invoice Line Items)
export interface VBRP {
  VBELN: string; // Billing Document Number
  POSNR: string; // Item Number
  MATNR: string; // Material Number
  ARKTX: string; // Material Description
  FKIMG: number; // Billing Quantity
  VRKME: string; // Sales Unit
  NETWR: number; // Net Value
  MWSBP: number; // Tax Amount
  PRCTR?: string; // Profit Center
  KOSTL?: string; // Cost Center
}

// KNA1 - Customer Master (SAP Customer General Data)
export interface KNA1 {
  KUNNR: string; // Customer Number
  NAME1: string; // Name 1
  STRAS: string; // Street Address
  ORT01: string; // City
  PSTLZ: string; // Postal Code
  LAND1: string; // Country Key
}

// LFA1 - Vendor Master (SAP Vendor General Data)
export interface LFA1 {
  LIFNR: string; // Vendor Number
  NAME1: string; // Name 1
  STRAS: string; // Street Address
  ORT01: string; // City
  PSTLZ: string; // Postal Code
  LAND1: string; // Country Key
}

export interface TrialBalanceItem {
  account: string;
  description: string;
  openingBalance: number;
  debit: number;
  credit: number;
  closingBalance: number;
  category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
}

export interface LedgerEntry {
  postingDate: string;
  documentNum: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  ipAddress: string;
}
