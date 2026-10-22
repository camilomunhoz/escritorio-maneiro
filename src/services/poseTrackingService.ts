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

export interface PosePreset {
  id: string;
  name: string;
  shortName: string;
  desc: string;
  alpha: number;
  beta: number;
  dirLeft: Point2D;
  dirRight: Point2D;
}

export const POSE_PRESETS: Record<string, PosePreset> = {
  diagonal: {
    id: 'diagonal',
    name: 'Alongamento Diagonal Superior (Y)',
    shortName: 'Diagonal Superior',
    desc: 'Estique ambos os braços para cima e para fora em diagonal (formato de Y).',
    alpha: 1.8,
    beta: 0.55,
    dirLeft: { x: -0.76, y: -0.65 },
    dirRight: { x: 0.76, y: -0.65 },
  },
  t_stretch: {
    id: 't_stretch',
    name: 'Abertura Lateral em T',
    shortName: 'Lateral em T',
    desc: 'Abra os braços horizontalmente nas laterais na altura dos ombros, expandindo o peitoral.',
    alpha: 2.15,
    beta: 0.08,
    dirLeft: { x: -1.0, y: -0.05 },
    dirRight: { x: 1.0, y: -0.05 },
  },
  overhead: {
    id: 'overhead',
    name: 'Elevação Vertical Alta',
    shortName: 'Vertical Alto',
    desc: 'Estique os braços para cima da cabeça, alongando toda a coluna e dorsais.',
    alpha: 0.9,
    beta: 1.15,
    dirLeft: { x: -0.22, y: -0.975 },
    dirRight: { x: 0.22, y: -0.975 },
  },
};

/**
 * Exponential Moving Average (EMA) Filter for Landmark coordinates
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

    // Teleport threshold check (jump > 35% of frame)
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
 * Filter manager for upper body landmarks
 */
export class BodyTrackingFilter {
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

  reset() {
    Object.values(this.filters).forEach(f => f.reset());
  }

  filterLandmarks(landmarks?: LandmarkPoint[]): FilteredLandmarks | null {
    if (!landmarks || landmarks.length < 17) {
      this.reset();
      return null;
    }

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

/**
 * Generates synthetic realistic landmarks for Demo / Simulation mode
 */
export function generateVirtualPose(
  sessionState: 'STOPPED' | 'FRAMING' | 'TPOSE' | 'LOCKED' | 'PLAYING',
  time: number,
  fixedTargets: FixedTargets | null,
  canvasWidth = 720,
  canvasHeight = 460
): { landmarks: LandmarkPoint[]; worldLandmarks: LandmarkPoint[] } {
  const fakeLandmarks: LandmarkPoint[] = new Array(33).fill(null).map(() => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0.99,
  }));

  fakeLandmarks[11] = { x: 0.6, y: 0.42, z: 0, visibility: 0.99 }; // Left shoulder
  fakeLandmarks[12] = { x: 0.4, y: 0.42, z: 0, visibility: 0.99 }; // Right shoulder
  fakeLandmarks[23] = { x: 0.56, y: 0.74, z: 0, visibility: 0.99 }; // Left hip
  fakeLandmarks[24] = { x: 0.44, y: 0.74, z: 0, visibility: 0.99 }; // Right hip

  let curLeftWristX = 0.62;
  let curLeftWristY = 0.68;
  let curRightWristX = 0.38;
  let curRightWristY = 0.68;

  if (sessionState === 'FRAMING') {
    // Relaxed arms near hips
    curLeftWristX = 0.62;
    curLeftWristY = 0.68;
    curRightWristX = 0.38;
    curRightWristY = 0.68;
  } else if (sessionState === 'TPOSE') {
    // Horizontal T-Pose (mirrored: left wrist at raw x=0.82, right wrist at raw x=0.18)
    curLeftWristX = 0.82;
    curLeftWristY = 0.42;
    curRightWristX = 0.18;
    curRightWristY = 0.42;
  } else {
    // LOCKED or PLAYING: stretch towards static fixed targets
    let targetLeftRaw = { x: 0.78, y: 0.24 };
    let targetRightRaw = { x: 0.22, y: 0.24 };

    if (fixedTargets) {
      targetLeftRaw = {
        x: 1 - fixedTargets.left.x / canvasWidth,
        y: fixedTargets.left.y / canvasHeight,
      };
      targetRightRaw = {
        x: 1 - fixedTargets.right.x / canvasWidth,
        y: fixedTargets.right.y / canvasHeight,
      };
    }

    // 6.5s smooth stretching cycle
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
  const leftElbowX = 0.6 + (curLeftWristX - 0.6) * 0.52;
  const leftElbowY = 0.42 + (curLeftWristY - 0.42) * 0.52;
  const rightElbowX = 0.4 + (curRightWristX - 0.4) * 0.52;
  const rightElbowY = 0.42 + (curRightWristY - 0.42) * 0.52;

  fakeLandmarks[13] = { x: leftElbowX, y: leftElbowY, z: 0, visibility: 0.99 };
  fakeLandmarks[14] = { x: rightElbowX, y: rightElbowY, z: 0, visibility: 0.99 };
  fakeLandmarks[15] = { x: curLeftWristX, y: curLeftWristY, z: 0, visibility: 0.99 };
  fakeLandmarks[16] = { x: curRightWristX, y: curRightWristY, z: 0, visibility: 0.99 };

  // World landmarks (metric simulation)
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
