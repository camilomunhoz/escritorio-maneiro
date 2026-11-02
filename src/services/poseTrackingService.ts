export interface Point2D {
  x: number;
  y: number;
}

export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface FilteredLandmarks {
  leftShoulder: Point2D | null;
  rightShoulder: Point2D | null;
  leftElbow: Point2D | null;
  rightElbow: Point2D | null;
  leftWrist: Point2D | null;
  rightWrist: Point2D | null;
  leftHip: Point2D | null;
  rightHip: Point2D | null;
  raw: LandmarkPoint[];
}

export interface CalibratedAnatomicalData {
  armLenL: number;
  armLenR: number;
  shoulderWidth: number;
  shoulderL: Point2D;
  shoulderR: Point2D;
  torsoCenter: Point2D;
  worldArmL: number; // in meters (e.g. 0.68)
  worldArmR: number;
  worldWingspan: number; // in meters (e.g. 1.72)
}

export interface FixedTargets {
  left: Point2D;
  right: Point2D;
  radius: number;
}

export type PosePresetKey = 'diagonal' | 't_stretch' | 'overhead' | 'dynamic_auto';

export interface PosePreset {
  id: PosePresetKey;
  name: string;
  shortName: string;
  sub: string;
  desc: string;
  alpha: number;
  beta: number;
  dirLeft: Point2D;
  dirRight: Point2D;
  isAuto?: boolean;
}

export const POSE_PRESETS: Record<PosePresetKey, PosePreset> = {
  dynamic_auto: {
    id: 'dynamic_auto',
    name: 'Treino Dinâmico',
    shortName: 'Treino Dinâmico',
    sub: 'Alterna os movimentos a cada repetição',
    desc: 'Estique os braços até os círculos na tela. A cada série concluída, um novo movimento começa.',
    alpha: 1.8,
    beta: 0.55,
    dirLeft: { x: -0.76, y: -0.65 },
    dirRight: { x: 0.76, y: -0.65 },
    isAuto: true,
  },
  diagonal: {
    id: 'diagonal',
    name: 'Alcance Diagonal',
    shortName: 'Alcance Diagonal',
    sub: 'Alivia a tensão do peito e das costas',
    desc: 'Estique os dois braços para cima e para fora, em direção aos círculos na tela.',
    alpha: 1.8,
    beta: 0.55,
    dirLeft: { x: -0.76, y: -0.65 },
    dirRight: { x: 0.76, y: -0.65 },
  },
  t_stretch: {
    id: 't_stretch',
    name: 'Abertura Lateral',
    shortName: 'Abertura Lateral',
    sub: 'Abre o peito e relaxa os ombros',
    desc: 'Abra os dois braços para os lados, na altura dos ombros, até alcançar os círculos.',
    alpha: 2.15,
    beta: 0.08,
    dirLeft: { x: -1.0, y: -0.05 },
    dirRight: { x: 1.0, y: -0.05 },
  },
  overhead: {
    id: 'overhead',
    name: 'Alcance no Alto',
    shortName: 'Alcance no Alto',
    sub: 'Alonga os braços e toda a coluna',
    desc: 'Levante os dois braços acima da cabeça até tocar os círculos iluminados.',
    alpha: 0.9,
    beta: 1.15,
    dirLeft: { x: -0.22, y: -0.975 },
    dirRight: { x: 0.22, y: -0.975 },
  },
};

export const AUTO_CYCLE_POSES: Array<'diagonal' | 't_stretch' | 'overhead'> = [
  'diagonal',
  't_stretch',
  'overhead',
];

/**
 * Exponential Moving Average (EMA) Filter for Landmark coordinates
 * Eliminates camera jitter while maintaining responsive tracking.
 */
export class PointFilterEMA {
  private alpha: number;
  private value: Point2D | null = null;

  constructor(alpha = 0.65) {
    this.alpha = alpha;
  }

  setAlpha(alpha: number) {
    this.alpha = Math.max(0.05, Math.min(1.0, alpha));
  }

  reset() {
    this.value = null;
  }

  filter(point?: LandmarkPoint | null): Point2D | null {
    if (!point || point.x === undefined || point.y === undefined) {
      this.reset();
      return null;
    }

    if (!this.value) {
      this.value = { x: point.x, y: point.y };
      return { ...this.value };
    }

    // Teleport threshold check (if distance jumped by more than 35% of frame, snap directly)
    const distSq = (point.x - this.value.x) ** 2 + (point.y - this.value.y) ** 2;
    if (distSq > 0.12) {
      this.value = { x: point.x, y: point.y };
      return { ...this.value };
    }

    // EMA formula: y[t] = alpha * x[t] + (1 - alpha) * y[t-1]
    this.value.x = this.alpha * point.x + (1 - this.alpha) * this.value.x;
    this.value.y = this.alpha * point.y + (1 - this.alpha) * this.value.y;

    return { x: this.value.x, y: this.value.y };
  }
}

/**
 * Filter manager for key upper body landmarks
 */
export class BodyTrackingFilter {
  private alpha: number;
  private filters: {
    leftShoulder: PointFilterEMA;
    rightShoulder: PointFilterEMA;
    leftElbow: PointFilterEMA;
    rightElbow: PointFilterEMA;
    leftWrist: PointFilterEMA;
    rightWrist: PointFilterEMA;
    leftHip: PointFilterEMA;
    rightHip: PointFilterEMA;
  };

  constructor(alpha = 0.65) {
    this.alpha = alpha;
    this.filters = {
      leftShoulder: new PointFilterEMA(alpha),
      rightShoulder: new PointFilterEMA(alpha),
      leftElbow: new PointFilterEMA(alpha),
      rightElbow: new PointFilterEMA(alpha),
      leftWrist: new PointFilterEMA(alpha),
      rightWrist: new PointFilterEMA(alpha),
      leftHip: new PointFilterEMA(alpha),
      rightHip: new PointFilterEMA(alpha),
    };
  }

  setAlpha(alpha: number) {
    this.alpha = alpha;
    Object.values(this.filters).forEach(f => f.setAlpha(alpha));
  }

  getAlpha(): number {
    return this.alpha;
  }

  reset() {
    Object.values(this.filters).forEach(f => f.reset());
  }

  filterLandmarks(landmarks?: LandmarkPoint[]): FilteredLandmarks | null {
    if (!landmarks || landmarks.length < 17) {
      this.reset();
      return null;
    }

    // Left Shoulder: 11, Right Shoulder: 12
    // Left Elbow: 13, Right Elbow: 14
    // Left Wrist: 15, Right Wrist: 16
    // Left Hip: 23, Right Hip: 24
    const hasHips = landmarks.length > 24;
    return {
      leftShoulder: this.filters.leftShoulder.filter(landmarks[11]),
      rightShoulder: this.filters.rightShoulder.filter(landmarks[12]),
      leftElbow: this.filters.leftElbow.filter(landmarks[13]),
      rightElbow: this.filters.rightElbow.filter(landmarks[14]),
      leftWrist: this.filters.leftWrist.filter(landmarks[15]),
      rightWrist: this.filters.rightWrist.filter(landmarks[16]),
      leftHip: hasHips ? this.filters.leftHip.filter(landmarks[23]) : null,
      rightHip: hasHips ? this.filters.rightHip.filter(landmarks[24]) : null,
      raw: landmarks,
    };
  }
}

export interface PoseDetectionResult {
  landmarks?: LandmarkPoint[][];
  worldLandmarks?: LandmarkPoint[][];
}

export interface MediaPipePoseLandmarker {
  detectForVideo: (video: HTMLVideoElement, timestamp: number) => PoseDetectionResult;
  close?: () => void;
}

interface MediaPipeVisionModule {
  FilesetResolver: {
    forVisionTasks: (wasmPath: string) => Promise<unknown>;
  };
  PoseLandmarker: {
    createFromOptions: (vision: unknown, options: Record<string, unknown>) => Promise<MediaPipePoseLandmarker>;
  };
}

/**
 * Initializes MediaPipe PoseLandmarker via CDN WebAssembly with GPU -> CPU fallback
 */
export async function createMediaPipePoseLandmarker(): Promise<MediaPipePoseLandmarker> {
  const cdnUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest';
  const visionModule = (await import(/* @vite-ignore */ cdnUrl)) as unknown as MediaPipeVisionModule;

  const vision = await visionModule.FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  const modelAssetPath =
    'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

  try {
    return await visionModule.PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    });
  } catch {
    return await visionModule.PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath,
        delegate: 'CPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    });
  }
}

/**
 * Generates realistic simulated landmarks with proper framing, T-Pose and locked targets
 */
export function generateVirtualPose(
  sessionState: 'STOPPED' | 'FRAMING' | 'TPOSE' | 'LOCKED' | 'PLAYING',
  time: number,
  fixedTargets: FixedTargets | null,
  canvasWidth = 510,
  canvasHeight = 460,
  mirrorCamera = true
): { landmarks: LandmarkPoint[]; worldLandmarks: LandmarkPoint[] } {
  const fakeLandmarks: LandmarkPoint[] = new Array(33).fill(null).map(() => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0.99,
  }));

  fakeLandmarks[11] = { x: 0.60, y: 0.42, z: 0, visibility: 0.99 }; // Left shoulder
  fakeLandmarks[12] = { x: 0.40, y: 0.42, z: 0, visibility: 0.99 }; // Right shoulder
  fakeLandmarks[23] = { x: 0.56, y: 0.74, z: 0, visibility: 0.99 }; // Left hip
  fakeLandmarks[24] = { x: 0.44, y: 0.74, z: 0, visibility: 0.99 }; // Right hip

  let curLeftWristX = 0.62;
  let curLeftWristY = 0.68;
  let curRightWristX = 0.38;
  let curRightWristY = 0.68;

  if (sessionState === 'FRAMING') {
    // Arms resting relaxed near hips
    curLeftWristX = 0.62;
    curLeftWristY = 0.68;
    curRightWristX = 0.38;
    curRightWristY = 0.68;
  } else if (sessionState === 'TPOSE') {
    // Horizontal T-Pose (mirrored: left wrist is at raw x=0.82, right wrist at raw x=0.18)
    curLeftWristX = 0.82;
    curLeftWristY = 0.42;
    curRightWristX = 0.18;
    curRightWristY = 0.42;
  } else {
    // LOCKED or PLAYING: stretch into static targets
    let targetLeftRaw = { x: 0.78, y: 0.24 };
    let targetRightRaw = { x: 0.22, y: 0.24 };

    if (fixedTargets) {
      targetLeftRaw = {
        x: mirrorCamera ? 1 - fixedTargets.left.x / canvasWidth : fixedTargets.left.x / canvasWidth,
        y: fixedTargets.left.y / canvasHeight,
      };
      targetRightRaw = {
        x: mirrorCamera ? 1 - fixedTargets.right.x / canvasWidth : fixedTargets.right.x / canvasWidth,
        y: fixedTargets.right.y / canvasHeight,
      };
    }

    // 6.5s cycle for stretching
    const cycle = time % 6.5;
    let reach = 0;
    if (cycle < 1.5) reach = cycle / 1.5;
    else if (cycle < 4.8) reach = 1.0;
    else reach = 1.0 - (cycle - 4.8) / 1.7;
    reach = reach * reach * (3 - 2 * reach);

    const restL = { x: 0.62, y: 0.68 };
    const restR = { x: 0.38, y: 0.68 };

    curLeftWristX = restL.x + (targetLeftRaw.x - restL.x) * reach;
    curLeftWristY = restL.y + (targetLeftRaw.y - restL.y) * reach;

    curRightWristX = restR.x + (targetRightRaw.x - restR.x) * reach;
    curRightWristY = restR.y + (targetRightRaw.y - restR.y) * reach;
  }

  // Elbows halfway between shoulder and wrist
  const leftElbowX = 0.60 + (curLeftWristX - 0.60) * 0.52;
  const leftElbowY = 0.42 + (curLeftWristY - 0.42) * 0.52;
  const rightElbowX = 0.40 + (curRightWristX - 0.40) * 0.52;
  const rightElbowY = 0.42 + (curRightWristY - 0.42) * 0.52;

  fakeLandmarks[13] = { x: leftElbowX, y: leftElbowY, z: 0, visibility: 0.99 };
  fakeLandmarks[14] = { x: rightElbowX, y: rightElbowY, z: 0, visibility: 0.99 };
  fakeLandmarks[15] = { x: curLeftWristX, y: curLeftWristY, z: 0, visibility: 0.99 };
  fakeLandmarks[16] = { x: curRightWristX, y: curRightWristY, z: 0, visibility: 0.99 };

  // Simulated metric world landmarks (arm length 0.68m, wingspan 1.72m)
  const fakeWorld: LandmarkPoint[] = new Array(33).fill(null).map(() => ({ x: 0, y: 0, z: 0 }));
  fakeWorld[11] = { x: 0.18, y: -0.25, z: 0 };
  fakeWorld[12] = { x: -0.18, y: -0.25, z: 0 };
  fakeWorld[13] = { x: 0.45, y: -0.25, z: 0 };
  fakeWorld[14] = { x: -0.45, y: -0.25, z: 0 };
  fakeWorld[15] = { x: 0.72, y: -0.25, z: 0 };
  fakeWorld[16] = { x: -0.72, y: -0.25, z: 0 };
  fakeWorld[23] = { x: 0.12, y: 0.25, z: 0 };
  fakeWorld[24] = { x: -0.12, y: 0.25, z: 0 };

  return { landmarks: fakeLandmarks, worldLandmarks: fakeWorld };
}
