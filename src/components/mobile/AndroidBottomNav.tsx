import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Receipt,
  Layers,
  ShoppingBag,
  Database,
  GitCompare,
  Plus,
} from 'lucide-react';
import { playHapticSound } from '../../services/dbService';

export type MobileTab = 'dashboard' | 'slips_table' | 'compare' | 'sections' | 'procurement' | 'settings';

interface AndroidBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  onQuickAddSlip: () => void;
  unreadDemandCount?: number;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onTabChange,
  onQuickAddSlip,
  unreadDemandCount = 0,
}) => {
  const tabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'slips_table',
      label: 'Slips',
      icon: <Receipt className="w-5 h-5" />,
    },
    {
      id: 'compare',
      label: 'Compare',
      icon: <GitCompare className="w-5 h-5" />,
    },
    {
      id: 'sections',
      label: 'Sections',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      id: 'procurement',
      label: 'Orders',
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Database',
      icon: <Database className="w-5 h-5" />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 px-2 py-1 max-w-md mx-auto md:max-w-none">
      <div className="flex items-center justify-around relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playHapticSound('tap');
                onTabChange(tab.id);
              }}
              className={`flex-1 flex flex-col items-center py-1.5 px-1 relative transition-colors ${
                isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.id === 'procurement' && unreadDemandCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold px-1 py-0.2 rounded-full min-w-3.5 text-center">
                    {unreadDemandCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="w-5 h-1 bg-cyan-400 rounded-full mt-0.5 shadow-[0_0_8px_#06b6d4]"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Android System Home Indicator Line */}
      <div className="w-32 h-1 bg-slate-700/60 rounded-full mx-auto mt-1 mb-0.5" />
    </div>
  );
};
