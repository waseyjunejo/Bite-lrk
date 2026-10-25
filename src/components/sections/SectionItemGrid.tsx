import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Layers,
  Sparkles,
  Soup,
  Pizza,
  Package,
  Carrot,
  Building2,
  Search,
  Plus,
  Minus,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Check,
  X,
  TrendingUp,
  Tag,
  DollarSign,
} from 'lucide-react';
import {
  ItemMaster,
  SectionTabId,
  SectionCategory,
  DepartmentTracker,
} from '../../types/inventory';

interface SectionItemGridProps {
  items: ItemMaster[];
  departmentTrackers: DepartmentTracker[];
  activeTab: SectionTabId;
  onTabChange: (tab: SectionTabId) => void;
  onUpdateStock: (itemId: string, newStock: number) => void;
  onUpdateDemand: (itemId: string, newDemand: number) => void;
  onEditItem: (updatedItem: ItemMaster) => void;
  onRecordSlipForItem: (itemName: string) => void;
  onUpdateDepartmentTracker: (trackerId: string, updated: Partial<DepartmentTracker>) => void;
  globalSearchQuery?: string;
}

export const SectionItemGrid: React.FC<SectionItemGridProps> = ({
  items,
  departmentTrackers,
  activeTab,
  onTabChange,
  onUpdateStock,
  onUpdateDemand,
  onEditItem,
  onRecordSlipForItem,
  onUpdateDepartmentTracker,
  globalSearchQuery = '',
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'demand'>('all');
  const [editingItem, setEditingItem] = useState<ItemMaster | null>(null);

  // Tabs configuration
  const tabs = [
    { id: 'all' as SectionTabId, name: 'All Items', icon: Layers, count: items.length },
    { id: 'bbq' as SectionTabId, name: 'BBQ Section', icon: Flame, count: items.filter((i) => i.section === 'BBQ Section').length },
    { id: 'roll' as SectionTabId, name: 'Roll Section', icon: Layers, count: items.filter((i) => i.section === 'Roll Section').length },
    { id: 'naan' as SectionTabId, name: 'Naan Section', icon: Sparkles, count: items.filter((i) => i.section === 'Naan Section').length },
    { id: 'karahi' as SectionTabId, name: 'Karahi Section', icon: Soup, count: items.filter((i) => i.section === 'Karahi Section').length },
    { id: 'pizza_fastfood' as SectionTabId, name: 'Pizza & Fast Food', icon: Pizza, count: items.filter((i) => i.section === 'Pizza & Fast Food').length },
    { id: 'disposal' as SectionTabId, name: 'Disposal Demand', icon: Package, count: items.filter((i) => i.section === 'Disposal Demand').length },
    { id: 'vegetables_misc' as SectionTabId, name: 'Vegetables & Misc', icon: Carrot, count: items.filter((i) => i.section === 'Vegetables & Misc').length },
    { id: 'department_summary' as SectionTabId, name: 'Department Trackers', icon: Building2, count: departmentTrackers.length },
  ];

  // Combined search term
  const effectiveSearch = globalSearchQuery || localSearch;

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      let matchesTab = true;
      if (activeTab === 'bbq') matchesTab = item.section === 'BBQ Section';
      else if (activeTab === 'roll') matchesTab = item.section === 'Roll Section';
      else if (activeTab === 'naan') matchesTab = item.section === 'Naan Section';
      else if (activeTab === 'karahi') matchesTab = item.section === 'Karahi Section';
      else if (activeTab === 'pizza_fastfood') matchesTab = item.section === 'Pizza & Fast Food';
      else if (activeTab === 'disposal') matchesTab = item.section === 'Disposal Demand';
      else if (activeTab === 'vegetables_misc') matchesTab = item.section === 'Vegetables & Misc';

      // Search filter
      const matchesSearch =
        !effectiveSearch ||
        item.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        item.section.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        (item.subCategory && item.subCategory.toLowerCase().includes(effectiveSearch.toLowerCase()));

      // Stock status filter
      let matchesStock = true;
      if (stockFilter === 'low') matchesStock = item.currentStock <= item.minThreshold;
      if (stockFilter === 'demand') matchesStock = item.pendingDemand > 0;

      return matchesTab && matchesSearch && matchesStock;
    });
  }, [items, activeTab, effectiveSearch, stockFilter]);

  // Handle Edit form submit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onEditItem(editingItem);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Scrollable Tab bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Local Search Sub-bar */}
      {activeTab !== 'department_summary' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search items in this section..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Status:</span>
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setStockFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                  stockFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({filteredItems.length})
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('low')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                  stockFilter === 'low' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Low Stock
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('demand')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                  stockFilter === 'demand' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending Demands
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW A: Department Summary Trackers specified in user prompt */}
      {activeTab === 'department_summary' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-start gap-3">
            <Building2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Total Department Demand Trackers & Special Batches
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Centralized summary tracker for Roll, Naan, BBQ, Fast Food, Pizza, Karahi, Disposal, Vegetable, Imran Mamo, Kachup Cartoon, and Medo Kato batches.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentTrackers.map((tracker) => {
              const isUrgent = tracker.urgency === 'Critical' || tracker.urgency === 'High';
              return (
                <motion.div
                  key={tracker.id}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 p-5 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between shadow-xl transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-white text-sm">
                        {tracker.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tracker.urgency === 'Critical'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : tracker.urgency === 'High'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {tracker.urgency}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-4">
                      Lead: <span className="text-slate-200 font-medium">{tracker.leadPerson}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs mb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Pending Items</span>
                        <span className="text-base font-extrabold text-white font-mono">
                          {tracker.pendingItemsCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Estimated Cost</span>
                        <span className="text-base font-extrabold text-cyan-400 font-mono">
                          Rs. {tracker.estimatedTotalRs.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 italic mb-3">
                      "{tracker.notes}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newCount = prompt('Enter updated pending demands count:', tracker.pendingItemsCount.toString());
                        if (newCount !== null) {
                          onUpdateDepartmentTracker(tracker.id, {
                            pendingItemsCount: parseInt(newCount, 10) || 0,
                          });
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer"
                    >
                      Update Count
                    </button>

                    <button
                      type="button"
                      onClick={() => onRecordSlipForItem(tracker.name)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Log Slip</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW B: Pre-loaded Restaurant Section Items Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const isLowStock = item.currentStock <= item.minThreshold;
            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                className={`rounded-2xl p-4.5 bg-slate-900/80 border transition-all backdrop-blur-xl relative flex flex-col justify-between shadow-lg ${
                  isLowStock
                    ? 'border-amber-500/40 shadow-amber-500/5'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-semibold text-cyan-400">
                          {item.section}
                        </span>
                        {item.subCategory && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {item.subCategory}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      title="Edit Item Master Details"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Stock & Demand Stats */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    {/* Current Stock */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400">Current Stock</span>
                        {isLowStock && (
                          <span className="text-[9px] font-bold text-amber-400 uppercase">
                            Low
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-base font-extrabold font-mono ${
                            isLowStock ? 'text-amber-400' : 'text-white'
                          }`}
                        >
                          {item.currentStock}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.unit}</span>
                      </div>
                    </div>

                    {/* Pending Kitchen Demand */}
                    <div className="border-l border-slate-800 pl-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400">Kitchen Demand</span>
                        {item.pendingDemand > 0 && (
                          <span className="text-[9px] font-bold text-cyan-400">Needed</span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-extrabold font-mono text-cyan-400">
                          {item.pendingDemand}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rate / Est Price in Rs. */}
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span>Est. Rate:</span>
                    <span className="font-mono font-semibold text-slate-200">
                      Rs. {item.estimatedPriceRs.toLocaleString()} / {item.unit}
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  {/* Demand increment controls */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">Adjust Demand:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateDemand(item.id, Math.max(0, item.pendingDemand - 1))
                        }
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs font-bold text-white min-w-[20px] text-center">
                        {item.pendingDemand}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateDemand(item.id, item.pendingDemand + 1)}
                        className="w-6 h-6 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Action button: Log Paper Slip */}
                  <button
                    type="button"
                    onClick={() => onRecordSlipForItem(item.name)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Record Paper Slip</span>
                  </button>
                </div>
              </motion.div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 rounded-3xl bg-slate-900/40 border border-slate-800">
              <Package className="w-10 h-10 mx-auto mb-2 text-slate-400 opacity-40" />
              <p className="text-sm font-semibold text-slate-300">No Matching Items</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for another ingredient or change the status filter.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Edit Item Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-bold text-white mb-1">
                Edit {editingItem.name}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Section: {editingItem.section}
              </p>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingItem.currentStock}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        currentStock: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Minimum Safety Threshold
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingItem.minThreshold}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        minThreshold: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estimated Rate (Rs.)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingItem.estimatedPriceRs}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        estimatedPriceRs: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Unit Specification
                  </label>
                  <input
                    type="text"
                    value={editingItem.unit}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        unit: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
