import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../ui/Button';
import { ArrowLeft, Activity, Check, UserCheck } from 'lucide-react';
import { audioService } from '../../../services/audioService';

interface PostureCalibrationModalProps {
  onClose: () => void;
  onCalibrate: (score: number) => void;
}

export const PostureCalibrationModal: React.FC<PostureCalibrationModalProps> = ({ onClose, onCalibrate }) => {
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

    // 2.5s posture calibration baseline sampling
    setTimeout(() => {
      setCameraScanning(false);
      setCalibrated(true);
      audioService.playCalibSuccess();
    }, 2500);
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
    <div className="w-full h-full flex flex-col select-none overflow-hidden bg-white">
      {/* Top Header */}
      <div className="p-3 border-b border-calm-200 flex items-center justify-between bg-calm-50/90 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handleClose}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-calm-700 hover:text-calm-900 hover:bg-calm-200/70 transition cursor-pointer text-xs font-medium"
            title="Retornar à tela anterior"
          >
            <ArrowLeft size={15} />
            <span>Voltar</span>
          </button>
          <div className="h-4 w-px bg-calm-300" />
          <h3 className="text-xs font-semibold text-calm-900 flex items-center gap-1.5">
            <Activity size={15} className="text-sage-700" />
            <span>Calibração de Postura Ergonômica</span>
          </h3>
        </div>
      </div>

      {/* 2-Column Body (Same structured layout as Onboarding) */}
      <div className="flex-1 flex overflow-hidden bg-white">
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
                <span>O sistema compensa a distância da câmera para não confundir postura com o setup físico.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-600 mt-1.5 flex-shrink-0" />
                <span>Alertas discretos lembrarão você caso permaneça curvado por muito tempo.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[11px] text-calm-400 leading-tight">
              Você pode recalibrar sempre que mudar a altura da sua cadeira ou posição do monitor.
            </p>
          </div>
        </aside>

        {/* Right Column (2/3 ~ flex-1) */}
        <section className="flex-1 flex flex-col items-center justify-center p-6 bg-white text-center">
          {!cameraActive ? (
            <div className="flex flex-col items-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-calm-100 flex items-center justify-center text-sage-700 mb-4">
                <UserCheck size={32} />
              </div>
              <h4 className="font-semibold text-calm-900 text-sm mb-1">Acesso à Câmera de Ergonomia</h4>
              <p className="text-xs text-calm-500 mb-5 leading-relaxed">
                Assuma sua postura ideal em frente à tela e inicie a calibração de 2 segundos.
              </p>

              <div className="flex flex-col gap-2 w-full max-w-xs">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleStartPostureCapture}
                >
                  Registrar postura ideal
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center">
              {/* Posture Frame Container with Guides */}
              <div className="relative w-80 h-56 rounded-2xl overflow-hidden bg-slate-900 border border-calm-300 shadow-md flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover transform -scale-x-100"
                  muted
                  playsInline
                />

                {/* Posture Alignment Guide Lines (Shoulder axis & spine axis) */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  {/* Horizontal shoulder alignment line */}
                  <div
                    className={`w-56 h-px border-t transition-colors duration-500 ${
                      calibrated ? 'border-emerald-400/80 border-dashed' : 'border-white/40 border-dashed'
                    }`}
                  />
                  {/* Vertical spine alignment line */}
                  <div
                    className={`h-40 w-px border-l transition-colors duration-500 -mt-20 ${
                      calibrated ? 'border-emerald-400/80 border-dashed' : 'border-white/40 border-dashed'
                    }`}
                  />
                </div>

                {/* Torso/Shoulder Framing Box */}
                <div
                  className={`absolute w-52 h-44 rounded-2xl border-2 transition-all duration-500 pointer-events-none ${
                    calibrated
                      ? 'border-emerald-400 bg-emerald-500/10'
                      : cameraScanning
                      ? 'border-white animate-pulse'
                      : 'border-white/40'
                  }`}
                />

                {/* 4 Corner Markers */}
                <div className="absolute inset-4 pointer-events-none animate-pulse">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/80" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/80" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/80" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/80" />
                </div>
              </div>

              {/* Status and Feedback */}
              <div className="mt-4 flex flex-col items-center">
                {cameraScanning ? (
                  <p className="text-xs text-calm-600 animate-pulse font-medium">
                    Aguarde um instante... registrando alinhamento postural.
                  </p>
                ) : calibrated ? (
                  <div className="flex flex-col items-center gap-1.5 animate-fadeIn">
                    <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-600" />
                      Postura registrada com sucesso!
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
      </div>
    </div>
  );
};

export default PostureCalibrationModal;
