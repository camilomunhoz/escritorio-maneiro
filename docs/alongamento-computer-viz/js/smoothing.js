/**
 * Exponential Moving Average (EMA) Filter for Landmark coordinates
 * Helps eliminate camera jitter while maintaining responsive tracking.
 */
export class PointFilterEMA {
  constructor(alpha = 0.65) {
    this.alpha = alpha;
    this.value = null;
  }

  setAlpha(alpha) {
    this.alpha = Math.max(0.05, Math.min(1.0, alpha));
  }

  reset() {
    this.value = null;
  }

  filter(point) {
    if (!point || point.x === undefined || point.y === undefined) {
      this.reset();
      return null;
    }

    if (!this.value) {
      this.value = { x: point.x, y: point.y };
      return { ...this.value };
    }

    // Check for sudden teleport / lost tracking reset threshold
    const distSq = (point.x - this.value.x) ** 2 + (point.y - this.value.y) ** 2;
    // If distance jumped by more than 35% of frame, snap directly to avoid dragging lag
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
  constructor(alpha = 0.65) {
    this.alpha = alpha;
    this.filters = {
      leftShoulder: new PointFilterEMA(alpha),
      rightShoulder: new PointFilterEMA(alpha),
      leftWrist: new PointFilterEMA(alpha),
      rightWrist: new PointFilterEMA(alpha),
      leftElbow: new PointFilterEMA(alpha),
      rightElbow: new PointFilterEMA(alpha),
      leftHip: new PointFilterEMA(alpha),
      rightHip: new PointFilterEMA(alpha)
    };
  }

  setAlpha(alpha) {
    this.alpha = alpha;
    for (const key in this.filters) {
      this.filters[key].setAlpha(alpha);
    }
  }

  reset() {
    for (const key in this.filters) {
      this.filters[key].reset();
    }
  }

  filterLandmarks(landmarks) {
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
      raw: landmarks
    };
  }
}
