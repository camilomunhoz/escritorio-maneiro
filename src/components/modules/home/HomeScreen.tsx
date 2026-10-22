import React from 'react';
import { useApp } from '../../../context/AppContext';
import { AvatarSvg } from '../../ui/AvatarSvg';
import { Badge } from '../../ui/Badge';
import { ProgressBar } from '../../ui/ProgressBar';
import { Flame, Globe, Award, CheckCircle2, Circle, ChevronRight, ShieldAlert } from 'lucide-react';

interface HomeScreenProps {
  onOpenMedals: () => void;
  onOpenOwnProfile: () => void;
  onOpenSharedGoal: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenMedals,
  onOpenOwnProfile,
  onOpenSharedGoal,
}) => {
  const { state, setCurrentTab } = useApp();
  const { user, dailyGoals, sharedGoal, medals } = state;

  const currentLevelMinXP = (user.level - 1) * 100;
  const xpInCurrentLevel = user.xp - currentLevelMinXP;
  const xpNeededForNext = 100;

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto px-4 py-3 space-y-4">
      {/* 1. Header do Usuário: Avatar Projetado, Nível, Streak e XP (Abre Meu Perfil ao Clicar) */}
      <section
        onClick={onOpenOwnProfile}
        className="bg-gradient-to-b from-calm-50/90 to-white p-3.5 rounded-xl border border-calm-200/80 shadow-soft cursor-pointer hover:border-calm-300 hover:shadow-md transition-all group"
        title="Clique para visualizar seu perfil completo"
      >
        <div className="flex items-center gap-3">
          <AvatarSvg color={user.avatarColor} size="lg" projected />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 min-w-0">
                <h2 className="text-sm font-semibold text-calm-900 truncate group-hover:text-sage-800 transition">
                  {user.name}
                </h2>
                <ChevronRight size={13} className="text-calm-400 group-hover:text-calm-700 transition" />
              </div>
              {user.vacationMode ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-calm-600 bg-calm-100 px-2 py-0.5 rounded-full">
                  <ShieldAlert size={12} className="text-calm-500" />
                  Modo Férias
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-terracottaMuted-700 bg-sand-100/80 px-2 py-0.5 rounded-full">
                  <Flame size={12} className="fill-terracottaMuted-500 text-terracottaMuted-500" />
                  {user.streak} dias
                </span>
              )}
            </div>

            <p className="text-[11px] text-calm-500 truncate">{user.department}</p>

            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="sage" size="sm">Nível {user.level}</Badge>
              <span className="text-[10px] text-calm-500">{user.xp} XP acumulados</span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso de Nível */}
        <div className="mt-3 pt-2.5 border-t border-calm-200/60 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] text-calm-600">
            <span>Progresso do Nível {user.level}</span>
            <span className="font-semibold">{xpInCurrentLevel} / {xpNeededForNext} XP</span>
          </div>
          <ProgressBar value={xpInCurrentLevel} max={xpNeededForNext} color="sage" height="sm" />
        </div>
      </section>

      {/* 2. Metas Diárias Individuais (Jogos, Saúde, Social) */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-calm-800 tracking-tight">Metas do Dia</h3>
          <span className="text-[10px] text-calm-500">
            {dailyGoals.filter(g => g.completed).length} de {dailyGoals.length} concluídas
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {dailyGoals.map(goal => {
            const isCompleted = goal.completed;
            const pillarColors = {
              games: 'border-l-indigo-400',
              health: 'border-l-sage-500',
              social: 'border-l-sand-500',
            }[goal.pillar];

            const pillarNames = {
              games: 'Jogos',
              health: 'Saúde',
              social: 'Social',
            }[goal.pillar];

            return (
              <div
                key={goal.id}
                className={`p-2.5 rounded-lg border transition-all text-left flex items-center justify-between gap-2.5 ${
                  isCompleted
                    ? 'bg-sage-50/70 border-sage-200 text-sage-900'
                    : 'bg-white border-calm-200 shadow-soft'
                } border-l-4 ${pillarColors}`}
              >
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 size={16} className="text-sage-600" />
                    ) : (
                      <Circle size={16} className="text-calm-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-medium truncate ${isCompleted ? 'line-through text-calm-500' : 'text-calm-900'}`}>
                      {goal.title}
                    </p>
                    <p className="text-[10px] text-calm-500 leading-tight truncate">
                      {goal.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isCompleted ? (
                    <Badge variant="sage" size="sm">Feito</Badge>
                  ) : (
                    <span className="text-[10px] font-semibold text-sage-700 bg-sage-50 px-2 py-0.5 rounded border border-sage-200">
                      +{goal.xpReward} XP
                    </span>
                  )}

                  {/* Seta para direita que leva até a seção correspondente */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentTab(goal.pillar);
                    }}
                    className="p-1 rounded-md text-calm-400 hover:text-calm-800 hover:bg-calm-100 transition cursor-pointer"
                    title={`Ir para seção de ${pillarNames}`}
                    aria-label={`Ir para a seção ${pillarNames}`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Meta Compartilhada Corporativa: Volta ao Mundo em 30 Dias (Abre Detalhes ao Clicar) */}
      <section
        onClick={onOpenSharedGoal}
        className="bg-sand-50/80 hover:bg-sand-50 border border-sand-200/90 hover:border-sand-300 rounded-xl p-3.5 flex flex-col gap-2.5 cursor-pointer shadow-soft hover:shadow-md transition-all group"
        title="Clique para ver o ranking e conectar aplicativos"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-sand-200/70 text-sand-800 flex items-center justify-center shrink-0">
              <Globe size={16} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-sand-900 leading-tight truncate group-hover:text-sand-950 transition">
                {sharedGoal.title}
              </h4>
              <p className="text-[10px] text-sand-700 truncate">{sharedGoal.description}</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-sand-500 group-hover:text-sand-800 transition shrink-0" />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-sand-800 font-medium">
            <span>Progresso da Empresa</span>
            <span>{sharedGoal.currentKm.toLocaleString('pt-BR')} / {sharedGoal.targetKm.toLocaleString('pt-BR')} km</span>
          </div>
          <ProgressBar
            value={sharedGoal.currentKm}
            max={sharedGoal.targetKm}
            color="sand"
            height="sm"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-sand-700 pt-1 border-t border-sand-200/60">
          <span>{sharedGoal.deadlineDays} dias restantes</span>
          <span className="italic">Ver ranking e apps conectados</span>
        </div>
      </section>

      {/* 4. Miniatura do Quadro de Medalhas */}
      <section className="bg-white border border-calm-200/90 rounded-xl p-3 flex flex-col gap-2 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-calm-800">
            <Award size={14} className="text-sand-600" />
            <span>Quadro de Conquistas</span>
          </div>
          <button
            onClick={onOpenMedals}
            className="text-[11px] font-medium text-sage-700 hover:text-sage-900 flex items-center gap-0.5 cursor-pointer"
          >
            <span>Ver todas</span>
            <ChevronRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {medals.slice(0, 4).map(medal => (
            <div
              key={medal.id}
              onClick={onOpenMedals}
              className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center cursor-pointer transition ${
                medal.unlocked
                  ? 'bg-sand-50/60 border-sand-200 text-sand-900'
                  : 'bg-calm-50/50 border-calm-200/60 text-calm-400 opacity-60'
              }`}
              title={`${medal.title}: ${medal.description}`}
            >
              <Award size={16} className={medal.unlocked ? 'text-amber-600' : 'text-calm-400'} />
              <span className="text-[9px] font-medium mt-1 truncate max-w-[55px]">{medal.title}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;
