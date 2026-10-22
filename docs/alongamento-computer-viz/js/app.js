import { FilesetResolver, PoseLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";
import { soundEffects } from "./audio.js";
import { BodyTrackingFilter } from "./smoothing.js";
import { POSE_PRESETS, AUTO_CYCLE_POSES } from "./poses.js";

class StretchingGuideApp {
  constructor() {
    // DOM Elements
    this.video = document.getElementById('webcam');
    this.canvas = document.getElementById('output_canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // HUD Elements
    this.statusPill = document.getElementById('status_pill');
    this.statusText = document.getElementById('status_text');
    this.bodyStatusBadge = document.getElementById('body_status_badge');
    this.poseBadge = document.getElementById('pose_badge');
    this.calibStatusBadge = document.getElementById('calib_status_badge');
    this.hudRecalibBtn = document.getElementById('hud_recalib_btn');
    this.sidebarRecalibBtn = document.getElementById('sidebar_recalib_btn');
    this.scoreVal = document.getElementById('score_val');
    this.repsVal = document.getElementById('reps_val');
    this.fpsVal = document.getElementById('fps_val');
    this.holdMeterBox = document.getElementById('hold_meter_box');
    this.holdTimer = document.getElementById('hold_timer');
    this.holdFill = document.getElementById('hold_fill');
    this.guideTitle = document.getElementById('guide_title');
    this.guideDesc = document.getElementById('guide_desc');
    this.feedbackSplash = document.getElementById('feedback_splash');

    // Calibration Modal Elements
    this.calibModal = document.getElementById('calib_modal');
    this.calibStepBadge = document.getElementById('calib_step_badge');
    this.calibTitle = document.getElementById('calib_title');
    this.calibDesc = document.getElementById('calib_desc');
    this.calibProgressFill = document.getElementById('calib_progress_fill');
    this.calibMetricsTags = document.getElementById('calib_metrics_tags');
    this.metricArmLeft = document.getElementById('metric_arm_left');
    this.metricArmRight = document.getElementById('metric_arm_right');
    this.metricWingspan = document.getElementById('metric_wingspan');
    
    // Overlay & Controls
    this.stateOverlay = document.getElementById('state_overlay');
    this.overlayIcon = document.getElementById('overlay_icon');
    this.overlayTitle = document.getElementById('overlay_title');
    this.overlayDesc = document.getElementById('overlay_desc');
    this.overlaySpinner = document.getElementById('overlay_spinner');
    this.startBtn = document.getElementById('start_btn');
    this.demoBtn = document.getElementById('demo_btn');
    this.toggleCamBtn = document.getElementById('toggle_cam_btn');
    this.camBtnLabel = document.getElementById('cam_btn_label');
    this.toggleDemoBtn = document.getElementById('toggle_demo_btn');
    this.demoBtnLabel = document.getElementById('demo_btn_label');
    this.toastContainer = document.getElementById('toast_container');
    
    // Settings Controls
    this.difficultySlider = document.getElementById('difficulty_slider');
    this.difficultyDisplay = document.getElementById('difficulty_display');
    this.holdTimeSlider = document.getElementById('hold_time_slider');
    this.holdTimeDisplay = document.getElementById('hold_time_display');
    this.targetSizeSlider = document.getElementById('target_size_slider');
    this.targetSizeDisplay = document.getElementById('target_size_display');
    this.emaSlider = document.getElementById('ema_slider');
    this.emaValDisplay = document.getElementById('ema_val_display');
    this.soundToggle = document.getElementById('sound_toggle');
    this.mirrorToggle = document.getElementById('mirror_toggle');
    this.skeletonToggle = document.getElementById('skeleton_toggle');
    this.resetScoreBtn = document.getElementById('reset_score_btn');
    this.poseSelector = document.getElementById('pose_selector');
    
    // State Machine: 'STOPPED', 'FRAMING', 'TPOSE', 'LOCKED', 'PLAYING'
    this.sessionState = 'STOPPED';
    this.poseLandmarker = null;
    this.isCameraRunning = false;
    this.isDemoMode = false;
    this.demoTime = 0;
    this.mediaStream = null;
    this.lastVideoTime = -1;
    this.animationFrameId = null;

    // Calibration Anatomical State
    this.difficultyFactor = 0.95; // Difficulty extension factor
    this.framingStableDuration = 0; // seconds stable in frame (goal: 0.6s)
    this.tposeHoldDuration = 0; // seconds holding T-pose (goal: 2.0s)
    this.lastTPoseTickProgress = 0;
    this.calibrationSamples = [];
    this.calibratedData = null; // { armLenL, armLenR, shoulderL, shoulderR, shoulderWidth, worldArmL, worldArmR, worldWingspan }
    this.fixedTargets = null; // { left: {x,y}, right: {x,y}, radius }
    
    // Metrics & Gamification
    this.score = 0;
    this.reps = 0;
    this.holdDuration = 0;
    this.requiredHoldTime = 3.0; // seconds
    this.targetSizeRatio = 0.20; // ratio of shoulder width
    this.isBothWristsInTarget = false;
    this.lastHoldSecondTicked = 0;
    this.splashTimeout = null;
    
    // Performance & FPS
    this.lastFrameTimestamp = performance.now();
    this.fpsHistory = [];
    
    // Tracking & Filtering
    this.bodyFilter = new BodyTrackingFilter(0.65);
    
    // Pose Management
    this.currentPresetKey = 'diagonal';
    this.currentPose = POSE_PRESETS.diagonal;
    this.autoPoseIndex = 0;
    
    // Options
    this.mirrorCamera = true;
    this.showSkeleton = true;
    
    this._bindEvents();
    this._initMediaPipe();
  }

  _bindEvents() {
    this.startBtn.addEventListener('click', () => this.startCamera());
    this.demoBtn?.addEventListener('click', () => this.startDemoMode());
    this.toggleCamBtn.addEventListener('click', () => this.toggleCamera());
    this.toggleDemoBtn?.addEventListener('click', () => this.toggleDemoMode());

    // Pose selection cards
    this.poseSelector.addEventListener('click', (e) => {
      const card = e.target.closest('.pose-card');
      if (!card) return;
      const poseKey = card.dataset.pose;
      this.selectPose(poseKey);
    });

    // Difficulty Factor slider
    this.difficultySlider?.addEventListener('input', (e) => {
      this.difficultyFactor = parseFloat(e.target.value);
      let desc = 'Moderado';
      if (this.difficultyFactor <= 0.88) desc = 'Alongamento Suave';
      else if (this.difficultyFactor >= 1.05) desc = 'Extensão de Tronco (Desafio)';
      else if (this.difficultyFactor >= 1.0) desc = 'Extensão Total';
      this.difficultyDisplay.textContent = `${this.difficultyFactor.toFixed(2)} (${desc})`;

      // Immediately update static targets if already calibrated
      if (this.calibratedData) {
        this._updateFixedTargetsForCurrentPose();
      }
    });

    // Recalibrate buttons
    this.hudRecalibBtn?.addEventListener('click', () => {
      this.startCalibration();
    });
    this.sidebarRecalibBtn?.addEventListener('click', () => {
      this.startCalibration();
    });

    // Hold time slider
    this.holdTimeSlider.addEventListener('input', (e) => {
      this.requiredHoldTime = parseFloat(e.target.value);
      this.holdTimeDisplay.textContent = `${this.requiredHoldTime.toFixed(1)}s`;
    });

    // Target size slider
    this.targetSizeSlider.addEventListener('input', (e) => {
      this.targetSizeRatio = parseFloat(e.target.value);
      let label = 'Médio';
      if (this.targetSizeRatio <= 0.14) label = 'Pequeno (Desafio)';
      else if (this.targetSizeRatio >= 0.26) label = 'Grande (Fácil)';
      this.targetSizeDisplay.textContent = label;
    });

    // EMA smoothing slider
    this.emaSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.bodyFilter.setAlpha(val);
      this.emaValDisplay.textContent = val.toFixed(2);
    });

    // Toggles
    this.soundToggle.addEventListener('change', (e) => {
      soundEffects.setEnabled(e.target.checked);
    });

    this.mirrorToggle.addEventListener('change', (e) => {
      this.mirrorCamera = e.target.checked;
    });

    this.skeletonToggle.addEventListener('change', (e) => {
      this.showSkeleton = e.target.checked;
    });

    this.resetScoreBtn.addEventListener('click', () => {
      this.score = 0;
      this.reps = 0;
      this.scoreVal.textContent = '0';
      this.repsVal.textContent = '0';
      this.showToast('Pontuação reiniciada!');
    });

    // Handle window resize for canvas sizing
    window.addEventListener('resize', () => this._syncCanvasSize());
  }

  showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3500);
  }

  selectPose(poseKey) {
    if (!POSE_PRESETS[poseKey]) return;
    this.currentPresetKey = poseKey;

    if (poseKey === 'dynamic_auto') {
      this.autoPoseIndex = 0;
      const actualKey = AUTO_CYCLE_POSES[this.autoPoseIndex];
      this.currentPose = { ...POSE_PRESETS[actualKey], isAuto: true };
    } else {
      this.currentPose = POSE_PRESETS[poseKey];
    }

    // Update UI highlights
    const cards = this.poseSelector.querySelectorAll('.pose-card');
    cards.forEach(c => {
      c.classList.toggle('active', c.dataset.pose === poseKey);
    });

    this.poseBadge.textContent = this.currentPose.shortName;
    this.guideTitle.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
      ${this.currentPose.name}
    `;
    this.guideDesc.textContent = this.currentPose.desc;

    // Update fixed static targets if calibrated
    if (this.calibratedData) {
      this._updateFixedTargetsForCurrentPose();
    }

    // Reset hold progress
    this.holdDuration = 0;
    this._updateHoldMeterUI(0);
  }

  _advanceAutoPose() {
    if (this.currentPresetKey !== 'dynamic_auto') return;
    this.autoPoseIndex = (this.autoPoseIndex + 1) % AUTO_CYCLE_POSES.length;
    const nextKey = AUTO_CYCLE_POSES[this.autoPoseIndex];
    this.currentPose = { ...POSE_PRESETS[nextKey], isAuto: true };

    this.poseBadge.textContent = `Auto: ${this.currentPose.shortName}`;
    this.guideTitle.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
      ${this.currentPose.name}
    `;
    this.guideDesc.textContent = this.currentPose.desc;

    if (this.calibratedData) {
      this._updateFixedTargetsForCurrentPose();
    }
    this.showToast(`Próxima postura: ${this.currentPose.shortName}`);
  }

  async _initMediaPipe() {
    try {
      this.overlayTitle.textContent = "Carregando Vision Tasks...";
      this.overlayDesc.textContent = "Baixando binários WebAssembly e inicializando acelerador GPU...";

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const modelAssetPath = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

      try {
        this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
      } catch (gpuErr) {
        console.warn("GPU delegate falhou, alternando para CPU:", gpuErr);
        this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath,
            delegate: "CPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
      }

      // Ready state
      this.overlaySpinner.style.display = "none";
      this.overlayTitle.textContent = "Pronto para Alongar!";
      this.overlayDesc.textContent = "Modelo de pose carregado. Ative sua webcam ou use o modo simulação para iniciar.";
      this.startBtn.style.display = "inline-flex";
      if (this.demoBtn) this.demoBtn.style.display = "inline-flex";
      this.toggleCamBtn.disabled = false;
      this.showToast("MediaPipe Pose carregado com sucesso!");
    } catch (err) {
      console.error("Erro ao inicializar MediaPipe:", err);
      this.overlaySpinner.style.display = "none";
      this.overlayTitle.textContent = "Falha ao Carregar Modelo";
      this.overlayDesc.textContent = `Não foi possível carregar os módulos de IA: ${err.message}. Você ainda pode testar o sistema no modo Simulação.`;
      if (this.demoBtn) this.demoBtn.style.display = "inline-flex";
      this.showToast("Erro ao carregar modelo de visão", true);
    }
  }

  async startCamera() {
    if (this.isDemoMode) {
      this.stopDemoMode();
    }

    if (!this.poseLandmarker) {
      this.showToast("O modelo de visão ainda não foi inicializado", true);
      return;
    }

    try {
      this.overlayTitle.textContent = "Solicitando Câmera...";
      this.overlayDesc.textContent = "Conceda permissão de acesso à webcam no prompt do navegador.";
      this.overlaySpinner.style.display = "block";
      this.startBtn.style.display = "none";

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.mediaStream;
      
      await new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play().then(resolve);
        };
      });

      this._syncCanvasSize();
      this.isCameraRunning = true;
      
      // Update UI state
      this.stateOverlay.classList.add('hidden');
      this.toggleCamBtn.classList.add('stop');
      this.toggleCamBtn.disabled = false;
      this.camBtnLabel.textContent = "Pausar Exercício";

      // Start Anatomical Calibration flow
      this.startCalibration();

      // Start inference render loop
      this.lastFrameTimestamp = performance.now();
      this._renderLoop();
      this.showToast("Câmera conectada com sucesso!");
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      this.overlaySpinner.style.display = "none";
      this.stateOverlay.classList.remove('hidden');

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.overlayTitle.textContent = "Permissão da Câmera Negada";
        this.overlayDesc.textContent = "Você bloqueou o acesso à câmera. Por favor, libere a permissão no ícone de cadeado na barra de endereços do seu navegador e tente novamente.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        this.overlayTitle.textContent = "Nenhuma Câmera Encontrada";
        this.overlayDesc.textContent = "Não encontramos nenhum dispositivo de captura de vídeo conectado ao computador.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        this.overlayTitle.textContent = "Câmera em Uso";
        this.overlayDesc.textContent = "A câmera pode estar sendo usada por outro aplicativo (como Zoom, Teams ou Meet). Feche-o e tente novamente.";
      } else {
        this.overlayTitle.textContent = "Erro na Câmera";
        this.overlayDesc.textContent = `Falha ao iniciar vídeo: ${err.message || err.name}`;
      }

      this.startBtn.textContent = "Tentar Novamente";
      this.startBtn.style.display = "inline-flex";
      this.showToast("Falha ao acessar a câmera", true);
    }
  }

  stopCamera() {
    this.isCameraRunning = false;
    this.sessionState = 'STOPPED';
    this.calibModal?.classList.add('hidden');

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.video.srcObject = null;
    this.bodyFilter.reset();

    this.toggleCamBtn.classList.remove('stop');
    this.camBtnLabel.textContent = "Iniciar Exercício";
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Show overlay
    this.stateOverlay.classList.remove('hidden');
    this.overlaySpinner.style.display = "none";
    this.overlayTitle.textContent = "Exercício Pausado";
    this.overlayDesc.textContent = "A câmera foi desligada. Clique no botão abaixo quando quiser retomar seus alongamentos.";
    this.startBtn.style.display = "inline-flex";
    this.startBtn.textContent = "Retomar Câmera";

    this._updateStatus('waiting', 'Câmera desligada');
    this.bodyStatusBadge.textContent = 'Câmera desligada';
    this.fpsVal.textContent = '--';
  }

  toggleCamera() {
    if (this.isCameraRunning) {
      this.stopCamera();
    } else {
      this.startCamera();
    }
  }

  startCalibration() {
    this.sessionState = 'FRAMING';
    this.framingStableDuration = 0;
    this.tposeHoldDuration = 0;
    this.lastTPoseTickProgress = 0;
    this.calibrationSamples = [];
    this.fixedTargets = null;
    this.holdDuration = 0;
    this._updateHoldMeterUI(0);

    if (this.calibStatusBadge) {
      this.calibStatusBadge.textContent = 'Calibrando (Passo 1/2)';
      this.calibStatusBadge.style.color = '#f59e0b';
    }

    if (this.calibModal) {
      this.calibModal.classList.remove('hidden');
      this.calibStepBadge.className = 'calib-step-badge warning';
      this.calibStepBadge.textContent = 'Passo 1: Verificação de Enquadramento';
      this.calibTitle.textContent = 'Enquadre o tronco e quadris';
      this.calibDesc.textContent = 'Dê alguns passos para trás até que seus ombros e quadris fiquem visíveis no quadro.';
      this.calibProgressFill.style.width = '0%';
      this.calibMetricsTags.style.display = 'none';
    }

    this._updateStatus('framing', 'Passo 1: Dê passos para trás para enquadrar ombros e quadris');
    this.showToast('Iniciando calibração anatômica...');
  }

  startDemoMode() {
    if (this.isCameraRunning) {
      this.stopCamera();
    }

    this.isDemoMode = true;
    this.demoTime = 0;
    this.canvas.width = 1280;
    this.canvas.height = 720;

    this.stateOverlay.classList.add('hidden');
    if (this.demoBtnLabel) this.demoBtnLabel.textContent = "Sair da Simulação";
    this.toggleCamBtn.classList.remove('stop');
    this.camBtnLabel.textContent = "Usar Câmera Real";
    this.bodyStatusBadge.textContent = "Avatar Virtual";

    this.startCalibration();

    this.lastFrameTimestamp = performance.now();
    if (!this.animationFrameId) {
      this._renderLoop();
    }
    this.showToast("Modo Simulação com Calibração iniciado!");
  }

  stopDemoMode() {
    this.isDemoMode = false;
    this.sessionState = 'STOPPED';
    this.calibModal?.classList.add('hidden');
    if (this.demoBtnLabel) this.demoBtnLabel.textContent = "Modo Demonstração (Sem Câmera)";
    this.camBtnLabel.textContent = "Iniciar Exercício";

    if (this.animationFrameId && !this.isCameraRunning) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.bodyFilter.reset();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.stateOverlay.classList.remove('hidden');
    this._updateStatus('waiting', 'Simulação pausada');
    this.bodyStatusBadge.textContent = "Simulação pausada";
    this.fpsVal.textContent = '--';
  }

  toggleDemoMode() {
    if (this.isDemoMode) {
      this.stopDemoMode();
    } else {
      this.startDemoMode();
    }
  }

  _syncCanvasSize() {
    if (this.isDemoMode) {
      this.canvas.width = 1280;
      this.canvas.height = 720;
      return;
    }
    const videoWidth = this.video.videoWidth || 1280;
    const videoHeight = this.video.videoHeight || 720;
    if (this.canvas.width !== videoWidth || this.canvas.height !== videoHeight) {
      this.canvas.width = videoWidth;
      this.canvas.height = videoHeight;
    }
  }

  _generateDemoPose(time) {
    // Generate realistic simulated landmarks with proper framing, T-Pose and locked targets
    const fakeLandmarks = new Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0, visibility: 0.99 }));
    fakeLandmarks[11] = { x: 0.60, y: 0.42, z: 0, visibility: 0.99 }; // Left shoulder
    fakeLandmarks[12] = { x: 0.40, y: 0.42, z: 0, visibility: 0.99 }; // Right shoulder
    fakeLandmarks[23] = { x: 0.56, y: 0.74, z: 0, visibility: 0.99 }; // Left hip
    fakeLandmarks[24] = { x: 0.44, y: 0.74, z: 0, visibility: 0.99 }; // Right hip

    let curLeftWristX = 0.62, curLeftWristY = 0.68;
    let curRightWristX = 0.38, curRightWristY = 0.68;

    if (this.sessionState === 'FRAMING') {
      // Arms resting relaxed near hips
      curLeftWristX = 0.62; curLeftWristY = 0.68;
      curRightWristX = 0.38; curRightWristY = 0.68;
    } else if (this.sessionState === 'TPOSE') {
      // Horizontal T-Pose (mirrored: left wrist is at raw x=0.82, right wrist at raw x=0.18)
      curLeftWristX = 0.82; curLeftWristY = 0.42;
      curRightWristX = 0.18; curRightWristY = 0.42;
    } else {
      // LOCKED or PLAYING: stretch into static targets
      let targetLeftRaw = { x: 0.78, y: 0.24 };
      let targetRightRaw = { x: 0.22, y: 0.24 };

      if (this.fixedTargets) {
        targetLeftRaw = { x: 1 - (this.fixedTargets.left.x / 1280), y: this.fixedTargets.left.y / 720 };
        targetRightRaw = { x: 1 - (this.fixedTargets.right.x / 1280), y: this.fixedTargets.right.y / 720 };
      }

      // 6.5s cycle for stretching
      const cycle = time % 6.5;
      let reach = 0;
      if (cycle < 1.5) reach = cycle / 1.5;
      else if (cycle < 4.8) reach = 1.0;
      else reach = 1.0 - ((cycle - 4.8) / 1.7);
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
    const fakeWorld = new Array(33).fill(null).map(() => ({ x: 0, y: 0, z: 0 }));
    fakeWorld[11] = { x: 0.18, y: -0.25, z: 0 };
    fakeWorld[12] = { x: -0.18, y: -0.25, z: 0 };
    fakeWorld[13] = { x: 0.45, y: -0.25, z: 0 };
    fakeWorld[14] = { x: -0.45, y: -0.25, z: 0 };
    fakeWorld[15] = { x: 0.72, y: -0.25, z: 0 };
    fakeWorld[16] = { x: -0.72, y: -0.25, z: 0 };
    fakeWorld[23] = { x: 0.12, y: 0.25, z: 0 };
    fakeWorld[24] = { x: -0.12, y: 0.25, z: 0 };

    return { landmarks: [fakeLandmarks], worldLandmarks: [fakeWorld] };
  }

  _renderLoop() {
    if (!this.isCameraRunning && !this.isDemoMode) return;

    const now = performance.now();
    const deltaTime = Math.min((now - this.lastFrameTimestamp) / 1000, 0.1); // cap at 100ms
    this.lastFrameTimestamp = now;

    // Compute FPS
    this._updateFPS(deltaTime);

    if (this.isDemoMode) {
      this.demoTime += deltaTime;
      const demoResults = this._generateDemoPose(this.demoTime);
      this._drawAndProcessFrame(demoResults, deltaTime);
    } else if (this.isCameraRunning) {
      // Run inference if a new frame is ready
      if (this.video.currentTime !== this.lastVideoTime) {
        this.lastVideoTime = this.video.currentTime;

        let poseResults = null;
        if (this.poseLandmarker) {
          poseResults = this.poseLandmarker.detectForVideo(this.video, now);
        }

        this._drawAndProcessFrame(poseResults, deltaTime);
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this._renderLoop());
  }

  _updateFPS(deltaTime) {
    if (deltaTime > 0) {
      const instantFps = 1 / deltaTime;
      this.fpsHistory.push(instantFps);
      if (this.fpsHistory.length > 20) this.fpsHistory.shift();
      const avgFps = Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length);
      this.fpsVal.textContent = avgFps;
    }
  }

  _drawAndProcessFrame(poseResults, deltaTime) {
    const width = this.canvas.width;
    const height = this.canvas.height;

    // 1. Draw video background or simulated studio background
    if (this.isDemoMode) {
      // Virtual workout environment background
      const grad = this.ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.7);
      grad.addColorStop(0, '#111827');
      grad.addColorStop(1, '#080c14');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, width, height);

      // Subtle perspective studio grid
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      this.ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 80) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, height);
        this.ctx.stroke();
      }
      for (let y = 0; y < height; y += 80) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(width, y);
        this.ctx.stroke();
      }

      // Virtual Avatar Torso silhouette
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      this.ctx.beginPath();
      this.ctx.ellipse(width * 0.5, height * 0.65, width * 0.09, height * 0.20, 0, 0, Math.PI * 2);
      this.ctx.fill();
      // Head
      this.ctx.beginPath();
      this.ctx.arc(width * 0.5, height * 0.32, width * 0.045, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      this.ctx.save();
      if (this.mirrorCamera) {
        this.ctx.translate(width, 0);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(this.video, 0, 0, width, height);
      } else {
        this.ctx.drawImage(this.video, 0, 0, width, height);
      }
      this.ctx.restore();

      // Dark vignette overlay
      this.ctx.fillStyle = "rgba(10, 14, 23, 0.25)";
      this.ctx.fillRect(0, 0, width, height);
    }

    // 2. Process Pose Landmarks
    const landmarks = poseResults?.landmarks?.[0];
    const worldLandmarks = poseResults?.worldLandmarks?.[0];

    if (!landmarks || landmarks.length < 17) {
      this.bodyFilter.reset();
      this.bodyStatusBadge.textContent = "Corpo não detectado";
      if (this.sessionState === 'PLAYING') {
        this._updateStatus('waiting', 'Aguardando posicionamento');
        this._handleHoldProgress(false, deltaTime);
      }
      return;
    }

    // Filter landmarks using Exponential Moving Average
    const filtered = this.bodyFilter.filterLandmarks(landmarks);
    if (!filtered || !filtered.leftShoulder || !filtered.rightShoulder || !filtered.leftWrist || !filtered.rightWrist) {
      this.bodyStatusBadge.textContent = "Membros parcialmente visíveis";
      if (this.sessionState === 'PLAYING') {
        this._updateStatus('waiting', 'Posicione-se com braços visíveis');
        this._handleHoldProgress(false, deltaTime);
      }
      return;
    }

    this.bodyStatusBadge.textContent = "Pose rastreada";

    // Transform raw normalized coords to canvas screen space
    const toScreen = (pt) => {
      const x = this.mirrorCamera ? (1 - pt.x) * width : pt.x * width;
      const y = pt.y * height;
      return { x, y };
    };

    const sL = toScreen(filtered.leftShoulder);
    const sR = toScreen(filtered.rightShoulder);
    const eL = toScreen(filtered.leftElbow);
    const eR = toScreen(filtered.rightElbow);
    const wL = toScreen(filtered.leftWrist);
    const wR = toScreen(filtered.rightWrist);

    // Dynamic Body Calibration (Shoulder width & Torso center)
    const shoulderWidth = Math.hypot(sR.x - sL.x, sR.y - sL.y);
    const torsoCenter = {
      x: (sL.x + sR.x) / 2,
      y: (sL.y + sR.y) / 2
    };

    // Minimum apparent shoulder width check
    if (shoulderWidth < width * 0.08) {
      this.bodyStatusBadge.textContent = "Aproxime-se da câmera";
      this._updateStatus('waiting', 'Fique mais próximo da câmera');
      if (this.sessionState === 'PLAYING') {
        this._handleHoldProgress(false, deltaTime);
      }
      return;
    }

    // 3. CALIBRATION STATE MACHINE
    // Phase 1: FRAMING (Verificação de Enquadramento: ombros 11, 12 e quadris 23, 24 > 0.85)
    if (this.sessionState === 'FRAMING') {
      this._handleFramingState(filtered, landmarks, width, height, deltaTime);
      if (this.showSkeleton) {
        this._drawSkeleton({ sL, sR, eL, eR, wL, wR });
      }
      return;
    }

    // Phase 2: T-POSE (Amostragem em Postura Neutra / T-Pose por 2s)
    if (this.sessionState === 'TPOSE') {
      this._handleTPoseState({ sL, sR, eL, eR, wL, wR, shoulderWidth, torsoCenter }, landmarks, worldLandmarks, width, height, deltaTime);
      if (this.showSkeleton) {
        this._drawSkeleton({ sL, sR, eL, eR, wL, wR });
      }
      return;
    }

    // Phase 3: LOCKED (Transição com alvos travados e celebração)
    if (this.sessionState === 'LOCKED') {
      if (this.showSkeleton) {
        this._drawSkeleton({ sL, sR, eL, eR, wL, wR });
      }
      if (this.fixedTargets) {
        this._drawTarget(this.fixedTargets.left, this.fixedTargets.radius, false, 0, 'ESQUERDO (TRAVADO)', '#00f5d4');
        this._drawTarget(this.fixedTargets.right, this.fixedTargets.radius, false, 0, 'DIREITO (TRAVADO)', '#7b2cbf');
      }
      return;
    }

    // Phase 4: PLAYING (Alvos ESTÁTICOS fixados com base no comprimento real dos braços aferido)
    if (!this.fixedTargets) {
      this._createInitialTargets({ sL, sR, shoulderWidth });
    }

    const targetLeft = this.fixedTargets.left;
    const targetRight = this.fixedTargets.right;
    const targetRadius = this.fixedTargets.radius;

    // Euclidean distance against STATIC fixed targets!
    const distLeft = Math.hypot(wL.x - targetLeft.x, wL.y - targetLeft.y);
    const distRight = Math.hypot(wR.x - targetRight.x, wR.y - targetRight.y);

    const isLeftInTarget = distLeft <= targetRadius;
    const isRightInTarget = distRight <= targetRadius;
    const isBothInTarget = isLeftInTarget && isRightInTarget;

    // Update Hold Progress & Gamification
    this._handleHoldProgress(isBothInTarget, deltaTime);

    // Render skeleton & targets
    if (this.showSkeleton) {
      this._drawSkeleton({ sL, sR, eL, eR, wL, wR });
    }

    // Draw Targets
    const holdRatio = Math.min(1.0, this.holdDuration / this.requiredHoldTime);
    this._drawTarget(targetLeft, targetRadius, isLeftInTarget, holdRatio, 'ESQUERDO (FIXO)', '#00f5d4');
    this._drawTarget(targetRight, targetRadius, isRightInTarget, holdRatio, 'DIREITO (FIXO)', '#7b2cbf');

    // Draw Wrists
    this._drawWrist(wL, isLeftInTarget, '#00f5d4');
    this._drawWrist(wR, isRightInTarget, '#7b2cbf');

    // Draw Dynamic Alignment Guides (dashed lines from wrists to targets when stretching)
    if (!isBothInTarget) {
      this._drawGuideLine(wL, targetLeft, isLeftInTarget);
      this._drawGuideLine(wR, targetRight, isRightInTarget);
    }
  }

  _handleFramingState(filtered, rawLandmarks, width, height, deltaTime) {
    // Both shoulders (11, 12) and both hips (23, 24) must have visibility > 0.85
    const vis11 = rawLandmarks[11]?.visibility ?? 0;
    const vis12 = rawLandmarks[12]?.visibility ?? 0;
    const vis23 = rawLandmarks[23]?.visibility ?? 0;
    const vis24 = rawLandmarks[24]?.visibility ?? 0;

    const areShouldersVisible = vis11 > 0.85 && vis12 > 0.85;
    const areHipsVisible = vis23 > 0.85 && vis24 > 0.85;

    // Check that points are not cut off near borders (margin 5%)
    const keyPoints = [rawLandmarks[11], rawLandmarks[12], rawLandmarks[23], rawLandmarks[24]].filter(Boolean);
    const isWithinBorders = keyPoints.length === 4 && keyPoints.every(p => p.x > 0.05 && p.x < 0.95 && p.y > 0.05 && p.y < 0.95);

    const isFramed = areShouldersVisible && areHipsVisible && isWithinBorders;

    this._drawFramingGuide(isFramed, width, height);

    if (!isFramed) {
      this.framingStableDuration = 0;
      this.calibProgressFill.style.width = '0%';
      this.calibStepBadge.className = 'calib-step-badge warning';
      this.calibStepBadge.textContent = 'Passo 1: Verificação de Enquadramento';

      if (!areHipsVisible) {
        this.calibTitle.textContent = 'Dê passos para trás';
        this.calibDesc.textContent = 'Quadris não detectados. Afaste-se até que os ombros e os quadris fiquem visíveis no quadro.';
        this._updateStatus('framing', 'Passo 1: Afaste-se para enquadrar ombros e quadris');
      } else if (!isWithinBorders) {
        this.calibTitle.textContent = 'Centralize seu corpo';
        this.calibDesc.textContent = 'Você está muito perto das bordas. Dê um passo para o centro da câmera.';
        this._updateStatus('framing', 'Passo 1: Centralize-se na câmera');
      } else {
        this.calibTitle.textContent = 'Enquadre ombros e quadris';
        this.calibDesc.textContent = 'Posicione-se de frente com boa iluminação para identificação da pose.';
        this._updateStatus('framing', 'Passo 1: Posicione-se no enquadramento');
      }
    } else {
      this.framingStableDuration += deltaTime;
      const progress = Math.min(1.0, this.framingStableDuration / 0.6);
      this.calibProgressFill.style.width = `${progress * 100}%`;
      this.calibStepBadge.className = 'calib-step-badge success';
      this.calibTitle.textContent = 'Enquadramento Confirmado!';
      this.calibDesc.textContent = 'Excelente enquadramento! Fique estável... Preparando para T-Pose.';
      this._updateStatus('framing', 'Enquadramento OK! Fique parado...');

      if (this.framingStableDuration >= 0.6) {
        // Transition to T-Pose
        this.sessionState = 'TPOSE';
        this.tposeHoldDuration = 0;
        this.calibrationSamples = [];
        this.lastTPoseTickProgress = 0;

        this.calibStepBadge.className = 'calib-step-badge';
        this.calibStepBadge.textContent = 'Passo 2: Amostragem T-Pose (2s)';
        this.calibTitle.textContent = 'Abra os braços em T';
        this.calibDesc.textContent = 'Estique ambos os braços na horizontal na altura dos ombros por 2 segundos.';
        this.calibProgressFill.style.width = '0%';
        this.calibStatusBadge.textContent = 'Calibrando (Passo 2/2)';
        this.calibStatusBadge.style.color = '#38bdf8';
        this._updateStatus('calibrating', 'Passo 2: Abra os braços na horizontal (T-Pose)');
        soundEffects.playTargetAcquired();
      }
    }
  }

  _handleTPoseState({ sL, sR, eL, eR, wL, wR, shoulderWidth, torsoCenter }, rawLandmarks, worldLandmarks, width, height, deltaTime) {
    // Condition: arms extended laterally near shoulder height
    const leftArmOut = (sL.x - wL.x) > shoulderWidth * 0.55;
    const rightArmOut = (wR.x - sR.x) > shoulderWidth * 0.55;
    const leftArmLevel = Math.abs(wL.y - sL.y) < shoulderWidth * 0.45;
    const rightArmLevel = Math.abs(wR.y - sR.y) < shoulderWidth * 0.45;

    // Full arm length = ||shoulder - elbow|| + ||elbow - wrist||
    const leftArmFull = Math.hypot(eL.x - sL.x, eL.y - sL.y) + Math.hypot(wL.x - eL.x, wL.y - eL.y);
    const rightArmFull = Math.hypot(eR.x - sR.x, eR.y - sR.y) + Math.hypot(wR.x - eR.x, wR.y - eR.y);
    const leftStraight = Math.hypot(wL.x - sL.x, wL.y - sL.y) > leftArmFull * 0.72;
    const rightStraight = Math.hypot(wR.x - sR.x, wR.y - sR.y) > rightArmFull * 0.72;

    const isTPose = leftArmOut && rightArmOut && leftArmLevel && rightArmLevel && leftStraight && rightStraight;

    this._drawTPoseGuides(sL, sR, shoulderWidth, isTPose, width, height);

    if (isTPose) {
      this.tposeHoldDuration += deltaTime;
      const progress = Math.min(1.0, this.tposeHoldDuration / 2.0);
      this.calibProgressFill.style.width = `${progress * 100}%`;
      const remainingSec = Math.max(0, 2.0 - this.tposeHoldDuration).toFixed(1);
      this.calibTitle.textContent = `Sustente a T-Pose: ${remainingSec}s`;
      this.calibDesc.textContent = 'Medindo comprimento anatômico dos braços e envergadura...';
      this._updateStatus('calibrating', `Sustente a T-Pose: ${remainingSec}s`);

      // Play tick sound every 0.4s
      const currentTick = Math.floor(this.tposeHoldDuration / 0.4);
      if (currentTick > this.lastTPoseTickProgress) {
        this.lastTPoseTickProgress = currentTick;
        soundEffects.playCalibTick(progress);
      }

      // Collect sample with real world metrics if available
      let wArmL = 0.68, wArmR = 0.68, wWingspan = 1.70;
      if (worldLandmarks && worldLandmarks[11] && worldLandmarks[13] && worldLandmarks[15]) {
        const wl = worldLandmarks;
        wArmL = Math.hypot(wl[13].x - wl[11].x, wl[13].y - wl[11].y, wl[13].z - wl[11].z) +
                Math.hypot(wl[15].x - wl[13].x, wl[15].y - wl[13].y, wl[15].z - wl[13].z);
        wArmR = Math.hypot(wl[14].x - wl[12].x, wl[14].y - wl[12].y, wl[14].z - wl[12].z) +
                Math.hypot(wl[16].x - wl[14].x, wl[16].y - wl[14].y, wl[16].z - wl[14].z);
        const sDist = Math.hypot(wl[12].x - wl[11].x, wl[12].y - wl[11].y, wl[12].z - wl[11].z);
        wWingspan = wArmL + wArmR + sDist;
      }

      this.calibrationSamples.push({
        armLenL: leftArmFull,
        armLenR: rightArmFull,
        shoulderL: { ...sL },
        shoulderR: { ...sR },
        shoulderWidth,
        torsoCenter: { ...torsoCenter },
        wArmL,
        wArmR,
        wWingspan
      });

      if (this.tposeHoldDuration >= 2.0) {
        this._finalizeCalibration();
      }
    } else {
      this.calibTitle.textContent = 'Abra os braços em T';
      this.calibDesc.textContent = 'Estique os braços horizontalmente na altura dos ombros.';
      this._updateStatus('calibrating', 'Abra os braços na horizontal (T-Pose)');
      if (this.tposeHoldDuration > 0) {
        this.tposeHoldDuration = Math.max(0, this.tposeHoldDuration - deltaTime * 0.8);
        this.calibProgressFill.style.width = `${(this.tposeHoldDuration / 2.0) * 100}%`;
      }
    }
  }

  _finalizeCalibration() {
    if (this.calibrationSamples.length === 0) return;

    const count = this.calibrationSamples.length;
    let sumArmL = 0, sumArmR = 0, sumShW = 0;
    let sumShLx = 0, sumShLy = 0, sumShRx = 0, sumShRy = 0;
    let sumWArmL = 0, sumWArmR = 0, sumWingspan = 0;

    for (const s of this.calibrationSamples) {
      sumArmL += s.armLenL;
      sumArmR += s.armLenR;
      sumShW += s.shoulderWidth;
      sumShLx += s.shoulderL.x;
      sumShLy += s.shoulderL.y;
      sumShRx += s.shoulderR.x;
      sumShRy += s.shoulderR.y;
      sumWArmL += s.wArmL;
      sumWArmR += s.wArmR;
      sumWingspan += s.wWingspan;
    }

    this.calibratedData = {
      armLenL: sumArmL / count,
      armLenR: sumArmR / count,
      shoulderWidth: sumShW / count,
      shoulderL: { x: sumShLx / count, y: sumShLy / count },
      shoulderR: { x: sumShRx / count, y: sumShRy / count },
      torsoCenter: { x: (sumShLx + sumShRx) / (2 * count), y: (sumShLy + sumShRy) / (2 * count) },
      worldArmL: sumWArmL / count,
      worldArmR: sumWArmR / count,
      worldWingspan: sumWingspan / count
    };

    // Calculate fixed targets
    this._updateFixedTargetsForCurrentPose();

    // UI Updates
    this.sessionState = 'LOCKED';
    soundEffects.playCalibSuccess();

    this.calibStepBadge.className = 'calib-step-badge success';
    this.calibStepBadge.textContent = 'Calibração Concluída!';
    this.calibTitle.textContent = 'Alvos Travados com Sucesso! 🎯';
    this.calibDesc.textContent = 'Posição fixa calculada a partir da sua envergadura anatômica real.';

    this.calibMetricsTags.style.display = 'flex';
    this.metricArmLeft.textContent = `${Math.round(this.calibratedData.worldArmL * 100)} cm`;
    this.metricArmRight.textContent = `${Math.round(this.calibratedData.worldArmR * 100)} cm`;
    this.metricWingspan.textContent = `${this.calibratedData.worldWingspan.toFixed(2)} m`;

    this.calibStatusBadge.textContent = 'Alvos Travados (Estáticos)';
    this.calibStatusBadge.style.color = '#70e000';
    this._updateStatus('locked', 'Alvos fixos travados! Iniciando alongamento...');

    setTimeout(() => {
      if (this.sessionState === 'LOCKED') {
        this.sessionState = 'PLAYING';
        this.calibModal.classList.add('hidden');
        this._updateStatus('stretching', 'Alongue até alcançar ambos os alvos!');
        this.showToast('Alvos travados estaticamente. Bom alongamento!');
      }
    }, 1400);
  }

  _updateFixedTargetsForCurrentPose() {
    if (!this.calibratedData) return;

    const { shoulderL, shoulderR, armLenL, armLenR, shoulderWidth } = this.calibratedData;
    const diff = this.difficultyFactor;

    // Distância do Alvo = Comprimento do Braço * Fator de Dificuldade
    const distTargetL = armLenL * diff;
    const distTargetR = armLenR * diff;

    const dirL = this.currentPose.dirLeft || { x: -0.76, y: -0.65 };
    const dirR = this.currentPose.dirRight || { x: 0.76, y: -0.65 };

    const targetLeft = {
      x: shoulderL.x + dirL.x * distTargetL,
      y: shoulderL.y + dirL.y * distTargetL
    };

    const targetRight = {
      x: shoulderR.x + dirR.x * distTargetR,
      y: shoulderR.y + dirR.y * distTargetR
    };

    const targetRadius = Math.max(28, shoulderWidth * this.targetSizeRatio);
    const margin = targetRadius + 18;

    // Clamp within visible canvas
    targetLeft.x = Math.max(margin, Math.min(this.canvas.width - margin, targetLeft.x));
    targetLeft.y = Math.max(margin, Math.min(this.canvas.height - margin, targetLeft.y));
    targetRight.x = Math.max(margin, Math.min(this.canvas.width - margin, targetRight.x));
    targetRight.y = Math.max(margin, Math.min(this.canvas.height - margin, targetRight.y));

    this.fixedTargets = {
      left: targetLeft,
      right: targetRight,
      radius: targetRadius
    };
  }

  _createInitialTargets({ sL, sR, shoulderWidth }) {
    const defaultArm = shoulderWidth * 1.35;
    const distL = defaultArm * this.difficultyFactor;
    const distR = defaultArm * this.difficultyFactor;
    const dirL = this.currentPose.dirLeft || { x: -0.76, y: -0.65 };
    const dirR = this.currentPose.dirRight || { x: 0.76, y: -0.65 };
    const targetRadius = Math.max(28, shoulderWidth * this.targetSizeRatio);
    const margin = targetRadius + 18;

    const tL = {
      x: Math.max(margin, Math.min(this.canvas.width - margin, sL.x + dirL.x * distL)),
      y: Math.max(margin, Math.min(this.canvas.height - margin, sL.y + dirL.y * distL))
    };
    const tR = {
      x: Math.max(margin, Math.min(this.canvas.width - margin, sR.x + dirR.x * distR)),
      y: Math.max(margin, Math.min(this.canvas.height - margin, sR.y + dirR.y * distR))
    };

    this.fixedTargets = {
      left: tL,
      right: tR,
      radius: targetRadius
    };
  }

  _drawFramingGuide(isFramed, width, height) {
    const ctx = this.ctx;
    ctx.save();
    const marginX = width * 0.12;
    const marginY = height * 0.08;
    const boxW = width - 2 * marginX;
    const boxH = height - 2 * marginY;
    const color = isFramed ? '#70e000' : '#f59e0b';

    // Dashed bounding rectangle
    ctx.strokeStyle = color;
    ctx.lineWidth = isFramed ? 3 : 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = isFramed ? 14 : 8;
    ctx.setLineDash([12, 10]);
    ctx.strokeRect(marginX, marginY, boxW, boxH);
    ctx.setLineDash([]);

    // Corner crosshairs
    const cornerSize = 28;
    ctx.lineWidth = 4;
    [
      [marginX, marginY, 1, 1],
      [marginX + boxW, marginY, -1, 1],
      [marginX, marginY + boxH, 1, -1],
      [marginX + boxW, marginY + boxH, -1, -1]
    ].forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y + dy * cornerSize);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * cornerSize, y);
      ctx.stroke();
    });

    // Guide Header
    ctx.font = '700 13px Inter, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText('ÁREA DE ENQUADRAMENTO (OMBROS E QUADRIS)', width / 2, marginY + 28);

    ctx.restore();
  }

  _drawTPoseGuides(sL, sR, shoulderWidth, isTPose, width, height) {
    const ctx = this.ctx;
    ctx.save();
    const shoulderY = (sL.y + sR.y) / 2;
    const color = isTPose ? '#70e000' : '#38bdf8';

    // Horizontal dashed alignment line through shoulders
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(width * 0.06, shoulderY);
    ctx.lineTo(width * 0.94, shoulderY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Left and right level indicator arrows
    [
      [width * 0.12, shoulderY, 'ESQUERDA'],
      [width * 0.88, shoulderY, 'DIREITA']
    ].forEach(([x, y, label]) => {
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fillStyle = isTPose ? 'rgba(112, 224, 0, 0.25)' : 'rgba(56, 189, 248, 0.2)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y + 28);
    });

    ctx.restore();
  }

  _handleHoldProgress(isBothInTarget, deltaTime) {
    if (isBothInTarget) {
      // If just entered target, play sound
      if (!this.isBothWristsInTarget) {
        soundEffects.playTargetAcquired();
      }
      this.isBothWristsInTarget = true;
      this.holdDuration += deltaTime;

      // Tick sound every 0.75 second
      const currentTick = Math.floor(this.holdDuration / 0.75);
      if (currentTick > this.lastHoldSecondTicked) {
        this.lastHoldSecondTicked = currentTick;
        soundEffects.playTick();
      }

      this._updateStatus('holding', `Sustente! ${(this.requiredHoldTime - this.holdDuration).toFixed(1)}s restantes`);

      // Goal Reached!
      if (this.holdDuration >= this.requiredHoldTime) {
        this._completeRepetition();
      }
    } else {
      this.isBothWristsInTarget = false;
      this.lastHoldSecondTicked = 0;

      // Gentle decay if user slips slightly
      if (this.holdDuration > 0) {
        this.holdDuration = Math.max(0, this.holdDuration - deltaTime * 1.8);
      }

      this._updateStatus('stretching', 'Alongue até alcançar ambos os alvos!');
    }

    this._updateHoldMeterUI(this.holdDuration / this.requiredHoldTime);
  }

  _completeRepetition() {
    this.score += 100;
    this.reps += 1;
    this.scoreVal.textContent = this.score;
    this.repsVal.textContent = this.reps;

    // Reset hold
    this.holdDuration = 0;
    this.lastHoldSecondTicked = 0;

    // Sound and UI feedback
    soundEffects.playCelebration();
    this._triggerFeedbackSplash();
    this._updateStatus('completed', 'Excelente! +100 pontos');

    // Auto switch pose if in dynamic mode
    if (this.currentPose.isAuto) {
      setTimeout(() => {
        this._advanceAutoPose();
      }, 700);
    }
  }

  _triggerFeedbackSplash() {
    if (this.splashTimeout) clearTimeout(this.splashTimeout);
    this.feedbackSplash.classList.add('show');
    this.splashTimeout = setTimeout(() => {
      this.feedbackSplash.classList.remove('show');
    }, 1200);
  }

  _updateStatus(stateClass, message) {
    this.statusPill.className = `status-pill ${stateClass}`;
    this.statusText.textContent = message;
  }

  _updateHoldMeterUI(ratio) {
    const clamped = Math.max(0, Math.min(1.0, ratio));
    if (clamped > 0.02 || this.isBothWristsInTarget) {
      this.holdMeterBox.classList.add('active');
    } else {
      this.holdMeterBox.classList.remove('active');
    }

    const currentSec = (clamped * this.requiredHoldTime).toFixed(1);
    this.holdTimer.textContent = `${currentSec}s / ${this.requiredHoldTime.toFixed(1)}s`;
    this.holdFill.style.width = `${clamped * 100}%`;
  }

  _drawSkeleton({ sL, sR, eL, eR, wL, wR }) {
    const ctx = this.ctx;
    ctx.save();
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';

    // Shoulders
    ctx.beginPath();
    ctx.moveTo(sL.x, sL.y);
    ctx.lineTo(sR.x, sR.y);
    ctx.stroke();

    // Left Arm (Shoulder -> Elbow -> Wrist)
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.6)';
    ctx.beginPath();
    ctx.moveTo(sL.x, sL.y);
    ctx.lineTo(eL.x, eL.y);
    ctx.lineTo(wL.x, wL.y);
    ctx.stroke();

    // Right Arm (Shoulder -> Elbow -> Wrist)
    ctx.strokeStyle = 'rgba(123, 44, 191, 0.7)';
    ctx.beginPath();
    ctx.moveTo(sR.x, sR.y);
    ctx.lineTo(eR.x, eR.y);
    ctx.lineTo(wR.x, wR.y);
    ctx.stroke();

    // Small joint dots
    [sL, sR, eL, eR].forEach(pt => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  _drawTarget(target, radius, isInside, holdRatio, label, accentColor) {
    const ctx = this.ctx;
    ctx.save();

    // Outer glow pulse
    const pulseSize = isInside ? Math.sin(performance.now() * 0.01) * 4 : 0;
    const currentRadius = radius + pulseSize;

    // Glowing background circle
    ctx.beginPath();
    ctx.arc(target.x, target.y, currentRadius, 0, Math.PI * 2);
    if (isInside) {
      ctx.fillStyle = 'rgba(112, 224, 0, 0.25)';
      ctx.strokeStyle = '#70e000';
      ctx.shadowColor = '#70e000';
      ctx.shadowBlur = 24;
      ctx.lineWidth = 4;
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.strokeStyle = accentColor;
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 14;
      ctx.lineWidth = 3;
    }
    ctx.fill();
    ctx.stroke();

    // Progress arc when holding inside
    if (holdRatio > 0) {
      ctx.beginPath();
      ctx.arc(
        target.x, 
        target.y, 
        currentRadius + 6, 
        -Math.PI / 2, 
        -Math.PI / 2 + (Math.PI * 2 * holdRatio)
      );
      ctx.strokeStyle = '#70e000';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#70e000';
      ctx.shadowBlur = 18;
      ctx.stroke();
    }

    // Inner bullseye / crosshair
    ctx.beginPath();
    ctx.arc(target.x, target.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = isInside ? '#70e000' : '#ffffff';
    ctx.shadowBlur = 0;
    ctx.fill();

    // Label
    ctx.font = '600 12px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.textAlign = 'center';
    ctx.fillText(label, target.x, target.y + currentRadius + 18);

    ctx.restore();
  }

  _drawWrist(wrist, isInside, defaultColor) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(wrist.x, wrist.y, isInside ? 14 : 10, 0, Math.PI * 2);
    ctx.fillStyle = isInside ? '#70e000' : defaultColor;
    ctx.shadowColor = isInside ? '#70e000' : defaultColor;
    ctx.shadowBlur = 18;
    ctx.fill();

    // White core
    ctx.beginPath();
    ctx.arc(wrist.x, wrist.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.fill();
    ctx.restore();
  }

  _drawGuideLine(wrist, target, isInside) {
    if (isInside) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wrist.x, wrist.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.restore();
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.stretchingApp = new StretchingGuideApp();
});
