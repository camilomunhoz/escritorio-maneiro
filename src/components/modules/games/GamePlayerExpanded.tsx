import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { ArcadeAvatarIsometric } from './ArcadeAvatarIsometric';
import { SnakeGame } from './SnakeGame';
import { PongGame } from './PongGame';
import { TermoGame } from './TermoGame';
import { Gamepad2, Award, Play, Trophy } from 'lucide-react';
import type { GameType } from '../../../types';

export interface GamePlayerExpandedProps {
  onExit?: () => void;
  zIndex?: number;
}

export interface GameInstructionConfig {
  title: string;
  category: string;
  objective: string;
  controls: string;
  tip: string;
}

export const GAME_INSTRUCTIONS: Record<GameType, GameInstructionConfig> = {
  cobrinha: {
    title: 'Jogo da Cobrinha',
    category: 'Destreza e Reflexos',
    objective: 'Guie a cobrinha pelo tabuleiro e colete frutos saudáveis para crescer e pontuar.',
    controls: 'Teclas direcionais (Setas do teclado ou W, A, S, D).',
    tip: 'Evite colidir com as quatro paredes ou com o próprio corpo.',
  },
  pong: {
    title: 'Ping y Pong',
    category: 'Foco e Coordenação',
    objective: 'Rebata a bolinha contra a inteligência artificial corporativa mantendo ralis contínuos.',
    controls: 'Mova o cursor verticalmente na área de jogo ou use as setas Cima e Baixo.',
    tip: 'Ralis longos e pontos convertidos multiplicam sua recompensa.',
  },
  termo: {
    title: 'Termo',
    category: 'Vocabulário e Cognição',
    objective: 'Adivinhe a palavra secreta de 5 letras relacionada a bem-estar em até 6 tentativas.',
    controls: 'Teclado físico do computador ou toque nas teclas virtuais.',
    tip: 'Verde: letra certa na posição exata. Amarelo: letra presente na palavra, em outra posição.',
  },
};

export const GamePlayerExpanded: React.FC<GamePlayerExpandedProps> = ({ onExit, zIndex }) => {
  const { state, setDrawerMode, finishGameRound } = useApp();
  const { user, gameCycle } = state;

  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'playing' | 'gameover'>('intro');
  const [countdown, setCountdown] = useState<number>(3);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [finalScore, setFinalScore] = useState<number>(0);

  const hasFinishedRef = useRef(false);
  const currentScoreRef = useRef(currentScore);
  currentScoreRef.current = currentScore;

  const currentGame = (gameCycle.currentGame || 'cobrinha') as GameType;
  const config = GAME_INSTRUCTIONS[currentGame] || GAME_INSTRUCTIONS.cobrinha;
  const isReflexGame = currentGame === 'cobrinha' || currentGame === 'pong';

  const handleStartGame = () => {
    setCurrentScore(0);
    currentScoreRef.current = 0;
    if (isReflexGame) {
      setCountdown(3);
      setGameState('countdown');
    } else {
      setGameState('playing');
    }
  };

  // Temporizador da contagem regressiva para jogos de reflexo (3, 2, 1)
  useEffect(() => {
    if (gameState !== 'countdown') return;

    const timer = setTimeout(() => {
      if (countdown > 1) {
        setCountdown(prev => prev - 1);
      } else {
        setGameState('playing');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState, countdown]);

  const handleScoreChange = useCallback((score: number) => {
    setCurrentScore(score);
    currentScoreRef.current = score;
  }, []);

  const handleGameOver = useCallback((score: number) => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setFinalScore(score);
    setCurrentScore(score);
    currentScoreRef.current = score;
    setGameState('gameover');
    finishGameRound(score);
  }, [finishGameRound]);

  // Fechar o modal ou clicar em voltar dispara o fim da partida e encerra a tentativa
  const handleExit = useCallback(() => {
    if (!hasFinishedRef.current) {
      hasFinishedRef.current = true;
      finishGameRound(currentScoreRef.current);
    }
    if (onExit) {
      onExit();
    } else {
      setDrawerMode('normal');
    }
  }, [finishGameRound, onExit, setDrawerMode]);

  // Garante que, caso o modal seja desmontado de forma abrupta, a pontuacao seja registrada e a tentativa eliminada
  useEffect(() => {
    return () => {
      if (!hasFinishedRef.current) {
        hasFinishedRef.current = true;
        finishGameRound(currentScoreRef.current);
      }
    };
  }, [finishGameRound]);

  return (
    <Modal
      title={config.title}
      subtitle="Pausa ativa sincronizada da rodada atual"
      icon={
        <div className="w-6 h-6 rounded-md bg-sand-200/80 text-sand-800 flex items-center justify-center shrink-0">
          <Gamepad2 size={14} />
        </div>
      }
      onClose={handleExit}
      zIndex={zIndex}
      contentClassName="flex-1 flex overflow-hidden bg-white min-h-0"
      headerRight={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-sage-50 text-sage-900 px-3 py-1 rounded-lg border border-sage-200/90 shadow-xs">
            <Award size={14} className="text-sage-700" />
            <span className="text-xs font-mono font-bold">{currentScore} pts</span>
          </div>
        </div>
      }
    >
      {/* Coluna Esquerda: Apenas Ilustracao Ampliada do Arcade e Avatar */}
      <aside className="w-64 sm:w-72 border-r border-calm-200/80 bg-calm-50/70 flex flex-col shrink-0 min-h-0 overflow-hidden">
        <ArcadeAvatarIsometric
          userId={user.id}
          avatarColor={user.avatarColor}
          avatarBody={user.avatarBody}
        />
      </aside>

      {/* Coluna Direita: Tela Pre-Jogo Unificada, Contagem Regressiva, Jogo Ativo ou Conclusao */}
      <section className="flex-1 h-full overflow-hidden flex flex-col bg-white min-h-0 relative">
        {gameState === 'intro' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-b from-white via-calm-50/30 to-calm-50/60 overflow-y-auto">
            <div className="max-w-sm w-full flex flex-col items-center gap-4">
              <span className="px-2.5 py-0.5 rounded-full bg-sand-100 text-sand-800 border border-sand-200/70 text-[10px] font-bold uppercase tracking-wider">
                {config.category}
              </span>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-calm-900">
                  {config.title}
                </h3>
                <p className="text-xs text-calm-600 leading-relaxed">
                  {config.objective}
                </p>
              </div>

              <div className="w-full bg-white rounded-xl border border-calm-200/90 p-3.5 shadow-xs text-left space-y-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-calm-500 block">
                    Como Jogar
                  </span>
                  <p className="text-xs text-calm-800 mt-0.5">
                    {config.controls}
                  </p>
                </div>

                <div className="pt-2 border-t border-calm-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sage-700 block">
                    Dica
                  </span>
                  <p className="text-xs text-calm-600 mt-0.5">
                    {config.tip}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleStartGame}
                className="w-full gap-2 justify-center shadow-sm cursor-pointer"
              >
                <Play size={15} />
                <span>Iniciar Partida</span>
              </Button>
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-b from-white via-calm-50/40 to-calm-100/40 overflow-y-auto">
            <div className="max-w-sm w-full flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                <Trophy size={24} />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-calm-500">
                  Fim de Partida
                </span>
                <h3 className="text-2xl font-black text-calm-900">
                  {finalScore} pontos
                </h3>
                <p className="text-xs text-calm-600 leading-relaxed max-w-[260px]">
                  Sua pontuação foi registrada no ranking da rodada e atualizada no placar geral.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleExit}
                className="w-full justify-center shadow-sm cursor-pointer"
              >
                <span>Concluir e Voltar</span>
              </Button>
            </div>
          </div>
        )}

        {(gameState === 'countdown' || gameState === 'playing') && (
          <div className="flex-1 h-full w-full relative flex flex-col bg-white overflow-hidden min-h-0">
            {/* Overlay de Contagem Regressiva para Jogos de Reflexo */}
            {gameState === 'countdown' && (
              <div className="absolute inset-0 z-30 bg-calm-900/30 backdrop-blur-xs flex flex-col items-center justify-center select-none">
                <div className="w-24 h-24 rounded-full bg-white/95 border-2 border-sage-300 shadow-soft flex items-center justify-center">
                  <span
                    key={countdown}
                    className="text-5xl font-serif font-black text-sage-800 animate-countdown-pop"
                  >
                    {countdown}
                  </span>
                </div>
                <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-white drop-shadow-sm">
                  Prepare-se!
                </span>
              </div>
            )}

            {/* Componente do Jogo Ativo */}
            {currentGame === 'cobrinha' && (
              <SnakeGame
                key="cobrinha"
                isPlaying={gameState === 'playing'}
                onScoreChange={handleScoreChange}
                onGameOver={handleGameOver}
              />
            )}
            {currentGame === 'pong' && (
              <PongGame
                key="pong"
                isPlaying={gameState === 'playing'}
                onScoreChange={handleScoreChange}
                onGameOver={handleGameOver}
              />
            )}
            {currentGame === 'termo' && (
              <TermoGame
                key="termo"
                isPlaying={gameState === 'playing'}
                onScoreChange={handleScoreChange}
                onGameOver={handleGameOver}
              />
            )}
          </div>
        )}
      </section>
    </Modal>
  );
};

export default GamePlayerExpanded;
