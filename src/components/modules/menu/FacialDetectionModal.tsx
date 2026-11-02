import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { AvatarSvg } from '../../ui/AvatarSvg';
import { Button } from '../../ui/Button';
import { ArrowLeft, Camera, Check, ShieldCheck } from 'lucide-react';

interface FacialDetectionModalProps {
  onClose: () => void;
}

export const FacialDetectionModal: React.FC<FacialDetectionModalProps> = ({ onClose }) => {
  const { updateUser } = useApp();

  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraScanning, setCameraScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Stop camera stream safely
  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  // Clean up webcam stream on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  // Handle camera permission and 2s scan simulation
  const handleStartFaceDetection = async () => {
    setCameraActive(true);
    setCameraScanning(true);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 300 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => { });
        }
      }
    } catch {
      // Simulated visual fallback if camera unavailable or denied
    }

    setTimeout(() => {
      setCameraScanning(false);
    }, 2000);
  };

  const handleFinishFaceDetection = () => {
    stopStream();
    updateUser({ facialDetectionCompleted: true });
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
            <ShieldCheck size={15} className="text-sage-700" />
            <span>Detecção e Biometria Facial</span>
          </h3>
        </div>
      </div>

      {/* 2-Column Body (Identical to Onboarding layout) */}
      <div className="flex-1 flex overflow-hidden bg-white">
        {/* Left Column (1/3 ~ 256px) */}
        <aside className="w-64 border-r border-calm-200/80 bg-calm-50/70 p-5 flex flex-col justify-between shrink-0">
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-calm-900 text-sm">Detecção e Biometria Facial</h3>

            <ul className="text-xs text-calm-600 space-y-2 mt-1 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-600 mt-1.5 flex-shrink-0" />
                <span>Valida que você é quem está utilizando a estação de trabalho.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-600 mt-1.5 flex-shrink-0" />
                <span>Viabiliza a trava de interface para proteger seus dados contra curiosos.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-600 mt-1.5 flex-shrink-0" />
                <span>Processamento silencioso e seguro na sua própria máquina.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[11px] text-calm-400 leading-tight">
              Você pode recalibrar sua biometria a qualquer momento nas Configurações.
            </p>
          </div>
        </aside>

        {/* Right Column (2/3 ~ flex-1) */}
        <section className="flex-1 flex flex-col items-center justify-center p-6 bg-white text-center">
          {!cameraActive ? (
            <div className="flex flex-col items-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-calm-100 flex items-center justify-center text-calm-600 mb-4">
                <Camera size={32} />
              </div>
              <h4 className="font-semibold text-calm-900 text-sm mb-1">Acesso à Câmera</h4>
              <p className="text-xs text-calm-500 mb-5 leading-relaxed">
                Posicione seu rosto em frente à tela para uma validação rápida de 2 segundos.
              </p>

              <div className="flex flex-col gap-2 w-full max-w-xs">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleStartFaceDetection}
                >
                  Realizar detecção facial
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
              {/* Camera Frame Container */}
              <div className="relative w-80 h-56 rounded-2xl overflow-hidden bg-slate-900 border border-calm-300 shadow-md flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover transform -scale-x-100"
                  muted
                  playsInline
                />

                {/* Simulated Face Silhouette if video inactive */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <AvatarSvg color="#ffffff" size="hero" />
                </div>

                {/* Oval Frame: White turning Green after 2s */}
                <div
                  className={`absolute w-36 h-48 rounded-[50%] border-2 transition-colors duration-500 pointer-events-none ${cameraScanning ? 'border-white animate-pulse' : 'border-emerald-400 bg-emerald-500/10'
                    }`}
                />

                {/* 4 Corner Markers with continuous Scale animation */}
                <div className="absolute inset-4 pointer-events-none animate-pulse">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/80" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/80" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/80" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/80" />
                </div>
              </div>

              {/* Status and Success Message */}
              <div className="mt-4 flex flex-col items-center">
                {cameraScanning ? (
                  <p className="text-xs text-calm-600 animate-pulse font-medium">
                    Detectando rosto... Mantenha a posição.
                  </p>
                ) : (
                  <div className="flex flex-col items-center gap-2 animate-fadeIn">
                    <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-600" />
                      Biometria facial validada com sucesso!
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleFinishFaceDetection}
                      className="px-6 mt-1"
                    >
                      Concluir
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FacialDetectionModal;
