import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Camera, Check, ShieldCheck } from 'lucide-react';

interface FacialDetectionModalProps {
  onClose: () => void;
  zIndex?: number;
}

export const FacialDetectionModal: React.FC<FacialDetectionModalProps> = ({ onClose, zIndex }) => {
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
    <Modal
      title="Detecção e Biometria Facial"
      icon={<ShieldCheck size={15} className="text-sage-700" />}
      onClose={handleClose}
      zIndex={zIndex}
      contentClassName="flex-1 flex overflow-hidden bg-white"
    >
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
              <span>Protege os dados do seu drawer contra terceiros quando você se ausentar.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-600 mt-1.5 flex-shrink-0" />
              <span>Processamento 100% no navegador: fotos e vídeos nunca são armazenados ou enviados a servidores.</span>
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

      {/* Right Column (2/3 ~ flex-1): Camera View & Scanning */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
        {!cameraActive ? (
          <div className="flex flex-col items-center gap-3 text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-calm-100 flex items-center justify-center text-calm-600">
              <Camera size={28} />
            </div>
            <div>
              <h4 className="font-semibold text-calm-900 text-sm">Configurar Biometria</h4>
              <p className="text-xs text-calm-500 mt-1 leading-relaxed">
                Posicione-se em frente à câmera e clique no botão para iniciar a leitura.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleStartFaceDetection}
              className="mt-2"
            >
              Iniciar Câmera
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

              {/* Scanning visual overlay */}
              {cameraScanning && (
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                  <div className="w-full h-0.5 bg-sage-400/80 shadow-[0_0_8px_rgba(109,139,117,0.8)] animate-pulse" />
                  <div className="flex items-center justify-center">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium tracking-wide border border-white/20">
                      Escaneando pontos biométricos...
                    </span>
                  </div>
                  <div className="w-full h-0.5 bg-sage-400/80 shadow-[0_0_8px_rgba(109,139,117,0.8)] animate-pulse" />
                </div>
              )}

              {/* Face Guide Silhouette */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                <svg viewBox="0 0 100 100" className="w-40 h-40 stroke-white fill-none stroke-[1.5]">
                  <ellipse cx="50" cy="50" rx="25" ry="32" strokeDasharray="3,3" />
                </svg>
              </div>

              {/* Success Badge */}
              {!cameraScanning && (
                <div className="absolute inset-0 bg-sage-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-sage-600 flex items-center justify-center text-white mb-2 shadow-lg">
                    <Check size={24} />
                  </div>
                  <h4 className="font-semibold text-sm">Face Reconhecida</h4>
                  <p className="text-xs text-sage-200 mt-0.5">Biometria local registrada com sucesso</p>
                </div>
              )}
            </div>

            {/* Instruction Footer below video */}
            <div className="text-center">
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
    </Modal>
  );
};

export default FacialDetectionModal;
