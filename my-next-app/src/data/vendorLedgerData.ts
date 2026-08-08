export interface VendorLedgerItem {
  documentno: string;
  doc_type?: string | null;
  g_l_acct2: string;
  cocode: string;
  assignment: string | null;
  amount_lc: number;
  amount1: number;
  d_c_indic: string;
  vendor: string;
  material: string | null;
  customer: string | null;
  profit_ctr: string | null;
  cost_ctr: string | null;
  postkey: string;
  clgentdate: string | null;
  posting_date: string;
  reference_key: string;
  vendor_name: string | null;
}

export interface VendorTotalsItem {
  vendor: string;
  vendor_name: string | null;
  amount_lc: number;
  amount1: number;
}

export interface VendorLedgerResponse {
  data: VendorLedgerItem[];
  vendor_totals: VendorTotalsItem[];
  grand_total: {
    amount_lc: number;
    amount1: number;
  };
}

export const sampleVendorLedgerData: VendorLedgerItem[] = [
  {
    documentno: "3624500020",
    g_l_acct2: "10501001",
    cocode: "6000",
    assignment: "RTGS TRANSFER",
    amount_lc: 20959.00,
    amount1: 20959.00,
    d_c_indic: "S",
    vendor: "100860",
    material: null,
    customer: null,
    profit_ctr: "PC-100",
    cost_ctr: "CC-100",
    postkey: "25",
    clgentdate: "2024-04-15",
    posting_date: "2024-04-02",
    reference_key: "36245002060002024",
    vendor_name: "TechProcure Solutions Pvt Ltd"
  },
  {
    documentno: "1900000201",
    g_l_acct2: "21000002",
    cocode: "6000",
    assignment: "INV-900201",
    amount_lc: 240000.00,
    amount1: 240000.00,
    d_c_indic: "H",
    vendor: "700021",
    material: "MAT-STEEL-BEAM-H",
    customer: null,
    profit_ctr: "PC-100",
    cost_ctr: "CC-300",
    postkey: "31",
    clgentdate: null,
    posting_date: "2024-04-15",
    reference_key: "190000020160002024",
    vendor_name: "Global Steel & Logistics Co"
  },
  {
    documentno: "1900000101",
    g_l_acct2: "21000001",
    cocode: "6000",
    assignment: "PO-7001001",
    amount_lc: 125000.00,
    amount1: 125000.00,
    d_c_indic: "H",
    vendor: "0000200501",
    material: "MAT-FIBER-01",
    customer: null,
    profit_ctr: "PC-100",
    cost_ctr: "CC-200",
    postkey: "31",
    clgentdate: null,
    posting_date: "2024-04-10",
    reference_key: "190000010160002024",
    vendor_name: "Apex Engineering Supplies Ltd"
  },
  {
    documentno: "1900000102",
    g_l_acct2: "21000001",
    cocode: "6000",
    assignment: "PO-7001002",
    amount_lc: 85400.50,
    amount1: 85400.50,
    d_c_indic: "H",
    vendor: "0000200501",
    material: "MAT-EPOXY-05",
    customer: null,
    profit_ctr: "PC-100",
    cost_ctr: "CC-200",
    postkey: "31",
    clgentdate: "2024-04-28",
    posting_date: "2024-04-12",
    reference_key: "190000010260002024",
    vendor_name: "Apex Engineering Supplies Ltd"
  },
  {
    documentno: "1900000202",
    g_l_acct2: "21000002",
    cocode: "6000",
    assignment: "PAY-500202",
    amount_lc: 240000.00,
    amount1: 240000.00,
    d_c_indic: "S",
    vendor: "700021",
    material: null,
    customer: null,
    profit_ctr: "PC-100",
    cost_ctr: "CC-300",
    postkey: "25",
    clgentdate: "2024-04-25",
    posting_date: "2024-04-25",
    reference_key: "190000020260002024",
    vendor_name: "Global Steel & Logistics Co"
  }
];
