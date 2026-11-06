import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Maximize2,
  Minimize2,
  Bell,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { DecorativeDesktopIcons } from './DecorativeDesktopIcons';
import { GilbertBootScreen } from './GilbertBootScreen';
import { GilbertLoginScreen } from './GilbertLoginScreen';
import { DesktopGlitchOverlay } from './DesktopGlitchOverlay';
import { GLITCH_CONFIG } from '../../config/glitchConfig';
import {
  shouldBootGilbertOS,
  recordGilbertOSActivity,
  setGilbertOSAuthenticated,
} from './osSession';

export interface DesktopContainerProps {
  children: React.ReactNode;
}

export const DesktopContainer: React.FC<DesktopContainerProps> = ({ children }) => {
  const { state, toggleDrawer, setDrawerOpen, isGodmodeOpen, toggleGodmode, isGlitching } = useApp();
  const [osState, setOsState] = useState<'booting' | 'boot_fading' | 'login' | 'unlocking' | 'ready'>(() => {
    return shouldBootGilbertOS() ? 'booting' : 'ready';
  });

  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Registro periodico de atividade no localStorage a cada 10 segundos
  useEffect(() => {
    if (osState !== 'ready' && osState !== 'unlocking') return;

    recordGilbertOSActivity();
    const activityInterval = setInterval(() => {
      recordGilbertOSActivity();
    }, 10000);

    return () => clearInterval(activityInterval);
  }, [osState]);

  // Transicao suave da tela de boot (loading) para a tela de login
  const handleBootComplete = () => {
    setOsState('boot_fading');
    setTimeout(() => {
      setOsState('login');
    }, 700);
  };

  // Transicao suave de desbloqueio para a area de trabalho
  const handleLoginSuccess = () => {
    setGilbertOSAuthenticated(true);
    setOsState('unlocking');

    // Aguarda a animacao de dissolucao da tela de login para desmonta-la
    setTimeout(() => {
      setOsState('ready');
    }, 950);
  };

  // Relogio em tempo real da barra de tarefas
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

  // Rastreamento do modo Tela Cheia
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

  const handleDesktopClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !state.drawerOpen) {
      setDrawerOpen(true);
    }
  };

  const unreadCount = state.notifications.filter(n => !n.read).length;

  // 2. Desktop do GilbertOS com sobreposicao e transicao suave da tela de login
  return (
    <div
      onClick={handleDesktopClick}
      className={`relative w-screen h-screen overflow-hidden select-none bg-gradient-to-br from-[#060b18] via-[#0b142c] to-[#080e20] flex flex-col justify-between ${
        isGlitching && GLITCH_CONFIG.enableShake ? 'animate-desktop-glitch-shake' : ''
      }`}
    >
      {/* Subtle Corporate Desktop Wallpaper Details in bluish workstation tones */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-sky-500/20 blur-3xl" />
      </div>

      {/* Floating Discreet Fullscreen Button */}
      <div className="fixed top-3 right-4 z-20">
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/70 hover:bg-blue-950/80 border border-blue-400/20 hover:border-blue-400/40 text-blue-200 hover:text-white transition-all text-xs font-os font-medium backdrop-blur-md shadow-sm cursor-pointer active:scale-95"
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
          {/* Decorative, non-interactive desktop icons */}
          <DecorativeDesktopIcons />

          <div className="w-12 h-px bg-blue-400/20 my-0.5 mx-auto" />

          {/* Prominent Godmode / Painel Dev Trigger */}
          <button
            onClick={e => {
              e.stopPropagation();
              toggleGodmode();
            }}
            className={`group relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer w-20 text-center active:scale-95 ${
              isGodmodeOpen
                ? 'bg-blue-950/90 border-2 border-sky-400 ring-2 ring-sky-500/40 shadow-lg shadow-blue-950/70'
                : 'bg-slate-900/90 hover:bg-blue-950/80 border border-blue-500/40 hover:border-sky-400/80 shadow-md ring-1 ring-blue-500/20 shadow-blue-950/30'
            }`}
            title="Abrir Painel de Ajustes e Testes"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-950/70 border border-sky-500/50 flex items-center justify-center text-sky-300 group-hover:text-white shadow-inner">
              <Sliders size={20} className="animate-pulse" />
            </div>
            <span className="text-[11px] text-sky-200 group-hover:text-white font-semibold font-os leading-tight">
              Trapaças
            </span>
          </button>
        </div>

        {/* Drawer and Overlays */}
        {children}
      </main>

      {/* Bottom Simulated Taskbar */}
      <footer className="relative z-30 h-11 w-full bg-slate-950/90 backdrop-blur-xl border-t border-blue-500/20 flex items-center justify-between px-4 text-slate-300 font-os">
        {/* Left: Start button simulation */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDrawer}
            className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-600/20 hover:bg-blue-600/35 border border-blue-400/25 transition text-blue-100 font-os font-medium text-xs cursor-pointer active:scale-95 shadow-sm shadow-blue-950/40"
          >
            <Sparkles size={14} className="text-sky-300" />
            <span>Iniciar</span>
          </button>
        </div>

        {/* Right: System Tray & Clock */}
        <div className="flex items-center gap-3">
          {/* App Tray Icon Button */}
          <button
            onClick={toggleDrawer}
            className={`relative flex items-center justify-center p-1.5 rounded-md transition cursor-pointer active:scale-95 ${
              state.drawerOpen ? 'bg-blue-600/30 text-sky-300 ring-1 ring-sky-500/50' : 'hover:bg-white/10 text-slate-300'
            }`}
            title="Abrir / Fechar Plataforma de Bem-Estar"
          >
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-blue-500/40 font-os">
              N
            </div>

            {/* Notification Badge */}
            {state.onboardingCompleted && unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950" />
            )}
          </button>

          {/* Quick Notification Tray Icon */}
          <div className="p-1 text-slate-400 hover:text-sky-300 transition-colors">
            <Bell size={14} />
          </div>

          <div className="h-4 w-px bg-blue-400/20" />

          {/* Clock & Date */}
          <div className="flex flex-col text-right leading-none cursor-default font-os">
            <span className="text-xs font-semibold text-blue-100 tracking-wide font-os">{timeStr}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 font-os">{dateStr}</span>
          </div>
        </div>
      </footer>

      {/* Tela de login estilo Windows com transicao suave (fade-out e scale-up) */}
      {(osState === 'booting' || osState === 'boot_fading' || osState === 'login' || osState === 'unlocking') && (
        <GilbertLoginScreen
          userName={state.user.name}
          isUnlocking={osState === 'unlocking'}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Tela de boot do GilbertOS com transicao suave (crossfade de dissolucao para a tela de login) */}
      {(osState === 'booting' || osState === 'boot_fading') && (
        <GilbertBootScreen
          onBootComplete={handleBootComplete}
          isFadingOut={osState === 'boot_fading'}
        />
      )}

      {/* Efeito de Glitch em Tela Cheia ao ativar acoes de trapaca */}
      <DesktopGlitchOverlay isGlitching={isGlitching} />
    </div>
  );
};
