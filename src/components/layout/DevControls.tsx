import React from 'react';
import { useApp } from '../../context/AppContext';
import { RefreshCw, Zap, Droplets, UserCheck, Sparkles, X, Sliders } from 'lucide-react';
import { Button } from '../ui/Button';

export const DevControls: React.FC = () => {
  const {
    state,
    isGodmodeOpen,
    setGodmodeOpen,
    godmodeUnlockNextGame,
    godmodeSimulateWater,
    godmodeSimulatePostureAlert,
    addXP,
    toggleVacationMode,
    resetAllData,
    reopenOnboarding,
    setDrawerOpen,
    setDrawerMode,
  } = useApp();

  if (!isGodmodeOpen) {
    return null;
  }

  return (
    <div className="fixed top-6 left-32 z-50 select-none animate-fadeIn">
      <div className="w-80 bg-slate-900/95 border border-sage-500/30 rounded-xl p-3.5 shadow-2xl backdrop-blur-xl text-calm-200 text-xs flex flex-col gap-3">
        {/* Window Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5">
            <Sliders size={14} className="text-sage-400" />
            <span className="font-semibold text-calm-100">Painel de Testes & Ajustes</span>
          </div>
          <button
            onClick={() => setGodmodeOpen(false)}
            className="p-1 rounded-lg text-calm-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Fechar painel"
          >
            <X size={14} />
          </button>
        </div>

        {/* Drawer Modes for testing */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-calm-400 font-medium">Visualização do Drawer</span>
          <div className="grid grid-cols-3 gap-1">
            <Button size="sm" variant="subtle" onClick={() => { setDrawerOpen(true); setDrawerMode('compact'); }}>
              Compacto
            </Button>
            <Button size="sm" variant="subtle" onClick={() => { setDrawerOpen(true); setDrawerMode('normal'); }}>
              Normal
            </Button>
            <Button size="sm" variant="subtle" onClick={() => { setDrawerOpen(true); setDrawerMode('expanded'); }}>
              Expandido
            </Button>
          </div>
        </div>

        {/* Bypass & Events */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-calm-400 font-medium">Ações de Teste & Simulação</span>
          <button
            onClick={godmodeUnlockNextGame}
            className="w-full text-left px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 transition text-calm-300 flex items-center gap-2 cursor-pointer"
          >
            <Zap size={13} className="text-sand-400" />
            <span>Liberar Próximo Jogo (Bypass 3h)</span>
          </button>
          <button
            onClick={godmodeSimulateWater}
            className="w-full text-left px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 transition text-calm-300 flex items-center gap-2 cursor-pointer"
          >
            <Droplets size={13} className="text-sage-400" />
            <span>Simular Consumo de Água (+1)</span>
          </button>
          <button
            onClick={godmodeSimulatePostureAlert}
            className="w-full text-left px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 transition text-calm-300 flex items-center gap-2 cursor-pointer"
          >
            <UserCheck size={13} className="text-terracottaMuted-200" />
            <span>Simular Alerta de Postura</span>
          </button>
          <button
            onClick={() => addXP(100)}
            className="w-full text-left px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 transition text-calm-300 flex items-center gap-2 cursor-pointer"
          >
            <Zap size={13} className="text-sage-400" />
            <span>Adicionar Experiência (+100 XP)</span>
          </button>
          <button
            onClick={toggleVacationMode}
            className="w-full text-left px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 transition text-calm-300 flex items-center justify-between cursor-pointer"
          >
            <span>Modo Férias (Congelar Streak)</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${state.user.vacationMode ? 'bg-sage-600 text-white' : 'bg-calm-700 text-calm-400'}`}>
              {state.user.vacationMode ? 'ATIVO' : 'DESL'}
            </span>
          </button>
        </div>

        {/* Global state actions */}
        <div className="border-t border-white/10 pt-2 flex flex-col gap-1.5">
          <button
            onClick={reopenOnboarding}
            className="w-full text-left px-2 py-1.5 rounded bg-sage-950/40 hover:bg-sage-900/60 transition text-sage-300 flex items-center gap-2 cursor-pointer text-[11px]"
          >
            <Sparkles size={12} className="text-sage-400" />
            <span>Reabrir Onboarding Inicial</span>
          </button>

          <button
            onClick={resetAllData}
            className="w-full text-left px-2 py-1.5 rounded bg-red-950/40 hover:bg-red-900/60 transition text-red-300 flex items-center gap-2 cursor-pointer text-[11px]"
          >
            <RefreshCw size={12} />
            <span>Resetar Dados (Reiniciar Tudo)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevControls;
