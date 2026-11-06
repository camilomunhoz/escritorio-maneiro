import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../ui/Modal';
import { Podium } from './Podium';
import { UserAvatar } from '../../ui/UserAvatar';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { formatRelativeTime } from '../../../utils/formatters';
import type { GameType, Coworker, GameHighscoreEntry } from '../../../types';
import {
  Trophy,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type TimeFilterPeriod = 'all_time' | 'year' | 'month';

interface GlobalLeaderboardExpandedModalProps {
  onClose: () => void;
  onOpenProfile?: (coworker: Coworker | null, isOwn: boolean) => void;
  zIndex?: number;
}

export const GlobalLeaderboardExpandedModal: React.FC<GlobalLeaderboardExpandedModalProps> = ({
  onClose,
  onOpenProfile,
  zIndex,
}) => {
  const { state } = useApp();
  const { gameCycle, user, coworkers } = state;

  const [selectedGame, setSelectedGame] = useState<GameType>(gameCycle.currentGame || 'cobrinha');
  const [selectedPeriod, setSelectedPeriod] = useState<TimeFilterPeriod>('all_time');
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right'>('right');
  const [animKey, setAnimKey] = useState<number>(0);

  const GAMES: GameType[] = ['cobrinha', 'pong', 'termo'];

  const gameTitles: Record<GameType, string> = {
    cobrinha: 'Jogo da Cobrinha',
    pong: 'Ping y Pong',
    termo: 'Termo',
  };

  const handlePrevGame = () => {
    const currentIndex = GAMES.indexOf(selectedGame);
    const prevIndex = (currentIndex - 1 + GAMES.length) % GAMES.length;
    setTransitionDirection('left');
    setAnimKey(prev => prev + 1);
    setSelectedGame(GAMES[prevIndex]);
  };

  const handleNextGame = () => {
    const currentIndex = GAMES.indexOf(selectedGame);
    const nextIndex = (currentIndex + 1) % GAMES.length;
    setTransitionDirection('right');
    setAnimKey(prev => prev + 1);
    setSelectedGame(GAMES[nextIndex]);
  };

  const allHighscores = useMemo<GameHighscoreEntry[]>(() => {
    return gameCycle.globalHighscores || [];
  }, [gameCycle.globalHighscores]);

  // Filtragem combinada por jogo e período de tempo
  const filteredRecords = useMemo(() => {
    const now = Date.now();
    const gameFiltered = allHighscores.filter(entry => entry.game === selectedGame);

    const periodFiltered = gameFiltered.filter(entry => {
      if (selectedPeriod === 'all_time') return true;
      if (selectedPeriod === 'year') {
        const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
        return entry.timestamp >= oneYearAgo;
      }
      if (selectedPeriod === 'month') {
        const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
        return entry.timestamp >= oneMonthAgo;
      }
      return true;
    });

    // SSOT: Agrupa por usuário garantindo o recorde máximo conquistado naquele período
    const bestRecordPerUser = new Map<string, GameHighscoreEntry>();
    for (const entry of periodFiltered) {
      const existing = bestRecordPerUser.get(entry.userId);
      if (!existing || entry.score > existing.score) {
        bestRecordPerUser.set(entry.userId, entry);
      }
    }

    return Array.from(bestRecordPerUser.values()).sort((a, b) => b.score - a.score);
  }, [allHighscores, selectedGame, selectedPeriod]);

  const handleEntryClick = (entry: GameHighscoreEntry) => {
    const isUser = entry.userId === user.id;
    if (isUser) {
      onOpenProfile?.(null, true);
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
      onOpenProfile?.(found, false);
    }
  };

  return (
    <Modal
      id="global-leaderboard-modal"
      title="Placar Geral e Recordes"
      subtitle="Histórico geral de pontuações de todos os tempos"
      icon={
        <div className="w-6 h-6 rounded-md bg-sand-200/80 text-sand-800 flex items-center justify-center shrink-0">
          <Trophy size={14} />
        </div>
      }
      onClose={onClose}
      zIndex={zIndex}
      contentClassName="flex-1 flex overflow-hidden bg-white min-h-0"
      headerRight={
        <SegmentedControl<TimeFilterPeriod>
          value={selectedPeriod}
          onChange={setSelectedPeriod}
          options={[
            { value: 'all_time', label: 'Sempre' },
            { value: 'year', label: 'Ano' },
            { value: 'month', label: 'Mês' },
          ]}
        />
      }
    >
      {/* Coluna Esquerda: Seletor de Jogo com Setas e Podio (~300px) */}
      <aside className="w-72 sm:w-80 border-r border-calm-200/80 bg-calm-50/70 p-3 sm:p-4 flex flex-col justify-between shrink-0 overflow-y-auto min-h-0">
        <div className="flex flex-col gap-3">
          {/* Seletor com setas para direita e esquerda com transicao animada */}
          <div className="flex items-center justify-between bg-white border border-calm-200/90 rounded-xl p-1 shadow-xs">
            <button
              type="button"
              onClick={handlePrevGame}
              className="p-1.5 rounded-lg text-calm-600 hover:text-calm-900 hover:bg-calm-100 transition active:scale-95 cursor-pointer shrink-0"
              title="Jogo anterior"
              aria-label="Jogo anterior"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex-1 overflow-hidden px-2 text-center flex items-center justify-center min-h-[28px]">
              <span
                key={`${selectedGame}-${animKey}`}
                className={`text-xs font-semibold text-calm-900 truncate block select-none ${
                  transitionDirection === 'right' ? 'animate-slide-fade-right' : 'animate-slide-fade-left'
                }`}
              >
                {gameTitles[selectedGame]}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextGame}
              className="p-1.5 rounded-lg text-calm-600 hover:text-calm-900 hover:bg-calm-100 transition active:scale-95 cursor-pointer shrink-0"
              title="Proximo jogo"
              aria-label="Proximo jogo"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Podio Dinamico dos 3 Melhores Colocados */}
          <Podium
            entries={filteredRecords}
            currentUserId={user.id}
            coworkers={coworkers}
            onOpenCoworkerProfile={cw => onOpenProfile?.(cw, false)}
            onOpenOwnProfile={() => onOpenProfile?.(null, true)}
            emptyMessage="Nenhum recorde neste periodo."
            compact={true}
          />
        </div>

        {/* Rodape sutil da coluna lateral */}
        <div className="pt-3 mt-3 border-t border-calm-200/70 text-center">
          <p className="text-[10px] text-calm-500 leading-tight">
            O podio reflete a maior pontuacao de cada colaborador no jogo e periodo selecionados.
          </p>
        </div>
      </aside>

      {/* Coluna Direita: Classificação Geral Completa */}
      <section className="flex-1 flex flex-col p-4 bg-white overflow-hidden min-h-0">
        {/* Header da Classificação Geral */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-calm-200/70 shrink-0">
          <div className="flex items-center gap-1.5">
            <Award size={15} className="text-sand-600" />
            <h4 className="text-xs font-semibold text-calm-900">
              Painel de Recordes
            </h4>
          </div>
          <span className="text-[10px] text-calm-500 font-medium">
            {gameTitles[selectedGame]}
          </span>
        </div>

        {/* Listagem de Recordes */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
          {filteredRecords.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-calm-400">
              <p className="text-xs font-medium">Nenhum recorde registrado para este período.</p>
              <p className="text-[10px] text-calm-400 mt-1">
                Jogue uma partida para inaugurar o placar!
              </p>
            </div>
          ) : (
            filteredRecords.map((entry, index) => {
              const isUser = entry.userId === user.id;

              return (
                <div
                  key={entry.id || `${entry.userId}-${index}`}
                  onClick={() => handleEntryClick(entry)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer hover:border-calm-300 hover:shadow-soft ${
                    isUser
                      ? 'bg-sage-50/80 hover:bg-sage-100/90 border-sage-300 font-semibold text-sage-900'
                      : 'bg-white hover:bg-calm-50 border-calm-200/90 text-calm-800'
                  }`}
                  title={`Clique para ver o perfil de ${isUser ? 'você' : entry.name}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 text-center font-mono text-[11px] font-bold text-calm-500 shrink-0">
                      {index + 1}º
                    </span>
                    <UserAvatar userId={entry.userId} user={entry} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs truncate leading-tight">
                        {entry.name} {isUser && '(Você)'}
                      </p>
                      <p className="text-[10px] text-calm-400 truncate">{entry.department}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 pl-2 text-right">
                    <span className="text-xs font-mono font-bold text-calm-800">
                      {entry.score} pts
                    </span>
                    {/* Data e hora de conquista em baixa hierarquia visual */}
                    <span className="text-[10px] text-calm-400 font-normal leading-tight mt-0.5">
                      {formatRelativeTime(entry.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </Modal>
  );
};

export default GlobalLeaderboardExpandedModal;
