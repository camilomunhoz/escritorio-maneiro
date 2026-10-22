import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Maximize2,
  Minimize2,
  Bell,
  Sparkles,
  Monitor,
  Folder,
  FileSpreadsheet,
  Globe,
  Trash2,
  Sliders,
} from 'lucide-react';

export interface DesktopContainerProps {
  children: React.ReactNode;
}

export const DesktopContainer: React.FC<DesktopContainerProps> = ({ children }) => {
  const { state, toggleDrawer, setDrawerOpen, isGodmodeOpen, toggleGodmode } = useApp();
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Track Fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Click on background desktop opens/focuses the drawer if closed
  const handleDesktopClick = (e: React.MouseEvent) => {
    // Only trigger if clicking directly on the desktop background, not inside interactive windows
    if (e.target === e.currentTarget && !state.drawerOpen) {
      setDrawerOpen(true);
    }
  };

  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <div
      onClick={handleDesktopClick}
      className="relative w-screen h-screen overflow-hidden select-none bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 flex flex-col justify-between"
    >
      {/* Subtle Corporate Desktop Wallpaper Details */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-sage-500 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-slateMuted-500 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-sand-500/30 blur-3xl" />
      </div>

      {/* Floating Discreet Fullscreen Button (No Top Bar) */}
      <div className="fixed top-3 right-4 z-20">
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-900/90 border border-white/10 hover:border-white/20 text-calm-200 hover:text-white transition-all text-xs font-medium backdrop-blur-md shadow-sm cursor-pointer active:scale-95"
          title="Alternar Modo Tela Cheia (F11)"
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          <span>{isFullscreen ? 'Janela' : 'Tela Cheia'}</span>
        </button>
      </div>

      {/* Central Desktop Work Area */}
      <main className="relative flex-1 w-full h-full p-6">
        {/* Fake Desktop Icons + Prominent Godmode Trigger */}
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-3 select-none">
          {/* 1. Este Computador (Discreet) */}
          <div className="group flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition cursor-default w-20 text-center">
            <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-white/10 flex items-center justify-center text-calm-400 group-hover:text-calm-200 shadow-sm">
              <Monitor size={20} />
            </div>
            <span className="text-[11px] text-calm-400 group-hover:text-calm-200 font-medium leading-tight">
              Este PC
            </span>
          </div>

          {/* 2. Documentos (Discreet) */}
          <div className="group flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition cursor-default w-20 text-center">
            <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-white/10 flex items-center justify-center text-calm-400 group-hover:text-calm-200 shadow-sm">
              <Folder size={20} />
            </div>
            <span className="text-[11px] text-calm-400 group-hover:text-calm-200 font-medium leading-tight">
              Documentos
            </span>
          </div>

          {/* 3. Planilhas Q3 (Discreet) */}
          <div className="group flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition cursor-default w-20 text-center">
            <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-white/10 flex items-center justify-center text-calm-400 group-hover:text-calm-200 shadow-sm">
              <FileSpreadsheet size={20} />
            </div>
            <span className="text-[11px] text-calm-400 group-hover:text-calm-200 font-medium leading-tight">
              Planilhas Q3
            </span>
          </div>

          {/* 4. Intranet (Discreet) */}
          <div className="group flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition cursor-default w-20 text-center">
            <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-white/10 flex items-center justify-center text-calm-400 group-hover:text-calm-200 shadow-sm">
              <Globe size={20} />
            </div>
            <span className="text-[11px] text-calm-400 group-hover:text-calm-200 font-medium leading-tight">
              Intranet
            </span>
          </div>

          {/* 5. Lixeira (Discreet) */}
          <div className="group flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition cursor-default w-20 text-center">
            <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-white/10 flex items-center justify-center text-calm-400 group-hover:text-calm-200 shadow-sm">
              <Trash2 size={20} />
            </div>
            <span className="text-[11px] text-calm-400 group-hover:text-calm-200 font-medium leading-tight">
              Lixeira
            </span>
          </div>

          <div className="w-12 h-px bg-white/10 my-0.5 mx-auto" />

          {/* 6. Prominent Godmode / Painel Dev Trigger */}
          <button
            onClick={e => {
              e.stopPropagation();
              toggleGodmode();
            }}
            className={`group relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer w-20 text-center active:scale-95 ${
              isGodmodeOpen
                ? 'bg-sage-950/80 border-2 border-sage-400 ring-2 ring-sage-500/40 shadow-lg shadow-sage-950/60'
                : 'bg-slate-900/90 hover:bg-sage-950/60 border border-sage-500/40 hover:border-sage-400/80 shadow-md ring-1 ring-sage-500/20'
            }`}
            title="Abrir Painel de Ajustes e Testes"
          >
            <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-sage-600 text-white text-[8px] font-bold rounded uppercase tracking-wider shadow-xs">
              DEV
            </span>
            <div className="w-10 h-10 rounded-lg bg-sage-900/60 border border-sage-500/50 flex items-center justify-center text-sage-300 group-hover:text-white shadow-inner">
              <Sliders size={20} className="animate-pulse" />
            </div>
            <span className="text-[11px] text-sage-300 group-hover:text-white font-semibold leading-tight">
              Painel Dev
            </span>
          </button>
        </div>

        {/* Drawer and Overlays */}
        {children}
      </main>

      {/* Bottom Simulated Taskbar */}
      <footer className="relative z-30 h-11 w-full bg-slate-950/80 backdrop-blur-lg border-t border-white/10 flex items-center justify-between px-4 text-calm-300">
        {/* Left: Start button simulation */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDrawer}
            className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 hover:bg-white/15 transition text-calm-100 font-medium text-xs cursor-pointer active:scale-95"
          >
            <Sparkles size={14} className="text-sage-400" />
            <span>Iniciar</span>
          </button>
        </div>

        {/* Right: System Tray & Clock */}
        <div className="flex items-center gap-3">
          {/* App Tray Icon Button */}
          <button
            onClick={toggleDrawer}
            className={`relative flex items-center justify-center p-1.5 rounded-md transition cursor-pointer active:scale-95 ${
              state.drawerOpen ? 'bg-sage-600/30 text-sage-300 ring-1 ring-sage-500/50' : 'hover:bg-white/10 text-calm-200'
            }`}
            title="Abrir / Fechar Plataforma de Bem-Estar"
          >
            <div className="w-5 h-5 rounded-full bg-sage-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              ED
            </div>

            {/* Notification Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-slate-950" />
            )}
          </button>

          {/* Quick Notification Tray Icon */}
          <div className="p-1 text-calm-400">
            <Bell size={14} />
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Clock & Date */}
          <div className="flex flex-col text-right leading-none cursor-default">
            <span className="text-xs font-semibold text-calm-200 tracking-wide">{timeStr}</span>
            <span className="text-[10px] text-calm-400 mt-0.5">{dateStr}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
