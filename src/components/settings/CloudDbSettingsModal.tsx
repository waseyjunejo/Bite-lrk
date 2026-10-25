import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  Server,
} from 'lucide-react';
import {
  getSavedSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
} from '../../lib/supabaseClient';
import {
  exportDatabaseBackup,
  importDatabaseBackup,
  resetDatabaseToCleanZero,
  getSyncQueueLength,
  playHapticSound,
} from '../../services/dbService';

interface CloudDbSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
  onShowToast: (toast: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }) => void;
}

export const CloudDbSettingsModal: React.FC<CloudDbSettingsModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
  onShowToast,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; message: string; latencyMs?: number } | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [syncQueueCount, setSyncQueueCount] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSavedSupabaseConfig();
      setSupabaseUrl(config.url || '');
      setSupabaseKey(config.anonKey || '');
      setSyncQueueCount(getSyncQueueLength());
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    playHapticSound('tap');

    // Temporarily save current form values to test
    saveSupabaseConfig({ url: supabaseUrl.trim(), anonKey: supabaseKey.trim() });
    const res = await testSupabaseConnection();
    setIsTesting(false);
    setTestResult(res);

    if (res.connected) {
      playHapticSound('success');
      onShowToast({
        type: 'success',
        title: 'Supabase Cloud Connected!',
        message: res.message,
      });
    } else {
      playHapticSound('warning');
      onShowToast({
        type: 'warning',
        title: 'Connection Note',
        message: res.message,
      });
    }
  };

  const handleSaveCredentials = () => {
    saveSupabaseConfig({ url: supabaseUrl.trim(), anonKey: supabaseKey.trim() });
    playHapticSound('success');
    onShowToast({
      type: 'success',
      title: 'Database Settings Saved',
      message: 'Supabase configuration updated successfully.',
    });
    handleTestConnection();
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    setTestResult(null);
    playHapticSound('tap');
    onShowToast({
      type: 'info',
      title: 'Switched to Resilient Local DB',
      message: 'Application will store all slips and inventory in verified local storage.',
    });
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    playHapticSound('tap');
    setTimeout(() => setCopiedSchema(false), 2000);
    onShowToast({
      type: 'info',
      title: 'SQL Schema Copied',
      message: 'Paste and run in your Supabase project SQL Editor.',
    });
  };

  const handleExportBackup = () => {
    const json = exportDatabaseBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bite-larkana-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    playHapticSound('success');
    onShowToast({
      type: 'success',
      title: 'Backup Downloaded',
      message: 'All slips and item masters archived to JSON file.',
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importDatabaseBackup(content);
        if (result.success) {
          onShowToast({
            type: 'success',
            title: 'Database Restored!',
            message: result.message,
          });
          onDataChanged();
          onClose();
        } else {
          onShowToast({
            type: 'error',
            title: 'Restore Failed',
            message: result.message,
          });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    resetDatabaseToCleanZero();
    setShowResetConfirm(false);
    onDataChanged();
    onShowToast({
      type: 'warning',
      title: 'Database Cleared',
      message: 'All inventory reset to verified clean zero baseline.',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Cloud Database & Diagnostics
              </h2>
              <p className="text-xs text-slate-400">
                Supabase PostgreSQL & Verified Dual-Tier Offline Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Connection Status Box */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Engine Status
            </span>
            {testResult?.connected ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Cloud PostgreSQL Active ({testResult.latencyMs}ms)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Resilient Local Verified DB (Active)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {testResult
              ? testResult.message
              : 'App guarantees zero data loss: slips are immediately saved to persistent local storage and automatically sync with Supabase PostgreSQL cloud whenever credentials are provided.'}
          </p>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-700/60">
            <span>Pending Sync Queue:</span>
            <span className="font-semibold text-white bg-slate-900 px-2 py-0.5 rounded">
              {syncQueueCount} record(s)
            </span>
          </div>
        </div>

        {/* Supabase Connection Form */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-cyan-400" />
              Supabase Project URL
            </label>
            <span className="text-[11px] text-cyan-400">Optional Cloud Sync</span>
          </div>
          <input
            type="text"
            placeholder="https://xyzproject.supabase.co"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
          />

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-1.5">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              Supabase Anon Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Pinging Cloud...' : 'Test Connection'}</span>
            </button>

            <button
              onClick={handleSaveCredentials}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-slate-950 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Connect</span>
            </button>

            {(supabaseUrl || supabaseKey) && (
              <button
                onClick={handleDisconnect}
                className="px-3 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {/* SQL Schema Copy Section */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              Supabase SQL Schema
            </span>
            <button
              onClick={handleCopySchema}
              className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/60 px-2 py-1 rounded-lg border border-cyan-800/50"
            >
              {copiedSchema ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSchema ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Creates <code className="text-cyan-300">bite_slips</code> and{' '}
            <code className="text-cyan-300">bite_items</code> tables with automatic RLS security.
          </p>
        </div>

        {/* Backup & Restore and Factory Reset */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Data Backup & Maintenance
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export JSON Backup</span>
            </button>

            <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Import & Restore</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-rose-400/80 hover:text-rose-300 text-xs hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Factory Reset to Clean Zero Baseline</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-between gap-2">
              <p className="text-xs text-rose-200">Reset all slips and restore 160 items to 0?</p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleConfirmReset}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
