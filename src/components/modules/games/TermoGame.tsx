import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';

export interface TermoGameStyleConfig {
  bgColor?: string;
  tileEmptyBg?: string;
  tileEmptyBorder?: string;
  tileTbdBg?: string;
  tileTbdBorder?: string;
  tileCorrectBg?: string;
  tileCorrectBorder?: string;
  tilePresentBg?: string;
  tilePresentBorder?: string;
  tileAbsentBg?: string;
  tileAbsentBorder?: string;
}

export const DEFAULT_TERMO_STYLE: Required<TermoGameStyleConfig> = {
  bgColor: '#0F172A',
  tileEmptyBg: '#1E293B',
  tileEmptyBorder: '#334155',
  tileTbdBg: '#334155',
  tileTbdBorder: '#64748B',
  tileCorrectBg: '#4F7762',
  tileCorrectBorder: '#3D5E4D',
  tilePresentBg: '#D97706',
  tilePresentBorder: '#B45309',
  tileAbsentBg: '#475569',
  tileAbsentBorder: '#334155',
};

export interface TermoGameProps {
  isPlaying?: boolean;
  onScoreChange?: (score: number) => void;
  onGameOver: (score: number) => void;
  className?: string;
  styleConfig?: TermoGameStyleConfig;
}

const WORD_POOL = ['PAUSA', 'SAUDE', 'CALMA', 'VIVER', 'PASSO', 'FORCA', 'RITMO'];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

export const TermoGame: React.FC<TermoGameProps> = ({
  isPlaying = true,
  onScoreChange,
  onGameOver,
  className = '',
  styleConfig,
}) => {
  const style: Required<TermoGameStyleConfig> = {
    ...DEFAULT_TERMO_STYLE,
    ...styleConfig,
  };

  const onScoreChangeRef = useRef(onScoreChange);
  onScoreChangeRef.current = onScoreChange;

  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const prevIsPlayingRef = useRef<boolean>(false);
  const mirrorCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [targetWord, setTargetWord] = useState(() => {
    return WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
  });
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const MAX_ATTEMPTS = 6;

  const resetGame = useCallback(() => {
    setTargetWord(WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]);
    setGuesses([]);
    setCurrentGuess('');
    setIsGameOver(false);
    setErrorMessage('');
    onScoreChangeRef.current?.(0);
  }, []);

  // Reset ONLY when isPlaying transitions from false to true
  useEffect(() => {
    if (isPlaying && !prevIsPlayingRef.current) {
      resetGame();
    }
    prevIsPlayingRef.current = isPlaying;
  }, [isPlaying, resetGame]);

  const handleKey = useCallback(
    (key: string) => {
      if (!isPlaying || isGameOver) return;
      setErrorMessage('');

      if (key === 'ENTER') {
        if (currentGuess.length !== 5) {
          setErrorMessage('A palavra precisa de 5 letras');
          return;
        }

        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);
        setCurrentGuess('');

        if (currentGuess === targetWord) {
          setIsGameOver(true);
          const score = (MAX_ATTEMPTS - guesses.length) * 20;
          onScoreChangeRef.current?.(score);
          onGameOverRef.current(score);
        } else if (newGuesses.length >= MAX_ATTEMPTS) {
          setIsGameOver(true);
          onScoreChangeRef.current?.(15);
          onGameOverRef.current(15);
        }
      } else if (key === 'BACKSPACE' || key === 'DELETE') {
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (/^[A-ZÇ]$/.test(key) && currentGuess.length < 5) {
        setCurrentGuess(prev => prev + key);
      }
    },
    [isPlaying, currentGuess, guesses, isGameOver, targetWord]
  );

  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === 'Enter') {
        handleKey('ENTER');
      } else if (e.key === 'Backspace') {
        handleKey('BACKSPACE');
      } else {
        const char = e.key.toUpperCase();
        if (/^[A-ZÇ]$/.test(char)) {
          handleKey(char);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, handleKey]);

  // Letter status helper for grid
  const getLetterStatus = useCallback((guess: string, index: number) => {
    const letter = guess[index];
    if (letter === targetWord[index]) return 'correct'; // green
    if (targetWord.includes(letter)) return 'present'; // yellow
    return 'absent'; // slate
  }, [targetWord]);

  // Keyboard letter color status
  const getKeyStatus = (key: string) => {
    let status = 'default';
    for (const guess of guesses) {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === key) {
          if (targetWord[i] === key) return 'correct';
          if (targetWord.includes(key)) status = 'present';
          else if (status !== 'present') status = 'absent';
        }
      }
    }
    return status;
  };

  // Reproduz a matriz do Termo no canvas espelho do fliperama com estilo arcade
  useEffect(() => {
    const canvas = mirrorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = style.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const boxW = 20;
    const boxH = 20;
    const gap = 3;
    const totalW = 5 * boxW + 4 * gap;
    const totalH = 6 * boxH + 5 * gap;
    const startX = (canvas.width - totalW) / 2;
    const startY = (canvas.height - totalH) / 2;

    for (let row = 0; row < MAX_ATTEMPTS; row++) {
      const guess = guesses[row];
      const isCur = row === guesses.length;

      for (let col = 0; col < 5; col++) {
        const x = startX + col * (boxW + gap);
        const y = startY + row * (boxH + gap);

        let bg = style.tileEmptyBg;
        let border = style.tileEmptyBorder;
        let letter = '';

        if (guess) {
          letter = guess[col];
          const st = getLetterStatus(guess, col);
          if (st === 'correct') {
            bg = style.tileCorrectBg;
            border = style.tileCorrectBorder;
          } else if (st === 'present') {
            bg = style.tilePresentBg;
            border = style.tilePresentBorder;
          } else {
            bg = style.tileAbsentBg;
            border = style.tileAbsentBorder;
          }
        } else if (isCur && currentGuess[col]) {
          letter = currentGuess[col];
          bg = style.tileTbdBg;
          border = style.tileTbdBorder;
        }

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, boxW, boxH);
        ctx.strokeStyle = border;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, boxW, boxH);

        if (letter) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(letter, x + boxW / 2, y + boxH / 2);
        }
      }
    }
  }, [guesses, currentGuess, targetWord, getLetterStatus, style]);

  return (
    <div className={`w-full h-full flex flex-col items-center justify-between p-3 select-none ${className}`}>
      {/* Canvas espelho para sincronizacao com a tela do arcade */}
      <canvas
        ref={mirrorCanvasRef}
        id="active-game-canvas"
        width={140}
        height={170}
        className="hidden"
        aria-hidden="true"
      />

      {/* Error message alert */}
      <div className="min-h-[22px] flex items-center justify-center">
        {errorMessage && (
          <div className="text-[11px] font-medium text-terracottaMuted-700 bg-sand-100 px-3 py-0.5 rounded-full border border-sand-300 animate-pulse">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Grid: 6 rows of 5 letters */}
      <div className="flex flex-col gap-1.5 my-auto">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => {
          const guess = guesses[rowIndex];
          const isCurrentRow = rowIndex === guesses.length;

          return (
            <div key={rowIndex} className="flex gap-1.5 justify-center">
              {Array.from({ length: 5 }).map((_, colIndex) => {
                let letter = '';
                let status = 'empty';

                if (guess) {
                  letter = guess[colIndex];
                  status = getLetterStatus(guess, colIndex);
                } else if (isCurrentRow) {
                  letter = currentGuess[colIndex] || '';
                  status = letter ? 'tbd' : 'empty';
                }

                const styleClasses = {
                  correct: 'bg-sage-600 text-white border-sage-700 font-bold',
                  present: 'bg-amber-500 text-white border-amber-600 font-bold',
                  absent: 'bg-calm-400 text-white border-calm-500 font-medium',
                  tbd: 'bg-white text-calm-900 border-calm-400 font-bold',
                  empty: 'bg-calm-50/70 text-calm-400 border-calm-200',
                }[status];

                return (
                  <div
                    key={colIndex}
                    className={`w-9 h-9 rounded-md border flex items-center justify-center text-sm uppercase transition-colors duration-200 ${styleClasses}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Virtual Keyboard */}
      <div className="w-full flex flex-col gap-1 pt-2 border-t border-calm-200">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1">
            {row.map(key => {
              const status = getKeyStatus(key);
              const isSpecial = key === 'ENTER' || key === 'BACKSPACE';

              const keyStyles = {
                correct: 'bg-sage-600 text-white font-bold',
                present: 'bg-amber-500 text-white font-bold',
                absent: 'bg-calm-300 text-calm-600 opacity-60',
                default: 'bg-calm-100 hover:bg-calm-200 text-calm-800 font-medium',
              }[status];

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKey(key)}
                  className={`h-7 rounded text-[11px] flex items-center justify-center transition cursor-pointer select-none active:scale-95 ${
                    isSpecial ? 'px-2 min-w-10 bg-calm-200 text-calm-700' : 'w-7'
                  } ${keyStyles}`}
                >
                  {key === 'BACKSPACE' ? <Delete size={13} /> : key === 'ENTER' ? <CornerDownLeft size={13} /> : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TermoGame;
