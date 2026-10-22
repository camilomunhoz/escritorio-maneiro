import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Minus } from 'lucide-react';
import type { DrawerMode } from '../../types';

export interface DrawerHostProps {
  children: React.ReactNode;
}

export const DrawerHost: React.FC<DrawerHostProps> = ({ children }) => {
  const { state, setDrawerOpen } = useApp();

  // Width and height mapping according to explicit specifications
  const dimensionClasses: Record<DrawerMode, string> = {
    normal: 'w-[350px] h-[500px]',
    expanded: 'w-[750px] h-[500px]',
    compact: 'w-[350px] h-[50px]',
  };

  const currentDimensionClass = dimensionClasses[state.drawerMode] || dimensionClasses.normal;

  return (
    <div
      className={`fixed bottom-12 right-6 z-40 transition-all duration-300 ease-in-out transform origin-bottom-right ${
        state.drawerOpen
          ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
          : 'translate-y-16 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      {/* Outer Floating Drawer Card */}
      <div
        className={`relative flex flex-col bg-white rounded-2xl border border-calm-200/90 shadow-drawer overflow-hidden transition-all duration-300 ease-in-out ${currentDimensionClass}`}
      >
        {/* Compact Window Header */}
        <div className="flex items-center justify-between px-3 py-1 h-7 bg-calm-50/90 border-b border-calm-200/70 select-none text-[11px] text-calm-600 shrink-0">
          {/* Left: App Title */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sage-500" />
            <span className="font-semibold text-calm-800 tracking-tight text-xs">Escritório Divertido</span>
          </div>

          {/* Right: Window Actions */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1 rounded text-calm-400 hover:text-calm-700 hover:bg-calm-200/60 transition cursor-pointer"
              title="Minimizar para a bandeja"
            >
              <Minus size={13} />
            </button>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1 rounded text-calm-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              title="Fechar"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Interior Container */}
        <div className="relative flex-1 overflow-hidden flex flex-col bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};
