import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Printer,
  Copy,
  Check,
  Share2,
  FileText,
  Building2,
  CheckCircle2,
  ShoppingBag,
  Send,
} from 'lucide-react';
import { ItemMaster, DepartmentTracker } from '../../types/inventory';
import { RESTAURANT_METADATA } from '../../data/restaurantItems';

interface ProcurementSlipViewProps {
  items: ItemMaster[];
  departmentTrackers: DepartmentTracker[];
  onClearDemands: () => void;
}

export const ProcurementSlipView: React.FC<ProcurementSlipViewProps> = ({
  items,
  departmentTrackers,
  onClearDemands,
}) => {
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [voucherNumber] = useState(() => `${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);

  const demandingItems = items.filter((i) => i.pendingDemand > 0);
  const totalEstimatedCost = demandingItems.reduce(
    (acc, curr) => acc + curr.pendingDemand * curr.estimatedPriceRs,
    0
  );

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const generateTextSlip = () => {
    const dateStr = new Date().toLocaleDateString('en-PK', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    let text = `*${RESTAURANT_METADATA.name} - DEMAND SLIP*\n`;
    text += `Branch: ${RESTAURANT_METADATA.branch}\n`;
    text += `Date: ${dateStr}\n`;
    text += `Manager: ${RESTAURANT_METADATA.manager}\n`;
    text += `------------------------------------\n`;
    text += `*ITEMS REQUIRED FOR PURCHASE:*\n`;

    demandingItems.forEach((item, index) => {
      text += `${index + 1}. ${item.name} (${item.section}): ${item.pendingDemand} ${item.unit} ~ Rs. ${(item.pendingDemand * item.estimatedPriceRs).toLocaleString()}\n`;
    });

    text += `------------------------------------\n`;
    text += `*Total Estimated Amount:* Rs. ${totalEstimatedCost.toLocaleString()}\n`;
    const pendingBatches = departmentTrackers
      .filter((d) => d.pendingItemsCount > 0)
      .map((d) => d.name)
      .join(', ');
    if (pendingBatches) {
      text += `*Active Department Demands:* ${pendingBatches}\n`;
    }
    return text;
  };

  const handleCopyText = () => {
    const text = generateTextSlip();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 backdrop-blur-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Market Demand & Procurement Slip
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
              Ready for Vendors
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated slip of active kitchen demands for Larkana wholesale market purchase
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Slip Text!' : 'Copy WhatsApp Format'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Print Paper Slip</span>
          </button>
        </div>
      </div>

      {/* Printable Paper Slip Container */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Slip Watermark / Decorative */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Paper Slip Top Header */}
        <div className="border-b border-dashed border-slate-700 pb-5 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white print:text-black">
              {RESTAURANT_METADATA.name}
            </h1>
            <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider print:text-slate-700">
              Daily Kitchen Demand & Procurement Voucher
            </p>
            <p className="text-[11px] text-slate-400 print:text-slate-600 mt-0.5">
              {RESTAURANT_METADATA.branch} • Phone: {RESTAURANT_METADATA.phone}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 print:text-slate-600">
            <p className="font-mono font-bold text-white print:text-black">
              VOUCHER #{voucherNumber}
            </p>
            <p>Date: {new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            <p>Manager: {RESTAURANT_METADATA.manager}</p>
          </div>
        </div>

        {/* Demand Items Checklist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 print:bg-slate-100 print:text-black">
              <tr>
                <th className="py-2.5 px-3 w-8">Check</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3">Kitchen Department</th>
                <th className="py-2.5 px-3">Demand QTY</th>
                <th className="py-2.5 px-3 font-mono">Est. Unit Rate</th>
                <th className="py-2.5 px-3 font-mono text-right">Est. Total (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
              {demandingItems.map((item, idx) => {
                const isChecked = !!checkedItems[item.id];
                const itemTotalRs = item.pendingDemand * item.estimatedPriceRs;
                return (
                  <tr
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${
                      isChecked ? 'opacity-60 line-through' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheck(item.id)}
                        className="rounded border-slate-700 bg-slate-800 text-cyan-500 w-4 h-4 cursor-pointer accent-cyan-500"
                      />
                    </td>
                    <td className="py-3 px-3 font-bold text-white print:text-black">
                      {idx + 1}. {item.name}
                    </td>
                    <td className="py-3 px-3 text-slate-400 print:text-slate-700">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 border border-slate-700 text-slate-300 print:border-none">
                        {item.section}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-cyan-400 print:text-black font-mono">
                      {item.pendingDemand} {item.unit}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 print:text-slate-700">
                      Rs. {item.estimatedPriceRs.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-right text-white print:text-black">
                      Rs. {itemTotalRs.toLocaleString()}
                    </td>
                  </tr>
                );
              })}

              {demandingItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-teal-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">All Demands Fulfilled</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No kitchen stations currently have pending requisition requests.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paper Slip Summary Footer */}
        <div className="mt-6 pt-5 border-t border-dashed border-slate-700 print:border-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-xs text-slate-400 print:text-slate-600">
            <p className="font-semibold text-white print:text-black">Procurement Signatures:</p>
            <div className="flex gap-8 mt-4 text-[11px]">
              <div>
                <div className="w-32 border-b border-slate-600 print:border-black mb-1" />
                <span>Store Keeper (Mukhtiar)</span>
              </div>
              <div>
                <div className="w-32 border-b border-slate-600 print:border-black mb-1" />
                <span>Store Manager (IB Junejo)</span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 print:text-slate-600 block">
              Total Estimated Requisition Value:
            </span>
            <span className="text-2xl font-black text-cyan-400 print:text-black font-mono">
              Rs. {totalEstimatedCost.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
