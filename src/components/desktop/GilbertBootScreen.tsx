import React, { useEffect, useState } from 'react';

export interface GilbertBootScreenProps {
  onBootComplete: () => void;
  isFadingOut?: boolean;
}

export const GilbertBootScreen: React.FC<GilbertBootScreenProps> = ({
  onBootComplete,
  isFadingOut = false,
}) => {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Progresso sutil de carregamento durante os 2 segundos
    const startTime = Date.now();
    const duration = 2000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        onBootComplete();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onBootComplete]);

  return (
    <div
      className={`fixed inset-0 z-[60] bg-[#060b18] flex flex-col items-center justify-center select-none overflow-hidden text-white font-os transition-all duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle Ambient Blue Radial Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent" />

      {/* GilbertOS Brand Emblem */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 border border-blue-500/30 shadow-2xl shadow-blue-950/80 flex items-center justify-center">
            {/* Geometric 4-node grid emblem in workstation blues */}
            <div className="grid grid-cols-2 gap-1.5 p-2">
              <div className="w-4 h-4 rounded-sm bg-sky-400 shadow-xs shadow-sky-400/50" />
              <div className="w-4 h-4 rounded-sm bg-blue-600" />
              <div className="w-4 h-4 rounded-sm bg-indigo-400" />
              <div className="w-4 h-4 rounded-sm bg-cyan-300 shadow-xs shadow-cyan-300/50" />
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl sm:text-4xl font-light tracking-[0.25em] text-slate-100 uppercase font-os">
            Gilbert<span className="font-semibold text-sky-400">OS</span>
          </h1>
          <span className="text-xs text-sky-400/80 font-os-mono tracking-widest uppercase">
            Workstation Edition
          </span>
        </div>

        {/* Windows-like Circular Spinner & Progress Bar */}
        <div className="flex flex-col items-center gap-3 mt-8">
          <div className="w-6 h-6 border-2 border-slate-800 border-t-sky-400 rounded-full animate-spin" />
          <div className="w-36 h-1 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-blue-400 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

