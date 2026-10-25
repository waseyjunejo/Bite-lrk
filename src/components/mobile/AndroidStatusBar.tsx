import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, CloudCheck, CloudOff, RefreshCw } from 'lucide-react';

interface AndroidStatusBarProps {
  isCloudConnected?: boolean;
  syncQueueCount?: number;
  onSyncClick?: () => void;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  isCloudConnected = false,
  syncQueueCount = 0,
  onSyncClick,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-md text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between select-none z-30 border-b border-white/5">
      {/* Left: Clock */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-200 tracking-tight">{currentTime || '12:00'}</span>
        {syncQueueCount > 0 && (
          <button
            onClick={onSyncClick}
            className="flex items-center gap-1 bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full text-[10px] font-medium animate-pulse"
            title={`${syncQueueCount} pending offline slips`}
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span>{syncQueueCount} pending</span>
          </button>
        )}
      </div>

      {/* Middle: Android Front Camera Cutout Notch */}
      <div className="w-3.5 h-3.5 bg-slate-900 rounded-full border border-slate-800 shadow-inner flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
      </div>

      {/* Right: Network & Battery status */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onSyncClick}
          className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
          title={isCloudConnected ? 'Connected to Supabase PostgreSQL' : 'Local Storage Mode'}
        >
          {isCloudConnected ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Cloud</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
              <span>Local DB</span>
            </span>
          )}
        </button>
        <Wifi className="w-3.5 h-3.5 text-slate-300" />
        <Signal className="w-3.5 h-3.5 text-slate-300" />
        <div className="flex items-center gap-1 text-slate-200 font-medium text-[11px]">
          <span>98%</span>
          <BatteryMedium className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};
