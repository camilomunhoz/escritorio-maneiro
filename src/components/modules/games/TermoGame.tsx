import React, { useState, useEffect, useCallback } from 'react';
import { Delete, CornerDownLeft, Award } from 'lucide-react';
import { Button } from '../../ui/Button';

interface TermoGameProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
}

const WORD_POOL = ['PAUSA', 'SAUDE', 'CALMA', 'VIVER', 'PASSO', 'FORCA', 'RITMO'];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

export const TermoGame: React.FC<TermoGameProps> = ({ onGameOver, onExit }) => {
  const [targetWord] = useState(() => {
    return WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
  });
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const MAX_ATTEMPTS = 6;

  const handleKey = useCallback(
    (key: string) => {
      if (isGameOver) return;
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
          setHasWon(true);
          const score = (MAX_ATTEMPTS - guesses.length) * 20;
          onGameOver(score);
        } else if (newGuesses.length >= MAX_ATTEMPTS) {
          setIsGameOver(true);
          setHasWon(false);
          onGameOver(15);
        }
      } else if (key === 'BACKSPACE' || key === 'DELETE') {
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (/^[A-ZÇ]$/.test(key) && currentGuess.length < 5) {
        setCurrentGuess(prev => prev + key);
      }
    },
    [currentGuess, guesses, isGameOver, targetWord, onGameOver]
  );

  useEffect(() => {
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
  }, [handleKey]);

  // Letter status helper for grid
  const getLetterStatus = (guess: string, index: number) => {
    const letter = guess[index];
    if (letter === targetWord[index]) return 'correct'; // green
    if (targetWord.includes(letter)) return 'present'; // yellow
    return 'absent'; // slate
  };

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

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-3 select-none">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-calm-200">
        <div>
          <h3 className="text-sm font-semibold text-calm-900">Termo de Bem-Estar</h3>
          <p className="text-[11px] text-calm-500">Descubra a palavra do dia em até 6 tentativas</p>
        </div>
        <div className="flex items-center gap-1.5 bg-sage-50 text-sage-900 px-3 py-1 rounded-md border border-sage-200">
          <Award size={14} className="text-sage-600" />
          <span className="text-xs font-semibold">{guesses.length} / {MAX_ATTEMPTS}</span>
        </div>
      </div>

      {/* Error message alert */}
      {errorMessage && (
        <div className="text-[11px] font-medium text-terracottaMuted-700 bg-sand-100 px-3 py-1 rounded-full border border-sand-300">
          {errorMessage}
        </div>
      )}

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

      {/* Game Over Message */}
      {isGameOver && (
        <div className="w-full bg-calm-100 p-2.5 rounded-lg border border-calm-200 flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-semibold text-calm-900">
              {hasWon ? 'Palavra Descoberta!' : `Palavra Correta: ${targetWord}`}
            </p>
            <p className="text-[10px] text-calm-500">
              Tentativa única creditada no ranking da rodada.
            </p>
          </div>
          <Button size="sm" variant="primary" onClick={onExit} className="text-xs px-3">
            <span>Concluir Partida</span>
          </Button>
        </div>
      )}

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
                  onClick={() => handleKey(key)}
                  className={`h-7 rounded text-[11px] flex items-center justify-center transition cursor-pointer ${
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
