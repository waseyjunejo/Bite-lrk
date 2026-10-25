import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Receipt,
  ShoppingBag,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Layers,
  Flame,
  Shield,
  Store,
  SlidersHorizontal,
  Droplet,
  Smartphone,
  Maximize2,
  Database,
  Volume2,
  VolumeX,
} from 'lucide-react';

import {
  UserProfile,
  ItemMaster,
  SlipEntry,
  DepartmentTracker,
  SectionTabId,
  DateFilterType,
} from './types/inventory';

import {
  INITIAL_ITEM_MASTER,
  INITIAL_SLIP_ENTRIES,
  INITIAL_DEPARTMENT_TRACKERS,
  RESTAURANT_METADATA,
} from './data/restaurantItems';

import {
  getAllSlips,
  createSlip,
  updateSlip,
  deleteSlip,
  getAllItems,
  saveAllItems,
  updateItemQuantity,
  updateItemDetails,
  getAllDepartments,
  updateDepartment,
  getSyncQueueLength,
  playHapticSound,
} from './services/dbService';

import { isSupabaseConfigured, testSupabaseConnection } from './lib/supabaseClient';

import { LiquidRippleCanvas } from './components/effects/LiquidRippleCanvas';
import { AdminLoginPage } from './components/auth/AdminLoginPage';
import { Navbar } from './components/layout/Navbar';
import { AnalyticsOverview } from './components/dashboard/AnalyticsOverview';
import { SectionItemGrid } from './components/sections/SectionItemGrid';
import { InventoryTable } from './components/inventory/InventoryTable';
import { SlipEntryModal } from './components/inventory/SlipEntryModal';
import { ProcurementSlipView } from './components/inventory/ProcurementSlipView';
import { MonthComparisonView } from './components/analytics/MonthComparisonView';
import { AndroidStatusBar } from './components/mobile/AndroidStatusBar';
import { AndroidBottomNav, MobileTab } from './components/mobile/AndroidBottomNav';
import { AndroidFAB } from './components/mobile/AndroidFAB';
import { CloudDbSettingsModal } from './components/settings/CloudDbSettingsModal';
import { ToastContainer, ToastMessage } from './components/common/Toast';

export function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('bite_auth_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.id && parsed.name && parsed.role) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // App Data State backed by resilient dbService
  const [items, setItems] = useState<ItemMaster[]>(() => getAllItems());
  const [slips, setSlips] = useState<SlipEntry[]>(() => getAllSlips());
  const [departmentTrackers, setDepartmentTrackers] = useState<DepartmentTracker[]>(() =>
    getAllDepartments()
  );

  // Cloud status state
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(() => isSupabaseConfigured());
  const [syncQueueCount, setSyncQueueCount] = useState<number>(() => getSyncQueueLength());

  // Navigation State
  const [activeView, setActiveView] = useState<MobileTab>('dashboard');
  const [activeSectionTab, setActiveSectionTab] = useState<SectionTabId>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('daily');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // UI Modes: Android Frame Mockup vs Full Mobile Screen
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [rippleIntensity, setRippleIntensity] = useState<'vibrant' | 'subtle' | 'minimal'>('subtle');

  // Modals State
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [editingSlip, setEditingSlip] = useState<SlipEntry | null>(null);
  const [slipModalInitialItem, setSlipModalInitialItem] = useState('');
  const [isDbSettingsOpen, setIsDbSettingsOpen] = useState(false);

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (toast: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newToast: ToastMessage = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check Supabase connection on load
  useEffect(() => {
    if (isSupabaseConfigured()) {
      testSupabaseConnection().then((res) => {
        setIsCloudConnected(res.connected);
      });
    }
  }, []);

  // Update sync queue counter periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncQueueCount(getSyncQueueLength());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut ⌘K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Refresh all state from db
  const refreshAllData = useCallback(() => {
    setItems(getAllItems());
    setSlips(getAllSlips());
    setDepartmentTrackers(getAllDepartments());
    setSyncQueueCount(getSyncQueueLength());
    setIsCloudConnected(isSupabaseConfigured());
  }, []);

  // Authentication Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    showToast({
      type: 'success',
      title: `Welcome, ${user.name}!`,
      message: `Signed in as ${user.role === 'admin' ? 'Executive Admin' : 'Store Manager'}.`,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('bite_auth_user');
    setCurrentUser(null);
    showToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been logged out securely.',
    });
  };

  const handleSwitchRole = (newRole: 'admin' | 'store_manager') => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      role: newRole,
      name: newRole === 'admin' ? RESTAURANT_METADATA.admin : RESTAURANT_METADATA.manager,
    };
    setCurrentUser(updated);
    localStorage.setItem('bite_auth_user', JSON.stringify(updated));
    showToast({
      type: 'info',
      title: 'Role Switched',
      message: `Active profile: ${updated.name}`,
    });
  };

  // CRUD: CREATE OR UPDATE SLIP
  const handleSaveSlip = async (
    slipData: any,
    isEdit?: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isEdit && slipData.id) {
        // UPDATE SLIP
        const res = await updateSlip(slipData.id, slipData);
        if (res.success && res.data) {
          refreshAllData();
          showToast({
            type: 'success',
            title: 'Slip Updated',
            message: res.message,
          });
          return { success: true };
        } else {
          showToast({
            type: 'error',
            title: 'Update Failed',
            message: res.message || res.error,
          });
          return { success: false, error: res.error };
        }
      } else {
        // CREATE SLIP
        const res = await createSlip({
          date: slipData.date,
          itemName: slipData.itemName,
          category: slipData.category,
          quantity: slipData.quantity,
          unit: slipData.unit,
          priceRs: slipData.priceRs,
          remarks: slipData.remarks,
          loggedBy: currentUser?.name,
          status: 'Verified',
        });

        if (res.success && res.data) {
          refreshAllData();
          showToast({
            type: 'success',
            title: 'Slip Recorded Successfully',
            message: res.message,
          });
          return { success: true };
        } else {
          showToast({
            type: 'error',
            title: 'Save Failed',
            message: res.message || res.error,
          });
          return { success: false, error: res.error };
        }
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Database Exception',
        message: err?.message || 'Unexpected error occurred while writing slip.',
      });
      return { success: false, error: err?.message };
    }
  };

  // CRUD: DELETE SLIP
  const handleDeleteSlip = async (slipId: string) => {
    try {
      const res = await deleteSlip(slipId);
      if (res.success) {
        refreshAllData();
        showToast({
          type: 'info',
          title: 'Slip Deleted',
          message: res.message,
        });
      } else {
        showToast({
          type: 'error',
          title: 'Delete Failed',
          message: res.message || res.error,
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Delete Error',
        message: err?.message || 'Failed to remove slip from database.',
      });
    }
  };

  // Open Edit Modal for a Slip
  const handleEditSlip = (slip: SlipEntry) => {
    setEditingSlip(slip);
    setSlipModalInitialItem('');
    setIsSlipModalOpen(true);
  };

  // CRUD: UPDATE ITEM STOCK & DEMAND
  const handleUpdateStock = (itemId: string, newStock: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const delta = newStock - item.currentStock;
    const res = updateItemQuantity(itemId, delta, 0);
    if (res.success) {
      refreshAllData();
    }
  };

  const handleUpdateDemand = (itemId: string, newDemand: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const delta = newDemand - item.pendingDemand;
    const res = updateItemQuantity(itemId, 0, delta);
    if (res.success) {
      refreshAllData();
      if (newDemand > 0) {
        showToast({
          type: 'info',
          title: 'Demand Added',
          message: `${item.name}: ${newDemand} ${item.unit} added to purchase requisition.`,
        });
      }
    }
  };

  const handleEditItem = (updatedItem: ItemMaster) => {
    const res = updateItemDetails(updatedItem.id, updatedItem);
    if (res.success) {
      refreshAllData();
      showToast({
        type: 'success',
        title: 'Item Details Updated',
        message: `${updatedItem.name} catalog information saved.`,
      });
    }
  };

  const handleRecordSlipForItem = (itemName: string) => {
    setEditingSlip(null);
    setSlipModalInitialItem(itemName);
    setIsSlipModalOpen(true);
  };

  const handleUpdateDepartmentTracker = (
    trackerId: string,
    updated: Partial<DepartmentTracker>
  ) => {
    const res = updateDepartment(trackerId, updated);
    if (res.success) {
      refreshAllData();
    }
  };

  // Open fresh slip entry modal
  const handleOpenNewSlip = () => {
    setEditingSlip(null);
    setSlipModalInitialItem('');
    setIsSlipModalOpen(true);
  };

  // If user is not authenticated, show Admin Login Page
  if (!currentUser) {
    return (
      <div className="relative min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-center">
        <LiquidRippleCanvas interactive={true} intensityMode={rippleIntensity} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <AdminLoginPage onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Count items with pending demands for navigation badge
  const totalPendingDemandsCount = items.filter((i) => i.pendingDemand > 0).length;

  return (
    <div
      className={`min-h-screen bg-[#0F172A] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 ${
        isPhoneFrame ? 'p-2 sm:p-6 flex items-center justify-center' : ''
      }`}
    >
      {/* 2D / WebGL Liquid Drop & Water Ripple Canvas Overlay */}
      <LiquidRippleCanvas interactive={true} intensityMode={rippleIntensity} />

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Main Container: Full viewport or Simulated Android Frame */}
      <div
        className={`w-full ${
          isPhoneFrame
            ? 'max-w-[440px] h-[92vh] max-h-[890px] rounded-[48px] border-[10px] border-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_2px_rgba(255,255,255,0.1)] overflow-hidden flex flex-col bg-slate-950 relative ring-1 ring-cyan-500/20'
            : 'min-h-screen flex flex-col relative'
        }`}
      >
        {/* Android Top Status Bar */}
        <AndroidStatusBar
          isCloudConnected={isCloudConnected}
          syncQueueCount={syncQueueCount}
          onSyncClick={() => setIsDbSettingsOpen(true)}
        />

        {/* Top Navbar / Header */}
        <Navbar
          currentUser={currentUser}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          searchQuery={globalSearchQuery}
          onSearchChange={setGlobalSearchQuery}
          onOpenQuickSlip={handleOpenNewSlip}
          onLogout={handleLogout}
          onSwitchRole={handleSwitchRole}
          rippleIntensity={rippleIntensity}
          onToggleRippleIntensity={() =>
            setRippleIntensity((prev) =>
              prev === 'vibrant' ? 'subtle' : prev === 'subtle' ? 'minimal' : 'vibrant'
            )
          }
        />

        {/* Device Mode Switcher & Quick Diagnostics Bar */}
        <div className="bg-slate-900/90 border-b border-white/5 px-4 py-2 flex items-center justify-between text-xs z-20">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
              <span>Bite Larkana Android App</span>
            </span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">• VIP Road Branch</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDbSettingsOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] transition-colors"
              title="Cloud Database Diagnostics & Settings"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">DB Settings</span>
            </button>

            {/* Viewport Frame Toggle */}
            <button
              onClick={() => {
                playHapticSound('tap');
                setIsPhoneFrame(!isPhoneFrame);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] transition-colors"
              title={isPhoneFrame ? 'Switch to Fullscreen View' : 'Switch to Android Phone Frame'}
            >
              {isPhoneFrame ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Phone Frame</span>
                </>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playHapticSound('tap');
              }}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
              title={soundEnabled ? 'Mute Haptic Audio' : 'Enable Haptic Audio'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Main Content Area */}
        <main
          className={`flex-1 overflow-y-auto px-3 sm:px-6 py-4 pb-24 relative z-10 ${
            isPhoneFrame ? 'scrollbar-thin' : 'max-w-7xl mx-auto w-full'
          }`}
        >
          {/* View Switcher */}
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <AnalyticsOverview
                  slips={slips}
                  items={items}
                  selectedYear={selectedYear}
                  onSelectSection={(secId) => {
                    setActiveSectionTab(secId);
                    setActiveView('sections');
                  }}
                  onNavigateToCompare={() => setActiveView('compare')}
                />
              </motion.div>
            )}

            {activeView === 'compare' && (
              <motion.div
                key="compare"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <MonthComparisonView
                  slips={slips}
                  items={items}
                  onOpenNewSlip={handleOpenNewSlip}
                  onShowToast={showToast}
                />
              </motion.div>
            )}

            {activeView === 'sections' && (
              <motion.div
                key="sections"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <SectionItemGrid
                  items={items}
                  departmentTrackers={departmentTrackers}
                  activeTab={activeSectionTab}
                  onTabChange={setActiveSectionTab}
                  onUpdateStock={handleUpdateStock}
                  onUpdateDemand={handleUpdateDemand}
                  onEditItem={handleEditItem}
                  onRecordSlipForItem={handleRecordSlipForItem}
                  onUpdateDepartmentTracker={handleUpdateDepartmentTracker}
                  globalSearchQuery={globalSearchQuery}
                />
              </motion.div>
            )}

            {activeView === 'slips_table' && (
              <motion.div
                key="slips_table"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <InventoryTable
                  slips={slips}
                  onDeleteSlip={handleDeleteSlip}
                  onEditSlip={handleEditSlip}
                  onOpenNewSlip={handleOpenNewSlip}
                  initialSearch={globalSearchQuery}
                  onShowToast={showToast}
                />
              </motion.div>
            )}

            {activeView === 'procurement' && (
              <motion.div
                key="procurement"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <ProcurementSlipView
                  items={items}
                  departmentTrackers={departmentTrackers}
                  onClearDemands={() => {
                    const reset = items.map((i) => ({ ...i, pendingDemand: 0 }));
                    saveAllItems(reset);
                    refreshAllData();
                    showToast({
                      type: 'info',
                      title: 'Demands Cleared',
                      message: 'Market procurement demands cleared from queue.',
                    });
                  }}
                />
              </motion.div>
            )}

            {activeView === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-4 max-w-xl mx-auto"
              >
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Administrator Settings</h2>
                      <p className="text-xs text-slate-400">
                        Bite Restaurant Larkana • Branch Management
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current User:</span>
                      <strong className="text-white">{currentUser.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Role:</span>
                      <span className="text-cyan-400 font-semibold uppercase">{currentUser.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Branch:</span>
                      <span className="text-slate-200">{currentUser.branch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Slips in Ledger:</span>
                      <span className="text-emerald-400 font-mono font-bold">{slips.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Database Sync Status:</span>
                      <span className={isCloudConnected ? 'text-emerald-400 font-bold' : 'text-cyan-400'}>
                        {isCloudConnected ? 'Cloud PostgreSQL Synced' : 'Resilient Local Storage'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => setIsDbSettingsOpen(true)}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors"
                    >
                      <Database className="w-4 h-4" />
                      <span>Configure Supabase</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-rose-300 border border-slate-700 text-xs font-semibold transition-colors"
                    >
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Floating Action Button for Instant Paper Slip Logging */}
        <AndroidFAB onClick={handleOpenNewSlip} label="Log Slip" />

        {/* Android Bottom Navigation Bar */}
        <AndroidBottomNav
          activeTab={activeView}
          onTabChange={(tab) => {
            setActiveView(tab);
          }}
          onQuickAddSlip={handleOpenNewSlip}
          unreadDemandCount={totalPendingDemandsCount}
        />
      </div>

      {/* Slip Entry & Edit Modal */}
      <SlipEntryModal
        isOpen={isSlipModalOpen}
        onClose={() => {
          setIsSlipModalOpen(false);
          setEditingSlip(null);
        }}
        onSaveSlip={handleSaveSlip}
        availableItems={items}
        currentUser={currentUser}
        initialItemName={slipModalInitialItem}
        editingSlip={editingSlip}
      />

      {/* Cloud Database Diagnostics & Settings Modal */}
      <CloudDbSettingsModal
        isOpen={isDbSettingsOpen}
        onClose={() => setIsDbSettingsOpen(false)}
        onDataChanged={refreshAllData}
        onShowToast={showToast}
      />
    </div>
  );
}

export default App;
