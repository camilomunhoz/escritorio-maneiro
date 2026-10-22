import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../../context/AppContext';
import { audioService } from '../../../services/audioService';
import {
  BodyTrackingFilter,
  POSE_PRESETS,
  generateVirtualPose,
} from '../../../services/poseTrackingService';
import type {
  Point2D,
  FixedTargets,
  CalibratedAnatomicalData,
} from '../../../services/poseTrackingService';
import { Button } from '../../ui/Button';
import {
  Video,
  RotateCcw,
  Sparkles,
  Minimize2,
} from 'lucide-react';

interface StretchVisionExpandedProps {
  onClose: () => void;
}

type SessionState = 'STOPPED' | 'FRAMING' | 'TPOSE' | 'LOCKED' | 'PLAYING';

export const StretchVisionExpanded: React.FC<StretchVisionExpandedProps> = ({ onClose }) => {
  const { completeStretch } = useApp();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [sessionState, setSessionState] = useState<SessionState>('FRAMING');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentPoseKey, setCurrentPoseKey] = useState<'diagonal' | 't_stretch' | 'overhead'>('diagonal');
  const [difficultyFactor, setDifficultyFactor] = useState(0.95);
  const [holdDuration, setHoldDuration] = useState(0);
  const [repsCount, setRepsCount] = useState(0);
  const [calibratedData, setCalibratedData] = useState<CalibratedAnatomicalData | null>(null);
  const [statusMessage, setStatusMessage] = useState('Passo 1: Verificação de Enquadramento');

  const requiredHoldTime = 3.0;
  const bodyFilterRef = useRef(new BodyTrackingFilter(0.65));
  const fixedTargetsRef = useRef<FixedTargets | null>(null);
  const calibrationSamplesRef = useRef<CalibratedAnatomicalData[]>([]);
  const stateRef = useRef({
    sessionState,
    isDemoMode,
    isCameraActive,
    currentPoseKey,
    difficultyFactor,
    holdDuration,
    repsCount,
  });

  stateRef.current = {
    sessionState,
    isDemoMode,
    isCameraActive,
    currentPoseKey,
    difficultyFactor,
    holdDuration,
    repsCount,
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setIsDemoMode(false);
      resetCalibration();
    } catch {
      setIsCameraActive(false);
      setIsDemoMode(true);
      resetCalibration();
    }
  };

  const resetCalibration = () => {
    setSessionState('FRAMING');
    calibrationSamplesRef.current = [];
    fixedTargetsRef.current = null;
    setHoldDuration(0);
    setStatusMessage('Passo 1: Enquadre os ombros e quadris');
  };

  // Lock targets from samples
  const finalizeCalibration = useCallback((samples: CalibratedAnatomicalData[]) => {
    if (samples.length === 0) return;
    const count = samples.length;
    let sumArmL = 0, sumArmR = 0, sumShW = 0;
    let sumShLx = 0, sumShLy = 0, sumShRx = 0, sumShRy = 0;
    let sumWArmL = 0, sumWArmR = 0, sumWingspan = 0;

    for (const s of samples) {
      sumArmL += s.armLenL;
      sumArmR += s.armLenR;
      sumShW += s.shoulderWidth;
      sumShLx += s.shoulderL.x;
      sumShLy += s.shoulderL.y;
      sumShRx += s.shoulderR.x;
      sumShRy += s.shoulderR.y;
      sumWArmL += s.worldArmL;
      sumWArmR += s.worldArmR;
      sumWingspan += s.worldWingspan;
    }

    const avgData: CalibratedAnatomicalData = {
      armLenL: sumArmL / count,
      armLenR: sumArmR / count,
      shoulderWidth: sumShW / count,
      shoulderL: { x: sumShLx / count, y: sumShLy / count },
      shoulderR: { x: sumShRx / count, y: sumShRy / count },
      torsoCenter: { x: (sumShLx + sumShRx) / (2 * count), y: (sumShLy + sumShRy) / (2 * count) },
      worldArmL: sumWArmL / count,
      worldArmR: sumWArmR / count,
      worldWingspan: sumWingspan / count,
    };

    setCalibratedData(avgData);

    // Calculate fixed targets based on current pose preset & anatomical arm length
    const preset = POSE_PRESETS[stateRef.current.currentPoseKey];
    const diff = stateRef.current.difficultyFactor;

    const reachDistL = avgData.armLenL * diff;
    const reachDistR = avgData.armLenR * diff;

    const targetLeft = {
      x: avgData.shoulderL.x + preset.dirLeft.x * reachDistL,
      y: avgData.shoulderL.y + preset.dirLeft.y * reachDistL,
    };
    const targetRight = {
      x: avgData.shoulderR.x + preset.dirRight.x * reachDistR,
      y: avgData.shoulderR.y + preset.dirRight.y * reachDistR,
    };

    const radius = Math.max(22, avgData.shoulderWidth * 0.22);
    fixedTargetsRef.current = { left: targetLeft, right: targetRight, radius };

    setSessionState('LOCKED');
    audioService.playCalibSuccess();
    setStatusMessage('Alvos travados com sucesso! Iniciando série...');

    setTimeout(() => {
      setSessionState('PLAYING');
      setStatusMessage('Estique os punhos até os alvos fixados');
    }, 1200);
  }, []);

  // Main animation / rendering loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let demoClock = 0;
    let framingTimer = 0;
    let tposeTimer = 0;
    let lastTickProgress = 0;

    const render = () => {
      const now = performance.now();
      const deltaTime = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Background
      if (stateRef.current.isCameraActive && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        ctx.restore();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
        ctx.fillRect(0, 0, width, height);
      } else {
        // Serene calm virtual studio background
        const grad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.7);
        grad.addColorStop(0, '#1E293B');
        grad.addColorStop(1, '#0F172A');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Perspective grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // 2. Fetch Landmarks (Virtual demo generator)
      demoClock += deltaTime;
      const poseData = generateVirtualPose(
        stateRef.current.sessionState,
        demoClock,
        fixedTargetsRef.current,
        width,
        height
      );

      const filtered = bodyFilterRef.current.filterLandmarks(poseData.landmarks);

      if (filtered && filtered.leftShoulder && filtered.rightShoulder && filtered.leftWrist && filtered.rightWrist) {
        const toScreen = (pt: Point2D) => ({
          x: (1 - pt.x) * width,
          y: pt.y * height,
        });

        const sL = toScreen(filtered.leftShoulder);
        const sR = toScreen(filtered.rightShoulder);
        const eL = filtered.leftElbow ? toScreen(filtered.leftElbow) : { x: (sL.x + (1 - filtered.leftWrist.x) * width) / 2, y: (sL.y + filtered.leftWrist.y * height) / 2 };
        const eR = filtered.rightElbow ? toScreen(filtered.rightElbow) : { x: (sR.x + (1 - filtered.rightWrist.x) * width) / 2, y: (sR.y + filtered.rightWrist.y * height) / 2 };
        const wL = toScreen(filtered.leftWrist);
        const wR = toScreen(filtered.rightWrist);

        const shoulderWidth = Math.hypot(sR.x - sL.x, sR.y - sL.y);
        const torsoCenter = { x: (sL.x + sR.x) / 2, y: (sL.y + sR.y) / 2 };

        // Draw Skeleton Lines
        ctx.strokeStyle = 'rgba(113, 155, 131, 0.8)'; // sage-500
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Shoulders
        ctx.moveTo(sL.x, sL.y);
        ctx.lineTo(sR.x, sR.y);
        // Left arm
        ctx.moveTo(sL.x, sL.y);
        ctx.lineTo(eL.x, eL.y);
        ctx.lineTo(wL.x, wL.y);
        // Right arm
        ctx.moveTo(sR.x, sR.y);
        ctx.lineTo(eR.x, eR.y);
        ctx.lineTo(wR.x, wR.y);
        ctx.stroke();

        // Shoulder & elbow joints
        [sL, sR, eL, eR].forEach(pt => {
          ctx.fillStyle = '#4F7762'; // sage-700
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        // 3. State Machine Handling
        // Phase 1: FRAMING
        if (stateRef.current.sessionState === 'FRAMING') {
          // Draw framing boundary box
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 8]);
          ctx.strokeRect(width * 0.15, height * 0.12, width * 0.7, height * 0.75);
          ctx.setLineDash([]);

          framingTimer += deltaTime;
          if (framingTimer >= 0.8) {
            setSessionState('TPOSE');
            tposeTimer = 0;
            audioService.playTargetAcquired();
            setStatusMessage('Passo 2: Abra os braços na horizontal por 2 segundos');
          }
        }

        // Phase 2: TPOSE
        if (stateRef.current.sessionState === 'TPOSE') {
          // Draw T-Pose guides (horizontal dashed lines)
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(width * 0.1, sL.y);
          ctx.lineTo(width * 0.9, sR.y);
          ctx.stroke();
          ctx.setLineDash([]);

          tposeTimer += deltaTime;
          const progress = Math.min(1.0, tposeTimer / 2.0);

          const currentTick = Math.floor(tposeTimer / 0.4);
          if (currentTick > lastTickProgress) {
            lastTickProgress = currentTick;
            audioService.playCalibTick(progress);
          }

          // Sample anatomical data
          const leftArmFull = Math.hypot(eL.x - sL.x, eL.y - sL.y) + Math.hypot(wL.x - eL.x, wL.y - eL.y);
          const rightArmFull = Math.hypot(eR.x - sR.x, eR.y - sR.y) + Math.hypot(wR.x - eR.x, wR.y - eR.y);

          calibrationSamplesRef.current.push({
            armLenL: leftArmFull,
            armLenR: rightArmFull,
            shoulderWidth,
            shoulderL: { ...sL },
            shoulderR: { ...sR },
            torsoCenter: { ...torsoCenter },
            worldArmL: 0.68,
            worldArmR: 0.68,
            worldWingspan: 1.72,
          });

          if (tposeTimer >= 2.0) {
            finalizeCalibration(calibrationSamplesRef.current);
          }
        }

        // Phase 3 & 4: LOCKED and PLAYING (Static Targets & Euclidean collision)
        if (fixedTargetsRef.current) {
          const targets = fixedTargetsRef.current;
          const distL = Math.hypot(wL.x - targets.left.x, wL.y - targets.left.y);
          const distR = Math.hypot(wR.x - targets.right.x, wR.y - targets.right.y);

          const isLeftIn = distL <= targets.radius;
          const isRightIn = distR <= targets.radius;
          const isBothIn = isLeftIn && isRightIn;

          // Draw Targets (Illuminated static targets)
          [
            { pt: targets.left, active: isLeftIn, label: 'Alvo Esquerdo' },
            { pt: targets.right, active: isRightIn, label: 'Alvo Direito' },
          ].forEach(target => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(target.pt.x, target.pt.y, targets.radius, 0, Math.PI * 2);
            ctx.fillStyle = target.active ? 'rgba(79, 119, 98, 0.45)' : 'rgba(255, 255, 255, 0.08)';
            ctx.fill();

            ctx.strokeStyle = target.active ? '#719B83' : 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = target.active ? 3 : 1.5;
            ctx.stroke();

            // Bullseye inner dot
            ctx.beginPath();
            ctx.arc(target.pt.x, target.pt.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = target.active ? '#4F7762' : 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
            ctx.restore();
          });

          // Draw Wrists
          [
            { pt: wL, active: isLeftIn },
            { pt: wR, active: isRightIn },
          ].forEach(wrist => {
            ctx.fillStyle = wrist.active ? '#719B83' : '#C86D51'; // sage or terracotta
            ctx.beginPath();
            ctx.arc(wrist.pt.x, wrist.pt.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();
          });

          // Handle Hold Progress in PLAYING state
          if (stateRef.current.sessionState === 'PLAYING') {
            if (isBothIn) {
              setHoldDuration(prev => {
                const updated = prev + deltaTime;
                if (Math.floor(updated) > Math.floor(prev)) {
                  audioService.playTick();
                }
                if (updated >= requiredHoldTime) {
                  // Stretch cycle achieved!
                  audioService.playCelebration();
                  setRepsCount(r => r + 1);
                  completeStretch();
                  return 0;
                }
                return updated;
              });
            } else {
              setHoldDuration(prev => Math.max(0, prev - deltaTime * 1.5));
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [finalizeCalibration, completeStretch]);

  const holdProgress = Math.min(1.0, holdDuration / requiredHoldTime);

  return (
    <div className="w-full h-full flex overflow-hidden bg-calm-950 text-white select-none relative">
      {/* Hidden Video element for webcam capture */}
      <video ref={videoRef} playsInline muted className="hidden" />

      {/* Top Bar Controls */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-30 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-calm-200 transition cursor-pointer"
        title="Retornar ao Drawer"
      >
        <Minimize2 size={14} />
      </button>

      {/* Left Column (1/3 ~ 240px): Status HUD & Calibration Metrics */}
      <aside className="w-60 border-r border-white/10 bg-calm-900/90 p-3.5 flex flex-col justify-between overflow-y-auto shrink-0">
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-sage-400">
              Alongamento Interativo
            </span>
            <h3 className="text-sm font-semibold text-white mt-0.5">Alongamento Ativo</h3>
            <p className="text-[11px] text-calm-400 leading-tight mt-0.5">{statusMessage}</p>
          </div>

          {/* Calibrated Metrics */}
          {calibratedData && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-calm-300">Medidas de Alcance:</span>
              <div className="flex justify-between text-[11px] text-calm-400">
                <span>Braço Esquerdo:</span>
                <span className="font-mono text-white">{Math.round(calibratedData.worldArmL * 100)} cm</span>
              </div>
              <div className="flex justify-between text-[11px] text-calm-400">
                <span>Braço Direito:</span>
                <span className="font-mono text-white">{Math.round(calibratedData.worldArmR * 100)} cm</span>
              </div>
              <div className="flex justify-between text-[11px] text-calm-400">
                <span>Alcance dos Braços:</span>
                <span className="font-mono text-white">{calibratedData.worldWingspan.toFixed(2)} m</span>
              </div>
            </div>
          )}

          {/* Pose Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-calm-400">Postura Selecionada:</span>
            <div className="flex flex-col gap-1">
              {Object.values(POSE_PRESETS).map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setCurrentPoseKey(p.id as 'diagonal' | 't_stretch' | 'overhead');
                    resetCalibration();
                  }}
                  className={`p-1.5 rounded-md text-left text-xs transition cursor-pointer ${
                    currentPoseKey === p.id
                      ? 'bg-sage-600/30 border border-sage-500 text-white font-medium'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent text-calm-300'
                  }`}
                >
                  <p className="font-semibold">{p.shortName}</p>
                  <p className="text-[10px] text-calm-400 truncate">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Extension Factor */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-calm-400">
              <span>Extensão:</span>
              <span className="font-mono text-white">{Math.round(difficultyFactor * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.85"
              max="1.15"
              step="0.05"
              value={difficultyFactor}
              onChange={e => {
                setDifficultyFactor(parseFloat(e.target.value));
                resetCalibration();
              }}
              className="accent-sage-500 cursor-pointer h-1"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-calm-400">Séries Concluídas:</span>
            <span className="font-bold text-sage-400">{repsCount}</span>
          </div>

          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={resetCalibration}
              fullWidth
              className="text-xs bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              <RotateCcw size={12} className="mr-1" />
              Recalibrar
            </Button>
            {!isCameraActive ? (
              <Button
                size="sm"
                variant="primary"
                onClick={startCamera}
                title="Ligar Webcam Real"
                className="text-xs"
              >
                <Video size={12} />
              </Button>
            ) : null}
          </div>
        </div>
      </aside>

      {/* Right Column (2/3 ~ 510px): Interactive Visual Canvas */}
      <section className="flex-1 h-full relative overflow-hidden flex flex-col items-center justify-center">
        <canvas
          ref={canvasRef}
          width={510}
          height={480}
          className="w-full h-full object-contain"
        />

        {/* Hold Meter Overlay during PLAYING state */}
        {sessionState === 'PLAYING' && (
          <div className="absolute top-3 left-4 right-4 flex items-center justify-between bg-calm-900/80 backdrop-blur-xs px-4 py-2 rounded-xl border border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-sage-400" />
              <span className="text-xs font-semibold text-white">Sustentação do Alongamento:</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-sage-500 transition-all duration-100"
                  style={{ width: `${holdProgress * 100}%` }}
                />
              </div>
              <span className="font-mono text-xs font-bold text-sage-300">
                {(requiredHoldTime - holdDuration).toFixed(1)}s
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default StretchVisionExpanded;
