import React from 'react';
import { useApp } from '../../context/AppContext';
import { Zap, X, Sliders, RotateCcw, UserCheck, Sparkles, Gamepad2, Power } from 'lucide-react';
import { resetAndRebootGilbertOS } from './osSession';

export const DevControls: React.FC = () => {
  const {
    state,
    isGodmodeOpen,
    setGodmodeOpen,
    toggleUserExperienceMode,
    godmodeUnlockNextGame,
    godmodeNewDailyGoals,
    addXP,
    triggerGlitch,
  } = useApp();

  if (!isGodmodeOpen) {
    return null;
  }

  const isExperienced = state.isExperienced ?? false;

  return (
    <div className="fixed top-6 left-32 z-50 select-none animate-fadeIn font-os">
      <div className="w-90 bg-slate-950/95 border border-blue-500/30 rounded-xl p-3.5 shadow-2xl shadow-blue-950/80 backdrop-blur-xl text-slate-200 text-xs flex flex-col gap-3 font-os">
        {/* Window Header */}
        <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
          <div className="flex items-center gap-1.5">
            <Sliders size={14} className="text-sky-400" />
            <span className="font-semibold text-blue-100 font-os">Painel de Testes & Ajustes</span>
          </div>
          <button
            onClick={() => setGodmodeOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Fechar painel"
            aria-label="Fechar painel"
          >
            <X size={14} />
          </button>
        </div>

        {/* Ações de Teste */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-sky-400/80 font-medium font-os">Ações de Teste</span>

          {/* Botão de Simulação de Usuário em Primeiro Lugar */}
          <button
            onClick={toggleUserExperienceMode}
            className="w-full text-left px-2.5 py-2 rounded-lg bg-blue-950/30 hover:bg-blue-900/40 border border-blue-500/15 transition text-slate-200 flex flex-col gap-0.5 cursor-pointer font-os"
          >
            <div className="flex items-center gap-2">
              {isExperienced ? (
                <Sparkles size={14} className="text-sky-400 shrink-0" />
              ) : (
                <UserCheck size={14} className="text-blue-400 shrink-0" />
              )}
              <span className="font-medium text-blue-100">
                {isExperienced ? 'Simular novo usuário' : 'Simular usuário experiente'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 pl-5.5 leading-tight mt-1">
              {isExperienced
                ? 'Reinicia os dados com perfil zerado e reabre o onboarding inicial'
                : 'Simula um usuário que utiliza a plataforma há algum tempo'}
            </p>
          </button>

          <button
            onClick={() => {
              triggerGlitch();
              addXP(20);
            }}
            className="w-full text-left px-2.5 py-2 rounded-lg bg-blue-950/30 hover:bg-blue-900/40 border border-blue-500/15 transition text-slate-200 flex items-center gap-2.5 cursor-pointer font-os"
          >
            <Zap size={14} className="text-sky-400 shrink-0" />
            <span className="font-medium">Conceder Experiência (+20 XP)</span>
          </button>

          <button
            onClick={godmodeUnlockNextGame}
            className="w-full text-left px-2.5 py-2 rounded-lg bg-blue-950/30 hover:bg-blue-900/40 border border-blue-500/15 transition text-slate-200 flex items-center gap-2.5 cursor-pointer font-os"
          >
            <Gamepad2 size={14} className="text-blue-400 shrink-0" />
            <span className="font-medium">Liberar Próximo Jogo</span>
          </button>

          <button
            onClick={godmodeNewDailyGoals}
            className="w-full text-left px-2.5 py-2 rounded-lg bg-blue-950/30 hover:bg-blue-900/40 border border-blue-500/15 transition text-slate-200 flex items-center gap-2.5 cursor-pointer font-os"
          >
            <RotateCcw size={14} className="text-cyan-400 shrink-0" />
            <span className="font-medium">Novas Metas Diárias</span>
          </button>

          {/* Reiniciar tudo */}
          <div className="pt-1.5 mt-1 border-t border-blue-500/20">
            <button
              onClick={() => {
                triggerGlitch();
                setTimeout(() => {
                  resetAndRebootGilbertOS();
                }, 200);
              }}
              className="w-full py-2 px-2.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-200 text-center font-medium transition cursor-pointer flex items-center justify-center gap-2 text-xs shadow-sm active:scale-95 font-os"
              title="Limpa todos os dados salvos e reinicia o computador"
            >
              <Power size={14} className="text-red-400" />
              <span>Reiniciar tudo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevControls;
