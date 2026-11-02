import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../ui/Modal';
import { audioService } from '../../../services/audioService';
import {
  BodyTrackingFilter,
  POSE_PRESETS,
  AUTO_CYCLE_POSES,
  createMediaPipePoseLandmarker,
  generateVirtualPose,
} from '../../../services/poseTrackingService';
import type {
  Point2D,
  LandmarkPoint,
  FixedTargets,
  CalibratedAnatomicalData,
  PosePreset,
  PosePresetKey,
  MediaPipePoseLandmarker,
  PoseDetectionResult,
} from '../../../services/poseTrackingService';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { ProgressBar } from '../../ui/ProgressBar';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Award,
  Compass,
  RefreshCw,
  ArrowUpLeft,
  MoveHorizontal,
  ArrowUp,
  Settings,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

export interface GuidedStretchModalProps {
  onClose: () => void;
  onComplete?: () => void;
  zIndex?: number;
}

type SessionState = 'STOPPED' | 'FRAMING' | 'TPOSE' | 'LOCKED' | 'PLAYING';
type VideoQuality = 'low' | 'medium' | 'high';

const QUALITY_FPS_MAP: Record<VideoQuality, number> = {
  low: 10,
  medium: 20,
  high: 30,
};

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 420;
const DEFAULT_DIFFICULTY = 0.95;
const DEFAULT_HOLD_TIME = 3.0;
const DEFAULT_TARGET_SIZE_RATIO = 0.20;
const DEFAULT_EMA_ALPHA = 0.65;
// Set to true to restore Demonstration Mode in the UI and automatic fallback
const ENABLE_DEMO_MODE = false;

export const GuidedStretchModal: React.FC<GuidedStretchModalProps> = ({ onClose, onComplete, zIndex }) => {
  const { completeStretch } = useApp();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const poseLandmarkerRef = useRef<MediaPipePoseLandmarker | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const bodyFilterRef = useRef<BodyTrackingFilter>(new BodyTrackingFilter(DEFAULT_EMA_ALPHA));

  // Session & Mode states
  const [sessionState, setSessionState] = useState<SessionState>('STOPPED');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Calibration Step Card UI states
  const [calibStepBadge, setCalibStepBadge] = useState('Passo 1 de 2');
  const [calibStepSuccess, setCalibStepSuccess] = useState(false);
  const [calibTitle, setCalibTitle] = useState('Posicione-se na frente da câmera');
  const [calibDesc, setCalibDesc] = useState(
    'Afaste-se um pouco até que seus ombros e sua cintura apareçam dentro da moldura.'
  );
  const [calibProgress, setCalibProgress] = useState(0);

  // Pose selection (Default: Treino Dinâmico)
  const [currentPresetKey, setCurrentPresetKey] = useState<PosePresetKey>('dynamic_auto');
  const [activePose, setActivePose] = useState<PosePreset>(() => ({
    ...POSE_PRESETS[AUTO_CYCLE_POSES[0]],
    isAuto: true,
  }));

  // User-friendly Settings
  const [soundEnabled, setSoundEnabled] = useState(() => audioService.isEnabled());
  const [mirrorCamera, setMirrorCamera] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('high');

  // Gamification & Session Progress
  const [score, setScore] = useState(0);
  const [reps, setReps] = useState(0);
  const [holdDuration, setHoldDuration] = useState(0);
  const [isHoldingActive, setIsHoldingActive] = useState(false);
  const [splashData, setSplashData] = useState<{ visible: boolean; points: number }>({
    visible: false,
    points: 25,
  });
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [sessionClaimed, setSessionClaimed] = useState(false);

  // Mutable refs for real-time loop access
  const sessionStateRef = useRef<SessionState>('STOPPED');
  const isCameraRunningRef = useRef(false);
  const isDemoModeRef = useRef(false);
  const activePoseRef = useRef<PosePreset>({
    ...POSE_PRESETS[AUTO_CYCLE_POSES[0]],
    isAuto: true,
  });
  const currentPresetKeyRef = useRef<PosePresetKey>('dynamic_auto');
  const autoPoseIndexRef = useRef(0);
  const mirrorCameraRef = useRef(true);
  const showSkeletonRef = useRef(true);
  const qualityRef = useRef<VideoQuality>('high');

  const calibratedDataRef = useRef<CalibratedAnatomicalData | null>(null);
  const fixedTargetsRef = useRef<FixedTargets | null>(null);
  const calibrationSamplesRef = useRef<CalibratedAnatomicalData[]>([]);
  const framingStableDurationRef = useRef(0);
  const tposeHoldDurationRef = useRef(0);
  const lastTPoseTickProgressRef = useRef(0);

  const holdDurationRef = useRef(0);
  const isBothWristsInTargetRef = useRef(false);
  const lastHoldSecondTickedRef = useRef(0);
  const demoTimeRef = useRef(0);
  const lastVideoTimeRef = useRef(-1);
  const lastUiSyncTimeRef = useRef(0);
  const splashTimeoutRef = useRef<number | null>(null);
  const lockedTimeoutRef = useRef<number | null>(null);

  // Recompute fixed targets from calibrated data
  const updateFixedTargetsForCurrentPose = useCallback(
    (
      calib: CalibratedAnatomicalData | null = calibratedDataRef.current,
      pose: PosePreset = activePoseRef.current
    ) => {
      if (!calib) return;

      const { shoulderL, shoulderR, armLenL, armLenR, shoulderWidth } = calib;
      const distTargetL = armLenL * DEFAULT_DIFFICULTY;
      const distTargetR = armLenR * DEFAULT_DIFFICULTY;

      const dirL = pose.dirLeft || { x: -0.76, y: -0.65 };
      const dirR = pose.dirRight || { x: 0.76, y: -0.65 };

      const targetRadius = Math.max(26, shoulderWidth * DEFAULT_TARGET_SIZE_RATIO);
      const margin = targetRadius + 18;

      const targetLeft = {
        x: Math.max(margin, Math.min(CANVAS_WIDTH - margin, shoulderL.x + dirL.x * distTargetL)),
        y: Math.max(margin, Math.min(CANVAS_HEIGHT - margin, shoulderL.y + dirL.y * distTargetL)),
      };

      const targetRight = {
        x: Math.max(margin, Math.min(CANVAS_WIDTH - margin, shoulderR.x + dirR.x * distTargetR)),
        y: Math.max(margin, Math.min(CANVAS_HEIGHT - margin, shoulderR.y + dirR.y * distTargetR)),
      };

      fixedTargetsRef.current = {
        left: targetLeft,
        right: targetRight,
        radius: targetRadius,
      };
    },
    []
  );

  // Fallback target creation if entering PLAYING without prior calibration
  const createInitialTargets = useCallback(
    ({ sL, sR, shoulderWidth }: { sL: Point2D; sR: Point2D; shoulderWidth: number }) => {
      const defaultArm = shoulderWidth * 1.35;
      const distL = defaultArm * DEFAULT_DIFFICULTY;
      const distR = defaultArm * DEFAULT_DIFFICULTY;
      const dirL = activePoseRef.current.dirLeft || { x: -0.76, y: -0.65 };
      const dirR = activePoseRef.current.dirRight || { x: 0.76, y: -0.65 };
      const targetRadius = Math.max(26, shoulderWidth * DEFAULT_TARGET_SIZE_RATIO);
      const margin = targetRadius + 18;

      fixedTargetsRef.current = {
        left: {
          x: Math.max(margin, Math.min(CANVAS_WIDTH - margin, sL.x + dirL.x * distL)),
          y: Math.max(margin, Math.min(CANVAS_HEIGHT - margin, sL.y + dirL.y * distL)),
        },
        right: {
          x: Math.max(margin, Math.min(CANVAS_WIDTH - margin, sR.x + dirR.x * distR)),
          y: Math.max(margin, Math.min(CANVAS_HEIGHT - margin, sR.y + dirR.y * distR)),
        },
        radius: targetRadius,
      };
    },
    []
  );

  // Start or restart calibration flow
  const startCalibration = useCallback(() => {
    if (lockedTimeoutRef.current) window.clearTimeout(lockedTimeoutRef.current);

    sessionStateRef.current = 'FRAMING';
    setSessionState('FRAMING');

    framingStableDurationRef.current = 0;
    tposeHoldDurationRef.current = 0;
    lastTPoseTickProgressRef.current = 0;
    calibrationSamplesRef.current = [];
    fixedTargetsRef.current = null;
    holdDurationRef.current = 0;
    setHoldDuration(0);
    setIsHoldingActive(false);

    setCalibStepBadge('Passo 1 de 2');
    setCalibStepSuccess(false);
    setCalibTitle('Posicione-se na frente da câmera');
    setCalibDesc('Afaste-se um pouco até que seus ombros e sua cintura apareçam dentro da moldura.');
    setCalibProgress(0);
  }, []);

  // Select stretch exercise preset
  const selectPose = useCallback(
    (poseKey: PosePresetKey) => {
      const preset = POSE_PRESETS[poseKey];
      if (!preset) return;

      currentPresetKeyRef.current = poseKey;
      setCurrentPresetKey(poseKey);

      let resolvedPose: PosePreset;
      if (poseKey === 'dynamic_auto') {
        autoPoseIndexRef.current = 0;
        const firstKey = AUTO_CYCLE_POSES[0];
        resolvedPose = { ...POSE_PRESETS[firstKey], isAuto: true };
      } else {
        resolvedPose = preset;
      }

      activePoseRef.current = resolvedPose;
      setActivePose(resolvedPose);

      if (calibratedDataRef.current) {
        updateFixedTargetsForCurrentPose(calibratedDataRef.current, resolvedPose);
      }

      holdDurationRef.current = 0;
      setHoldDuration(0);
      setIsHoldingActive(false);
    },
    [updateFixedTargetsForCurrentPose]
  );

  // Advance pose in Dynamic Auto mode
  const advanceAutoPose = useCallback(() => {
    if (currentPresetKeyRef.current !== 'dynamic_auto') return;
    autoPoseIndexRef.current = (autoPoseIndexRef.current + 1) % AUTO_CYCLE_POSES.length;
    const nextKey = AUTO_CYCLE_POSES[autoPoseIndexRef.current];
    const nextPose: PosePreset = { ...POSE_PRESETS[nextKey], isAuto: true };

    activePoseRef.current = nextPose;
    setActivePose(nextPose);

    if (calibratedDataRef.current) {
      updateFixedTargetsForCurrentPose(calibratedDataRef.current, nextPose);
    }
  }, [updateFixedTargetsForCurrentPose]);

  const stopCameraStream = useCallback(() => {
    isCameraRunningRef.current = false;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    bodyFilterRef.current.reset();
  }, []);

  const activateDemoMode = useCallback(() => {
    stopCameraStream();
    isDemoModeRef.current = true;
    setIsDemoMode(true);
    setCameraError(null);
    setIsInitializing(false);
    demoTimeRef.current = 0;
    startCalibration();
  }, [startCalibration, stopCameraStream]);

  const activateCamera = useCallback(async () => {
    isDemoModeRef.current = false;
    setIsDemoMode(false);
    setCameraError(null);
    setIsInitializing(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      isCameraRunningRef.current = true;
      setIsInitializing(false);
      startCalibration();
    } catch {
      if (ENABLE_DEMO_MODE) {
        activateDemoMode();
      } else {
        isCameraRunningRef.current = false;
        setIsInitializing(false);
        setCameraError(
          'Não foi possível acessar sua câmera. Verifique se o acesso está permitido no navegador e tente novamente.'
        );
      }
    }
  }, [activateDemoMode, startCalibration]);

  // Initialize vision model and start camera automatically on mount
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const landmarker = await createMediaPipePoseLandmarker();
        if (!isMounted) {
          landmarker.close?.();
          return;
        }
        poseLandmarkerRef.current = landmarker;
      } catch {
        // Vision model fallback handled by demonstration mode if needed
      }

      if (!isMounted) return;
      await activateCamera();
    };

    init();

    return () => {
      isMounted = false;
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close?.();
        poseLandmarkerRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
      if (splashTimeoutRef.current) window.clearTimeout(splashTimeoutRef.current);
      if (lockedTimeoutRef.current) window.clearTimeout(lockedTimeoutRef.current);
    };
  }, [activateCamera]);

  const finalizeCalibration = useCallback(() => {
    const samples = calibrationSamplesRef.current;
    if (samples.length === 0) return;

    const count = samples.length;
    let sumArmL = 0,
      sumArmR = 0,
      sumShW = 0;
    let sumShLx = 0,
      sumShLy = 0,
      sumShRx = 0,
      sumShRy = 0;
    let sumWArmL = 0,
      sumWArmR = 0,
      sumWingspan = 0;

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

    calibratedDataRef.current = avgData;
    updateFixedTargetsForCurrentPose(avgData);

    sessionStateRef.current = 'LOCKED';
    setSessionState('LOCKED');
    audioService.playCalibSuccess();

    setCalibStepSuccess(true);
    setCalibStepBadge('Tudo pronto');
    setCalibTitle('Alcance ajustado para você');
    setCalibDesc('Prepare-se, seu alongamento já vai começar.');

    lockedTimeoutRef.current = window.setTimeout(() => {
      if (sessionStateRef.current === 'LOCKED') {
        sessionStateRef.current = 'PLAYING';
        setSessionState('PLAYING');
      }
    }, 1400);
  }, [updateFixedTargetsForCurrentPose]);

  const completeRepetition = useCallback(() => {
    const pointsEarned = 25;

    setScore(prev => prev + pointsEarned);
    setReps(prev => prev + 1);
    setSessionClaimed(false);

    holdDurationRef.current = 0;
    lastHoldSecondTickedRef.current = 0;
    setHoldDuration(0);
    setIsHoldingActive(false);

    audioService.playCelebration();
    if (splashTimeoutRef.current) window.clearTimeout(splashTimeoutRef.current);
    setSplashData({ visible: true, points: pointsEarned });
    splashTimeoutRef.current = window.setTimeout(() => {
      setSplashData(prev => ({ ...prev, visible: false }));
    }, 1200);

    if (activePoseRef.current.isAuto) {
      window.setTimeout(() => {
        advanceAutoPose();
      }, 700);
    }
  }, [advanceAutoPose]);

  // Main render loop with quality-based frame throttling and aspect-ratio-preserving video draw
  useEffect(() => {
    let animId: number;
    let lastFrameTimestamp = performance.now();

    const drawFramingGuide = (
      ctx: CanvasRenderingContext2D,
      isFramed: boolean,
      width: number,
      height: number
    ) => {
      ctx.save();
      const marginX = width * 0.14;
      const marginY = height * 0.08;
      const boxW = width - 2 * marginX;
      const boxH = height - 2 * marginY;
      const color = isFramed ? '#8DA794' : '#CCA97D';

      ctx.strokeStyle = color;
      ctx.lineWidth = isFramed ? 3 : 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = isFramed ? 12 : 6;
      ctx.setLineDash([10, 8]);
      ctx.strokeRect(marginX, marginY, boxW, boxH);
      ctx.setLineDash([]);

      const cornerSize = 24;
      ctx.lineWidth = 3.5;
      const corners: Array<[number, number, number, number]> = [
        [marginX, marginY, 1, 1],
        [marginX + boxW, marginY, -1, 1],
        [marginX, marginY + boxH, 1, -1],
        [marginX + boxW, marginY + boxH, -1, -1],
      ];
      corners.forEach(([x, y, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(x, y + dy * cornerSize);
        ctx.lineTo(x, y);
        ctx.lineTo(x + dx * cornerSize, y);
        ctx.stroke();
      });

      ctx.restore();
    };

    const drawTPoseGuides = (
      ctx: CanvasRenderingContext2D,
      sL: Point2D,
      sR: Point2D,
      isTPose: boolean,
      width: number
    ) => {
      ctx.save();
      const shoulderY = (sL.y + sR.y) / 2;
      const color = isTPose ? '#8DA794' : '#94A3B8';

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.setLineDash([7, 7]);
      ctx.beginPath();
      ctx.moveTo(width * 0.08, shoulderY);
      ctx.lineTo(width * 0.92, shoulderY);
      ctx.stroke();
      ctx.setLineDash([]);

      const indicators: Array<[number, number, string]> = [
        [width * 0.14, shoulderY, 'ESQUERDA'],
        [width * 0.86, shoulderY, 'DIREITA'],
      ];
      indicators.forEach(([x, y, label]) => {
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fillStyle = isTPose ? 'rgba(109, 139, 117, 0.35)' : 'rgba(148, 163, 184, 0.2)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#F8FAFC';
        ctx.font = '600 10px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y + 24);
      });

      ctx.restore();
    };

    const drawSkeleton = (
      ctx: CanvasRenderingContext2D,
      pts: { sL: Point2D; sR: Point2D; eL: Point2D; eR: Point2D; wL: Point2D; wR: Point2D }
    ) => {
      const { sL, sR, eL, eR, wL, wR } = pts;
      ctx.save();
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.45)';

      ctx.beginPath();
      ctx.moveTo(sL.x, sL.y);
      ctx.lineTo(sR.x, sR.y);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(141, 167, 148, 0.85)';
      ctx.beginPath();
      ctx.moveTo(sL.x, sL.y);
      ctx.lineTo(eL.x, eL.y);
      ctx.lineTo(wL.x, wL.y);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(204, 169, 125, 0.85)';
      ctx.beginPath();
      ctx.moveTo(sR.x, sR.y);
      ctx.lineTo(eR.x, eR.y);
      ctx.lineTo(wR.x, wR.y);
      ctx.stroke();

      [sL, sR, eL, eR].forEach(pt => {
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    };

    const drawTarget = (
      ctx: CanvasRenderingContext2D,
      target: Point2D,
      radius: number,
      isInside: boolean,
      holdRatio: number,
      label: string,
      accentColor: string
    ) => {
      ctx.save();
      const pulseSize = isInside ? Math.sin(performance.now() * 0.01) * 3.5 : 0;
      const currentRadius = radius + pulseSize;

      ctx.beginPath();
      ctx.arc(target.x, target.y, currentRadius, 0, Math.PI * 2);
      if (isInside) {
        ctx.fillStyle = 'rgba(109, 139, 117, 0.35)';
        ctx.strokeStyle = '#8DA794';
        ctx.shadowColor = '#8DA794';
        ctx.shadowBlur = 20;
        ctx.lineWidth = 3.5;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.strokeStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2.5;
      }
      ctx.fill();
      ctx.stroke();

      if (holdRatio > 0) {
        ctx.beginPath();
        ctx.arc(
          target.x,
          target.y,
          currentRadius + 5,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * holdRatio
        );
        ctx.strokeStyle = '#AEC3B3';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#8DA794';
        ctx.shadowBlur = 14;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(target.x, target.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = isInside ? '#AEC3B3' : '#F8FAFC';
      ctx.shadowBlur = 0;
      ctx.fill();

      ctx.font = '600 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(248, 250, 252, 0.85)';
      ctx.textAlign = 'center';
      ctx.fillText(label, target.x, target.y + currentRadius + 14);

      ctx.restore();
    };

    const drawWrist = (
      ctx: CanvasRenderingContext2D,
      wrist: Point2D,
      isInside: boolean,
      defaultColor: string
    ) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(wrist.x, wrist.y, isInside ? 12 : 9, 0, Math.PI * 2);
      ctx.fillStyle = isInside ? '#6D8B75' : defaultColor;
      ctx.shadowColor = isInside ? '#8DA794' : defaultColor;
      ctx.shadowBlur = 14;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(wrist.x, wrist.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 0;
      ctx.fill();
      ctx.restore();
    };

    const drawGuideLine = (
      ctx: CanvasRenderingContext2D,
      wrist: Point2D,
      target: Point2D,
      isInside: boolean
    ) => {
      if (isInside) return;
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.28)';
      ctx.lineWidth = 1.75;
      ctx.beginPath();
      ctx.moveTo(wrist.x, wrist.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
      ctx.restore();
    };

    const handleHoldProgress = (isBothInTarget: boolean, deltaTime: number, now: number) => {
      if (isBothInTarget) {
        if (!isBothWristsInTargetRef.current) {
          audioService.playTargetAcquired();
        }
        isBothWristsInTargetRef.current = true;
        holdDurationRef.current += deltaTime;

        const currentTick = Math.floor(holdDurationRef.current / 0.75);
        if (currentTick > lastHoldSecondTickedRef.current) {
          lastHoldSecondTickedRef.current = currentTick;
          audioService.playTick();
        }

        if (holdDurationRef.current >= DEFAULT_HOLD_TIME) {
          completeRepetition();
          return;
        }
      } else {
        isBothWristsInTargetRef.current = false;
        lastHoldSecondTickedRef.current = 0;

        if (holdDurationRef.current > 0) {
          holdDurationRef.current = Math.max(0, holdDurationRef.current - deltaTime * 1.8);
        }
      }

      if (now - lastUiSyncTimeRef.current > 50) {
        lastUiSyncTimeRef.current = now;
        const ratio = holdDurationRef.current / DEFAULT_HOLD_TIME;
        setHoldDuration(holdDurationRef.current);
        setIsHoldingActive(ratio > 0.02 || isBothWristsInTargetRef.current);
      }
    };

    const renderLoop = () => {
      const now = performance.now();
      const targetFps = QUALITY_FPS_MAP[qualityRef.current];
      const minIntervalMs = 1000 / targetFps;
      const elapsedMs = now - lastFrameTimestamp;

      if (elapsedMs < minIntervalMs) {
        animId = requestAnimationFrame(renderLoop);
        return;
      }

      const deltaTime = Math.min(elapsedMs / 1000, 0.15);
      lastFrameTimestamp = now;

      if (isCameraRunningRef.current || isDemoModeRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (canvas && ctx) {
          const width = canvas.width;
          const height = canvas.height;

          // Compute aspect-ratio-preserving ("cover") projection rectangle so camera is never stretched
          let drawX = 0;
          let drawY = 0;
          let drawW = width;
          let drawH = height;

          if (!isDemoModeRef.current && videoRef.current && videoRef.current.videoWidth > 0) {
            const vw = videoRef.current.videoWidth;
            const vh = videoRef.current.videoHeight;
            const scale = Math.max(width / vw, height / vh);
            drawW = vw * scale;
            drawH = vh * scale;
            drawX = (width - drawW) / 2;
            drawY = (height - drawH) / 2;
          }

          let poseResults: PoseDetectionResult | null = null;

          if (isDemoModeRef.current) {
            demoTimeRef.current += deltaTime;
            const demo = generateVirtualPose(
              sessionStateRef.current,
              demoTimeRef.current,
              fixedTargetsRef.current,
              width,
              height,
              mirrorCameraRef.current
            );
            poseResults = { landmarks: [demo.landmarks], worldLandmarks: [demo.worldLandmarks] };
          } else if (
            isCameraRunningRef.current &&
            videoRef.current &&
            videoRef.current.readyState >= 2
          ) {
            if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
              lastVideoTimeRef.current = videoRef.current.currentTime;
              if (poseLandmarkerRef.current) {
                poseResults = poseLandmarkerRef.current.detectForVideo(videoRef.current, now);
              } else {
                poseResults = {};
              }
            }
          }

          if (isDemoModeRef.current || poseResults !== null) {
            ctx.clearRect(0, 0, width, height);

            // 1. Draw Background (Preserving aspect ratio without stretching)
            if (isDemoModeRef.current) {
              const grad = ctx.createRadialGradient(
                width / 2,
                height / 2,
                40,
                width / 2,
                height / 2,
                width * 0.72
              );
              grad.addColorStop(0, '#1E293B');
              grad.addColorStop(1, '#0F172A');
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, width, height);

              ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
              ctx.lineWidth = 1;
              for (let x = 0; x < width; x += 60) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
              }
              for (let y = 0; y < height; y += 60) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
              }

              // Virtual Avatar Silhouette
              ctx.fillStyle = 'rgba(255, 255, 255, 0.045)';
              ctx.beginPath();
              ctx.ellipse(width * 0.5, height * 0.65, width * 0.08, height * 0.2, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.arc(width * 0.5, height * 0.32, width * 0.04, 0, Math.PI * 2);
              ctx.fill();
            } else if (videoRef.current) {
              ctx.save();
              if (mirrorCameraRef.current) {
                ctx.translate(width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(videoRef.current, drawX, drawY, drawW, drawH);
              } else {
                ctx.drawImage(videoRef.current, drawX, drawY, drawW, drawH);
              }
              ctx.restore();

              ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
              ctx.fillRect(0, 0, width, height);
            }

            // 2. Process Pose Landmarks
            const landmarks: LandmarkPoint[] | undefined = poseResults?.landmarks?.[0];
            const worldLandmarks: LandmarkPoint[] | undefined = poseResults?.worldLandmarks?.[0];

            if (!landmarks || landmarks.length < 17) {
              bodyFilterRef.current.reset();
              if (sessionStateRef.current === 'PLAYING') {
                handleHoldProgress(false, deltaTime, now);
              }
            } else {
              const filtered = bodyFilterRef.current.filterLandmarks(landmarks);
              if (
                !filtered ||
                !filtered.leftShoulder ||
                !filtered.rightShoulder ||
                !filtered.leftWrist ||
                !filtered.rightWrist
              ) {
                if (sessionStateRef.current === 'PLAYING') {
                  handleHoldProgress(false, deltaTime, now);
                }
              } else {
                const toScreen = (pt: Point2D): Point2D => ({
                  x: drawX + (mirrorCameraRef.current ? 1 - pt.x : pt.x) * drawW,
                  y: drawY + pt.y * drawH,
                });

                const sL = toScreen(filtered.leftShoulder);
                const sR = toScreen(filtered.rightShoulder);
                const wL = toScreen(filtered.leftWrist);
                const wR = toScreen(filtered.rightWrist);
                const eL = filtered.leftElbow
                  ? toScreen(filtered.leftElbow)
                  : { x: (sL.x + wL.x) / 2, y: (sL.y + wL.y) / 2 };
                const eR = filtered.rightElbow
                  ? toScreen(filtered.rightElbow)
                  : { x: (sR.x + wR.x) / 2, y: (sR.y + wR.y) / 2 };

                const shoulderWidth = Math.hypot(sR.x - sL.x, sR.y - sL.y);
                const torsoCenter: Point2D = {
                  x: (sL.x + sR.x) / 2,
                  y: (sL.y + sR.y) / 2,
                };

                if (shoulderWidth < width * 0.08) {
                  if (sessionStateRef.current === 'PLAYING') {
                    handleHoldProgress(false, deltaTime, now);
                  }
                } else if (sessionStateRef.current === 'FRAMING') {
                  // Phase 1: FRAMING
                  const vis11 = landmarks[11]?.visibility ?? 0;
                  const vis12 = landmarks[12]?.visibility ?? 0;
                  const vis23 = landmarks[23]?.visibility ?? 0;
                  const vis24 = landmarks[24]?.visibility ?? 0;

                  const areShouldersVisible = vis11 > 0.85 && vis12 > 0.85;
                  const areHipsVisible = vis23 > 0.85 && vis24 > 0.85;

                  const keyPoints = [landmarks[11], landmarks[12], landmarks[23], landmarks[24]].filter(
                    (p): p is LandmarkPoint => Boolean(p)
                  );
                  const isWithinBorders =
                    keyPoints.length === 4 &&
                    keyPoints.every(p => p.x > 0.05 && p.x < 0.95 && p.y > 0.05 && p.y < 0.95);

                  const isFramed = areShouldersVisible && areHipsVisible && isWithinBorders;

                  drawFramingGuide(ctx, isFramed, width, height);

                  if (!isFramed) {
                    framingStableDurationRef.current = 0;
                    setCalibProgress(0);
                    setCalibStepSuccess(false);
                    setCalibStepBadge('Passo 1 de 2');

                    if (!areHipsVisible) {
                      setCalibTitle('Afaste-se um pouco da câmera');
                      setCalibDesc(
                        'Dê alguns passos para trás até que seus ombros e sua cintura fiquem visíveis na tela.'
                      );
                    } else if (!isWithinBorders) {
                      setCalibTitle('Centralize seu corpo');
                      setCalibDesc('Você está muito perto da borda. Posicione-se no centro da imagem.');
                    } else {
                      setCalibTitle('Posicione-se na frente da câmera');
                      setCalibDesc('Fique de frente para a câmera dentro da moldura indicada.');
                    }
                  } else {
                    framingStableDurationRef.current += deltaTime;
                    const progress = Math.min(1.0, framingStableDurationRef.current / 0.6);
                    setCalibProgress(progress * 100);
                    setCalibStepSuccess(true);
                    setCalibTitle('Posição confirmada');
                    setCalibDesc('Ótimo! Mantenha-se assim por um instante...');

                    if (framingStableDurationRef.current >= 0.6) {
                      sessionStateRef.current = 'TPOSE';
                      setSessionState('TPOSE');
                      tposeHoldDurationRef.current = 0;
                      calibrationSamplesRef.current = [];
                      lastTPoseTickProgressRef.current = 0;

                      setCalibStepSuccess(false);
                      setCalibStepBadge('Passo 2 de 2');
                      setCalibTitle('Abra os braços para os lados');
                      setCalibDesc(
                        'Estique os dois braços na altura dos ombros por 2 segundos para ajustarmos a distância ideal.'
                      );
                      setCalibProgress(0);
                      audioService.playTargetAcquired();
                    }
                  }

                  if (showSkeletonRef.current) {
                    drawSkeleton(ctx, { sL, sR, eL, eR, wL, wR });
                  }
                } else if (sessionStateRef.current === 'TPOSE') {
                  // Phase 2: TPOSE
                  const leftArmOut = Math.abs(sL.x - wL.x) > shoulderWidth * 0.55;
                  const rightArmOut = Math.abs(wR.x - sR.x) > shoulderWidth * 0.55;
                  const leftArmLevel = Math.abs(wL.y - sL.y) < shoulderWidth * 0.45;
                  const rightArmLevel = Math.abs(wR.y - sR.y) < shoulderWidth * 0.45;

                  const leftArmFull =
                    Math.hypot(eL.x - sL.x, eL.y - sL.y) + Math.hypot(wL.x - eL.x, wL.y - eL.y);
                  const rightArmFull =
                    Math.hypot(eR.x - sR.x, eR.y - sR.y) + Math.hypot(wR.x - eR.x, wR.y - eR.y);
                  const leftStraight = Math.hypot(wL.x - sL.x, wL.y - sL.y) > leftArmFull * 0.72;
                  const rightStraight = Math.hypot(wR.x - sR.x, wR.y - sR.y) > rightArmFull * 0.72;

                  const isTPose =
                    leftArmOut &&
                    rightArmOut &&
                    leftArmLevel &&
                    rightArmLevel &&
                    leftStraight &&
                    rightStraight;

                  drawTPoseGuides(ctx, sL, sR, isTPose, width);

                  if (isTPose) {
                    tposeHoldDurationRef.current += deltaTime;
                    const progress = Math.min(1.0, tposeHoldDurationRef.current / 2.0);
                    setCalibProgress(progress * 100);
                    const remainingSec = Math.max(0, 2.0 - tposeHoldDurationRef.current).toFixed(1);
                    setCalibTitle(`Mantenha os braços abertos: ${remainingSec}s`);
                    setCalibDesc('Ajustando a posição dos alvos para o seu tamanho...');

                    const currentTick = Math.floor(tposeHoldDurationRef.current / 0.4);
                    if (currentTick > lastTPoseTickProgressRef.current) {
                      lastTPoseTickProgressRef.current = currentTick;
                      audioService.playCalibTick(progress);
                    }

                    let wArmL = 0.68,
                      wArmR = 0.68,
                      wWingspan = 1.70;
                    if (worldLandmarks && worldLandmarks[11] && worldLandmarks[13] && worldLandmarks[15]) {
                      const wl = worldLandmarks;
                      wArmL =
                        Math.hypot(
                          wl[13].x - wl[11].x,
                          wl[13].y - wl[11].y,
                          (wl[13].z ?? 0) - (wl[11].z ?? 0)
                        ) +
                        Math.hypot(
                          wl[15].x - wl[13].x,
                          wl[15].y - wl[13].y,
                          (wl[15].z ?? 0) - (wl[13].z ?? 0)
                        );
                      wArmR =
                        Math.hypot(
                          wl[14].x - wl[12].x,
                          wl[14].y - wl[12].y,
                          (wl[14].z ?? 0) - (wl[12].z ?? 0)
                        ) +
                        Math.hypot(
                          wl[16].x - wl[14].x,
                          wl[16].y - wl[14].y,
                          (wl[16].z ?? 0) - (wl[14].z ?? 0)
                        );
                      const sDist = Math.hypot(
                        wl[12].x - wl[11].x,
                        wl[12].y - wl[11].y,
                        (wl[12].z ?? 0) - (wl[11].z ?? 0)
                      );
                      wWingspan = wArmL + wArmR + sDist;
                    }

                    calibrationSamplesRef.current.push({
                      armLenL: leftArmFull,
                      armLenR: rightArmFull,
                      shoulderL: { ...sL },
                      shoulderR: { ...sR },
                      shoulderWidth,
                      torsoCenter: { ...torsoCenter },
                      worldArmL: wArmL,
                      worldArmR: wArmR,
                      worldWingspan: wWingspan,
                    });

                    if (tposeHoldDurationRef.current >= 2.0) {
                      finalizeCalibration();
                    }
                  } else {
                    setCalibTitle('Abra os braços para os lados');
                    setCalibDesc('Estique os dois braços na altura dos ombros até alinhar com a linha.');
                    if (tposeHoldDurationRef.current > 0) {
                      tposeHoldDurationRef.current = Math.max(
                        0,
                        tposeHoldDurationRef.current - deltaTime * 0.8
                      );
                      setCalibProgress((tposeHoldDurationRef.current / 2.0) * 100);
                    }
                  }

                  if (showSkeletonRef.current) {
                    drawSkeleton(ctx, { sL, sR, eL, eR, wL, wR });
                  }
                } else if (sessionStateRef.current === 'LOCKED') {
                  // Phase 3: LOCKED
                  if (showSkeletonRef.current) {
                    drawSkeleton(ctx, { sL, sR, eL, eR, wL, wR });
                  }
                  if (fixedTargetsRef.current) {
                    drawTarget(
                      ctx,
                      fixedTargetsRef.current.left,
                      fixedTargetsRef.current.radius,
                      false,
                      0,
                      'ESQUERDA',
                      '#8DA794'
                    );
                    drawTarget(
                      ctx,
                      fixedTargetsRef.current.right,
                      fixedTargetsRef.current.radius,
                      false,
                      0,
                      'DIREITA',
                      '#CCA97D'
                    );
                  }
                } else if (sessionStateRef.current === 'PLAYING') {
                  // Phase 4: PLAYING
                  if (!fixedTargetsRef.current) {
                    createInitialTargets({ sL, sR, shoulderWidth });
                  }

                  const targets = fixedTargetsRef.current;
                  if (targets) {
                    const distLeft = Math.hypot(wL.x - targets.left.x, wL.y - targets.left.y);
                    const distRight = Math.hypot(wR.x - targets.right.x, wR.y - targets.right.y);

                    const isLeftInTarget = distLeft <= targets.radius;
                    const isRightInTarget = distRight <= targets.radius;
                    const isBothInTarget = isLeftInTarget && isRightInTarget;

                    handleHoldProgress(isBothInTarget, deltaTime, now);

                    if (showSkeletonRef.current) {
                      drawSkeleton(ctx, { sL, sR, eL, eR, wL, wR });
                    }

                    const holdRatio = Math.min(1.0, holdDurationRef.current / DEFAULT_HOLD_TIME);
                    drawTarget(
                      ctx,
                      targets.left,
                      targets.radius,
                      isLeftInTarget,
                      holdRatio,
                      'ESQUERDA',
                      '#8DA794'
                    );
                    drawTarget(
                      ctx,
                      targets.right,
                      targets.radius,
                      isRightInTarget,
                      holdRatio,
                      'DIREITA',
                      '#CCA97D'
                    );

                    drawWrist(ctx, wL, isLeftInTarget, '#8DA794');
                    drawWrist(ctx, wR, isRightInTarget, '#CCA97D');

                    if (!isBothInTarget) {
                      drawGuideLine(ctx, wL, targets.left, isLeftInTarget);
                      drawGuideLine(ctx, wR, targets.right, isRightInTarget);
                    }
                  }
                }
              }
            }
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [completeRepetition, createInitialTargets, finalizeCalibration]);

  // Handlers for controls
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioService.setEnabled(next);
  };

  const handleMirrorToggle = (checked: boolean) => {
    mirrorCameraRef.current = checked;
    setMirrorCamera(checked);
  };

  const handleSkeletonToggle = (checked: boolean) => {
    showSkeletonRef.current = checked;
    setShowSkeleton(checked);
  };

  const handleDemoToggle = (checked: boolean) => {
    if (checked) {
      activateDemoMode();
    } else {
      activateCamera();
    }
  };

  const handleQualityChange = (q: VideoQuality) => {
    qualityRef.current = q;
    setVideoQuality(q);
  };

  const sessionXpReward = reps > 0 ? Math.min(100, Math.max(15, Math.round(score * 0.6))) : 0;

  const handleFinishSession = () => {
    if (reps > 0 && !sessionClaimed) {
      completeStretch(reps, score);
      setSessionClaimed(true);
      onComplete?.();
    }
    setShowSessionSummary(true);
  };

  const handleExitModal = () => {
    if (reps > 0 && !sessionClaimed) {
      completeStretch(reps, score);
      setSessionClaimed(true);
      onComplete?.();
    }
    stopCameraStream();
    onClose();
  };

  const holdRatio = Math.max(0, Math.min(1.0, holdDuration / DEFAULT_HOLD_TIME));

  return (
    <Modal
      hideHeader
      onClose={handleExitModal}
      zIndex={zIndex}
      contentClassName="w-full h-full flex flex-col min-h-0"
    >
      {/* Hidden Video for Camera Capture */}
      <video ref={videoRef} playsInline autoPlay muted className="hidden" />

      {/* 1. Header Superior */}
      <header className="px-4 py-2 border-b border-calm-200 flex items-center justify-between bg-calm-50/90 shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExitModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-calm-700 hover:text-calm-900 hover:bg-calm-200/70 transition cursor-pointer text-xs font-medium"
            title="Voltar para Saúde e Ergonomia"
          >
            <ArrowLeft size={14} />
            <span>Voltar</span>
          </button>
          <div className="h-4 w-px bg-calm-300" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sage-100 text-sage-800 flex items-center justify-center">
              <Sparkles size={14} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-calm-900 leading-tight">
                Alongamento Guiado
              </h3>
              <p className="text-[10px] text-calm-500 leading-tight">
                Pausa ativa para relaxar ombros, costas e pescoço
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Controls: Score/Reps, Finish Button, Sound Toggle, Settings Gear */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5 px-2.5 py-1 rounded-lg bg-white border border-calm-200 text-[11px]">
            <div className="flex items-center gap-1">
              <span className="text-calm-500">Pontos:</span>
              <span className="font-bold text-sage-700 font-mono">{score}</span>
            </div>
            <div className="h-3 w-px bg-calm-200" />
            <div className="flex items-center gap-1">
              <span className="text-calm-500">Séries:</span>
              <span className="font-bold text-calm-900 font-mono">{reps}</span>
            </div>
          </div>

          {reps > 0 && (
            <Button
              size="sm"
              variant="primary"
              onClick={handleFinishSession}
              className="text-[11px] py-1 px-2.5 cursor-pointer"
            >
              <Award size={13} />
              <span>Concluir (+{sessionXpReward} XP)</span>
            </Button>
          )}

          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              soundEnabled
                ? 'bg-white border-calm-200 text-calm-700 hover:bg-calm-100'
                : 'bg-calm-100 border-calm-200 text-calm-400 hover:text-calm-700'
            }`}
            title={soundEnabled ? 'Desativar som' : 'Ativar som'}
            aria-label={soundEnabled ? 'Desativar som' : 'Ativar som'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Settings Gear Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(prev => !prev)}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isSettingsOpen
                ? 'bg-sage-600 border-sage-600 text-white'
                : 'bg-white border-calm-200 text-calm-700 hover:bg-calm-100'
            }`}
            title="Configurações do alongamento"
            aria-label="Configurações do alongamento"
          >
            <Settings size={15} />
          </button>
        </div>
      </header>

      {/* 2. Full-Width Camera Container */}
      <div className="flex-1 p-3 bg-calm-50/60 flex flex-col min-h-0 relative">
        <div className="relative flex-1 bg-slateMuted-900 rounded-xl border border-calm-200 overflow-hidden shadow-soft flex items-center justify-center">
          {/* Aspect-Ratio-Preserving Canvas */}
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full h-full object-contain block"
          />

          {/* Clean Overlay Layer: Only Calibration Step Card & Stretch Instructions */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
            {/* Top Area: Large Calibration Steps Card */}
            <div className="flex justify-center">
              {(sessionState === 'FRAMING' ||
                sessionState === 'TPOSE' ||
                sessionState === 'LOCKED') && (
                <div className="bg-slateMuted-900/90 backdrop-blur-xs border border-white/15 rounded-2xl px-5 py-3 max-w-md w-full text-center shadow-drawer">
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1 border ${
                      calibStepSuccess
                        ? 'bg-sage-500/20 text-sage-300 border-sage-400/40'
                        : 'bg-sand-500/20 text-sand-300 border-sand-400/40'
                    }`}
                  >
                    {calibStepBadge}
                  </span>
                  <h4 className="text-sm font-bold text-white">{calibTitle}</h4>
                  <p className="text-xs text-calm-300 leading-relaxed mt-0.5 mb-2.5">
                    {calibDesc}
                  </p>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sage-400 transition-all duration-100 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, calibProgress))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Center Hold Meter when holding position */}
            <div className="flex flex-col items-center justify-center my-auto">
              <div
                className={`bg-slateMuted-900/85 backdrop-blur-xs px-5 py-2.5 rounded-xl border border-white/15 flex flex-col items-center min-w-[210px] shadow-drawer transition-all duration-200 ${
                  isHoldingActive && sessionState === 'PLAYING'
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-2 scale-95'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider text-calm-300 font-semibold">
                  Mantenha a Posição
                </span>
                <span className="text-base font-extrabold text-sage-300 font-mono my-0.5">
                  {Math.max(0, DEFAULT_HOLD_TIME - holdDuration).toFixed(1)}s
                </span>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sage-400 rounded-full transition-all duration-75"
                    style={{ width: `${holdRatio * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Area: Instructions for the Current Stretch (only after calibration) */}
            <div className="flex justify-center">
              <div className="bg-slateMuted-900/85 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/10 max-w-lg w-full text-center shadow-soft">
                {sessionState === 'PLAYING' ? (
                  <>
                    <h4 className="text-xs font-bold text-sage-300">{activePose.name}</h4>
                    <p className="text-[11px] text-calm-200 leading-snug mt-0.5">
                      {activePose.desc}
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="text-xs font-bold text-sand-300">Calibrando sua câmera...</h4>
                    <p className="text-[11px] text-calm-300 leading-snug mt-0.5">
                      Siga as instruções acima para iniciarmos o seu alongamento.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Celebration Splash on Repetition Complete */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300 bg-sage-900/30 ${
              splashData.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
          >
            <div className="bg-slateMuted-900/95 border border-sage-400/40 px-6 py-3.5 rounded-2xl text-center shadow-drawer">
              <div className="text-lg font-extrabold text-white tracking-tight">
                Muito bem!
              </div>
              <div className="text-sm font-bold text-sage-300 mt-0.5">
                +{splashData.points} pontos
              </div>
            </div>
          </div>

          {/* Initial Loading or Camera Permission Overlay */}
          {(isInitializing || cameraError) && (
            <div className="absolute inset-0 z-10 bg-slateMuted-900/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
              {isInitializing ? (
                <>
                  <div className="w-11 h-11 rounded-full bg-sage-500/15 border border-sage-400/30 text-sage-300 flex items-center justify-center mb-3">
                    <RefreshCw size={20} className="animate-spin" />
                  </div>
                  <h2 className="text-sm font-bold text-white mb-1">Preparando sua sessão...</h2>
                  <p className="text-xs text-calm-300 max-w-xs leading-relaxed">
                    Aguarde um instante enquanto iniciamos a câmera para o seu alongamento.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-sm font-bold text-white mb-1">Câmera Indisponível</h2>
                  <p className="text-xs text-calm-300 max-w-xs leading-relaxed mb-4">
                    {cameraError}
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={activateCamera}
                    className="cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Tentar Novamente</span>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 3. Slide-Over Settings Sidebar (Opened via Gear Button) */}
        {isSettingsOpen && (
          <>
            <div
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 z-20 bg-calm-900/20 backdrop-blur-[1px]"
            />
            <aside className="absolute top-0 right-0 bottom-0 z-30 w-64 bg-white border-l border-calm-200 shadow-drawer flex flex-col overflow-hidden">
              {/* Fixed Settings Header */}
              <div className="px-3.5 py-2.5 border-b border-calm-200 bg-calm-50/90 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-calm-900">
                  <Settings size={14} className="text-sage-600" />
                  <span>Configurações</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 rounded-md text-calm-500 hover:text-calm-900 hover:bg-calm-200/60 transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Scrollable Settings Content */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 min-h-0">
                {/* Exercise Selection */}
                <Card variant="subtle" padding="sm" className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-calm-700 uppercase tracking-wider">
                    <Compass size={12} className="text-sage-600" />
                    <span>Tipo de Alongamento</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    {(Object.values(POSE_PRESETS) as PosePreset[]).map(preset => {
                      const isSelected = currentPresetKey === preset.id;
                      const IconComponent =
                        preset.id === 'diagonal'
                          ? ArrowUpLeft
                          : preset.id === 't_stretch'
                          ? MoveHorizontal
                          : preset.id === 'overhead'
                          ? ArrowUp
                          : RefreshCw;

                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => selectPose(preset.id)}
                          className={`w-full p-2 rounded-lg border text-left flex items-center gap-2 transition cursor-pointer ${
                            isSelected
                              ? 'bg-sage-50 border-sage-400 text-calm-900 shadow-soft'
                              : 'bg-white hover:bg-calm-50 border-calm-200 text-calm-700'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-sage-600 text-white' : 'bg-calm-100 text-calm-600'
                            }`}
                          >
                            <IconComponent size={13} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-semibold truncate">
                              {preset.shortName}
                            </div>
                            <div className="text-[9px] text-calm-500 truncate">{preset.sub}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                {/* Display Options: Mirror Camera, Show Skeleton (and Demo Mode only if enabled in code) */}
                <Card variant="subtle" padding="sm" className="space-y-2">
                  <span className="block text-[10px] font-bold text-calm-700 uppercase tracking-wider">
                    Exibição e Câmera
                  </span>

                  <div className="space-y-2 text-xs text-calm-800">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span>Espelhar câmera</span>
                      <input
                        type="checkbox"
                        checked={mirrorCamera}
                        onChange={e => handleMirrorToggle(e.target.checked)}
                        className="accent-sage-600 w-3.5 h-3.5 rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span>Mostrar esqueleto</span>
                      <input
                        type="checkbox"
                        checked={showSkeleton}
                        onChange={e => handleSkeletonToggle(e.target.checked)}
                        className="accent-sage-600 w-3.5 h-3.5 rounded cursor-pointer"
                      />
                    </label>

                    {ENABLE_DEMO_MODE && (
                      <label className="flex items-center justify-between cursor-pointer">
                        <span>Modo demonstração</span>
                        <input
                          type="checkbox"
                          checked={isDemoMode}
                          onChange={e => handleDemoToggle(e.target.checked)}
                          className="accent-sage-600 w-3.5 h-3.5 rounded cursor-pointer"
                        />
                      </label>
                    )}
                  </div>
                </Card>

                {/* Video Quality Selector (Low / Medium / High without exposing FPS numbers) */}
                <Card variant="subtle" padding="sm" className="space-y-2">
                  <span className="block text-[10px] font-bold text-calm-700 uppercase tracking-wider">
                    Qualidade do Vídeo
                  </span>
                  <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-calm-200">
                    {(
                      [
                        { key: 'low', label: 'Baixa' },
                        { key: 'medium', label: 'Média' },
                        { key: 'high', label: 'Alta' },
                      ] as const
                    ).map(opt => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleQualityChange(opt.key)}
                        className={`py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                          videoQuality === opt.key
                            ? 'bg-sage-600 text-white shadow-soft'
                            : 'text-calm-600 hover:text-calm-900 hover:bg-calm-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Fixed Footer Action */}
              <div className="p-3 border-t border-calm-200 bg-white shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    startCalibration();
                    setIsSettingsOpen(false);
                  }}
                  className="text-xs bg-white cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Recalibrar Posição</span>
                </Button>
              </div>
            </aside>
          </>
        )}
      </div>

      {/* 4. Modal de Resumo da Sessão e Concessão de XP */}
      {showSessionSummary && (
        <div className="absolute inset-0 z-20 bg-calm-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <Card
            variant="default"
            padding="md"
            className="w-full max-w-sm space-y-3 text-center shadow-drawer"
          >
            <div className="w-11 h-11 rounded-full bg-sage-100 border border-sage-200 text-sage-700 flex items-center justify-center mx-auto">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <h4 className="text-sm font-bold text-calm-900">Alongamento Concluído</h4>
              <p className="text-xs text-calm-500 mt-0.5">
                Sua pausa ativa foi registrada no seu progresso de Saúde.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-calm-50 p-2.5 rounded-xl border border-calm-200">
              <div>
                <span className="block text-[10px] text-calm-500">Séries</span>
                <span className="text-sm font-bold text-calm-900 font-mono">{reps}</span>
              </div>
              <div>
                <span className="block text-[10px] text-calm-500">Pontuação</span>
                <span className="text-sm font-bold text-calm-900 font-mono">{score} pts</span>
              </div>
              <div>
                <span className="block text-[10px] text-calm-500">Recompensa</span>
                <span className="text-sm font-bold text-sage-700 font-mono">
                  +{sessionXpReward} XP
                </span>
              </div>
            </div>

            <div className="space-y-1 text-left">
              <div className="flex justify-between text-[10px] text-calm-600">
                <span>Meta da Sessão</span>
                <span className="font-semibold">{Math.min(100, score)}%</span>
              </div>
              <ProgressBar value={Math.min(100, score)} max={100} color="sage" height="sm" />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => {
                  setShowSessionSummary(false);
                  setScore(0);
                  setReps(0);
                  setSessionClaimed(false);
                }}
                className="cursor-pointer"
              >
                Continuar Alongando
              </Button>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={handleExitModal}
                className="cursor-pointer"
              >
                Voltar à Saúde
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Modal>
  );
};

export default GuidedStretchModal;
