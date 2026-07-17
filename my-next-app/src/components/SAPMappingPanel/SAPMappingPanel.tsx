import React, { useState } from 'react';
import { Screen } from '../../types';
import { sapMappingDictionary } from '../../data/sapMockData';
import { Database, Cpu, HelpCircle, Terminal, Layers, X } from 'lucide-react';

interface SAPMappingPanelProps {
  activeScreen: Screen;
}

export const SAPMappingPanel: React.FC<SAPMappingPanelProps> = ({ activeScreen }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Derive which mapping key to use based on the active screen
  const getMappingKey = (screen: Screen): string | null => {
    if (screen.includes('TRIAL_BALANCE')) return 'TRIAL_BALANCE';
    if (screen.includes('BALANCE_DISP')) return 'BALANCE_DISPLAY';
    if (screen.includes('PROFIT_LOSS')) return 'PROFIT_LOSS';
    if (screen.includes('BALANCE_SHEET')) return 'BALANCE_SHEET';
    if (screen.includes('GL_LEDGER')) return 'GENERAL_LEDGER';
    if (screen.includes('CUSTOMER_LEDGER')) return 'CUSTOMER_LEDGER';
    if (screen.includes('VENDOR_LEDGER')) return 'VENDOR_LEDGER';
    if (screen.includes('FIN_DOC')) return 'FINANCIAL_DOCUMENT';
    if (screen.includes('INVOICE')) return 'INVOICE';
    return null;
  };

  const key = getMappingKey(activeScreen);
  if (!key) return null;

  const mapping = sapMappingDictionary[key];
  if (!mapping) return null;

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="fixed bottom-6 right-6 z-40">
        {/* Trigger Button - Floating Circle */}
        <button
          id="btn-diagnostics-toggle"
          onClick={() => setIsOpen(true)}
          className="relative w-12 h-12 rounded-full flex items-center justify-center bg-[#273B5E] hover:bg-[#1E293B] text-white shadow-xl border-2 border-orange-400 transition-all hover:scale-110 active:scale-95 group hover:shadow-orange-500/20"
          title={`SAP Technical Mapping: ${mapping.transactionCode}`}
        >
          <Database className="w-5 h-5 text-orange-400 animate-pulse group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Slide-out Drawer */}
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 z-45 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed top-0 right-0 h-screen w-96 max-w-full bg-white shadow-2xl border-l-4 border-orange-500 z-50 flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#273B5E] to-orange-700 text-white p-4 flex items-center justify-between border-b-2 border-orange-500 shrink-0">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-orange-300" />
                <div>
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider">SAP Technical Mapping</h4>
                  <p className="text-[10px] text-orange-200 font-bold font-mono">Transaction Code: {mapping.transactionCode}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-orange-200 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Tables Info */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-mono text-gray-400 block font-bold">Target ERP Tables</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {mapping.sapTables.map((table) => (
                    <span
                      key={table}
                      className="px-2 py-0.5 bg-orange-50 text-orange-800 border border-orange-200 rounded font-mono text-[10px] font-bold"
                    >
                      {table}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="bg-orange-50/40 p-3 rounded border border-orange-100 text-[11px] text-slate-700 leading-relaxed font-sans">
                <strong className="text-orange-800">Process Context:</strong> {mapping.description}
              </div>

              {/* Field Mappings */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-mono text-gray-400 block font-bold">Field-level Schema Mappings</span>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded overflow-hidden">
                  {mapping.fieldMappings.map((f, i) => (
                    <div key={i} className="p-2.5 hover:bg-orange-50/20 hover:border-l-4 hover:border-orange-500 transition-all text-[10.5px] flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">{f.webField}</span>
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-gray-400">{f.sapTable}-</span>
                          <span className="text-orange-600 font-bold">{f.sapField}</span>
                        </div>
                      </div>
                      <p className="text-gray-500 text-[9.5px] leading-tight font-sans">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer mapping info */}
            <div className="bg-slate-50 p-3 border-t border-slate-100 text-[10px] font-mono text-slate-500 flex items-center gap-1.5 justify-center shrink-0">
              <Layers className="w-3.5 h-3.5 text-orange-500" />
              <span>Softclinch Consult Services v12.1</span>
            </div>
          </div>
        </>
      )}
    </>
  );
};
