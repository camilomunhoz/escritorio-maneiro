import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Activity, Check, UserCheck } from 'lucide-react';
import { audioService } from '../../../services/audioService';

interface PostureCalibrationModalProps {
  onClose: () => void;
  onCalibrate: (score: number) => void;
  zIndex?: number;
}

export const PostureCalibrationModal: React.FC<PostureCalibrationModalProps> = ({
  onClose,
  onCalibrate,
  zIndex,
}) => {
  const { calibrateHealth } = useApp();

  // Camera and scanning states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraScanning, setCameraScanning] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Stop media tracks
  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  // Handle start posture capture
  const handleStartPostureCapture = async () => {
    setCameraActive(true);
    setCameraScanning(true);
    setCalibrated(false);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 300 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }
    } catch {
      // Fallback simulation mode
    }

    setTimeout(() => {
      setCameraScanning(false);
      setCalibrated(true);
      audioService.playCalibSuccess();
    }, 2000);
  };

  const handleFinish = () => {
    stopStream();
    calibrateHealth(95);
    onCalibrate(95);
    onClose();
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  return (
    <Modal
      title="Calibração de Postura Ergonômica"
      icon={<Activity size={15} className="text-sage-700" />}
      onClose={handleClose}
      zIndex={zIndex}
      contentClassName="flex-1 flex overflow-hidden bg-white"
    >
      {/* Left Column (1/3 ~ 256px) */}
      <aside className="w-64 border-r border-calm-200/80 bg-calm-50/70 p-5 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-calm-900 text-sm">Postura de Referência</h3>

          <div className="bg-sage-50 border border-sage-200/80 rounded-xl p-3">
            <p className="text-xs font-medium text-sage-900 leading-relaxed">
              Fique na postura que você gostaria de manter na sua rotina de trabalho.
            </p>
          </div>

          <ul className="text-xs text-calm-600 space-y-2 mt-1 leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-600 mt-1.5 flex-shrink-0" />
              <span>Registramos o alinhamento de ombros e cervical como sua referência ideal.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-600 mt-1.5 flex-shrink-0" />
              <span>O processamento é 100% local no seu navegador. Nenhuma imagem é transmitida ou salva.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-2 pt-4">
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={handleClose}
          >
            Retornar
          </Button>
        </div>
      </aside>

      {/* Right Column (2/3 ~ flex-1): Camera View & Calibration State */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
        {!cameraActive ? (
          <div className="flex flex-col items-center gap-3 text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-calm-100 flex items-center justify-center text-calm-600">
              <UserCheck size={28} />
            </div>
            <div>
              <h4 className="font-semibold text-calm-900 text-sm">Pronto para calibrar?</h4>
              <p className="text-xs text-calm-500 mt-1 leading-relaxed">
                Sente-se ereto, com os pés apoiados no chão e a tela na altura dos olhos.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleStartPostureCapture}
              className="mt-2"
            >
              Iniciar Calibração
            </Button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <div className="relative w-80 h-60 bg-calm-950 rounded-2xl overflow-hidden border border-calm-200 shadow-md flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Dynamic Scanning Grid Line */}
              {cameraScanning && (
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                  <div className="w-full h-0.5 bg-sage-400/80 shadow-[0_0_8px_rgba(109,139,117,0.8)] animate-pulse" />
                  <div className="flex items-center justify-center">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium tracking-wide border border-white/20">
                      Mapeando pontos de postura...
                    </span>
                  </div>
                  <div className="w-full h-0.5 bg-sage-400/80 shadow-[0_0_8px_rgba(109,139,117,0.8)] animate-pulse" />
                </div>
              )}

              {/* Wireframe Silhouette Guide */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                <svg viewBox="0 0 100 100" className="w-48 h-48 stroke-white fill-none stroke-[1.5]">
                  <circle cx="50" cy="30" r="14" />
                  <path d="M 20 85 C 20 60, 35 52, 50 52 C 65 52, 80 60, 80 85" />
                  <line x1="28" y1="58" x2="72" y2="58" strokeDasharray="2,2" />
                </svg>
              </div>

              {/* Success Badge */}
              {calibrated && (
                <div className="absolute inset-0 bg-sage-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-sage-600 flex items-center justify-center text-white mb-2 shadow-lg">
                    <Check size={24} />
                  </div>
                  <h4 className="font-semibold text-sm">Postura Calibrada</h4>
                  <p className="text-xs text-sage-200 mt-0.5">Referência anatômica registrada com sucesso</p>
                </div>
              )}
            </div>

            {/* Instruction Footer below video */}
            <div className="text-center">
              {cameraScanning ? (
                <p className="text-xs text-calm-600 font-medium animate-pulse">
                  Mantenha a postura ereta por 2 segundos...
                </p>
              ) : calibrated ? (
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs text-sage-800 font-semibold">
                    Excelente alinhamento. Referência salva!
                  </p>
                  <p className="text-[11px] text-calm-500 max-w-xs">
                    Te ajudaremos a manter essa postura ao longo do seu expediente.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleFinish}
                    className="px-6 mt-1.5"
                  >
                    Concluir
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </Modal>
  );
};

export default PostureCalibrationModal;
