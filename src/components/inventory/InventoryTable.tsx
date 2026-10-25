import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  Search,
  Trash2,
  Receipt,
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Tag,
  Plus,
  Edit2,
  Share2,
  Check,
  AlertCircle,
  Coins,
} from 'lucide-react';
import { SlipEntry, SectionCategory } from '../../types/inventory';
import { RESTAURANT_METADATA } from '../../data/restaurantItems';
import { playHapticSound } from '../../services/dbService';
import { downloadSafeCsv } from '../../lib/security';

interface InventoryTableProps {
  slips: SlipEntry[];
  onDeleteSlip: (id: string) => void;
  onEditSlip: (slip: SlipEntry) => void;
  onOpenNewSlip: () => void;
  initialSearch?: string;
  onShowToast?: (toast: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  slips,
  onDeleteSlip,
  onEditSlip,
  onOpenNewSlip,
  initialSearch = '',
  onShowToast,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [deletingSlipId, setDeletingSlipId] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const itemsPerPage = 7;

  // Sync initialSearch if prop changes
  React.useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  // Available unique years from slips or default years
  const availableYears = useMemo(() => {
    const years = new Set<string>(['2024', '2025', '2026', '2027']);
    slips.forEach((s) => {
      if (s.date && s.date.length >= 4) {
        years.add(s.date.slice(0, 4));
      }
    });
    return Array.from(years).sort().reverse();
  }, [slips]);

  // Filtering slips
  const filteredSlips = useMemo(() => {
    return slips.filter((slip) => {
      // Search filter
      const matchesSearch =
        !search ||
        slip.itemName.toLowerCase().includes(search.toLowerCase()) ||
        slip.slipNumber.toLowerCase().includes(search.toLowerCase()) ||
        slip.remarks.toLowerCase().includes(search.toLowerCase()) ||
        slip.category.toLowerCase().includes(search.toLowerCase());

      // Year filter
      const slipYear = slip.date.slice(0, 4);
      const matchesYear = selectedYear === 'all' || slipYear === selectedYear;

      // Month filter
      const slipMonth = slip.date.slice(5, 7);
      const matchesMonth = selectedMonth === 'all' || slipMonth === selectedMonth;

      // Category filter
      const matchesCat =
        selectedCategory === 'all' || slip.category === selectedCategory;

      return matchesSearch && matchesYear && matchesMonth && matchesCat;
    });
  }, [slips, search, selectedYear, selectedMonth, selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredSlips.length / itemsPerPage) || 1;
  const currentSlips = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSlips.slice(start, start + itemsPerPage);
  }, [filteredSlips, currentPage, itemsPerPage]);

  const totalFilteredExpense = useMemo(() => {
    return filteredSlips.reduce((acc, curr) => acc + curr.priceRs, 0);
  }, [filteredSlips]);

  // Export to CSV with Formula Injection Protection (CWE-1236)
  const handleExportCSV = () => {
    if (filteredSlips.length === 0) {
      onShowToast?.({
        type: 'warning',
        title: 'No Data to Export',
        message: 'No slips match your active filter.',
      });
      return;
    }

    const headers = [
      'Slip Number',
      'Date',
      'Item Name',
      'Category',
      'Quantity',
      'Unit',
      'Unit Rate (Rs.)',
      'Total Price (Rs.)',
      'Remarks',
      'Recorded By',
      'Status',
    ];

    const rows = filteredSlips.map((s) => [
      s.slipNumber,
      s.date,
      s.itemName,
      s.category,
      s.quantity,
      s.unit,
      s.unitPriceRs,
      s.priceRs,
      s.remarks,
      s.loggedBy,
      s.status,
    ]);

    const filename = `Bite_Restaurant_Larkana_Slips_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadSafeCsv(filename, headers, rows);

    playHapticSound('success');
    onShowToast?.({
      type: 'success',
      title: 'CSV Export Complete',
      message: `${filteredSlips.length} paper slips safely downloaded to your device.`,
    });
  };

  // Share slips summary via WhatsApp
  const handleShareWhatsApp = () => {
    if (filteredSlips.length === 0) return;
    const textLines = [
      `*${RESTAURANT_METADATA.name}*`,
      `*Branch:* ${RESTAURANT_METADATA.branch}`,
      `*Inventory Slips Summary:*`,
      `--------------------------------`,
      ...filteredSlips.slice(0, 15).map(
        (s) => `• ${s.date} | ${s.itemName} (${s.quantity} ${s.unit}) = Rs. ${s.priceRs.toLocaleString()}`
      ),
      `--------------------------------`,
      `*Total Slips:* ${filteredSlips.length}`,
      `*Total Expense:* Rs. ${totalFilteredExpense.toLocaleString()}`,
    ];
    const text = textLines.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    playHapticSound('tap');
    setTimeout(() => setCopiedShare(false), 2000);
    onShowToast?.({
      type: 'info',
      title: 'WhatsApp Slip Copied!',
      message: 'Paste into WhatsApp to send to suppliers or management.',
    });
  };

  const confirmDelete = (id: string) => {
    onDeleteSlip(id);
    setDeletingSlipId(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search slip #, item, category, remarks..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playHapticSound('tap');
                onOpenNewSlip();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Log Slip</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1 transition-colors"
              title="Export filtered records to CSV spreadsheet"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1 transition-colors"
              title="Copy WhatsApp formatted summary"
            >
              {copiedShare ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4 text-cyan-400" />
              )}
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Filters Row: Category, Year, Month */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80">
          {/* Section Category */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
              playHapticSound('tap');
            }}
            className="w-full px-2.5 py-1.5 text-[11px] rounded-lg bg-slate-950 border border-slate-700 text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Sections</option>
            <option value="BBQ Section">BBQ Section</option>
            <option value="Roll Section">Roll Section</option>
            <option value="Naan Section">Naan Section</option>
            <option value="Karahi Section">Karahi Section</option>
            <option value="Pizza & Fast Food">Pizza & Fast Food</option>
            <option value="Disposal Demand">Disposal Demand</option>
            <option value="Vegetables & Misc">Vegetables & Misc</option>
          </select>

          {/* Year Archive Filter */}
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentPage(1);
              playHapticSound('tap');
            }}
            className="w-full px-2.5 py-1.5 text-[11px] rounded-lg bg-slate-950 border border-slate-700 text-slate-300 focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="all">All Years</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                Year {yr}
              </option>
            ))}
          </select>

          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setCurrentPage(1);
              playHapticSound('tap');
            }}
            className="w-full px-2.5 py-1.5 text-[11px] rounded-lg bg-slate-950 border border-slate-700 text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Months</option>
            <option value="01">Jan</option>
            <option value="02">Feb</option>
            <option value="03">Mar</option>
            <option value="04">Apr</option>
            <option value="05">May</option>
            <option value="06">Jun</option>
            <option value="07">Jul</option>
            <option value="08">Aug</option>
            <option value="09">Sep</option>
            <option value="10">Oct</option>
            <option value="11">Nov</option>
            <option value="12">Dec</option>
          </select>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-400">
        <div>
          Showing <span className="text-white font-bold">{filteredSlips.length}</span> recorded slip(s)
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
          <Coins className="w-3.5 h-3.5" />
          <span>Total: Rs. {totalFilteredExpense.toLocaleString()}</span>
        </div>
      </div>

      {/* Slips Cards List (Mobile Optimized) */}
      <div className="space-y-2.5">
        <AnimatePresence>
          {currentSlips.map((slip) => (
            <motion.div
              key={slip.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/30 transition-all shadow-md group relative"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm tracking-tight">
                      {slip.itemName}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {slip.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                    <span>{slip.slipNumber}</span>
                    <span>•</span>
                    <span>{slip.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    Rs. {slip.priceRs.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {slip.quantity} {slip.unit} @ Rs. {slip.unitPriceRs}
                  </div>
                </div>
              </div>

              {/* Remarks */}
              {slip.remarks && (
                <div className="text-[11px] text-slate-400 italic bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800/80 mb-2">
                  "{slip.remarks}"
                </div>
              )}

              {/* Bottom Actions: Recorded By + Edit + Delete */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                <span>By: {slip.loggedBy}</span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      playHapticSound('tap');
                      onEditSlip(slip);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors flex items-center gap-1 text-[11px]"
                    title="Edit slip record"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  {deletingSlipId === slip.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => confirmDelete(slip.id)}
                        className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeletingSlipId(null)}
                        className="px-1.5 py-1 rounded bg-slate-800 text-slate-300 text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        playHapticSound('tap');
                        setDeletingSlipId(slip.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete slip record"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {filteredSlips.length === 0 && (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-cyan-400 mx-auto flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">No Slips Found</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                {slips.length === 0
                  ? 'Your Larkana restaurant ledger has a clean zero baseline. Ready to log your first slip!'
                  : 'No slips match your current search and date filters.'}
              </p>
            </div>
            <button
              onClick={() => {
                playHapticSound('tap');
                onOpenNewSlip();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold shadow-md shadow-cyan-600/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Log First Paper Slip</span>
            </button>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
          <button
            onClick={() => {
              playHapticSound('tap');
              setCurrentPage((p) => Math.max(1, p - 1));
            }}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <span className="font-mono">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => {
              playHapticSound('tap');
              setCurrentPage((p) => Math.min(totalPages, p + 1));
            }}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
