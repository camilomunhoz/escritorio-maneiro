import React, { useEffect, useRef } from 'react';
import type { GameType } from '../../../types';

export interface GameThumbnailProps {
  game: GameType | string;
  className?: string;
  blurPx?: number;
  overlayClassName?: string;
}

export const GameThumbnail: React.FC<GameThumbnailProps> = ({
  game,
  className = '',
  blurPx = 6,
  overlayClassName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isCancelled = false;

    // Normalizing game key
    const gameKey = game.toLowerCase();

    // ----------------------------------------------------
    // 1. Cobrinha (Snake) Autonomous AI Loop
    // ----------------------------------------------------
    if (gameKey === 'cobrinha') {
      const COLS = 16;
      const ROWS = 12;
      const CELL_SIZE = 20; // 320 x 240
      canvas.width = COLS * CELL_SIZE;
      canvas.height = ROWS * CELL_SIZE;

      let snake = [
        { x: 8, y: 6 },
        { x: 8, y: 7 },
        { x: 8, y: 8 },
      ];

      const spawnFood = (currentSnake: Array<{ x: number; y: number }>) => {
        let attempts = 0;
        while (attempts < 100) {
          const fx = Math.floor(Math.random() * COLS);
          const fy = Math.floor(Math.random() * ROWS);
          if (!currentSnake.some(s => s.x === fx && s.y === fy)) {
            return { x: fx, y: fy };
          }
          attempts++;
        }
        return { x: 4, y: 4 };
      };

      let food = spawnFood(snake);
      let lastStep = performance.now();
      const STEP_INTERVAL = 110;

      const loop = (now: number) => {
        if (isCancelled) return;

        if (now - lastStep >= STEP_INTERVAL) {
          lastStep = now;
          const head = snake[0];
          const moves = [
            { x: head.x + 1, y: head.y },
            { x: head.x - 1, y: head.y },
            { x: head.x, y: head.y + 1 },
            { x: head.x, y: head.y - 1 },
          ];

          const valid = moves.filter(m => {
            if (m.x < 0 || m.x >= COLS || m.y < 0 || m.y >= ROWS) return false;
            return !snake.slice(0, -1).some(seg => seg.x === m.x && seg.y === m.y);
          });

          if (valid.length === 0) {
            snake = [
              { x: 8, y: 6 },
              { x: 8, y: 7 },
              { x: 8, y: 8 },
            ];
            food = spawnFood(snake);
          } else {
            valid.sort((a, b) => {
              const distA = Math.abs(a.x - food.x) + Math.abs(a.y - food.y);
              const distB = Math.abs(b.x - food.x) + Math.abs(b.y - food.y);
              return distA - distB;
            });

            const nextHead = valid[0];
            const ate = nextHead.x === food.x && nextHead.y === food.y;
            snake.unshift(nextHead);
            if (!ate) {
              snake.pop();
            } else {
              food = spawnFood(snake);
            }
          }
        }

        // Draw Snake Scene
        ctx.fillStyle = '#FAF6F0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Subtle Grid
        ctx.strokeStyle = '#E5DCD0';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= COLS; x++) {
          ctx.beginPath();
          ctx.moveTo(x * CELL_SIZE, 0);
          ctx.lineTo(x * CELL_SIZE, ROWS * CELL_SIZE);
          ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
          ctx.beginPath();
          ctx.moveTo(0, y * CELL_SIZE);
          ctx.lineTo(COLS * CELL_SIZE, y * CELL_SIZE);
          ctx.stroke();
        }

        // Food
        ctx.fillStyle = '#C86D51';
        ctx.beginPath();
        ctx.arc(
          food.x * CELL_SIZE + CELL_SIZE / 2,
          food.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE / 2 - 2,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Snake Segments
        snake.forEach((seg, idx) => {
          ctx.fillStyle = idx === 0 ? '#4F7762' : '#719B83';
          const px = seg.x * CELL_SIZE + 1;
          const py = seg.y * CELL_SIZE + 1;
          const psize = CELL_SIZE - 2;
          ctx.beginPath();
          ctx.roundRect(px, py, psize, psize, idx === 0 ? 4 : 2);
          ctx.fill();
        });

        animId = requestAnimationFrame(loop);
      };

      animId = requestAnimationFrame(loop);
    }

    // ----------------------------------------------------
    // 2. Pong Autonomous AI Loop
    // ----------------------------------------------------
    else if (gameKey === 'pong') {
      const WIDTH = 320;
      const HEIGHT = 200;
      const PADDLE_W = 6;
      const PADDLE_H = 44;
      const BALL_S = 7;

      canvas.width = WIDTH;
      canvas.height = HEIGHT;

      let leftY = HEIGHT / 2 - PADDLE_H / 2;
      let rightY = HEIGHT / 2 - PADDLE_H / 2;
      let ball = {
        x: WIDTH / 2,
        y: HEIGHT / 2,
        vx: 3.2,
        vy: 1.8,
      };

      const loop = () => {
        if (isCancelled) return;

        // Move paddles toward ball
        const leftTarget = ball.y - PADDLE_H / 2;
        leftY += (leftTarget - leftY) * 0.12;
        leftY = Math.max(4, Math.min(HEIGHT - PADDLE_H - 4, leftY));

        const rightTarget = ball.y - PADDLE_H / 2;
        rightY += (rightTarget - rightY) * 0.12;
        rightY = Math.max(4, Math.min(HEIGHT - PADDLE_H - 4, rightY));

        // Move ball
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Top/Bottom bounce
        if (ball.y <= 0) {
          ball.y = 0;
          ball.vy = Math.abs(ball.vy);
        } else if (ball.y >= HEIGHT - BALL_S) {
          ball.y = HEIGHT - BALL_S;
          ball.vy = -Math.abs(ball.vy);
        }

        // Left paddle bounce
        const leftPaddleX = 14;
        if (
          ball.x <= leftPaddleX + PADDLE_W &&
          ball.x >= leftPaddleX - 4 &&
          ball.y + BALL_S >= leftY &&
          ball.y <= leftY + PADDLE_H
        ) {
          ball.vx = Math.abs(ball.vx);
          ball.vy += ((ball.y + BALL_S / 2) - (leftY + PADDLE_H / 2)) * 0.08;
        }

        // Right paddle bounce
        const rightPaddleX = WIDTH - 14 - PADDLE_W;
        if (
          ball.x + BALL_S >= rightPaddleX &&
          ball.x <= rightPaddleX + PADDLE_W + 4 &&
          ball.y + BALL_S >= rightY &&
          ball.y <= rightY + PADDLE_H
        ) {
          ball.vx = -Math.abs(ball.vx);
          ball.vy += ((ball.y + BALL_S / 2) - (rightY + PADDLE_H / 2)) * 0.08;
        }

        // Out of bounds reset
        if (ball.x < 0 || ball.x > WIDTH) {
          ball.x = WIDTH / 2;
          ball.y = HEIGHT / 2;
          ball.vx = Math.random() > 0.5 ? 3.0 : -3.0;
          ball.vy = (Math.random() - 0.5) * 3;
        }

        // Draw Pong Scene
        ctx.fillStyle = '#FAF6F0';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Center dashed divider
        ctx.strokeStyle = '#E5DCD0';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(WIDTH / 2, 0);
        ctx.lineTo(WIDTH / 2, HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);

        // Left Paddle (Sage)
        ctx.fillStyle = '#4F7762';
        ctx.beginPath();
        ctx.roundRect(leftPaddleX, leftY, PADDLE_W, PADDLE_H, 3);
        ctx.fill();

        // Right Paddle (Slate)
        ctx.fillStyle = '#64748B';
        ctx.beginPath();
        ctx.roundRect(rightPaddleX, rightY, PADDLE_W, PADDLE_H, 3);
        ctx.fill();

        // Ball (Terracotta)
        ctx.fillStyle = '#C86D51';
        ctx.beginPath();
        ctx.arc(ball.x + BALL_S / 2, ball.y + BALL_S / 2, BALL_S / 2, 0, Math.PI * 2);
        ctx.fill();

        animId = requestAnimationFrame(loop);
      };

      animId = requestAnimationFrame(loop);
    }

    // ----------------------------------------------------
    // 3. Termo (Wordle) Autonomous AI Loop
    // ----------------------------------------------------
    else {
      const WIDTH = 320;
      const HEIGHT = 220;
      canvas.width = WIDTH;
      canvas.height = HEIGHT;

      const WORDS = ['PAUSA', 'SAUDE', 'CALMA', 'VIVER', 'PASSO', 'FORCA', 'RITMO', 'MENTE', 'TEMPO'];
      const TILE_SIZE = 26;
      const TILE_GAP = 5;
      const COLS = 5;
      const ROWS = 6;
      const GRID_W = COLS * TILE_SIZE + (COLS - 1) * TILE_GAP;
      const GRID_H = ROWS * TILE_SIZE + (ROWS - 1) * TILE_GAP;
      const START_X = (WIDTH - GRID_W) / 2;
      const START_Y = (HEIGHT - GRID_H) / 2;

      interface RowData {
        word: string;
        statuses: ('correct' | 'present' | 'absent')[];
      }

      let targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
      let completedRows: RowData[] = [];
      let currentGuess = '';
      let plannedGuesses = [...WORDS].sort(() => Math.random() - 0.5);
      let guessIndex = 0;
      let nextActionTime = performance.now() + 200;
      let state: 'typing' | 'evaluating' | 'resetting' = 'typing';

      const loop = (now: number) => {
        if (isCancelled) return;

        if (now >= nextActionTime) {
          if (state === 'typing') {
            const nextWord = plannedGuesses[guessIndex % plannedGuesses.length];
            if (currentGuess.length < 5) {
              currentGuess += nextWord[currentGuess.length];
              nextActionTime = now + 180;
            } else {
              state = 'evaluating';
              nextActionTime = now + 350;
            }
          } else if (state === 'evaluating') {
            const statuses: ('correct' | 'present' | 'absent')[] = [];
            for (let i = 0; i < 5; i++) {
              if (currentGuess[i] === targetWord[i]) {
                statuses.push('correct');
              } else if (targetWord.includes(currentGuess[i])) {
                statuses.push('present');
              } else {
                statuses.push('absent');
              }
            }

            completedRows.push({ word: currentGuess, statuses });
            const won = currentGuess === targetWord;
            currentGuess = '';
            guessIndex++;

            if (won || completedRows.length >= ROWS) {
              state = 'resetting';
              nextActionTime = now + 1600;
            } else {
              state = 'typing';
              nextActionTime = now + 250;
            }
          } else if (state === 'resetting') {
            completedRows = [];
            currentGuess = '';
            targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
            plannedGuesses = [...WORDS].sort(() => Math.random() - 0.5);
            guessIndex = 0;
            state = 'typing';
            nextActionTime = now + 300;
          }
        }

        // Draw Termo Canvas
        ctx.fillStyle = '#FAF6F0';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const x = START_X + c * (TILE_SIZE + TILE_GAP);
            const y = START_Y + r * (TILE_SIZE + TILE_GAP);

            if (r < completedRows.length) {
              const rowData = completedRows[r];
              const st = rowData.statuses[c];
              const bg =
                st === 'correct' ? '#4F7762' : st === 'present' ? '#D97706' : '#94A3B8';

              ctx.fillStyle = bg;
              ctx.beginPath();
              ctx.roundRect(x, y, TILE_SIZE, TILE_SIZE, 3);
              ctx.fill();

              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 13px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(rowData.word[c] || '', x + TILE_SIZE / 2, y + TILE_SIZE / 2 + 1);
            } else if (r === completedRows.length) {
              const char = currentGuess[c] || '';
              if (char) {
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.roundRect(x, y, TILE_SIZE, TILE_SIZE, 3);
                ctx.fill();

                ctx.strokeStyle = '#847462';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.fillStyle = '#221B14';
                ctx.font = 'bold 13px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(char, x + TILE_SIZE / 2, y + TILE_SIZE / 2 + 1);
              } else {
                ctx.fillStyle = '#F2EDE4';
                ctx.beginPath();
                ctx.roundRect(x, y, TILE_SIZE, TILE_SIZE, 3);
                ctx.fill();

                ctx.strokeStyle = '#E5DCD0';
                ctx.lineWidth = 1;
                ctx.stroke();
              }
            } else {
              ctx.fillStyle = '#F2EDE4';
              ctx.beginPath();
              ctx.roundRect(x, y, TILE_SIZE, TILE_SIZE, 3);
              ctx.fill();

              ctx.strokeStyle = '#E5DCD0';
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }

        animId = requestAnimationFrame(loop);
      };

      animId = requestAnimationFrame(loop);
    }

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animId);
    };
  }, [game]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          filter: `blur(${blurPx}px)`,
          transform: 'scale(1.08)',
        }}
        className="w-full h-full object-cover"
      />
      {overlayClassName && <div className={`absolute inset-0 ${overlayClassName}`} />}
    </div>
  );
};

export default GameThumbnail;
