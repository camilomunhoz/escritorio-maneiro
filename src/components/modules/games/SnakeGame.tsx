import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface SnakeGameStyleConfig {
  bgColor?: string;
  gridColor?: string;
  snakeHeadColor?: string;
  snakeHeadBorder?: string;
  snakeBodyColor?: string;
  snakeBodyBorder?: string;
  foodColor?: string;
  foodGlow?: string;
}

// Estilo visual original do jogo na tela principal (tons claros e suaves)
const DEFAULT_SNAKE_STYLE: Required<SnakeGameStyleConfig> = {
  bgColor: '#F8FAFC',
  gridColor: '#E2E8F0',
  snakeHeadColor: '#4F7762',
  snakeHeadBorder: 'transparent',
  snakeBodyColor: '#719B83',
  snakeBodyBorder: 'transparent',
  foodColor: '#C86D51',
  foodGlow: 'transparent',
};

// Estilo arcade escuro e minimalista exclusivo para a tela do fliperama
const ARCADE_SNAKE_STYLE: Required<SnakeGameStyleConfig> = {
  bgColor: '#0F172A',
  gridColor: '#1E293B',
  snakeHeadColor: '#5B8C70',
  snakeHeadBorder: '#72A388',
  snakeBodyColor: '#446E56',
  snakeBodyBorder: '#5B8C70',
  foodColor: '#E07A5F',
  foodGlow: '#F4A261',
};

export interface SnakeGameProps {
  isPlaying?: boolean;
  onScoreChange?: (score: number) => void;
  onGameOver: (score: number) => void;
  className?: string;
  styleConfig?: SnakeGameStyleConfig;
  arcadeStyleConfig?: SnakeGameStyleConfig;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Point {
  x: number;
  y: number;
}

const GRID_SIZE = 16;
const CELL_SIZE = 20; // 320x320 canvas
const INITIAL_SPEED = 140;

const renderSnakeToContext = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  snake: Point[],
  food: Point,
  style: Required<SnakeGameStyleConfig>,
  isArcade: boolean
) => {
  // Limpar fundo
  ctx.fillStyle = style.bgColor;
  ctx.fillRect(0, 0, width, height);

  // Grade
  ctx.strokeStyle = style.gridColor;
  ctx.lineWidth = isArcade ? 0.8 : 0.5;
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE);
    ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
    ctx.stroke();
  }

  // Fruto
  const foodCenterX = food.x * CELL_SIZE + CELL_SIZE / 2;
  const foodCenterY = food.y * CELL_SIZE + CELL_SIZE / 2;
  ctx.fillStyle = style.foodColor;
  ctx.beginPath();
  ctx.arc(foodCenterX, foodCenterY, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  if (isArcade && style.foodGlow !== 'transparent') {
    ctx.fillStyle = style.foodGlow;
    ctx.beginPath();
    ctx.arc(foodCenterX - 1.5, foodCenterY - 1.5, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Segmentos da cobra
  snake.forEach((segment, idx) => {
    const isHead = idx === 0;
    const x = segment.x * CELL_SIZE + (isArcade ? 1.5 : 1);
    const y = segment.y * CELL_SIZE + (isArcade ? 1.5 : 1);
    const size = CELL_SIZE - (isArcade ? 3 : 2);

    ctx.fillStyle = isHead ? style.snakeHeadColor : style.snakeBodyColor;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, isHead ? 4 : 2);
    ctx.fill();

    if (isArcade && style.snakeHeadBorder !== 'transparent') {
      ctx.strokeStyle = isHead ? style.snakeHeadBorder : style.snakeBodyBorder;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
};

export const SnakeGame: React.FC<SnakeGameProps> = ({
  isPlaying = true,
  onScoreChange,
  onGameOver,
  className = '',
  styleConfig,
  arcadeStyleConfig,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mirrorCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const style: Required<SnakeGameStyleConfig> = {
    ...DEFAULT_SNAKE_STYLE,
    ...styleConfig,
  };

  const arcadeStyle: Required<SnakeGameStyleConfig> = {
    ...ARCADE_SNAKE_STYLE,
    ...arcadeStyleConfig,
  };

  const onScoreChangeRef = useRef(onScoreChange);
  onScoreChangeRef.current = onScoreChange;

  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const [snake, setSnake] = useState<Point[]>([
    { x: 8, y: 8 },
    { x: 8, y: 9 },
    { x: 8, y: 10 },
  ]);
  const [direction, setDirection] = useState<Direction>('UP');
  const [food, setFood] = useState<Point>({ x: 8, y: 4 });
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const snakeRef = useRef<Point[]>(snake);
  snakeRef.current = snake;

  const foodRef = useRef<Point>(food);
  foodRef.current = food;

  const directionRef = useRef<Direction>(direction);
  directionRef.current = direction;

  const scoreRef = useRef<number>(score);
  scoreRef.current = score;

  const isGameOverRef = useRef(false);
  isGameOverRef.current = isGameOver;

  const prevIsPlayingRef = useRef<boolean>(false);

  // Generate random food not on snake
  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initSnake = [
      { x: 8, y: 8 },
      { x: 8, y: 9 },
      { x: 8, y: 10 },
    ];
    snakeRef.current = initSnake;
    setSnake(initSnake);
    setDirection('UP');
    directionRef.current = 'UP';
    const initFood = generateFood(initSnake);
    foodRef.current = initFood;
    setFood(initFood);
    setScore(0);
    scoreRef.current = 0;
    isGameOverRef.current = false;
    setIsGameOver(false);
    onScoreChangeRef.current?.(0);
  }, [generateFood]);

  // Reset ONLY when isPlaying transitions from false to true
  useEffect(() => {
    if (isPlaying && !prevIsPlayingRef.current) {
      resetGame();
    }
    prevIsPlayingRef.current = isPlaying;
  }, [isPlaying, resetGame]);

  // Keyboard controls
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const current = directionRef.current;
      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && current !== 'DOWN') {
        setDirection('UP');
        e.preventDefault();
      } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && current !== 'UP') {
        setDirection('DOWN');
        e.preventDefault();
      } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && current !== 'RIGHT') {
        setDirection('LEFT');
        e.preventDefault();
      } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && current !== 'LEFT') {
        setDirection('RIGHT');
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver]);

  // Main game loop
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const interval = setInterval(() => {
      if (isGameOverRef.current) return;

      const currentSnake = snakeRef.current;
      const head = { ...currentSnake[0] };
      const currentDir = directionRef.current;

      if (currentDir === 'UP') head.y -= 1;
      if (currentDir === 'DOWN') head.y += 1;
      if (currentDir === 'LEFT') head.x -= 1;
      if (currentDir === 'RIGHT') head.x += 1;

      // Collision with walls
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        clearInterval(interval);
        isGameOverRef.current = true;
        setIsGameOver(true);
        onGameOverRef.current(scoreRef.current);
        return;
      }

      // Collision with self
      if (currentSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
        clearInterval(interval);
        isGameOverRef.current = true;
        setIsGameOver(true);
        onGameOverRef.current(scoreRef.current);
        return;
      }

      const currentFood = foodRef.current;
      const newSnake = [head, ...currentSnake];

      // Eat food
      if (head.x === currentFood.x && head.y === currentFood.y) {
        const nextScore = scoreRef.current + 10;
        scoreRef.current = nextScore;
        setScore(nextScore);
        onScoreChangeRef.current?.(nextScore);
        const newFood = generateFood(newSnake);
        foodRef.current = newFood;
        setFood(newFood);
      } else {
        newSnake.pop();
      }

      snakeRef.current = newSnake;
      setSnake(newSnake);
    }, Math.max(70, INITIAL_SPEED - Math.floor(score / 30) * 10));

    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, score, generateFood]);

  // Canvas drawing: renderiza o canvas principal (estilo claro original) e o espelho (estilo arcade escuro)
  useEffect(() => {
    // 1. Canvas principal (visivel ao usuario)
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        renderSnakeToContext(ctx, canvas.width, canvas.height, snake, food, style, false);
      }
    }

    // 2. Canvas espelho para a tela do fliperama
    const mirrorCanvas = mirrorCanvasRef.current;
    if (mirrorCanvas) {
      const mirrorCtx = mirrorCanvas.getContext('2d');
      if (mirrorCtx) {
        renderSnakeToContext(mirrorCtx, mirrorCanvas.width, mirrorCanvas.height, snake, food, arcadeStyle, true);
      }
    }
  }, [snake, food, style, arcadeStyle]);

  return (
    <div className={`w-full h-full flex items-center justify-center p-3 select-none ${className}`}>
      {/* Canvas principal exibido na tela com a estetica original clara */}
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="rounded-lg shadow-sm border border-calm-300 bg-white"
      />

      {/* Canvas espelho consumido pela tela do arcade com estilo retro escuro */}
      <canvas
        ref={mirrorCanvasRef}
        id="active-game-canvas"
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
};

export default SnakeGame;
