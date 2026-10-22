import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { AvatarSvg } from '../../ui/AvatarSvg';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Play, Lock, Clock, Trophy, HelpCircle, Gamepad2 } from 'lucide-react';
import type { Coworker } from '../../../types';

interface GamesScreenProps {
  onOpenCoworkerProfile?: (coworker: Coworker) => void;
  onOpenOwnProfile?: () => void;
}

export const GamesScreen: React.FC<GamesScreenProps> = ({
  onOpenCoworkerProfile,
  onOpenOwnProfile,
}) => {
  const { state, setDrawerMode } = useApp();
  const { gameCycle, user, coworkers } = state;

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isUnlocked = now >= gameCycle.nextReleaseTimestamp;
  const msRemaining = Math.max(0, gameCycle.nextReleaseTimestamp - now);

  const hours = Math.floor(msRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);
  const formattedCountdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const gameTitles: Record<string, string> = {
    cobrinha: 'Cobrinha de Frutos',
    pong: 'Pong Corporativo',
    termo: 'Termo de Bem-Estar',
  };

  const handlePlayNow = () => {
    setDrawerMode('expanded');
  };

  // Combine coworkers and user for leaderboard
  const sortedLeaderboard = [...gameCycle.roundLeaderboard].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto px-4 py-3 space-y-4 select-none">
      {/* 1. Header do Módulo de Jogos */}
      <div className="flex items-center justify-between pb-2 border-b border-calm-200/80">
        <div>
          <h2 className="text-sm font-semibold text-calm-900 flex items-center gap-1.5">
            <Gamepad2 size={16} className="text-sage-700" />
            <span>Pausas Sincronizadas</span>
          </h2>
          <p className="text-[11px] text-calm-500">Novas partidas liberadas a cada 3 horas</p>
        </div>
        <Badge variant={isUnlocked ? 'sage' : 'calm'} size="sm">
          {isUnlocked ? 'Liberado' : 'Aguardando'}
        </Badge>
      </div>

      {/* 2. Card Principal de Status da Rodada */}
      <Card variant="subtle" padding="md" className="flex flex-col items-center text-center gap-3">
        {/* Caso 1: Jogo Bloqueado (Misterioso com Countdown) */}
        {!isUnlocked && (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-14 h-14 rounded-2xl bg-calm-200/70 border border-calm-300 flex items-center justify-center text-calm-500">
              <HelpCircle size={28} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-calm-900">Jogo Misterioso da Rodada</h3>
              <p className="text-[11px] text-calm-500 max-w-[240px] mt-0.5">
                O minijogo sincronizado será revelado para toda a empresa no término do contador.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-calm-200 shadow-xs font-mono text-xs font-bold text-calm-700 mt-1">
              <Clock size={14} className="text-sand-600" />
              <span>{formattedCountdown}</span>
            </div>

            <Button
              variant="subtle"
              size="sm"
              disabled
              className="mt-2 w-full gap-1.5 opacity-60 cursor-not-allowed"
            >
              <Lock size={13} />
              <span>Aguardando Liberação</span>
            </Button>
          </div>
        )}

        {/* Caso 2: Liberado e Não Jogado */}
        {isUnlocked && !gameCycle.playedInCurrentCycle && (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-14 h-14 rounded-2xl bg-sage-100 border border-sage-200 flex items-center justify-center text-sage-700">
              <Gamepad2 size={30} />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-sage-700 uppercase tracking-wider">
                Rodada Ativa
              </span>
              <h3 className="text-sm font-semibold text-calm-900">
                {gameTitles[gameCycle.currentGame]}
              </h3>
              <p className="text-[11px] text-calm-500 max-w-[240px] mt-0.5">
                Participe agora, acumule XP e ajude seu setor no ranking corporativo.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handlePlayNow}
              className="mt-2 w-full gap-1.5 animate-pulse"
            >
              <Play size={14} />
              <span>Jogar Agora</span>
            </Button>
          </div>
        )}

        {/* Caso 3: Já Jogado no Ciclo Atual (Apenas 1 tentativa permitida) */}
        {isUnlocked && gameCycle.playedInCurrentCycle && (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-12 h-12 rounded-2xl bg-sand-100 border border-sand-200 flex items-center justify-center text-sand-800">
              <Trophy size={24} />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-sage-700 uppercase tracking-wider">
                Tentativa Concluída
              </span>
              <h3 className="text-sm font-semibold text-calm-900">
                {gameTitles[gameCycle.currentGame]}
              </h3>
              <p className="text-xs font-bold text-sage-800 mt-0.5">
                Sua pontuação: {gameCycle.lastScore} pontos
              </p>
            </div>

            <div className="w-full bg-calm-50 border border-calm-200 rounded-lg p-2.5 text-center mt-1">
              <p className="text-[11px] text-calm-600 font-medium">
                Cada rodada permite apenas uma tentativa.
              </p>
              <p className="text-[10px] text-calm-400 mt-0.5">
                Aguarde a próxima rodada para jogar novamente.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* 3. Ranking / Leaderboard da Rodada Atual */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-calm-800 flex items-center gap-1.5">
            <Trophy size={13} className="text-sand-600" />
            <span>Placar da Rodada</span>
          </span>
          <span className="text-[10px] text-calm-500">Top 5 Colaboradores</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {sortedLeaderboard.slice(0, 5).map((entry, index) => {
            const isUser = entry.userId === user.id;

            const handleEntryClick = () => {
              if (isUser) {
                onOpenOwnProfile?.();
              } else {
                const found = coworkers.find(c => c.id === entry.userId) || {
                  id: entry.userId,
                  name: entry.name,
                  department: entry.department,
                  avatarColor: entry.avatarColor,
                  level: 3,
                  xp: entry.score * 10,
                  streak: 4,
                  interests: ['Jogos', 'Tecnologia'],
                  isFriend: false,
                  friendRequestStatus: 'none',
                  selectedMedalIds: [],
                };
                onOpenCoworkerProfile?.(found);
              }
            };

            return (
              <div
                key={entry.userId}
                onClick={handleEntryClick}
                className={`p-2 rounded-lg border flex items-center justify-between transition cursor-pointer hover:border-calm-300 hover:shadow-soft ${
                  isUser
                    ? 'bg-sage-50/80 hover:bg-sage-100/90 border-sage-300 font-semibold text-sage-900'
                    : 'bg-white hover:bg-calm-50 border-calm-200 text-calm-800'
                }`}
                title={`Clique para ver o perfil de ${isUser ? 'você' : entry.name}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-4 text-center font-mono text-[11px] font-bold text-calm-500">
                    {index + 1}º
                  </span>
                  <AvatarSvg color={entry.avatarColor} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs truncate leading-tight">
                      {entry.name} {isUser && '(Você)'}
                    </p>
                    <p className="text-[10px] text-calm-400 truncate">{entry.department}</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-calm-700 shrink-0">
                  {entry.score} pts
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GamesScreen;
