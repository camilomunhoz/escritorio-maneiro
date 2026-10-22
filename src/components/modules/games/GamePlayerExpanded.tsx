import React from 'react';
import { useApp } from '../../../context/AppContext';
import { ArcadeAvatarIsometric } from './ArcadeAvatarIsometric';
import { SnakeGame } from './SnakeGame';
import { PongGame } from './PongGame';
import { TermoGame } from './TermoGame';
import { Minimize2 } from 'lucide-react';

export const GamePlayerExpanded: React.FC = () => {
  const { state, setDrawerMode, finishGameRound } = useApp();
  const { user, gameCycle } = state;

  const handleGameOver = (score: number) => {
    finishGameRound(score);
  };

  const handleExit = () => {
    setDrawerMode('normal');
  };

  const gameTitles: Record<string, string> = {
    cobrinha: 'Cobrinha de Frutos',
    pong: 'Pong Corporativo',
    termo: 'Termo de Bem-Estar',
  };

  const currentTitle = gameTitles[gameCycle.currentGame] || 'Minijogo Sincronizado';

  return (
    <div className="w-full h-full flex overflow-hidden bg-white select-none relative">
      {/* Botão de Fechar / Minimizar no topo direito */}
      <button
        onClick={handleExit}
        className="absolute top-2 right-2 z-20 p-1.5 rounded-lg bg-calm-100/80 hover:bg-calm-200 text-calm-600 transition cursor-pointer"
        title="Retornar ao Drawer Normal (350px)"
      >
        <Minimize2 size={14} />
      </button>

      {/* Coluna Esquerda (1/3 ~ 240px): Avatar Isométrico no Fliperama */}
      <aside className="w-60 border-r border-calm-200/90 bg-calm-50/70 flex flex-col shrink-0">
        <ArcadeAvatarIsometric avatarColor={user.avatarColor} gameTitle={currentTitle} />
      </aside>

      {/* Coluna Direita (2/3 ~ 510px): Minijogo Ativo */}
      <section className="flex-1 h-full overflow-hidden flex flex-col bg-white">
        {gameCycle.currentGame === 'cobrinha' && (
          <SnakeGame onGameOver={handleGameOver} onExit={handleExit} />
        )}
        {gameCycle.currentGame === 'pong' && (
          <PongGame onGameOver={handleGameOver} onExit={handleExit} />
        )}
        {gameCycle.currentGame === 'termo' && (
          <TermoGame onGameOver={handleGameOver} onExit={handleExit} />
        )}
      </section>
    </div>
  );
};

export default GamePlayerExpanded;
