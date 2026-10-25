import React from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { playHapticSound } from '../../services/dbService';

interface AndroidFABProps {
  onClick: () => void;
  label?: string;
}

export const AndroidFAB: React.FC<AndroidFABProps> = ({ onClick, label = 'Log Slip' }) => {
  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-40">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          playHapticSound('tap');
          onClick();
        }}
        className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold px-4 py-3 rounded-full shadow-[0_8px_25px_rgba(6,182,212,0.4)] border border-cyan-300/30 active:shadow-inner"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span className="text-sm tracking-wide">{label}</span>
      </motion.button>
    </div>
  );
};
