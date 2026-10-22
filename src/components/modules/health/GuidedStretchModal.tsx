import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { CheckCircle2, X, Sparkles } from 'lucide-react';

interface GuidedStretchModalProps {
  onClose: () => void;
  onComplete: () => void;
}

const STRETCH_STEPS = [
  {
    title: 'Extensão de Braços e Ombros',
    description: 'Eleve os dois braços acima da cabeça, entrelace os dedos e incline o tronco suavemente para a esquerda e para a direita.',
    targetX: 50,
    targetY: 25,
  },
  {
    title: 'Alongamento Peitoral e Escápulas',
    description: 'Abra os braços lateralmente, puxe os cotovelos para trás e respire profundamente, expandindo a caixa torácica.',
    targetX: 85,
    targetY: 50,
  },
  {
    title: 'Alívio Cervical e Trapézio',
    description: 'Incline a cabeça em direção ao ombro direito por 10 segundos, mantendo os ombros relaxados e longe das orelhas.',
    targetX: 50,
    targetY: 75,
  },
];

export const GuidedStretchModal: React.FC<GuidedStretchModalProps> = ({ onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetReached, setTargetReached] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const step = STRETCH_STEPS[currentStep];

  const handleTargetClick = () => {
    setTargetReached(true);
    setTimeout(() => {
      if (currentStep < STRETCH_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
        setTargetReached(false);
      } else {
        setIsFinished(true);
        onComplete();
      }
    }, 800);
  };

  return (
    <div className="absolute inset-0 z-30 bg-calm-950/70 backdrop-blur-xs flex items-center justify-center p-3 select-none">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-calm-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3.5 border-b border-calm-200 flex items-center justify-between bg-calm-50">
          <div>
            <h3 className="text-xs font-semibold text-calm-900">Alongamento Guiado de 1 Minuto</h3>
            <p className="text-[10px] text-calm-500">Recupere a flexibilidade da musculatura postural</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-calm-400 hover:text-calm-700 transition cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Stretch Stage / Interactive Area */}
        {!isFinished ? (
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11px] text-calm-500 font-medium">
              <span>Passo {currentStep + 1} de {STRETCH_STEPS.length}</span>
              <span className="text-sage-700 font-semibold">{step.title}</span>
            </div>

            {/* Target Field */}
            <div className="relative w-full h-44 bg-calm-100 rounded-xl border border-dashed border-calm-300 flex items-center justify-center overflow-hidden">
              {/* Silhouette guide */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="w-24 h-32 border-2 border-calm-700 rounded-full" />
              </div>

              {/* Target circle */}
              <button
                onClick={handleTargetClick}
                style={{
                  top: `${step.targetY}%`,
                  left: `${step.targetX}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center cursor-pointer shadow-md ${
                  targetReached
                    ? 'bg-sage-600 border-white text-white scale-110'
                    : 'bg-white border-sage-500 text-sage-700 hover:scale-105 animate-pulse'
                }`}
              >
                {targetReached ? <CheckCircle2 size={20} /> : <Sparkles size={18} />}
              </button>

              <div className="absolute bottom-2 text-center text-[10px] text-calm-400 pointer-events-none">
                Toque no marcador para registrar a extensão
              </div>
            </div>

            <p className="text-xs text-calm-700 leading-relaxed bg-calm-50 p-2.5 rounded-lg border border-calm-200">
              {step.description}
            </p>
          </div>
        ) : (
          <div className="p-5 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-sage-100 border border-sage-200 flex items-center justify-center text-sage-700">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-calm-900">Alongamento Concluído</h4>
              <p className="text-xs text-calm-500 max-w-[220px] mt-0.5">
                Sua musculatura foi ativada. Você recebeu +25 XP de Saúde.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={onClose} fullWidth className="mt-2">
              Voltar ao Módulo de Saúde
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidedStretchModal;
