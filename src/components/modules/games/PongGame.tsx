import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface PongGameStyleConfig {
  bgColor?: string;
  netColor?: string;
  playerColor?: string;
  playerBorder?: string;
  aiColor?: string;
  aiBorder?: string;
  ballColor?: string;
  ballGlow?: string;
}

// Estilo visual original do jogo na tela principal (tons claros e suaves)
export const DEFAULT_PONG_STYLE: Required<PongGameStyleConfig> = {
  bgColor: '#F8FAFC',
  netColor: '#E2E8F0',
  playerColor: '#4F7762',
  playerBorder: 'transparent',
  aiColor: '#64748B',
  aiBorder: 'transparent',
  ballColor: '#C86D51',
  ballGlow: 'transparent',
};

// Estilo arcade escuro e minimalista exclusivo para a tela do fliperama
export const ARCADE_PONG_STYLE: Required<PongGameStyleConfig> = {
  bgColor: '#0F172A',
  netColor: '#1E293B',
  playerColor: '#5B8C70',
  playerBorder: '#72A388',
  aiColor: '#64748B',
  aiBorder: '#94A3B8',
  ballColor: '#E07A5F',
  ballGlow: '#F4A261',
};

export interface PongGameProps {
  isPlaying?: boolean;
  onScoreChange?: (score: number) => void;
  onGameOver: (score: number) => void;
  className?: string;
  styleConfig?: PongGameStyleConfig;
  arcadeStyleConfig?: PongGameStyleConfig;
}

const WIDTH = 380;
const HEIGHT = 260;
const PADDLE_WIDTH = 8;
const PADDLE_HEIGHT = 48;
const BALL_SIZE = 8;
const WINNING_SCORE = 5;

const renderPongToContext = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  playerY: number,
  aiY: number,
  ball: { x: number; y: number },
  style: Required<PongGameStyleConfig>,
  isArcade: boolean
) => {
  // Fundo
  ctx.fillStyle = style.bgColor;
  ctx.fillRect(0, 0, width, height);

  // Linha central divisoria tracejada
  ctx.strokeStyle = style.netColor;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Raquete do Jogador
  ctx.fillStyle = style.playerColor;
  ctx.beginPath();
  ctx.roundRect(14, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, 4);
  ctx.fill();

  if (isArcade && style.playerBorder !== 'transparent') {
    ctx.strokeStyle = style.playerBorder;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Raquete da IA
  ctx.fillStyle = style.aiColor;
  ctx.beginPath();
  ctx.roundRect(width - 14 - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, 4);
  ctx.fill();

  if (isArcade && style.aiBorder !== 'transparent') {
    ctx.strokeStyle = style.aiBorder;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Bola
  ctx.fillStyle = style.ballColor;
  ctx.beginPath();
  ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();

  if (isArcade && style.ballGlow !== 'transparent') {
    ctx.fillStyle = style.ballGlow;
    ctx.beginPath();
    ctx.arc(ball.x + BALL_SIZE / 2 - 1, ball.y + BALL_SIZE / 2 - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
};

export const PongGame: React.FC<PongGameProps> = ({
  isPlaying = true,
  onScoreChange,
  onGameOver,
  className = '',
  styleConfig,
  arcadeStyleConfig,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mirrorCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const style: Required<PongGameStyleConfig> = {
    ...DEFAULT_PONG_STYLE,
    ...styleConfig,
  };

  const arcadeStyle: Required<PongGameStyleConfig> = {
    ...ARCADE_PONG_STYLE,
    ...arcadeStyleConfig,
  };

  const onScoreChangeRef = useRef(onScoreChange);
  onScoreChangeRef.current = onScoreChange;

  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const [playerY, setPlayerY] = useState(HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [aiY, setAiY] = useState(HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [ball, setBall] = useState({ x: WIDTH / 2, y: HEIGHT / 2, vx: 3.5, vy: 2 });
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [rallyCount, setRallyCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const prevIsPlayingRef = useRef<boolean>(false);

  const stateRef = useRef({
    playerY,
    aiY,
    ball,
    playerScore,
    aiScore,
    rallyCount,
    isPlaying,
    isGameOver,
  });

  stateRef.current = {
    playerY,
    aiY,
    ball,
    playerScore,
    aiScore,
    rallyCount,
    isPlaying,
    isGameOver,
  };

  const resetBall = useCallback((direction: 'toPlayer' | 'toAi') => {
    const vx = direction === 'toPlayer' ? -3.5 : 3.5;
    const vy = (Math.random() - 0.5) * 4;
    setBall({ x: WIDTH / 2, y: HEIGHT / 2, vx, vy });
  }, []);

  const resetGame = useCallback(() => {
    setPlayerY(HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setAiY(HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setPlayerScore(0);
    setAiScore(0);
    setRallyCount(0);
    setIsGameOver(false);
    resetBall('toPlayer');
    onScoreChangeRef.current?.(0);
  }, [resetBall]);

  // Reset ONLY when isPlaying transitions from false to true
  useEffect(() => {
    if (isPlaying && !prevIsPlayingRef.current) {
      resetGame();
    }
    prevIsPlayingRef.current = isPlaying;
  }, [isPlaying, resetGame]);

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
    if (!isPlaying || isGameOver) return;

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
  }, [isPlaying, isGameOver]);

  // Main Pong loop
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

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
        newVx = Math.min(7.5, -newVx * 1.05);
        const hitOffset = (newBy - (s.playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        newVy = hitOffset * 4.5;
        const nextRally = s.rallyCount + 1;
        setRallyCount(nextRally);
        const currentPoints = s.playerScore * 25 + nextRally * 2;
        onScoreChangeRef.current?.(currentPoints);
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
        const nextRally = s.rallyCount + 1;
        setRallyCount(nextRally);
        const currentPoints = s.playerScore * 25 + nextRally * 2;
        onScoreChangeRef.current?.(currentPoints);
      }

      // AI Paddle Movement
      const aiCenter = s.aiY + PADDLE_HEIGHT / 2;
      const ballCenter = newBy + BALL_SIZE / 2;
      const aiSpeed = Math.min(3.4, 2.3 + s.playerScore * 0.2);
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
        if (nextAiScore >= WINNING_SCORE || s.playerScore + nextAiScore >= WINNING_SCORE * 2) {
          setIsGameOver(true);
          const finalScore = s.playerScore * 25 + s.rallyCount * 2;
          onGameOverRef.current(finalScore);
        } else {
          resetBall('toPlayer');
        }
        return;
      } else if (newBx > WIDTH) {
        // Player scored
        const nextPlayerScore = s.playerScore + 1;
        setPlayerScore(nextPlayerScore);
        const updatedPoints = nextPlayerScore * 25 + s.rallyCount * 2;
        onScoreChangeRef.current?.(updatedPoints);

        if (nextPlayerScore >= WINNING_SCORE || nextPlayerScore + s.aiScore >= WINNING_SCORE * 2) {
          setIsGameOver(true);
          const finalScore = nextPlayerScore * 30 + s.rallyCount * 3;
          onGameOverRef.current(finalScore);
        } else {
          resetBall('toAi');
        }
        return;
      }

      setBall({ x: newBx, y: newBy, vx: newVx, vy: newVy });
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, resetBall]);

  // Canvas drawing: renderiza o canvas principal (estilo claro original) e o espelho (estilo arcade escuro)
  useEffect(() => {
    // 1. Canvas principal (visivel ao usuario)
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        renderPongToContext(ctx, WIDTH, HEIGHT, playerY, aiY, ball, style, false);
      }
    }

    // 2. Canvas espelho para a tela do fliperama
    const mirrorCanvas = mirrorCanvasRef.current;
    if (mirrorCanvas) {
      const mirrorCtx = mirrorCanvas.getContext('2d');
      if (mirrorCtx) {
        renderPongToContext(mirrorCtx, WIDTH, HEIGHT, playerY, aiY, ball, arcadeStyle, true);
      }
    }
  }, [playerY, aiY, ball, style, arcadeStyle]);

  return (
    <div className={`w-full h-full flex items-center justify-center p-3 select-none ${className}`}>
      {/* Canvas principal exibido na tela com a estetica original clara */}
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        onMouseMove={handleMouseMove}
        className="rounded-lg shadow-sm border border-calm-300 bg-white cursor-none"
      />

      {/* Canvas espelho consumido pela tela do arcade com estilo retro escuro */}
      <canvas
        ref={mirrorCanvasRef}
        id="active-game-canvas"
        width={WIDTH}
        height={HEIGHT}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
};

export default PongGame;
