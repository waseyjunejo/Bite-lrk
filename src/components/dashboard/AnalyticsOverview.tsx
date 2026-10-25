import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  Flame,
  Soup,
  Package,
  Layers,
  Sparkles,
  ArrowUpRight,
  Receipt,
  CheckCircle2,
  GitCompare,
} from 'lucide-react';
import { SlipEntry, ItemMaster, SectionTabId } from '../../types/inventory';
import { computeMonthlyDemandTrends } from '../../data/restaurantItems';

interface AnalyticsOverviewProps {
  slips: SlipEntry[];
  items: ItemMaster[];
  onSelectSection: (sectionId: SectionTabId) => void;
  selectedYear: string;
  onNavigateToCompare?: () => void;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  slips,
  items,
  onSelectSection,
  selectedYear,
  onNavigateToCompare,
}) => {
  const [chartMetric, setChartMetric] = useState<'expense' | 'volume'>('expense');

  // Real Dynamic Today's date YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySlips = slips.filter((s) => s.date === todayStr);

  const todayItemsLoggedCount = todaySlips.reduce((acc, curr) => acc + curr.quantity, 0);
  const todayTotalCostRs = todaySlips.reduce((acc, curr) => acc + curr.priceRs, 0);

  const pendingDemandsCount = items.filter((i) => i.pendingDemand > 0).length;
  const criticalStockItems = items.filter(
    (i) => i.minThreshold > 0 && i.currentStock <= i.minThreshold
  );

  // Compute total real spend/inflow from slips
  const totalInflowRs = slips.reduce((acc, curr) => acc + curr.priceRs, 0);

  // Compute monthly trends dynamically from real slips
  const monthlyTrends = computeMonthlyDemandTrends(slips, selectedYear);
  const hasRecordedDataInYear = slips.some((s) => s.date.startsWith(selectedYear));

  // Category counts
  const categoryStats = [
    {
      id: 'bbq' as SectionTabId,
      name: 'BBQ Section',
      icon: Flame,
      color: 'from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/30',
      totalItems: items.filter((i) => i.section === 'BBQ Section').length,
      todayLogged: todaySlips.filter((s) => s.category === 'BBQ Section').length,
      urgentCount: items.filter((i) => i.section === 'BBQ Section' && i.currentStock <= i.minThreshold).length,
    },
    {
      id: 'karahi' as SectionTabId,
      name: 'Karahi Section',
      icon: Soup,
      color: 'from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30',
      totalItems: items.filter((i) => i.section === 'Karahi Section').length,
      todayLogged: todaySlips.filter((s) => s.category === 'Karahi Section').length,
      urgentCount: items.filter((i) => i.section === 'Karahi Section' && i.currentStock <= i.minThreshold).length,
    },
    {
      id: 'roll' as SectionTabId,
      name: 'Roll Section',
      icon: Layers,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
      totalItems: items.filter((i) => i.section === 'Roll Section').length,
      todayLogged: todaySlips.filter((s) => s.category === 'Roll Section').length,
      urgentCount: items.filter((i) => i.section === 'Roll Section' && i.currentStock <= i.minThreshold).length,
    },
    {
      id: 'naan' as SectionTabId,
      name: 'Naan Section',
      icon: Sparkles,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      totalItems: items.filter((i) => i.section === 'Naan Section').length,
      todayLogged: todaySlips.filter((s) => s.category === 'Naan Section').length,
      urgentCount: items.filter((i) => i.section === 'Naan Section' && i.currentStock <= i.minThreshold).length,
    },
    {
      id: 'pizza_fastfood' as SectionTabId,
      name: 'Pizza & Fast Food',
      icon: TrendingUp,
      color: 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30',
      totalItems: items.filter((i) => i.section === 'Pizza & Fast Food').length,
      todayLogged: todaySlips.filter((s) => s.category === 'Pizza & Fast Food').length,
      urgentCount: items.filter((i) => i.section === 'Pizza & Fast Food' && i.currentStock <= i.minThreshold).length,
    },
    {
      id: 'disposal' as SectionTabId,
      name: 'Disposal Demand',
      icon: Package,
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
      totalItems: items.filter((i) => i.section === 'Disposal Demand').length,
      todayLogged: todaySlips.filter((s) => s.category === 'Disposal Demand').length,
      urgentCount: items.filter((i) => i.section === 'Disposal Demand' && i.currentStock <= i.minThreshold).length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Items Logged Today */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group shadow-lg"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Logged Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {todayItemsLoggedCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">units</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>{todaySlips.length} paper slips</span>
            <span className="text-cyan-400 font-semibold font-mono">
              Rs. {todayTotalCostRs.toLocaleString()}
            </span>
          </div>
        </motion.div>

        {/* Card 2: Active Kitchen Demands */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group shadow-lg"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Demands
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {pendingDemandsCount}
            </span>
            <span className="text-xs text-teal-400 font-medium">Kitchen items</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Procurement queue</span>
            <span className="text-teal-400 font-semibold">Ready for market</span>
          </div>
        </motion.div>

        {/* Card 3: Real Spend Inflow */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group shadow-lg"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Recorded Inflow
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight font-mono">
              Rs. {totalInflowRs.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="flex items-center text-cyan-400 font-medium gap-0.5">
              {slips.length} Slips Logged
            </span>
            <span className="text-slate-400">Ledger Verified</span>
          </div>
        </motion.div>

        {/* Card 4: Critical Stock Warnings */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group shadow-lg"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Low Stock Alert
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {criticalStockItems.length}
            </span>
            <span className="text-xs text-amber-400 font-medium">below safety level</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Safety Threshold</span>
            <span className="text-slate-400">{criticalStockItems.length > 0 ? 'Replenish' : 'Normal'}</span>
          </div>
        </motion.div>
      </div>

      {/* Main Interactive Area Chart: 1-Year Historical Demand Summary */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/90 p-5 sm:p-6 backdrop-blur-2xl shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Yearly Demand Summary ({selectedYear})
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Live Dynamic Ledger
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {hasRecordedDataInYear
                ? `Real monthly demand aggregates from paper slips for ${selectedYear}`
                : `No slips logged yet for ${selectedYear}. Record paper slips to view live monthly trend.`}
            </p>
          </div>

          {/* Metric Switcher & Compare Shortcut */}
          <div className="flex flex-wrap items-center gap-2">
            {onNavigateToCompare && (
              <button
                type="button"
                onClick={onNavigateToCompare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Compare Months</span>
              </button>
            )}

            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setChartMetric('expense')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  chartMetric === 'expense'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Expense (Rs.)
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('volume')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  chartMetric === 'volume'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Slips
              </button>
            </div>
          </div>
        </div>

        {/* Area Chart Container */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyTrends}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorKarahi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorBbq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorDisposal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
              <XAxis
                dataKey="month"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(val) =>
                  chartMetric === 'expense' ? `${(val / 1000).toFixed(0)}k` : val
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7)',
                  color: '#F8FAFC',
                  fontSize: '12px',
                }}
                formatter={(value: number | string | undefined, name: string | undefined) => {
                  const num = typeof value === 'number' ? value : Number(value || 0);
                  if (chartMetric === 'expense') {
                    return [`Rs. ${num.toLocaleString()}`, name || ''];
                  }
                  return [num, name || ''];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />

              {chartMetric === 'expense' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="demandExpenseRs"
                    name="Total Demand Inflow (Rs.)"
                    stroke="#06B6D4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                  />
                  <Area
                    type="monotone"
                    dataKey="karahi"
                    name="Karahi Section"
                    stroke="#F59E0B"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorKarahi)"
                  />
                  <Area
                    type="monotone"
                    dataKey="bbq"
                    name="BBQ Section"
                    stroke="#EF4444"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorBbq)"
                  />
                  <Area
                    type="monotone"
                    dataKey="disposal"
                    name="Disposal Section"
                    stroke="#A855F7"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorDisposal)"
                  />
                </>
              ) : (
                <Area
                  type="monotone"
                  dataKey="totalSlips"
                  name="Total Slips Logged"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={0.6}
                  fill="#10B981"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Category Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>Pre-Loaded Restaurant Sections</span>
            <span className="text-[11px] font-normal text-slate-400">
              (Quick Jump to Section Master)
            </span>
          </h3>
          <span className="text-xs text-cyan-400 font-medium">Click card to open</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categoryStats.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.id}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => onSelectSection(cat.id)}
                className={`p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 text-left transition-all cursor-pointer backdrop-blur-xl group flex flex-col justify-between`}
              >
                <div>
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center mb-2.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {cat.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {cat.totalItems} Slip Items
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">
                    {cat.todayLogged > 0 ? (
                      <span className="text-cyan-400 font-semibold">{cat.todayLogged} logged</span>
                    ) : (
                      '0 logged'
                    )}
                  </span>
                  {cat.urgentCount > 0 ? (
                    <span className="text-amber-400 font-bold">
                      {cat.urgentCount} low
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> OK
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
