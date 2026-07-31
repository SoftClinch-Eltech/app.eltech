export interface GeneralLedgerItem {
  documentno: string;
  g_l_acct2: string;
  cocode: string;
  assignment?: string | null;
  amount_lc: number;
  amount1?: number;
  d_c_indic: string;
  customer?: string | null;
  material?: string | null;
  vendor?: string | null;
  profit_ctr?: string | null;
  cost_ctr?: string | null;
  postkey?: string | null;
  clgentdate?: string | null;
  posting_date: string;
  reference_key?: string | null;
}

export const sampleGeneralLedgerData: GeneralLedgerItem[] = [
  {
    documentno: "2624600088",
    g_l_acct2: "20401001",
    cocode: "6000",
    assignment: "6242000127",
    amount_lc: 260000,
    amount1: 260000,
    d_c_indic: "S",
    customer: "6600553",
    material: null,
    vendor: null,
    profit_ctr: null,
    cost_ctr: null,
    postkey: "1",
    clgentdate: "2024-04-12",
    posting_date: "2024-04-12",
    reference_key: "6242000127"
  },
  {
    documentno: "3624400050",
    g_l_acct2: "10502004",
    cocode: "6000",
    assignment: "614-008",
    amount_lc: 18500,
    amount1: 18500,
    d_c_indic: "H",
    customer: null,
    material: null,
    vendor: "6100747",
    profit_ctr: null,
    cost_ctr: null,
    postkey: "31",
    clgentdate: "2024-04-23",
    posting_date: "2024-04-01",
    reference_key: "362440005060002024"
  },
  {
    documentno: "3624400051",
    g_l_acct2: "10502004",
    cocode: "6000",
    assignment: "614-009",
    amount_lc: 37500.16,
    amount1: 37500.16,
    d_c_indic: "H",
    customer: null,
    material: null,
    vendor: "6100748",
    profit_ctr: null,
    cost_ctr: null,
    postkey: "31",
    clgentdate: "2024-04-24",
    posting_date: "2024-04-02",
    reference_key: "362440005160002024"
  },
  {
    documentno: "3624400052",
    g_l_acct2: "10502004",
    cocode: "6000",
    assignment: "614-010",
    amount_lc: 12000,
    amount1: 12000,
    d_c_indic: "S",
    customer: "410029",
    material: null,
    vendor: null,
    profit_ctr: null,
    cost_ctr: null,
    postkey: "40",
    clgentdate: null,
    posting_date: "2024-04-05",
    reference_key: "362440005260002024"
  },
  {
    documentno: "3624400053",
    g_l_acct2: "10502008",
    cocode: "6000",
    assignment: "HT2407I008393873",
    amount_lc: 95400,
    amount1: 95400,
    d_c_indic: "S",
    customer: null,
    material: null,
    vendor: "6100802",
    profit_ctr: "PC6000",
    cost_ctr: "CC1020",
    postkey: "40",
    clgentdate: null,
    posting_date: "2024-04-10",
    reference_key: "362440005360002024"
  },
  {
    documentno: "3624400054",
    g_l_acct2: "10502008",
    cocode: "6000",
    assignment: "HT2407I008393874",
    amount_lc: 45000,
    amount1: 45000,
    d_c_indic: "H",
    customer: null,
    material: null,
    vendor: "6100805",
    profit_ctr: "PC6000",
    cost_ctr: "CC1020",
    postkey: "50",
    clgentdate: "2024-04-28",
    posting_date: "2024-04-15",
    reference_key: "362440005460002024"
  },
  {
    documentno: "3624400055",
    g_l_acct2: "10502010",
    cocode: "6000",
    assignment: "INV-2024-991",
    amount_lc: 125000.5,
    amount1: 125000.5,
    d_c_indic: "S",
    customer: "410095",
    material: "MAT-902",
    vendor: null,
    profit_ctr: "PC6000",
    cost_ctr: null,
    postkey: "01",
    clgentdate: null,
    posting_date: "2024-04-20",
    reference_key: "362440005560002024"
  },
  {
    documentno: "3624400056",
    g_l_acct2: "10502010",
    cocode: "6000",
    assignment: "INV-2024-992",
    amount_lc: 62400,
    amount1: 62400,
    d_c_indic: "H",
    customer: null,
    material: null,
    vendor: "6100880",
    profit_ctr: "PC6000",
    cost_ctr: "CC1010",
    postkey: "50",
    clgentdate: "2024-04-29",
    posting_date: "2024-04-25",
    reference_key: "362440005660002024"
  },
  {
    documentno: "3624400057",
    g_l_acct2: "10502004",
    cocode: "6000",
    assignment: "614-015",
    amount_lc: 28900,
    amount1: 28900,
    d_c_indic: "S",
    customer: "410102",
    material: null,
    vendor: null,
    profit_ctr: null,
    cost_ctr: null,
    postkey: "40",
    clgentdate: null,
    posting_date: "2024-04-26",
    reference_key: "362440005760002024"
  }
];
