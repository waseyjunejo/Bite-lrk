import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Search,
  Filter,
  Share2,
  Copy,
  Check,
  Receipt,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SlipEntry, ItemMaster, SectionCategory } from '../../types/inventory';
import { playHapticSound } from '../../services/dbService';

interface MonthComparisonViewProps {
  slips: SlipEntry[];
  items: ItemMaster[];
  onOpenNewSlip?: () => void;
  onShowToast?: (toast: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }) => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SECTIONS: SectionCategory[] = [
  'BBQ Section',
  'Roll Section',
  'Naan Section',
  'Karahi Section',
  'Pizza & Fast Food',
  'Disposal Demand',
  'Vegetables & Misc',
  'Department Trackers',
];

export const MonthComparisonView: React.FC<MonthComparisonViewProps> = ({
  slips,
  items,
  onOpenNewSlip,
  onShowToast,
}) => {
  // Current calendar dates for default setup
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
  const prevMonthNum = String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, '0');
  const prevMonthYear = now.getMonth() === 0 ? currentYear - 1 : currentYear;

  const defaultMonthB = `${currentYear}-${currentMonthNum}`;
  const defaultMonthA = `${prevMonthYear}-${prevMonthNum}`;

  // Month A (Base Month) and Month B (Comparison Month)
  const [monthA, setMonthA] = useState<string>(defaultMonthA);
  const [monthB, setMonthB] = useState<string>(defaultMonthB);

  // Item Search and Filter inside Comparison
  const [itemSearchQuery, setItemSearchQuery] = useState<string>('');
  const [rateFilter, setRateFilter] = useState<'all' | 'increased' | 'decreased' | 'unchanged' | 'new_or_dropped'>('all');
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Extract all distinct year-months that have recorded slips in the database
  const recordedMonths = useMemo(() => {
    const set = new Set<string>();
    slips.forEach((s) => {
      if (s.date && s.date.length >= 7) {
        set.add(s.date.slice(0, 7));
      }
    });
    // Add default months if not present so dropdowns always have sensible options
    set.add(defaultMonthA);
    set.add(defaultMonthB);
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [slips, defaultMonthA, defaultMonthB]);

  // Format YYYY-MM to readable string (e.g. "May 2026")
  const formatMonthLabel = (ym: string) => {
    if (!ym || ym.length < 7) return ym;
    const [year, mStr] = ym.split('-');
    const mIdx = parseInt(mStr, 10) - 1;
    return `${MONTH_NAMES[mIdx] || mStr} ${year}`;
  };

  // Filter slips strictly for Month A and Month B
  const slipsMonthA = useMemo(() => {
    return slips.filter((s) => s.date.startsWith(monthA));
  }, [slips, monthA]);

  const slipsMonthB = useMemo(() => {
    return slips.filter((s) => s.date.startsWith(monthB));
  }, [slips, monthB]);

  // Aggregate Metrics for Month A
  const metricsA = useMemo(() => {
    const totalSpendRs = slipsMonthA.reduce((sum, s) => sum + (s.priceRs || 0), 0);
    const totalVolume = slipsMonthA.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const slipCount = slipsMonthA.length;
    const avgSlipValue = slipCount > 0 ? Math.round(totalSpendRs / slipCount) : 0;
    return { totalSpendRs, totalVolume, slipCount, avgSlipValue };
  }, [slipsMonthA]);

  // Aggregate Metrics for Month B
  const metricsB = useMemo(() => {
    const totalSpendRs = slipsMonthB.reduce((sum, s) => sum + (s.priceRs || 0), 0);
    const totalVolume = slipsMonthB.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const slipCount = slipsMonthB.length;
    const avgSlipValue = slipCount > 0 ? Math.round(totalSpendRs / slipCount) : 0;
    return { totalSpendRs, totalVolume, slipCount, avgSlipValue };
  }, [slipsMonthB]);

  // Overall Deltas
  const spendDeltaRs = metricsB.totalSpendRs - metricsA.totalSpendRs;
  const spendPercentChange =
    metricsA.totalSpendRs > 0
      ? ((spendDeltaRs / metricsA.totalSpendRs) * 100).toFixed(1)
      : metricsB.totalSpendRs > 0
      ? '+100.0'
      : '0.0';

  const volumeDelta = metricsB.totalVolume - metricsA.totalVolume;
  const volumePercentChange =
    metricsA.totalVolume > 0
      ? ((volumeDelta / metricsA.totalVolume) * 100).toFixed(1)
      : metricsB.totalVolume > 0
      ? '+100.0'
      : '0.0';

  const slipCountDelta = metricsB.slipCount - metricsA.slipCount;

  // Section-by-Section Comparison
  const sectionComparisonData = useMemo(() => {
    return SECTIONS.map((sec) => {
      const spendA = slipsMonthA
        .filter((s) => s.category === sec)
        .reduce((sum, s) => sum + (s.priceRs || 0), 0);

      const spendB = slipsMonthB
        .filter((s) => s.category === sec)
        .reduce((sum, s) => sum + (s.priceRs || 0), 0);

      const delta = spendB - spendA;
      const pctChange =
        spendA > 0
          ? ((delta / spendA) * 100).toFixed(1)
          : spendB > 0
          ? '+100.0'
          : '0.0';

      // Short label for chart display
      const shortName = sec.replace(' Section', '').replace(' Demand', '');

      return {
        section: sec,
        shortName,
        [formatMonthLabel(monthA)]: spendA,
        [formatMonthLabel(monthB)]: spendB,
        spendA,
        spendB,
        delta,
        pctChange,
      };
    });
  }, [slipsMonthA, slipsMonthB, monthA, monthB]);

  // Item-by-Item Rate and Price Analysis
  interface ItemRateComparison {
    itemName: string;
    category: SectionCategory;
    unit: string;
    totalQtyA: number;
    totalSpendA: number;
    rateA: number; // Weighted average unit price
    totalQtyB: number;
    totalSpendB: number;
    rateB: number;
    rateDelta: number;
    ratePctChange: number | null;
    status: 'increased' | 'decreased' | 'unchanged' | 'only_a' | 'only_b';
  }

  const itemComparisonList = useMemo<ItemRateComparison[]>(() => {
    // Map item statistics across both months
    const itemMap = new Map<
      string,
      {
        category: SectionCategory;
        unit: string;
        qtyA: number;
        spendA: number;
        qtyB: number;
        spendB: number;
      }
    >();

    // Process Month A slips
    slipsMonthA.forEach((s) => {
      const key = s.itemName.trim().toLowerCase();
      const existing = itemMap.get(key) || {
        category: s.category,
        unit: s.unit || 'Unit',
        qtyA: 0,
        spendA: 0,
        qtyB: 0,
        spendB: 0,
      };
      existing.qtyA += s.quantity || 0;
      existing.spendA += s.priceRs || 0;
      existing.category = s.category;
      if (s.unit) existing.unit = s.unit;
      itemMap.set(key, existing);
    });

    // Process Month B slips
    slipsMonthB.forEach((s) => {
      const key = s.itemName.trim().toLowerCase();
      const existing = itemMap.get(key) || {
        category: s.category,
        unit: s.unit || 'Unit',
        qtyA: 0,
        spendA: 0,
        qtyB: 0,
        spendB: 0,
      };
      existing.qtyB += s.quantity || 0;
      existing.spendB += s.priceRs || 0;
      existing.category = s.category;
      if (s.unit) existing.unit = s.unit;
      itemMap.set(key, existing);
    });

    const result: ItemRateComparison[] = [];

    itemMap.forEach((val, key) => {
      // Find matching item display name from catalog or capitalize
      const catalogItem = items.find((i) => i.name.toLowerCase() === key);
      const displayName = catalogItem ? catalogItem.name : key.charAt(0).toUpperCase() + key.slice(1);

      const rateA = val.qtyA > 0 ? Math.round((val.spendA / val.qtyA) * 10) / 10 : 0;
      const rateB = val.qtyB > 0 ? Math.round((val.spendB / val.qtyB) * 10) / 10 : 0;

      let status: 'increased' | 'decreased' | 'unchanged' | 'only_a' | 'only_b' = 'unchanged';
      let rateDelta = 0;
      let ratePctChange: number | null = null;

      if (val.qtyA > 0 && val.qtyB > 0) {
        rateDelta = Math.round((rateB - rateA) * 10) / 10;
        if (rateA > 0) {
          const calc = Math.round(((rateB - rateA) / rateA) * 1000) / 10;
          ratePctChange = Number.isFinite(calc) ? calc : null;
        }
        if (rateDelta > 0.05) {
          status = 'increased';
        } else if (rateDelta < -0.05) {
          status = 'decreased';
        } else {
          status = 'unchanged';
        }
      } else if (val.qtyA > 0 && val.qtyB === 0) {
        status = 'only_a';
      } else if (val.qtyB > 0 && val.qtyA === 0) {
        status = 'only_b';
      }

      result.push({
        itemName: displayName,
        category: val.category,
        unit: val.unit,
        totalQtyA: val.qtyA,
        totalSpendA: val.spendA,
        rateA,
        totalQtyB: val.qtyB,
        totalSpendB: val.spendB,
        rateB,
        rateDelta,
        ratePctChange,
        status,
      });
    });

    // Sort by largest absolute rate delta, then by spend
    return result.sort((a, b) => {
      if (Math.abs(b.rateDelta) !== Math.abs(a.rateDelta)) {
        return Math.abs(b.rateDelta) - Math.abs(a.rateDelta);
      }
      return (b.totalSpendB + b.totalSpendA) - (a.totalSpendB + a.totalSpendA);
    });
  }, [slipsMonthA, slipsMonthB, items]);

  // Filtered Items based on search and status
  const filteredItemComparisons = useMemo(() => {
    return itemComparisonList.filter((item) => {
      // Search matching
      if (itemSearchQuery.trim()) {
        const query = itemSearchQuery.toLowerCase();
        const matchesName = item.itemName.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory) return false;
      }

      // Filter matching
      if (rateFilter === 'all') return true;
      if (rateFilter === 'increased') return item.status === 'increased';
      if (rateFilter === 'decreased') return item.status === 'decreased';
      if (rateFilter === 'unchanged') return item.status === 'unchanged';
      if (rateFilter === 'new_or_dropped') return item.status === 'only_a' || item.status === 'only_b';
      return true;
    });
  }, [itemComparisonList, itemSearchQuery, rateFilter]);

  // Flip Month A and Month B
  const handleSwapMonths = () => {
    playHapticSound('tap');
    const temp = monthA;
    setMonthA(monthB);
    setMonthB(temp);
  };

  // Generate WhatsApp / Clipboard Comparison Report
  const handleCopyReport = () => {
    playHapticSound('tap');

    const labelA = formatMonthLabel(monthA);
    const labelB = formatMonthLabel(monthB);

    const spendDir = spendDeltaRs >= 0 ? 'INCREASED' : 'DECREASED';
    const volumeDir = volumeDelta >= 0 ? 'INCREASED' : 'DECREASED';

    let text = `*📊 BITE RESTAURANT LARKANA - MONTHLY COMPARISON REPORT*\n`;
    text += `*Comparing:* ${labelA} ➡️ ${labelB}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `*💰 TOTAL SALES / EXPENSE DEMAND:*\n`;
    text += `• ${labelA}: Rs. ${metricsA.totalSpendRs.toLocaleString()}\n`;
    text += `• ${labelB}: Rs. ${metricsB.totalSpendRs.toLocaleString()}\n`;
    text += `• Difference: ${spendDeltaRs >= 0 ? '+' : ''}Rs. ${spendDeltaRs.toLocaleString()} (${spendPercentChange}% ${spendDir})\n\n`;

    text += `*📦 TOTAL INVENTORY VOLUME / QTY:*\n`;
    text += `• ${labelA}: ${metricsA.totalVolume} units across ${metricsA.slipCount} slips\n`;
    text += `• ${labelB}: ${metricsB.totalVolume} units across ${metricsB.slipCount} slips\n`;
    text += `• Volume Delta: ${volumeDelta >= 0 ? '+' : ''}${volumeDelta} units (${volumePercentChange}% ${volumeDir})\n\n`;

    text += `*🏷️ TOP ITEM RATE CHANGES (Unit Rate Comparison):*\n`;
    const rateChanges = itemComparisonList.filter((i) => i.status === 'increased' || i.status === 'decreased');
    if (rateChanges.length === 0) {
      text += `• No unit rate changes detected between recorded slips.\n`;
    } else {
      rateChanges.slice(0, 8).forEach((item) => {
        const sign = item.rateDelta > 0 ? '+' : '';
        const pct = item.ratePctChange !== null ? `(${sign}${item.ratePctChange}%)` : '';
        text += `• ${item.itemName} (${item.unit}): Rs. ${item.rateA} ➡️ Rs. ${item.rateB} [${sign}Rs. ${item.rateDelta} / unit ${pct}]\n`;
      });
    }

    text += `\n*🏢 SECTION BREAKDOWN SUMMARY:*\n`;
    sectionComparisonData.forEach((sec) => {
      if (sec.spendA > 0 || sec.spendB > 0) {
        text += `• ${sec.section}: Rs. ${sec.spendA.toLocaleString()} ➡️ Rs. ${sec.spendB.toLocaleString()} (${sec.pctChange}%)\n`;
      }
    });

    text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    text += `_Generated from verified slips in Bite Restaurant Larkana System on ${new Date().toLocaleDateString()}_`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);

    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Report Copied to Clipboard',
        message: 'Ready to share with Admin or Store Manager via WhatsApp.',
      });
    }
  };

  const hasDataA = slipsMonthA.length > 0;
  const hasDataB = slipsMonthB.length > 0;
  const hasAnyData = hasDataA || hasDataB;

  return (
    <div className="space-y-5 pb-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <GitCompare className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white">
                Month-to-Month Comparison
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                Real Slips
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Differentiate sales demand & track item unit rate inflation/deflation
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {hasAnyData && (
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
              title="Copy comparison summary text formatted for WhatsApp"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Share / WhatsApp</span>
                </>
              )}
            </button>
          )}

          {onOpenNewSlip && (
            <button
              onClick={onOpenNewSlip}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Log Slip</span>
            </button>
          )}
        </div>
      </div>

      {/* Month Selection Bar */}
      <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800/90 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-3 items-center">
          {/* Month A Selector (Base Month) */}
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-cyan-500/20 shadow-inner">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Base Month (A)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {slipsMonthA.length} slips recorded
              </span>
            </div>
            <select
              value={monthA}
              onChange={(e) => {
                playHapticSound('tap');
                setMonthA(e.target.value);
              }}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors cursor-pointer"
            >
              {recordedMonths.map((ym) => (
                <option key={`a-${ym}`} value={ym} className="bg-slate-900 text-white">
                  {formatMonthLabel(ym)} {slips.filter((s) => s.date.startsWith(ym)).length ? `(${slips.filter((s) => s.date.startsWith(ym)).length} slips)` : '(0 slips)'}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center py-1 sm:py-0">
            <button
              onClick={handleSwapMonths}
              title="Swap Month A and Month B"
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Month B Selector (Comparison Month) */}
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-emerald-500/20 shadow-inner">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Comparison Month (B)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {slipsMonthB.length} slips recorded
              </span>
            </div>
            <select
              value={monthB}
              onChange={(e) => {
                playHapticSound('tap');
                setMonthB(e.target.value);
              }}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors cursor-pointer"
            >
              {recordedMonths.map((ym) => (
                <option key={`b-${ym}`} value={ym} className="bg-slate-900 text-white">
                  {formatMonthLabel(ym)} {slips.filter((s) => s.date.startsWith(ym)).length ? `(${slips.filter((s) => s.date.startsWith(ym)).length} slips)` : '(0 slips)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Month Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-800/80 text-[11px]">
          <span className="text-slate-400 mr-1">Quick Select:</span>
          {recordedMonths.slice(0, 4).map((ym) => (
            <button
              key={`pill-${ym}`}
              onClick={() => {
                playHapticSound('tap');
                setMonthB(ym);
              }}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                monthB === ym
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              Set B: {formatMonthLabel(ym)}
            </button>
          ))}
        </div>
      </div>

      {/* Real Zero-State Notice if no slips exist for both months */}
      {!hasAnyData && (
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <Receipt className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-white">No Slips Recorded Yet in Selected Months</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Neither <strong className="text-cyan-300">{formatMonthLabel(monthA)}</strong> nor{' '}
              <strong className="text-emerald-300">{formatMonthLabel(monthB)}</strong> have paper slip entries in the database.
              Record your real slips using the button below to see genuine sales growth, expense shifts, and rate comparison!
            </p>
          </div>
          {onOpenNewSlip && (
            <button
              onClick={onOpenNewSlip}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record First Slip</span>
            </button>
          )}
        </div>
      )}

      {/* Main Comparison Analytics - Displayed when there is data in either month */}
      {hasAnyData && (
        <>
          {/* Executive Verdict Banner */}
          <div
            className={`p-4 rounded-3xl border shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              spendDeltaRs > 0
                ? 'bg-gradient-to-r from-rose-950/40 to-slate-900 border-rose-500/30'
                : spendDeltaRs < 0
                ? 'bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-500/30'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl ${
                  spendDeltaRs > 0
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : spendDeltaRs < 0
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                {spendDeltaRs > 0 ? (
                  <TrendingUp className="w-6 h-6 stroke-[2.5]" />
                ) : spendDeltaRs < 0 ? (
                  <TrendingDown className="w-6 h-6 stroke-[2.5]" />
                ) : (
                  <GitCompare className="w-6 h-6" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Monthly Expenditure / Demand Trend
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {spendDeltaRs > 0 ? (
                    <>
                      Expenditure <span className="text-rose-400">Increased by Rs. {spendDeltaRs.toLocaleString()}</span> (+{spendPercentChange}%)
                    </>
                  ) : spendDeltaRs < 0 ? (
                    <>
                      Expenditure <span className="text-emerald-400">Decreased by Rs. {Math.abs(spendDeltaRs).toLocaleString()}</span> ({spendPercentChange}%)
                    </>
                  ) : (
                    <>
                      Expenditure <span className="text-cyan-400">Remained Exactly Equal</span> (Rs. {metricsA.totalSpendRs.toLocaleString()})
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {formatMonthLabel(monthB)} demand spend compared with {formatMonthLabel(monthA)} base.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="px-3 py-1 rounded-xl text-xs font-bold font-mono bg-slate-950/80 border border-slate-800 text-slate-200">
                {metricsA.slipCount} slips ➡️ {metricsB.slipCount} slips
              </span>
            </div>
          </div>

          {/* 4 Summary Comparison KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Total Spend / Sales Demand */}
            <div className="bg-slate-900/90 p-4 rounded-3xl border border-slate-800/90 shadow-md space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Total Demand Spend</span>
                <span className="text-[10px] font-mono uppercase text-cyan-400">PKR</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-cyan-300 font-medium">{formatMonthLabel(monthA).slice(0, 3)}:</span>
                  <span className="text-xs font-bold font-mono text-slate-300">
                    Rs. {metricsA.totalSpendRs.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-emerald-300 font-medium">{formatMonthLabel(monthB).slice(0, 3)}:</span>
                  <span className="text-sm font-black font-mono text-white">
                    Rs. {metricsB.totalSpendRs.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Delta:</span>
                <span
                  className={`font-mono font-bold flex items-center ${
                    spendDeltaRs > 0
                      ? 'text-rose-400'
                      : spendDeltaRs < 0
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {spendDeltaRs > 0 ? '+' : ''}
                  {spendPercentChange}%
                </span>
              </div>
            </div>

            {/* 2. Total Items Volume */}
            <div className="bg-slate-900/90 p-4 rounded-3xl border border-slate-800/90 shadow-md space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Total Item Volume</span>
                <span className="text-[10px] font-mono uppercase text-emerald-400">Units</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-cyan-300 font-medium">{formatMonthLabel(monthA).slice(0, 3)}:</span>
                  <span className="text-xs font-bold font-mono text-slate-300">
                    {metricsA.totalVolume} units
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-emerald-300 font-medium">{formatMonthLabel(monthB).slice(0, 3)}:</span>
                  <span className="text-sm font-black font-mono text-white">
                    {metricsB.totalVolume} units
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Volume Shift:</span>
                <span
                  className={`font-mono font-bold flex items-center ${
                    volumeDelta > 0
                      ? 'text-cyan-400'
                      : volumeDelta < 0
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {volumeDelta > 0 ? '+' : ''}
                  {volumeDelta} ({volumePercentChange}%)
                </span>
              </div>
            </div>

            {/* 3. Paper Slips Recorded */}
            <div className="bg-slate-900/90 p-4 rounded-3xl border border-slate-800/90 shadow-md space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Slips Count</span>
                <span className="text-[10px] font-mono uppercase text-teal-400">Ledger</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-cyan-300 font-medium">{formatMonthLabel(monthA).slice(0, 3)}:</span>
                  <span className="text-xs font-bold font-mono text-slate-300">
                    {metricsA.slipCount} slips
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-emerald-300 font-medium">{formatMonthLabel(monthB).slice(0, 3)}:</span>
                  <span className="text-sm font-black font-mono text-white">
                    {metricsB.slipCount} slips
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Slips Delta:</span>
                <span className="font-mono font-bold text-slate-300">
                  {slipCountDelta > 0 ? `+${slipCountDelta}` : slipCountDelta} slips
                </span>
              </div>
            </div>

            {/* 4. Average Slip Value */}
            <div className="bg-slate-900/90 p-4 rounded-3xl border border-slate-800/90 shadow-md space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Avg Slip Value</span>
                <span className="text-[10px] font-mono uppercase text-indigo-400">Per Slip</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-cyan-300 font-medium">{formatMonthLabel(monthA).slice(0, 3)}:</span>
                  <span className="text-xs font-bold font-mono text-slate-300">
                    Rs. {metricsA.avgSlipValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-emerald-300 font-medium">{formatMonthLabel(monthB).slice(0, 3)}:</span>
                  <span className="text-sm font-black font-mono text-white">
                    Rs. {metricsB.avgSlipValue.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Avg Value Delta:</span>
                <span className="font-mono font-bold text-slate-300">
                  {metricsB.avgSlipValue - metricsA.avgSlipValue >= 0 ? '+' : ''}
                  Rs. {(metricsB.avgSlipValue - metricsA.avgSlipValue).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Section-by-Section Comparative Chart & Breakdown */}
          <div className="bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Section Demand Comparison ({formatMonthLabel(monthA)} vs {formatMonthLabel(monthB)})
                </h3>
                <p className="text-xs text-slate-400">
                  Compare expenditure per kitchen section (BBQ, Karahi, Roll, Naan, Pizza, Fast Food, Disposal)
                </p>
              </div>

              {/* Legend Badges */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-cyan-500 inline-block" />
                  <span className="text-slate-300 font-medium">{formatMonthLabel(monthA)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                  <span className="text-slate-300 font-medium">{formatMonthLabel(monthB)}</span>
                </div>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sectionComparisonData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis
                    dataKey="shortName"
                    stroke="#94A3B8"
                    fontSize={11}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={10}
                    tickFormatter={(v) => `Rs.${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '16px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Demand Spend']}
                  />
                  <Bar
                    dataKey={formatMonthLabel(monthA)}
                    fill="#06B6D4"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey={formatMonthLabel(monthB)}
                    fill="#10B981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Section Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
              {sectionComparisonData.map((sec) => (
                <div
                  key={sec.section}
                  className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 truncate pr-1">{sec.section}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        sec.delta > 0
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : sec.delta < 0
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {sec.delta > 0 ? '+' : ''}
                      {sec.pctChange}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{formatMonthLabel(monthA).slice(0, 3)}: Rs. {sec.spendA.toLocaleString()}</span>
                    <span className="text-white font-medium">
                      {formatMonthLabel(monthB).slice(0, 3)}: Rs. {sec.spendB.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ITEM UNIT RATE COMPARISON TABLE (CRITICAL FEATURE) */}
          <div className="bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Item Unit Rate & Price Differential
                </h3>
                <p className="text-xs text-slate-400">
                  Track price per Kg / Litre / Tin / Packet between {formatMonthLabel(monthA)} and {formatMonthLabel(monthB)}
                </p>
              </div>

              {/* Rate Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  onClick={() => {
                    playHapticSound('tap');
                    setRateFilter('all');
                  }}
                  className={`px-2.5 py-1 rounded-xl transition-all ${
                    rateFilter === 'all'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  All Items ({itemComparisonList.length})
                </button>
                <button
                  onClick={() => {
                    playHapticSound('tap');
                    setRateFilter('increased');
                  }}
                  className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                    rateFilter === 'increased'
                      ? 'bg-rose-500 text-white font-bold'
                      : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
                  }`}
                >
                  <ArrowUpRight className="w-3 h-3" />
                  Rate Rose ({itemComparisonList.filter((i) => i.status === 'increased').length})
                </button>
                <button
                  onClick={() => {
                    playHapticSound('tap');
                    setRateFilter('decreased');
                  }}
                  className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                    rateFilter === 'decreased'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
                  }`}
                >
                  <ArrowDownRight className="w-3 h-3" />
                  Rate Dropped ({itemComparisonList.filter((i) => i.status === 'decreased').length})
                </button>
                <button
                  onClick={() => {
                    playHapticSound('tap');
                    setRateFilter('unchanged');
                  }}
                  className={`px-2.5 py-1 rounded-xl transition-all ${
                    rateFilter === 'unchanged'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Same Rate ({itemComparisonList.filter((i) => i.status === 'unchanged').length})
                </button>
              </div>
            </div>

            {/* Search input within items */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                placeholder="Filter compared items (e.g., Jeero, Atta, Ghee, Shopper, Sirko)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Items Table */}
            {filteredItemComparisons.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
                <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-400">
                  No items matched the current filter criteria for these 2 months.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="px-3.5 py-3">Item & Category</th>
                      <th className="px-3 py-3 text-right">
                        <span className="text-cyan-400">{formatMonthLabel(monthA)} Rate</span>
                      </th>
                      <th className="px-3 py-3 text-right">
                        <span className="text-emerald-400">{formatMonthLabel(monthB)} Rate</span>
                      </th>
                      <th className="px-3 py-3 text-right">Rate Delta</th>
                      <th className="px-3 py-3 text-right">Qty Shift</th>
                      <th className="px-3 py-3 text-center">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-medium">
                    {filteredItemComparisons.map((item) => (
                      <tr key={item.itemName} className="hover:bg-slate-800/50 transition-colors">
                        {/* Item name and section */}
                        <td className="px-3.5 py-3">
                          <div className="font-bold text-white">{item.itemName}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span className="text-cyan-400 font-mono">{item.unit}</span>
                          </div>
                        </td>

                        {/* Month A Rate */}
                        <td className="px-3 py-3 text-right font-mono">
                          {item.totalQtyA > 0 ? (
                            <div>
                              <span className="font-bold text-slate-200">
                                Rs. {item.rateA.toLocaleString()}
                              </span>
                              <div className="text-[10px] text-slate-400">
                                {item.totalQtyA} {item.unit} (Rs. {item.totalSpendA.toLocaleString()})
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">— No demand</span>
                          )}
                        </td>

                        {/* Month B Rate */}
                        <td className="px-3 py-3 text-right font-mono">
                          {item.totalQtyB > 0 ? (
                            <div>
                              <span className="font-bold text-white">
                                Rs. {item.rateB.toLocaleString()}
                              </span>
                              <div className="text-[10px] text-slate-400">
                                {item.totalQtyB} {item.unit} (Rs. {item.totalSpendB.toLocaleString()})
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">— No demand</span>
                          )}
                        </td>

                        {/* Rate Delta */}
                        <td className="px-3 py-3 text-right font-mono">
                          {item.totalQtyA > 0 && item.totalQtyB > 0 ? (
                            <div>
                              <span
                                className={`font-bold inline-flex items-center gap-0.5 ${
                                  item.rateDelta > 0
                                    ? 'text-rose-400'
                                    : item.rateDelta < 0
                                    ? 'text-emerald-400'
                                    : 'text-slate-400'
                                }`}
                              >
                                {item.rateDelta > 0 ? '+' : ''}
                                Rs. {item.rateDelta}
                              </span>
                              {item.ratePctChange !== null && (
                                <div
                                  className={`text-[10px] font-bold ${
                                    item.ratePctChange > 0
                                      ? 'text-rose-400'
                                      : item.ratePctChange < 0
                                      ? 'text-emerald-400'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {item.ratePctChange > 0 ? '+' : ''}
                                  {item.ratePctChange}%
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-sans">N/A</span>
                          )}
                        </td>

                        {/* Qty Shift */}
                        <td className="px-3 py-3 text-right font-mono text-[11px]">
                          <span className="text-slate-300">
                            {item.totalQtyA} ➡️ {item.totalQtyB}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            {item.totalQtyB - item.totalQtyA > 0 ? '+' : ''}
                            {item.totalQtyB - item.totalQtyA} {item.unit}
                          </div>
                        </td>

                        {/* Status Verdict Pill */}
                        <td className="px-3 py-3 text-center">
                          {item.status === 'increased' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              <ArrowUpRight className="w-3 h-3" />
                              Rate Rose
                            </span>
                          )}
                          {item.status === 'decreased' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <ArrowDownRight className="w-3 h-3" />
                              Rate Dropped
                            </span>
                          )}
                          {item.status === 'unchanged' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                              Stable Rate
                            </span>
                          )}
                          {item.status === 'only_a' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                              Only in {formatMonthLabel(monthA).slice(0, 3)}
                            </span>
                          )}
                          {item.status === 'only_b' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              New in {formatMonthLabel(monthB).slice(0, 3)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
