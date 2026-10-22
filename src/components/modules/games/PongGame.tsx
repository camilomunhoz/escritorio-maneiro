import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Award } from 'lucide-react';
import { Button } from '../../ui/Button';

interface PongGameProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
}

const WIDTH = 380;
const HEIGHT = 260;
const PADDLE_WIDTH = 8;
const PADDLE_HEIGHT = 48;
const BALL_SIZE = 8;

export const PongGame: React.FC<PongGameProps> = ({ onGameOver, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [playerY, setPlayerY] = useState(HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [aiY, setAiY] = useState(HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [ball, setBall] = useState({ x: WIDTH / 2, y: HEIGHT / 2, vx: 3.5, vy: 2 });
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [rallyCount, setRallyCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const stateRef = useRef({
    playerY,
    aiY,
    ball,
    playerScore,
    aiScore,
    rallyCount,
    isRunning,
    isGameOver,
  });

  stateRef.current = {
    playerY,
    aiY,
    ball,
    playerScore,
    aiScore,
    rallyCount,
    isRunning,
    isGameOver,
  };

  const resetBall = (direction: 'toPlayer' | 'toAi') => {
    const vx = direction === 'toPlayer' ? -3.5 : 3.5;
    const vy = (Math.random() - 0.5) * 4;
    setBall({ x: WIDTH / 2, y: HEIGHT / 2, vx, vy });
  };

  const startGame = () => {
    setPlayerScore(0);
    setAiScore(0);
    setRallyCount(0);
    setIsGameOver(false);
    setIsRunning(true);
    resetBall('toPlayer');
  };

  // Mouse / Touch movement for player paddle
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const clampedY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, mouseY - PADDLE_HEIGHT / 2));
    setPlayerY(clampedY);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setPlayerY(prev => Math.max(0, prev - 24));
        e.preventDefault();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setPlayerY(prev => Math.min(HEIGHT - PADDLE_HEIGHT, prev + 24));
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main Pong loop
  useEffect(() => {
    if (!isRunning || isGameOver) return;

    const interval = setInterval(() => {
      const s = stateRef.current;
      let newBx = s.ball.x + s.ball.vx;
      let newBy = s.ball.y + s.ball.vy;
      let newVx = s.ball.vx;
      let newVy = s.ball.vy;

      // Bounce off top and bottom walls
      if (newBy <= 0) {
        newBy = 0;
        newVy = Math.abs(newVy);
      } else if (newBy >= HEIGHT - BALL_SIZE) {
        newBy = HEIGHT - BALL_SIZE;
        newVy = -Math.abs(newVy);
      }

      // Check collision with Player paddle (left)
      const playerX = 14;
      if (
        newBx <= playerX + PADDLE_WIDTH &&
        newBx >= playerX &&
        newBy + BALL_SIZE >= s.playerY &&
        newBy <= s.playerY + PADDLE_HEIGHT &&
        newVx < 0
      ) {
        newVx = Math.min(7.5, -newVx * 1.05); // progressive speed increase
        const hitOffset = (newBy - (s.playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        newVy = hitOffset * 4.5;
        setRallyCount(rc => rc + 1);
      }

      // Check collision with AI paddle (right)
      const aiX = WIDTH - 14 - PADDLE_WIDTH;
      if (
        newBx + BALL_SIZE >= aiX &&
        newBx <= aiX + PADDLE_WIDTH &&
        newBy + BALL_SIZE >= s.aiY &&
        newBy <= s.aiY + PADDLE_HEIGHT &&
        newVx > 0
      ) {
        newVx = Math.max(-7.5, -newVx * 1.05);
        const hitOffset = (newBy - (s.aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        newVy = hitOffset * 4.5;
        setRallyCount(rc => rc + 1);
      }

      // AI Paddle Movement (gentle tracking with max speed for natural feel)
      const aiCenter = s.aiY + PADDLE_HEIGHT / 2;
      const ballCenter = newBy + BALL_SIZE / 2;
      const aiSpeed = Math.min(3.2, 2.4 + s.playerScore * 0.2);
      let newAiY = s.aiY;
      if (ballCenter > aiCenter + 6) {
        newAiY = Math.min(HEIGHT - PADDLE_HEIGHT, s.aiY + aiSpeed);
      } else if (ballCenter < aiCenter - 6) {
        newAiY = Math.max(0, s.aiY - aiSpeed);
      }
      setAiY(newAiY);

      // Score conditions
      if (newBx < 0) {
        // AI scored
        const nextAiScore = s.aiScore + 1;
        setAiScore(nextAiScore);
        if (nextAiScore >= 3 || s.playerScore + nextAiScore >= 6) {
          setIsGameOver(true);
          setIsRunning(false);
          const finalScore = s.playerScore * 25 + s.rallyCount * 2;
          onGameOver(finalScore);
        } else {
          resetBall('toPlayer');
        }
        return;
      } else if (newBx > WIDTH) {
        // Player scored
        const nextPlayerScore = s.playerScore + 1;
        setPlayerScore(nextPlayerScore);
        if (nextPlayerScore >= 3 || nextPlayerScore + s.aiScore >= 6) {
          setIsGameOver(true);
          setIsRunning(false);
          const finalScore = nextPlayerScore * 30 + s.rallyCount * 3;
          onGameOver(finalScore);
        } else {
          resetBall('toAi');
        }
        return;
      }

      setBall({ x: newBx, y: newBy, vx: newVx, vy: newVy });
    }, 16);

    return () => clearInterval(interval);
  }, [isRunning, isGameOver, onGameOver]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Center dashed line
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player Paddle (Sage green)
    ctx.fillStyle = '#4F7762';
    ctx.beginPath();
    ctx.roundRect(14, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, 4);
    ctx.fill();

    // AI Paddle (Muted slate)
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.roundRect(WIDTH - 14 - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, 4);
    ctx.fill();

    // Ball (Terracotta rounded)
    ctx.fillStyle = '#C86D51';
    ctx.beginPath();
    ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
  }, [playerY, aiY, ball]);

  const totalPoints = playerScore * 25 + rallyCount * 2;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-3 select-none">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-calm-200">
        <div>
          <h3 className="text-sm font-semibold text-calm-900">Pong Clássico</h3>
          <p className="text-[11px] text-calm-500">Mova o cursor ou use as setas para rebater</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-sage-800">
            Você <span className="text-sm font-bold text-sage-900">{playerScore}</span> x{' '}
            <span className="text-sm font-bold text-calm-600">{aiScore}</span> IA
          </div>
          <div className="flex items-center gap-1 bg-sage-50 text-sage-900 px-2.5 py-1 rounded-md border border-sage-200">
            <Award size={13} className="text-sage-600" />
            <span className="text-xs font-semibold">{totalPoints} pts</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative my-auto flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onMouseMove={handleMouseMove}
          className="rounded-lg shadow-sm border border-calm-300 bg-white cursor-none"
        />

        {/* Start / Game Over Overlay */}
        {!isRunning && !isGameOver && (
          <div className="absolute inset-0 bg-calm-900/40 backdrop-blur-xs rounded-lg flex flex-col items-center justify-center p-4 text-white">
            <h4 className="text-base font-bold mb-1">Pronto para a rodada de Pong?</h4>
            <p className="text-xs text-calm-200 text-center mb-4 max-w-[220px]">
              Controle a raquete verde com o mouse ou as teclas para cima e para baixo.
            </p>
            <Button variant="primary" onClick={startGame} className="gap-1.5">
              <Play size={14} />
              <span>Iniciar Partida</span>
            </Button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-calm-900/60 backdrop-blur-xs rounded-lg flex flex-col items-center justify-center p-4 text-white text-center">
            <span className="text-xs font-semibold text-terracottaMuted-300 uppercase tracking-wider mb-1">
              Fim de Partida
            </span>
            <p className="text-xl font-bold mb-1">
              {playerScore > aiScore ? 'Vitória!' : 'Fim da Rodada'}
            </p>
            <p className="text-xs text-calm-200 mb-4 max-w-[240px]">
              Tentativa única registrada. {totalPoints} pontos conquistados.
            </p>
            <Button variant="primary" size="sm" onClick={onExit} className="px-5">
              <span>Concluir Partida</span>
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Info */}
      <div className="w-full flex items-center justify-between pt-2 border-t border-calm-200 text-[10px] text-calm-500">
        <span>Partida de 3 pontos com aceleração gradual de velocidade</span>
        <span>Trocas de bola: {rallyCount}</span>
      </div>
    </div>
  );
};

export default PongGame;
