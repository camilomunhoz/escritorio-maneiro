import React from 'react';
import { useApp } from '../../../context/AppContext';
import { ArcadeAvatarIsometric } from './ArcadeAvatarIsometric';
import { SnakeGame } from './SnakeGame';
import { PongGame } from './PongGame';
import { TermoGame } from './TermoGame';
import { X } from 'lucide-react';

interface GamePlayerExpandedProps {
  onExit?: () => void;
}

export const GamePlayerExpanded: React.FC<GamePlayerExpandedProps> = ({ onExit }) => {
  const { state, setDrawerMode, finishGameRound } = useApp();
  const { user, gameCycle } = state;

  const handleGameOver = (score: number) => {
    finishGameRound(score);
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      setDrawerMode('normal');
    }
  };

  const gameTitles: Record<string, string> = {
    cobrinha: 'Cobrinha de Frutos',
    pong: 'Pong Corporativo',
    termo: 'Termo de Bem-Estar',
  };

  const currentTitle = gameTitles[gameCycle.currentGame] || 'Minijogo Sincronizado';

  return (
    <div className="w-full h-full flex overflow-hidden bg-white select-none relative">
      {/* Botao de Fechar no topo direito */}
      <button
        onClick={handleExit}
        className="absolute top-2 right-2 z-20 p-1.5 rounded-lg bg-calm-100/80 hover:bg-calm-200 text-calm-600 transition cursor-pointer"
        title="Retornar ao menu de jogos"
      >
        <X size={15} />
      </button>

      {/* Coluna Esquerda (1/3 ~ 240px): Avatar Isométrico no Fliperama */}
      <aside className="w-60 border-r border-calm-200/90 bg-calm-50/70 flex flex-col shrink-0">
        <ArcadeAvatarIsometric
          userId={user.id}
          avatarColor={user.avatarColor}
          avatarBody={user.avatarBody}
          avatarFace={user.avatarFace}
          gameTitle={currentTitle}
        />
      </aside>

      {/* Coluna Direita (2/3 ~ 510px): Minijogo Ativo */}
      <section className="flex-1 h-full overflow-hidden flex flex-col bg-white">
        {gameCycle.currentGame === 'cobrinha' && (
          <SnakeGame key="cobrinha" onGameOver={handleGameOver} onExit={handleExit} />
        )}
        {gameCycle.currentGame === 'pong' && (
          <PongGame key="pong" onGameOver={handleGameOver} onExit={handleExit} />
        )}
        {gameCycle.currentGame === 'termo' && (
          <TermoGame key="termo" onGameOver={handleGameOver} onExit={handleExit} />
        )}
      </section>
    </div>
  );
};

export default GamePlayerExpanded;
