import React from 'react';
import { useApp } from '../../context/AppContext';
import { Zap, X, Sliders, RotateCcw, UserCheck, Sparkles, Gamepad2 } from 'lucide-react';

export const DevControls: React.FC = () => {
  const {
    state,
    isGodmodeOpen,
    setGodmodeOpen,
    toggleUserExperienceMode,
    godmodeUnlockNextGame,
    godmodeNewDailyGoals,
    addXP,
  } = useApp();

  if (!isGodmodeOpen) {
    return null;
  }

  const isExperienced = state.isExperienced ?? false;

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
            aria-label="Fechar painel"
          >
            <X size={14} />
          </button>
        </div>

        {/* Ações de Teste */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-calm-400 font-medium">Ações de Teste</span>

          {/* Botão de Simulação de Usuário em Primeiro Lugar */}
          <button
            onClick={toggleUserExperienceMode}
            className="w-full text-left px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-calm-200 flex flex-col gap-0.5 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {isExperienced ? (
                <Sparkles size={14} className="text-sage-400 shrink-0" />
              ) : (
                <UserCheck size={14} className="text-sand-400 shrink-0" />
              )}
              <span className="font-medium text-calm-100">
                {isExperienced ? 'Simular novo usuário' : 'Simular usuário experiente'}
              </span>
            </div>
            <p className="text-[10px] text-calm-400 pl-5.5 leading-tight">
              {isExperienced
                ? 'Reinicia os dados com perfil zerado e reabre o onboarding inicial'
                : 'Simula um usuário que utiliza a plataforma há algum tempo'}
            </p>
          </button>

          <button
            onClick={() => addXP(20)}
            className="w-full text-left px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-calm-200 flex items-center gap-2.5 cursor-pointer"
          >
            <Zap size={14} className="text-sage-400 shrink-0" />
            <span className="font-medium">Conceder Experiência (+20 XP)</span>
          </button>

          <button
            onClick={godmodeUnlockNextGame}
            className="w-full text-left px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-calm-200 flex items-center gap-2.5 cursor-pointer"
          >
            <Gamepad2 size={14} className="text-sand-400 shrink-0" />
            <span className="font-medium">Liberar Próximo Jogo</span>
          </button>

          <button
            onClick={godmodeNewDailyGoals}
            className="w-full text-left px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-calm-200 flex items-center gap-2.5 cursor-pointer"
          >
            <RotateCcw size={14} className="text-amber-400 shrink-0" />
            <span className="font-medium">Novas Metas Diárias</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevControls;
