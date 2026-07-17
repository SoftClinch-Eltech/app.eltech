import App from "@/src/App";

export function generateStaticParams() {
  return [
    { slug: [] },
    { slug: ['login'] },
    { slug: ['dashboard'] },
    { slug: ['financial-statements'] },
    { slug: ['trial-balance-select'] },
    { slug: ['trial-balance-report'] },
    { slug: ['balance-display-select'] },
    { slug: ['balance-display-report'] },
    { slug: ['profit-loss-select'] },
    { slug: ['profit-loss-report'] },
    { slug: ['balance-sheet-select'] },
    { slug: ['balance-sheet-report'] },
    { slug: ['ledger-reporting'] },
    { slug: ['gl-ledger-select'] },
    { slug: ['gl-ledger-report'] },
    { slug: ['customer-ledger-select'] },
    { slug: ['customer-ledger-report'] },
    { slug: ['vendor-ledger-select'] },
    { slug: ['vendor-ledger-report'] },
    { slug: ['stock-report'] },
    { slug: ['document-display'] },
    { slug: ['financial-document-select'] },
    { slug: ['financial-document-report'] },
    { slug: ['invoice-select'] },
    { slug: ['invoice-report'] },
    { slug: ['purchase-order-report'] },
    { slug: ['user-master'] },
    { slug: ['user-details'] },
    { slug: ['settings'] },
    { slug: ['settings-details'] },
  ];
}

export default function Page() {
  return <App />;
}
