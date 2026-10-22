import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Award } from 'lucide-react';
import { Button } from '../../ui/Button';

interface SnakeGameProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Point {
  x: number;
  y: number;
}

const GRID_SIZE = 16;
const CELL_SIZE = 20; // 320x320 canvas
const INITIAL_SPEED = 140;

export const SnakeGame: React.FC<SnakeGameProps> = ({ onGameOver, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [snake, setSnake] = useState<Point[]>([
    { x: 8, y: 8 },
    { x: 8, y: 9 },
    { x: 8, y: 10 },
  ]);
  const [direction, setDirection] = useState<Direction>('UP');
  const [food, setFood] = useState<Point>({ x: 8, y: 4 });
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const directionRef = useRef<Direction>(direction);
  directionRef.current = direction;

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

  const resetGame = () => {
    const initSnake = [
      { x: 8, y: 8 },
      { x: 8, y: 9 },
      { x: 8, y: 10 },
    ];
    setSnake(initSnake);
    setDirection('UP');
    directionRef.current = 'UP';
    setFood(generateFood(initSnake));
    setScore(0);
    setIsGameOver(false);
    setIsRunning(true);
  };

  // Keyboard controls
  useEffect(() => {
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
  }, []);

  // Main game loop
  useEffect(() => {
    if (!isRunning || isGameOver) return;

    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const currentDir = directionRef.current;

        if (currentDir === 'UP') head.y -= 1;
        if (currentDir === 'DOWN') head.y += 1;
        if (currentDir === 'LEFT') head.x -= 1;
        if (currentDir === 'RIGHT') head.x += 1;

        // Collision with walls
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setIsGameOver(true);
          setIsRunning(false);
          onGameOver(score);
          return prevSnake;
        }

        // Collision with self
        if (prevSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
          setIsGameOver(true);
          setIsRunning(false);
          onGameOver(score);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Eat food
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, Math.max(70, INITIAL_SPEED - Math.floor(score / 30) * 10));

    return () => clearInterval(interval);
  }, [isRunning, isGameOver, food, score, generateFood, onGameOver]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#F8FAFC'; // calm-50
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines
    ctx.strokeStyle = '#E2E8F0'; // calm-200
    ctx.lineWidth = 0.5;
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

    // Draw Food (calm terracotta rounded circle)
    ctx.fillStyle = '#C86D51'; // terracottaMuted
    ctx.beginPath();
    const foodCenterX = food.x * CELL_SIZE + CELL_SIZE / 2;
    const foodCenterY = food.y * CELL_SIZE + CELL_SIZE / 2;
    ctx.arc(foodCenterX, foodCenterY, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw Snake
    snake.forEach((segment, idx) => {
      ctx.fillStyle = idx === 0 ? '#4F7762' : '#719B83'; // sage-700 / sage-500
      const x = segment.x * CELL_SIZE + 1;
      const y = segment.y * CELL_SIZE + 1;
      const size = CELL_SIZE - 2;

      ctx.beginPath();
      ctx.roundRect(x, y, size, size, idx === 0 ? 4 : 2);
      ctx.fill();
    });
  }, [snake, food]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-3 select-none">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-calm-200">
        <div>
          <h3 className="text-sm font-semibold text-calm-900">Cobrinha (Snake)</h3>
          <p className="text-[11px] text-calm-500">Colete os frutos e evite colidir</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-sage-50 text-sage-900 px-3 py-1 rounded-md border border-sage-200">
            <Award size={14} className="text-sage-600" />
            <span className="text-xs font-semibold">{score} pts</span>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative my-auto flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="rounded-lg shadow-sm border border-calm-300 bg-white"
        />

        {/* Start / Game Over Overlay */}
        {!isRunning && !isGameOver && (
          <div className="absolute inset-0 bg-calm-900/40 backdrop-blur-xs rounded-lg flex flex-col items-center justify-center p-4 text-white">
            <h4 className="text-base font-bold mb-1">Pronto para a pausa?</h4>
            <p className="text-xs text-calm-200 text-center mb-4 max-w-[200px]">
              Use as setas do teclado ou os botões para controlar a cobrinha.
            </p>
            <Button variant="primary" onClick={resetGame} className="gap-1.5">
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
            <p className="text-xl font-bold mb-1">{score} pontos</p>
            <p className="text-xs text-calm-200 mb-4 max-w-[220px]">
              Tentativa única registrada no ranking da rodada.
            </p>
            <Button variant="primary" size="sm" onClick={onExit} className="px-5">
              <span>Concluir Partida</span>
            </Button>
          </div>
        )}
      </div>

      {/* On-Screen Direction Controls for Accessibility */}
      <div className="w-full flex items-center justify-between pt-2 border-t border-calm-200">
        <span className="text-[10px] text-calm-500">Teclas: Setas ou W, A, S, D</span>
        <div className="grid grid-cols-3 gap-1 w-28">
          <div />
          <button
            onClick={() => direction !== 'DOWN' && setDirection('UP')}
            className="p-1.5 rounded bg-calm-100 hover:bg-calm-200 text-calm-700 flex justify-center cursor-pointer"
            title="Cima"
          >
            <ArrowUp size={14} />
          </button>
          <div />
          <button
            onClick={() => direction !== 'RIGHT' && setDirection('LEFT')}
            className="p-1.5 rounded bg-calm-100 hover:bg-calm-200 text-calm-700 flex justify-center cursor-pointer"
            title="Esquerda"
          >
            <ArrowLeft size={14} />
          </button>
          <button
            onClick={() => direction !== 'UP' && setDirection('DOWN')}
            className="p-1.5 rounded bg-calm-100 hover:bg-calm-200 text-calm-700 flex justify-center cursor-pointer"
            title="Baixo"
          >
            <ArrowDown size={14} />
          </button>
          <button
            onClick={() => direction !== 'LEFT' && setDirection('RIGHT')}
            className="p-1.5 rounded bg-calm-100 hover:bg-calm-200 text-calm-700 flex justify-center cursor-pointer"
            title="Direita"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
