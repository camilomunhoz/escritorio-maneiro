import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { UserAvatar } from '../../ui/UserAvatar';
import { Card } from '../../ui/Card';
import { Play, Clock, Trophy, Gamepad2 } from 'lucide-react';
import { Podium } from './Podium';
import { Button } from '../../ui/Button';
import { GameThumbnail } from './GameThumbnail';
import type { Coworker } from '../../../types';

interface GamesScreenProps {
  onOpenCoworkerProfile?: (coworker: Coworker) => void;
  onOpenOwnProfile?: () => void;
  onStartGame?: () => void;
  onOpenGlobalLeaderboard?: () => void;
}

export const GamesScreen: React.FC<GamesScreenProps> = ({
  onOpenCoworkerProfile,
  onOpenOwnProfile,
  onStartGame,
  onOpenGlobalLeaderboard,
}) => {
  const { state, setDrawerMode, advanceGameCycle } = useApp();
  const { gameCycle, user, coworkers } = state;

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (gameCycle.playedInCurrentCycle && now >= gameCycle.nextReleaseTimestamp) {
      advanceGameCycle();
    }
  }, [gameCycle.playedInCurrentCycle, gameCycle.nextReleaseTimestamp, now, advanceGameCycle]);

  const isUnlocked = now >= gameCycle.nextReleaseTimestamp;
  const canPlay = isUnlocked && !gameCycle.playedInCurrentCycle;
  const msRemaining = Math.max(0, gameCycle.nextReleaseTimestamp - now);

  const hours = Math.floor(msRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);
  const formattedCountdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const gameTitles: Record<string, string> = {
    cobrinha: 'Jogo da Cobrinha',
    pong: 'Ping y Pong',
    termo: 'Termo',
  };

  const handlePlayNow = () => {
    if (onStartGame) {
      onStartGame();
    } else {
      setDrawerMode('expanded');
    }
  };

  // Combine coworkers and user for leaderboard
  const sortedLeaderboard = [...gameCycle.roundLeaderboard].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden select-none">
      {/* 1. Header Fixado do Módulo de Jogos */}
      <div className="px-4 py-2.5 border-b border-calm-200 bg-calm-50/90 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-calm-900 flex items-center gap-1.5">
            <Gamepad2 size={16} className="text-sage-700" />
            <span>Pausas Sincronizadas</span>
          </h2>
          <p className="text-[11px] text-calm-500">Novas partidas liberadas a cada 3 horas</p>
        </div>
        <button
          onClick={onOpenGlobalLeaderboard}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-calm-200 hover:border-calm-300 hover:bg-calm-50/80 text-calm-800 hover:text-calm-950 font-medium text-xs shadow-xs hover:shadow-soft transition active:scale-95 cursor-pointer"
          title="Ver Placar Geral e Recordes de Todos os Tempos"
        >
          <Trophy size={13} className="text-sand-600" />
          <span>Placar geral</span>
        </button>
      </div>

      {/* Conteúdo Rolável */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0 flex flex-col justify-start">

        {/* 2. Card Principal de Status da Rodada */}
        <Card
          variant={canPlay ? 'default' : 'subtle'}
          padding="md"
          className={`relative overflow-hidden shrink-0 flex flex-col items-center text-center gap-3 transition-all duration-300 ${canPlay
            ? 'border-sand-400/35 bg-calm-950 shadow-drawer ring-1 ring-white/10'
            : 'border-calm-200/80'
            }`}
        >
          {/* Thumbnail dinâmico de fundo quando o jogo está disponível */}
          {canPlay && (
            <>
              <GameThumbnail game={gameCycle.currentGame} />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sand-200/40 to-transparent pointer-events-none z-10" />
            </>
          )}

          {/* Jogo Bloqueado ou Tentativa já concluída: Countdown normal */}
          {!canPlay && (
            <div className="relative z-10 flex flex-col items-center gap-2 py-2 w-full">
              <div>
                <h3 className="text-sm font-semibold text-calm-900">Novo jogo será liberado em:</h3>
              </div>

              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-calm-200 shadow-xs font-mono text-xs font-bold text-calm-700 mt-1">
                <Clock size={14} className="text-sand-600" />
                <span>{formattedCountdown}</span>
              </div>
            </div>
          )}

          {/* Liberado e Disponível para Jogar */}
          {canPlay && (
            <div className="relative z-10 flex flex-col items-center gap-2.5 py-1.5 w-full">
              {/* Título com a tipografia serifada de destaque do design system */}
              <div>
                <h3 className="font-serif text-lg font-bold text-calm-900 tracking-tight">
                  Hora do jogo!
                </h3>
                <p className="text-[11px] text-calm-600 max-w-[260px] mt-0.5 leading-relaxed">
                  O jogo da rodada está disponível. Faça sua pausa ativa para relaxar e acumular XP.
                </p>
              </div>

              {/* Botão de ação estilizado de acordo com o design system */}
              <Button
                variant="primary"
                size="md"
                onClick={handlePlayNow}
                className="mt-2 w-full gap-1.5"
              >
                <Play size={14} />
                <span>Jogar Agora</span>
              </Button>
            </div>
          )}
        </Card>

        {/* 3. Ranking / Leaderboard da Rodada Atual */}
        <div className="flex flex-col gap-3 shrink-0 pb-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-calm-800 flex items-center gap-1.5">
              <Trophy size={14} className="text-sand-600" />
              <span>Podium da Rodada</span>
            </span>
            <span className="text-[10px] text-calm-500">
              {gameTitles[gameCycle.currentGame] || 'Jogo da Rodada'}
            </span>
          </div>

          {/* Podio com os 3 Primeiros Colocados */}
          <Podium
            entries={sortedLeaderboard}
            currentUserId={user.id}
            coworkers={coworkers}
            onOpenCoworkerProfile={onOpenCoworkerProfile}
            onOpenOwnProfile={onOpenOwnProfile}
          />

          {/* Nome do jogo da rodada e listagem */}
          <div className="flex flex-col gap-2 pt-1">

            <div className="flex flex-col gap-1.5">
              {sortedLeaderboard.map((entry, index) => {
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
                      avatarBody: entry.avatarBody,
                      avatarFace: entry.avatarFace,
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
                    className={`p-2 rounded-lg border flex items-center justify-between transition cursor-pointer hover:border-calm-300 hover:shadow-soft ${isUser
                      ? 'bg-sage-50/80 hover:bg-sage-100/90 border-sage-300 font-semibold text-sage-900'
                      : 'bg-white hover:bg-calm-50 border-calm-200 text-calm-800'
                      }`}
                    title={`Clique para ver o perfil de ${isUser ? 'voce' : entry.name}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-4 text-center font-mono text-[11px] font-bold text-calm-500">
                        {index + 1}º
                      </span>
                      <UserAvatar userId={entry.userId} user={entry} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs truncate leading-tight">
                          {entry.name} {isUser && '(Voce)'}
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
      </div>
    </div>
  );
};

export default GamesScreen;
