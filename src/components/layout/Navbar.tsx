import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Utensils,
  Search,
  Plus,
  Calendar,
  LogOut,
  ChevronDown,
  UserCheck,
  Shield,
  Store,
  Sparkles,
  Droplet
} from 'lucide-react';
import { UserProfile, DateFilterType } from '../../types/inventory';
import { RESTAURANT_METADATA } from '../../data/restaurantItems';

interface NavbarProps {
  currentUser: UserProfile;
  dateFilter: DateFilterType;
  onDateFilterChange: (filter: DateFilterType) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenQuickSlip: () => void;
  onLogout: () => void;
  onSwitchRole: (role: 'admin' | 'store_manager') => void;
  rippleIntensity: 'vibrant' | 'subtle' | 'minimal';
  onToggleRippleIntensity: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  dateFilter,
  onDateFilterChange,
  selectedYear,
  onYearChange,
  searchQuery,
  onSearchChange,
  onOpenQuickSlip,
  onLogout,
  onSwitchRole,
  rippleIntensity,
  onToggleRippleIntensity,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left Brand info */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-400 p-0.5 shadow-md shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Utensils className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {RESTAURANT_METADATA.name}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                  Larkana
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Inventory & Demand Slips • VIP Road Branch
              </p>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search slip item (e.g. Jeero, Meedo, Shopper, Ghee)..."
                className="w-full pl-10 pr-12 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono border border-slate-700/60 pointer-events-none">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right Controls & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Filter Toggle: Daily / Yearly */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => onDateFilterChange('daily')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  dateFilter === 'daily'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => onDateFilterChange('yearly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  dateFilter === 'yearly'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Yearly
              </button>

              {dateFilter === 'yearly' && (
                <div className="ml-1 pl-1 border-l border-slate-700 flex items-center">
                  <Calendar className="w-3 h-3 text-cyan-400 mr-1" />
                  <select
                    value={selectedYear}
                    onChange={(e) => onYearChange(e.target.value)}
                    className="bg-transparent text-[11px] font-semibold text-cyan-300 focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="2026" className="bg-slate-900 text-white">2026</option>
                    <option value="2025" className="bg-slate-900 text-white">2025</option>
                  </select>
                </div>
              )}
            </div>

            {/* Ripple FX Intensity Pill */}
            <button
              type="button"
              onClick={onToggleRippleIntensity}
              title={`Liquid Ripple: ${rippleIntensity}. Click to change intensity`}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 transition-all cursor-pointer"
            >
              <Droplet className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="capitalize">{rippleIntensity}</span>
            </button>

            {/* Quick Add Entry Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onOpenQuickSlip}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Record Slip</span>
              <span className="sm:hidden">Slip</span>
            </motion.button>

            {/* Admin / Manager Profile Pill & Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-xs">
                  {currentUser.role === 'admin' ? (
                    <Shield className="w-3.5 h-3.5 text-teal-400" />
                  ) : (
                    <Store className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-bold text-white leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-cyan-400 capitalize">
                    {currentUser.role === 'admin' ? 'Admin' : 'Store Manager'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-3 z-50"
                  >
                    <div className="p-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.username}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {currentUser.role === 'admin' ? 'Executive Admin' : 'Store Manager'}
                      </span>
                    </div>

                    <div className="py-2 space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                        Switch Active Role
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onSwitchRole('store_manager');
                          setShowProfileMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          currentUser.role === 'store_manager'
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Store className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Store Manager (IB Junejo)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onSwitchRole('admin');
                          setShowProfileMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          currentUser.role === 'admin'
                            ? 'bg-teal-500/20 text-teal-300 font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5 text-teal-400" />
                        <span>Executive Admin</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-semibold cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out Portal</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search slip item (e.g. Jeero, Atta, Shopper)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
