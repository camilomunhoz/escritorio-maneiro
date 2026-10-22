import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../ui/Button';
import { CheckCircle2, Video, ArrowLeft, ShieldCheck } from 'lucide-react';

interface PostureCalibrationModalProps {
  onClose: () => void;
  onCalibrate: (score: number) => void;
}

export const PostureCalibrationModal: React.FC<PostureCalibrationModalProps> = ({ onClose, onCalibrate }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const [aligning, setAligning] = useState(false);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ video: { width: 320, height: 240 } })
      .then(s => {
        activeStream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          setStreamActive(true);
        }
      })
      .catch(() => {
        // Fallback simulation mode
        setStreamActive(false);
      });

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleStartCalibration = () => {
    setAligning(true);
    setTimeout(() => {
      setAligning(false);
      setCalibrated(true);
      onCalibrate(95);
    }, 2000);
  };

  return (
    <div className="absolute inset-0 z-40 bg-white flex flex-col select-none overflow-hidden">
      {/* Header with back button */}
      <div className="p-3 border-b border-calm-200 flex items-center justify-between bg-calm-50/90 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-calm-700 hover:text-calm-900 hover:bg-calm-200/70 transition cursor-pointer text-xs font-medium"
            title="Retornar à tela anterior"
          >
            <ArrowLeft size={15} />
            <span>Voltar</span>
          </button>
          <div className="h-4 w-px bg-calm-300" />
          <h3 className="text-xs font-semibold text-calm-900">Calibração de Postura</h3>
        </div>
      </div>

      {/* Video / Camera Guide Area */}
      <div className="p-4 flex-1 overflow-y-auto flex flex-col items-center justify-center gap-3">
          <div className="relative w-64 h-48 bg-calm-900 rounded-xl overflow-hidden flex items-center justify-center border border-calm-700">
            {streamActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-calm-400 gap-1.5 p-4 text-center">
                <Video size={28} className="text-calm-500 animate-pulse" />
                <span className="text-[11px] font-medium text-calm-300">
                  Câmera em modo de demonstração assistida
                </span>
              </div>
            )}

            {/* Overlaid Ergonomic Guidelines */}
            <div
              className={`absolute w-36 h-40 rounded-full border-2 transition-all duration-700 pointer-events-none ${
                calibrated
                  ? 'border-sage-400 bg-sage-500/10 shadow-[0_0_15px_rgba(79,119,98,0.4)]'
                  : aligning
                  ? 'border-amber-400 animate-pulse'
                  : 'border-white/70 border-dashed'
              }`}
            />

            {/* Eye-level horizontal line */}
            <div className="absolute w-full h-[1px] bg-white/40 pointer-events-none top-20" />
            <div className="absolute left-2 top-17 text-[9px] text-white/70 font-mono pointer-events-none">
              Nível dos Olhos
            </div>

            {/* Shoulder guideline */}
            <div className="absolute w-44 h-[1px] bg-white/40 pointer-events-none bottom-8" />
            <div className="absolute bottom-9 text-[9px] text-white/70 font-mono pointer-events-none">
              Alinhamento de Ombros
            </div>
          </div>

          <p className="text-[11px] text-calm-600 text-center leading-relaxed">
            {calibrated
              ? 'Postura calibrada com sucesso. Seus lembretes ergonômicos estão configurados.'
              : aligning
              ? 'Ajustando referências de alinhamento...'
              : 'Posicione seu rosto dentro da moldura e mantenha os ombros relaxados e paralelos.'}
          </p>

          <div className="w-full flex items-center justify-center gap-2 mt-1">
            {!calibrated ? (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                disabled={aligning}
                onClick={handleStartCalibration}
                className="gap-1.5"
              >
                <ShieldCheck size={14} />
                <span>{aligning ? 'Calibrando...' : 'Calibrar Postura Agora'}</span>
              </Button>
            ) : (
              <Button variant="primary" size="sm" fullWidth onClick={onClose} className="gap-1.5">
                <CheckCircle2 size={14} />
                <span>Salvar e Fechar</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

export default PostureCalibrationModal;
